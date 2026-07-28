"use client";

import { Copy, Download, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import type { Template } from "@/lib/st/types/templates-animation";
import { PublishToMarketButton } from "./PublishToMarketButton";

interface TemplateDetailActionsProps {
	template: Template;
	isOwner: boolean;
	userId: string;
	onDelete?: (id: string) => Promise<void>;
}

export function TemplateDetailActions({
	template,
	isOwner,
	userId,
	onDelete,
}: TemplateDetailActionsProps) {
	const router = useRouter();

	const handleDelete = async () => {
		if (!confirm(`Delete "${template.name}"? This action cannot be undone.`)) {
			return;
		}

		try {
			const response = await fetch(`/api/st/t-a/templates/${template.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to delete template");
			}

			router.push("/social-tenant/t-a/templates");
		} catch (error: any) {
			console.error("Delete error:", error);
			alert(error.message || "Failed to delete template");
		}
	};

	const handleExport = () => {
		// ─── Export logic ──────────────────────────────────────────────────
		const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name}</title>
  <style>${template.css_code || ""}</style>
</head>
<body>
  ${template.html_code || ""}
  <script>${template.js_code || ""}</script>
</body>
</html>`;

		const blob = new Blob([html], { type: "text/html" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${template.name.toLowerCase().replace(/\s/g, "-")}.html`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleClone = async () => {
		try {
			const response = await fetch("/api/st/t-a/clone", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					templateId: template.id,
					newName: `Copy of ${template.name}`,
					category: template.category,
					tags: template.tags || [],
					makePublic: false,
					publishImmediately: false,
					cloneAnimations: true,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to clone template");
			}

			router.push(`/social-tenant/t-a/templates/${data.clone.id}/edit`);
		} catch (error: any) {
			console.error("Clone error:", error);
			alert(error.message || "Failed to clone template");
		}
	};

	if (!isOwner) {
		// ─── Non-owner view (Clone only) ──────────────────────────────────
		if (!template.is_public) return null;

		return (
			<div className="bg-zinc-950/40 border border-white/5 rounded-xl p-4 space-y-3">
				<h3 className="text-sm font-bold text-white">Use This Template</h3>
				<button
					onClick={handleClone}
					className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
				>
					<Copy className="h-4 w-4" />
					Clone Template
				</button>
			</div>
		);
	}

	// ─── Owner view ──────────────────────────────────────────────────────
	return (
		<div className="bg-zinc-950/40 border border-white/5 rounded-xl p-4 space-y-3">
			<h3 className="text-sm font-bold text-white">Actions</h3>

			<div className="grid grid-cols-2 gap-2">
				<button
					onClick={() =>
						router.push(`/social-tenant/t-a/templates/${template.id}/edit`)
					}
					className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium transition-colors"
				>
					<Edit className="h-3.5 w-3.5" />
					Edit
				</button>
				<button
					onClick={handleDelete}
					className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors"
				>
					<Trash2 className="h-3.5 w-3.5" />
					Delete
				</button>
			</div>

			<button
				onClick={handleExport}
				className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
			>
				<Download className="h-4 w-4" />
				Download Template (HTML)
			</button>

			{/* ─── Publish to Market ────────────────────────────────────── */}
			<div className="border-t border-white/5 pt-3">
				<PublishToMarketButton
					templateId={template.id}
					userId={userId}
					templateName={template.name}
					isPublished={template.is_published}
				/>
			</div>
		</div>
	);
}
