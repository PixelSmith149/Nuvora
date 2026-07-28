"use client";

import {
	ArrowUpRight,
	Calendar,
	CheckCircle2,
	Clock,
	Copy,
	Download,
	Edit,
	Eye,
	LayoutTemplate,
	MoreVertical,
	Pause,
	Play,
	Sparkles,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import type { Animation } from "@/lib/st/types/templates-animation";

interface AnimationCardProps {
	animation: Animation;
	onClone?: (animation: Animation) => void;
	onDelete?: (animation: Animation) => void;
	onApply?: (animation: Animation) => void;
	showActions?: boolean;
	showApply?: boolean;
	templateName?: string; // ← New: Name of template it's applied to
}

export function AnimationCard({
	animation,
	onClone,
	onDelete,
	onApply,
	showActions = true,
	showApply = false,
	templateName,
}: AnimationCardProps) {
	const router = useRouter();
	const [showMenu, setShowMenu] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [previewError, setPreviewError] = useState(false);

	const handleClick = () => {
		router.push(`/social-tenant/t-a/animations/${animation.id}`);
	};

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		router.push(`/social-tenant/t-a/animations/${animation.id}/edit`);
	};

	const handleClone = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onClone) onClone(animation);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onDelete) onDelete(animation);
	};

	const handleApply = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onApply) onApply(animation);
	};

	const handlePlay = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsPlaying(!isPlaying);
	};

	// ─── Generate CSS for preview ──────────────────────────────────────
	const getPreviewStyle = () => {
		if (animation.css_code) {
			return animation.css_code;
		}

		if (animation.keyframes && Object.keys(animation.keyframes).length > 0) {
			const keyframeName = animation.name.toLowerCase().replace(/\s/g, "-");
			const keyframeStyles = Object.entries(animation.keyframes)
				.map(([key, value]) => {
					const props = Object.entries(value as Record<string, string>)
						.map(([prop, val]) => `${prop}: ${val};`)
						.join(" ");
					return `  ${key} { ${props} }`;
				})
				.join("\n");

			return `
@keyframes ${keyframeName} {
${keyframeStyles}
}
.animate-preview {
  animation: ${keyframeName} ${animation.duration}ms ${animation.easing} ${animation.delay || 0}ms;
  animation-fill-mode: ${animation.fill_mode || "forwards"};
  animation-iteration-count: ${animation.iteration_count || "1"};
  animation-direction: ${animation.direction || "normal"};
}`;
		}
		return "";
	};

	// ─── Get animation type icon ───────────────────────────────────────
	const getTypeIcon = () => {
		const typeIcons: Record<string, string> = {
			fade: "🌊",
			slide: "📐",
			bounce: "🏀",
			rotate: "🔄",
			scale: "📏",
			custom: "✨",
		};
		return typeIcons[animation.type] || "✨";
	};

	// ─── Format duration ───────────────────────────────────────────────
	const formatDuration = (ms: number) => {
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(1)}s`;
	};

	return (
		<div
			onClick={handleClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className="group bg-zinc-950/40 border border-white/5 rounded-xl hover:border-white/15 transition-all cursor-pointer p-4 relative overflow-hidden"
		>
			{/* ─── Status Badge (Applied) ──────────────────────────────────── */}
			{animation.template_id && (
				<div className="absolute top-2 right-2 z-10">
					<span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-0.5">
						<CheckCircle2 className="h-2.5 w-2.5" />
						Applied
					</span>
				</div>
			)}

			<div className="flex items-start gap-3">
				{/* ─── Preview Icon ──────────────────────────────────────────── */}
				<div
					className={`flex-shrink-0 w-14 h-14 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center transition-all ${
						isPlaying || isHovered ? "scale-110" : ""
					}`}
					style={
						isPlaying
							? {
									animation: `${animation.name.toLowerCase().replace(/\s/g, "-")} ${animation.duration}ms ${animation.easing} ${animation.delay || 0}ms forwards`,
								}
							: {}
					}
				>
					{isPlaying ? (
						<div className="text-2xl">✨</div>
					) : (
						<div className="text-2xl">{getTypeIcon()}</div>
					)}
				</div>

				{/* ─── Content ────────────────────────────────────────────────── */}
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0">
							<div className="flex items-center gap-2">
								<h4 className="text-sm font-bold text-white truncate">
									{animation.name}
								</h4>
								{animation.is_preset && (
									<span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
										Preset
									</span>
								)}
							</div>
							<div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5 flex-wrap">
								<span className="capitalize flex items-center gap-1">
									<span className="text-zinc-600">Type:</span>
									{animation.type}
								</span>
								<span>•</span>
								<span className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									{formatDuration(animation.duration)}
								</span>
								{animation.trigger && (
									<>
										<span>•</span>
										<span className="capitalize flex items-center gap-1">
											<span className="text-zinc-600">Trigger:</span>
											{animation.trigger}
										</span>
									</>
								)}
								<span>•</span>
								<span className="flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									{new Date(animation.created_at).toLocaleDateString()}
								</span>
							</div>
						</div>

						{showActions && (
							<div className="relative flex-shrink-0">
								<button
									onClick={(e) => {
										e.stopPropagation();
										setShowMenu(!showMenu);
									}}
									className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
								>
									<MoreVertical className="h-4 w-4" />
								</button>

								{showMenu && (
									<div
										className="absolute right-0 top-6 w-44 bg-zinc-900 border border-white/10 rounded-xl shadow-xl py-1 z-50"
										onClick={(e) => e.stopPropagation()}
									>
										<button
											onClick={handleEdit}
											className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 transition-colors"
										>
											<Edit className="h-3.5 w-3.5" />
											Edit
										</button>
										<button
											onClick={handleClone}
											className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 transition-colors"
										>
											<Copy className="h-3.5 w-3.5" />
											Clone
										</button>
										{showApply && (
											<button
												onClick={handleApply}
												className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/10 transition-colors"
											>
												<Sparkles className="h-3.5 w-3.5" />
												Apply to Template
											</button>
										)}
										<button
											onClick={handleDelete}
											className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
										>
											<Trash2 className="h-3.5 w-3.5" />
											Delete
										</button>
									</div>
								)}
							</div>
						)}
					</div>

					{/* ─── Actions Row ──────────────────────────────────────────── */}
					<div className="flex items-center gap-2 mt-2 flex-wrap">
						<button
							onClick={handlePlay}
							className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors text-[10px]"
						>
							{isPlaying ? (
								<Pause className="h-3 w-3" />
							) : (
								<Play className="h-3 w-3" />
							)}
							{isPlaying ? "Pause" : "Preview"}
						</button>

						{/* ─── Download count ────────────────────────────────────── */}
						<span className="text-[10px] text-zinc-500 flex items-center gap-1">
							<Download className="h-3 w-3" />
							{animation.download_count || 0}
						</span>

						{/* ─── Applied to Template ────────────────────────────────── */}
						{animation.template_id && templateName && (
							<span className="text-[10px] text-emerald-500 flex items-center gap-1 ml-auto">
								<LayoutTemplate className="h-3 w-3" />
								{templateName}
							</span>
						)}

						{/* ─── Apply Button (Quick Action) ────────────────────────── */}
						{showApply && !animation.template_id && (
							<button
								onClick={handleApply}
								className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors text-[10px] ml-auto"
							>
								<Sparkles className="h-3 w-3" />
								Apply
							</button>
						)}
					</div>

					{/* ─── Easing indicator ────────────────────────────────────── */}
					<div className="flex items-center gap-1 mt-1.5 text-[8px] text-zinc-600">
						<span>Easing: {animation.easing || "ease-in-out"}</span>
						{animation.iteration_count && animation.iteration_count !== "1" && (
							<>
								<span>•</span>
								<span>Iterations: {animation.iteration_count}</span>
							</>
						)}
					</div>
				</div>
			</div>

			{/* ─── Hidden style tag for animation preview ────────────────── */}
			{isPlaying && (
				<style dangerouslySetInnerHTML={{ __html: getPreviewStyle() }} />
			)}
		</div>
	);
}
