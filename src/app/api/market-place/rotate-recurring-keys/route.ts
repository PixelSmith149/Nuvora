import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 🔒 Use standard Next.js Route Handlers config options instead of manual OPTIONS handling
export const dynamic = "force-dynamic";

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
		// 🎯 Use your server configuration client loaded with service role permissions
		const supabase = await createClient();

		// Find all recurring keys whose rotation trigger window has elapsed
		const now = new Date().toISOString();
		const { data: dueKeys, error: fetchError } = await supabase
			.from("recurring_product_keys")
			.select("id, listing_id, management_key")
			.not("next_rotation_trigger", "is", null)
			.lte("next_rotation_trigger", now);

		if (fetchError) {
			return NextResponse.json(
				{ success: false, error: fetchError.message },
				{ status: 500 },
			);
		}

		if (!dueKeys || dueKeys.length === 0) {
			return NextResponse.json({ success: true, rotated: 0 }, { status: 200 });
		}

		let rotatedCount = 0;

		// Process rotations sequentially to guarantee transactional delivery per node
		for (const keyRow of dueKeys) {
			const newKey = generateSecurePassword();
			// Set the next window threshold (30 minutes ahead)
			const nextTrigger = new Date(Date.now() + 30 * 60 * 1000).toISOString();

			const { error: updateError } = await supabase
				.from("recurring_product_keys")
				.update({
					management_key: newKey,
					next_rotation_trigger: nextTrigger,
					updated_at: now,
				})
				.eq("id", keyRow.id);

			if (updateError) {
				console.error(
					`Failed to rotate key record node ID ${keyRow.id}:`,
					updateError,
				);
				continue; // Skip alerting for this node if the database update failed
			}

			// Fetch the respective listing to target the account seller profile
			const { data: listing } = await supabase
				.from("market_listings")
				.select("seller_id, title")
				.eq("id", keyRow.listing_id)
				.single();

			if (listing?.seller_id) {
				// Dispatch high-priority warning message block to user dashboard inbox
				await supabase.from("market_inbox_messages").insert({
					user_id: listing.seller_id,
					priority: "high",
					title: "Master Key Rotated",
					body: `The management key for "${listing.title}" has been automatically rotated. Your new master key is: ${newKey}`,
					is_read: false,
				});
			}

			rotatedCount++;
		}

		return NextResponse.json(
			{ success: true, rotated: rotatedCount },
			{ status: 200 },
		);
	} catch (err) {
		return NextResponse.json(
			{
				success: false,
				error:
					err instanceof Error
						? err.message
						: "Fatal platform rotation thread execution failure",
			},
			{ status: 500 },
		);
	}
}
