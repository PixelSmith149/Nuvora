import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Currency } from "@/lib/wallet/currency/convert";

export async function POST(req: Request) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// 🎯 FIXED: Accept explicit configuration contract from frontend
	const { amount, currency } = (await req.json()) as {
		amount: number;
		currency: Currency;
	};

	if (!amount || amount <= 0) {
		return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
	}

	const selectedCurrency = currency || "USD";
	const paystackSecret = process.env.PAYSTACK_SECRET_KEY!;

	// 1. Get user's wallet profile metadata mapping link
	const { data: wallet, error: walletError } = await supabase
		.from("wallet_balances")
		.select("wallet_id")
		.eq("user_id", user.id)
		.single();

	if (walletError || !wallet) {
		return NextResponse.json(
			{ error: "Wallet lookup failed" },
			{ status: 404 },
		);
	}

	// Generate a distinct transaction reference signature
	const reference = `pb-${crypto.randomUUID()}`;

	// 🎯 2. Hit Paystack initialize engine with precise parameters
	const res = await fetch("https://api.paystack.co/transaction/initialize", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${paystackSecret}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email: user.email,
			amount: Math.round(amount * 100), // Secure tracking against float sub-units
			currency: selectedCurrency, // 🎯 FIXED: Forcing Paystack to charge in user selection
			reference: reference,
			callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account/wallet`,
			metadata: {
				user_id: user.id,
				wallet_id: wallet.wallet_id,
				intended_currency: selectedCurrency,
			},
		}),
	});

	const data = await res.json();

	if (!data.status) {
		return NextResponse.json(
			{ error: data.message || "Payment initialization failed" },
			{ status: 400 },
		);
	}

	// 🎯 3. Save standard pending ledger baseline block reference inside database
	const { error: dbError } = await supabase.from("wallet_transactions").insert({
		wallet_id: wallet.wallet_id,
		reference: reference,
		amount: amount, // Log target unit sizing trace context
		status: "pending",
		provider: "paystack",
		meta: {
			currency: selectedCurrency,
		},
	});

	if (dbError) {
		return NextResponse.json(
			{ error: "Failed to record transaction audit tracking" },
			{ status: 500 },
		);
	}

	return NextResponse.json({
		authorization_url: data.data.authorization_url,
		reference: reference,
	});
}
