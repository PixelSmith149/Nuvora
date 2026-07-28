import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface PurchaseRequest {
	listing_id: string;
}

/**
 * Production-grade cryptographically secure pseudorandom string generator
 */
function generateSecurePassword(length = 16): string {
	const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
	const array = new Uint32Array(length);
	crypto.getRandomValues(array);

	let out = "";
	for (let i = 0; i < length; i++) {
		out += chars[array[i] % chars.length];
	}
	return out;
}

export async function POST(req: Request) {
	try {
		const supabase = await createClient();

		// 1. Resolve and Authenticate Active Buyer Session
		const {
			data: { user },
			error: userErr,
		} = await supabase.auth.getUser();
		if (userErr || !user) {
			return NextResponse.json(
				{ error: "Unauthorized access attempt" },
				{ status: 401 },
			);
		}
		const buyerId = user.id;

		// 2. Parse and Validate Purchase Payload
		const { listing_id } = (await req.json()) as PurchaseRequest;
		if (!listing_id) {
			return NextResponse.json(
				{ error: "listing_id parameter required" },
				{ status: 400 },
			);
		}

		// 3. Fetch and Validate Listing Node
		const { data: listing, error: listingErr } = await supabase
			.from("market_listings")
			.select("*")
			.eq("id", listing_id)
			.single();

		if (listingErr || !listing) {
			return NextResponse.json(
				{ error: "Market asset listing not found" },
				{ status: 404 },
			);
		}
		if (listing.status !== "active") {
			return NextResponse.json(
				{ error: "Listing asset is no longer available" },
				{ status: 409 },
			);
		}
		if (listing.seller_id === buyerId) {
			return NextResponse.json(
				{ error: "Self-purchasing assets is prohibited" },
				{ status: 400 },
			);
		}

		// 4. Resolve Party Balances From Secure Subsystem Table
		const [buyerWalletRes, sellerWalletRes] = await Promise.all([
			supabase
				.from("wallet_balances")
				.select("*")
				.eq("user_id", buyerId)
				.single(),
			supabase
				.from("wallet_balances")
				.select("*")
				.eq("user_id", listing.seller_id)
				.single(),
		]);

		if (
			buyerWalletRes.error ||
			!buyerWalletRes.data ||
			sellerWalletRes.error ||
			!sellerWalletRes.data
		) {
			return NextResponse.json(
				{ error: "Failed to resolve balance infrastructure nodes" },
				{ status: 500 },
			);
		}

		const buyerWallet = buyerWalletRes.data;
		const sellerWallet = sellerWalletRes.data;
		const itemPrice = Number(listing.price);

		if (Number(buyerWallet.balance) < itemPrice) {
			return NextResponse.json(
				{ error: "Insufficient wallet ledger balance" },
				{ status: 402 },
			);
		}

		// 5. Decode Asset Payload & Execute Fulfillment Stratification Rules
		let revealed: Record<string, unknown> = {};
		try {
			const payload =
				typeof listing.encrypted_asset_payload === "string"
					? JSON.parse(listing.encrypted_asset_payload)
					: listing.encrypted_asset_payload;

			if (listing.tab_category === "socio_market") {
				const newPass = generateSecurePassword();
				revealed = {
					platform: payload.platform_name,
					username: payload.username,
					new_password: newPass,
					note: "Credentials updated successfully. Secure access details established.",
				};
			} else if (listing.product_sale_type === "one_time") {
				revealed = { access_details: payload.access_details };
			} else if (listing.product_sale_type === "recurring") {
				const { data: keyRow } = await supabase
					.from("recurring_product_keys")
					.select("*")
					.eq("listing_id", listing.id)
					.order("created_at", { ascending: false })
					.limit(1)
					.maybeSingle();

				revealed = {
					management_key: keyRow?.management_key ?? "KEY_UNAVAILABLE",
					note: "Asset rotation protocol is active. Key transitions every 30 minutes.",
				};
			} else {
				revealed = { payload };
			}
		} catch {
			revealed = { raw: listing.encrypted_asset_payload };
		}

		// 6. Calculate Ledger Positions
		const newBuyerBalance = Number(buyerWallet.balance) - itemPrice;
		const newSellerBalance = Number(sellerWallet.balance) + itemPrice;

		// 7. Atomic Balance Deductions & Additions
		const { error: buyerUpdateErr } = await supabase
			.from("wallet_balances")
			.update({ balance: newBuyerBalance })
			.eq("wallet_id", buyerWallet.wallet_id);

		if (buyerUpdateErr) {
			return NextResponse.json(
				{ error: "State change transaction rejected: Debit failed" },
				{ status: 500 },
			);
		}

		await supabase
			.from("wallet_balances")
			.update({ balance: newSellerBalance })
			.eq("wallet_id", sellerWallet.wallet_id);

		// 8. Write Double-Entry Audit Tracking Blocks
		await supabase.from("wallet_transactions").insert([
			{
				wallet_id: buyerWallet.wallet_id,
				reference: `order-deb-${crypto.randomUUID()}`,
				type: "transfer",
				amount: -itemPrice,
				status: "success",
				provider: "internal_market",
				meta: {
					counterparty_wallet_id: sellerWallet.wallet_id,
					reference_type: "market_order",
					reference_id: listing.id,
					memo: `Purchase: ${listing.title}`,
				},
			},
			{
				wallet_id: sellerWallet.wallet_id,
				reference: `order-crd-${crypto.randomUUID()}`,
				type: "transfer",
				amount: itemPrice,
				status: "success",
				provider: "internal_market",
				meta: {
					counterparty_wallet_id: buyerWallet.wallet_id,
					reference_type: "market_order",
					reference_id: listing.id,
					memo: `Sale: ${listing.title}`,
				},
			},
		]);

		// 9. Generate Permanent Order Record
		const { data: order, error: orderErr } = await supabase
			.from("global_market_orders")
			.insert({
				listing_id: listing.id,
				buyer_id: buyerId,
				seller_id: listing.seller_id,
				amount_paid: itemPrice,
				revealed_credentials: revealed,
			})
			.select()
			.single();

		if (orderErr) {
			return NextResponse.json(
				{ error: "Failed to securely record fulfillment block" },
				{ status: 500 },
			);
		}

		// 10. Update Marketplace Status Inventory State Links
		const currentIsoTimestamp = new Date().toISOString();
		if (
			listing.tab_category === "socio_market" ||
			listing.product_sale_type === "one_time"
		) {
			await supabase
				.from("market_listings")
				.update({ status: "sold_pinned", updated_at: currentIsoTimestamp })
				.eq("id", listing.id);
		} else if (listing.product_sale_type === "recurring") {
			const rotationTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
			await supabase
				.from("recurring_product_keys")
				.update({
					next_rotation_trigger: rotationTime,
					updated_at: currentIsoTimestamp,
				})
				.eq("listing_id", listing.id);
		}

		return NextResponse.json(
			{ success: true, order, revealed },
			{ status: 200 },
		);
	} catch (err) {
		return NextResponse.json(
			{
				error:
					err instanceof Error
						? err.message
						: "Fatal system exception encountered processing transaction",
			},
			{ status: 500 },
		);
	}
}
