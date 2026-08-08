//src/components/admin/ProfitBalance.tsx
"use client";

import { AlertCircle, RotateCw, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";
import { fetchPlatformLiveProfitBalance } from "@/app/[tech]/admin-dashboard/provider-analytics/global-actions";
import { cn } from "@/lib/utils";

export default function ProfitBalance() {
	const [profitBalance, setProfitBalance] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadBalance = async () => {
		setLoading(true);
		setError(null);
		try {
			const balance = await fetchPlatformLiveProfitBalance();
			setProfitBalance(balance);
		} catch (err: any) {
			setError("Failed to stream platform-wide ledger metrics.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadBalance();
	}, []);

	return (
		<div className="bg-zinc-950 border border-white/[0.08] p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden shadow-2xl">
			<div className="flex items-center gap-4">
				<div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
					<Wallet className="h-6 w-6" />
				</div>
				<div>
					<span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
						Total Profit Balance (All Providers)
					</span>

					{error ? (
						<div className="flex items-center gap-1.5 text-xs font-mono text-red-400 mt-1">
							<AlertCircle className="h-3.5 w-3.5" />
							<span>{error}</span>
						</div>
					) : (
						<div className="text-3xl font-sans font-black tracking-tight text-white mt-1 select-all flex items-center gap-1">
							<span className="text-emerald-400 text-2xl font-normal">$</span>
							{loading ? (
								<span className="text-zinc-700 animate-pulse">---.--</span>
							) : (
								profitBalance?.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})
							)}
						</div>
					)}
				</div>
			</div>

			<div className="flex flex-col items-start sm:items-end gap-2 font-mono text-[11px] text-zinc-500 self-stretch sm:self-auto justify-between sm:justify-center">
				<button
					onClick={loadBalance}
					disabled={loading}
					className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg text-zinc-400 hover:text-white transition-all text-[10px] uppercase font-bold"
				>
					<RotateCw
						className={cn(
							"h-3 w-3",
							loading && "animate-spin text-emerald-400",
						)}
					/>
					Sync Balance
				</button>
				<div className="text-[10px] text-zinc-600 hidden sm:block">
					Real-time cross-provider net ledger summation
				</div>
			</div>
		</div>
	);
}
