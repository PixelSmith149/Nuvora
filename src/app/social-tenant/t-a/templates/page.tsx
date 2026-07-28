// app/social-tenant/t-a/page.tsx
"use client";

import {
	AlertCircle,
	Filter,
	Grid3x3,
	LayoutTemplate,
	List,
	Loader2,
	Plus,
	Search,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import {
	type CloneConfig,
	CloneModal,
} from "@/components/templates-animation/CloneModal";
import { ConfirmDeleteModal } from "@/components/templates-animation/ConfirmDeleteModal";
import { TemplateCard } from "@/components/templates-animation/TemplateCard";
import { GridSkeleton } from "@/components/ui/spinner";
import type { Template } from "@/lib/st/types/templates-animation";
import { useToast } from "@/lib/use-toast";
import { useUser } from "@/lib/useAuth";

const CATEGORIES = [
	{ value: "all", label: "All Categories" },
	{ value: "business", label: "Business" },
	{ value: "ecommerce", label: "E-commerce" },
	{ value: "portfolio", label: "Portfolio" },
	{ value: "restaurant", label: "Restaurant" },
	{ value: "healthcare", label: "Healthcare" },
	{ value: "education", label: "Education" },
	{ value: "realestate", label: "Real Estate" },
	{ value: "finance", label: "Finance" },
	{ value: "travel", label: "Travel" },
	{ value: "entertainment", label: "Entertainment" },
	{ value: "marketplace", label: "Marketplace" },
	{ value: "dashboard", label: "Dashboard" },
	{ value: "landing", label: "Landing Page" },
	{ value: "blog", label: "Blog" },
	{ value: "booking", label: "Booking" },
	{ value: "social", label: "Social" },
	{ value: "ai", label: "AI" },
	{ value: "mobileapp", label: "Mobile App" },
	{ value: "email", label: "Email" },
	{ value: "presentation", label: "Presentation" },
	{ value: "document", label: "Document" },
	{ value: "marketing", label: "Marketing" },
	{ value: "cms", label: "CMS" },
	{ value: "industry", label: "Industry" },
	{ value: "internal", label: "Internal" },
	{ value: "authentication", label: "Authentication" },
	{ value: "web3", label: "Web3" },
	{ value: "nonprofit", label: "Non-Profit" },
];

export default function TemplatesPage() {
	const router = useRouter();
	const { user, loading: userLoading } = useUser();

	// ─── State ──────────────────────────────────────────────────────────
	const [templates, setTemplates] = useState<Template[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Filters
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("all");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [showFilters, setShowFilters] = useState(false);

	// Pagination
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [totalItems, setTotalItems] = useState(0);
	const limit = 12;

	// Modals
	const [cloneModal, setCloneModal] = useState<{
		isOpen: boolean;
		template: Template | null;
	}>({
		isOpen: false,
		template: null,
	});
	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		template: Template | null;
	}>({
		isOpen: false,
		template: null,
	});
	const [isCloning, setIsCloning] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Toast
	const { toast } = useToast();

	// ─── Load Templates ────────────────────────────────────────────────
	const loadTemplates = useCallback(async () => {
		if (!user) return;

		setLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				page: String(page),
				limit: String(limit),
			});

			if (category !== "all") params.append("category", category);
			if (search) params.append("search", search);

			const response = await fetch(
				`/api/st/t-a/templates?${params.toString()}`,
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to load templates");
			}

			setTemplates(data.templates || []);
			setTotalPages(data.pagination?.totalPages || 0);
			setTotalItems(data.pagination?.total || 0);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [user, page, category, search]);

	useEffect(() => {
		loadTemplates();
	}, [loadTemplates]);

	// ─── Handlers ──────────────────────────────────────────────────────
	const handleClone = (template: Template) => {
		setCloneModal({ isOpen: true, template });
	};

	const handleCloneConfirm = async (config: CloneConfig) => {
		if (!cloneModal.template) return;

		setIsCloning(true);
		try {
			const response = await fetch("/api/st/t-a/clone", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					templateId: cloneModal.template.id,
					newName: config.newName,
					category: config.category,
					tags: config.tags,
					makePublic: config.makePublic,
					publishImmediately: config.publishImmediately,
					cloneAnimations: config.cloneAnimations,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to clone template");
			}

			toast({
				title: "🚀 Template Cloned!",
				description: "Ready to customize your new template.",
				variant: "success",
			});

			setCloneModal({ isOpen: false, template: null });
			loadTemplates();
		} catch (err: any) {
			toast({
				title: "Clone Failed",
				description: err.message || "Failed to clone template",
				variant: "destructive",
			});
		} finally {
			setIsCloning(false);
		}
	};

	const handleDelete = (template: Template) => {
		setDeleteModal({ isOpen: true, template });
	};

	const handleDeleteConfirm = async () => {
		if (!deleteModal.template) return;

		setIsDeleting(true);
		try {
			const response = await fetch(
				`/api/st/t-a/templates/${deleteModal.template.id}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to delete template");
			}

			toast({
				title: "Template Deleted",
				description: "Template removed successfully",
				variant: "success",
			});

			setDeleteModal({ isOpen: false, template: null });
			loadTemplates();
		} catch (err: any) {
			toast({
				title: "Delete Failed",
				description: err.message || "Failed to delete template",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
		}
	};

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
							<LayoutTemplate className="h-6 w-6 text-emerald-400" />
							Templates
						</h1>
						<p className="text-sm text-zinc-400">
							{totalItems} template{totalItems !== 1 ? "s" : ""} in your library
						</p>
					</div>
					<button
						onClick={() => router.push("/social-tenant/t-a/templates/new")}
						className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors"
					>
						<Plus className="h-4 w-4" />
						New Template
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
							placeholder="Search templates..."
							className="w-full pl-10 pr-4 py-2 bg-zinc-950/40 border border-white/10 text-white rounded-xl text-sm focus:border-emerald-500/30 focus:outline-none transition-colors"
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
							{category !== "all" && (
								<span className="w-2 h-2 rounded-full bg-emerald-400" />
							)}
						</button>

						<div className="flex items-center gap-0.5 p-0.5 bg-zinc-950/40 border border-white/10 rounded-xl">
							<button
								onClick={() => setViewMode("grid")}
								className={`p-1.5 rounded-lg transition-colors ${
									viewMode === "grid"
										? "bg-white/10 text-white"
										: "text-zinc-500 hover:text-zinc-300"
								}`}
							>
								<Grid3x3 className="h-4 w-4" />
							</button>
							<button
								onClick={() => setViewMode("list")}
								className={`p-1.5 rounded-lg transition-colors ${
									viewMode === "list"
										? "bg-white/10 text-white"
										: "text-zinc-500 hover:text-zinc-300"
								}`}
							>
								<List className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>

				{/* ─── Filter Bar ────────────────────────────────────────────── */}
				{showFilters && (
					<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-xs text-zinc-500 font-medium mr-2">
								Category:
							</span>
							{CATEGORIES.map((cat) => (
								<button
									key={cat.value}
									onClick={() => {
										setCategory(cat.value);
										setPage(1);
									}}
									className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
										category === cat.value
											? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
											: "bg-white/5 text-zinc-400 hover:bg-white/10"
									}`}
								>
									{cat.label}
								</button>
							))}
						</div>
					</div>
				)}

				{/* ─── Templates Grid ────────────────────────────────────────── */}
				{loading ? (
					<GridSkeleton count={limit} />
				) : error ? (
					<div className="text-center py-12">
						<AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
						<p className="text-zinc-400">{error}</p>
						<button
							onClick={loadTemplates}
							className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors"
						>
							Try Again
						</button>
					</div>
				) : templates.length === 0 ? (
					<div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
						<LayoutTemplate className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
						<p className="text-zinc-400">No templates found</p>
						<p className="text-sm text-zinc-500 mt-1">
							{search || category !== "all"
								? "Try adjusting your filters"
								: "Create your first template to get started"}
						</p>
						{!search && category === "all" && (
							<button
								onClick={() => router.push("/social-tenant/t-a/templates/new")}
								className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm transition-colors"
							>
								Create Template
							</button>
						)}
					</div>
				) : (
					<>
						<div
							className={`grid ${
								viewMode === "grid"
									? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
									: "grid-cols-1"
							} gap-4`}
						>
							{templates.map((template) => (
								<TemplateCard
									key={template.id}
									template={template}
									isOwner={true}
									onClone={handleClone}
									onDelete={handleDelete}
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
			{cloneModal.isOpen && cloneModal.template && (
				<CloneModal
					isOpen={cloneModal.isOpen}
					onClose={() => setCloneModal({ isOpen: false, template: null })}
					onConfirm={handleCloneConfirm}
					template={cloneModal.template}
					isCloning={isCloning}
				/>
			)}

			{deleteModal.isOpen && deleteModal.template && (
				<ConfirmDeleteModal
					isOpen={deleteModal.isOpen}
					onClose={() => setDeleteModal({ isOpen: false, template: null })}
					onConfirm={handleDeleteConfirm}
					title={`Delete "${deleteModal.template.name}"`}
					message="Are you sure you want to delete this template? All animations linked to it will also be deleted."
					isDeleting={isDeleting}
				/>
			)}
		</div>
	);
}
