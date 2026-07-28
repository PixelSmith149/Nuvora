// app/api/st/t-a/publish-to-market/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { templateId } = body;

		if (!templateId) {
			return NextResponse.json(
				{ error: "Template ID is required" },
				{ status: 400 },
			);
		}

		// ─── 1. Get the template ──────────────────────────────────────────
		const { data: template, error: templateError } = await supabase
			.from("ta_templates")
			.select("*")
			.eq("id", templateId)
			.eq("user_id", user.id)
			.single();

		if (templateError || !template) {
			return NextResponse.json(
				{ error: "Template not found" },
				{ status: 404 },
			);
		}

		if (!template.is_published) {
			return NextResponse.json(
				{ error: "Template must be published first" },
				{ status: 400 },
			);
		}

		if (!template.is_public) {
			return NextResponse.json(
				{ error: "Template must be public to list on Global Market" },
				{ status: 400 },
			);
		}

		// ─── 2. Check if user has a store ────────────────────────────────
		const { data: store, error: storeError } = await supabase
			.from("global_market_stores")
			.select("id, is_verified")
			.eq("user_id", user.id)
			.maybeSingle();

		if (storeError) {
			return NextResponse.json(
				{ error: "Failed to check store status" },
				{ status: 500 },
			);
		}

		if (!store) {
			return NextResponse.json({
				success: false,
				needStore: true,
				error: "You need to create a store first",
			});
		}

		if (!store.is_verified) {
			return NextResponse.json({
				success: false,
				needVerification: true,
				error: "Your store needs to be verified before listing assets",
			});
		}

		// ─── 3. Get user username ─────────────────────────────────────────
		const { data: profile } = await supabase
			.from("profiles")
			.select("username")
			.eq("id", user.id)
			.single();

		const username = profile?.username || "user";

		// ─── 4. Create listing in global market ──────────────────────────
		const { data: listing, error: listingError } = await supabase
			.from("market_listings")
			.insert({
				seller_id: user.id,
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
			return NextResponse.json({
				success: false,
				error: `Failed to create listing: ${listingError.message}`,
			});
		}

		return NextResponse.json({
			success: true,
			listingId: listing.id,
		});
	} catch (error: any) {
		console.error("Publish to market error:", error);
		return NextResponse.json({
			success: false,
			error: error.message || "Unknown error occurred",
		});
	}
}
