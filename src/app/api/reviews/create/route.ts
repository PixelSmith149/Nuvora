// app/api/reviews/create/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ✅ Add a simple in-memory lock (for serverless, use a better approach)
const processingReviews = new Set<string>();

export async function POST(req: NextRequest) {
	const supabase = await createClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await req.json();
		const { order_id, rating, review_text } = body;

		if (!order_id || !rating) {
			return NextResponse.json(
				{ error: "Order ID and rating required" },
				{ status: 400 },
			);
		}

		if (rating < 1 || rating > 5) {
			return NextResponse.json(
				{ error: "Rating must be between 1 and 5" },
				{ status: 400 },
			);
		}

		// ✅ Prevent duplicate processing
		const lockKey = `${order_id}-${user.id}`;
		if (processingReviews.has(lockKey)) {
			return NextResponse.json(
				{
					error: "Review already being processed",
					duplicate: true,
				},
				{ status: 429 },
			);
		}
		processingReviews.add(lockKey);

		// ─── Verify order belongs to buyer ──────────────────────
		const { data: order, error: orderError } = await supabase
			.from("global_market_orders")
			.select("*, market_listings(*)")
			.eq("id", order_id)
			.eq("buyer_id", user.id)
			.single();

		if (orderError || !order) {
			processingReviews.delete(lockKey);
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		if (order.status !== "completed") {
			processingReviews.delete(lockKey);
			return NextResponse.json(
				{ error: "Order must be completed to leave a review" },
				{ status: 400 },
			);
		}

		// ─── Check if review already exists ──────────────────────
		const { data: existingReview } = await supabase
			.from("asset_reviews")
			.select("id")
			.eq("order_id", order_id)
			.maybeSingle();

		if (existingReview) {
			processingReviews.delete(lockKey);
			return NextResponse.json(
				{
					error: "Review already exists for this order",
					exists: true,
				},
				{ status: 400 },
			);
		}

		// ─── Create review ───────────────────────────────────────
		const { data: review, error: reviewError } = await supabase
			.from("asset_reviews")
			.insert({
				order_id: order_id,
				buyer_id: user.id,
				seller_id: order.seller_id,
				listing_id: order.listing_id,
				rating: rating,
				review_text: review_text || null,
			})
			.select()
			.single();

		// ✅ Remove lock after processing
		processingReviews.delete(lockKey);

		if (reviewError) {
			console.error("Review creation error:", reviewError);
			return NextResponse.json(
				{ error: "Failed to create review" },
				{ status: 500 },
			);
		}

		// ─── Send notification to seller ─────────────────────────
		const { data: buyerProfile } = await supabase
			.from("profiles")
			.select("display_name, username")
			.eq("id", user.id)
			.single();

		const buyerName =
			buyerProfile?.display_name || buyerProfile?.username || "A buyer";

		await supabase.from("market_inbox_messages").insert({
			user_id: order.seller_id,
			title: "⭐ New Review Received",
			body: `${buyerName} left a ${rating}-star review on your asset "${order.market_listings?.title || "Unknown"}"`,
			priority: "default",
			is_read: false,
			created_at: new Date().toISOString(),
		});

		return NextResponse.json({ success: true, review });
	} catch (err: any) {
		console.error("Review API error:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
