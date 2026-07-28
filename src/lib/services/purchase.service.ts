// lib/services/purchase.service.ts

import { sendNotifications } from "@/lib/services/notification.services";
import { createClient } from "@/lib/supabase/server";
import { transfer } from "@/lib/wallet/wallet.engine";

export interface PurchaseResult {
	success: boolean;
	error?: string;
	order_id?: string;
	escrow_id?: string;
}

export interface AssetDetails {
	id: string;
	listing_id: string;
	seller_id: string;
	product_title: string;
	product_description: string | null;
	sale_price: number;
	display_cover_url: string | null;
	file_original_name?: string | null;
	file_size_bytes?: number | null;
	file_mime_type?: string | null;
	platform_name?: string | null;
	target_username?: string | null;
	followers_count?: number | null;
}

export type AssetType = "one_time" | "socio" | "reusable";

export async function processPurchase(
	listingId: string,
	buyerId: string,
): Promise<PurchaseResult> {
	const supabase = await createClient();

	try {
		// ─── 1. Get listing ──────────────────────────────────────
		const { data: listing, error: listingError } = await supabase
			.from("market_listings")
			.select("*")
			.eq("id", listingId)
			.single();

		if (listingError || !listing) {
			return { success: false, error: "Listing not found" };
		}

		if (listing.status !== "active") {
			return { success: false, error: "This listing is no longer available" };
		}

		if (listing.seller_id === buyerId) {
			return { success: false, error: "You cannot purchase your own listing" };
		}

		const amount = listing.price;
		const sellerId = listing.seller_id;

		// ─── 2. Get buyer profile (for notifications) ────────────
		const { data: buyerProfile, error: buyerProfileError } = await supabase
			.from("profiles")
			.select("display_name, username")
			.eq("id", buyerId)
			.single();

		if (buyerProfileError) {
			console.warn(
				"⚠️ [Purchase] Could not fetch buyer profile:",
				buyerProfileError,
			);
		}

		const buyerName =
			buyerProfile?.display_name || buyerProfile?.username || "A buyer";

		// ─── 3. Get buyer's wallet ──────────────────────────────
		const { data: buyerWallet, error: buyerWalletError } = await supabase
			.from("wallets")
			.select("id")
			.eq("user_id", buyerId)
			.maybeSingle();

		if (buyerWalletError || !buyerWallet) {
			console.error("❌ [Purchase] Buyer wallet error:", buyerWalletError);
			return { success: false, error: "Buyer wallet not found" };
		}

		// ─── 4. Get buyer's balance ─────────────────────────────
		const { data: buyerBalance, error: buyerBalanceError } = await supabase
			.from("wallet_balances")
			.select("balance")
			.eq("wallet_id", buyerWallet.id)
			.maybeSingle();

		if (buyerBalanceError || !buyerBalance) {
			console.error("❌ [Purchase] Buyer balance error:", buyerBalanceError);
			return { success: false, error: "Could not fetch buyer balance" };
		}

		if (buyerBalance.balance < amount) {
			return {
				success: false,
				error: `Insufficient balance. Need $${amount.toFixed(2)}, have $${(buyerBalance?.balance || 0).toFixed(2)}`,
			};
		}

		// ─── 5. Get seller's wallet ─────────────────────────────
		const { data: sellerWallet, error: sellerWalletError } = await supabase
			.from("wallets")
			.select("id")
			.eq("user_id", sellerId)
			.maybeSingle();

		if (sellerWalletError || !sellerWallet) {
			console.error("❌ [Purchase] Seller wallet error:", sellerWalletError);
			return { success: false, error: "Seller wallet not found" };
		}

		// ─── 6. Create order ─────────────────────────────────────
		const { data: order, error: orderError } = await supabase
			.from("global_market_orders")
			.insert({
				listing_id: listingId,
				buyer_id: buyerId,
				seller_id: sellerId,
				amount_paid: amount,
				purchased_at: new Date().toISOString(),
				status: "pending_verification",
			})
			.select()
			.single();

		if (orderError) {
			console.error("❌ [Purchase] Order creation error:", orderError);
			return { success: false, error: "Failed to create order" };
		}

		// ─── 7. Send notifications ───────────────────────────────
		await sendNotifications("purchase_created", {
			event: "purchase_created",
			buyer_id: buyerId,
			seller_id: sellerId,
			listing_id: listingId,
			order_id: order.id,
			amount: amount,
			listing_title: listing?.title,
			buyer_name: buyerName,
		});

		// ─── 8. Deduct from buyer (escrow hold) ──────────────────
		const newBuyerBalance = buyerBalance.balance - amount;

		const { error: deductError } = await supabase
			.from("wallet_balances")
			.update({ balance: newBuyerBalance })
			.eq("wallet_id", buyerWallet.id);

		if (deductError) {
			console.error("❌ [Purchase] Deduct error:", deductError);
			// Rollback order
			await supabase.from("global_market_orders").delete().eq("id", order.id);
			return { success: false, error: "Failed to hold funds" };
		}

		// ─── 9. Create escrow holding ────────────────────────────
		const { data: escrow, error: escrowError } = await supabase
			.from("escrow_holdings")
			.insert({
				order_id: order.id,
				buyer_id: buyerId,
				seller_id: sellerId,
				amount: amount,
				status: "pending",
				held_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (escrowError) {
			console.error("❌ [Purchase] Escrow creation error:", escrowError);
			// Rollback: refund buyer
			await supabase
				.from("wallet_balances")
				.update({ balance: buyerBalance.balance })
				.eq("wallet_id", buyerWallet.id);
			await supabase.from("global_market_orders").delete().eq("id", order.id);
			return { success: false, error: "Failed to create escrow holding" };
		}

		// ─── 10. Update order with escrow reference ───────────────
		await supabase
			.from("global_market_orders")
			.update({ escrow_id: escrow.id })
			.eq("id", order.id);

		// ─── 11. Mark listing status based on asset type ──────────────
		const assetType = determineAssetType(listing);

		if (assetType === "one_time" || assetType === "socio") {
			await supabase
				.from("market_listings")
				.update({ status: "sold_pinned" })
				.eq("id", listingId);
			console.log(`✅ [Purchase] ${assetType} listing marked as sold_pinned`);
		} else {
			// Reusable asset - keep active for future sales
			console.log(
				`🔄 [Purchase] Reusable asset - keeping active for future sales`,
			);
		}

		// ─── 12. Log transaction ──────────────────────────────────
		await supabase.from("wallet_transactions").insert({
			wallet_id: buyerWallet.id,
			type: "transfer",
			amount: amount,
			status: "success",
			meta: {
				to_user: sellerId,
				order_id: order.id,
				escrow_id: escrow.id,
				type: "escrow_hold",
			},
		});

		console.log(`✅ [Purchase] Purchase successful for order: ${order.id}`);

		return {
			success: true,
			order_id: order.id,
			escrow_id: escrow.id,
		};
	} catch (err: any) {
		console.error("❌ [Purchase] Unhandled error:", err);
		return { success: false, error: err.message || "Purchase failed" };
	}
}

export async function getAssetByListingId(
	listingId: string,
	assetType: AssetType,
): Promise<AssetDetails | null> {
	const supabase = await createClient();

	if (assetType === "one_time") {
		const { data } = await supabase
			.from("one_time_digital_tools")
			.select("*")
			.eq("listing_id", listingId)
			.maybeSingle();
		return data || null;
	}

	if (assetType === "socio") {
		const { data } = await supabase
			.from("socio_market_metrics")
			.select("*")
			.eq("listing_id", listingId)
			.maybeSingle();
		return data || null;
	}

	if (assetType === "reusable") {
		const { data } = await supabase
			.from("reusable_digital_products")
			.select("*")
			.eq("listing_id", listingId)
			.maybeSingle();
		return data || null;
	}

	return null;
}

export function determineAssetType(listing: any): AssetType {
	if (listing.tab_category === "socio_market") {
		return "socio";
	}
	if (listing.product_sale_type === "one_time") {
		return "one_time";
	}
	return "reusable";
}
