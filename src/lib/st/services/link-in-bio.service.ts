// lib/st/services/link-in-bio.service.ts

import {
	getTemplate,
	type LinkInBioLink,
	type LinkInBioProfile,
	type LinkInBioSocial,
	TEMPLATES,
	type Template,
} from "@/lib/st/types/link-in-bio";
import supabase from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";

// ─── Profile CRUD ────────────────────────────────────────────────

export async function getOrCreateProfile(
	userId: string,
	username: string,
): Promise<LinkInBioProfile> {
	const supabase = await createClient();

	// Check if profile exists
	const { data: existing } = await supabase
		.from("link_in_bio_profiles")
		.select("*")
		.eq("user_id", userId)
		.maybeSingle();

	if (existing) {
		return existing as LinkInBioProfile;
	}

	// Create new profile with default template
	const { data, error } = await supabase
		.from("link_in_bio_profiles")
		.insert({
			user_id: userId,
			username,
			template_id: "minimal",
			display_name: username,
			is_published: false,
		})
		.select()
		.single();

	if (error) throw new Error(`Failed to create profile: ${error.message}`);
	return data as LinkInBioProfile;
}

export async function getProfileByUserId(
	userId: string,
): Promise<LinkInBioProfile | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("link_in_bio_profiles")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (error) return null;
	return data as LinkInBioProfile;
}

export async function getProfileByUsername(
	username: string,
): Promise<LinkInBioProfile | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("link_in_bio_profiles")
		.select("*")
		.eq("username", username)
		.eq("is_published", true)
		.single();

	if (error) return null;
	return data as LinkInBioProfile;
}

export async function updateProfile(
	profileId: string,
	updates: Partial<LinkInBioProfile>,
): Promise<LinkInBioProfile> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("link_in_bio_profiles")
		.update(updates)
		.eq("id", profileId)
		.select()
		.single();

	if (error) throw new Error(`Failed to update profile: ${error.message}`);
	return data as LinkInBioProfile;
}
// ─── Links CRUD ──────────────────────────────────────────────────

export async function getLinks(profileId: string): Promise<LinkInBioLink[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("link_in_bio_links")
		.select("*")
		.eq("profile_id", profileId)
		.order("order_index", { ascending: true });

	if (error) return [];
	return data as LinkInBioLink[];
}

export async function addLink(
	profileId: string,
	link: Omit<
		LinkInBioLink,
		"id" | "profile_id" | "clicks" | "created_at" | "updated_at"
	>,
): Promise<LinkInBioLink> {
	const supabase = await createClient();

	// Get current max order_index
	const { data: existing } = await supabase
		.from("link_in_bio_links")
		.select("order_index")
		.eq("profile_id", profileId)
		.order("order_index", { ascending: false })
		.limit(1);

	const nextOrder =
		existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

	const { data, error } = await supabase
		.from("link_in_bio_links")
		.insert({
			profile_id: profileId,
			...link,
			order_index: nextOrder,
			clicks: 0,
		})
		.select()
		.single();

	if (error) throw new Error(`Failed to add link: ${error.message}`);
	return data as LinkInBioLink;
}

export async function updateLink(
	linkId: string,
	updates: Partial<LinkInBioLink>,
): Promise<LinkInBioLink> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("link_in_bio_links")
		.update(updates)
		.eq("id", linkId)
		.select()
		.single();

	if (error) throw new Error(`Failed to update link: ${error.message}`);
	return data as LinkInBioLink;
}

export async function deleteLink(linkId: string): Promise<void> {
	const supabase = await createClient();

	const { error } = await supabase
		.from("link_in_bio_links")
		.delete()
		.eq("id", linkId);

	if (error) throw new Error(`Failed to delete link: ${error.message}`);
}

// ─── Socials CRUD ─────────────────────────────────────────────────

export async function getSocials(
	profileId: string,
): Promise<LinkInBioSocial[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("link_in_bio_socials")
		.select("*")
		.eq("profile_id", profileId);

	if (error) return [];
	return data as LinkInBioSocial[];
}

export async function addSocial(
	profileId: string,
	platform: string,
	url: string,
): Promise<LinkInBioSocial> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("link_in_bio_socials")
		.insert({
			profile_id: profileId,
			platform,
			url,
		})
		.select()
		.single();

	if (error) throw new Error(`Failed to add social: ${error.message}`);
	return data as LinkInBioSocial;
}

export async function deleteSocial(socialId: string): Promise<void> {
	const supabase = await createClient();

	const { error } = await supabase
		.from("link_in_bio_socials")
		.delete()
		.eq("id", socialId);

	if (error) throw new Error(`Failed to delete social: ${error.message}`);
}
// ─── Template Helpers ────────────────────────────────────────────

export function getAvailableTemplates(): Template[] {
	return TEMPLATES;
}

export function getTemplateById(id: string): Template | null {
	return getTemplate(id) || null;
}

export async function toggleLinkActive(
	linkId: string,
	isActive: boolean,
): Promise<LinkInBioLink> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("link_in_bio_links")
		.update({ is_active: isActive })
		.eq("id", linkId)
		.select()
		.single();

	if (error) throw new Error(`Failed to toggle link: ${error.message}`);
	return data as LinkInBioLink;
}

// ─── Update reorderLinks to handle drag-and-drop ──────────────
export async function reorderLinks(
	profileId: string,
	linkIds: string[],
): Promise<void> {
	const supabase = await createClient();

	// Use a transaction or batch update
	for (let i = 0; i < linkIds.length; i++) {
		await supabase
			.from("link_in_bio_links")
			.update({ order_index: i })
			.eq("id", linkIds[i])
			.eq("profile_id", profileId);
	}
}

// ─── Analytics ──────────────────────────────────────────────────
export async function trackView(profileId: string): Promise<void> {
	const supabase = await createClient();

	// Increment view_count
	const { data: profile } = await supabase
		.from("link_in_bio_profiles")
		.select("view_count")
		.eq("id", profileId)
		.single();

	if (profile) {
		await supabase
			.from("link_in_bio_profiles")
			.update({ view_count: (profile.view_count || 0) + 1 })
			.eq("id", profileId);
	}

	// Log analytics
	await supabase.from("link_in_bio_analytics").insert({
		profile_id: profileId,
		ip_address: "anonymous", // In production, use request IP
		user_agent: "anonymous",
		referrer: "direct",
	});
}

export async function trackClick(
	linkId: string,
	profileId: string,
): Promise<void> {
	const supabase = await createClient();

	// Increment link clicks
	const { data: link } = await supabase
		.from("link_in_bio_links")
		.select("clicks")
		.eq("id", linkId)
		.single();

	if (link) {
		await supabase
			.from("link_in_bio_links")
			.update({ clicks: (link.clicks || 0) + 1 })
			.eq("id", linkId);
	}

	// Log analytics
	await supabase.from("link_in_bio_analytics").insert({
		profile_id: profileId,
		link_id: linkId,
		ip_address: "anonymous",
		user_agent: "anonymous",
		referrer: "direct",
	});
}

export async function updateSocialClient(
	socialId: string,
	updates: { display_name: string | null },
): Promise<any> {
	const { data, error } = await supabase
		.from("link_in_bio_socials")
		.update(updates)
		.eq("id", socialId)
		.select()
		.single();

	if (error) throw new Error(`Failed to update social: ${error.message}`);
	return data;
}
