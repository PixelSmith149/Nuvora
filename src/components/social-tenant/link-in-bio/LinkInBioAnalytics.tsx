// components/social-tenant/link-in-bio/LinkInBioAnalytics.tsx

"use client";

import {
	Calendar,
	Eye,
	MousePointerClick,
	TrendingUp,
	Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface LinkInBioAnalyticsProps {
	profileId: string;
}

export function LinkInBioAnalytics({ profileId }: LinkInBioAnalyticsProps) {
	const [stats, setStats] = useState({
		views: 0,
		clicks: 0,
		topLinks: [] as { title: string; clicks: number }[],
		dailyViews: [] as { date: string; count: number }[],
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchAnalytics() {
			try {
				const res = await fetch(
					`/api/st/link-in-bio/analytics?profileId=${profileId}`,
				);
				const data = await res.json();
				if (data.success) {
					setStats(data.stats);
				}
			} catch (err) {
				console.error("Failed to fetch analytics:", err);
			} finally {
				setLoading(false);
			}
		}
		fetchAnalytics();
	}, [profileId]);

	if (loading) {
		return (
			<div className="animate-pulse space-y-4">
				<div className="h-20 bg-zinc-800 rounded-xl" />
				<div className="h-20 bg-zinc-800 rounded-xl" />
				<div className="h-20 bg-zinc-800 rounded-xl" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-3">
				<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl text-center">
					<Eye className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
					<p className="text-2xl font-bold text-white">
						{stats.views.toLocaleString()}
					</p>
					<p className="text-xs text-zinc-500">Total Views</p>
				</div>
				<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl text-center">
					<MousePointerClick className="h-5 w-5 text-sky-400 mx-auto mb-1" />
					<p className="text-2xl font-bold text-white">
						{stats.clicks.toLocaleString()}
					</p>
					<p className="text-xs text-zinc-500">Total Clicks</p>
				</div>
			</div>

			{stats.topLinks.length > 0 && (
				<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
					<h4 className="text-xs font-bold text-white flex items-center gap-2 mb-3">
						<TrendingUp className="h-4 w-4 text-emerald-400" />
						Top Links
					</h4>
					<div className="space-y-2">
						{stats.topLinks.map((link, index) => (
							<div
								key={index}
								className="flex items-center justify-between text-sm"
							>
								<span className="text-zinc-300 truncate">{link.title}</span>
								<span className="text-zinc-500">{link.clicks} clicks</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
