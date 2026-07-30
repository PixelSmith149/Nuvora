import crypto from "crypto";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { ingestDeposit } from "@/lib/wallet/deposit/ingestDeposit";

function safeCompareSignatures(hash: string, signature: string | null): boolean {
    if (!signature) return false;

    const hashBuffer = Buffer.from(hash, "utf8");
    const sigBuffer = Buffer.from(signature, "utf8");

    if (hashBuffer.length !== sigBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(hashBuffer, sigBuffer);
}

export async function POST(req: Request) {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
        return NextResponse.json(
            { error: "Missing Paystack secret configuration" },
            { status: 500 }
        );
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // 1. Signature Verification
    const hash = crypto
        .createHmac("sha512", secret)
        .update(rawBody)
        .digest("hex");

    if (!safeCompareSignatures(hash, signature)) {
        return NextResponse.json(
            { error: "Invalid payload signature" },
            { status: 401 }
        );
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event.event;
    const eventData = event.data;

    const supabase = createAdminClient();

    // ==========================================
    // EVENT TYPE 1: DEPOSIT SUCCESS (charge.success)
    // ==========================================
    if (eventType === "charge.success") {
        const reference: string = eventData.reference;

        const { data: transaction, error } = await supabase
            .from("wallet_transactions")
            .select("id, wallet_id, status, meta")
            .eq("reference", reference)
            .maybeSingle();

        if (error || !transaction) {
            console.error("Paystack Webhook: Transaction lookup error or missing ref:", error || reference);
            // Return HTTP 200 so Paystack does not retry perpetually
            return NextResponse.json({ status: "ignored_missing_transaction" });
        }

        if (transaction.status === "success") {
            return NextResponse.json({ status: "already_processed" });
        }

        const sourceCurrency = (eventData.currency || "USD").toUpperCase();
        const ZERO_DECIMAL_CURRENCIES = ["XOF", "XAF", "GNF", "RWF", "UGX"];

        // Handle minor unit conversion dynamically based on currency
        const sourceAmountMajor = ZERO_DECIMAL_CURRENCIES.includes(sourceCurrency)
            ? eventData.amount
            : eventData.amount / 100;

        await ingestDeposit({
            wallet_id: transaction.wallet_id,
            amount: sourceAmountMajor,
            currency: sourceCurrency,
            reference,
            provider: "paystack",
        });

        return NextResponse.json({ status: "deposit_ingested" });
    }

    // ==========================================
    // EVENT TYPE 2: TRANSFER FAILED / REVERSED
    // ==========================================
    if (eventType === "transfer.failed" || eventType === "transfer.reversed") {
        const reference: string = eventData.reference;
        const reason: string = eventData.reason || "Paystack transfer processing failed";

        const possibleUuid = reference.startsWith("pb-tx-") 
            ? reference.replace("pb-tx-", "") 
            : reference;

        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(possibleUuid);

        let query = supabase.from("wallet_transactions").select("id, wallet_id, amount, status, meta");

        if (isValidUuid) {
            query = query.or(`reference.eq.${reference},id.eq.${possibleUuid}`);
        } else {
            query = query.eq("reference", reference);
        }

        const { data: transaction, error } = await query.maybeSingle();

        if (error || !transaction) {
            console.error("Paystack Webhook: Failed transfer transaction lookup error:", error);
            return NextResponse.json({ status: "ignored_missing_withdrawal" });
        }

        if (transaction.status === "failed") {
            return NextResponse.json({ status: "already_refunded" });
        }

        const meta = (transaction.meta as Record<string, any>) ?? {};
        const chargedFeeUsd = meta.charged_fee_usd ?? 0;

        const { error: refundError } = await supabase.rpc(
            "refund_failed_withdrawal",
            {
                p_wallet_id: transaction.wallet_id,
                p_usd_amount: transaction.amount,
                p_fee_usd: chargedFeeUsd,
                p_transaction_id: transaction.id,
                p_reason: `Paystack Event (${eventType}): ${reason}`,
            }
        );

        if (refundError) {
            console.error("Webhook Refund Error:", refundError);
            return NextResponse.json(
                { error: "Failed to process automatic refund RPC" },
                { status: 500 }
            );
        }

        return NextResponse.json({ status: "transfer_refunded" });
    }

    return NextResponse.json({ status: "ignored" });
}