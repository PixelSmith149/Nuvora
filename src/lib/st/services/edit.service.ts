// lib/st/services/edit.service.ts

import { EDITOR_SYSTEM_PROMPT } from "@/lib/st/prompts/editor-prompt";
import { getAIService } from "@/lib/st/services/ai.service";
import type { SiteEdit } from "@/lib/st/types";
import { createClient } from "@/lib/supabase/server";

export async function saveSiteEdit(
	siteId: string,
	userId: string,
	section: string,
	newContent: string,
	editType: "text" | "color" | "layout",
	oldContent?: string,
): Promise<SiteEdit> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("site_edits")
		.insert({
			site_id: siteId,
			user_id: userId,
			section,
			old_content: oldContent || null,
			new_content: newContent,
			edit_type: editType,
		})
		.select()
		.single();

	if (error) throw new Error(`Failed to save edit: ${error.message}`);
	return data as SiteEdit;
}

export async function getSiteEdits(siteId: string): Promise<SiteEdit[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("site_edits")
		.select("*")
		.eq("site_id", siteId)
		.order("created_at", { ascending: false });

	if (error) throw new Error(`Failed to fetch edits: ${error.message}`);
	return data as SiteEdit[];
}

export async function applyEditToHtml(
	htmlCode: string,
	section: string,
	newContent: string,
): Promise<string> {
	const ai = getAIService();

	const systemPrompt = EDITOR_SYSTEM_PROMPT.replace(
		/{section}/g,
		section,
	).replace(/{current_html}/g, htmlCode);

	try {
		const result = await ai.generateEdit(
			systemPrompt,
			`Update the ${section} section with: ${newContent}`,
			{
				maxTokens: 4096,
				temperature: 0.2,
			},
		);

		// If the AI returns a valid result, use it
		if (result && result.length > 0) {
			return result;
		}

		// Fallback: simple string replacement
		const sectionRegex = new RegExp(
			`<section[^>]*class="[^"]*${section}[^"]*"[^>]*>([\\s\\S]*?)<\\/section>`,
			"i",
		);
		const match = htmlCode.match(sectionRegex);
		if (match) {
			return htmlCode.replace(
				sectionRegex,
				`<section class="${section}">${newContent}</section>`,
			);
		}

		return htmlCode;
	} catch (error) {
		console.error("Edit error:", error);
		return htmlCode;
	}
}
