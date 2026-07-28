// app/api/st/t-a/animations/[id]/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── GET: Get single animation ──────────────────────────────────────────
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }, // ← FIXED
) {
	try {
		const { id } = await params; // ← FIXED

		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { data: animation, error } = await supabase
			.from("ta_animations")
			.select("*")
			.eq("id", id) // ← FIXED: use id, not params.id
			.single();

		if (error) {
			return NextResponse.json(
				{ error: "Animation not found" },
				{ status: 404 },
			);
		}

		if (animation.user_id !== user.id) {
			return NextResponse.json({ error: "Access denied" }, { status: 403 });
		}

		return NextResponse.json({ animation });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// ─── PUT: Update animation ──────────────────────────────────────────────
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }, // ← FIXED
) {
	try {
		const { id } = await params; // ← FIXED

		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();

		// ─── Verify ownership ──────────────────────────────────────────────
		const { data: existing, error: checkError } = await supabase
			.from("ta_animations")
			.select("user_id")
			.eq("id", id) // ← FIXED
			.single();

		if (checkError || !existing) {
			return NextResponse.json(
				{ error: "Animation not found" },
				{ status: 404 },
			);
		}

		if (existing.user_id !== user.id) {
			return NextResponse.json({ error: "Access denied" }, { status: 403 });
		}

		// ─── Update ──────────────────────────────────────────────────────────
		const { data: animation, error } = await supabase
			.from("ta_animations")
			.update({
				name: body.name,
				description: body.description,
				type: body.type,
				duration: body.duration,
				delay: body.delay,
				easing: body.easing,
				direction: body.direction,
				iteration_count: body.iteration_count,
				fill_mode: body.fill_mode,
				trigger: body.trigger,
				properties: body.properties,
				keyframes: body.keyframes,
				css_code: body.css_code,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id) // ← FIXED
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ animation });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// ─── DELETE: Delete animation ────────────────────────────────────────────
export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }, // ← FIXED
) {
	try {
		const { id } = await params; // ← FIXED

		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// ─── Verify ownership ──────────────────────────────────────────────
		const { data: existing, error: checkError } = await supabase
			.from("ta_animations")
			.select("user_id")
			.eq("id", id) // ← FIXED
			.single();

		if (checkError || !existing) {
			return NextResponse.json(
				{ error: "Animation not found" },
				{ status: 404 },
			);
		}

		if (existing.user_id !== user.id) {
			return NextResponse.json({ error: "Access denied" }, { status: 403 });
		}

		// ─── Delete ──────────────────────────────────────────────────────────
		const { error } = await supabase
			.from("ta_animations")
			.delete()
			.eq("id", id); // ← FIXED

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
