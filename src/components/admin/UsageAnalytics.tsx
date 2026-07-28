// components/admin/UsageAnalytics.tsx

"use client";

import {
	Activity,
	BarChart3,
	Cpu,
	DollarSign,
	Eye,
	EyeOff,
	Globe,
	Loader2,
	RefreshCw,
	Sparkles,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UsageStats {
	totalTokens: number;
	totalTokenCost: number;
	totalSellers: number;
	activeSellers: number;
	totalBuilds: number;
	avgTokensPerBuild: number;
	avgCostPerBuild: number;
	tokenUsageTrend: number;
	lastUpdated: string;
}

interface UsageAnalyticsProps {
	refreshInterval?: number;
}

export function UsageAnalytics({
	refreshInterval = 30000,
}: UsageAnalyticsProps) {
	const supabase = createClient();
	const [stats, setStats] = useState<UsageStats>({
		totalTokens: 0,
		totalTokenCost: 0,
		totalSellers: 0,
		activeSellers: 0,
		totalBuilds: 0,
		avgTokensPerBuild: 0,
		avgCostPerBuild: 0,
		tokenUsageTrend: 0,
		lastUpdated: new Date().toISOString(),
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showDetails, setShowDetails] = useState(false);

	const fetchStats = async () => {
		try {
			const response = await fetch("/api/admin/usage/stats");
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to fetch usage stats");
			}
			const data = await response.json();
			setStats({
				...data,
				lastUpdated: new Date().toISOString(),
			});
			setError(null);
		} catch (err: any) {
			console.error("Usage fetch error:", err);
			setError(err.message || "Failed to load usage data");
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
			minimumFractionDigits: 4,
			maximumFractionDigits: 4,
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
					<h2 className="text-lg font-bold text-white">Usage Analytics</h2>
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
					title="Total Tokens"
					value={formatNumber(stats.totalTokens)}
					icon={<Sparkles className="h-4 w-4" />}
					color="emerald"
					subtitle={`~${stats.avgTokensPerBuild.toFixed(0)} per build`}
					loading={loading}
				/>

				<StatCard
					title="Token Cost"
					value={formatCurrency(stats.totalTokenCost)}
					icon={<DollarSign className="h-4 w-4" />}
					color="amber"
					subtitle={`Avg $${stats.avgCostPerBuild.toFixed(4)} per build`}
					loading={loading}
				/>

				<StatCard
					title="Total Sellers"
					value={formatNumber(stats.totalSellers)}
					icon={<Users className="h-4 w-4" />}
					color="blue"
					subtitle={`${stats.activeSellers} active`}
					loading={loading}
				/>

				<StatCard
					title="Total Builds"
					value={formatNumber(stats.totalBuilds)}
					icon={<Zap className="h-4 w-4" />}
					color="purple"
					subtitle={`Trend: ${stats.tokenUsageTrend > 0 ? "📈" : "📉"} ${Math.abs(stats.tokenUsageTrend)}%`}
					loading={loading}
				/>
			</div>

			{showDetails && (
				<div className="bg-zinc-950/40 border border-white/5 rounded-xl p-4 space-y-4 animate-in fade-in duration-300">
					<div className="flex items-center justify-between">
						<h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
							Detailed Breakdown
						</h4>
						<span className="text-[10px] text-zinc-500">Live metrics</span>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<div className="flex justify-between text-xs">
								<span className="text-zinc-400">Total Builds</span>
								<span className="text-white font-medium">
									{stats.totalBuilds}
								</span>
							</div>
							<div className="flex justify-between text-xs">
								<span className="text-zinc-400">Avg Tokens/Build</span>
								<span className="text-white font-medium">
									{stats.avgTokensPerBuild.toFixed(0)}
								</span>
							</div>
						</div>
						<div className="space-y-2">
							<div className="flex justify-between text-xs">
								<span className="text-zinc-400">Total Sellers</span>
								<span className="text-white font-medium">
									{stats.totalSellers}
								</span>
							</div>
							<div className="flex justify-between text-xs">
								<span className="text-zinc-400">Active Sellers</span>
								<span className="text-emerald-400 font-medium">
									{stats.activeSellers}
								</span>
							</div>
						</div>
					</div>

					<div className="border-t border-white/5 pt-3">
						<div className="flex items-center gap-2 text-xs">
							<Activity className="h-4 w-4 text-zinc-500" />
							<span className="text-zinc-400">Token Usage Trend</span>
							<span
								className={
									stats.tokenUsageTrend > 0
										? "text-emerald-400"
										: "text-rose-400"
								}
							>
								{stats.tokenUsageTrend > 0 ? "+" : ""}
								{stats.tokenUsageTrend}%
							</span>
							<span className="text-zinc-600">vs last period</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
