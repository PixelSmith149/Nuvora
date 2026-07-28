"use client";

import React from "react";
import { TEMPLATE_CATEGORIES } from "@/lib/st/types/templates-animation";
import { useBuilder } from "../core/BuilderProvider";

export function PreviewStatus() {
	const {
		name,
		category,
		htmlCode,
		cssCode,
		jsCode,
		deviceView,
		isDirty,
		isSaving,
	} = useBuilder();

	const categoryLabel =
		TEMPLATE_CATEGORIES.find((c) => c === category) || category;

	return (
		<div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-500 px-1 py-1.5 border-t border-white/5 mt-2">
			<div className="flex items-center gap-3 flex-wrap">
				<span className="flex items-center gap-1">
					<span className="font-medium text-zinc-400">Template:</span>
					<span className="text-white truncate max-w-[100px]">
						{name || "Untitled"}
					</span>
				</span>
				<span className="flex items-center gap-1">
					<span className="font-medium text-zinc-400">Category:</span>
					<span className="text-emerald-400 capitalize">{categoryLabel}</span>
				</span>
				<span className="flex items-center gap-1">
					<span className="font-medium text-zinc-400">Device:</span>
					<span className="text-white capitalize">{deviceView}</span>
				</span>
			</div>

			<div className="flex items-center gap-3">
				<span className="text-zinc-600">{htmlCode.length} chars HTML</span>
				<span className="text-zinc-600">{cssCode.length} chars CSS</span>
				<span className="text-zinc-600">{jsCode.length} chars JS</span>
				{isDirty && <span className="text-amber-400">• Unsaved</span>}
				{isSaving && (
					<span className="text-emerald-400 animate-pulse">• Saving...</span>
				)}
			</div>
		</div>
	);
}
