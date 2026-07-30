import crypto from "crypto";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ingestDeposit } from "@/lib/wallet/deposit/ingestDeposit";

/**
 * Safely compares two strings in constant time to prevent timing attacks.
 */
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
			{ status: 500 },
		);
	}

	const rawBody = await req.text();
	const signature = req.headers.get("x-paystack-signature");

	// 1. Generate local SHA512 hash
	const hash = crypto
		.createHmac("sha512", secret)
		.update(rawBody)
		.digest("hex");

	// 2. Timing Safe Signature Validation
	if (!safeCompareSignatures(hash, signature)) {
		return NextResponse.json(
			{ error: "Invalid payload signature" },
			{ status: 401 },
		);
	}

	const event = JSON.parse(rawBody);
	const eventType: string = event.event;
	const eventData = event.data;

	const supabase = await createClient();

	// ==========================================
	// EVENT TYPE 1: DEPOSIT SUCCESS (charge.success)
	// ==========================================
	if (eventType === "charge.success") {
		const reference: string = eventData.reference;

		// Select metadata/meta safely without breaking table schema
		const { data: transaction, error } = await supabase
			.from("wallet_transactions")
			.select("id, wallet_id, status, meta")
			.eq("reference", reference)
			.single();

		if (error || !transaction) {
			return NextResponse.json(
				{ error: "Transaction not found for reference" },
				{ status: 404 },
			);
		}

		if (transaction.status === "success") {
			return NextResponse.json({ status: "already_processed" });
		}

		const sourceCurrency = eventData.currency;
		// Paystack amount is received in minor units (kobo, pesewas, cents)
		const sourceAmountMajor = eventData.amount / 100;

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

		// Match reference pattern from withdraw engine (pb-tx-{id}) or raw reference
		const { data: transaction, error } = await supabase
			.from("wallet_transactions")
			.select("id, wallet_id, amount, status, meta")
			.or(`reference.eq.${reference},id.eq.${reference.replace("pb-tx-", "")}`)
			.single();

		if (error || !transaction) {
			return NextResponse.json(
				{ error: "Withdrawal transaction not found" },
				{ status: 404 },
			);
		}

		// Idempotency check: Ignore if already marked failed or refunded
		if (transaction.status === "failed") {
			return NextResponse.json({ status: "already_refunded" });
		}

		const meta = transaction.meta ?? {};
		const chargedFeeUsd = meta.charged_fee_usd ?? 0;

		// Trigger DB atomic refund RPC
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
				{ status: 500 },
			);
		}

		return NextResponse.json({ status: "transfer_refunded" });
	}

	// Gracefully ignore all other unhandled events
	return NextResponse.json({ status: "ignored" });
}