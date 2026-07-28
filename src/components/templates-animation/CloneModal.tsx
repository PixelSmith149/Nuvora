// components/templates-animation/CloneModal.tsx
"use client";

import {
	AlertCircle,
	CheckCircle2,
	Copy,
	Loader2,
	Sparkles,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { Template } from "@/lib/st/types/templates-animation";

interface CloneModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (config: CloneConfig) => Promise<void>;
	template: Template;
	isCloning: boolean;
}

export interface CloneConfig {
	newName: string;
	category: string;
	tags: string[];
	makePublic: boolean;
	publishImmediately: boolean;
	cloneAnimations: boolean;
}

const CATEGORIES = [
	"business",
	"ecommerce",
	"portfolio",
	"restaurant",
	"healthcare",
	"education",
	"realestate",
	"finance",
	"travel",
	"entertainment",
	"marketplace",
	"dashboard",
	"landing",
	"blog",
	"booking",
	"social",
	"ai",
	"mobileapp",
	"email",
	"presentation",
	"document",
	"marketing",
	"cms",
	"industry",
	"internal",
	"authentication",
	"web3",
	"nonprofit",
];

export function CloneModal({
	isOpen,
	onClose,
	onConfirm,
	template,
	isCloning,
}: CloneModalProps) {
	const [config, setConfig] = useState<CloneConfig>({
		newName: `Copy of ${template.name}`,
		category: template.category,
		tags: template.tags || [],
		makePublic: false,
		publishImmediately: false,
		cloneAnimations: true,
	});

	const [tagInput, setTagInput] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen) {
			setConfig({
				newName: `Copy of ${template.name}`,
				category: template.category,
				tags: template.tags || [],
				makePublic: false,
				publishImmediately: false,
				cloneAnimations: true,
			});
			setError(null);
		}
	}, [isOpen, template]);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!config.newName.trim()) {
			setError("Template name is required");
			return;
		}
		await onConfirm(config);
	};

	const handleAddTag = () => {
		if (tagInput.trim() && !config.tags.includes(tagInput.trim())) {
			setConfig({
				...config,
				tags: [...config.tags, tagInput.trim()],
			});
			setTagInput("");
		}
	};

	const handleRemoveTag = (tag: string) => {
		setConfig({
			...config,
			tags: config.tags.filter((t) => t !== tag),
		});
	};

	return (
		<div
			className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget && !isCloning) onClose();
			}}
		>
			<div
				className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				{/* ─── Header ──────────────────────────────────────────────────── */}
				<div className="flex items-center justify-between p-4 border-b border-white/5">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
							<Copy className="h-5 w-5 text-emerald-400" />
						</div>
						<div>
							<h3 className="text-lg font-bold text-white">Clone Template</h3>
							<p className="text-sm text-zinc-500">Customize your copy</p>
						</div>
					</div>
					<button
						onClick={onClose}
						disabled={isCloning}
						className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* ─── Form ────────────────────────────────────────────────────── */}
				<form onSubmit={handleSubmit} className="p-4 space-y-4">
					{error && (
						<div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
							<AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
							<span>{error}</span>
						</div>
					)}

					{/* ─── Name ────────────────────────────────────────────────── */}
					<div className="space-y-1.5">
						<label className="text-sm font-bold text-white">
							New Template Name
						</label>
						<input
							type="text"
							value={config.newName}
							onChange={(e) =>
								setConfig({ ...config, newName: e.target.value })
							}
							placeholder="Enter template name..."
							className="w-full bg-black border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500/30 focus:outline-none transition-colors"
							disabled={isCloning}
						/>
					</div>

					{/* ─── Category ──────────────────────────────────────────────── */}
					<div className="space-y-1.5">
						<label className="text-sm font-bold text-white">Category</label>
						<select
							value={config.category}
							onChange={(e) =>
								setConfig({ ...config, category: e.target.value })
							}
							className="w-full bg-black border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500/30 focus:outline-none transition-colors capitalize"
							disabled={isCloning}
						>
							{CATEGORIES.map((cat) => (
								<option key={cat} value={cat} className="capitalize">
									{cat}
								</option>
							))}
						</select>
					</div>

					{/* ─── Tags ────────────────────────────────────────────────────── */}
					<div className="space-y-1.5">
						<label className="text-sm font-bold text-white">Tags</label>
						<div className="flex gap-2">
							<input
								type="text"
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAddTag();
									}
								}}
								placeholder="Add a tag..."
								className="flex-1 bg-black border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500/30 focus:outline-none transition-colors"
								disabled={isCloning}
							/>
							<button
								type="button"
								onClick={handleAddTag}
								className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
								disabled={isCloning || !tagInput.trim()}
							>
								Add
							</button>
						</div>
						{config.tags.length > 0 && (
							<div className="flex flex-wrap gap-1.5 mt-2">
								{config.tags.map((tag) => (
									<span
										key={tag}
										className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs"
									>
										{tag}
										<button
											type="button"
											onClick={() => handleRemoveTag(tag)}
											className="hover:text-red-400 transition-colors"
											disabled={isCloning}
										>
											<X className="h-3 w-3" />
										</button>
									</span>
								))}
							</div>
						)}
					</div>

					{/* ─── Options ────────────────────────────────────────────────── */}
					<div className="space-y-2">
						<label className="flex items-center gap-3 cursor-pointer">
							<input
								type="checkbox"
								checked={config.makePublic}
								onChange={(e) =>
									setConfig({ ...config, makePublic: e.target.checked })
								}
								className="w-4 h-4 rounded border-white/20 bg-black text-emerald-500 focus:ring-emerald-500/20"
								disabled={isCloning}
							/>
							<span className="text-sm text-zinc-300">
								Make this template public
							</span>
						</label>

						<label className="flex items-center gap-3 cursor-pointer">
							<input
								type="checkbox"
								checked={config.publishImmediately}
								onChange={(e) =>
									setConfig({ ...config, publishImmediately: e.target.checked })
								}
								className="w-4 h-4 rounded border-white/20 bg-black text-emerald-500 focus:ring-emerald-500/20"
								disabled={isCloning}
							/>
							<span className="text-sm text-zinc-300">Publish immediately</span>
						</label>

						<label className="flex items-center gap-3 cursor-pointer">
							<input
								type="checkbox"
								checked={config.cloneAnimations}
								onChange={(e) =>
									setConfig({ ...config, cloneAnimations: e.target.checked })
								}
								className="w-4 h-4 rounded border-white/20 bg-black text-emerald-500 focus:ring-emerald-500/20"
								disabled={isCloning}
							/>
							<span className="text-sm text-zinc-300 flex items-center gap-1">
								<Sparkles className="h-3.5 w-3.5 text-purple-400" />
								Clone animations too
							</span>
						</label>
					</div>

					{/* ─── Actions ────────────────────────────────────────────────── */}
					<div className="flex items-center gap-3 pt-2 border-t border-white/5">
						<button
							type="button"
							onClick={onClose}
							disabled={isCloning}
							className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isCloning}
							className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
						>
							{isCloning ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Cloning...
								</>
							) : (
								<>
									<Copy className="h-4 w-4" />
									Clone Template
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
