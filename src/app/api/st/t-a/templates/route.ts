// app/api/st/t-a/templates/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── GET: List templates ──────────────────────────────────────────────
export async function GET(request: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const url = new URL(request.url);
		const category = url.searchParams.get("category");
		const search = url.searchParams.get("search");
		const page = parseInt(url.searchParams.get("page") || "1");
		const limit = parseInt(url.searchParams.get("limit") || "12");
		const offset = (page - 1) * limit;

		let query = supabase
			.from("ta_templates")
			.select("*", { count: "exact" })
			.eq("user_id", user.id)
			.order("created_at", { ascending: false });

		if (category && category !== "all") {
			query = query.eq("category", category);
		}

		if (search) {
			query = query.ilike("name", `%${search}%`);
		}

		const { data, error, count } = await query.range(
			offset,
			offset + limit - 1,
		);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({
			templates: data,
			pagination: {
				page,
				limit,
				total: count || 0,
				totalPages: count ? Math.ceil(count / limit) : 0,
			},
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// ─── POST: Create template ────────────────────────────────────────────
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

		// ─── Validation ──────────────────────────────────────────────────────
		if (!body.name || body.name.trim().length === 0) {
			return NextResponse.json(
				{ error: "Template name is required" },
				{ status: 400 },
			);
		}

		if (!body.category) {
			return NextResponse.json(
				{ error: "Category is required" },
				{ status: 400 },
			);
		}

		const validCategories = [
			"business",
			"ecommerce",
			"portfolio",
			"restaurant",
			"healthcare",
			"education",
			"realestate",
			"finance",
			"travel",
			"entertainment",
			"marketplace",
			"dashboard",
			"landing",
			"blog",
			"booking",
			"social",
			"ai",
			"mobileapp",
			"email",
			"presentation",
			"document",
			"marketing",
			"cms",
			"industry",
			"internal",
			"authentication",
			"web3",
			"nonprofit",
		];

		if (!validCategories.includes(body.category)) {
			return NextResponse.json({ error: "Invalid category" }, { status: 400 });
		}

		// ─── Create template ────────────────────────────────────────────────
		const { data: template, error } = await supabase
			.from("ta_templates")
			.insert({
				user_id: user.id,
				name: body.name.trim(),
				description: body.description || null,
				category: body.category,
				type: body.type || "custom",
				preview_image: body.preview_image || null,
				html_code: body.html_code || null,
				css_code: body.css_code || null,
				js_code: body.js_code || null,
				settings: body.settings || {},
				is_published: body.is_published || false,
				is_public: body.is_public || false,
				tags: body.tags || [],
			})
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ template }, { status: 201 });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
