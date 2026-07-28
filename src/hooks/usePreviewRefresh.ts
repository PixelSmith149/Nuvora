"use client";

import { useCallback, useEffect, useState } from "react";
import { useBuilder } from "@/components/templates/builder/core/BuilderProvider";

export function usePreviewRefresh() {
	const {
		autoRefresh,
		htmlCode,
		cssCode,
		jsCode,
		getFullHtml,
		// ─── CRITICAL: Add design settings ──────────────────────────────
		selectedTheme,
		selectedFontPair,
		selectedPalette,
		selectedPattern,
	} = useBuilder();

	const [previewKey, setPreviewKey] = useState(0);
	const [htmlContent, setHtmlContent] = useState("");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

	const refreshPreview = useCallback(() => {
		setIsRefreshing(true);
		setHtmlContent(getFullHtml());
		setPreviewKey((prev) => prev + 1);
		setLastUpdated(new Date());
		setTimeout(() => setIsRefreshing(false), 300);
	}, [getFullHtml]);

	// ─── Auto-refresh on changes ──────────────────────────────────────
	useEffect(() => {
		if (autoRefresh) {
			const timer = setTimeout(() => {
				refreshPreview();
			}, 500);
			return () => clearTimeout(timer);
		}
	}, [
		autoRefresh,
		htmlCode,
		cssCode,
		jsCode,
		// ─── CRITICAL: Include design settings ──────────────────────────
		selectedTheme,
		selectedFontPair,
		selectedPalette,
		selectedPattern,
		refreshPreview,
	]);

	return {
		previewKey,
		htmlContent,
		isRefreshing,
		lastUpdated,
		refreshPreview,
	};
}
