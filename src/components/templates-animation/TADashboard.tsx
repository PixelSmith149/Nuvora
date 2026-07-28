// components/templates-animation/TADashboard.tsx
"use client";

import {
	Activity,
	AlertCircle,
	ArrowUpRight,
	Award,
	BarChart3,
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	Copy,
	Download,
	ExternalLink,
	Eye,
	Flame,
	Globe,
	Layers,
	LayoutTemplate,
	Loader2,
	Package,
	Plus,
	Rocket,
	Sparkles,
	Star,
	Store,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import {
	getAnimationPresetsClient,
	getAnimationsClient,
} from "@/lib/st/services/animation.client";
import {
	getTemplateStatsClient,
	getTemplatesClient,
} from "@/lib/st/services/template.client";
import type {
	Animation,
	AnimationPreset,
	Template,
} from "@/lib/st/types/templates-animation";

interface TADashboardProps {
	userId: string;
	username: string;
}

export function TADashboard({ userId, username }: TADashboardProps) {
	const router = useRouter();

	// ─── State ──────────────────────────────────────────────────────────
	const [templates, setTemplates] = useState<Template[]>([]);
	const [animations, setAnimations] = useState<Animation[]>([]);
	const [presets, setPresets] = useState<AnimationPreset[]>([]);
	const [loading, setLoading] = useState(true);
	const [storeStatus, setStoreStatus] = useState<{
		hasStore: boolean;
		isVerified: boolean;
	}>({
		hasStore: false,
		isVerified: false,
	});

	const [stats, setStats] = useState({
		totalTemplates: 0,
		publishedTemplates: 0,
		draftTemplates: 0,
		publicTemplates: 0,
		totalAnimations: 0,
		totalPresets: 0,
		totalViews: 0,
		totalDownloads: 0,
		totalClones: 0,
		templateGrowth: 0,
		animationGrowth: 0,
		mostViewedTemplate: null as Template | null,
		mostClonedTemplate: null as Template | null,
		recentTemplates: [] as Template[],
		recentAnimations: [] as Animation[],
		popularCategories: [] as { category: string; count: number }[],
		animationByType: [] as { type: string; count: number }[],
		publishedRate: 0,
		publicRate: 0,
	});

	// ─── Load Data ──────────────────────────────────────────────────────
	const loadData = useCallback(async () => {
		setLoading(true);

		try {
			const [
				templatesData,
				animationsData,
				presetsData,
				templateStats,
				storeResponse,
			] = await Promise.all([
				getTemplatesClient(),
				getAnimationsClient(),
				getAnimationPresetsClient(),
				getTemplateStatsClient(),
				fetch("/api/st/user/store-status"),
			]);

			const storeData = await storeResponse.json();
			setStoreStatus({
				hasStore: storeData.hasStore || false,
				isVerified: storeData.isVerified || false,
			});

			if (!storeResponse.ok) {
				console.error("Failed to fetch store status:", storeData.error);
				// Set default store status
				setStoreStatus({ hasStore: false, isVerified: false });
			} else {
				setStoreStatus({
					hasStore: storeData.hasStore || false,
					isVerified: storeData.isVerified || false,
				});
			}

			// ─── Sort templates by most viewed ──────────────────────────────
			const sortedByViews = [...templatesData].sort(
				(a, b) => (b.view_count || 0) - (a.view_count || 0),
			);
			const sortedByClones = [...templatesData].sort(
				(a, b) => (b.clone_count || 0) - (a.clone_count || 0),
			);

			// ─── Calculate growth (last 30 days) ────────────────────────────
			const now = new Date();
			const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

			const recentTemplates = templatesData.filter(
				(t) => new Date(t.created_at) > thirtyDaysAgo,
			);

			const recentAnimations = animationsData.filter(
				(a) => new Date(a.created_at) > thirtyDaysAgo,
			);

			// ─── Category popularity ─────────────────────────────────────────
			const categoryMap: Record<string, number> = {};
			templatesData.forEach((t) => {
				categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
			});
			const popularCategories = Object.entries(categoryMap)
				.map(([category, count]) => ({ category, count }))
				.sort((a, b) => b.count - a.count)
				.slice(0, 5);

			// ─── Animation by type ───────────────────────────────────────────
			const typeMap: Record<string, number> = {};
			animationsData.forEach((a) => {
				typeMap[a.type] = (typeMap[a.type] || 0) + 1;
			});
			const animationByType = Object.entries(typeMap)
				.map(([type, count]) => ({ type, count }))
				.sort((a, b) => b.count - a.count);

			// ─── Calculate rates ─────────────────────────────────────────────
			const publishedRate =
				templatesData.length > 0
					? (templatesData.filter((t) => t.is_published).length /
							templatesData.length) *
						100
					: 0;
			const publicRate =
				templatesData.length > 0
					? (templatesData.filter((t) => t.is_public).length /
							templatesData.length) *
						100
					: 0;

			// ─── Total views, downloads, clones ──────────────────────────────
			const totalViews = templatesData.reduce(
				(sum, t) => sum + (t.view_count || 0),
				0,
			);
			const totalDownloads = templatesData.reduce(
				(sum, t) => sum + (t.download_count || 0),
				0,
			);
			const totalClones = templatesData.reduce(
				(sum, t) => sum + (t.clone_count || 0),
				0,
			);

			setTemplates(templatesData);
			setAnimations(animationsData);
			setPresets(presetsData);
			setStoreStatus(storeData);

			setStats({
				totalTemplates: templateStats.total,
				publishedTemplates: templateStats.published,
				draftTemplates: templateStats.drafts,
				publicTemplates: templateStats.public,
				totalAnimations: animationsData.length,
				totalPresets: presetsData.length,
				totalViews,
				totalDownloads,
				totalClones,
				templateGrowth: recentTemplates.length,
				animationGrowth: recentAnimations.length,
				mostViewedTemplate: sortedByViews.length > 0 ? sortedByViews[0] : null,
				mostClonedTemplate:
					sortedByClones.length > 0 ? sortedByClones[0] : null,
				recentTemplates: templatesData.slice(0, 6),
				recentAnimations: animationsData.slice(0, 8),
				popularCategories,
				animationByType,
				publishedRate,
				publicRate,
			});
		} catch (error) {
			console.error("Failed to load T&A data:", error);
		} finally {
			setLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// ─── Loading State ──────────────────────────────────────────────────

	return (
		<div className="space-y-6">
			{/* ─── Header ────────────────────────────────────────────────── */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-white flex items-center gap-2">
						<LayoutTemplate className="h-6 w-6 text-emerald-400" />
						Templates & Animation Hub
					</h1>
					<p className="text-sm text-zinc-400">
						Create, manage, and export templates and animations
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					{/* ─── Store Status Indicator ────────────────────────────── */}
					{storeStatus.hasStore && storeStatus.isVerified && (
						<div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-400">
							<CheckCircle2 className="h-3 w-3" />
							Store Verified
						</div>
					)}
					{storeStatus.hasStore && !storeStatus.isVerified && (
						<div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-400">
							<AlertCircle className="h-3 w-3" />
							Store Pending
						</div>
					)}
					{!storeStatus.hasStore && (
						<button
							onClick={() => router.push(`/m/${username}/onboarding`)}
							className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 hover:bg-blue-500/20 transition-colors"
						>
							<Globe className="h-3 w-3" />
							Setup Store
						</button>
					)}

					<button
						onClick={() => router.push("/social-tenant/t-a/templates/new")}
						className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors"
					>
						<Plus className="h-4 w-4" />
						New Template
					</button>
					<button
						onClick={() => router.push("/social-tenant/t-a/animations/new")}
						className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition-colors"
					>
						<Sparkles className="h-4 w-4" />
						New Animation
					</button>
				</div>
			</div>

			{/* ─── Stats Grid ────────────────────────────────────────────── */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors group">
					<div className="flex items-center justify-between">
						<p className="text-2xl font-bold text-white">
							{stats.totalTemplates}
						</p>
						<LayoutTemplate className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
					</div>
					<p className="text-xs text-zinc-500">Total Templates</p>
					<div className="flex items-center gap-2 mt-1">
						{stats.templateGrowth > 0 && (
							<span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
								<ArrowUpRight className="h-3 w-3" />+{stats.templateGrowth} new
							</span>
						)}
						<span className="text-[10px] text-zinc-600">
							{stats.publishedRate.toFixed(0)}% published
						</span>
					</div>
					<div className="w-full h-0.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
						<div
							className="h-full bg-emerald-500 rounded-full transition-all"
							style={{ width: `${stats.publishedRate}%` }}
						/>
					</div>
				</div>

				<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors group">
					<div className="flex items-center justify-between">
						<p className="text-2xl font-bold text-white">
							{stats.publishedTemplates}
						</p>
						<Globe className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
					</div>
					<p className="text-xs text-zinc-500">Published</p>
					<div className="flex items-center gap-2 mt-1">
						<span className="text-[10px] text-blue-400 flex items-center gap-0.5">
							<Globe className="h-3 w-3" />
							{stats.publicTemplates} public
						</span>
					</div>
					{stats.publicRate > 0 && (
						<div className="w-full h-0.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
							<div
								className="h-full bg-blue-500 rounded-full transition-all"
								style={{ width: `${stats.publicRate}%` }}
							/>
						</div>
					)}
				</div>

				<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors group">
					<div className="flex items-center justify-between">
						<p className="text-2xl font-bold text-white">
							{stats.totalAnimations}
						</p>
						<Sparkles className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
					</div>
					<p className="text-xs text-zinc-500">Animations</p>
					{stats.animationGrowth > 0 && (
						<span className="text-[10px] text-purple-400 flex items-center gap-0.5 mt-1">
							<ArrowUpRight className="h-3 w-3" />+{stats.animationGrowth} new
						</span>
					)}
					{stats.animationByType.length > 0 && (
						<div className="flex flex-wrap gap-1 mt-2">
							{stats.animationByType.slice(0, 3).map(({ type, count }) => (
								<span
									key={type}
									className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 capitalize"
								>
									{type}: {count}
								</span>
							))}
						</div>
					)}
				</div>

				<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors group">
					<div className="flex items-center justify-between">
						<p className="text-2xl font-bold text-white">
							{stats.totalPresets}
						</p>
						<Layers className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
					</div>
					<p className="text-xs text-zinc-500">Presets Available</p>
					<p className="text-[10px] text-zinc-500 mt-1">
						Ready to use in your projects
					</p>
				</div>
			</div>

			{/* ─── Engagement Stats ────────────────────────────────────────── */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
				<div className="p-3 bg-zinc-950/40 border border-white/5 rounded-xl">
					<div className="flex items-center gap-2">
						<Eye className="h-4 w-4 text-blue-400" />
						<span className="text-sm font-bold text-white">
							{stats.totalViews}
						</span>
					</div>
					<p className="text-[10px] text-zinc-500">Total Views</p>
				</div>
				<div className="p-3 bg-zinc-950/40 border border-white/5 rounded-xl">
					<div className="flex items-center gap-2">
						<Download className="h-4 w-4 text-emerald-400" />
						<span className="text-sm font-bold text-white">
							{stats.totalDownloads}
						</span>
					</div>
					<p className="text-[10px] text-zinc-500">Total Downloads</p>
				</div>
				<div className="p-3 bg-zinc-950/40 border border-white/5 rounded-xl">
					<div className="flex items-center gap-2">
						<Copy className="h-4 w-4 text-purple-400" />
						<span className="text-sm font-bold text-white">
							{stats.totalClones}
						</span>
					</div>
					<p className="text-[10px] text-zinc-500">Total Clones</p>
				</div>
				<div className="p-3 bg-zinc-950/40 border border-white/5 rounded-xl">
					<div className="flex items-center gap-2">
						<TrendingUp className="h-4 w-4 text-amber-400" />
						<span className="text-sm font-bold text-white">
							{stats.totalTemplates + stats.totalAnimations}
						</span>
					</div>
					<p className="text-[10px] text-zinc-500">Total Assets</p>
				</div>
			</div>

			{/* ─── Top Performing ───────────────────────────────────────────── */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{stats.mostViewedTemplate && (
					<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
						<div className="flex items-center gap-2 mb-2">
							<Flame className="h-4 w-4 text-orange-400" />
							<h3 className="text-xs font-bold text-white">
								Most Viewed Template
							</h3>
						</div>
						<div
							onClick={() =>
								router.push(
									`/social-tenant/t-a/templates/${stats.mostViewedTemplate!.id}`,
								)
							}
							className="flex items-center gap-3 cursor-pointer group"
						>
							<div className="w-16 h-16 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
								{stats.mostViewedTemplate.preview_image ? (
									<img
										src={stats.mostViewedTemplate.preview_image}
										alt={stats.mostViewedTemplate.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center bg-zinc-800">
										<LayoutTemplate className="h-6 w-6 text-zinc-600" />
									</div>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
									{stats.mostViewedTemplate.name}
								</p>
								<div className="flex items-center gap-3 text-xs text-zinc-500">
									<span className="flex items-center gap-1">
										<Eye className="h-3 w-3" />
										{stats.mostViewedTemplate.view_count || 0} views
									</span>
									<span className="flex items-center gap-1">
										<Copy className="h-3 w-3" />
										{stats.mostViewedTemplate.clone_count || 0} clones
									</span>
								</div>
							</div>
							<ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
						</div>
					</div>
				)}

				{stats.mostClonedTemplate &&
					stats.mostClonedTemplate.id !== stats.mostViewedTemplate?.id && (
						<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
							<div className="flex items-center gap-2 mb-2">
								<Award className="h-4 w-4 text-yellow-400" />
								<h3 className="text-xs font-bold text-white">
									Most Cloned Template
								</h3>
							</div>
							<div
								onClick={() =>
									router.push(
										`/social-tenant/t-a/templates/${stats.mostClonedTemplate!.id}`,
									)
								}
								className="flex items-center gap-3 cursor-pointer group"
							>
								<div className="w-16 h-16 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0">
									{stats.mostClonedTemplate.preview_image ? (
										<img
											src={stats.mostClonedTemplate.preview_image}
											alt={stats.mostClonedTemplate.name}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center bg-zinc-800">
											<LayoutTemplate className="h-6 w-6 text-zinc-600" />
										</div>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
										{stats.mostClonedTemplate.name}
									</p>
									<div className="flex items-center gap-3 text-xs text-zinc-500">
										<span className="flex items-center gap-1">
											<Copy className="h-3 w-3" />
											{stats.mostClonedTemplate.clone_count || 0} clones
										</span>
										<span className="flex items-center gap-1">
											<Eye className="h-3 w-3" />
											{stats.mostClonedTemplate.view_count || 0} views
										</span>
									</div>
								</div>
								<ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
							</div>
						</div>
					)}
			</div>

			{/* ─── Quick Actions ────────────────────────────────────────── */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
				<button
					onClick={() => router.push("/social-tenant/t-a/templates")}
					className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl hover:border-white/15 transition-all text-left group"
				>
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover:scale-110 transition-transform">
							<LayoutTemplate className="h-5 w-5 text-emerald-400" />
						</div>
						<div>
							<p className="text-sm font-bold text-white">Templates</p>
							<p className="text-xs text-zinc-500">
								{stats.totalTemplates} in library
							</p>
						</div>
						<ArrowUpRight className="h-4 w-4 text-zinc-600 ml-auto" />
					</div>
				</button>

				<button
					onClick={() => router.push("/social-tenant/t-a/animations")}
					className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl hover:border-white/15 transition-all text-left group"
				>
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:scale-110 transition-transform">
							<Sparkles className="h-5 w-5 text-purple-400" />
						</div>
						<div>
							<p className="text-sm font-bold text-white">Animations</p>
							<p className="text-xs text-zinc-500">
								{stats.totalAnimations} created
							</p>
						</div>
						<ArrowUpRight className="h-4 w-4 text-zinc-600 ml-auto" />
					</div>
				</button>

				<button
					onClick={() => router.push("/social-tenant/t-a/public")}
					className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl hover:border-white/15 transition-all text-left group"
				>
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 group-hover:scale-110 transition-transform">
							<Globe className="h-5 w-5 text-amber-400" />
						</div>
						<div>
							<p className="text-sm font-bold text-white">Public Gallery</p>
							<p className="text-xs text-zinc-500">Explore community</p>
						</div>
						<ArrowUpRight className="h-4 w-4 text-zinc-600 ml-auto" />
					</div>
				</button>

				<button
					onClick={() => router.push("/m/global-market")}
					className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl hover:border-white/15 transition-all text-left group"
				>
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform">
							<Store className="h-5 w-5 text-blue-400" />
						</div>
						<div>
							<p className="text-sm font-bold text-white">Global Market</p>
							<p className="text-xs text-zinc-500">
								{storeStatus.isVerified
									? "List your assets"
									: "Setup your store"}
							</p>
						</div>
						<ArrowUpRight className="h-4 w-4 text-zinc-600 ml-auto" />
					</div>
				</button>
			</div>

			{/* ─── Popular Categories ───────────────────────────────────────── */}
			{stats.popularCategories.length > 0 && (
				<div className="border-t border-white/5 pt-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-sm font-bold text-white flex items-center gap-2">
							<BarChart3 className="h-4 w-4 text-zinc-400" />
							Popular Categories
						</h2>
					</div>
					<div className="flex flex-wrap gap-2">
						{stats.popularCategories.map(({ category, count }) => (
							<button
								key={category}
								onClick={() =>
									router.push(
										`/social-tenant/t-a/templates?category=${category}`,
									)
								}
								className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950/40 border border-white/5 rounded-full hover:border-white/15 transition-all text-sm group"
							>
								<span className="capitalize text-zinc-300">{category}</span>
								<span className="text-xs text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded-full">
									{count}
								</span>
							</button>
						))}
					</div>
				</div>
			)}

			{/* ─── Recent Templates ───────────────────────────────────────── */}
			<div className="border-t border-white/5 pt-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-sm font-bold text-white flex items-center gap-2">
						<Clock className="h-4 w-4 text-zinc-400" />
						Recent Templates
					</h2>
					<button
						onClick={() => router.push("/social-tenant/t-a/templates")}
						className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
					>
						View All
						<ArrowUpRight className="h-3 w-3" />
					</button>
				</div>

				{stats.recentTemplates.length === 0 ? (
					<div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
						<LayoutTemplate className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
						<p className="text-sm text-zinc-400">No templates yet</p>
						<p className="text-xs text-zinc-500 mt-1">
							Create your first template to get started
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{stats.recentTemplates.map((template) => (
							<div
								key={template.id}
								onClick={() =>
									router.push(`/social-tenant/t-a/templates/${template.id}`)
								}
								className="group bg-zinc-950/40 border border-white/5 rounded-xl overflow-hidden hover:border-white/15 transition-all cursor-pointer"
							>
								<div className="aspect-video bg-zinc-900 relative overflow-hidden">
									{template.preview_image ? (
										<img
											src={template.preview_image}
											alt={template.name}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
											loading="lazy"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
											<LayoutTemplate className="h-8 w-8 text-zinc-700" />
										</div>
									)}
									<div className="absolute top-2 right-2">
										<span
											className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${
												template.is_published
													? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
													: "bg-amber-500/10 border-amber-500/20 text-amber-400"
											}`}
										>
											{template.is_published ? "Published" : "Draft"}
										</span>
									</div>
									{template.is_public && (
										<div className="absolute top-2 left-2">
											<span className="text-[8px] font-bold px-2 py-0.5 rounded-full border bg-blue-500/10 border-blue-500/20 text-blue-400 flex items-center gap-0.5">
												<Globe className="h-2.5 w-2.5" />
												Public
											</span>
										</div>
									)}
								</div>
								<div className="p-3">
									<h3 className="text-sm font-bold text-white truncate">
										{template.name}
									</h3>
									<div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
										<span className="capitalize">{template.category}</span>
										<span>•</span>
										<span className="flex items-center gap-1">
											<Eye className="h-3 w-3" />
											{template.view_count || 0}
										</span>
										<span className="flex items-center gap-1">
											<Download className="h-3 w-3" />
											{template.download_count || 0}
										</span>
										<span className="flex items-center gap-1">
											<Copy className="h-3 w-3" />
											{template.clone_count || 0}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* ─── Recent Animations ───────────────────────────────────────── */}
			<div className="border-t border-white/5 pt-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-sm font-bold text-white flex items-center gap-2">
						<Sparkles className="h-4 w-4 text-purple-400" />
						Recent Animations
					</h2>
					<button
						onClick={() => router.push("/social-tenant/t-a/animations")}
						className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
					>
						View All
						<ArrowUpRight className="h-3 w-3" />
					</button>
				</div>

				{stats.recentAnimations.length === 0 ? (
					<div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
						<Sparkles className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
						<p className="text-sm text-zinc-400">No animations yet</p>
						<p className="text-xs text-zinc-500 mt-1">
							Create animations to enhance your templates
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
						{stats.recentAnimations.map((animation) => (
							<div
								key={animation.id}
								onClick={() =>
									router.push(`/social-tenant/t-a/animations/${animation.id}`)
								}
								className="p-3 bg-zinc-950/40 border border-white/5 rounded-xl hover:border-white/15 transition-all cursor-pointer group"
							>
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:scale-110 transition-transform">
										<Sparkles className="h-4 w-4 text-purple-400" />
									</div>
									<div className="flex-1 min-w-0">
										<h4 className="text-sm font-bold text-white truncate">
											{animation.name}
										</h4>
										<div className="flex items-center gap-2 text-[10px] text-zinc-500">
											<span className="capitalize">{animation.type}</span>
											<span>•</span>
											<span>{animation.duration}ms</span>
											{animation.trigger && (
												<>
													<span>•</span>
													<span className="capitalize">
														{animation.trigger}
													</span>
												</>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* ─── Footer Stats ──────────────────────────────────────────────── */}
			<div className="border-t border-white/5 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
				<div className="flex items-center gap-4 flex-wrap">
					<span className="flex items-center gap-1">
						<CheckCircle2 className="h-3 w-3 text-emerald-400" />
						{stats.publishedTemplates} published templates
					</span>
					<span className="flex items-center gap-1">
						<Clock className="h-3 w-3 text-zinc-500" />
						{stats.draftTemplates} drafts
					</span>
					<span className="flex items-center gap-1">
						<Users className="h-3 w-3 text-blue-400" />
						{stats.publicTemplates} public assets
					</span>
					<span className="flex items-center gap-1">
						<Rocket className="h-3 w-3 text-purple-400" />
						{stats.totalPresets} presets available
					</span>
				</div>
				<div>
					<span>Last updated: {new Date().toISOString().split("T")[0]}</span>
				</div>
			</div>
		</div>
	);
}
