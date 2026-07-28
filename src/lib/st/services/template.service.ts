// lib/st/services/template.service.ts

import type {
	Template,
	TemplateCategory,
} from "@/lib/st/types/templates-animation";
import { createClient } from "@/lib/supabase/server";

// ─── Existing: Get user templates ──────────────────────────────────────
export async function getTemplates(userId: string): Promise<Template[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ta_templates")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) throw new Error(`Failed to fetch templates: ${error.message}`);
	return data || [];
}

// ─── Existing: Get public templates ────────────────────────────────────
export async function getPublicTemplates(
	page: number = 1,
	limit: number = 12,
	category?: string,
	search?: string,
): Promise<{ templates: Template[]; total: number }> {
	const supabase = await createClient();
	const offset = (page - 1) * limit;

	let query = supabase
		.from("ta_templates")
		.select("*", { count: "exact" })
		.eq("is_public", true)
		.eq("is_published", true)
		.order("view_count", { ascending: false });

	if (category && category !== "all") {
		query = query.eq("category", category);
	}

	if (search) {
		query = query.ilike("name", `%${search}%`);
	}

	const { data, error, count } = await query.range(offset, offset + limit - 1);

	if (error)
		throw new Error(`Failed to fetch public templates: ${error.message}`);
	return { templates: data || [], total: count || 0 };
}

// ─── Existing: Get template by ID ──────────────────────────────────────
export async function getTemplateById(id: string): Promise<Template | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ta_templates")
		.select("*")
		.eq("id", id)
		.single();

	if (error) return null;
	return data;
}

// ─── Existing: Create template ─────────────────────────────────────────
export async function createTemplate(
	userId: string,
	data: Partial<Template>,
): Promise<Template> {
	const supabase = await createClient();

	const { data: template, error } = await supabase
		.from("ta_templates")
		.insert({
			user_id: userId,
			name: data.name || "Untitled Template",
			description: data.description || null,
			category: data.category || "business",
			type: data.type || "custom",
			preview_image: data.preview_image || null,
			html_code: data.html_code || null,
			css_code: data.css_code || null,
			js_code: data.js_code || null,
			settings: data.settings || {},
			is_published: data.is_published || false,
			is_public: data.is_public || false,
			tags: data.tags || [],
		})
		.select()
		.single();

	if (error) throw new Error(`Failed to create template: ${error.message}`);
	return template;
}

// ─── Existing: Update template ─────────────────────────────────────────
export async function updateTemplate(
	id: string,
	userId: string,
	data: Partial<Template>,
): Promise<Template> {
	const supabase = await createClient();

	const { data: template, error } = await supabase
		.from("ta_templates")
		.update({
			...data,
			updated_at: new Date().toISOString(),
		})
		.eq("id", id)
		.eq("user_id", userId)
		.select()
		.single();

	if (error) throw new Error(`Failed to update template: ${error.message}`);
	return template;
}

// ─── Existing: Delete template ─────────────────────────────────────────
export async function deleteTemplate(
	id: string,
	userId: string,
): Promise<void> {
	const supabase = await createClient();

	// Delete related animations first
	await supabase.from("ta_animations").delete().eq("template_id", id);

	const { error } = await supabase
		.from("ta_templates")
		.delete()
		.eq("id", id)
		.eq("user_id", userId);

	if (error) throw new Error(`Failed to delete template: ${error.message}`);
}

// ─── Existing: Increment view count ────────────────────────────────────
export async function incrementTemplateView(id: string): Promise<void> {
	const supabase = await createClient();
	await supabase.rpc("increment_template_views", { template_id: id });
}

// ─── NEW: Clone template with config ──────────────────────────────────
export async function cloneTemplate(
	userId: string,
	templateId: string,
	config: {
		newName: string;
		category: TemplateCategory;
		tags: string[];
		makePublic: boolean;
		publishImmediately: boolean;
		cloneAnimations: boolean;
	},
): Promise<Template> {
	const supabase = await createClient();

	// Get source template
	const { data: source, error: sourceError } = await supabase
		.from("ta_templates")
		.select("*")
		.eq("id", templateId)
		.single();

	if (sourceError || !source) {
		throw new Error("Source template not found");
	}

	// Create clone
	const { data: clone, error: cloneError } = await supabase
		.from("ta_templates")
		.insert({
			user_id: userId,
			name: config.newName,
			description: source.description,
			category: config.category,
			type: "clone",
			preview_image: source.preview_image,
			html_code: source.html_code,
			css_code: source.css_code,
			js_code: source.js_code,
			settings: source.settings || {},
			is_published: config.publishImmediately,
			is_public: config.makePublic,
			tags: config.tags,
			view_count: 0,
			clone_count: 0,
			download_count: 0,
		})
		.select()
		.single();

	if (cloneError) {
		throw new Error(`Failed to clone template: ${cloneError.message}`);
	}

	// Increment clone count on source
	await supabase.rpc("increment_template_clones", { template_id: templateId });

	// Clone animations if requested
	if (config.cloneAnimations) {
		const { data: sourceAnimations } = await supabase
			.from("ta_animations")
			.select("*")
			.eq("template_id", templateId);

		if (sourceAnimations && sourceAnimations.length > 0) {
			for (const anim of sourceAnimations) {
				await supabase.from("ta_animations").insert({
					user_id: userId,
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

	return clone;
}

// ─── NEW: Get templates by category ────────────────────────────────────
export async function getTemplatesByCategory(
	userId: string,
	category: TemplateCategory,
): Promise<Template[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ta_templates")
		.select("*")
		.eq("user_id", userId)
		.eq("category", category)
		.order("created_at", { ascending: false });

	if (error)
		throw new Error(`Failed to fetch templates by category: ${error.message}`);
	return data || [];
}

// ─── NEW: Get template stats ───────────────────────────────────────────
export async function getTemplateStats(userId: string): Promise<{
	total: number;
	published: number;
	drafts: number;
	public: number;
}> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ta_templates")
		.select("is_published, is_public")
		.eq("user_id", userId);

	if (error)
		throw new Error(`Failed to fetch template stats: ${error.message}`);

	return {
		total: data.length,
		published: data.filter((t: any) => t.is_published).length,
		drafts: data.filter((t: any) => !t.is_published).length,
		public: data.filter((t: any) => t.is_public).length,
	};
}
