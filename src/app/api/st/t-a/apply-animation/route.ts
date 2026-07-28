// app/api/st/t-a/apply-animation/route.ts

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

		if (!body.animationId) {
			return NextResponse.json(
				{ error: "Animation ID is required" },
				{ status: 400 },
			);
		}

		if (!body.templateId) {
			return NextResponse.json(
				{ error: "Template ID is required" },
				{ status: 400 },
			);
		}

		// ─── Get animation ──────────────────────────────────────────────────
		const { data: animation, error: animError } = await supabase
			.from("ta_animations")
			.select("*")
			.eq("id", body.animationId)
			.eq("user_id", user.id)
			.single();

		if (animError || !animation) {
			return NextResponse.json(
				{ error: "Animation not found" },
				{ status: 404 },
			);
		}

		// ─── Get template ────────────────────────────────────────────────────
		const { data: template, error: templateError } = await supabase
			.from("ta_templates")
			.select("css_code, html_code")
			.eq("id", body.templateId)
			.eq("user_id", user.id)
			.single();

		if (templateError || !template) {
			return NextResponse.json(
				{ error: "Template not found" },
				{ status: 404 },
			);
		}

		// ─── Apply animation to template ────────────────────────────────────
		// 1. Link animation to template
		const { error: linkError } = await supabase
			.from("ta_animations")
			.update({ template_id: body.templateId })
			.eq("id", body.animationId);

		if (linkError) {
			return NextResponse.json({ error: linkError.message }, { status: 500 });
		}

		// 2. Inject CSS into template (if animation has CSS code)
		let updatedCss = template.css_code || "";

		if (animation.css_code) {
			// Check if animation CSS is already injected
			const animationClassName = `.${animation.name.toLowerCase().replace(/\s/g, "-")}`;
			if (!updatedCss.includes(animationClassName)) {
				updatedCss = updatedCss + "\n\n" + animation.css_code;
			}
		} else if (
			animation.keyframes &&
			Object.keys(animation.keyframes).length > 0
		) {
			// Generate CSS from keyframes if no css_code exists
			const keyframeName = animation.name.toLowerCase().replace(/\s/g, "-");
			const keyframeStyles = Object.entries(animation.keyframes)
				.map(([key, value]) => {
					const props = Object.entries(value as Record<string, string>)
						.map(([prop, val]) => `${prop}: ${val};`)
						.join(" ");
					return `  ${key} { ${props} }`;
				})
				.join("\n");

			const generatedCss = `
@keyframes ${keyframeName} {
${keyframeStyles}
}

.animated-${keyframeName} {
  animation: ${keyframeName} ${animation.duration}ms ${animation.easing} ${animation.delay}ms;
  animation-fill-mode: ${animation.fill_mode || "forwards"};
  animation-iteration-count: ${animation.iteration_count || "1"};
  animation-direction: ${animation.direction || "normal"};
}
`;

			if (!updatedCss.includes(`@keyframes ${keyframeName}`)) {
				updatedCss = updatedCss + "\n\n" + generatedCss;
			}
		}

		// 3. Update template with new CSS
		const { error: updateError } = await supabase
			.from("ta_templates")
			.update({ css_code: updatedCss })
			.eq("id", body.templateId);

		if (updateError) {
			return NextResponse.json({ error: updateError.message }, { status: 500 });
		}

		return NextResponse.json({
			success: true,
			message: "Animation applied to template successfully!",
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
