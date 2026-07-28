// components/social-tenant/Dashboard.tsx

"use client";

import {
	AlertCircle,
	ArrowRight,
	Building2,
	CheckCircle2,
	Clock,
	Edit3,
	ExternalLink,
	Eye,
	Globe,
	LayoutTemplate,
	Loader2,
	MoreVertical,
	Plus,
	Rocket,
	Settings,
	Sparkles,
	Star,
	Trash2,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSocialTenant } from "@/lib/hooks/useSocialTenant";

interface DashboardProps {
	userId: string;
	username: string;
}

export function Dashboard({ userId, username }: DashboardProps) {
	const router = useRouter();
	const { sites, loading, error, createSite, deleteSite, fetchSites } =
		useSocialTenant();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [siteName, setSiteName] = useState("");
	const [siteSlug, setSiteSlug] = useState("");
	const [slugError, setSlugError] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	// ─── Stats ──────────────────────────────────────────────────
	const stats = {
		total: sites.length,
		published: sites.filter((s) => s.status === "published").length,
		draft: sites.filter((s) => s.status === "draft").length,
		generating: sites.filter((s) => s.status === "generating").length,
	};

	// ─── Create Site ───────────────────────────────────────────
	const handleCreateSite = async () => {
		if (!siteName.trim()) return;
		if (!siteSlug.trim()) {
			setSlugError("Please choose a website name");
			return;
		}

		const slugRegex = /^[a-z0-9-]+$/;
		if (!slugRegex.test(siteSlug.toLowerCase())) {
			setSlugError("Only lowercase letters, numbers, and hyphens allowed");
			return;
		}

		setIsCreating(true);
		setSlugError("");
		try {
			const site = await createSite(
				userId,
				username,
				siteName.trim(),
				siteSlug.toLowerCase().trim(),
			);
			if (site) {
				setShowCreateModal(false);
				setSiteName("");
				setSiteSlug("");
				router.push(`/st/builder/${site.id}`);
			}
		} catch (err: any) {
			setSlugError(err.message || "Failed to create site");
		} finally {
			setIsCreating(false);
		}
	};

	// ─── Delete Site ───────────────────────────────────────────
	const handleDeleteSite = async (siteId: string) => {
		if (
			!confirm(
				"Are you sure you want to delete this site? This action cannot be undone.",
			)
		)
			return;
		setDeletingId(siteId);
		try {
			await deleteSite(siteId);
		} catch (err) {
			console.error("Delete error:", err);
		} finally {
			setDeletingId(null);
		}
	};

	// ─── Loading State ─────────────────────────────────────────
	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
				<p className="text-sm text-zinc-500 mt-4">Loading your sites...</p>
			</div>
		);
	}

	// ─── Empty State ───────────────────────────────────────────
	if (sites.length === 0 && !loading) {
		return (
			<div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
				{/* Hero */}
				<div className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/60 backdrop-blur-xl">
					{/* Background Glow */}
					<div className="pointer-events-none absolute inset-0">
						<div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_55%)]" />
					</div>

					<div className="relative flex flex-col items-center justify-center px-6 py-12 sm:px-10 sm:py-16 text-center">
						<div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-3xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.08)]">
							<Building2 className="h-11 w-11 text-emerald-400" />
						</div>

						<h2 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
							Build Your First Website
						</h2>

						<p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
							Create stunning AI-powered websites in minutes with a premium
							visual builder. No coding required.
						</p>

						<Button
							onClick={() => setShowCreateModal(true)}
							className="mt-10 h-14 rounded-2xl bg-emerald-600 px-8 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:bg-emerald-500 hover:scale-[1.02]"
						>
							<Plus className="mr-2 h-5 w-5" />
							Start Building
						</Button>
					</div>
				</div>

				{/* Features */}
				<div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
					<div className="group rounded-2xl border border-white/5 bg-zinc-950/50 p-6 text-center backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/20 hover:bg-zinc-900/70">
						<Sparkles className="mx-auto mb-4 h-9 w-9 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
						<h3 className="text-sm font-semibold text-white">
							AI-Powered Design
						</h3>
						<p className="mt-2 text-xs leading-6 text-zinc-500">
							Describe your vision and watch it come to life.
						</p>
					</div>

					<div className="group rounded-2xl border border-white/5 bg-zinc-950/50 p-6 text-center backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/20 hover:bg-zinc-900/70">
						<Globe className="mx-auto mb-4 h-9 w-9 text-sky-400 transition-transform duration-300 group-hover:scale-110" />
						<h3 className="text-sm font-semibold text-white">
							Instant Publishing
						</h3>
						<p className="mt-2 text-xs leading-6 text-zinc-500">
							Launch immediately with your own domain or subdomain.
						</p>
					</div>

					<div className="group rounded-2xl border border-white/5 bg-zinc-950/50 p-6 text-center backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/20 hover:bg-zinc-900/70">
						<LayoutTemplate className="mx-auto mb-4 h-9 w-9 text-purple-400 transition-transform duration-300 group-hover:scale-110" />
						<h3 className="text-sm font-semibold text-white">Easy Editing</h3>
						<p className="mt-2 text-xs leading-6 text-zinc-500">
							Customize text, colors and layouts with intuitive controls.
						</p>
					</div>
				</div>

				{/* Create Modal */}
				{showCreateModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
						<div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/95 shadow-2xl">
							<div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_70%)]" />

							<div className="relative p-8">
								<h3 className="text-2xl font-bold text-white">
									Create New Website
								</h3>

								<p className="mt-2 text-sm text-zinc-400">
									Give your website a name and reserve its URL.
								</p>

								{/* Site Name */}
								<div className="mt-8 space-y-2">
									<Label className="text-xs font-medium text-zinc-400">
										Site Name
									</Label>

									<Input
										value={siteName}
										onChange={(e) => setSiteName(e.target.value)}
										placeholder="My Awesome Website"
										className="h-12 rounded-2xl border-white/10 bg-black/70 text-white"
										onKeyDown={(e) => e.key === "Enter" && handleCreateSite()}
										autoFocus
									/>
								</div>

								{/* Site Slug */}
								<div className="mt-5 space-y-2">
									<Label className="text-xs font-medium text-zinc-400">
										Website URL
									</Label>

									<div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-3">
										<span className="text-xs whitespace-nowrap text-zinc-500">
											primeboostage.com/s/
										</span>

										<Input
											value={siteSlug}
											onChange={(e) => {
												setSiteSlug(
													e.target.value
														.toLowerCase()
														.replace(/[^a-z0-9-]/g, ""),
												);
												setSlugError("");
											}}
											placeholder="crumb-bakery"
											className="h-12 flex-1 border-0 bg-transparent px-0 text-white shadow-none focus-visible:ring-0"
										/>
									</div>

									{slugError && (
										<p className="text-[10px] text-red-400">{slugError}</p>
									)}

									<p className="text-[10px] text-zinc-500">
										Only lowercase letters, numbers and hyphens are allowed.
									</p>
								</div>

								<div className="mt-8 flex gap-3">
									<Button
										onClick={() => setShowCreateModal(false)}
										variant="outline"
										className="h-12 flex-1 rounded-2xl border-white/10 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white"
									>
										Cancel
									</Button>

									<Button
										onClick={handleCreateSite}
										disabled={
											!siteName.trim() || !siteSlug.trim() || isCreating
										}
										className="h-12 flex-1 rounded-2xl bg-emerald-600 font-semibold text-white hover:bg-emerald-500"
									>
										{isCreating ? (
											<Loader2 className="h-5 w-5 animate-spin" />
										) : (
											<div className="flex items-center gap-2">
												<Rocket className="h-4 w-4" />
												Create & Build
											</div>
										)}
									</Button>
								</div>

								<p className="mt-6 text-center text-[10px] text-zinc-500">
									You will be charged $5.00 per full stack frontend/backend
									website.
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}

	// ─── Main Render ────────────────────────────────────────────
	return (
		<div className="max-w-6xl mx-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold text-white">My Websites</h1>
					<p className="text-sm text-zinc-400 mt-1">
						Manage and build your websites. {sites.length}{" "}
						{sites.length === 1 ? "site" : "sites"} total.
					</p>
				</div>
				<Button
					onClick={() => setShowCreateModal(true)}
					className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-5 py-2.5 text-sm flex items-center gap-2"
				>
					<Plus className="h-4 w-4" />
					New Site
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
				<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
					<p className="text-2xl font-bold text-white">{stats.total}</p>
					<p className="text-xs text-zinc-500">Total Sites</p>
				</div>
				<div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
					<p className="text-2xl font-bold text-emerald-400">
						{stats.published}
					</p>
					<p className="text-xs text-zinc-500">Published</p>
				</div>
				<div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
					<p className="text-2xl font-bold text-amber-400">{stats.draft}</p>
					<p className="text-xs text-zinc-500">Drafts</p>
				</div>
				<div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
					<p className="text-2xl font-bold text-purple-400">
						{stats.generating}
					</p>
					<p className="text-xs text-zinc-500">Generating</p>
				</div>
			</div>

			{/* Sites Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{sites.map((site) => (
					<div
						key={site.id}
						className="group bg-zinc-950/40 border border-white/5 rounded-xl overflow-hidden hover:border-white/15 transition-all"
					>
						{/* Preview/Image Placeholder */}
						<div className="aspect-[16/9] bg-zinc-900 relative overflow-hidden">
							{site.html_code ? (
								<div
									className="w-full h-full overflow-hidden pointer-events-none opacity-60 scale-105"
									dangerouslySetInnerHTML={{
										__html: site.html_code.slice(0, 1000),
									}}
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
									<Building2 className="h-12 w-12 text-zinc-700" />
								</div>
							)}
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

							{/* Status Badge */}
							<div className="absolute top-3 right-3">
								<span
									className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
										site.status === "published"
											? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
											: site.status === "generating"
												? "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
												: site.status === "failed"
													? "bg-red-500/10 border-red-500/20 text-red-400"
													: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
									}`}
								>
									{site.status === "published" && (
										<CheckCircle2 className="h-3 w-3 inline mr-1" />
									)}
									{site.status.charAt(0).toUpperCase() + site.status.slice(1)}
								</span>
							</div>

							{/* ✅ Site Slug Badge */}
							{site.site_slug && site.status === "published" && (
								<div className="absolute bottom-3 left-3">
									<span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-zinc-300">
										/s/{site.site_slug}
									</span>
								</div>
							)}
						</div>

						{/* Content */}
						<div className="p-4">
							<div className="flex items-start justify-between">
								<div>
									<h3 className="text-sm font-bold text-white truncate">
										{site.site_name}
									</h3>
									<p className="text-[10px] text-zinc-500 mt-0.5">
										{new Date(site.created_at).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
											year: "numeric",
										})}
									</p>
								</div>
								<div className="flex items-center gap-1">
									{/* ✅ Fixed: site_slug instead of public_url_id */}
									{site.status === "published" && site.site_slug && (
										<Link
											href={`/s/${site.site_slug}`}
											target="_blank"
											className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-emerald-400 transition-colors"
										>
											<ExternalLink className="h-4 w-4" />
										</Link>
									)}
									<button
										onClick={() => handleDeleteSite(site.id)}
										disabled={deletingId === site.id}
										className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
									>
										{deletingId === site.id ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Trash2 className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-2 mt-4">
								{/* ✅ Fixed: site_slug instead of public_url_id */}
								{site.status === "published" && site.site_slug ? (
									<Link
										href={`/s/${site.site_slug}`}
										target="_blank"
										className="flex-1 bg-zinc-900/50 hover:bg-zinc-800 text-white rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
									>
										<Eye className="h-3.5 w-3.5" />
										View Site
									</Link>
								) : site.status === "generating" ? (
									<div className="flex-1 bg-amber-500/10 text-amber-400 rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1.5">
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
										Building...
									</div>
								) : (
									<Link
										href={`/st/builder/${site.id}`}
										className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
									>
										<Rocket className="h-3.5 w-3.5" />
										Start Build
									</Link>
								)}
								<Link
									href={`/st/settings/${site.id}`}
									className="p-2 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
								>
									<Settings className="h-4 w-4" />
								</Link>
							</div>

							{/* Session Status */}
							{site.is_session_active && (
								<div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400">
									<Clock className="h-3 w-3" />
									<span>Session active</span>
									{site.session_expires_at && (
										<span className="text-zinc-500">
											• Expires{" "}
											{new Date(site.session_expires_at).toLocaleDateString()}
										</span>
									)}
								</div>
							)}
						</div>
					</div>
				))}

				{/* Add New Site Card */}
				<div
					onClick={() => setShowCreateModal(true)}
					className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center hover:border-emerald-500/30 transition-all cursor-pointer group min-h-[220px]"
				>
					<div className="p-3 rounded-full bg-zinc-900/50 group-hover:bg-emerald-500/10 transition-colors mb-3">
						<Plus className="h-8 w-8 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
					</div>
					<p className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
						Create New Site
					</p>
					<p className="text-xs text-zinc-600 mt-1">Build another website</p>
				</div>
			</div>

			{/* Create Modal */}
			{showCreateModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
					<div className="bg-zinc-950 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
						<h3 className="text-xl font-bold text-white mb-2">
							Create New Website
						</h3>
						<p className="text-sm text-zinc-400 mb-6">
							Name your site to get started.
						</p>

						{/* Site Name */}
						<div className="space-y-1.5">
							<Label className="text-xs font-medium text-zinc-400">
								Site Name
							</Label>
							<Input
								value={siteName}
								onChange={(e) => setSiteName(e.target.value)}
								placeholder="My Awesome Website"
								className="bg-black border-white/10 text-white rounded-xl h-12 text-sm"
								onKeyDown={(e) => e.key === "Enter" && handleCreateSite()}
								autoFocus
							/>
						</div>

						{/* Site Slug */}
						<div className="space-y-1.5 mt-4">
							<Label className="text-xs font-medium text-zinc-400">
								Website URL
							</Label>
							<div className="flex items-center gap-2">
								<span className="text-xs text-zinc-500 whitespace-nowrap">
									primeboostage.com/s/
								</span>
								<Input
									value={siteSlug}
									onChange={(e) => {
										setSiteSlug(
											e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
										);
										setSlugError("");
									}}
									placeholder="e.g., crumb-bakery"
									className="bg-black border-white/10 text-white rounded-xl h-10 text-sm flex-1"
								/>
							</div>
							{slugError && (
								<p className="text-[10px] text-red-400">{slugError}</p>
							)}
							<p className="text-[10px] text-zinc-500">
								Only lowercase letters, numbers, and hyphens allowed
							</p>
						</div>

						<div className="flex gap-3 mt-6">
							<Button
								onClick={() => setShowCreateModal(false)}
								variant="outline"
								className="flex-1 border-white/10 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl h-11"
							>
								Cancel
							</Button>
							<Button
								onClick={handleCreateSite}
								disabled={!siteName.trim() || !siteSlug.trim() || isCreating}
								className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11"
							>
								{isCreating ? (
									<Loader2 className="h-5 w-5 animate-spin" />
								) : (
									<div className="flex items-center gap-2">
										<Rocket className="h-4 w-4" />
										Create & Build
									</div>
								)}
							</Button>
						</div>

						<p className="text-[10px] text-zinc-500 text-center mt-4">
							You will be charged $5.00 when you generate your website.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
