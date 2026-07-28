// src/app/api/wallet/withdraw/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processWithdraw } from "@/lib/wallet/withdraw/withdraw.engine";

export async function POST(req: Request) {
	try {
		const supabase = await createClient();

		// 1. Authenticate the active user session securely
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// 2. Extract input parameters transmitted from the client UI
		const body = await req.json();

		const amountUsd = Number(body.amount);
		const {
			currency,
			method, // 'momo' | 'bank' | 'crypto' | 'card'
			country, // 'GH' | 'CI' | 'CM' | 'KE' | 'NG'
			account_number, // Target delivery numeric account identification string
			account_name, // Optional value parameter
			bank_code, // Routing sort value code required for bank networks
			provider, // Dynamic network provider identity token string
		} = body;

		// 3. Strict Input Param Validation Guard Blocks
		if (!amountUsd || amountUsd <= 0 || isNaN(amountUsd)) {
			return NextResponse.json(
				{ error: "Invalid numeric currency withdrawal amount requested." },
				{ status: 400 },
			);
		}

		if (!account_number || !currency || !method || !country) {
			return NextResponse.json(
				{
					error:
						"Missing essential data payload routing coordinates (Destination, Currency, Method, or Country).",
				},
				{ status: 400 },
			);
		}

		// 4. Feature Availability Guard Layer (Crypto Protection Splitter)
		if (method === "crypto") {
			return NextResponse.json(
				{
					error:
						"Crypto settlement processing engines are currently restricted to incoming deposits. Blockchain payouts are unavailable.",
				},
				{ status: 501 }, // 501 Not Implemented (Graceful rejection)
			);
		}

		// 5. Normalization Layer: Translate Frontend Metaphors into Engine Types
		let mappedRecipientType: "nuban" | "mobile_money";

		if (method === "momo") {
			mappedRecipientType = "mobile_money";
		} else if (method === "bank") {
			mappedRecipientType = "nuban";
		} else {
			return NextResponse.json(
				{
					error: `The selected payout framework method '${method}' is not supported by the upstream ledger engine.`,
				},
				{ status: 400 },
			);
		}

		// 6. Invoke the Core Atomic Balance Engine Process Loop
		const result = await processWithdraw({
			user_id: user.id,
			amount: amountUsd, // Passes clean USD units into the fee conversion process loop
			currency,
			recipient_type: mappedRecipientType,
			account_number: account_number.trim(),
			account_name: account_name || undefined,
			bank_code: bank_code || undefined,
			provider: provider || undefined,
		});

		// 7. Success context return payload
		return NextResponse.json({
			success: true,
			wallet_id: result.wallet_id,
		});
	} catch (err: any) {
		console.error(
			"Critical Global Exception Loop inside Wallet Settlement Pipeline Routing:",
			err,
		);

		return NextResponse.json(
			{
				error:
					err instanceof Error
						? err.message
						: "Internal wallet settlement gateway routing processing fault.",
			},
			{ status: 400 },
		);
	}
}
