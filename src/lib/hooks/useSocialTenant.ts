// lib/hooks/useSocialTenant.ts

"use client";

import { useCallback, useEffect, useState } from "react";
import {
	ChatMessage,
	SiteBlueprint,
	type UserSite,
} from "@/lib/st/types";

interface UseSocialTenantReturn {
	sites: UserSite[];
	loading: boolean;
	error: string | null;
	fetchSites: () => Promise<void>;
	createSite: (
		userId: string,
		username: string,
		siteName: string,
		siteSlug: string,
	) => Promise<UserSite | null>; // ✅ Updated to 4 args
	deleteSite: (siteId: string) => Promise<boolean>;
	getSite: (siteId: string) => Promise<UserSite | null>;
	updateSite: (
		siteId: string,
		type: string,
		data: any,
	) => Promise<UserSite | null>;
}

export function useSocialTenant(): UseSocialTenantReturn {
	const [sites, setSites] = useState<UserSite[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchSites = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/st/sites");
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to fetch sites");
			}
			const data = await response.json();
			setSites(data.sites || []);
		} catch (err: any) {
			setError(err.message || "An error occurred");
			console.error("Fetch sites error:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	// ✅ Updated to accept 4 arguments
	const createSite = useCallback(
		async (
			userId: string,
			username: string,
			siteName: string,
			siteSlug: string,
		): Promise<UserSite | null> => {
			setError(null);
			try {
				const response = await fetch("/api/st/sites", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						user_id: userId,
						username: username,
						site_name: siteName,
						site_slug: siteSlug,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to create site");
				}

				const data = await response.json();
				setSites((prev) => [data.site, ...prev]);
				return data.site;
			} catch (err: any) {
				setError(err.message || "An error occurred");
				console.error("Create site error:", err);
				return null;
			}
		},
		[],
	);

	const deleteSite = useCallback(async (siteId: string): Promise<boolean> => {
		setError(null);
		try {
			const response = await fetch(`/api/st/sites/${siteId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to delete site");
			}

			setSites((prev) => prev.filter((site) => site.id !== siteId));
			return true;
		} catch (err: any) {
			setError(err.message || "An error occurred");
			console.error("Delete site error:", err);
			return false;
		}
	}, []);

	const getSite = useCallback(
		async (siteId: string): Promise<UserSite | null> => {
			setError(null);
			try {
				const response = await fetch(`/api/st/sites/${siteId}`);
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to fetch site");
				}
				const data = await response.json();
				return data.site;
			} catch (err: any) {
				setError(err.message || "An error occurred");
				console.error("Get site error:", err);
				return null;
			}
		},
		[],
	);

	const updateSite = useCallback(
		async (
			siteId: string,
			type: string,
			data: any,
		): Promise<UserSite | null> => {
			setError(null);
			try {
				const response = await fetch(`/api/st/sites/${siteId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ type, data }),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to update site");
				}

				const result = await response.json();
				// Update local state
				setSites((prev) =>
					prev.map((site) => (site.id === siteId ? result.site : site)),
				);
				return result.site;
			} catch (err: any) {
				setError(err.message || "An error occurred");
				console.error("Update site error:", err);
				return null;
			}
		},
		[],
	);

	useEffect(() => {
		fetchSites();
	}, [fetchSites]);

	return {
		sites,
		loading,
		error,
		fetchSites,
		createSite,
		deleteSite,
		getSite,
		updateSite,
	};
}
