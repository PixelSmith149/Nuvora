// lib/st/services/link-in-bio.client.service.ts

"use client";

import type { LinkInBioProfile } from "@/lib/st/types/link-in-bio";
import supabase from "@/lib/supabase/client";

// ─── Profile CRUD ────────────────────────────────────────────────

export async function updateProfileClient(
	profileId: string,
	updates: Partial<LinkInBioProfile>,
): Promise<LinkInBioProfile> {
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

export async function addLinkClient(
	profileId: string,
	link: any,
): Promise<any> {
	const { data, error } = await supabase
		.from("link_in_bio_links")
		.insert({ profile_id: profileId, ...link })
		.select()
		.single();

	if (error) throw new Error(`Failed to add link: ${error.message}`);
	return data;
}

export async function deleteLinkClient(linkId: string): Promise<void> {
	const { error } = await supabase
		.from("link_in_bio_links")
		.delete()
		.eq("id", linkId);

	if (error) throw new Error(`Failed to delete link: ${error.message}`);
}

export async function toggleLinkActiveClient(
	linkId: string,
	isActive: boolean,
): Promise<any> {
	const { data, error } = await supabase
		.from("link_in_bio_links")
		.update({ is_active: isActive })
		.eq("id", linkId)
		.select()
		.single();

	if (error) throw new Error(`Failed to toggle link: ${error.message}`);
	return data;
}

export async function reorderLinksClient(
	profileId: string,
	linkIds: string[],
): Promise<void> {
	for (let i = 0; i < linkIds.length; i++) {
		await supabase
			.from("link_in_bio_links")
			.update({ order_index: i })
			.eq("id", linkIds[i])
			.eq("profile_id", profileId);
	}
}

// ─── Socials CRUD ─────────────────────────────────────────────────
export async function addSocialClient(
	profileId: string,
	platform: string,
	url: string,
	displayName: string | null = null, // ✅ Add 4th argument
): Promise<any> {
	const { data, error } = await supabase
		.from("link_in_bio_socials")
		.insert({
			profile_id: profileId,
			platform,
			url,
			display_name: displayName, // ✅ Save display name
		})
		.select()
		.single();

	if (error) throw new Error(`Failed to add social: ${error.message}`);
	return data;
}

export async function updateSocialClient(
	socialId: string,
	updates: { display_name: string | null },
): Promise<any> {
	const { data, error } = await supabase
		.from("link_in_bio_socials")
		.update({
			display_name: updates.display_name,
		})
		.eq("id", socialId)
		.select()
		.single();

	if (error) throw new Error(`Failed to update social: ${error.message}`);
	return data;
}

export async function deleteSocialClient(socialId: string): Promise<void> {
	const { error } = await supabase
		.from("link_in_bio_socials")
		.delete()
		.eq("id", socialId);

	if (error) throw new Error(`Failed to delete social: ${error.message}`);
}
