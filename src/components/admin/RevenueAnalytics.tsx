// components/admin/RevenueAnalytics.tsx

"use client";

import {
	ArrowDown,
	ArrowUp,
	BarChart3,
	DollarSign,
	Eye,
	EyeOff,
	Loader2,
	Package,
	Percent,
	RefreshCw,
	TrendingUp,
	Wallet,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface RevenueStats {
	totalRevenue: number;
	websiteBuildRevenue: number;
	platformFeeRevenue: number;
	todayWebsiteBuild: number;
	todayPlatformFee: number;
	todayTotal: number;
	websiteBuildCount: number;
	platformFeeCount: number;
	totalTransactions: number;
	pendingEscrow: number;
	lastUpdated: string;
}

interface RevenueAnalyticsProps {
	refreshInterval?: number;
}

export function RevenueAnalytics({
	refreshInterval = 30000,
}: RevenueAnalyticsProps) {
	const supabase = createClient();
	const [stats, setStats] = useState<RevenueStats>({
		totalRevenue: 0,
		websiteBuildRevenue: 0,
		platformFeeRevenue: 0,
		todayWebsiteBuild: 0,
		todayPlatformFee: 0,
		todayTotal: 0,
		websiteBuildCount: 0,
		platformFeeCount: 0,
		totalTransactions: 0,
		pendingEscrow: 0,
		lastUpdated: new Date().toISOString(),
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showDetails, setShowDetails] = useState(false);

	const fetchStats = async () => {
		try {
			const response = await fetch("/api/admin/revenue/stats");
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to fetch revenue stats");
			}
			const data = await response.json();
			setStats({
				...data,
				lastUpdated: new Date().toISOString(),
			});
			setError(null);
		} catch (err: any) {
			console.error("Revenue fetch error:", err);
			setError(err.message || "Failed to load revenue data");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStats();

		if (refreshInterval > 0) {
			const interval = setInterval(fetchStats, refreshInterval);
			return () => clearInterval(interval);
		}
	}, [refreshInterval]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
	};

	const formatNumber = (num: number) => {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(2) + "M";
		}
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + "k";
		}
		return num.toString();
	};

	const StatCard = ({
		title,
		value,
		icon,
		subtitle,
		trend,
		color = "emerald",
		loading: cardLoading,
	}: {
		title: string;
		value: React.ReactNode;
		icon: React.ReactNode;
		subtitle?: string;
		trend?: number;
		color?: "emerald" | "blue" | "purple" | "amber" | "rose" | "sky";
		loading?: boolean;
	}) => {
		const colors: Record<string, string> = {
			emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
			blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
			purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
			amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
			rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
			sky: "bg-sky-500/10 border-sky-500/20 text-sky-400",
		};

		return (
			<div className="bg-zinc-950/40 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
				<div className="flex items-start justify-between">
					<div>
						<p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
							{title}
						</p>
						{cardLoading ? (
							<div className="h-8 w-24 bg-zinc-800/50 rounded-lg animate-pulse mt-1" />
						) : (
							<p className="text-2xl font-bold text-white">{value}</p>
						)}
						{subtitle && (
							<p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
						)}
					</div>
					<div className={`p-2 rounded-xl border ${colors[color]}`}>{icon}</div>
				</div>
				{trend !== undefined && trend !== null && (
					<div className="flex items-center gap-1.5 mt-3 text-xs">
						{trend > 0 ? (
							<ArrowUp className="h-3 w-3 text-emerald-400" />
						) : trend < 0 ? (
							<ArrowDown className="h-3 w-3 text-rose-400" />
						) : null}
						{trend !== 0 && (
							<span
								className={trend > 0 ? "text-emerald-400" : "text-rose-400"}
							>
								{Math.abs(trend)}%
							</span>
						)}
						<span className="text-zinc-500">vs last period</span>
					</div>
				)}
			</div>
		);
	};

	if (loading) {
		return (
			<div className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="bg-zinc-950/40 border border-white/5 rounded-xl p-4"
						>
							<div className="h-4 w-20 bg-zinc-800/50 rounded-lg animate-pulse" />
							<div className="h-8 w-24 bg-zinc-800/50 rounded-lg animate-pulse mt-2" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-center">
				<p className="text-rose-400 text-sm">{error}</p>
				<button
					onClick={fetchStats}
					className="mt-3 text-xs text-zinc-400 hover:text-white transition-colors"
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-bold text-white">Revenue Analytics</h2>
					<p className="text-xs text-zinc-500">
						Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setShowDetails(!showDetails)}
						className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
					>
						{showDetails ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Eye className="h-4 w-4" />
						)}
					</button>
					<button
						onClick={fetchStats}
						disabled={loading}
						className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
					>
						{loading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<RefreshCw className="h-4 w-4" />
						)}
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
				<StatCard
					title="Total Revenue"
					value={formatCurrency(stats.totalRevenue)}
					icon={<Wallet className="h-4 w-4" />}
					color="emerald"
					subtitle={`${stats.totalTransactions} transactions`}
					loading={loading}
				/>

				<StatCard
					title="Website Builds ($5)"
					value={formatCurrency(stats.websiteBuildRevenue)}
					icon={<Package className="h-4 w-4" />}
					color="blue"
					subtitle={`${stats.websiteBuildCount} builds`}
					loading={loading}
				/>

				<StatCard
					title="Platform Fees (4%)"
					value={formatCurrency(stats.platformFeeRevenue)}
					icon={<Percent className="h-4 w-4" />}
					color="purple"
					subtitle={`${stats.platformFeeCount} transactions`}
					loading={loading}
				/>

				<StatCard
					title="Today's Revenue"
					value={formatCurrency(stats.todayTotal)}
					icon={<TrendingUp className="h-4 w-4" />}
					color="amber"
					subtitle={`Builds: ${formatCurrency(stats.todayWebsiteBuild)} · Fees: ${formatCurrency(stats.todayPlatformFee)}`}
					loading={loading}
				/>
			</div>

			{showDetails && (
				<div className="bg-zinc-950/40 border border-white/5 rounded-xl p-4 space-y-4 animate-in fade-in duration-300">
					<div className="flex items-center justify-between">
						<h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
							Detailed Breakdown
						</h4>
						<span className="text-[10px] text-zinc-500">
							Pending Escrow: {formatCurrency(stats.pendingEscrow)}
						</span>
					</div>

					<div className="space-y-3">
						<div>
							<div className="flex justify-between text-xs mb-1">
								<span className="text-zinc-400">Website Builds</span>
								<span className="text-white font-medium">
									{formatCurrency(stats.websiteBuildRevenue)}
								</span>
							</div>
							<div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
								<div
									className="h-full bg-blue-500 rounded-full transition-all duration-500"
									style={{
										width: `${stats.totalRevenue > 0 ? Math.min((stats.websiteBuildRevenue / stats.totalRevenue) * 100, 100) : 0}%`,
									}}
								/>
							</div>
						</div>

						<div>
							<div className="flex justify-between text-xs mb-1">
								<span className="text-zinc-400">Platform Fees</span>
								<span className="text-white font-medium">
									{formatCurrency(stats.platformFeeRevenue)}
								</span>
							</div>
							<div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
								<div
									className="h-full bg-purple-500 rounded-full transition-all duration-500"
									style={{
										width: `${stats.totalRevenue > 0 ? Math.min((stats.platformFeeRevenue / stats.totalRevenue) * 100, 100) : 0}%`,
									}}
								/>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
						<div>
							<p className="text-[10px] text-zinc-500">Total Builds</p>
							<p className="text-sm font-bold text-white">
								{stats.websiteBuildCount}
							</p>
						</div>
						<div>
							<p className="text-[10px] text-zinc-500">
								Total Fee Transactions
							</p>
							<p className="text-sm font-bold text-white">
								{stats.platformFeeCount}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
