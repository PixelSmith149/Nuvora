import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
	try {
		const supabase = await createClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { amount, phone, network, currency } = body;

		if (!amount || !phone || !network || !currency) {
			return NextResponse.json(
				{
					message:
						"Amount, phone, network, and currency parameters are required",
				},
				{ status: 400 },
			);
		}

		// Connect to Paystack Direct Charge Core Engine
		const paystackResponse = await fetch("https://api.paystack.co/charge", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: user.email,
				amount: Math.round(Number(amount) * 100), // convert to structural currency sub-units safely
				currency: currency, // 🎯 FIXED: Dynamic currency allocation matching country networks
				mobile_money: {
					phone,
					provider: network, // Maps straight to Paystack string identifier maps (e.g. mpesa, mtn, orange)
				},
			}),
		});

		const paystackData = await paystackResponse.json();

		if (!paystackResponse.ok || !paystackData.status) {
			return NextResponse.json(
				{ message: paystackData.message || "Unable to create MoMo charge" },
				{ status: 400 },
			);
		}

		const reference = paystackData.data.reference;

		// Resolve user's distinct multi-tenant internal wallet profile index
		const { data: wallet } = await supabase
			.from("wallet_balances") // Using wallet_balances matching your database schema lookup patterns
			.select("wallet_id")
			.eq("user_id", user.id)
			.single();

		if (!wallet) {
			return NextResponse.json(
				{ message: "Wallet entity mapping not discovered" },
				{ status: 404 },
			);
		}

		// Insert uniform pending record line.
		const { error } = await supabase.from("wallet_transactions").insert({
			wallet_id: wallet.wallet_id,
			reference,
			amount: Number(amount),
			status: "pending",
			provider: "momo",
			meta: {
				network,
				phone,
				original_currency: currency,
			},
		});

		if (error) throw error;

		return NextResponse.json({
			success: true,
			reference,
			status: "pending",
		});
	} catch (error: any) {
		console.error("Multi-Country MoMo Deposit Failure:", error);
		return NextResponse.json(
			{ message: error.message || "Server error" },
			{ status: 500 },
		);
	}
}
