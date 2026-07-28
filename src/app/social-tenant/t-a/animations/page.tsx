// app/social-tenant/t-a/animations/page.tsx
"use client";

import {
	AlertCircle,
	Filter,
	LayoutTemplate,
	Loader2,
	Plus,
	Search,
	Sparkles,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { AnimationCard } from "@/components/templates-animation/AnimationCard";
import { ConfirmDeleteModal } from "@/components/templates-animation/ConfirmDeleteModal";
import { GridSkeleton } from "@/components/ui/spinner";
import type { Animation } from "@/lib/st/types/templates-animation";
import { useToast } from "@/lib/use-toast";
import { useUser } from "@/lib/useAuth";

const ANIMATION_TYPES = [
	{ value: "all", label: "All Types" },
	{ value: "fade", label: "Fade" },
	{ value: "slide", label: "Slide" },
	{ value: "bounce", label: "Bounce" },
	{ value: "rotate", label: "Rotate" },
	{ value: "scale", label: "Scale" },
	{ value: "custom", label: "Custom" },
];

const TRIGGERS = [
	{ value: "all", label: "All Triggers" },
	{ value: "load", label: "On Load" },
	{ value: "scroll", label: "On Scroll" },
	{ value: "hover", label: "On Hover" },
	{ value: "click", label: "On Click" },
];

export default function AnimationsPage() {
	const router = useRouter();
	const { user, loading: userLoading } = useUser();

	// ─── State ──────────────────────────────────────────────────────────
	const [animations, setAnimations] = useState<Animation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Filters
	const [search, setSearch] = useState("");
	const [type, setType] = useState("all");
	const [trigger, setTrigger] = useState("all");
	const [showFilters, setShowFilters] = useState(false);

	// Pagination
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [totalItems, setTotalItems] = useState(0);
	const limit = 12;

	// Modals
	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		animation: Animation | null;
	}>({
		isOpen: false,
		animation: null,
	});
	const [isDeleting, setIsDeleting] = useState(false);

	// Toast
	const { toast } = useToast();
	// ─── Load Animations ──────────────────────────────────────────────
	const loadAnimations = useCallback(async () => {
		if (!user) return;

		setLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				page: String(page),
				limit: String(limit),
			});

			if (type !== "all") params.append("type", type);
			if (trigger !== "all") params.append("trigger", trigger);
			if (search) params.append("search", search);

			const response = await fetch(
				`/api/st/t-a/animations?${params.toString()}`,
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to load animations");
			}

			setAnimations(data.animations || []);
			setTotalPages(data.pagination?.totalPages || 0);
			setTotalItems(data.pagination?.total || 0);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [user, page, type, trigger, search]);

	useEffect(() => {
		loadAnimations();
	}, [loadAnimations]);

	// ─── Handlers ──────────────────────────────────────────────────────
	const handleDelete = (animation: Animation) => {
		setDeleteModal({ isOpen: true, animation });
	};

	const handleDeleteConfirm = async () => {
		if (!deleteModal.animation) return;

		setIsDeleting(true);
		try {
			const response = await fetch(
				`/api/st/t-a/animations/${deleteModal.animation.id}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to delete animation");
			}

			toast({
				title: "Animation Deleted",
				description: "Animation removed successfully",
				variant: "success",
			});

			setDeleteModal({ isOpen: false, animation: null });
			loadAnimations();
		} catch (err: any) {
			toast({
				title: "Delete Failed",
				description: err.message || "Failed to delete animation",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const handleApplyToTemplate = async (animation: Animation) => {
		// This will open a template selector modal
		// For now, redirect to templates with animation ID
		router.push(`/social-tenant/t-a/templates?applyAnimation=${animation.id}`);
	};

	const removeToast = (id: string) => {};

	// ─── Loading State ──────────────────────────────────────────────────
	if (userLoading) {
		return (
			<div className="min-h-screen bg-black text-white p-4 md:p-6">
				<div className="max-w-7xl mx-auto">
					<GridSkeleton count={12} />
				</div>
			</div>
		);
	}

	if (!user) {
		router.push("/auth/login");
		return null;
	}

	return (
		<div className="min-h-screen bg-black text-white p-4 md:p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* ─── Header ────────────────────────────────────────────────── */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold text-white flex items-center gap-2">
							<Sparkles className="h-6 w-6 text-purple-400" />
							Animations
						</h1>
						<p className="text-sm text-zinc-400">
							{totalItems} animation{totalItems !== 1 ? "s" : ""} in your
							library
						</p>
					</div>
					<button
						onClick={() => router.push("/social-tenant/t-a/animations/new")}
						className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition-colors"
					>
						<Plus className="h-4 w-4" />
						New Animation
					</button>
				</div>

				{/* ─── Search & Filters ────────────────────────────────────────── */}
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
					<div className="relative flex-1 w-full sm:max-w-sm">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
						<input
							type="text"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
							placeholder="Search animations..."
							className="w-full pl-10 pr-4 py-2 bg-zinc-950/40 border border-white/10 text-white rounded-xl text-sm focus:border-purple-500/30 focus:outline-none transition-colors"
						/>
						{search && (
							<button
								onClick={() => {
									setSearch("");
									setPage(1);
								}}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>

					<div className="flex items-center gap-2 w-full sm:w-auto">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="flex items-center gap-2 px-3 py-2 bg-zinc-950/40 border border-white/10 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors"
						>
							<Filter className="h-4 w-4" />
							Filters
							{(type !== "all" || trigger !== "all") && (
								<span className="w-2 h-2 rounded-full bg-purple-400" />
							)}
						</button>
					</div>
				</div>

				{/* ─── Filter Bar ────────────────────────────────────────────── */}
				{showFilters && (
					<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl space-y-3">
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-xs text-zinc-500 font-medium mr-2">
								Type:
							</span>
							{ANIMATION_TYPES.map((t) => (
								<button
									key={t.value}
									onClick={() => {
										setType(t.value);
										setPage(1);
									}}
									className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
										type === t.value
											? "bg-purple-500/20 text-purple-400 border border-purple-500/20"
											: "bg-white/5 text-zinc-400 hover:bg-white/10"
									}`}
								>
									{t.label}
								</button>
							))}
						</div>

						<div className="flex flex-wrap items-center gap-2">
							<span className="text-xs text-zinc-500 font-medium mr-2">
								Trigger:
							</span>
							{TRIGGERS.map((t) => (
								<button
									key={t.value}
									onClick={() => {
										setTrigger(t.value);
										setPage(1);
									}}
									className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
										trigger === t.value
											? "bg-purple-500/20 text-purple-400 border border-purple-500/20"
											: "bg-white/5 text-zinc-400 hover:bg-white/10"
									}`}
								>
									{t.label}
								</button>
							))}
						</div>
					</div>
				)}

				{/* ─── Animations Grid ────────────────────────────────────────── */}
				{loading ? (
					<GridSkeleton count={limit} />
				) : error ? (
					<div className="text-center py-12">
						<AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
						<p className="text-zinc-400">{error}</p>
						<button
							onClick={loadAnimations}
							className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors"
						>
							Try Again
						</button>
					</div>
				) : animations.length === 0 ? (
					<div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
						<Sparkles className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
						<p className="text-zinc-400">No animations found</p>
						<p className="text-sm text-zinc-500 mt-1">
							{search || type !== "all" || trigger !== "all"
								? "Try adjusting your filters"
								: "Create your first animation to get started"}
						</p>
						{!search && type === "all" && trigger === "all" && (
							<button
								onClick={() => router.push("/social-tenant/t-a/animations/new")}
								className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm transition-colors"
							>
								Create Animation
							</button>
						)}
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{animations.map((animation) => (
								<AnimationCard
									key={animation.id}
									animation={animation}
									showActions={true}
									showApply={true}
									onDelete={handleDelete}
									onApply={handleApplyToTemplate}
								/>
							))}
						</div>

						{/* ─── Pagination ────────────────────────────────────────── */}
						{totalPages > 1 && (
							<div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
								<span className="text-sm text-zinc-500">
									Page {page} of {totalPages}
								</span>
								<div className="flex items-center gap-2">
									<button
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
										className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Previous
									</button>
									<button
										onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
										disabled={page === totalPages}
										className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Next
									</button>
								</div>
							</div>
						)}
					</>
				)}
			</div>

			{/* ─── Modals ──────────────────────────────────────────────────── */}
			{deleteModal.isOpen && deleteModal.animation && (
				<ConfirmDeleteModal
					isOpen={deleteModal.isOpen}
					onClose={() => setDeleteModal({ isOpen: false, animation: null })}
					onConfirm={handleDeleteConfirm}
					title={`Delete "${deleteModal.animation.name}"`}
					message="Are you sure you want to delete this animation? It will be removed from any templates it's applied to."
					isDeleting={isDeleting}
				/>
			)}
		</div>
	);
}
