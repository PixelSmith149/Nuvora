"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfileHeader() {
	// FIXED: Move client initialization outside the render path if possible,
	// or handle it safely. Better yet, call it once.
	const [userId, setUserId] = useState("");
	const [profile, setProfile] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Initialize inside useEffect to guarantee it only builds once on mount
		const supabase = createClient();
		let isMounted = true;

		async function loadProfile() {
			try {
				const {
					data: { user },
					error: authError,
				} = await supabase.auth.getUser();

				if (authError) {
					return;
				}

				if (!user) {
					return;
				}

				if (isMounted) {
					setUserId(user.id);
				}

				const { data, error: profileError } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", user.id)
					.single();

				if (profileError) {
					return;
				}

				if (isMounted) {
					setProfile(data);
				}
			} catch (err) {
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		loadProfile();

		return () => {
			isMounted = false; // Prevents state updates on unmounted component memory leaks
		};
	}, []);

	if (loading) {
		return (
			<div className="p-6 rounded-2xl border border-zinc-800 flex items-center gap-4 animate-pulse bg-zinc-950">
				<div className="w-14 h-14 rounded-full bg-zinc-900" />
				<div className="space-y-2 flex-1">
					<div className="h-4 bg-zinc-900 rounded w-1/4" />
					<div className="h-3 bg-zinc-900 rounded w-1/2" />
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 flex items-center gap-4 text-white">
			<div className="w-14 h-14 rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center border border-zinc-800">
				{profile?.avatar_url ? (
					<Image
						src={profile.avatar_url}
						alt="avatar"
						width={56}
						height={56}
						unoptimized // FIXED: Bypasses Next.js domain whitelist errors for random external CDN urls
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="text-xl font-bold text-zinc-600 uppercase">
						{(profile?.display_name || profile?.username || "U").charAt(0)}
					</div>
				)}
			</div>

			<div className="space-y-1">
				<h1 className="text-lg font-semibold text-white">
					{profile?.display_name || profile?.username || "User"}
				</h1>

				<p className="text-sm text-zinc-400">
					{profile?.bio || "No bio set yet"}
				</p>
			</div>
		</div>
	);
}
