// app/api/st/t-a/animations/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── GET: List animations ──────────────────────────────────────────────
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
		const type = url.searchParams.get("type");
		const templateId = url.searchParams.get("templateId");
		const search = url.searchParams.get("search");
		const page = parseInt(url.searchParams.get("page") || "1");
		const limit = parseInt(url.searchParams.get("limit") || "12");
		const offset = (page - 1) * limit;

		let query = supabase
			.from("ta_animations")
			.select("*", { count: "exact" })
			.eq("user_id", user.id)
			.order("created_at", { ascending: false });

		if (type && type !== "all") {
			query = query.eq("type", type);
		}

		if (templateId) {
			query = query.eq("template_id", templateId);
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
			animations: data,
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

// ─── POST: Create animation ────────────────────────────────────────────
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
				{ error: "Animation name is required" },
				{ status: 400 },
			);
		}

		const validTypes = ["fade", "slide", "bounce", "rotate", "scale", "custom"];
		if (!validTypes.includes(body.type)) {
			return NextResponse.json(
				{ error: "Invalid animation type" },
				{ status: 400 },
			);
		}

		const validTriggers = ["load", "scroll", "hover", "click"];
		if (body.trigger && !validTriggers.includes(body.trigger)) {
			return NextResponse.json({ error: "Invalid trigger" }, { status: 400 });
		}

		// ─── Create animation ──────────────────────────────────────────────
		const { data: animation, error } = await supabase
			.from("ta_animations")
			.insert({
				user_id: user.id,
				template_id: body.template_id || null,
				name: body.name.trim(),
				description: body.description || null,
				type: body.type,
				duration: body.duration || 300,
				delay: body.delay || 0,
				easing: body.easing || "ease-in-out",
				direction: body.direction || "normal",
				iteration_count: body.iteration_count || "1",
				fill_mode: body.fill_mode || "forwards",
				trigger: body.trigger || "load",
				properties: body.properties || {},
				keyframes: body.keyframes || {},
				css_code: body.css_code || null,
				is_preset: false,
			})
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ animation }, { status: 201 });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
