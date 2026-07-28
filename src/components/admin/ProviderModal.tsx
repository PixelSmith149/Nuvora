"use client";

import {
	AlertCircle,
	BarChart2,
	Coins,
	Landmark,
	Layers,
	X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
	fetchProviderDetailedMetrics,
	type ModalAnalysisPayload,
} from "@/app/[tech]/admin-dashboard/provider-analytics/actions";
import { cn } from "@/lib/utils";

interface ProviderModalProps {
	providerId: string;
	providerName: string;
	onClose: () => void;
}

export default function ProviderModal({
	providerId,
	providerName,
	onClose,
}: ProviderModalProps) {
	const [metrics, setMetrics] = useState<ModalAnalysisPayload | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadMetrics() {
			setLoading(true);
			setError(null);
			try {
				const res = await fetchProviderDetailedMetrics(providerId);
				setMetrics(res);
			} catch (err: any) {
				setError(err?.message || "Failed to parse provider ledger schemas.");
			} finally {
				setLoading(false);
			}
		}
		loadMetrics();
	}, [providerId]);

	// Prevent background scroll interactions when active
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, []);

	const netSpreadProfit = metrics
		? metrics.totalCustomerSpend - metrics.totalMoneyConsumedByWholesaler
		: 0;
	const breakEvenScale =
		metrics && metrics.totalCustomerSpend > 0
			? (netSpreadProfit / metrics.totalCustomerSpend) * 100
			: 0;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
			<div className="w-full max-w-5xl bg-zinc-950 border border-white/[0.08] rounded-2xl flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200">
				{/* Header Block */}
				<div className="p-5 border-b border-white/[0.05] flex items-center justify-between bg-zinc-900/40">
					<div>
						<span className="text-[9px] font-mono uppercase text-red-500 tracking-wider">
							Dynamic Node Breakdown Matrix
						</span>
						<h2 className="text-base font-bold text-white font-sans mt-0.5">
							{providerName}
						</h2>
					</div>
					<button
						onClick={onClose}
						className="p-2 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.08] rounded-xl text-zinc-400 hover:text-white transition-all"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Primary Interactive Frame Viewport Container */}
				<div className="p-6 overflow-y-auto space-y-6 flex-1">
					{loading ? (
						<div className="p-24 text-center font-mono text-xs text-zinc-500 tracking-widest uppercase">
							Streaming live configuration maps...
						</div>
					) : error ? (
						<div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs rounded-xl flex items-center gap-3">
							<AlertCircle className="h-4 w-4 shrink-0" />
							<span>{error}</span>
						</div>
					) : !metrics ? null : (
						<>
							{/* SECTION A: Horizontal Long Bar Scroller Container for Services */}
							<div className="space-y-2">
								<div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
									<Layers className="h-3.5 w-3.5 text-zinc-500" />
									<span>
										Mapped Platform Services Catalog (
										{metrics.servicesList.length})
									</span>
								</div>

								<div className="w-full overflow-x-auto pb-3 flex gap-3 scrollbar-thin scrollbar-thumb-white/[0.04]">
									{metrics.servicesList.length === 0 ? (
										<div className="w-full border border-dashed border-white/[0.06] p-4 text-center text-xs font-mono text-zinc-600 rounded-xl">
											Zero storefront services match this provider's sub-keys.
										</div>
									) : (
										metrics.servicesList.map((srv) => (
											<div
												key={srv.id}
												className="min-w-[280px] max-w-[280px] bg-black border border-white/[0.05] p-3 rounded-xl space-y-2 shrink-0 hover:border-white/[0.12] transition-colors"
											>
												<div className="flex items-center justify-between">
													<span className="px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-[9px] font-mono text-zinc-300 uppercase">
														{srv.platform}
													</span>
													<span className="text-[9px] font-mono text-zinc-600">
														ID: {srv.id.substring(0, 6)}
													</span>
												</div>
												<h4
													className="text-xs font-sans font-medium text-white line-clamp-1"
													title={srv.title}
												>
													{srv.title}
												</h4>
												<div className="flex justify-between items-center text-[10px] font-mono pt-1 border-t border-white/[0.03]">
													<div>
														<span className="text-zinc-600 block text-[8px] uppercase">
															Cost
														</span>
														<span className="text-zinc-400">
															${srv.wholesaleRate.toFixed(2)}
														</span>
													</div>
													<div className="text-right">
														<span className="text-zinc-600 block text-[8px] uppercase">
															Retail
														</span>
														<span className="text-emerald-400 font-bold">
															${srv.retailPrice.toFixed(2)}
														</span>
													</div>
												</div>
											</div>
										))
									)}
								</div>
							</div>

							{/* SECTION B, C, D: Metric Cascade Breakdown Panels */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
								{/* Metric Block B: Sum of Rates */}
								<div className="bg-black border border-white/[0.05] p-4 rounded-xl flex items-start gap-3">
									<div className="p-2 bg-white/[0.02] border border-white/[0.06] rounded-lg text-zinc-400">
										<Layers className="h-4 w-4" />
									</div>
									<div>
										<span className="text-[9px] text-zinc-500 uppercase block tracking-wider">
											Wholesaler Base Line Rate Sum
										</span>
										<div className="text-base font-bold text-white mt-1">
											${metrics.sumOfRates.toFixed(2)}
										</div>
										<span className="text-[9px] text-zinc-600 block mt-0.5">
											Aggregated default cost matrices
										</span>
									</div>
								</div>

								{/* Metric Block C: Wholesaler Money Consumed */}
								<div className="bg-black border border-white/[0.05] p-4 rounded-xl flex items-start gap-3">
									<div className="p-2 bg-white/[0.02] border border-white/[0.06] rounded-lg text-red-500/20 text-red-400">
										<Landmark className="h-4 w-4" />
									</div>
									<div>
										<span className="text-[9px] text-zinc-500 uppercase block tracking-wider">
											Total Consumed by Wholesaler
										</span>
										<div className="text-base font-bold text-zinc-200 mt-1">
											${metrics.totalMoneyConsumedByWholesaler.toFixed(2)}
										</div>
										<span className="text-[9px] text-zinc-600 block mt-0.5">
											Real-time dynamic cost tracking output
										</span>
									</div>
								</div>

								{/* Metric Block D: Total Customer Inflow Orders */}
								<div className="bg-black border border-white/[0.05] p-4 rounded-xl flex items-start gap-3">
									<div className="p-2 bg-white/[0.02] border border-white/[0.06] rounded-lg text-emerald-500/20 text-emerald-400">
										<Coins className="h-4 w-4" />
									</div>
									<div>
										<span className="text-[9px] text-zinc-500 uppercase block tracking-wider">
											Total Customer Order Spend
										</span>
										<div className="text-base font-bold text-emerald-400 mt-1">
											${metrics.totalCustomerSpend.toFixed(2)}
										</div>
										<span className="text-[9px] text-zinc-600 block mt-0.5">
											Gross client purchase intake scale
										</span>
									</div>
								</div>
							</div>

							{/* SECTION E: Dynamic Live Calculation Spread Graph */}
							<div className="bg-black border border-white/[0.06] p-5 rounded-xl space-y-4">
								<div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
									<BarChart2 className="h-4 w-4 text-blue-400" />
									<span>Real-time Margin Evaluation Yield Profile</span>
								</div>

								<div className="space-y-3 pt-2 font-mono text-xs">
									{/* Visual Bar Graph Split Components */}
									<div className="space-y-1.5">
										<div className="flex justify-between text-[11px]">
											<span className="text-zinc-500">
												Wholesale Outflow Distribution Threshold
											</span>
											<span className="text-zinc-400">
												${metrics.totalMoneyConsumedByWholesaler.toFixed(2)}
											</span>
										</div>
										<div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
											<div
												className="h-full bg-zinc-600 transition-all duration-500"
												style={{
													width: `${metrics.totalCustomerSpend > 0 ? Math.min((metrics.totalMoneyConsumedByWholesaler / metrics.totalCustomerSpend) * 100, 100) : 0}%`,
												}}
											/>
										</div>
									</div>

									<div className="space-y-1.5">
										<div className="flex justify-between text-[11px]">
											<span className="text-zinc-500">
												Net Cleared Retained Spreads (Profit Vector)
											</span>
											<span
												className={cn(
													"font-bold",
													netSpreadProfit >= 0
														? "text-emerald-400"
														: "text-red-400",
												)}
											>
												${netSpreadProfit.toFixed(2)}
											</span>
										</div>
										<div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden">
											<div
												className={cn(
													"h-full transition-all duration-500",
													netSpreadProfit >= 0 ? "bg-red-500" : "bg-red-800",
												)}
												style={{
													width: `${metrics.totalCustomerSpend > 0 ? Math.min(Math.max(breakEvenScale, 0), 100) : 0}%`,
												}}
											/>
										</div>
									</div>
								</div>

								{/* Final Calculation Equating Footer Box */}
								<div className="mt-4 p-3 bg-zinc-950 border border-white/[0.04] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px]">
									<div className="text-zinc-500">
										Formulaic Equation Matrix:{" "}
										<span className="text-zinc-400">
											(${metrics.totalCustomerSpend.toFixed(2)} Revenue)
										</span>{" "}
										-{" "}
										<span className="text-zinc-400">
											(${metrics.totalMoneyConsumedByWholesaler.toFixed(2)}{" "}
											Cost)
										</span>
									</div>
									<div className="text-right">
										Net Yield Factor:{" "}
										<span
											className={cn(
												"font-bold text-xs p-1 px-2 rounded ml-1 bg-white/[0.02]",
												netSpreadProfit >= 0
													? "text-emerald-400"
													: "text-red-400",
											)}
										>
											${netSpreadProfit.toFixed(2)} ({breakEvenScale.toFixed(1)}
											%)
										</span>
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
