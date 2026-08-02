import { createClient } from "@/lib/supabase/server";
import { GLOBAL_SUPPORTED_CURRENCIES } from "@/lib/wallet/currency/constants";
import { convertFromUSD, Currency } from "@/lib/wallet/currency/convert";
import { resolveMoMoRecipient } from "@/lib/wallet/withdraw/momo.resolve";
import { createRecipient } from "@/lib/wallet/withdraw/paystack.recipient";

type WithdrawInput = {
    user_id: string;
    amount: number; // Major unit (e.g. 10.50 USD)
    bank_code?: string;
    account_number: string;
    account_name?: string;
    currency: string;
    recipient_type: "nuban" | "mobile_money";
    provider?: string;
};

/**
 * Resolves the exact local transaction fee Paystack charges your merchant account
 */
function getExactPaystackFee(
    payoutAmountLocal: number,
    currencyCode: string,
): number {
    const code = currencyCode.toUpperCase();

    switch (code) {
        case "NGN":
            if (payoutAmountLocal <= 5000) return 10;
            if (payoutAmountLocal <= 50000) return 25;
            return 50;
        case "GHS":
            return 10;
        case "KES":
            return 50;
        case "XOF":
        case "XAF":
            return 100;
        default:
            // Fallback charge for other supported currencies to prevent free/spam micro-withdrawals
            return 50;
    }
}

export async function processWithdraw(input: WithdrawInput) {
    const supabase = await createClient();

    // Verify currency support
    const isSupported = GLOBAL_SUPPORTED_CURRENCIES.some(
        (c) => c.code.toUpperCase() === input.currency.toUpperCase(),
    );
    if (!isSupported) {
        throw new Error(
            `Currency ${input.currency} is not supported for settlements.`,
        );
    }

    // =========================================================================
    // 💡 LIVE CURRENCY CONVERSION (REPLACED NON-EXISTENT currency_rates TABLE)
    // Uses your centralized convertFromUSD service which automatically utilizes
    // real-time rate fetching + automatic caching in `fx_rates`
    // =========================================================================

    const usdAmountMajor = Number(input.amount);

    const converted = await convertFromUSD(
        usdAmountMajor,
        input.currency.toUpperCase() as Currency,
    );

    const localPayoutAmount = converted.amount;
    const exchangeRate = converted.rate;

    // Calculate dynamic Paystack fee in target local currency
    const localPaystackFee = getExactPaystackFee(
        localPayoutAmount,
        input.currency,
    );

    // 🎯 Hardening 1: Float Precision Normalization
    // Passing long decimal fractions like 0.00833333 to DB can cause numeric errors
    const feeInUsd = Number(
        (exchangeRate > 0 ? localPaystackFee / exchangeRate : 0).toFixed(4),
    );
    const totalDeductionUsd = Number((usdAmountMajor + feeInUsd).toFixed(2));

    // ================================
    // 1. FRAUD + RISK CHECK (MO MO)
    // ================================
    if (input.recipient_type === "mobile_money") {
        const resolved = await resolveMoMoRecipient(input.account_number);

        if (resolved.risk_level === "blocked") {
            throw new Error("Withdrawal blocked due to risk detection");
        }

        input.provider = resolved.network;
        input.account_name = resolved.account_name ?? "UNVERIFIED";
    }

    // ================================
    // 2. ATOMIC WALLET DEDUCTION
    // ================================
    // This RPC checks balance, locks row, and deducts (amount + fee)
    const { data: txResult, error: txError } = await supabase.rpc(
        "process_withdrawal",
        {
            p_user_id: input.user_id,
            p_amount: usdAmountMajor,
            p_fee_usd: feeInUsd,
            p_meta: {
                account_name: input.account_name,
                account_number: input.account_number,
                bank_code: input.bank_code,
                currency: input.currency,
                recipient_type: input.recipient_type,
                provider: input.provider,
                charged_fee_local: localPaystackFee,
                charged_fee_usd: feeInUsd,
                total_usd_deducted: totalDeductionUsd,
                exchange_rate_used: exchangeRate,
            },
        },
    );

    if (txError) {
        throw new Error(`Wallet deduction failure: ${txError.message}`);
    }

    const wallet_id = txResult.wallet_id;
    const transaction_id = txResult.transaction_id;

    // 🎯 Hardening 2: Try-And-Rollback Architecture Boundary
    try {
        // ================================
        // 3. CREATE PAYSTACK RECIPIENT
        // ================================
        const recipientCode = await createRecipient({
            account_name: input.account_name ?? "TRANSFER RECIPIENT",
            account_number: input.account_number.trim(),
            bank_code: input.bank_code ?? "",
            currency: input.currency.toUpperCase(),
            recipient_type: input.recipient_type,
        });

        // ================================
        // 4. INITIATE PAYSTACK TRANSFER
        // ================================
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) throw new Error("Missing Paystack configuration.");

        // Paystack requires minor units (kobo/pesewas) rounded to nearest whole number
        const localAmountMinor = Math.round(localPayoutAmount * 100);

        const res = await fetch("https://api.paystack.co/transfer", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${secret}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                source: "balance",
                amount: localAmountMinor,
                recipient: recipientCode,
                reason: `Withdrawalpb-${transaction_id}`, // Audit trace
                reference: `pb-tx-${transaction_id}`, // Idempotency key
            }),
        });

        const data = await res.json();

        if (!res.ok || !data.status) {
            throw new Error(
                data.message || "Paystack Transfer initialization rejected.",
            );
        }

        // ===================================
        // 5. STATUS HANDLING (UI FEEDBACK)
        // ===================================
        const status =
            data.data.status === "otp" ? "processing_otp" : "processing";

        await supabase
            .from("wallet_transactions")
            .update({
                status: status,
                meta: {
                    paystack_initialize: data,
                },
            })
            .eq("id", transaction_id);

        return {
            success: true,
            status,
            wallet_id,
            transaction_id,
        };
    } catch (error) {
        // 🎯 Hardening 3: Critical Atomic Rollback Loop
        console.error(
            "Critical fault detected in Paystack Settlement Pipeline. Triggering atomic balance rollback.",
            error,
        );

        const failureReason =
            error instanceof Error ? error.message : "Internal API Fault";

        // Execute deployed RPC to restore user funds immediately
        const { error: refundError } = await supabase.rpc(
            "refund_failed_withdrawal",
            {
                p_wallet_id: wallet_id,
                p_usd_amount: usdAmountMajor,
                p_fee_usd: feeInUsd,
                p_transaction_id: transaction_id,
                p_reason: failureReason,
            },
        );

        if (refundError) {
            console.error(
                "CATACLYSMIC ROLLBACK FAILURE: Funds deducted but not automatically re-credited for transaction:",
                transaction_id,
                refundError,
            );
        }

        throw new Error(
            `Settlement processing failure: ${failureReason}. Funds re-credited.`,
        );
    }
}