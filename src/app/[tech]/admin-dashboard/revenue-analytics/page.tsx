// app/[tech]/admin-dashboard/revenue-analytics/page.tsx

"use client";

import { ArrowLeft, DollarSign } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { RevenueAnalytics } from "@/components/admin/RevenueAnalytics";

export default function RevenueAnalyticsPage() {
	const router = useRouter();
	const params = useParams();
	const tech = params?.tech as string;

	return (
		<div className="min-h-screen bg-black text-white">
			<div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
				{/* ─── Header ────────────────────────────────────────────── */}
				<div className="flex items-center gap-4">
					<button
						onClick={() => router.push(`/${tech}/admin-dashboard`)}
						className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
					</button>
					<div>
						<h1 className="text-xl font-bold text-white flex items-center gap-2">
							<DollarSign className="h-6 w-6 text-emerald-400" />
							Revenue Analytics
						</h1>
						<p className="text-sm text-zinc-500">
							Real-time platform revenue tracking
						</p>
					</div>
					<div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
						<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
						<span className="text-[10px] text-emerald-400 font-medium">
							Live
						</span>
					</div>
				</div>

				{/* ─── Revenue Analytics Component ──────────────────────── */}
				<RevenueAnalytics refreshInterval={30000} />

				{/* ─── Footer ────────────────────────────────────────────── */}
				<div className="border-t border-white/5 pt-4 text-center">
					<p className="text-[10px] text-zinc-600">
						Prime Boostage | Elite Home — Admin Panel
					</p>
				</div>
			</div>
		</div>
	);
}
