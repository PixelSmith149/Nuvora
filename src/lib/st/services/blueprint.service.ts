// lib/st/services/blueprint.service.ts

import type { SiteBlueprint } from "@/lib/st/types";
import { REQUIRED_BLUEPRINT_FIELDS } from "@/lib/st/types";

/**
 * Normalize any raw object coming from the Planner into a clean SiteBlueprint.
 * Fills safe defaults and guarantees required fields.
 */
export function normalizeBlueprint(
	raw: any,
	fallbackName = "My Website",
): SiteBlueprint {
	if (!raw || typeof raw !== "object") {
		return {
			business_type: "general",
			brand_name: fallbackName,
			sections: ["hero", "about", "services", "contact", "footer"],
			theme: "modern",
			design_style: "modern",
		};
	}

	const sections = Array.isArray(raw.sections)
		? raw.sections.filter((s: any) => typeof s === "string" && s.trim())
		: ["hero", "about", "services", "contact", "footer"];

	return {
		business_type: String(raw.business_type || raw.industry || "general"),
		brand_name: String(raw.brand_name || raw.name || fallbackName).trim(),
		brand_tagline: raw.brand_tagline ? String(raw.brand_tagline) : undefined,
		industry: raw.industry ? String(raw.industry) : undefined,
		target_audience: raw.target_audience
			? String(raw.target_audience)
			: undefined,
		business_goal: raw.business_goal ? String(raw.business_goal) : undefined,

		design_style: raw.design_style || raw.theme || "modern",
		theme: raw.theme || raw.design_style || "modern",
		tone: raw.tone || "professional",
		primary_cta: raw.primary_cta || "Get Started",
		secondary_cta: raw.secondary_cta,

		colors: {
			primary: raw.colors?.primary || "#10b981",
			secondary: raw.colors?.secondary || "#0ea5e9",
			accent: raw.colors?.accent || "#8b5cf6",
			background: raw.colors?.background,
			text: raw.colors?.text,
		},

		typography: {
			heading: raw.typography?.heading || raw.fonts?.heading || "Inter",
			body: raw.typography?.body || raw.fonts?.body || "Inter",
		},

		layout: {
			corner_radius: raw.layout?.corner_radius || "16px",
			card_style: raw.layout?.card_style || "soft",
			button_style: raw.layout?.button_style || "rounded",
			animation_style: raw.layout?.animation_style || "subtle",
			spacing: raw.layout?.spacing || "comfortable",
		},

		sections: sections.length > 0 ? sections : ["hero", "about", "contact"],

		features: Array.isArray(raw.features) ? raw.features : undefined,
		services: Array.isArray(raw.services) ? raw.services : undefined,

		social_links: raw.social_links || undefined,
		contact_information:
			raw.contact_information ||
			(raw.contact_email || raw.contact_phone
				? {
						email: raw.contact_email,
						phone: raw.contact_phone,
					}
				: undefined),

		seo: raw.seo || {
			title: raw.brand_name || fallbackName,
			description: raw.brand_tagline || "",
			keywords: [],
		},

		// Platform fields – preserve if present
		custom_domain: raw.custom_domain,
		custom_domain_verified: raw.custom_domain_verified,
		custom_domain_verified_at: raw.custom_domain_verified_at,
		custom_domain_verification_error: raw.custom_domain_verification_error,
		analytics_id: raw.analytics_id,
		site_description: raw.site_description,
	};
}

/**
 * Returns true only if the blueprint is ready for the Generator.
 */
export function isBlueprintReady(blueprint: SiteBlueprint | null | undefined): boolean {
	if (!blueprint) return false;

	for (const field of REQUIRED_BLUEPRINT_FIELDS) {
		const value = (blueprint as any)[field];
		if (value === undefined || value === null || value === "") return false;
		if (field === "sections" && (!Array.isArray(value) || value.length === 0))
			return false;
	}

	return true;
}

/**
 * Creates the final clean build prompt that the Generator will receive.
 * This is the single source of truth between Planner and Generator.
 */
export function createBuildPrompt(blueprint: SiteBlueprint): string {
	return JSON.stringify(blueprint, null, 2);
}