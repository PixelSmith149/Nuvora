"use client";

import {
	CheckCircle2,
	Download,
	Eye,
	Globe,
	Loader2,
	Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useTemplateValidation } from "@/hooks/useTemplateValidation";
import { createTemplateClient } from "@/lib/st/services/template.client";
import { useToast } from "@/lib/use-toast";
import { useBuilder } from "../core/BuilderProvider";
import { ExportModal } from "../export/ExportModal";

interface BuilderActionsProps {
	userId: string;
	isEditMode?: boolean;
	templateId?: string;
}

export function BuilderActions({
	userId,
	isEditMode = false,
	templateId,
}: BuilderActionsProps) {
	const router = useRouter();
	const { toast } = useToast();
	const { validate } = useTemplateValidation();

	const [showExportModal, setShowExportModal] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [isNewTemplate, setIsNewTemplate] = useState(
		!isEditMode && !templateId,
	);
	const [templateIdState, setTemplateIdState] = useState<string | undefined>(
		templateId,
	);

	const {
		name,
		description,
		category,
		htmlCode,
		cssCode,
		jsCode,
		previewImage,
		isPublished,
		isPublic,
		tags,
		getFullCss,
		isDirty,
		setIsDirty,
		setError,
		selectedTheme,
		selectedFontPair,
		selectedPalette,
		selectedPattern,
	} = useBuilder();

	// ─── Validation ──────────────────────────────────────────────────────
	const runValidation = (): boolean => {
		if (!name.trim()) {
			toast({
				title: "Validation Error",
				description: "Template name is required",
				variant: "destructive",
			});
			return false;
		}
		return true;
	};

	// ─── Core Save Logic ────────────────────────────────────────────────
	const performSave = async (options?: {
		silent?: boolean;
	}): Promise<{ success: boolean; templateId?: string }> => {
		const { silent = false } = options || {};

		if (!runValidation()) {
			return { success: false };
		}

		setIsSaving(true);
		setSaveSuccess(false);

		try {
			const fullCss = getFullCss();

			let savedTemplate;

			if (isEditMode && templateIdState) {
				// ─── Update existing template ──────────────────────────────
				const response = await fetch(
					`/api/st/t-a/templates/${templateIdState}`,
					{
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							name: name.trim(),
							description: description.trim() || null,
							category,
							html_code: htmlCode,
							css_code: fullCss,
							js_code: jsCode,
							preview_image: previewImage || null,
							is_published: isPublished,
							is_public: isPublic,
							tags,
							settings: {
								theme: selectedTheme,
								fontPair: selectedFontPair,
								palette: selectedPalette,
								pattern: selectedPattern,
							},
						}),
					},
				);

				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Failed to update template");
				}

				savedTemplate = data.template;
			} else {
				// ─── Create new template ────────────────────────────────────
				const newTemplate = await createTemplateClient(userId, {
					name: name.trim(),
					description: description.trim() || null,
					category,
					type: "custom",
					html_code: htmlCode,
					css_code: fullCss,
					js_code: jsCode,
					preview_image: previewImage || null,
					is_published: isPublished,
					is_public: isPublic,
					tags,
					settings: {
						theme: selectedTheme,
						fontPair: selectedFontPair,
						palette: selectedPalette,
						pattern: selectedPattern,
					},
				});

				savedTemplate = newTemplate;

				if (savedTemplate?.id && isNewTemplate) {
					setTemplateIdState(savedTemplate.id);
					setIsNewTemplate(false);
				}
			}

			setLastSaved(new Date());
			setSaveSuccess(true);
			setIsDirty(false);

			// ─── ONLY show toast if NOT silent ──────────────────────────────
			if (!silent) {
				toast({
					title: isEditMode ? "✅ Template Updated!" : "✅ Template Created!",
					description: isEditMode
						? "Your template has been updated successfully."
						: "Your template has been saved successfully.",
					variant: "success",
				});
			}

			setTimeout(() => setSaveSuccess(false), 3000);

			return {
				success: true,
				templateId: savedTemplate?.id || templateIdState,
			};
		} catch (err: any) {
			setError(err.message);
			// ─── Show error even on silent (user needs to know something went wrong) ──
			toast({
				title: "Save Failed",
				description: err.message || "Failed to save template",
				variant: "destructive",
			});
			return { success: false };
		} finally {
			setIsSaving(false);
		}
	};

	// ─── Manual Save (user clicks save button - with toast, redirects) ────
	const handleSave = async () => {
		const result = await performSave({ silent: false });

		if (result.success && result.templateId) {
			router.push(`/social-tenant/t-a/templates/${result.templateId}/edit`);
		}
	};

	// ─── Auto-Save (silent save - NO toast, NO redirect) ────────────────
	const { save: autoSave, isSaving: isAutoSaving } = useAutoSave({
		delay: 3000,
		onSave: async () => {
			// ─── Only auto-save if we have a name ──────────────────────────
			if (isDirty && name.trim()) {
				// ─── Silent save - NO toast, NO redirect ──────────────────────
				await performSave({ silent: true });
			}
		},
		onError: (error) => {
			// ─── Only show error if auto-save fails (critical) ──────────────
			toast({
				title: "Auto-save Failed",
				description: error.message,
				variant: "destructive",
			});
		},
	});

	// ─── Trigger auto-save when dirty ──────────────────────────────────
	useEffect(() => {
		if (isDirty && name.trim()) {
			autoSave();
		}
	}, [isDirty, name, autoSave]);

	// ─── Keyboard Shortcuts ─────────────────────────────────────────────
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "s") {
				e.preventDefault();
				handleSave();
			}
			if ((e.ctrlKey || e.metaKey) && e.key === "e") {
				e.preventDefault();
				setShowExportModal(true);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<>
			<div className="flex items-center gap-1.5 flex-wrap">
				{/* ─── Status Indicator ────────────────────────────────────── */}
				{isAutoSaving && (
					<div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
						<Loader2 className="h-3 w-3 animate-spin text-amber-400" />
						<span className="text-[10px] text-amber-400">Auto-saving...</span>
					</div>
				)}

				{saveSuccess && !isAutoSaving && (
					<div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
						<CheckCircle2 className="h-3 w-3 text-emerald-400" />
						<span className="text-[10px] text-emerald-400">
							{isEditMode ? "Updated" : "Saved"}
							{lastSaved && ` at ${lastSaved.toLocaleTimeString()}`}
						</span>
					</div>
				)}

				{isDirty && !isSaving && !isAutoSaving && !saveSuccess && (
					<div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800/50 border border-white/5">
						<span className="text-[10px] text-zinc-400">● Unsaved changes</span>
					</div>
				)}

				{/* ─── Preview Button ──────────────────────────────────────── */}
				<button
					onClick={() => {
						const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>${getFullCss()}</style>
</head>
<body>
  ${htmlCode}
  <script>${jsCode}</script>
</body>
</html>`;
						const win = window.open("", "_blank");
						if (win) {
							win.document.write(fullHtml);
							win.document.close();
						}
					}}
					className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
				>
					<Eye className="h-3.5 w-3.5" />
					<span className="hidden sm:inline">Preview</span>
				</button>

				{/* ─── Export Button ────────────────────────────────────────── */}
				<button
					onClick={() => setShowExportModal(true)}
					className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
				>
					<Download className="h-3.5 w-3.5" />
					<span className="hidden sm:inline">Export</span>
				</button>

				{/* ─── Publish Button ────────────────────────────────────────── */}
				<button
					onClick={() => {
						if (!isPublished) {
							toast({
								title: "Publish Template",
								description:
									'Toggle "Published" in Settings to publish this template',
								variant: "info",
							});
						} else if (!isPublic) {
							toast({
								title: "Make Public",
								description:
									'Toggle "Public" in Settings to share with the community',
								variant: "info",
							});
						} else {
							toast({
								title: "✅ Template is Public",
								description: "This template is visible to everyone",
								variant: "success",
							});
						}
					}}
					className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
						isPublished && isPublic
							? "text-emerald-400 hover:bg-emerald-500/10"
							: "text-zinc-400 hover:text-white hover:bg-white/5"
					}`}
				>
					<Globe className="h-3.5 w-3.5" />
					<span className="hidden sm:inline">
						{isPublished && isPublic
							? "Public"
							: isPublished
								? "Private"
								: "Draft"}
					</span>
				</button>

				{/* ─── Save Button ────────────────────────────────────────────── */}
				<button
					onClick={handleSave}
					disabled={isSaving}
					className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
						isSaving
							? "bg-zinc-700 text-zinc-300 cursor-not-allowed"
							: isDirty
								? "bg-emerald-600 hover:bg-emerald-500 text-white"
								: "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
					}`}
					title="Save template (Ctrl+S)"
				>
					{isSaving ? (
						<Loader2 className="h-3.5 w-3.5 animate-spin" />
					) : (
						<Save className="h-3.5 w-3.5" />
					)}
					{isSaving ? "Saving..." : isDirty ? "Save*" : "Saved"}
				</button>
			</div>

			{/* ─── Export Modal ────────────────────────────────────────────── */}
			{showExportModal && (
				<ExportModal
					isOpen={showExportModal}
					onClose={() => setShowExportModal(false)}
					templateData={{
						name,
						templateId: templateIdState,
						htmlCode,
						cssCode: getFullCss(),
						jsCode,
						description,
						category,
					}}
				/>
			)}
		</>
	);
}
