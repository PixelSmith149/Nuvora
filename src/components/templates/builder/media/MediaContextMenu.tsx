"use client";

import { FolderOpen, Image, Video } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { MediaLibrary } from "@/components/templates/builder/media/MediaLibrary";

interface MediaContextMenuProps {
	targetRef: React.RefObject<HTMLTextAreaElement | null>;
	onInsert: (url: string, name: string) => void;
}

export function MediaContextMenu({
	targetRef,
	onInsert,
}: MediaContextMenuProps) {
	const [showLibrary, setShowLibrary] = useState(false);
	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
	} | null>(null);

	useEffect(() => {
		const handleContextMenu = (e: MouseEvent) => {
			// ─── Only show context menu if right-clicking inside the textarea ──
			if (targetRef.current && targetRef.current.contains(e.target as Node)) {
				e.preventDefault();
				setContextMenu({ x: e.clientX, y: e.clientY });
			}
		};

		const handleClick = () => {
			setContextMenu(null);
		};

		document.addEventListener("contextmenu", handleContextMenu);
		document.addEventListener("click", handleClick);

		return () => {
			document.removeEventListener("contextmenu", handleContextMenu);
			document.removeEventListener("click", handleClick);
		};
	}, [targetRef]);

	const handleInsertMedia = () => {
		setContextMenu(null);
		setShowLibrary(true);
	};

	return (
		<>
			{/* ─── Context Menu ────────────────────────────────────────────── */}
			{contextMenu && (
				<div
					className="fixed bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-1 z-[9998] min-w-[180px]"
					style={{ top: contextMenu.y, left: contextMenu.x }}
				>
					<button
						onClick={handleInsertMedia}
						className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 transition-colors flex items-center gap-2"
					>
						<FolderOpen className="h-4 w-4 text-emerald-400" />
						Insert Media
					</button>
					<div className="border-t border-white/5 my-1" />
					<div className="px-4 py-1.5 text-[10px] text-zinc-500">
						Media Library • Shared across all templates
					</div>
				</div>
			)}

			{/* ─── Media Library Modal ────────────────────────────────────── */}
			<MediaLibrary
				isOpen={showLibrary}
				onClose={() => setShowLibrary(false)}
				onInsert={onInsert}
			/>
		</>
	);
}
