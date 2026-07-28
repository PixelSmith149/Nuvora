"use client";

import { FolderOpen, Image, Plus, Video } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/lib/use-toast";
import { useBuilder } from "../core/BuilderProvider";
import { MediaLibrary } from "./MediaLibrary";

export function MediaLibraryButton() {
	const [isOpen, setIsOpen] = useState(false);
	const { setHtmlCode, htmlCode, setIsDirty } = useBuilder();
	const { toast } = useToast();

	// ─── Handle media insert into template ──────────────────────────────
	const handleInsertMedia = (url: string, name: string) => {
		// ─── Detect media type from URL ──────────────────────────────────
		const isVideo =
			/\.(mp4|webm|mov|gif)$/i.test(url) ||
			url.includes("youtube") ||
			url.includes("vimeo");

		// ─── Generate appropriate HTML tag ──────────────────────────────
		let mediaTag = "";
		if (isVideo) {
			mediaTag = `<video controls muted loop playsinline>
  <source src="${url}" type="video/mp4" />
  Your browser does not support the video tag.
</video>`;
		} else {
			mediaTag = `<img src="${url}" alt="${name}" loading="lazy" />`;
		}

		// ─── Insert at cursor position or end ────────────────────────────
		// For simplicity, insert at the end of the HTML
		const newHtml = htmlCode + "\n\n<!-- Media: " + name + " -->\n" + mediaTag;
		setHtmlCode(newHtml);
		setIsDirty(true);

		toast({
			title: "✅ Media Inserted",
			description: `"${name}" added to your template.`,
			variant: "success",
		});
	};

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="w-full flex items-center justify-between p-3 bg-zinc-950/40 border border-white/5 rounded-xl hover:border-white/15 transition-all group"
			>
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover:scale-110 transition-transform">
						<FolderOpen className="h-4 w-4 text-emerald-400" />
					</div>
					<div className="text-left">
						<p className="text-sm font-bold text-white">Media Library</p>
						<p className="text-xs text-zinc-500">
							Insert images & videos into your template
						</p>
					</div>
				</div>
				<div className="flex items-center gap-1 text-zinc-500 group-hover:text-white transition-colors">
					<span className="text-xs">Browse</span>
					<Plus className="h-4 w-4" />
				</div>
			</button>

			{/* ─── Media Library Modal ────────────────────────────────────── */}
			<MediaLibrary
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				onInsert={handleInsertMedia}
			/>
		</>
	);
}
