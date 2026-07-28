// lib/services/delivery.service.ts

import { createClient } from "@supabase/supabase-js";
import { sendNotifications } from "@/lib/services/notification.services";
import { determineAssetType } from "./purchase.service";
import { trackRevenue } from "./revenue.service";

export interface DeliveryResult {
	success: boolean;
	error?: string;
	assetDeleted?: boolean;
	listingDeleted?: boolean;
}

// ─── ⚙️ Platform Fee Configuration ──────────────────────────────
// 2.5% platform fee per sale
const PLATFORM_FEE_PERCENTAGE = 0.04;
// Hardcoded admin wallet ID (replace with your actual admin wallet ID)
const ADMIN_WALLET_ID = "997f4dd7-2124-4f36-9a71-e636e7e6d56a";
export async function confirmDelivery(
	orderId: string,
	buyerId: string,
): Promise<DeliveryResult> {
	const supabaseAdmin = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
		{ auth: { autoRefreshToken: false, persistSession: false } },
	);

	try {
		// ─── 1. Get order ──────────────────────────────────────────
		const { data: order, error: orderError } = await supabaseAdmin
			.from("global_market_orders")
			.select("*")
			.eq("id", orderId)
			.eq("buyer_id", buyerId)
			.single();

		if (orderError || !order) {
			return { success: false, error: "Order not found" };
		}

		if (order.status === "completed") {
			return { success: false, error: "This order is already completed" };
		}

		// ─── 2. Get escrow by order_id ────────────────────────────
		const { data: escrow, error: escrowError } = await supabaseAdmin
			.from("escrow_holdings")
			.select("*")
			.eq("order_id", orderId)
			.maybeSingle();

		if (escrowError || !escrow) {
			return { success: false, error: "Escrow record not found" };
		}

		if (escrow.status !== "pending") {
			return { success: false, error: "Escrow already processed" };
		}

		const amount = order.amount_paid;
		const sellerId = order.seller_id;
		const listingId = order.listing_id;

		// ─── 🧮 Calculate platform fee and seller payout ──────────
		const platformFee = amount * PLATFORM_FEE_PERCENTAGE;
		const sellerPayout = amount - platformFee;

		console.log(`💰 [Delivery] Amount: $${amount.toFixed(2)}`);
		console.log(
			`💰 [Delivery] Platform Fee (4.0%): $${platformFee.toFixed(2)}`,
		);
		console.log(`💰 [Delivery] Seller Payout: $${sellerPayout.toFixed(2)}`);

		// ─── 3. Get seller's wallet ─────────────────────────────
		console.log("🔍 [Delivery] Getting seller wallet for user:", sellerId);

		const { data: sellerWallet, error: sellerWalletError } = await supabaseAdmin
			.from("wallets")
			.select("id")
			.eq("user_id", sellerId)
			.maybeSingle();

		if (sellerWalletError) {
			console.error("❌ [Delivery] Wallet fetch error:", sellerWalletError);
			return { success: false, error: "Seller wallet not found" };
		}

		if (!sellerWallet) {
			console.error("❌ [Delivery] No wallet found for seller:", sellerId);
			return { success: false, error: "Seller wallet not found" };
		}

		console.log("✅ [Delivery] Seller wallet found:", sellerWallet.id);

		// ─── 4. Get seller's current balance ─────────────────────
		console.log("🔍 [Delivery] Getting balance for wallet:", sellerWallet.id);

		const { data: sellerBalance, error: balanceError } = await supabaseAdmin
			.from("wallet_balances")
			.select("balance")
			.eq("wallet_id", sellerWallet.id)
			.maybeSingle();

		if (balanceError) {
			console.error("❌ [Delivery] Balance fetch error:", balanceError);
			return { success: false, error: "Could not fetch seller balance" };
		}

		const currentSellerBalance = sellerBalance?.balance || 0;
		const newSellerBalance = currentSellerBalance + sellerPayout;

		console.log(
			`✅ [Delivery] Seller Balance: $${currentSellerBalance.toFixed(2)} → $${newSellerBalance.toFixed(2)} ( +$${sellerPayout.toFixed(2)} )`,
		);

		// ─── 5. Credit seller (payout amount - after fee) ────────
		const { error: creditError } = await supabaseAdmin
			.from("wallet_balances")
			.update({ balance: newSellerBalance })
			.eq("wallet_id", sellerWallet.id);

		if (creditError) {
			console.error("❌ [Delivery] Credit error:", creditError);
			return { success: false, error: "Failed to credit seller" };
		}

		console.log(
			"✅ [Delivery] Seller credited successfully! New balance: $" +
				newSellerBalance.toFixed(2),
		);

		// ─── 6. 🆕 Credit platform fee to admin wallet ────────────
		console.log("🔍 [Delivery] Getting admin wallet...");

		// Get admin wallet balance
		const { data: adminBalance, error: adminBalanceError } = await supabaseAdmin
			.from("wallet_balances")
			.select("balance")
			.eq("wallet_id", ADMIN_WALLET_ID)
			.maybeSingle();

		if (adminBalanceError) {
			console.error(
				"❌ [Delivery] Admin balance fetch error:",
				adminBalanceError,
			);
			// Continue anyway - log the error but don't fail the transaction
		}

		const currentAdminBalance = adminBalance?.balance || 0;
		const newAdminBalance = currentAdminBalance + platformFee;

		console.log(
			`✅ [Delivery] Admin Balance: $${currentAdminBalance.toFixed(2)} → $${newAdminBalance.toFixed(2)} ( +$${platformFee.toFixed(2)} )`,
		);

		// Credit admin wallet
		const { error: adminCreditError } = await supabaseAdmin
			.from("wallet_balances")
			.update({ balance: newAdminBalance })
			.eq("wallet_id", ADMIN_WALLET_ID);

		if (adminCreditError) {
			console.error("❌ [Delivery] Admin credit error:", adminCreditError);
			// ⚠️ If admin wallet credit fails, we should reverse the seller credit
			// This is a critical failure - log it prominently
			console.error(
				"🚨 CRITICAL: Failed to credit admin wallet. Rolling back seller credit...",
			);

			// Rollback seller credit
			await supabaseAdmin
				.from("wallet_balances")
				.update({ balance: currentSellerBalance })
				.eq("wallet_id", sellerWallet.id);

			return {
				success: false,
				error: "Failed to process platform fee",
			};
		}

		console.log(
			"✅ [Delivery] Admin wallet credited successfully! New balance: $" +
				newAdminBalance.toFixed(2),
		);
		if (!adminCreditError) {
			await trackRevenue({
				source: "platform_fee",
				amount: platformFee,
				userId: sellerId,
				referenceId: orderId,
				referenceType: "escrow_release",
				meta: {
					order_id: orderId,
					listing_id: listingId,
					gross_amount: amount,
					seller_payout: sellerPayout,
					buyer_id: buyerId,
				},
			});
		}

		// ─── 7. Log seller payout transaction ─────────────────────
		await supabaseAdmin.from("wallet_transactions").insert({
			wallet_id: sellerWallet.id,
			type: "deposit",
			amount: sellerPayout,
			status: "success",
			meta: {
				from_user: buyerId,
				order_id: orderId,
				type: "escrow_release",
				platform_fee: platformFee,
				gross_amount: amount,
			},
		});

		console.log("✅ [Delivery] Seller transaction logged");

		// ─── 8. 🆕 Log platform fee transaction ────────────────────
		await supabaseAdmin.from("wallet_transactions").insert({
			wallet_id: ADMIN_WALLET_ID,
			type: "platform_fee",
			amount: platformFee,
			status: "success",
			meta: {
				from_user: buyerId,
				seller_id: sellerId,
				order_id: orderId,
				listing_id: listingId,
				type: "fee_collection",
				gross_amount: amount,
				fee_percentage: PLATFORM_FEE_PERCENTAGE * 100 + "%",
			},
		});

		console.log("✅ [Delivery] Platform fee transaction logged");

		// ─── 9. Update escrow ────────────────────────────────────
		await supabaseAdmin
			.from("escrow_holdings")
			.update({
				status: "released",
				released_at: new Date().toISOString(),
			})
			.eq("id", escrow.id);

		// ─── 10. Update order ─────────────────────────────────────
		console.log("🔍 [Delivery] Attempting to update order:", {
			orderId,
			buyerId,
			currentStatus: order.status,
			newStatus: "completed",
		});

		const { data: updateData, error: updateError } = await supabaseAdmin
			.from("global_market_orders")
			.update({
				status: "completed",
				confirmed_at: new Date().toISOString(),
			})
			.eq("id", orderId)
			.select();

		console.log("🔍 [Delivery] Update result:", {
			data: updateData,
			error: updateError,
		});

		if (updateError) {
			console.error("❌ Order update failed:", updateError);
			return { success: false, error: "Failed to update order" };
		}

		if (!updateData || updateData.length === 0) {
			console.error("❌ No rows updated! Order not found or RLS blocked.");
			return { success: false, error: "Order not found or update blocked" };
		}

		console.log("✅ Order updated to:", updateData[0]?.status);

		// ─── 11. Get buyer profile ────────────────────────────────
		const { data: buyerProfile } = await supabaseAdmin
			.from("profiles")
			.select("display_name, username")
			.eq("id", buyerId)
			.single();

		const buyerName =
			buyerProfile?.display_name || buyerProfile?.username || "A buyer";

		// ─── 12. Get listing (for title and type) ─────────────────
		const { data: listing, error: listingError } = await supabaseAdmin
			.from("market_listings")
			.select("*")
			.eq("id", listingId)
			.single();

		// ─── 13. Send notifications ──────────────────────────────
		if (listing) {
			await sendNotifications("receipt_confirmed", {
				event: "receipt_confirmed",
				buyer_id: buyerId,
				seller_id: sellerId,
				listing_id: listingId,
				order_id: orderId,
				amount: amount,
				platform_fee: platformFee,
				seller_payout: sellerPayout,
				listing_title: listing.title,
				buyer_name: buyerName,
			});
		}

		// ─── 14. Update listing status ─────────────────────────────
		let assetUpdated = false;
		let listingUpdated = false;

		if (listing) {
			const assetType = determineAssetType(listing);

			if (assetType === "one_time" || assetType === "socio") {
				console.log(
					`🔍 [Delivery] Updating ${assetType} listing status to 'sold_pinned'...`,
				);

				const { error: updateStatusError } = await supabaseAdmin
					.from("market_listings")
					.update({
						status: "sold_pinned",
						updated_at: new Date().toISOString(),
					})
					.eq("id", listingId);

				if (updateStatusError) {
					console.error(
						"❌ [Delivery] Failed to update listing status:",
						updateStatusError,
					);
				} else {
					console.log("✅ [Delivery] Listing status updated to sold_pinned");
					listingUpdated = true;
					assetUpdated = true;
				}
			} else {
				console.log("🔄 [Delivery] Reusable asset - keeping for future sales");
			}
		}

		console.log(`✅ [Delivery] Completed successfully for order: ${orderId}`);
		console.log(
			`   💰 Gross: $${amount.toFixed(2)} → Seller: $${sellerPayout.toFixed(2)} + Platform Fee: $${platformFee.toFixed(2)}`,
		);

		return {
			success: true,
			assetDeleted: assetUpdated,
			listingDeleted: listingUpdated,
		};
	} catch (err: any) {
		console.error("❌ [Delivery] Confirmation error:", err);
		return {
			success: false,
			error: err.message || "Failed to confirm delivery",
		};
	}
}

export async function getBuyerOrders(buyerId: string) {
	const supabaseAdmin = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
		{ auth: { autoRefreshToken: false, persistSession: false } },
	);
	const { data, error } = await supabaseAdmin
		.from("global_market_orders")
		.select(`
      *,
      market_listings:listing_id(*)
    `)
		.eq("buyer_id", buyerId)
		.order("purchased_at", { ascending: false });

	if (error) {
		console.error("Get buyer orders error:", error);
		return [];
	}

	return data || [];
}

export async function getSellerOrders(sellerId: string) {
	const supabaseAdmin = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
		{ auth: { autoRefreshToken: false, persistSession: false } },
	);

	const { data, error } = await supabaseAdmin
		.from("global_market_orders")
		.select("*, market_listings(*)")
		.eq("seller_id", sellerId)
		.order("purchased_at", { ascending: false });

	if (error) {
		console.error("Get seller orders error:", error);
		return [];
	}

	return data || [];
}
