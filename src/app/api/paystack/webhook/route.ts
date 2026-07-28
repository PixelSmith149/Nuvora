import crypto from "crypto";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ingestDeposit } from "@/lib/wallet/deposit/ingestDeposit";

export async function POST(req: Request) {
	const secret = process.env.PAYSTACK_SECRET_KEY;

	if (!secret) {
		return NextResponse.json(
			{ error: "Missing Paystack secret" },
			{ status: 500 },
		);
	}

	const rawBody = await req.text();

	const signature = req.headers.get("x-paystack-signature");

	const hash = crypto
		.createHmac("sha512", secret)
		.update(rawBody)
		.digest("hex");

	if (!signature || hash !== signature) {
		return NextResponse.json(
			{
				error: "Invalid signature",
			},
			{
				status: 401,
			},
		);
	}

	const event = JSON.parse(rawBody);

	if (event.event !== "charge.success") {
		return NextResponse.json({
			status: "ignored",
		});
	}

	const payment = event.data;

	const reference = payment.reference;

	const supabase = await createClient();

	/*
    Find the original pending wallet transaction.

    Currency is retrieved from our database,
    NOT assumed here.
  */

	const { data: transaction, error } = await supabase
		.from("wallet_transactions")
		.select(
			`
      id,
      wallet_id,
      status,
      metadata
      `,
		)
		.eq("reference", reference)
		.single();

	if (error || !transaction) {
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

	const sourceCurrency = payment.currency;

	const sourceAmount = payment.amount / 100;

	/*
    ingestDeposit handles:
    - currency conversion
    - USD wallet credit
    - ledger creation
    - balance update
  */

	await ingestDeposit({
		wallet_id: transaction.wallet_id,

		amount: sourceAmount,

		currency: sourceCurrency,

		reference,

		provider: "paystack",
	});

	return NextResponse.json({
		status: "success",
	});
}
