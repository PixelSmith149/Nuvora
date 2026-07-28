// lib/st/services/export.service.ts

import JSZip from "jszip";
import { createClient } from "@/lib/supabase/server";

// ─── Existing: Export template as HTML ──────────────────────────────────
export async function exportTemplateAsHTML(
	templateId: string,
	userId: string,
): Promise<string> {
	const supabase = await createClient();

	const { data: template, error } = await supabase
		.from("ta_templates")
		.select("html_code, css_code, js_code, name")
		.eq("id", templateId)
		.eq("user_id", userId)
		.single();

	if (error || !template) {
		throw new Error("Template not found");
	}

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name || "Template"}</title>
  <style>${template.css_code || ""}</style>
</head>
<body>
  ${template.html_code || ""}
  <script>${template.js_code || ""}</script>
</body>
</html>`;
}

// ─── Existing: Export animation as CSS ──────────────────────────────────
export async function exportAnimationAsCSS(
	animationId: string,
	userId: string,
): Promise<string> {
	const supabase = await createClient();

	const { data: animation, error } = await supabase
		.from("ta_animations")
		.select(
			"css_code, name, type, duration, easing, keyframes, delay, fill_mode, iteration_count, direction",
		)
		.eq("id", animationId)
		.eq("user_id", userId)
		.single();

	if (error || !animation) {
		throw new Error("Animation not found");
	}

	if (animation.css_code) {
		return animation.css_code;
	}

	// Generate CSS from keyframes
	const keyframeName = animation.name.toLowerCase().replace(/\s/g, "-");
	const keyframeStyles = Object.entries(animation.keyframes || {})
		.map(([key, value]) => {
			const props = Object.entries(value as Record<string, string>)
				.map(([prop, val]) => `${prop}: ${val};`)
				.join(" ");
			return `  ${key} { ${props} }`;
		})
		.join("\n");

	return `/* Animation: ${animation.name} */
@keyframes ${keyframeName} {
${keyframeStyles}
}

.animated-${keyframeName} {
  animation: ${keyframeName} ${animation.duration}ms ${animation.easing} ${animation.delay || 0}ms;
  animation-fill-mode: ${animation.fill_mode || "forwards"};
  animation-iteration-count: ${animation.iteration_count || "1"};
  animation-direction: ${animation.direction || "normal"};
}`;
}

// ─── NEW: Export template as ZIP ──────────────────────────────────────
export async function exportTemplateAsZip(
	templateId: string,
	userId: string,
): Promise<Buffer> {
	const supabase = await createClient();

	const { data: template, error } = await supabase
		.from("ta_templates")
		.select("*")
		.eq("id", templateId)
		.eq("user_id", userId)
		.single();

	if (error || !template) {
		throw new Error("Template not found");
	}

	const zip = new JSZip();

	// index.html
	zip.file(
		"index.html",
		`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  ${template.html_code || ""}
  <script src="script.js"></script>
</body>
</html>`,
	);

	// style.css
	zip.file("style.css", template.css_code || "");

	// script.js
	zip.file("script.js", template.js_code || "");

	// README.md
	zip.file(
		"README.md",
		`# ${template.name}

${template.description || "Template exported from Prime Boostage | Elite Home"}

## Files
- index.html - Main HTML file
- style.css - All styles
- script.js - JavaScript functionality

## Usage
Open index.html in your browser to view the template.

## Category
${template.category}

## Exported
${new Date().toISOString()}
`,
	);

	return zip.generateAsync({ type: "nodebuffer" });
}

// ─── NEW: Export animation as JSON ─────────────────────────────────────
export async function exportAnimationAsJSON(
	animationId: string,
	userId: string,
): Promise<object> {
	const supabase = await createClient();

	const { data: animation, error } = await supabase
		.from("ta_animations")
		.select("*")
		.eq("id", animationId)
		.eq("user_id", userId)
		.single();

	if (error || !animation) {
		throw new Error("Animation not found");
	}

	return animation;
}

// ─── NEW: Export template as JSON ──────────────────────────────────────
export async function exportTemplateAsJSON(
	templateId: string,
	userId: string,
): Promise<object> {
	const supabase = await createClient();

	const { data: template, error } = await supabase
		.from("ta_templates")
		.select("*")
		.eq("id", templateId)
		.eq("user_id", userId)
		.single();

	if (error || !template) {
		throw new Error("Template not found");
	}

	return template;
}

// ─── NEW: Log download ──────────────────────────────────────────────────
export async function logDownload(
	userId: string,
	templateId: string | null,
	animationId: string | null,
	format: "html" | "css" | "js" | "zip" | "json",
): Promise<void> {
	const supabase = await createClient();

	await supabase.from("ta_downloads").insert({
		user_id: userId,
		template_id: templateId,
		animation_id: animationId,
		format,
		downloaded_at: new Date().toISOString(),
	});
}
