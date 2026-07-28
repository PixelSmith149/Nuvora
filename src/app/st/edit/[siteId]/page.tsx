// app/st/edit/[siteId]/page.tsx

"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SiteEditor } from "@/components/social-tenant/SiteEditor";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function EditPage() {
	const params = useParams();
	const router = useRouter();
	const siteId = params?.siteId as string;

	const [userId, setUserId] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function checkAuth() {
			try {
				const supabase = createClient();
				const {
					data: { user },
				} = await supabase.auth.getUser();

				if (!user) {
					router.push("/auth/login?redirect=/st/edit/" + siteId);
					return;
				}

				setUserId(user.id);

				const { data: profile } = await supabase
					.from("profiles")
					.select("username")
					.eq("id", user.id)
					.single();

				if (profile) {
					setUsername(profile.username);
				}

				// Verify site ownership
				const { data: siteData, error: siteError } = await supabase
					.from("user_sites")
					.select("id")
					.eq("id", siteId)
					.eq("user_id", user.id)
					.single();

				if (siteError || !siteData) {
					setError("Site not found or you do not have permission to edit it.");
				}
			} catch (error) {
				console.error("Error:", error);
				setError("An error occurred while loading the editor.");
			} finally {
				setLoading(false);
			}
		}

		if (siteId) {
			checkAuth();
		}
	}, [siteId, router]);

	if (loading) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
					<p className="text-xs text-zinc-500 font-medium">Loading editor...</p>
				</div>
			</div>
		);
	}

	if (error || !userId || !username) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center p-4">
				<div className="text-center max-w-md">
					<div className="inline-flex p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
						<AlertCircle className="h-10 w-10 text-red-400" />
					</div>
					<h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
					<p className="text-sm text-zinc-400 mb-6">
						{error || "Site not found"}
					</p>
					<Button
						onClick={() => router.push("/st")}
						className="bg-zinc-900 hover:bg-zinc-800 text-white"
					>
						Go to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black">
			<SiteEditor siteId={siteId} userId={userId} username={username} />
		</div>
	);
}
