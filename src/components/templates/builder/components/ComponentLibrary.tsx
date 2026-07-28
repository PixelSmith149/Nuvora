"use client";

import { Grid3x3, LayoutTemplate, List, Search } from "lucide-react";
import React, { useState } from "react";
import { useBuilder } from "../core/BuilderProvider";
import { ComponentCard } from "./ComponentCard";
import { ComponentCategories } from "./ComponentCategories";
import { ComponentSearch } from "./ComponentSearch";

// ─── Component Categories ──────────────────────────────────────────────
export const COMPONENT_CATEGORIES = [
	{ id: "all", label: "All Components" },
	{ id: "layout", label: "Layout" },
	{ id: "navigation", label: "Navigation" },
	{ id: "hero", label: "Hero Sections" },
	{ id: "content", label: "Content" },
	{ id: "media", label: "Media" },
	{ id: "forms", label: "Forms" },
	{ id: "ecommerce", label: "E-commerce" },
	{ id: "interaction", label: "Interaction" },
	{ id: "advanced", label: "Advanced" },
];

export function ComponentLibrary() {
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [searchQuery, setSearchQuery] = useState("");

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-bold text-white flex items-center gap-2">
					<LayoutTemplate className="h-4 w-4 text-emerald-400" />
					Component Library
				</h3>
				<div className="flex items-center gap-0.5 p-0.5 bg-black/50 rounded-lg">
					<button
						onClick={() => setViewMode("grid")}
						className={`p-1 rounded-lg transition-colors ${
							viewMode === "grid"
								? "bg-white/10 text-white"
								: "text-zinc-500 hover:text-white"
						}`}
					>
						<Grid3x3 className="h-3.5 w-3.5" />
					</button>
					<button
						onClick={() => setViewMode("list")}
						className={`p-1 rounded-lg transition-colors ${
							viewMode === "list"
								? "bg-white/10 text-white"
								: "text-zinc-500 hover:text-white"
						}`}
					>
						<List className="h-3.5 w-3.5" />
					</button>
				</div>
			</div>

			<ComponentSearch value={searchQuery} onChange={setSearchQuery} />
			<ComponentCategories
				selected={selectedCategory}
				onSelect={setSelectedCategory}
			/>

			<div
				className={`grid ${
					viewMode === "grid" ? "grid-cols-2 gap-2" : "grid-cols-1 gap-1.5"
				} max-h-[400px] overflow-y-auto pr-1`}
			>
				<ComponentCard
					category={selectedCategory}
					searchQuery={searchQuery}
					viewMode={viewMode}
				/>
			</div>
		</div>
	);
}
