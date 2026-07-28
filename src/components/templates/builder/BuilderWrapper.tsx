"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import type { Template } from "@/lib/st/types/templates-animation";
import { CodeEditor } from "./code/CodeEditor";
import { BuilderLayout } from "./core/BuilderLayout";
import { useBuilder } from "./core/BuilderProvider";
import { CategoryTemplatePreview } from "./preview/CategoryTemplatePreview";
import { LivePreview } from "./preview/LivePreview";
import { PreviewStatus } from "./preview/PreviewStatus";
import { ErrorBoundary } from "./ui/ErrorBoundary";
import { Loader } from "./ui/Loader";

interface BuilderWrapperProps {
	userId: string;
	template?: Template | null;
	isEditMode?: boolean;
	isLoading?: boolean;
}

export function BuilderWrapper({
	userId,
	template,
	isEditMode = false,
	isLoading = false,
}: BuilderWrapperProps) {
	const router = useRouter();

	// ─── Get builder context ──────────────────────────────────────────
	const {
		setName,
		setDescription,
		setCategory,
		setHtmlCode,
		setCssCode,
		setJsCode,
		setPreviewImage,
		setIsPublished,
		setIsPublic,
		setTags,
		setSelectedTheme,
		setSelectedFontPair,
		setSelectedPalette,
		setSelectedPattern,
		resetState,
		setIsDirty,
	} = useBuilder();

	// ─── Load template data when in edit mode ──────────────────────────
	useEffect(() => {
		if (isEditMode && template) {
			// ─── Load template data into builder state ──────────────────────
			setName(template.name || "");
			setDescription(template.description || "");
			setCategory(template.category);
			setHtmlCode(template.html_code || "");
			setCssCode(template.css_code || "");
			setJsCode(template.js_code || "");
			setPreviewImage(template.preview_image || "");
			setIsPublished(template.is_published || false);
			setIsPublic(template.is_public || false);
			setTags(template.tags || []);

			// ─── Load design settings if they exist ─────────────────────────
			if (template.settings) {
				if (template.settings.theme) setSelectedTheme(template.settings.theme);
				if (template.settings.fontPair)
					setSelectedFontPair(template.settings.fontPair);
				if (template.settings.palette)
					setSelectedPalette(template.settings.palette);
				if (template.settings.pattern)
					setSelectedPattern(template.settings.pattern);
			}

			setIsDirty(false);
		} else if (!isEditMode) {
			// ─── Reset state for new template ──────────────────────────────
			resetState();
		}
	}, [isEditMode, template]);

	// ─── Loading State ──────────────────────────────────────────────────
	if (isLoading) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<Loader size="lg" label="Loading template..." />
			</div>
		);
	}

	// ─── Authentication Check ──────────────────────────────────────────
	if (!userId) {
		router.push("/auth/login");
		return null;
	}

	// ─── Render Builder ──────────────────────────────────────────────────
	return (
		<ErrorBoundary>
			<BuilderLayout userId={userId} isEditMode={isEditMode}>
				<CategoryTemplatePreview />

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
					{/* ─── Left: Code Editor ────────────────────────────────── */}
					<div className="space-y-4">
						<CodeEditor />
					</div>

					{/* ─── Right: Live Preview ────────────────────────────── */}
					<div className="space-y-4">
						<LivePreview />
						<PreviewStatus />
					</div>
				</div>
			</BuilderLayout>
		</ErrorBoundary>
	);
}
