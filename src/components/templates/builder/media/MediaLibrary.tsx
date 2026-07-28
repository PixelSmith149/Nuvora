"use client";

import {
	Check,
	Copy,
	FolderOpen,
	Grid3x3,
	Image,
	List,
	Loader2,
	Search,
	Trash2,
	Upload,
	Video,
	X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useToast } from "@/lib/use-toast";
import { MediaGrid } from "./MediaGrid";
import { MediaUploader } from "./MediaUploader";
import type { MediaFile } from "./types";

interface MediaLibraryProps {
	isOpen: boolean;
	onClose: () => void;
	onInsert: (url: string, name: string) => void;
}

export function MediaLibrary({ isOpen, onClose, onInsert }: MediaLibraryProps) {
	const { toast } = useToast();
	const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
	const [showUploader, setShowUploader] = useState(false);

	// ─── Load media files ──────────────────────────────────────────────────
	const loadMedia = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/st/media");
			const data = await response.json();
			if (response.ok) {
				setMediaFiles(data.media || []);
			} else {
				toast({
					title: "Error",
					description: data.error || "Failed to load media",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Failed to load media:", error);
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		if (isOpen) {
			loadMedia();
		}
	}, [isOpen, loadMedia]);

	// ─── Handle media upload ──────────────────────────────────────────────
	const handleUploadComplete = (media: MediaFile) => {
		setMediaFiles((prev) => [media, ...prev]);
		setShowUploader(false);
		toast({
			title: "Upload Successful",
			description: `${media.name} uploaded successfully.`,
			variant: "success",
		});
	};

	// ─── Handle media delete ──────────────────────────────────────────────
	const handleDelete = async (id: string) => {
		if (!confirm("Delete this media file?")) return;

		try {
			const response = await fetch(`/api/st/media/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setMediaFiles((prev) => prev.filter((m) => m.id !== id));
				toast({
					title: "Deleted",
					description: "Media file removed successfully.",
					variant: "success",
				});
			} else {
				const data = await response.json();
				toast({
					title: "Error",
					description: data.error || "Failed to delete media",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Failed to delete media:", error);
		}
	};

	// ─── Handle media insert ──────────────────────────────────────────────
	const handleInsert = (media: MediaFile) => {
		onInsert(media.url, media.name);
		onClose();
		toast({
			title: "Media Inserted",
			description: `${media.name} added to your template.`,
			variant: "success",
		});
	};

	// ─── Filter media ──────────────────────────────────────────────────────
	const filteredMedia = mediaFiles.filter((media) =>
		media.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget && !showUploader) onClose();
			}}
		>
			<div
				className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				{/* ─── Header ──────────────────────────────────────────────────── */}
				<div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
							<FolderOpen className="h-5 w-5 text-emerald-400" />
						</div>
						<div>
							<h3 className="text-lg font-bold text-white">Media Library</h3>
							<p className="text-sm text-zinc-500">
								{mediaFiles.length} files • Shared across all templates
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

				{/* ─── Toolbar ────────────────────────────────────────────────── */}
				<div className="flex items-center gap-3 p-3 border-b border-white/5 flex-shrink-0 flex-wrap">
					<div className="relative flex-1 min-w-[200px]">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search media..."
							className="w-full pl-10 pr-4 py-2 bg-black border border-white/10 text-white rounded-xl text-sm focus:border-emerald-500/30 focus:outline-none transition-colors"
						/>
					</div>

					<button
						onClick={() => setShowUploader(!showUploader)}
						className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors"
					>
						<Upload className="h-4 w-4" />
						Upload
					</button>

					<div className="flex items-center gap-0.5 p-0.5 bg-zinc-800 rounded-lg">
						<button
							onClick={() => setViewMode("grid")}
							className={`p-1.5 rounded-lg transition-colors ${
								viewMode === "grid"
									? "bg-white/10 text-white"
									: "text-zinc-500 hover:text-white"
							}`}
						>
							<Grid3x3 className="h-4 w-4" />
						</button>
						<button
							onClick={() => setViewMode("list")}
							className={`p-1.5 rounded-lg transition-colors ${
								viewMode === "list"
									? "bg-white/10 text-white"
									: "text-zinc-500 hover:text-white"
							}`}
						>
							<List className="h-4 w-4" />
						</button>
					</div>
				</div>

				{/* ─── Content ────────────────────────────────────────────────── */}
				<div className="flex-1 overflow-auto p-4">
					{loading ? (
						<div className="flex items-center justify-center h-40">
							<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
						</div>
					) : showUploader ? (
						<MediaUploader
							onUploadComplete={handleUploadComplete}
							onCancel={() => setShowUploader(false)}
						/>
					) : filteredMedia.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-40 text-zinc-500">
							<FolderOpen className="h-12 w-12 mb-3 opacity-30" />
							<p className="text-sm">No media files yet</p>
							<p className="text-xs">
								Upload images or videos to use in your templates
							</p>
						</div>
					) : (
						<MediaGrid
							media={filteredMedia}
							viewMode={viewMode}
							selectedId={selectedMedia?.id || null}
							onSelect={setSelectedMedia}
							onInsert={handleInsert}
							onDelete={handleDelete}
						/>
					)}
				</div>

				{/* ─── Footer ────────────────────────────────────────────────── */}
				<div className="p-3 border-t border-white/5 flex-shrink-0 flex items-center justify-between text-xs text-zinc-500">
					<span>💡 Media is shared across all your templates</span>
					<span>
						{mediaFiles.length} files •{" "}
						{mediaFiles.filter((m) => m.type === "image").length} images •{" "}
						{mediaFiles.filter((m) => m.type === "video").length} videos
					</span>
				</div>
			</div>
		</div>
	);
}
