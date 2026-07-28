"use client";

import {
	AlertCircle,
	CheckCircle2,
	Eye,
	EyeOff,
	Globe,
	Lock,
	Unlock,
	Upload,
} from "lucide-react";
import React from "react";
import { useBuilder } from "../core/BuilderProvider";

export function PublishToggles() {
	const { isPublished, setIsPublished, isPublic, setIsPublic } = useBuilder();

	// ─── Toggle Handlers ──────────────────────────────────────────────
	const handlePublishToggle = () => {
		setIsPublished(!isPublished);
		// ─── If unpublishing, also set isPublic to false ──────────────
		if (isPublished) {
			setIsPublic(false);
		}
	};

	const handlePublicToggle = () => {
		if (isPublished) {
			setIsPublic(!isPublic);
		}
	};

	return (
		<div className="space-y-3 pt-2">
			{/* ─── Card Container ────────────────────────────────────────────── */}
			<div className="bg-zinc-950/40 border border-white/5 rounded-xl p-4 space-y-4">
				<div className="flex items-center gap-2">
					<Globe className="h-4 w-4 text-zinc-400" />
					<h4 className="text-xs font-bold text-white">Publish Settings</h4>
					<span
						className={`text-[10px] font-medium px-2 py-0.5 rounded-full ml-auto ${
							isPublished && isPublic
								? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
								: isPublished
									? "bg-blue-500/20 text-blue-400 border border-blue-500/20"
									: "bg-amber-500/20 text-amber-400 border border-amber-500/20"
						}`}
					>
						{isPublished && isPublic
							? "🌐 Public"
							: isPublished
								? "🔒 Private"
								: "📝 Draft"}
					</span>
				</div>

				{/* ─── Toggle Row ──────────────────────────────────────────────── */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{/* ─── Published Toggle ────────────────────────────────────── */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
								{isPublished ? (
									<CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
								) : (
									<AlertCircle className="h-3.5 w-3.5 text-amber-400" />
								)}
								{isPublished ? "Published" : "Draft"}
							</span>
							<span className="text-[10px] text-zinc-500">
								{isPublished ? "✅ Active" : "⏳ Inactive"}
							</span>
						</div>

						{/* ─── Toggle Switch ────────────────────────────────────── */}
						<button
							onClick={handlePublishToggle}
							className={`relative w-full h-10 rounded-xl transition-all duration-300 flex items-center px-1 ${
								isPublished
									? "bg-emerald-600/30 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
									: "bg-zinc-800/50 border border-white/10 hover:border-white/20"
							}`}
						>
							<div
								className={`absolute left-1 top-1 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center transition-all duration-300 ${
									isPublished
										? "translate-x-[calc(100%-2px)] bg-emerald-500/20"
										: "translate-x-0"
								}`}
							>
								{isPublished ? (
									<CheckCircle2 className="h-4 w-4 text-emerald-400" />
								) : (
									<AlertCircle className="h-4 w-4 text-zinc-400" />
								)}
							</div>
							<span
								className={`absolute text-xs font-medium transition-all duration-300 ${
									isPublished
										? "left-1/2 text-emerald-300"
										: "right-1/2 translate-x-1/2 text-zinc-400"
								}`}
							>
								{isPublished ? "Published" : "Draft"}
							</span>
						</button>

						<p className="text-[10px] text-zinc-500">
							{isPublished
								? "Template is live and accessible"
								: "Template is in draft mode"}
						</p>
					</div>

					{/* ─── Public Toggle ────────────────────────────────────────── */}
					<div className="flex flex-col gap-1.5">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
								{isPublic ? (
									<Globe className="h-3.5 w-3.5 text-blue-400" />
								) : (
									<Lock className="h-3.5 w-3.5 text-zinc-500" />
								)}
								{isPublic ? "Public" : "Private"}
							</span>
							<span className="text-[10px] text-zinc-500">
								{isPublic ? "🌐 Global" : "🔒 Restricted"}
							</span>
						</div>

						{/* ─── Toggle Switch ────────────────────────────────────── */}
						<button
							onClick={handlePublicToggle}
							disabled={!isPublished}
							className={`relative w-full h-10 rounded-xl transition-all duration-300 flex items-center px-1 ${
								!isPublished
									? "bg-zinc-800/30 border border-white/5 opacity-40 cursor-not-allowed"
									: isPublic
										? "bg-blue-600/30 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
										: "bg-zinc-800/50 border border-white/10 hover:border-white/20"
							}`}
						>
							<div
								className={`absolute left-1 top-1 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center transition-all duration-300 ${
									isPublic
										? "translate-x-[calc(100%-2px)] bg-blue-500/20"
										: "translate-x-0"
								}`}
							>
								{isPublic ? (
									<Globe className="h-4 w-4 text-blue-400" />
								) : (
									<Lock className="h-4 w-4 text-zinc-400" />
								)}
							</div>
							<span
								className={`absolute text-xs font-medium transition-all duration-300 ${
									isPublic
										? "left-1/2 text-blue-300"
										: "right-1/2 translate-x-1/2 text-zinc-400"
								}`}
							>
								{isPublic ? "Public" : "Private"}
							</span>
						</button>

						<p className="text-[10px] text-zinc-500">
							{!isPublished
								? "Publish first to change visibility"
								: isPublic
									? "Visible in Public Gallery"
									: "Only accessible via direct link"}
						</p>
					</div>
				</div>

				{/* ─── Status Summary ────────────────────────────────────────── */}
				<div className="flex items-center justify-between pt-2 border-t border-white/5">
					<div className="flex items-center gap-2">
						<div
							className={`w-2 h-2 rounded-full ${
								isPublished && isPublic
									? "bg-emerald-500"
									: isPublished
										? "bg-blue-500"
										: "bg-amber-500"
							}`}
						/>
						<span className="text-[10px] text-zinc-500">
							{isPublished && isPublic
								? "🌐 Public & Published"
								: isPublished
									? "🔒 Private (Published)"
									: "📝 Draft (Unpublished)"}
						</span>
					</div>
					<button
						onClick={handlePublishToggle}
						className="flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
					>
						<Upload className="h-3 w-3" />
						{isPublished ? "Unpublish" : "Publish"}
					</button>
				</div>
			</div>

			{/* ─── Helper Text ────────────────────────────────────────────── */}
			{!isPublished && isPublic && (
				<div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
					<AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
					<p className="text-xs text-amber-400">
						Template must be <strong>published</strong> before it can be made
						public.
					</p>
				</div>
			)}
			{isPublished && isPublic && (
				<div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
					<Globe className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
					<p className="text-xs text-emerald-400">
						✅ This template is <strong>published</strong> and{" "}
						<strong>public</strong> — visible to everyone in the Public Gallery.
					</p>
				</div>
			)}
			{isPublished && !isPublic && (
				<div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
					<Eye className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
					<p className="text-xs text-blue-400">
						🔒 This template is <strong>published</strong> but{" "}
						<strong>private</strong>. Toggle "Public" to share it with the
						community.
					</p>
				</div>
			)}
			{!isPublished && !isPublic && (
				<div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-800/50 border border-white/5">
					<AlertCircle className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" />
					<p className="text-xs text-zinc-400">
						📝 This template is a <strong>draft</strong>. Publish it to make it
						accessible to others.
					</p>
				</div>
			)}
		</div>
	);
}
