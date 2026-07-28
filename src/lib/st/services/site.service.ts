// lib/st/services/site.service.ts

import type { SiteBlueprint, SiteStatus, UserSite } from "@/lib/st/types";
import { createClient } from "@/lib/supabase/server";

export async function createSite(
	userId: string,
	username: string,
	siteName: string,
	siteSlug: string, //
): Promise<UserSite> {
	const supabase = await createClient();

	// ✅ Check if slug is already taken
	const { data: existing } = await supabase
		.from("user_sites")
		.select("id")
		.eq("site_slug", siteSlug)
		.maybeSingle();

	if (existing) {
		throw new Error(
			"This website name is already taken. Please choose another.",
		);
	}

	const { data, error } = await supabase
		.from("user_sites")
		.insert({
			user_id: userId,
			username,
			site_name: siteName,
			site_slug: siteSlug, // ✅ User-chosen slug
			blueprint: {},
			status: "draft",
			is_session_active: false,
		})
		.select()
		.single();

	if (error) throw new Error(`Failed to create site: ${error.message}`);
	return data as UserSite;
}

export async function getSiteBySlug(
	siteSlug: string,
): Promise<UserSite | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("user_sites")
		.select("*")
		.eq("site_slug", siteSlug)
		.eq("status", "published")
		.single();

	if (error) return null;
	return data as UserSite;
}

export async function getSiteById(siteId: string): Promise<UserSite | null> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("user_sites")
		.select("*")
		.eq("id", siteId)
		.single();

	if (error) return null;
	return data as UserSite;
}

export async function getUserSites(userId: string): Promise<UserSite[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("user_sites")
		.select("*")
		.eq("user_id", userId)
		.order("created_at", { ascending: false });

	if (error) throw new Error(`Failed to fetch sites: ${error.message}`);
	return data as UserSite[];
}

export async function updateSiteBlueprint(
	siteId: string,
	blueprint: SiteBlueprint,
): Promise<UserSite> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("user_sites")
		.update({ blueprint })
		.eq("id", siteId)
		.select()
		.single();

	if (error) throw new Error(`Failed to update blueprint: ${error.message}`);
	return data as UserSite;
}

export async function updateSiteHtml(
	siteId: string,
	htmlCode: string,
	status: SiteStatus = "published",
): Promise<UserSite> {
	const supabase = await createClient();

	const updateData: any = {
		html_code: htmlCode,
		status,
		published_at: status === "published" ? new Date().toISOString() : null,
	};

	const { data, error } = await supabase
		.from("user_sites")
		.update(updateData)
		.eq("id", siteId)
		.select()
		.single();

	if (error) throw new Error(`Failed to update HTML: ${error.message}`);
	return data as UserSite;
}

export async function updateSiteStatus(
	siteId: string,
	status: SiteStatus,
): Promise<UserSite> {
	const supabase = await createClient();

	const updateData: any = { status };
	if (status === "published") {
		updateData.published_at = new Date().toISOString();
	}

	const { data, error } = await supabase
		.from("user_sites")
		.update(updateData)
		.eq("id", siteId)
		.select()
		.single();

	if (error) throw new Error(`Failed to update status: ${error.message}`);
	return data as UserSite;
}

export async function deleteSite(siteId: string): Promise<void> {
	const supabase = await createClient();

	const { error } = await supabase.from("user_sites").delete().eq("id", siteId);

	if (error) throw new Error(`Failed to delete site: ${error.message}`);
}

export async function startSession(siteId: string): Promise<UserSite> {
	const supabase = await createClient();
	const sessionId = crypto.randomUUID();
	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + 48);

	const { data, error } = await supabase
		.from("user_sites")
		.update({
			session_id: sessionId,
			session_expires_at: expiresAt.toISOString(),
			is_session_active: true,
			status: "generating",
		})
		.eq("id", siteId)
		.select()
		.single();

	if (error) throw new Error(`Failed to start session: ${error.message}`);
	return data as UserSite;
}

export async function endSession(siteId: string): Promise<UserSite> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("user_sites")
		.update({
			is_session_active: false,
			session_expires_at: null,
		})
		.eq("id", siteId)
		.select()
		.single();

	if (error) throw new Error(`Failed to end session: ${error.message}`);
	return data as UserSite;
}

export async function extendSession(siteId: string): Promise<UserSite> {
	const supabase = await createClient();
	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + 48);

	const { data, error } = await supabase
		.from("user_sites")
		.update({
			session_expires_at: expiresAt.toISOString(),
			is_session_active: true,
		})
		.eq("id", siteId)
		.select()
		.single();

	if (error) throw new Error(`Failed to extend session: ${error.message}`);
	return data as UserSite;
}
