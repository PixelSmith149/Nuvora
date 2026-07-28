"use client";

import {
	ArrowUpRight,
	BarChart3,
	Search,
	Server,
	ShieldCheck,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import ProfitBalance from "@/components/admin/ProfitBalance";
import ProviderModal from "@/components/admin/ProviderModal";
import { fetchRootProviders, type ProviderItem } from "./actions";

export default function AdminProviderAnalyticsPage() {
	const [providers, setProviders] = useState<ProviderItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProvider, setSelectedProvider] = useState<ProviderItem | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadData() {
			try {
				const list = await fetchRootProviders();
				setProviders(list);
			} catch (err: any) {
				setError(
					err?.message || "Failed to parse target database connections.",
				);
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, []);

	const filtered = providers.filter(
		(p) =>
			p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.id.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="space-y-6 p-6 max-w-7xl mx-auto">
			{/* Page Heading Stack Frame */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
						<span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
							Operational Ledger Integration Matrix
						</span>
					</div>
					<h1 className="text-2xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
						<BarChart3 className="h-6 w-6 text-blue-500" />
						Wholesale Ledger Analytics
					</h1>
					<p className="text-xs font-mono text-zinc-400 max-w-xl">
						Select an integrated wholesale endpoint below to isolate specific
						storefront service line matching counts, base configuration metrics,
						and live profit graph distributions.
					</p>
				</div>

				<div className="flex items-center gap-3 bg-zinc-950 px-4 py-2.5 rounded-xl border border-white/[0.06]">
					<ShieldCheck className="h-4 w-4 text-blue-400" />
					<div className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
						Clearance Tier:{" "}
						<span className="text-white font-bold">Financial Admin</span>
					</div>
				</div>
			</div>

			<div className="space-y-6">
				{/* Standard Header Row */}

				{/* The isolated component calculates everything on its own here: */}
				<ProfitBalance />

				{/* Your clean table list of providers mapping below it */}
			</div>

			{/* Internal Toolbar Controls */}
			<div className="relative max-w-md bg-zinc-950 rounded-2xl border border-white/[0.06] p-2 flex items-center">
				<Search className="h-4 w-4 text-zinc-600 ml-2.5 shrink-0" />
				<input
					type="text"
					placeholder="Filter integration connections by name or system UUID..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full bg-transparent border-none focus:outline-none pl-2.5 text-xs font-mono text-zinc-200 py-1.5"
				/>
			</div>

			{/* Main Connection Table Display Grid Node */}
			{error && (
				<div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs rounded-xl">
					<span className="font-bold">INITIALIZATION ERROR:</span> {error}
				</div>
			)}

			<div className="border border-white/[0.06] bg-zinc-950/20 rounded-2xl overflow-hidden">
				<table className="w-full text-left font-mono text-xs whitespace-nowrap">
					<thead>
						<tr className="border-b border-white/[0.06] bg-zinc-950 text-zinc-500 uppercase tracking-wider text-[10px] font-bold">
							<th className="p-4 pl-6">Integration Node Identifier (UUID)</th>
							<th className="p-4">Provider Vendor Profile Name</th>
							<th className="p-4 text-center pr-6">Analysis Action</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-white/[0.04]">
						{loading ? (
							<tr>
								<td
									colSpan={3}
									className="p-12 text-center text-zinc-500 uppercase tracking-wider"
								>
									Loading root provider references...
								</td>
							</tr>
						) : filtered.length === 0 ? (
							<tr>
								<td colSpan={3} className="p-12 text-center text-zinc-500">
									Zero matching integration profiles found in schema registry.
								</td>
							</tr>
						) : (
							filtered.map((provider) => (
								<tr
									key={provider.id}
									className="hover:bg-white/[0.01] transition-colors group"
								>
									<td className="p-4 pl-6 text-zinc-600 text-[11px] select-all w-1/3">
										{provider.id}
									</td>
									<td className="p-4 font-sans text-sm font-semibold text-white tracking-tight flex items-center gap-2 mt-0.5">
										<Server className="h-4 w-4 text-zinc-600 group-hover:text-blue-500 transition-colors" />
										{provider.name}
									</td>
									<td className="p-4 text-center pr-6 w-24">
										<button
											onClick={() => setSelectedProvider(provider)}
											className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/[0.02] hover:bg-white text-zinc-400 hover:text-black rounded-lg border border-white/[0.06] text-[10px] font-bold uppercase tracking-wider transition-all"
										>
											Audit Ledger
											<ArrowUpRight className="h-3 w-3" />
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* SECTION F: Conditionally Rendered Isolated Modal Display Layer */}
			{selectedProvider && (
				<ProviderModal
					providerId={selectedProvider.id}
					providerName={selectedProvider.name}
					onClose={() => setSelectedProvider(null)}
				/>
			)}
		</div>
	);
}
