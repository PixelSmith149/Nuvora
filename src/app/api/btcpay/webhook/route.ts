import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ingestDeposit } from "@/lib/wallet/deposit/ingestDeposit";

export async function POST(req: Request) {
	try {
		const btcpayWebhookSecret = process.env.BTCPAY_WEBHOOK_SECRET;

		if (!btcpayWebhookSecret) {
			return NextResponse.json(
				{
					error: "Missing BTCPAY_WEBHOOK_SECRET",
				},
				{
					status: 500,
				},
			);
		}

		const signature = req.headers.get("btcpay-sig");

		if (!signature) {
			return NextResponse.json(
				{
					error: "Missing signature",
				},
				{
					status: 401,
				},
			);
		}

		/*
      BTCPay signature verification
      will be upgraded after
      actual BTCPay credentials
      are connected.
    */

		const event = await req.json();

		const invoiceId = event.invoiceId || event.invoice_id;

		const status = (event.type || event.status || "").toLowerCase();

		if (!invoiceId) {
			return NextResponse.json(
				{
					error: "Missing invoice id",
				},
				{
					status: 400,
				},
			);
		}

		const supabase = await createClient();

		const { data: transaction, error: txError } = await supabase
			.from("wallet_transactions")
			.select("*")
			.eq("reference", invoiceId)
			.single();

		if (txError || !transaction) {
			return NextResponse.json(
				{
					error: "Transaction not found",
				},
				{
					status: 404,
				},
			);
		}

		if (transaction.status === "success") {
			return NextResponse.json({
				status: "already_processed",
			});
		}

		const completed =
			status.includes("settled") ||
			status.includes("completed") ||
			status.includes("paid");

		if (!completed) {
			return NextResponse.json({
				status: "ignored",
			});
		}

		const metadata = transaction.metadata || {};

		await ingestDeposit({
			wallet_id: transaction.wallet_id,

			amount: Number(metadata.crypto_amount),

			currency: metadata.asset,

			reference: transaction.reference,

			provider: "btcpay",
		});

		await supabase
			.from("wallet_transactions")
			.update({
				status: "success",
			})
			.eq("id", transaction.id);

		return NextResponse.json({
			status: "success",
		});
	} catch (error: any) {
		console.error(error);

		return NextResponse.json(
			{
				error: error?.message || "Webhook failed",
			},
			{
				status: 500,
			},
		);
	}
}
