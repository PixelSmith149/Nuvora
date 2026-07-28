// app/api/st/t-a/templates/[id]/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── GET: Get single template ──────────────────────────────────────────
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { data: template, error } = await supabase
			.from("ta_templates")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			return NextResponse.json(
				{ error: "Template not found" },
				{ status: 404 },
			);
		}

		// Check if user owns this template OR it's public
		if (template.user_id !== user.id && !template.is_public) {
			return NextResponse.json({ error: "Access denied" }, { status: 403 });
		}

		return NextResponse.json({ template });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// ─── PUT: Update template ──────────────────────────────────────────────
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

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
			.from("ta_templates")
			.select("user_id")
			.eq("id", id)
			.single();

		if (checkError || !existing) {
			return NextResponse.json(
				{ error: "Template not found" },
				{ status: 404 },
			);
		}

		if (existing.user_id !== user.id) {
			return NextResponse.json({ error: "Access denied" }, { status: 403 });
		}

		// ─── Update ──────────────────────────────────────────────────────────
		const { data: template, error } = await supabase
			.from("ta_templates")
			.update({
				name: body.name,
				description: body.description,
				category: body.category,
				preview_image: body.preview_image,
				html_code: body.html_code,
				css_code: body.css_code,
				js_code: body.js_code,
				settings: body.settings,
				is_published: body.is_published,
				is_public: body.is_public,
				tags: body.tags,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ template });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// ─── DELETE: Delete template ────────────────────────────────────────────
export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// ─── Verify ownership ──────────────────────────────────────────────
		const { data: existing, error: checkError } = await supabase
			.from("ta_templates")
			.select("user_id")
			.eq("id", id)
			.single();

		if (checkError || !existing) {
			return NextResponse.json(
				{ error: "Template not found" },
				{ status: 404 },
			);
		}

		if (existing.user_id !== user.id) {
			return NextResponse.json({ error: "Access denied" }, { status: 403 });
		}

		// ─── Delete related animations first ────────────────────────────────
		await supabase.from("ta_animations").delete().eq("template_id", id);

		// ─── Delete template ────────────────────────────────────────────────
		const { error } = await supabase.from("ta_templates").delete().eq("id", id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
