import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
	try {
		const supabase = await createClient();

		// 1. Authenticate user session securely
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// 2. Parse and validate incoming payload parameters
		const body = await req.json();
		const asset = body.asset; // e.g., "BTC-OnChain", "USDT-TRC20"
		const cryptoAmount = Number(body.cryptoAmount);
		const usdAmount = Number(body.usdAmount);

		if (!asset) {
			return NextResponse.json(
				{ error: "Asset type parameter is required" },
				{ status: 400 },
			);
		}

		if (!cryptoAmount || cryptoAmount <= 0 || !usdAmount || usdAmount <= 0) {
			return NextResponse.json(
				{ error: "Invalid currency conversion amount parameters" },
				{ status: 400 },
			);
		}

		// 3. Resolve user's database wallet pointer row
		const { data: wallet, error: walletError } = await supabase
			.from("wallets")
			.select("id")
			.eq("user_id", user.id)
			.single();

		if (walletError || !wallet) {
			return NextResponse.json(
				{ error: "Internal ledger entity profile not found" },
				{ status: 404 },
			);
		}

		// 4. Extract clean symbol identifier from asset string
		// e.g., "BTC-OnChain" -> "BTC", "USDT-TRC20" -> "USDT"
		const assetSymbol = asset.split("-")[0];

		// Generate our platform-side unique reference track string
		const reference = `CRYPTO-${Date.now()}-${randomUUID()}`;

		// 5. Connect live upstream to BTCPay Server Greenfield Gateway Engine
		const btcPayUrl = process.env.BTCPAY_SERVER_URL;
		const storeId = process.env.BTCPAY_STORE_ID;
		const apiKey = process.env.BTCPAY_GREENFIELD_API_KEY;

		if (!btcPayUrl || !storeId || !apiKey) {
			console.error(
				"Missing critical backend system configuration for BTCPay Greenfield parameters.",
			);
			return NextResponse.json(
				{ error: "Crypto gateway server configuration mismatch error." },
				{ status: 500 },
			);
		}

		// Hit Greenfield API endpoint to generate structural invoice frame
		const btcPayResponse = await fetch(
			`${btcPayUrl.replace(/\/$/, "")}/api/v1/stores/${storeId}/invoices`,
			{
				method: "POST",
				headers: {
					Authorization: `token ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					amount: cryptoAmount,
					currency: assetSymbol,
					metadata: {
						orderId: reference,
						userId: user.id,
						walletId: wallet.id,
						intended_usd_credit: usdAmount,
						asset_rail: asset,
					},
					checkout: {
						redirectURL: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/account/wallet`,
					},
				}),
			},
		);

		const invoiceData = await btcPayResponse.json();

		if (!btcPayResponse.ok) {
			console.error("BTCPay Server execution rejection:", invoiceData);
			return NextResponse.json(
				{
					error:
						invoiceData.message ||
						"Failed to establish invoice block generation from server.",
				},
				{ status: 400 },
			);
		}

		// 6. Inspect payment methods matrix arrays to capture addresses and deep link strings
		let address = "";
		let paymentString = reference; // Fallback to track reference identification
		const checkoutUrl = invoiceData.checkoutLink || "";

		// Fetch the payment methods block attached to this explicit checkout instance
		const paymentMethodsResponse = await fetch(
			`${btcPayUrl.replace(/\/$/, "")}/api/v1/stores/${storeId}/invoices/${invoiceData.id}/payment-methods`,
			{
				method: "GET",
				headers: { Authorization: `token ${apiKey}` },
			},
		);

		if (paymentMethodsResponse.ok) {
			const methods = await paymentMethodsResponse.json();

			// Attempt matching target data criteria strings
			// On-chain returns an explicit address. Lightning returns a BOLT11 payment string (pr)
			const targetMethod = methods.find(
				(m: any) => m.cryptoCode === assetSymbol,
			);
			if (targetMethod) {
				address = targetMethod.destination || "";
				paymentString =
					targetMethod.paymentLink || targetMethod.destination || reference;
			}
		}

		// 7. Insert the pending deposit record line block baseline into local schema database
		const { error: txError } = await supabase
			.from("wallet_transactions")
			.insert({
				wallet_id: wallet.id,
				reference,
				type: "deposit",
				provider: "btcpay",
				status: "pending",
				amount_usd: usdAmount, // Persist clean float value reference logic tracking parameter
				metadata: {
					asset,
					crypto_amount: cryptoAmount,
					estimated_usd: usdAmount,
					btcpay_invoice_id: invoiceData.id,
				},
			});

		if (txError) {
			console.error(
				"Database tracking layer injection mismatch runtime error:",
				txError,
			);
			throw txError;
		}

		// 8. Return dynamic operational payloads down matching frontend type models
		return NextResponse.json({
			reference,
			checkoutUrl,
			paymentString,
			address,
		});
	} catch (error: any) {
		console.error("Critical Crypto Topup Global Exception Loop:", error);
		return NextResponse.json(
			{
				error:
					error?.message ||
					"Failed to create live ledger payment request context",
			},
			{
				status: 500,
			},
		);
	}
}
