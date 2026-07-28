// lib/st/services/publish-to-market.service.ts
import { createClient } from "@/lib/supabase/server";

export interface PublishResult {
	success: boolean;
	listingId?: string;
	needStore?: boolean;
	needVerification?: boolean;
	error?: string;
}

export async function publishToGlobalMarket(
	templateId: string,
	userId: string,
): Promise<PublishResult> {
	const supabase = await createClient();

	try {
		// ─── 1. Get the template ──────────────────────────────────────────
		const { data: template, error: templateError } = await supabase
			.from("ta_templates")
			.select("*")
			.eq("id", templateId)
			.eq("user_id", userId)
			.single();

		if (templateError || !template) {
			return { success: false, error: "Template not found" };
		}

		if (!template.is_published) {
			return { success: false, error: "Template must be published first" };
		}

		if (!template.is_public) {
			return {
				success: false,
				error: "Template must be public to list on Global Market",
			};
		}

		// ─── 2. Check if user has a store ────────────────────────────────
		const { data: store, error: storeError } = await supabase
			.from("global_market_stores")
			.select("id, is_verified")
			.eq("user_id", userId)
			.maybeSingle();

		if (storeError) {
			return { success: false, error: "Failed to check store status" };
		}

		if (!store) {
			return {
				success: false,
				needStore: true,
				error: "You need to create a store first",
			};
		}

		if (!store.is_verified) {
			return {
				success: false,
				needVerification: true,
				error: "Your store needs to be verified before listing assets",
			};
		}

		// ─── 3. Check if template is already listed ──────────────────────
		const { data: existingListings, error: listCheckError } = await supabase
			.from("market_listings")
			.select("id")
			.eq("seller_id", userId)
			.eq("status", "active")
			.order("created_at", { ascending: false })
			.limit(1);

		// ─── 4. Get user username for the path ────────────────────────────
		const { data: profile } = await supabase
			.from("profiles")
			.select("username")
			.eq("id", userId)
			.single();

		const username = profile?.username || "user";

		// ─── 5. Create listing in global market ──────────────────────────
		const { data: listing, error: listingError } = await supabase
			.from("market_listings")
			.insert({
				seller_id: userId,
				store_id: store.id,
				title: template.name,
				description:
					template.description ||
					"Template created with Nu-vora | Elite Home",
				display_pic_url: template.preview_image || null,
				price: 0,
				tab_category: "digital_tool",
				product_sale_type: "reusable",
				status: "active",
				encrypted_asset_payload: JSON.stringify({
					template_id: template.id,
					template_name: template.name,
					html_code: template.html_code,
					css_code: template.css_code,
					js_code: template.js_code,
					category: template.category,
					type: "template",
					exported_at: new Date().toISOString(),
				}),
			})
			.select()
			.single();

		if (listingError) {
			return {
				success: false,
				error: `Failed to create listing: ${listingError.message}`,
			};
		}

		return {
			success: true,
			listingId: listing.id,
		};
	} catch (error: any) {
		console.error("Publish to market error:", error);
		return { success: false, error: error.message || "Unknown error occurred" };
	}
}

// ─── NEW: Unpublish from Global Market ──────────────────────────────────
export async function unpublishFromGlobalMarket(
	listingId: string,
	userId: string,
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();

	try {
		const { data: listing, error: checkError } = await supabase
			.from("market_listings")
			.select("seller_id")
			.eq("id", listingId)
			.single();

		if (checkError || !listing) {
			return { success: false, error: "Listing not found" };
		}

		if (listing.seller_id !== userId) {
			return { success: false, error: "Access denied" };
		}

		const { error } = await supabase
			.from("market_listings")
			.update({ status: "inactive" })
			.eq("id", listingId);

		if (error) {
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

// ─── NEW: Check if user has verified store ──────────────────────────────
export async function getUserStoreStatus(userId: string): Promise<{
	hasStore: boolean;
	isVerified: boolean;
	storeId?: string;
	username?: string;
}> {
	const supabase = await createClient();

	try {
		// Get user username
		const { data: profile } = await supabase
			.from("profiles")
			.select("username")
			.eq("id", userId)
			.single();

		const username = profile?.username || "user";

		// Get store
		const { data: store } = await supabase
			.from("global_market_stores")
			.select("id, is_verified")
			.eq("user_id", userId)
			.maybeSingle();

		if (!store) {
			return { hasStore: false, isVerified: false, username };
		}

		return {
			hasStore: true,
			isVerified: store.is_verified || false,
			storeId: store.id,
			username,
		};
	} catch (error) {
		return { hasStore: false, isVerified: false };
	}
}
