// components/templates/builder/preview/PreviewFrame.tsx
"use client";

import DOMPurify from "isomorphic-dompurify";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { DeviceView } from "../core/BuilderProvider";

interface PreviewFrameProps {
	htmlContent: string;
	deviceView: DeviceView;
	fullscreen: boolean;
}

export function PreviewFrame({
	htmlContent,
	deviceView,
	fullscreen,
}: PreviewFrameProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentContent, setCurrentContent] = useState<string>("");

	// ─── Store content ──────────────────────────────────────────────────
	useEffect(() => {
		if (htmlContent) {
			setCurrentContent(htmlContent);
		}
	}, [htmlContent]);

	// ─── Device dimensions ──────────────────────────────────────────────
	const deviceStyle = useMemo(() => {
		switch (deviceView) {
			case "mobile":
				return {
					width: 375,
					height: 812,
					frameClass: "rounded-[40px] border border-white/10 shadow-2xl",
					showNotch: true,
					padding: "20px",
				};
			case "tablet":
				return {
					width: 768,
					height: 1024,
					frameClass: "rounded-[32px] border border-white/10 shadow-2xl",
					showNotch: false,
					padding: "20px",
				};
			case "desktop":
			default:
				return {
					width: "100%",
					height: "100%",
					frameClass: "rounded-xl",
					showNotch: false,
					padding: "0",
				};
		}
	}, [deviceView]);

	// ─── Sanitize HTML ──────────────────────────────────────────────────
	const sanitizedHtml = useMemo(() => {
		try {
			return DOMPurify.sanitize(currentContent || htmlContent, {
				ADD_TAGS: ["iframe", "video", "source", "audio", "track", "style"],
				ADD_ATTR: [
					"allow",
					"allowfullscreen",
					"frameborder",
					"scrolling",
					"playsinline",
					"autoplay",
					"muted",
					"loop",
					"controls",
				],
				FORCE_BODY: true,
			});
		} catch (err) {
			setError("Failed to sanitize HTML");
			return '<div class="text-red-400 p-4">⚠️ Failed to render preview</div>';
		}
	}, [currentContent, htmlContent]);

	// ─── Write to iframe ─────────────────────────────────────────────────
	useEffect(() => {
		if (!iframeRef.current || !sanitizedHtml) return;

		const iframe = iframeRef.current;
		setIsLoading(true);
		setError(null);

		try {
			const doc = iframe.contentDocument || iframe.contentWindow?.document;
			if (doc) {
				doc.open();
				doc.write(sanitizedHtml);
				doc.close();
			}
		} catch (err) {
			setError("Failed to render preview");
			console.error("Preview render error:", err);
		} finally {
			setIsLoading(false);
		}
	}, [sanitizedHtml]);

	// ─── Handle device change ────────────────────────────────────────────
	useEffect(() => {
		if (!iframeRef.current) return;
		const iframe = iframeRef.current;
		const doc = iframe.contentDocument || iframe.contentWindow?.document;

		if (doc) {
			const event = new Event("resize");
			window.dispatchEvent(event);
			if (iframe.contentWindow) {
				iframe.contentWindow.dispatchEvent(new Event("resize"));
			}
		}
	}, [deviceView]);

	return (
		<div
			className="w-full h-full flex items-center justify-center transition-all duration-300"
			style={{
				padding: deviceStyle.padding,
				background:
					deviceView !== "desktop" ? "rgba(0,0,0,0.6)" : "transparent",
				overflow: "hidden", // ← PREVENTS OUTER SCROLL
			}}
		>
			{/* ─── Device Frame ────────────────────────────────────────────── */}
			<div
				className={`relative bg-black overflow-hidden ${deviceStyle.frameClass}`}
				style={{
					width: deviceStyle.width,
					height: deviceStyle.height,
					maxWidth: "100%",
					maxHeight: "100%",
					aspectRatio:
						deviceView !== "desktop"
							? `${deviceStyle.width}/${deviceStyle.height}`
							: "auto",
					transition: "all 0.3s ease",
					overflow: "hidden", // ← PREVENTS FRAME SCROLL
				}}
			>
				{/* ─── Notch ─────────────────────────────────────────────────── */}
				{deviceStyle.showNotch && (
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[25px] bg-black rounded-b-[20px] z-10 flex items-center justify-center">
						<div className="w-[50px] h-[5px] bg-zinc-800 rounded-full" />
					</div>
				)}

				{/* ─── Iframe ────────────────────────────────────────────────── */}
				<iframe
					ref={iframeRef}
					className="w-full h-full border-0"
					sandbox="allow-scripts allow-same-origin allow-modals allow-popups allow-forms"
					loading="lazy"
					title="Template Preview"
					style={{
						display: "block",
						width: "100%",
						height: "100%",
						border: "none",
					}}
					// ─── Allow scroll inside iframe ──────────────────────────────
					scrolling="yes"
				/>

				{/* ─── Loading Overlay ────────────────────────────────────── */}
				{isLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20 pointer-events-none">
						<div className="flex flex-col items-center gap-2">
							<div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
							<span className="text-xs text-zinc-400">Loading...</span>
						</div>
					</div>
				)}

				{/* ─── Error Overlay ──────────────────────────────────────── */}
				{error && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 pointer-events-none">
						<div className="text-center">
							<p className="text-red-400 text-sm">{error}</p>
							<p className="text-xs text-zinc-500 mt-1">Check your code</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
