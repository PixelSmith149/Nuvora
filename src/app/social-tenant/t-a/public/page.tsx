// app/social-tenant/t-a/public/page.tsx
"use client";

import {
	AlertCircle,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Copy,
	Download,
	Eye,
	Globe,
	LayoutDashboard,
	LayoutTemplate,
	Loader2,
	Pause,
	Play,
	Sparkles,
	Upload,
	User,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	type CloneConfig,
	CloneModal,
} from "@/components/templates-animation/CloneModal";
import type { Template } from "@/lib/st/types/templates-animation";
import { useToast } from "@/lib/use-toast";
import { useUser } from "@/lib/useAuth";

export default function PublicGalleryPage() {
	const router = useRouter();
	const { user, loading: userLoading } = useUser();
	const { toast } = useToast();

	// ─── State ──────────────────────────────────────────────────────────
	const [templates, setTemplates] = useState<Template[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isCloning, setIsCloning] = useState(false);
	const [cloneModal, setCloneModal] = useState<{
		isOpen: boolean;
		template: Template | null;
	}>({
		isOpen: false,
		template: null,
	});
	const [touchStartX, setTouchStartX] = useState(0);
	const [touchEndX, setTouchEndX] = useState(0);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [uploading, setUploading] = useState(false);

	// ─── Refs ────────────────────────────────────────────────────────────
	const containerRef = useRef<HTMLDivElement>(null);
	const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

	// ─── Fetch Public Templates (Random Order) ──────────────────────────
	const loadTemplates = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(
				"/api/st/t-a/public-templates?order=random&limit=50",
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to load public templates");
			}

			setTemplates(data.templates || []);

			// Reset to first template when new data loads
			if (data.templates && data.templates.length > 0) {
				setCurrentIndex(0);
			}
		} catch (err: any) {
			setError(err.message);
			toast({
				title: "Error",
				description: err.message || "Failed to load public templates",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		loadTemplates();
	}, [loadTemplates]);

	// ─── Navigation ──────────────────────────────────────────────────────
	const goToPrevious = () => {
		if (isTransitioning || templates.length === 0) return;
		setIsTransitioning(true);
		setCurrentIndex((prev) => (prev === 0 ? templates.length - 1 : prev - 1));
		setTimeout(() => setIsTransitioning(false), 400);
	};

	const goToNext = () => {
		if (isTransitioning || templates.length === 0) return;
		setIsTransitioning(true);
		setCurrentIndex((prev) => (prev === templates.length - 1 ? 0 : prev + 1));
		setTimeout(() => setIsTransitioning(false), 400);
	};

	// ─── Keyboard Navigation ─────────────────────────────────────────────
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") goToPrevious();
			if (e.key === "ArrowRight") goToNext();
			if (e.key === " " || e.key === "Space") {
				e.preventDefault();
				setIsPlaying(!isPlaying);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [templates, currentIndex, isPlaying]);

	// ─── Touch / Swipe Handling ──────────────────────────────────────────
	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStartX(e.touches[0].clientX);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		setTouchEndX(e.touches[0].clientX);
	};

	const handleTouchEnd = () => {
		if (touchStartX - touchEndX > 50) {
			goToNext();
		}
		if (touchEndX - touchStartX > 50) {
			goToPrevious();
		}
	};

	// ─── Clone Handler ────────────────────────────────────────────────────
	const handleClone = (template: Template) => {
		if (!user) {
			toast({
				title: "Authentication Required",
				description: "Please login to clone templates",
				variant: "warning",
			});
			router.push("/auth/login?redirect=/social-tenant/t-a/public");
			return;
		}
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

			// Refresh templates to update clone counts
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

	// ─── Upload Handler ───────────────────────────────────────────────────
	const handleUpload = () => {
		if (!user) {
			toast({
				title: "Authentication Required",
				description: "Please login to upload templates",
				variant: "warning",
			});
			router.push("/auth/login?redirect=/social-tenant/t-a/public");
			return;
		}
		router.push("/social-tenant/t-a/templates/new");
	};

	// ─── Render Individual Template ──────────────────────────────────────
	const renderTemplateContent = (template: Template, index: number) => {
		const isActive = index === currentIndex;
		const isVideo =
			template.preview_image?.match(/\.(mp4|webm|mov|gif)$/i) ||
			template.html_code?.includes("<video");

		return (
			<div
				key={template.id}
				className={`absolute inset-0 transition-all duration-500 ease-in-out ${
					isActive
						? "opacity-100 scale-100 z-10"
						: "opacity-0 scale-95 z-0 pointer-events-none"
				}`}
				style={{
					transform: isActive ? "translateX(0)" : "translateX(100%)",
				}}
			>
				<div className="w-full h-full bg-black flex items-center justify-center">
					{/* ─── Template Preview ────────────────────────────────────── */}
					<div className="relative w-full h-full">
						{template.preview_image ? (
							isVideo ? (
								<video
									ref={(el) => {
										if (el) videoRefs.current[template.id] = el;
									}}
									src={template.preview_image}
									className="w-full h-full object-contain"
									muted
									loop
									playsInline
									autoPlay={isActive}
									onMouseEnter={() => {
										const video = videoRefs.current[template.id];
										if (video) video.play();
									}}
									onMouseLeave={() => {
										const video = videoRefs.current[template.id];
										if (video) video.pause();
									}}
								/>
							) : (
								<img
									src={template.preview_image}
									alt={template.name}
									className="w-full h-full object-contain"
									loading="lazy"
								/>
							)
						) : (
							<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
								<LayoutTemplate className="h-20 w-20 text-zinc-700" />
							</div>
						)}

						{/* ─── Overlay Gradient ──────────────────────────────────── */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

						{/* ─── Template Info Overlay ────────────────────────────── */}
						<div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 pointer-events-none">
							<div className="max-w-3xl">
								<div className="flex items-center gap-3 mb-2">
									<span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
										Public Template
									</span>
									<span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 border border-white/10 text-zinc-300">
										{template.category}
									</span>
								</div>
								<h2 className="text-2xl md:text-4xl font-bold text-white truncate">
									{template.name}
								</h2>
								<div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-zinc-300">
									<span className="flex items-center gap-1">
										<User className="h-4 w-4" />
										by @{template.user_id?.slice(0, 8) || "anonymous"}
									</span>
									<span className="flex items-center gap-1">
										<Eye className="h-4 w-4" />
										{template.view_count || 0}
									</span>
									<span className="flex items-center gap-1">
										<Copy className="h-4 w-4" />
										{template.clone_count || 0}
									</span>
									<span className="flex items-center gap-1">
										<Download className="h-4 w-4" />
										{template.download_count || 0}
									</span>
									<span className="flex items-center gap-1">
										<Calendar className="h-4 w-4" />
										{new Date(template.created_at).toLocaleDateString()}
									</span>
								</div>
								{template.description && (
									<p className="text-sm text-zinc-400 mt-2 line-clamp-2">
										{template.description}
									</p>
								)}
							</div>
						</div>

						{/* ─── Action Buttons ────────────────────────────────────── */}
						<div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex flex-col gap-3 pointer-events-auto">
							<button
								onClick={() => {
									if (template.html_code) {
										// Open in new window to preview full template
										const win = window.open("", "_blank");
										if (win) {
											win.document.write(`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <style>${template.css_code || ""}</style>
                          </head>
                          <body>
                            ${template.html_code || ""}
                            <script>${template.js_code || ""}</script>
                          </body>
                        </html>
                      `);
											win.document.close();
										}
									}
								}}
								className="p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-all hover:scale-110"
								title="Preview Full Template"
							>
								<Eye className="h-5 w-5" />
							</button>
							<button
								onClick={() => handleClone(template)}
								className="p-3 rounded-full bg-emerald-500/20 backdrop-blur-sm hover:bg-emerald-500/30 text-emerald-400 transition-all hover:scale-110"
								title="Clone Template"
							>
								<Copy className="h-5 w-5" />
							</button>
						</div>

						{/* ─── Video Play/Pause Toggle ───────────────────────────── */}
						{isVideo && (
							<button
								onClick={() => {
									const video = videoRefs.current[template.id];
									if (video) {
										if (isPlaying) {
											video.pause();
										} else {
											video.play();
										}
										setIsPlaying(!isPlaying);
									}
								}}
								className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white transition-all pointer-events-auto"
							>
								{isPlaying ? (
									<Pause className="h-8 w-8" />
								) : (
									<Play className="h-8 w-8" />
								)}
							</button>
						)}
					</div>
				</div>
			</div>
		);
	};

	// ─── Loading State ──────────────────────────────────────────────────
	if (userLoading || loading) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
			</div>
		);
	}

	// ─── Error State ────────────────────────────────────────────────────
	if (error) {
		return (
			<div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
				<div className="text-center">
					<AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
					<h2 className="text-xl font-bold mb-2">Failed to Load Gallery</h2>
					<p className="text-zinc-400">{error}</p>
					<button
						onClick={loadTemplates}
						className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	// ─── Empty State ────────────────────────────────────────────────────
	if (templates.length === 0) {
		return (
			<div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
				<div className="text-center max-w-md">
					<Globe className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
					<h2 className="text-xl font-bold mb-2">No Public Templates Yet</h2>
					<p className="text-zinc-400 text-sm">
						Be the first to share a template with the community. Create a
						template and make it public.
					</p>
					{user && (
						<button
							onClick={handleUpload}
							className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-colors"
						>
							<Upload className="h-4 w-4 inline mr-2" />
							Create & Publish Template
						</button>
					)}
				</div>
			</div>
		);
	}

	const currentTemplate = templates[currentIndex];

	return (
		<div className="min-h-screen bg-black text-white overflow-hidden">
			{/* ─── Top Navigation Bar ─────────────────────────────────────── */}
			<div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Globe className="h-6 w-6 text-emerald-400" />
						<span className="text-sm font-bold text-white hidden sm:inline">
							Public Gallery
						</span>
						<span className="text-xs text-zinc-400 hidden md:inline">
							{templates.length} template{templates.length !== 1 ? "s" : ""}
						</span>
					</div>

					<div className="flex items-center gap-2">
						{/* ─── Upload Button ────────────────────────────────────── */}
						<button
							onClick={handleUpload}
							className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
						>
							<Upload className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">Publish Template</span>
						</button>

						{/* ─── Dashboard Button ──────────────────────────────────── */}
						<button
							onClick={() => router.push("/social-tenant/t-a")}
							className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
						>
							<LayoutDashboard className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">Your Dashboard</span>
						</button>
					</div>
				</div>
			</div>

			{/* ─── Main Viewer ────────────────────────────────────────────── */}
			<div
				ref={containerRef}
				className="w-full h-screen relative overflow-hidden"
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				{/* ─── Templates ────────────────────────────────────────────── */}
				{templates.map((template, index) =>
					renderTemplateContent(template, index),
				)}

				{/* ─── Progress Indicator ────────────────────────────────────── */}
				<div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
					{templates.map((_, index) => (
						<button
							key={index}
							onClick={() => {
								if (!isTransitioning) {
									setIsTransitioning(true);
									setCurrentIndex(index);
									setTimeout(() => setIsTransitioning(false), 400);
								}
							}}
							className={`h-1.5 rounded-full transition-all ${
								index === currentIndex
									? "w-8 bg-white"
									: "w-4 bg-white/30 hover:bg-white/50"
							}`}
						/>
					))}
				</div>

				{/* ─── Navigation Arrows (Desktop) ───────────────────────────── */}
				<div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between z-20 pointer-events-none">
					<button
						onClick={goToPrevious}
						className="pointer-events-auto p-2 ml-4 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white transition-all hover:scale-110 opacity-0 group-hover:opacity-100 md:opacity-100"
						aria-label="Previous template"
					>
						<ChevronLeft className="h-8 w-8" />
					</button>
					<button
						onClick={goToNext}
						className="pointer-events-auto p-2 mr-4 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white transition-all hover:scale-110 opacity-0 group-hover:opacity-100 md:opacity-100"
						aria-label="Next template"
					>
						<ChevronRight className="h-8 w-8" />
					</button>
				</div>

				{/* ─── Template Counter ──────────────────────────────────────── */}
				<div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 mt-4 text-xs text-zinc-500">
					{currentIndex + 1} / {templates.length}
				</div>

				{/* ─── Keyboard Hint ──────────────────────────────────────────── */}
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-[10px] text-zinc-600 hidden md:block">
					← → or swipe to navigate • Space to play/pause
				</div>
			</div>

			{/* ─── Clone Modal ─────────────────────────────────────────────── */}
			{cloneModal.isOpen && cloneModal.template && (
				<CloneModal
					isOpen={cloneModal.isOpen}
					onClose={() => setCloneModal({ isOpen: false, template: null })}
					onConfirm={handleCloneConfirm}
					template={cloneModal.template}
					isCloning={isCloning}
				/>
			)}
		</div>
	);
}
