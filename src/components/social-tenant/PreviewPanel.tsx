// components/social-tenant/PreviewPanel.tsx

"use client";

import {
	AlertCircle,
	CheckCircle2,
	Eye,
	Loader2,
	Maximize2,
	Minimize2,
	Monitor,
	RefreshCw,
	Smartphone,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface PreviewPanelProps {
	htmlBuffer: string;
	isGenerating: boolean;
	isComplete: boolean;
	siteHtml: string | null;
	onEditRequest: (section: string, newContent: string) => void;
}

type DeviceMode = "desktop" | "mobile";

export function PreviewPanel({
	htmlBuffer,
	isGenerating,
	isComplete,
	siteHtml,
	onEditRequest,
}: PreviewPanelProps) {
	const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [previewHtml, setPreviewHtml] = useState<string>("");
	const iframeRef = useRef<HTMLIFrameElement>(null);

	// ─── Update preview ─────────────────────────────────────────
	useEffect(() => {
		// If generation is complete and we have HTML, use it
		if (isComplete && htmlBuffer) {
			setPreviewHtml(htmlBuffer);
			return;
		}

		// If we have existing site HTML and no generation happening
		if (siteHtml && !isGenerating) {
			setPreviewHtml(siteHtml);
			return;
		}

		// If generating but have some HTML, show it
		if (htmlBuffer) {
			setPreviewHtml(htmlBuffer);
		}
	}, [htmlBuffer, isGenerating, isComplete, siteHtml]);

	// ─── Device Classes ─────────────────────────────────────────
	const deviceClasses = {
		desktop: "w-full h-full",
		mobile:
			"w-[375px] h-[812px] mx-auto overflow-hidden rounded-2xl border border-white/10",
	};

	// ─── Fullscreen toggle ──────────────────────────────────────
	const toggleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
	};

	// ─── Render Preview ─────────────────────────────────────────
	const renderPreview = () => {
		try {
			// Case 1: No HTML and not generating
			if (!previewHtml && !isGenerating) {
				return (
					<div className="flex flex-col items-center justify-center h-full text-center">
						<Eye className="h-12 w-12 text-zinc-700 mb-4" />
						<p className="text-sm text-zinc-500">Preview your website here</p>
						<p className="text-xs text-zinc-600">
							Build or generate to see the live preview
						</p>
					</div>
				);
			}

			// Case 2: Generating but no HTML yet
			if (isGenerating && !previewHtml) {
				return (
					<div className="flex flex-col items-center justify-center h-full text-center">
						<Loader2 className="h-12 w-12 text-emerald-400 animate-spin mb-4" />
						<p className="text-sm text-zinc-500">Generating your website...</p>
						<p className="text-xs text-zinc-600">
							This will only take a moment
						</p>
					</div>
				);
			}

			// Case 3: We have HTML to display
			if (previewHtml) {
				return (
					<iframe
						ref={iframeRef}
						srcDoc={previewHtml}
						className="w-full h-full border-0 bg-white"
						title="Website Preview"
						sandbox="allow-scripts allow-modals allow-same-origin"
						loading="lazy"
					/>
				);
			}

			// Fallback: should never reach here
			return null;
		} catch (error) {
			console.error("Preview render error:", error);
			return (
				<div className="flex flex-col items-center justify-center h-full text-center p-4">
					<AlertCircle className="h-12 w-12 text-red-400 mb-4" />
					<p className="text-sm text-red-400">Failed to render preview</p>
					<p className="text-xs text-zinc-500">
						Please try refreshing or regenerating the website
					</p>
				</div>
			);
		}
	};

	// ─── Main Render ────────────────────────────────────────────
	return (
		<div
			className={`flex flex-col h-full bg-black ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
		>
			{/* ─── Header ───────────────────────────────────────────── */}
			<div className="border-b border-white/5 px-4 py-3 flex-shrink-0 bg-zinc-950/30 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Eye className="h-4 w-4 text-emerald-400" />
					<span className="text-xs font-bold text-white">Live Preview</span>
					{isGenerating && (
						<span className="text-[10px] text-amber-400 flex items-center gap-1">
							<Loader2 className="h-3 w-3 animate-spin" />
							Building...
						</span>
					)}
					{isComplete && previewHtml && (
						<span className="text-[10px] text-emerald-400 flex items-center gap-1">
							<CheckCircle2 className="h-3 w-3" />
							Live
						</span>
					)}
				</div>

				<div className="flex items-center gap-1">
					{/* Device Toggle */}
					<button
						onClick={() => setDeviceMode("desktop")}
						className={`p-1.5 rounded-md transition-colors ${
							deviceMode === "desktop"
								? "bg-emerald-500/20 text-emerald-400"
								: "text-zinc-500 hover:text-white"
						}`}
					>
						<Monitor className="h-4 w-4" />
					</button>
					<button
						onClick={() => setDeviceMode("mobile")}
						className={`p-1.5 rounded-md transition-colors ${
							deviceMode === "mobile"
								? "bg-emerald-500/20 text-emerald-400"
								: "text-zinc-500 hover:text-white"
						}`}
					>
						<Smartphone className="h-4 w-4" />
					</button>

					<div className="w-px h-6 bg-white/5 mx-1" />

					{/* Refresh */}
					<button
						onClick={() => {
							if (iframeRef.current) {
								iframeRef.current.src = iframeRef.current.src;
							}
						}}
						className="p-1.5 rounded-md text-zinc-500 hover:text-white transition-colors"
					>
						<RefreshCw className="h-4 w-4" />
					</button>

					{/* Fullscreen */}
					<button
						onClick={toggleFullscreen}
						className="p-1.5 rounded-md text-zinc-500 hover:text-white transition-colors"
					>
						{isFullscreen ? (
							<Minimize2 className="h-4 w-4" />
						) : (
							<Maximize2 className="h-4 w-4" />
						)}
					</button>
				</div>
			</div>

			{/* ─── Preview Area ─────────────────────────────────────── */}
			<div className="flex-1 overflow-hidden bg-zinc-950">
				<div
					className={`h-full ${deviceMode === "mobile" ? "flex items-center justify-center p-4" : ""}`}
				>
					<div className={deviceClasses[deviceMode]}>{renderPreview()}</div>
				</div>
			</div>
		</div>
	);
}
