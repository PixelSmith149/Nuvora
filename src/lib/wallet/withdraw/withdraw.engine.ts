// src/lib/wallet/withdraw/withdraw.engine.ts
import { createClient } from "@/lib/supabase/server";
import { GLOBAL_SUPPORTED_CURRENCIES } from "@/lib/wallet/currency/constants";
import { resolveMoMoRecipient } from "@/lib/wallet/withdraw/momo.resolve";
import { createRecipient } from "@/lib/wallet/withdraw/paystack.recipient";

type WithdrawInput = {
	user_id: string;
	amount: number; // Core wallet deduction amount (USD)
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

	// Validate that the requested currency exists in your master GLOBAL_SUPPORTED_CURRENCIES
	const isSupported = GLOBAL_SUPPORTED_CURRENCIES.some(
		(c) => c.code.toUpperCase() === input.currency.toUpperCase(),
	);
	if (!isSupported) {
		throw new Error(
			`Currency ${input.currency} is not supported for settlements.`,
		);
	}

	// Fetch the active conversion rate from your database table (e.g., 'currency_rates')
	// If your rates are stored differently, adjust this single query to match your schema.
	const { data: rateData } = await supabase
		.from("currency_rates")
		.select("rate_to_usd")
		.eq("code", input.currency.toUpperCase())
		.single();

	// Fallback rate if table entry isn't found yet (dynamic safety)
	const exchangeRate = rateData?.rate_to_usd || 1.0;

	// Calculate local payout volume and matching dynamic Paystack fee
	const localPayoutAmount = input.amount * exchangeRate;
	const localPaystackFee = getExactPaystackFee(
		localPayoutAmount,
		input.currency,
	);
	const feeInUsd = localPaystackFee / exchangeRate;

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
	// 2. ATOMIC WALLET TRANSACTION
	// ================================
	// Modified to pass p_fee_usd so your database function deducts (amount + fee) from the user
	const { data: txResult, error: txError } = await supabase.rpc(
		"process_withdrawal",
		{
			p_user_id: input.user_id,
			p_amount: input.amount,
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
			},
		},
	);

	if (txError) {
		throw new Error(txError.message);
	}

	const wallet_id = txResult.wallet_id;

	// ================================
	// 3. CREATE PAYSTACK RECIPIENT
	// ================================
	const recipientCode = await createRecipient({
		account_name: input.account_name ?? "",
		account_number: input.account_number,
		bank_code: input.bank_code ?? "",
		currency: input.currency,
		recipient_type: input.recipient_type,
	});

	// ================================
	// 4. INITIATE PAYSTACK TRANSFER
	// ================================
	const res = await fetch("https://api.paystack.co/transfer", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			source: "balance",
			// Paystack multi-currency transfers require the exact local minor unit (cents/kobo/pesewas)
			amount: Math.round(localPayoutAmount * 100),
			recipient: recipientCode,
			reason: "User withdrawal",
		}),
	});

	const data = await res.json();

	if (!data.status) {
		throw new Error(data.message || "Transfer failed");
	}

	// ================================
	// 5. FINALIZE TRANSACTION
	// ================================
	await supabase
		.from("wallet_transactions")
		.update({
			status: "success",
			meta: {
				paystack: data,
			},
		})
		.eq("wallet_id", wallet_id)
		.eq("type", "withdraw")
		.eq("status", "pending");

	return {
		success: true,
		wallet_id,
	};
}
