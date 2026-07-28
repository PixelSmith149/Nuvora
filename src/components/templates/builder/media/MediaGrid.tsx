"use client";

import {
	Calendar,
	Check,
	Copy,
	File,
	HardDrive,
	Image,
	Trash2,
	Video,
} from "lucide-react";
import React from "react";
import type { MediaFile } from "./types";

interface MediaGridProps {
	media: MediaFile[];
	viewMode: "grid" | "list";
	selectedId: string | null;
	onSelect: (media: MediaFile) => void;
	onInsert: (media: MediaFile) => void;
	onDelete: (id: string) => void;
}

export function MediaGrid({
	media,
	viewMode,
	selectedId,
	onSelect,
	onInsert,
	onDelete,
}: MediaGridProps) {
	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return bytes + " B";
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
		return (bytes / (1024 * 1024)).toFixed(1) + " MB";
	};

	if (viewMode === "grid") {
		return (
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
				{media.map((item) => (
					<div
						key={item.id}
						className={`group bg-zinc-900 border rounded-xl overflow-hidden transition-all cursor-pointer ${
							selectedId === item.id
								? "border-emerald-500"
								: "border-white/10 hover:border-white/20"
						}`}
						onClick={() => onSelect(item)}
						onDoubleClick={() => onInsert(item)}
					>
						<div className="aspect-video bg-black relative overflow-hidden">
							{item.type === "video" ? (
								<video
									src={item.url}
									className="w-full h-full object-cover"
									muted
									autoPlay={false}
								/>
							) : (
								<img
									src={item.url}
									alt={item.name}
									className="w-full h-full object-cover"
									loading="lazy"
								/>
							)}
							<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
								<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-white capitalize">
									{item.type}
								</span>
								<div className="flex items-center gap-1">
									<button
										onClick={(e) => {
											e.stopPropagation();
											onInsert(item);
										}}
										className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
										title="Insert into template"
									>
										<Check className="h-3.5 w-3.5" />
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation();
											onDelete(item.id);
										}}
										className="p-1 rounded bg-red-600/70 hover:bg-red-500 text-white transition-colors"
										title="Delete"
									>
										<Trash2 className="h-3.5 w-3.5" />
									</button>
								</div>
							</div>
							{selectedId === item.id && (
								<div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-0.5">
									<Check className="h-3 w-3 text-white" />
								</div>
							)}
						</div>
						<div className="p-2">
							<p className="text-xs font-medium text-white truncate">
								{item.name}
							</p>
							<p className="text-[10px] text-zinc-500">
								{formatFileSize(item.size)}
							</p>
						</div>
					</div>
				))}
			</div>
		);
	}

	// ─── List View ──────────────────────────────────────────────────────
	return (
		<div className="space-y-1.5">
			{media.map((item) => (
				<div
					key={item.id}
					className={`flex items-center gap-3 p-2 bg-zinc-900 border rounded-lg transition-all cursor-pointer ${
						selectedId === item.id
							? "border-emerald-500"
							: "border-white/5 hover:border-white/15"
					}`}
					onClick={() => onSelect(item)}
					onDoubleClick={() => onInsert(item)}
				>
					<div className="w-12 h-12 rounded-lg bg-black overflow-hidden flex-shrink-0">
						{item.type === "video" ? (
							<video
								src={item.url}
								className="w-full h-full object-cover"
								muted
							/>
						) : (
							<img
								src={item.url}
								alt={item.name}
								className="w-full h-full object-cover"
							/>
						)}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-white truncate">
							{item.name}
						</p>
						<div className="flex items-center gap-3 text-[10px] text-zinc-500">
							<span className="capitalize">{item.type}</span>
							<span>•</span>
							<span>{formatFileSize(item.size)}</span>
							<span>•</span>
							<span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
						</div>
					</div>
					<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
						<button
							onClick={(e) => {
								e.stopPropagation();
								onInsert(item);
							}}
							className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
							title="Insert into template"
						>
							<Check className="h-4 w-4" />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								onDelete(item.id);
							}}
							className="p-1.5 rounded-lg bg-red-600/70 hover:bg-red-500 text-white transition-colors"
							title="Delete"
						>
							<Trash2 className="h-4 w-4" />
						</button>
					</div>
				</div>
			))}
		</div>
	);
}
