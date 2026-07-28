"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useBuilder } from "../core/BuilderProvider";
import { DeviceToolbar } from "./DeviceToolbar";
import { PreviewControls } from "./PreviewControls";
import { PreviewFrame } from "./PreviewFrame";

export function LivePreview() {
	const {
		deviceView,
		fullscreenPreview,
		setFullscreenPreview,
		getFullHtml,
		autoRefresh,
		htmlCode,
		cssCode,
		jsCode,
		// ─── CRITICAL: Add design settings ──────────────────────────────
		selectedTheme,
		selectedFontPair,
		selectedPalette,
		selectedPattern,
	} = useBuilder();

	const [htmlContent, setHtmlContent] = useState("");
	const [previewKey, setPreviewKey] = useState(0);

	// ─── Update preview content ──────────────────────────────────────
	const refreshPreview = () => {
		const newContent = getFullHtml();
		setHtmlContent(newContent);
		setPreviewKey((prev) => prev + 1);
	};

	// ─── Auto-refresh on changes ──────────────────────────────────────
	useEffect(() => {
		if (autoRefresh) {
			const timer = setTimeout(() => {
				refreshPreview();
			}, 300); // ─── Reduced to 300ms for faster feedback ──────────
			return () => clearTimeout(timer);
		}
	}, [
		htmlCode,
		cssCode,
		jsCode,
		// ─── CRITICAL: Include design settings ──────────────────────────
		selectedTheme,
		selectedFontPair,
		selectedPalette,
		selectedPattern,
		autoRefresh,
	]);

	// ─── Initial load ──────────────────────────────────────────────────
	useEffect(() => {
		refreshPreview();
	}, []);

	return (
		<div className="flex flex-col h-full overflow-hidden space-y-3">
			{/* ─── Toolbar ────────────────────────────────────────────────── */}
			<div className="flex items-center justify-between gap-2 flex-wrap flex-shrink-0">
				<DeviceToolbar />
				<div className="flex items-center gap-2">
					<PreviewControls onRefresh={refreshPreview} />
					<button
						onClick={() => setFullscreenPreview(!fullscreenPreview)}
						className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
					>
						{fullscreenPreview ? (
							<Minimize2 className="h-4 w-4" />
						) : (
							<Maximize2 className="h-4 w-4" />
						)}
					</button>
				</div>
			</div>

			{/* ─── Preview Container ────────────────────────────────────── */}
			<div className="flex-1 bg-black border border-white/5 rounded-xl overflow-hidden relative min-h-[300px]">
				<PreviewFrame
					key={previewKey}
					htmlContent={htmlContent}
					deviceView={deviceView}
					fullscreen={fullscreenPreview}
				/>
			</div>

			{/* ─── Status ──────────────────────────────────────────────────── */}
			<div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 flex-shrink-0">
				<div className="flex items-center gap-3">
					<span>
						📱 {deviceView.charAt(0).toUpperCase() + deviceView.slice(1)}
					</span>
					<span>•</span>
					<span>🔄 {autoRefresh ? "Auto-refresh on" : "Auto-refresh off"}</span>
					<span>•</span>
					<span>🎨 Theme: {selectedTheme}</span>
				</div>
				<span>{fullscreenPreview ? "Fullscreen" : "Normal"}</span>
			</div>
		</div>
	);
}
