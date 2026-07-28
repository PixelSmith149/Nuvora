"use client";

import React from "react";

const PRESET_CATEGORIES = [
	{ id: "all", label: "All" },
	{ id: "business", label: "Business" },
	{ id: "ecommerce", label: "E-commerce" },
	{ id: "portfolio", label: "Portfolio" },
	{ id: "restaurant", label: "Restaurant" },
	{ id: "healthcare", label: "Healthcare" },
	{ id: "education", label: "Education" },
	{ id: "ai", label: "AI" },
	{ id: "landing", label: "Landing" },
];

interface PresetCategoryFilterProps {
	selected: string;
	onSelect: (id: string) => void;
}

export function PresetCategoryFilter({
	selected,
	onSelect,
}: PresetCategoryFilterProps) {
	return (
		<div className="flex flex-wrap gap-1.5">
			{PRESET_CATEGORIES.map((cat) => (
				<button
					key={cat.id}
					onClick={() => onSelect(cat.id)}
					className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
						selected === cat.id
							? "bg-amber-500/20 border border-amber-500/30 text-amber-400"
							: "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
					}`}
				>
					{cat.label}
				</button>
			))}
		</div>
	);
}
