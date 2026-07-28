// app/api/st/t-a/clone/route.ts

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

		if (!body.templateId) {
			return NextResponse.json(
				{ error: "Template ID is required" },
				{ status: 400 },
			);
		}

		// ─── Get source template ────────────────────────────────────────────
		const { data: source, error: sourceError } = await supabase
			.from("ta_templates")
			.select("*")
			.eq("id", body.templateId)
			.single();

		if (sourceError || !source) {
			return NextResponse.json(
				{ error: "Source template not found" },
				{ status: 404 },
			);
		}

		// Check if user can clone this template (own or public)
		if (source.user_id !== user.id && !source.is_public) {
			return NextResponse.json({ error: "Access denied" }, { status: 403 });
		}

		// ─── Prepare clone data ─────────────────────────────────────────────
		const cloneName = body.newName || `Copy of ${source.name}`;
		const cloneCategory = body.category || source.category;
		const cloneTags = body.tags || source.tags || [];

		// ─── Create cloned template ─────────────────────────────────────────
		const { data: clone, error: cloneError } = await supabase
			.from("ta_templates")
			.insert({
				user_id: user.id,
				name: cloneName,
				description: source.description,
				category: cloneCategory,
				type: "clone",
				preview_image: source.preview_image,
				html_code: source.html_code,
				css_code: source.css_code,
				js_code: source.js_code,
				settings: source.settings || {},
				is_published: body.publishImmediately || false,
				is_public: body.makePublic || false,
				tags: cloneTags,
				// Reset counts
				view_count: 0,
				clone_count: 0,
				download_count: 0,
			})
			.select()
			.single();

		if (cloneError) {
			return NextResponse.json({ error: cloneError.message }, { status: 500 });
		}

		// ─── Increment clone count on source ───────────────────────────────
		await supabase.rpc("increment_template_clones", {
			template_id: body.templateId,
		});

		// ─── If clone animations option is enabled ─────────────────────────
		if (body.cloneAnimations) {
			const { data: sourceAnimations } = await supabase
				.from("ta_animations")
				.select("*")
				.eq("template_id", body.templateId);

			if (sourceAnimations && sourceAnimations.length > 0) {
				for (const anim of sourceAnimations) {
					await supabase.from("ta_animations").insert({
						user_id: user.id,
						template_id: clone.id,
						name: anim.name,
						description: anim.description,
						type: anim.type,
						duration: anim.duration,
						delay: anim.delay,
						easing: anim.easing,
						direction: anim.direction,
						iteration_count: anim.iteration_count,
						fill_mode: anim.fill_mode,
						trigger: anim.trigger,
						properties: anim.properties,
						keyframes: anim.keyframes,
						css_code: anim.css_code,
						is_preset: false,
					});
				}
			}
		}

		return NextResponse.json({
			success: true,
			clone,
			message: "Template cloned successfully! Ready to customize.",
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
