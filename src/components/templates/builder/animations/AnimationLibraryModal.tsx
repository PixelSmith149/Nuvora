"use client";

import {
	Check,
	Loader2,
	Pause,
	Play,
	Plus,
	Search,
	Sparkles,
	X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToast } from "@/lib/use-toast";

interface AnimationLibraryModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (animation: any) => void;
}

export function AnimationLibraryModal({
	isOpen,
	onClose,
	onSelect,
}: AnimationLibraryModalProps) {
	const { toast } = useToast();

	const [animations, setAnimations] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [previewId, setPreviewId] = useState<string | null>(null);

	// ─── Load user's animations ──────────────────────────────────────────
	useEffect(() => {
		if (!isOpen) return;

		async function loadAnimations() {
			setLoading(true);
			try {
				const response = await fetch("/api/st/t-a/animations?limit=50");
				const data = await response.json();
				setAnimations(data.animations || []);
			} catch (error) {
				console.error("Failed to load animations:", error);
				toast({
					title: "Error",
					description: "Failed to load animations",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		}

		loadAnimations();
	}, [isOpen, toast]);

	const filtered = animations.filter(
		(anim) =>
			anim.name.toLowerCase().includes(search.toLowerCase()) ||
			anim.type.toLowerCase().includes(search.toLowerCase()),
	);

	// ─── Generate animation CSS for preview ──────────────────────────────
	const getPreviewCss = (animation: any) => {
		if (animation.css_code) {
			return animation.css_code;
		}

		if (animation.keyframes) {
			const keyframeName = animation.name.toLowerCase().replace(/\s/g, "-");
			const keyframeStyles = Object.entries(animation.keyframes)
				.map(([key, value]) => {
					const props = Object.entries(value as Record<string, string>)
						.map(([prop, val]) => `${prop}: ${val};`)
						.join(" ");
					return `  ${key} { ${props} }`;
				})
				.join("\n");

			return `@keyframes ${keyframeName} {\n${keyframeStyles}\n}`;
		}

		return "";
	};

	// ─── Apply animation ──────────────────────────────────────────────────
	const handleApply = (animation: any) => {
		const className = `animated-${animation.name.toLowerCase().replace(/\s/g, "-")}`;

		let cssCode = "";
		if (animation.css_code) {
			cssCode = animation.css_code;
		} else if (animation.keyframes) {
			const keyframeName = animation.name.toLowerCase().replace(/\s/g, "-");
			const keyframeStyles = Object.entries(animation.keyframes)
				.map(([key, value]) => {
					const props = Object.entries(value as Record<string, string>)
						.map(([prop, val]) => `${prop}: ${val};`)
						.join(" ");
					return `  ${key} { ${props} }`;
				})
				.join("\n");

			cssCode = `@keyframes ${keyframeName} {\n${keyframeStyles}\n}\n\n.${className} {\n  animation: ${keyframeName} ${animation.duration}ms ${animation.easing} ${animation.delay || 0}ms;\n  animation-fill-mode: ${animation.fill_mode || "forwards"};\n  animation-iteration-count: ${animation.iteration_count || "1"};\n  animation-direction: ${animation.direction || "normal"};\n}`;
		}

		onSelect({
			...animation,
			className,
			cssCode,
		});
	};

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div
				className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				{/* ─── Header ──────────────────────────────────────────────────── */}
				<div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
							<Sparkles className="h-5 w-5 text-purple-400" />
						</div>
						<div>
							<h3 className="text-lg font-bold text-white">Apply Animation</h3>
							<p className="text-sm text-zinc-500">
								Choose an animation to add to your template
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* ─── Search ────────────────────────────────────────────────── */}
				<div className="p-3 border-b border-white/5 flex-shrink-0">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search animations by name or type..."
							className="w-full pl-10 pr-4 py-2 bg-black border border-white/10 text-white rounded-xl text-sm focus:border-purple-500/30 focus:outline-none transition-colors"
						/>
					</div>
				</div>

				{/* ─── List ────────────────────────────────────────────────────── */}
				<div className="flex-1 overflow-auto p-3">
					{loading ? (
						<div className="flex items-center justify-center h-40">
							<Loader2 className="h-8 w-8 animate-spin text-purple-500" />
						</div>
					) : filtered.length === 0 ? (
						<div className="text-center py-12 text-zinc-500">
							<Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
							<p className="text-sm font-medium">No animations found</p>
							<p className="text-xs mt-1">
								Create animations first in the Animation Studio
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{filtered.map((anim) => {
								const isPreviewing = previewId === anim.id;
								const previewCss = getPreviewCss(anim);
								const className = `animated-${anim.name.toLowerCase().replace(/\s/g, "-")}`;

								return (
									<div
										key={anim.id}
										className={`flex items-center justify-between p-3 bg-black/50 border rounded-xl transition-all hover:border-white/15 ${
											isPreviewing
												? "border-purple-500/30 bg-purple-500/5"
												: "border-white/5"
										}`}
									>
										<div className="flex items-center gap-3 flex-1 min-w-0">
											<div
												className={`p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 transition-all ${
													isPreviewing ? "scale-110" : ""
												}`}
												style={{
													animation: isPreviewing
														? `${anim.name.toLowerCase().replace(/\s/g, "-")} ${anim.duration}ms ${anim.easing || "ease"} forwards`
														: "none",
												}}
											>
												<Sparkles className="h-4 w-4 text-purple-400" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-bold text-white truncate">
													{anim.name}
												</p>
												<div className="flex items-center gap-2 text-xs text-zinc-500">
													<span className="capitalize">{anim.type}</span>
													<span>•</span>
													<span>{anim.duration}ms</span>
													{anim.trigger && (
														<>
															<span>•</span>
															<span className="capitalize">
																Trigger: {anim.trigger}
															</span>
														</>
													)}
												</div>
											</div>
										</div>

										<div className="flex items-center gap-1 flex-shrink-0">
											<button
												onClick={() => {
													setPreviewId(isPreviewing ? null : anim.id);
												}}
												className={`p-1.5 rounded-lg transition-colors ${
													isPreviewing
														? "bg-purple-500/20 text-purple-400"
														: "hover:bg-white/5 text-zinc-500 hover:text-white"
												}`}
												title="Preview animation"
											>
												{isPreviewing ? (
													<Pause className="h-4 w-4" />
												) : (
													<Play className="h-4 w-4" />
												)}
											</button>
											<button
												onClick={() => handleApply(anim)}
												className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
												title="Apply to template"
											>
												<Plus className="h-4 w-4" />
											</button>
										</div>

										{isPreviewing && previewCss && (
											<style dangerouslySetInnerHTML={{ __html: previewCss }} />
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* ─── Footer ────────────────────────────────────────────────── */}
				<div className="p-3 border-t border-white/5 text-xs text-zinc-500 flex-shrink-0">
					<p>
						💡 The animation CSS will be injected automatically. Add the class
						name to any HTML element.
					</p>
				</div>
			</div>
		</div>
	);
}
