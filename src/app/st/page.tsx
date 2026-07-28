// app/st/page.tsx

"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Dashboard } from "@/components/social-tenant/Dashboard";
import supabase, { createClient } from "@/lib/supabase/client";

export default function SocialTenantDashboard() {
	const router = useRouter();
	const [userId, setUserId] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function checkAuth() {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();

				if (!user) {
					router.push("/auth/login?redirect=/st");
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
			} catch (error) {
				console.error("Auth check error:", error);
				router.push("/auth/login");
			} finally {
				setLoading(false);
			}
		}

		checkAuth();
	}, [router]);

	if (loading) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
					<p className="text-xs text-zinc-500 font-medium">
						Loading dashboard...
					</p>
				</div>
			</div>
		);
	}

	if (!userId || !username) {
		return null;
	}

	return (
		<div className="min-h-screen bg-black text-white p-4 md:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto">
				<Dashboard userId={userId} username={username} />
			</div>
		</div>
	);
}
