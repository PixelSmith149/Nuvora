// lib/services/notification.service.ts

import { createClient as createClientAdmin } from "@supabase/supabase-js";


// ─── ⚙️ Platform Fee Configuration ──────────────────────────────
const PLATFORM_FEE_PERCENTAGE = 0.025; // 2.5%

export type NotificationEvent =
	| "purchase_created"
	| "asset_delivered"
	| "receipt_confirmed"
	| "payment_released"
	| "new_message"
	| "new_review"
	| "listing_approved"
	| "reminder_pending_delivery"
	| "escrow_auto_released";

export interface NotificationPayload {
	user_id: string;
	title: string;
	body: string;
	priority: "high" | "normal" | "low";
	metadata?: Record<string, any>;
}

export interface NotificationContext {
	event: NotificationEvent;
	buyer_id?: string;
	seller_id?: string;
	listing_id?: string;
	order_id?: string;
	amount?: number;
	platform_fee?: number;
	seller_payout?: number;
	listing_title?: string;
	buyer_name?: string;
	seller_name?: string;
}

// ============================================================
// NOTIFICATION SERVICE
// ============================================================

export class NotificationService {
	private supabase: any;

	constructor() {
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
		const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
		this.supabase = createClientAdmin(supabaseUrl, supabaseKey);
	}

	async send(payload: NotificationPayload): Promise<boolean> {
		try {

			const { error } = await this.supabase
				.from("market_inbox_messages")
				.insert({
					user_id: payload.user_id,
					title: payload.title,
					body: payload.body,
					priority: payload.priority || "normal",
					is_read: false,
					created_at: new Date().toISOString(),
					metadata: payload.metadata || {},
				});

			if (error) {
				console.error("❌ [Notification] Failed to send:", error);
				return false;
			}

			
			return true;
		} catch (err) {
			console.error("❌ [Notification] Error:", err);
			return false;
		}
	}

	async sendToMany(payloads: NotificationPayload[]): Promise<boolean[]> {
		const results = await Promise.all(
			payloads.map((payload) => this.send(payload)),
		);
		return results;
	}

	async getUnreadCount(userId: string): Promise<number> {
		try {
			const { count, error } = await this.supabase
				.from("market_inbox_messages")
				.select("id", { count: "exact", head: true })
				.eq("user_id", userId)
				.eq("is_read", false);

			if (error) {
				console.error("❌ [Notification] Unread count error:", error);
				return 0;
			}

			return count || 0;
		} catch (err) {
			console.error("❌ [Notification] Error:", err);
			return 0;
		}
	}
}

// ============================================================
// NOTIFICATION TEMPLATES
// ============================================================

