// lib/st/services/animation.service.ts

import {
	type Animation,
	type AnimationPreset,
	AnimationTrigger,
	type AnimationType,
} from "@/lib/st/types/templates-animation";
import { createClient } from "@/lib/supabase/server";

// ─── Existing: Get user animations ──────────────────────────────────────
export async function getAnimations(userId: string): Promise<Animation[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ta_animations")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) throw new Error(`Failed to fetch animations: ${error.message}`);
	return data || [];
}

// ─── Existing: Get animation by ID ─────────────────────────────────────
export async function getAnimationById(id: string): Promise<Animation | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ta_animations")
		.select("*")
		.eq("id", id)
		.single();

	if (error) return null;
	return data;
}

// ─── Existing: Get animation presets ───────────────────────────────────
export async function getAnimationPresets(): Promise<AnimationPreset[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ta_animation_presets")
		.select("*")
		.order("category", { ascending: true });

	if (error)
		throw new Error(`Failed to fetch animation presets: ${error.message}`);
	return data || [];
}

// ─── Existing: Get presets by category ─────────────────────────────────
export async function getAnimationPresetsByCategory(
	category: string,
): Promise<AnimationPreset[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ta_animation_presets")
		.select("*")
		.eq("category", category)
		.order("name", { ascending: true });

	if (error)
		throw new Error(`Failed to fetch presets by category: ${error.message}`);
	return data || [];
}

// ─── Existing: Create animation ────────────────────────────────────────
export async function createAnimation(
	userId: string,
	data: Partial<Animation>,
): Promise<Animation> {
	const supabase = await createClient();

	const { data: animation, error } = await supabase
		.from("ta_animations")
		.insert({
			user_id: userId,
			template_id: data.template_id || null,
			name: data.name || "Untitled Animation",
			description: data.description || null,
			type: data.type || "fade",
			duration: data.duration || 300,
			delay: data.delay || 0,
			easing: data.easing || "ease-in-out",
			direction: data.direction || "normal",
			iteration_count: data.iteration_count || "1",
			fill_mode: data.fill_mode || "forwards",
			trigger: data.trigger || "load",
			properties: data.properties || {},
			keyframes: data.keyframes || {},
			css_code: data.css_code || null,
			is_preset: false,
		})
		.select()
		.single();

	if (error) throw new Error(`Failed to create animation: ${error.message}`);
	return animation;
}

// ─── Existing: Update animation ────────────────────────────────────────
export async function updateAnimation(
	id: string,
	userId: string,
	data: Partial<Animation>,
): Promise<Animation> {
	const supabase = await createClient();

	const { data: animation, error } = await supabase
		.from("ta_animations")
		.update({
			...data,
			updated_at: new Date().toISOString(),
		})
		.eq("id", id)
		.eq("user_id", userId)
		.select()
		.single();

	if (error) throw new Error(`Failed to update animation: ${error.message}`);
	return animation;
}

// ─── Existing: Delete animation ────────────────────────────────────────
export async function deleteAnimation(
	id: string,
	userId: string,
): Promise<void> {
	const supabase = await createClient();

	const { error } = await supabase
		.from("ta_animations")
		.delete()
		.eq("id", id)
		.eq("user_id", userId);

	if (error) throw new Error(`Failed to delete animation: ${error.message}`);
}

// ─── NEW: Get animations by template ───────────────────────────────────
export async function getAnimationsByTemplate(
	templateId: string,
	userId: string,
): Promise<Animation[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ta_animations")
		.select("*")
		.eq("template_id", templateId)
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error)
		throw new Error(
			`Failed to fetch animations for template: ${error.message}`,
		);
	return data || [];
}

// ─── NEW: Apply animation to template ──────────────────────────────────
export async function applyAnimationToTemplate(
	animationId: string,
	templateId: string,
	userId: string,
): Promise<{ success: boolean; message: string }> {
	const supabase = await createClient();

	// Get animation
	const { data: animation, error: animError } = await supabase
		.from("ta_animations")
		.select("*")
		.eq("id", animationId)
		.eq("user_id", userId)
		.single();

	if (animError || !animation) {
		throw new Error("Animation not found");
	}

	// Get template
	const { data: template, error: templateError } = await supabase
		.from("ta_templates")
		.select("css_code")
		.eq("id", templateId)
		.eq("user_id", userId)
		.single();

	if (templateError || !template) {
		throw new Error("Template not found");
	}

	// Link animation to template
	await supabase
		.from("ta_animations")
		.update({ template_id: templateId })
		.eq("id", animationId);

	// Inject CSS into template
	let updatedCss = template.css_code || "";

	if (animation.css_code) {
		const animationClassName = `.${animation.name.toLowerCase().replace(/\s/g, "-")}`;
		if (!updatedCss.includes(animationClassName)) {
			updatedCss = updatedCss + "\n\n" + animation.css_code;
		}
	} else if (
		animation.keyframes &&
		Object.keys(animation.keyframes).length > 0
	) {
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

	// Update template
	await supabase
		.from("ta_templates")
		.update({ css_code: updatedCss })
		.eq("id", templateId);

	return {
		success: true,
		message: "Animation applied to template successfully!",
	};
}

// ─── NEW: Create animation from preset ──────────────────────────────────
export async function createAnimationFromPreset(
	userId: string,
	presetId: string,
	templateId?: string,
	customName?: string,
): Promise<Animation> {
	const supabase = await createClient();

	// Get preset
	const { data: preset, error: presetError } = await supabase
		.from("ta_animation_presets")
		.select("*")
		.eq("id", presetId)
		.single();

	if (presetError || !preset) {
		throw new Error("Preset not found");
	}

	// Create animation from preset
	const { data: animation, error } = await supabase
		.from("ta_animations")
		.insert({
			user_id: userId,
			template_id: templateId || null,
			name: customName || preset.name,
			description: preset.description,
			type: preset.type as AnimationType,
			duration: preset.duration,
			easing: preset.easing,
			properties: preset.properties,
			keyframes: preset.keyframes,
			css_code: preset.css_code,
			is_preset: false,
			// Default values
			delay: 0,
			direction: "normal",
			iteration_count: "1",
			fill_mode: "forwards",
			trigger: "load",
		})
		.select()
		.single();

	if (error)
		throw new Error(`Failed to create animation from preset: ${error.message}`);
	return animation;
}

// ─── NEW: Get animation stats ───────────────────────────────────────────
export async function getAnimationStats(userId: string): Promise<{
	total: number;
	byType: Record<string, number>;
	byTrigger: Record<string, number>;
}> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ta_animations")
		.select("type, trigger")
		.eq("user_id", userId);

	if (error)
		throw new Error(`Failed to fetch animation stats: ${error.message}`);

	const byType: Record<string, number> = {};
	const byTrigger: Record<string, number> = {};

	data.forEach((anim: any) => {
		byType[anim.type] = (byType[anim.type] || 0) + 1;
		byTrigger[anim.trigger] = (byTrigger[anim.trigger] || 0) + 1;
	});

	return {
		total: data.length,
		byType,
		byTrigger,
	};
}
