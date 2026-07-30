import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { convertToUSD } from "@/lib/wallet/currency/convert";
import type { Currency } from "@/lib/wallet/currency/convert";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const reference = searchParams.get("reference") || searchParams.get("trxref");
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

	if (!reference) {
		return NextResponse.redirect(`${siteUrl}/account/wallet?status=error&message=Missing+reference`);
	}

	const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
	if (!paystackSecret) {
		return NextResponse.redirect(`${siteUrl}/account/wallet?status=error&message=Server+configuration+error`);
	}

	const supabase = await createClient();

	// 1. Authenticate session
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.redirect(`${siteUrl}/login?redirectTo=/account/wallet`);
	}

	try {
		// 2. Look up local pending transaction
		const { data: tx, error: txError } = await supabase
			.from("wallet_transactions")
			.select("*, wallet_balances!inner(*)")
			.eq("reference", reference)
			.single();

		if (txError || !tx) {
			return NextResponse.redirect(`${siteUrl}/account/wallet?status=error&message=Transaction+not+found`);
		}

		// If already processed via Webhook, redirect back cleanly
		if (tx.status === "completed") {
			return NextResponse.redirect(`${siteUrl}/account/wallet?status=success&reference=${reference}`);
		}

		if (tx.status === "failed") {
			return NextResponse.redirect(`${siteUrl}/account/wallet?status=error&message=Transaction+marked+as+failed`);
		}

		// 3. Verify directly with Paystack API
		const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${paystackSecret}`,
				"Content-Type": "application/json",
			},
			cache: "no-store",
		});

		const verifyData = await verifyRes.json();

		if (!verifyRes.ok || !verifyData.status || verifyData.data.status !== "success") {
			// Mark as failed locally
			await supabase
				.from("wallet_transactions")
				.update({ status: "failed", meta: { ...tx.meta, error: verifyData.message || "Paystack verification failed" } })
				.eq("id", tx.id);

			return NextResponse.redirect(`${siteUrl}/account/wallet?status=error&message=Payment+verification+failed`);
		}

		// 4. Calculate USD credit amount using stored currency metadata
		const rawAmount = verifyData.data.amount / 100; // Minor unit to major unit (e.g. kobo to NGN)
		const currency = (verifyData.data.currency || tx.meta?.currency || "USD") as Currency;
		const creditAmountUsd = convertToUSD(rawAmount, currency);

		// 5. Atomic Update: Credit User Balance & Complete Transaction
		const { error: updateTxError } = await supabase
			.from("wallet_transactions")
			.update({
				status: "completed",
				amount: creditAmountUsd, // Normalize stored amount to base USD
				meta: {
					...tx.meta,
					paystack_id: verifyData.data.id,
					channel: verifyData.data.channel,
					currency_paid: currency,
					raw_amount_paid: rawAmount,
					verified_at: new Date().toISOString(),
				},
			})
			.eq("id", tx.id)
			.eq("status", "pending");

		if (updateTxError) {
			console.error("Failed to update transaction status during callback:", updateTxError);
		} else {
			// Increment Wallet Balance atomically
			await supabase.rpc("increment_wallet_balance", {
				p_wallet_id: tx.wallet_id,
				p_amount: creditAmountUsd,
			});
		}

		return NextResponse.redirect(`${siteUrl}/account/wallet?status=success&reference=${reference}`);
	} catch (err: any) {
		console.error("Error inside Paystack Callback Handler:", err);
		return NextResponse.redirect(`${siteUrl}/account/wallet?status=error&message=Internal+verification+error`);
	}
}