export const NotificationTemplates = {
	// ─── Purchase Flow ──────────────────────────────────────────

	purchaseCreated_buyer: (
		context: NotificationContext,
	): NotificationPayload => ({
		user_id: context.buyer_id!,
		title: "🛒 Purchase Complete",
		body: `You purchased "${context.listing_title}" for $${context.amount?.toFixed(2)}.

📊 Transaction Breakdown:
• Sale Price: $${context.amount?.toFixed(2)}
• Platform Fee: $${(context.amount! * PLATFORM_FEE_PERCENTAGE).toFixed(2)} (2.5%)
• Seller Payout: $${(context.amount! * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)}

✅ The asset has been automatically delivered to your locker. The seller has been paid.`,
		priority: "high",
		metadata: {
			order_id: context.order_id,
			listing_id: context.listing_id,
			amount: context.amount,
			platform_fee: context.amount! * PLATFORM_FEE_PERCENTAGE,
			seller_payout: context.amount! * (1 - PLATFORM_FEE_PERCENTAGE),
		},
	}),

	purchaseCreated_seller: (
		context: NotificationContext,
	): NotificationPayload => ({
		user_id: context.seller_id!,
		title: "🎉 Asset Sold!",
		body: `Your asset "${context.listing_title}" was purchased by ${context.buyer_name} for $${context.amount?.toFixed(2)}.

📊 Transaction Breakdown:
• Sale Price: $${context.amount?.toFixed(2)}
• Platform Fee (2.5%): $${(context.amount! * PLATFORM_FEE_PERCENTAGE).toFixed(2)}
• Your Payout: $${(context.amount! * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)}

✅ $${(context.amount! * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)} has been credited to your wallet. The asset has been delivered to the buyer.`,
		priority: "high",
		metadata: {
			order_id: context.order_id,
			listing_id: context.listing_id,
			amount: context.amount,
			platform_fee: context.amount! * PLATFORM_FEE_PERCENTAGE,
			seller_payout: context.amount! * (1 - PLATFORM_FEE_PERCENTAGE),
		},
	}),

	receiptConfirmed_buyer: (
		context: NotificationContext,
	): NotificationPayload => ({
		user_id: context.buyer_id!,
		title: "✅ Delivery Confirmed",
		body: `You confirmed receipt of "${context.listing_title}".

📊 Transaction Summary:
• Purchase Price: $${context.amount?.toFixed(2)}
• Platform Fee (2.5%): $${(context.amount! * PLATFORM_FEE_PERCENTAGE).toFixed(2)}
• Seller Payout: $${(context.amount! * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)}

✅ Payment has been released to the seller. Thank you for your purchase!`,
		priority: "normal",
		metadata: {
			order_id: context.order_id,
			listing_id: context.listing_id,
			amount: context.amount,
			platform_fee: context.amount! * PLATFORM_FEE_PERCENTAGE,
			seller_payout: context.amount! * (1 - PLATFORM_FEE_PERCENTAGE),
		},
	}),

	receiptConfirmed_seller: (
		context: NotificationContext,
	): NotificationPayload => ({
		user_id: context.seller_id!,
		title: "✅ Buyer Confirmed Receipt",
		body: `${context.buyer_name} confirmed receipt of "${context.listing_title}".

📊 Transaction Breakdown:
• Sale Price: $${context.amount?.toFixed(2)}
• Platform Fee (2.5%): $${(context.amount! * PLATFORM_FEE_PERCENTAGE).toFixed(2)}
• Your Payout: $${(context.amount! * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)}

💰 $${(context.amount! * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)} has been credited to your wallet.`,
		priority: "high",
		metadata: {
			order_id: context.order_id,
			listing_id: context.listing_id,
			amount: context.amount,
			platform_fee: context.amount! * PLATFORM_FEE_PERCENTAGE,
			seller_payout: context.amount! * (1 - PLATFORM_FEE_PERCENTAGE),
		},
	}),

	paymentReleased_buyer: (
		context: NotificationContext,
	): NotificationPayload => ({
		user_id: context.buyer_id!,
		title: "💰 Payment Released",
		body: `Your payment for "${context.listing_title}" has been released.

📊 Final Transaction:
• Gross Amount: $${context.amount?.toFixed(2)}
• Platform Fee (2.5%): $${(context.amount! * PLATFORM_FEE_PERCENTAGE).toFixed(2)}
• Seller Received: $${(context.amount! * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)}

✅ Transaction complete. Thank you for using our platform!`,
		priority: "normal",
		metadata: {
			order_id: context.order_id,
			listing_id: context.listing_id,
			amount: context.amount,
			platform_fee: context.amount! * PLATFORM_FEE_PERCENTAGE,
			seller_payout: context.amount! * (1 - PLATFORM_FEE_PERCENTAGE),
		},
	}),

	paymentReceived_seller: (
		context: NotificationContext,
	): NotificationPayload => ({
		user_id: context.seller_id!,
		title: "💰 Payment Received",
		body: `You received payment for "${context.listing_title}".

📊 Payout Breakdown:
• Gross Sale: $${context.amount?.toFixed(2)}
• Platform Fee (2.5%): -$${(context.amount! * PLATFORM_FEE_PERCENTAGE).toFixed(2)}
• Net Payout: +$${(context.amount! * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)}

✅ $${(context.amount! * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)} has been credited to your wallet.`,
		priority: "normal",
		metadata: {
			order_id: context.order_id,
			listing_id: context.listing_id,
			amount: context.amount,
			platform_fee: context.amount! * PLATFORM_FEE_PERCENTAGE,
			seller_payout: context.amount! * (1 - PLATFORM_FEE_PERCENTAGE),
		},
	}),

	// ─── Communication ──────────────────────────────────────────

	newMessage: (context: NotificationContext): NotificationPayload => ({
		user_id: context.seller_id!,
		title: "💬 New Message",
		body: `${context.buyer_name} sent you a message regarding "${context.listing_title}".`,
		priority: "high",
		metadata: { listing_id: context.listing_id },
	}),

	// ─── Reviews ─────────────────────────────────────────────────

	newReview_seller: (context: NotificationContext): NotificationPayload => ({
		user_id: context.seller_id!,
		title: "⭐ New Review",
		body: `${context.buyer_name} left a review on your asset "${context.listing_title}".`,
		priority: "normal",
		metadata: { listing_id: context.listing_id },
	}),

	// ─── Reminders ──────────────────────────────────────────────

	reminderPendingDelivery_seller: (
		context: NotificationContext,
	): NotificationPayload => ({
		user_id: context.seller_id!,
		title: "⏰ Pending Delivery Reminder",
		body: `You haven't delivered "${context.listing_title}" yet.

📊 Transaction: $${context.amount?.toFixed(2)} ($${(context.amount! * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)} after platform fee)

⚠️ Please deliver within 24 hours to receive payment.`,
		priority: "high",
		metadata: {
			order_id: context.order_id,
			listing_id: context.listing_id,
			amount: context.amount,
			platform_fee: context.amount! * PLATFORM_FEE_PERCENTAGE,
			seller_payout: context.amount! * (1 - PLATFORM_FEE_PERCENTAGE),
		},
	}),

	reminderPendingConfirmation_buyer: (
		context: NotificationContext,
	): NotificationPayload => ({
		user_id: context.buyer_id!,
		title: "⏰ Pending Confirmation Reminder",
		body: `You haven't confirmed receipt of "${context.listing_title}".

📊 Purchase Details:
• Amount: $${context.amount?.toFixed(2)}
• Platform Fee (2.5%): $${(context.amount! * PLATFORM_FEE_PERCENTAGE).toFixed(2)}
• Seller Payout: $${(context.amount! * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)}

🔍 Please check your locker to confirm delivery.`,
		priority: "normal",
		metadata: {
			order_id: context.order_id,
			listing_id: context.listing_id,
			amount: context.amount,
			platform_fee: context.amount! * PLATFORM_FEE_PERCENTAGE,
			seller_payout: context.amount! * (1 - PLATFORM_FEE_PERCENTAGE),
		},
	}),

	escrowAutoReleased_buyer: (
		context: NotificationContext,
	): NotificationPayload => ({
		user_id: context.buyer_id!,
		title: "🔓 Escrow Auto-Released",
		body: `Funds for "${context.listing_title}" have been automatically released to the seller.

📊 Transaction Summary:
• Purchase Amount: $${context.amount?.toFixed(2)}
• Platform Fee (2.5%): $${(context.amount! * PLATFORM_FEE_PERCENTAGE).toFixed(2)}
• Seller Payout: $${(context.amount! * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)}

ℹ️ This is because you didn't confirm receipt within the time limit.`,
		priority: "high",
		metadata: {
			order_id: context.order_id,
			listing_id: context.listing_id,
			amount: context.amount,
			platform_fee: context.amount! * PLATFORM_FEE_PERCENTAGE,
			seller_payout: context.amount! * (1 - PLATFORM_FEE_PERCENTAGE),
		},
	}),

	escrowAutoReleased_seller: (
		context: NotificationContext,
	): NotificationPayload => ({
		user_id: context.seller_id!,
		title: "🔓 Escrow Auto-Released",
		body: `Funds for "${context.listing_title}" have been automatically released to your wallet.

📊 Payout Breakdown:
• Gross Sale: $${context.amount?.toFixed(2)}
• Platform Fee (2.5%): -$${(context.amount! * PLATFORM_FEE_PERCENTAGE).toFixed(2)}
• Net Payout: +$${(context.amount! * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)}

✅ $${(context.amount! * (1 - PLATFORM_FEE_PERCENTAGE)).toFixed(2)} credited to your wallet.`,
		priority: "high",
		metadata: {
			order_id: context.order_id,
			listing_id: context.listing_id,
			amount: context.amount,
			platform_fee: context.amount! * PLATFORM_FEE_PERCENTAGE,
			seller_payout: context.amount! * (1 - PLATFORM_FEE_PERCENTAGE),
		},
	}),

	// ─── Listings ────────────────────────────────────────────────

	listingApproved: (context: NotificationContext): NotificationPayload => ({
		user_id: context.seller_id!,
		title: "✅ Listing Approved",
		body: `Your listing "${context.listing_title}" has been approved and is now live.

📊 Fee Structure: A 2.5% platform fee applies to all successful sales.`,
		priority: "normal",
		metadata: { listing_id: context.listing_id },
	}),

	listingExpired: (context: NotificationContext): NotificationPayload => ({
		user_id: context.seller_id!,
		title: "⏰ Listing Expired",
		body: `Your listing "${context.listing_title}" has expired. Please renew to keep it active.

ℹ️ Remember: A 2.5% platform fee applies to all successful sales.`,
		priority: "low",
		metadata: { listing_id: context.listing_id },
	}),
};

