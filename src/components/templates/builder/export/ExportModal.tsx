"use client";

import {
	AlertCircle,
	CheckCircle2,
	Download,
	FileArchive,
	FileCode,
	FileJson,
	Globe,
	Loader2,
	Store,
	X,
} from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/lib/use-toast";
import { useBuilder } from "../core/BuilderProvider";
import { ExportFormatSelector } from "./ExportFormatSelector";
import { ExportProgress } from "./ExportProgress";

interface ExportModalProps {
	isOpen: boolean;
	onClose: () => void;
	templateData: {
		name: string;
		templateId?: string;
		htmlCode: string;
		cssCode: string;
		jsCode: string;
		description: string;
		category: string;
	};
}

export function ExportModal({
	isOpen,
	onClose,
	templateData,
}: ExportModalProps) {
	const { toast } = useToast();
	const { name, isPublished, isPublic, category, tags, getFullCss } =
		useBuilder();

	// ─── Extract templateId from templateData ──────────────────────────
	const { templateId } = templateData;

	const [selectedFormat, setSelectedFormat] = useState<"html" | "zip" | "json">(
		"html",
	);
	const [isExporting, setIsExporting] = useState(false);
	const [exportProgress, setExportProgress] = useState(0);
	const [exportComplete, setExportComplete] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [publishingToPublic, setPublishingToPublic] = useState(false);
	const [publishingToStore, setPublishingToStore] = useState(false);
	const [publishSuccess, setPublishSuccess] = useState(false);

	if (!isOpen) return null;

	// ─── Export Handlers ──────────────────────────────────────────────────
	const handleExport = async () => {
		setIsExporting(true);
		setExportProgress(0);
		setError(null);
		setExportComplete(false);

		try {
			const steps = [
				"Generating files...",
				"Packaging...",
				"Optimizing...",
				"Preparing download...",
			];
			for (let i = 0; i < steps.length; i++) {
				setExportProgress(((i + 1) / steps.length) * 100);
				await new Promise((resolve) => setTimeout(resolve, 400));
			}

			const fullCss = getFullCss();
			const fileName = name.toLowerCase().replace(/\s/g, "-") || "template";

			if (selectedFormat === "html") {
				const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <meta name="description" content="${templateData.description || ""}">
  <style>${fullCss}</style>
</head>
<body>
  ${templateData.htmlCode}
  <script>${templateData.jsCode}</script>
</body>
</html>`;

				const blob = new Blob([html], { type: "text/html" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${fileName}.html`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);

				toast({
					title: "✅ Template Exported",
					description: "HTML file downloaded successfully",
					variant: "success",
				});
			}

			if (selectedFormat === "zip") {
				const JSZip = (await import("jszip")).default;
				const zip = new JSZip();

				zip.file(
					"index.html",
					`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  ${templateData.htmlCode}
  <script src="script.js"></script>
</body>
</html>`,
				);

				zip.file("style.css", fullCss);
				zip.file("script.js", templateData.jsCode || "");
				zip.file(
					"README.md",
					`# ${name}\n\n${templateData.description || ""}\n\n## Files\n- index.html\n- style.css\n- script.js\n\n## Category\n${category}\n\nExported from Prime Boostage | Elite Home`,
				);

				const zipBuffer = await zip.generateAsync({
					type: "nodebuffer",
					compression: "DEFLATE",
					compressionOptions: { level: 6 },
				});

				const uint8Array = new Uint8Array(zipBuffer);
				const blob = new Blob([uint8Array], { type: "application/zip" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${fileName}.zip`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);

				toast({
					title: "✅ Template Exported",
					description: "ZIP package downloaded successfully",
					variant: "success",
				});
			}

			if (selectedFormat === "json") {
				const jsonData = {
					name,
					description: templateData.description,
					category,
					tags,
					html: templateData.htmlCode,
					css: fullCss,
					js: templateData.jsCode,
					isPublished,
					isPublic,
					exportedAt: new Date().toISOString(),
					platform: "Prime Boostage | Elite Home",
				};

				const json = JSON.stringify(jsonData, null, 2);
				const blob = new Blob([json], { type: "application/json" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${fileName}.json`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);

				toast({
					title: "✅ Template Exported",
					description: "JSON file downloaded successfully",
					variant: "success",
				});
			}

			setExportComplete(true);
			setTimeout(() => setExportComplete(false), 3000);
		} catch (err: any) {
			setError(err.message || "Export failed");
			toast({
				title: "Export Failed",
				description: err.message || "Failed to export template",
				variant: "destructive",
			});
		} finally {
			setIsExporting(false);
			setExportProgress(0);
		}
	};

	// ─── Publish to Public Gallery ──────────────────────────────────────
	const handlePublishToPublic = async () => {
		if (!isPublished) {
			setError("Template must be published first");
			toast({
				title: "Publish Failed",
				description: "Please publish the template first",
				variant: "destructive",
			});
			return;
		}

		if (!templateId) {
			setError("Template ID is required");
			toast({
				title: "Publish Failed",
				description: "Template ID is missing",
				variant: "destructive",
			});
			return;
		}

		setPublishingToPublic(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/st/t-a/templates/${templateId}/publish`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ isPublic: true }),
				},
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to publish to Public Gallery");
			}

			toast({
				title: "✅ Published to Public Gallery",
				description: "Your template is now visible to everyone",
				variant: "success",
			});
			setPublishSuccess(true);
		} catch (err: any) {
			setError(err.message || "Failed to publish");
			toast({
				title: "Publish Failed",
				description: err.message || "Failed to publish to Public Gallery",
				variant: "destructive",
			});
		} finally {
			setPublishingToPublic(false);
		}
	};

	// ─── Publish to Global Market Store ─────────────────────────────────
	const handlePublishToStore = async () => {
		if (!isPublished) {
			setError("Template must be published first");
			toast({
				title: "Publish Failed",
				description: "Please publish the template first",
				variant: "destructive",
			});
			return;
		}

		if (!isPublic) {
			setError("Template must be public first");
			toast({
				title: "Publish Failed",
				description: "Please make the template public first",
				variant: "destructive",
			});
			return;
		}

		if (!templateId) {
			setError("Template ID is required");
			toast({
				title: "Publish Failed",
				description: "Template ID is missing",
				variant: "destructive",
			});
			return;
		}

		setPublishingToStore(true);
		setError(null);

		try {
			const response = await fetch("/api/st/t-a/publish-to-market", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ templateId }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to publish to Global Market");
			}

			if (data.needStore) {
				setError("You need to create a store first");
				toast({
					title: "Store Required",
					description: "Please set up your store first",
					variant: "warning",
				});
				return;
			}

			if (data.needVerification) {
				setError("Your store needs to be verified");
				toast({
					title: "Store Verification Required",
					description: "Please verify your store first",
					variant: "warning",
				});
				return;
			}

			toast({
				title: "✅ Listed in Global Market",
				description: "Your template is now available in the store",
				variant: "success",
			});
			setPublishSuccess(true);
		} catch (err: any) {
			setError(err.message || "Failed to list");
			toast({
				title: "Listing Failed",
				description: err.message || "Failed to list in Global Market",
				variant: "destructive",
			});
		} finally {
			setPublishingToStore(false);
		}
	};

	// ─── Render ──────────────────────────────────────────────────────────
	return (
		<div
			className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget && !isExporting) onClose();
			}}
		>
			<div
				className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				{/* ─── Header ────────────────────────────────────────────────── */}
				<div className="flex items-center justify-between p-4 border-b border-white/5">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
							<Download className="h-5 w-5 text-emerald-400" />
						</div>
						<div>
							<h3 className="text-lg font-bold text-white">Export & Publish</h3>
							<p className="text-sm text-zinc-500">
								Download or share your template
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						disabled={isExporting}
						className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="p-4 space-y-4">
					{/* ─── Error ────────────────────────────────────────────────── */}
					{error && (
						<div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
							<AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
							<span>{error}</span>
						</div>
					)}

					{/* ─── Publish Actions ────────────────────────────────────── */}
					<div className="grid grid-cols-2 gap-3">
						<button
							onClick={handlePublishToPublic}
							disabled={publishingToPublic || publishingToStore}
							className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-left disabled:opacity-50"
						>
							{publishingToPublic ? (
								<Loader2 className="h-4 w-4 animate-spin text-blue-400" />
							) : (
								<Globe className="h-4 w-4 text-blue-400" />
							)}
							<p className="text-sm font-bold text-white mt-1">
								Public Gallery
							</p>
							<p className="text-[10px] text-zinc-500">Share with community</p>
						</button>

						<button
							onClick={handlePublishToStore}
							disabled={publishingToStore || publishingToPublic}
							className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-left disabled:opacity-50"
						>
							{publishingToStore ? (
								<Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
							) : (
								<Store className="h-4 w-4 text-emerald-400" />
							)}
							<p className="text-sm font-bold text-white mt-1">Global Market</p>
							<p className="text-[10px] text-zinc-500">Sell your template</p>
						</button>
					</div>

					{/* ─── Success Message ────────────────────────────────────── */}
					{publishSuccess && (
						<div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
							<CheckCircle2 className="h-4 w-4" />
							<span>
								Published successfully! View it in the Public Gallery.
							</span>
						</div>
					)}

					{/* ─── Divider ────────────────────────────────────────────── */}
					<div className="flex items-center gap-2">
						<div className="flex-1 h-px bg-white/5" />
						<span className="text-xs text-zinc-500">Export</span>
						<div className="flex-1 h-px bg-white/5" />
					</div>

					{/* ─── Export Format ───────────────────────────────────────── */}
					<ExportFormatSelector
						selected={selectedFormat}
						onChange={setSelectedFormat}
					/>

					{/* ─── Export Button ───────────────────────────────────────── */}
					<button
						onClick={handleExport}
						disabled={isExporting}
						className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors"
					>
						{isExporting ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Exporting...
							</>
						) : (
							<>
								<Download className="h-4 w-4" />
								Download {selectedFormat.toUpperCase()}
							</>
						)}
					</button>

					{/* ─── Progress ────────────────────────────────────────────── */}
					{isExporting && <ExportProgress progress={exportProgress} />}

					{/* ─── Quick Stats ────────────────────────────────────────── */}
					<div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500 pt-2 border-t border-white/5">
						<span className="flex items-center gap-1">
							<FileCode className="h-3 w-3" />
							{templateData.htmlCode.length} chars HTML
						</span>
						<span className="flex items-center gap-1">
							<FileCode className="h-3 w-3" />
							{templateData.cssCode.length} chars CSS
						</span>
						<span className="flex items-center gap-1">
							<FileCode className="h-3 w-3" />
							{templateData.jsCode.length} chars JS
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
