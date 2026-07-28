// components/social-tenant/link-in-bio/TemplateCard.tsx

"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import React from "react";
import type { Template } from "@/lib/st/types/link-in-bio";

interface TemplateCardProps {
	template: Template;
	index: number;
	onSelect: (templateId: string) => void;
}

export function TemplateCard({ template, index, onSelect }: TemplateCardProps) {
	const [imageError, setImageError] = React.useState(false);

	const categoryColors: Record<string, string> = {
		minimal: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
		luxury: "bg-amber-500/10 text-amber-400 border-amber-500/20",
		creative: "bg-purple-500/10 text-purple-400 border-purple-500/20",
		professional: "bg-blue-500/10 text-blue-400 border-blue-500/20",
		playful: "bg-pink-500/10 text-pink-400 border-pink-500/20",
		modern: "bg-sky-500/10 text-sky-400 border-sky-500/20",
	};

	return (
		<div className="group bg-zinc-950/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300">
			{/* ─── Preview Area ────────────────────────────────────── */}
			<div className="relative aspect-[3/2] bg-zinc-900/50 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-black/50" />
				<div className="absolute inset-0 flex items-center justify-center p-4">
					{template.previewImage && !imageError ? (
						<img
							src={template.previewImage}
							alt={template.name}
							className="w-full h-full object-contain rounded-lg"
							onError={() => setImageError(true)}
						/>
					) : (
						<div className="w-full h-full bg-zinc-800/50 rounded-lg flex items-center justify-center">
							<span className="text-6xl opacity-20">
								{template.id === "minimal"
									? "✨"
									: template.id === "dark-luxe"
										? "🌙"
										: template.id === "glass"
											? "🪟"
											: template.id === "gradient"
												? "🌈"
												: template.id === "bold"
													? "💪"
													: template.id === "elegant"
														? "🌸"
														: template.id === "neon"
															? "💫"
															: template.id === "nature"
																? "🌿"
																: template.id === "professional"
																	? "💼"
																	: "🎨"}
							</span>
						</div>
					)}
				</div>

				{/* ─── Template Number ────────────────────────────────── */}
				<div className="absolute top-3 left-3">
					<span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-zinc-400">
						#{String(index + 1).padStart(2, "0")}
					</span>
				</div>

				{/* ─── Category Badge ──────────────────────────────────── */}
				<div className="absolute top-3 right-3">
					<span
						className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${categoryColors[template.category] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}
					>
						{template.category.charAt(0).toUpperCase() +
							template.category.slice(1)}
					</span>
				</div>

				{/* ─── Hover Overlay ───────────────────────────────────── */}
				<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
					<button
						onClick={() => onSelect(template.id)}
						className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl px-6 py-2.5 text-sm flex items-center gap-2 transition-all"
					>
						<Sparkles className="h-4 w-4" />
						Select Template
					</button>
				</div>
			</div>

			{/* ─── Content ───────────────────────────────────────────── */}
			<div className="p-5">
				<div className="flex items-start justify-between">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<h3 className="text-sm font-bold text-white truncate">
								{template.name}
							</h3>
							<span className="text-xs text-zinc-500">•</span>
							<span className="text-xs text-zinc-500">{template.category}</span>
						</div>
						<p className="text-xs text-zinc-400 mt-1 leading-relaxed">
							{template.description}
						</p>
					</div>
					<button
						onClick={() => onSelect(template.id)}
						className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-emerald-400 transition-colors flex-shrink-0"
					>
						<ChevronRight className="h-4 w-4" />
					</button>
				</div>

				{/* ─── Style Tags ───────────────────────────────────────── */}
				<div className="flex flex-wrap items-center gap-1.5 mt-3">
					<span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-zinc-900/50 border border-white/5 text-zinc-500">
						{template.styles.fontFamily.replace("font-", "")}
					</span>
					<span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-zinc-900/50 border border-white/5 text-zinc-500">
						{template.defaultSettings.buttonRadius.replace("rounded-", "")}
					</span>
					<span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-zinc-900/50 border border-white/5 text-zinc-500">
						{template.defaultSettings.animation}
					</span>
				</div>
			</div>
		</div>
	);
}