// ============================================================
// HELPER: Send notifications for an event
// ============================================================

export async function sendNotifications(
	event: NotificationEvent,
	context: NotificationContext,
): Promise<void> {
	const service = new NotificationService();
	const templates = NotificationTemplates;

	let payloads: NotificationPayload[] = [];

	switch (event) {
		case "purchase_created":
			payloads = [
				templates.purchaseCreated_buyer(context),
				templates.purchaseCreated_seller(context),
			];
			break;

		case "receipt_confirmed":
			payloads = [
				templates.receiptConfirmed_buyer(context),
				templates.receiptConfirmed_seller(context),
				templates.paymentReleased_buyer(context),
				templates.paymentReceived_seller(context),
			];
			break;

		case "new_message":
			payloads = [templates.newMessage(context)];
			break;

		case "new_review":
			payloads = [templates.newReview_seller(context)];
			break;

		case "reminder_pending_delivery":
			payloads = [templates.reminderPendingDelivery_seller(context)];
			break;

		case "escrow_auto_released":
			payloads = [
				templates.escrowAutoReleased_buyer(context),
				templates.escrowAutoReleased_seller(context),
			];
			break;

		case "listing_approved":
			payloads = [templates.listingApproved(context)];
			break;

		default:
			console.warn(`⚠️ [Notification] Unknown event: ${event}`);
			return;
	}

	await service.sendToMany(payloads);
}
