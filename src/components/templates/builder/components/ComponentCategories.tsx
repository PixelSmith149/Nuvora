"use client";

import React from "react";
import { COMPONENT_CATEGORIES } from "./ComponentLibrary";

interface ComponentCategoriesProps {
	selected: string;
	onSelect: (id: string) => void;
}

export function ComponentCategories({
	selected,
	onSelect,
}: ComponentCategoriesProps) {
	return (
		<div className="flex flex-wrap gap-1.5">
			{COMPONENT_CATEGORIES.map((cat) => (
				<button
					key={cat.id}
					onClick={() => onSelect(cat.id)}
					className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
						selected === cat.id
							? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
							: "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
					}`}
				>
					{cat.label}
				</button>
			))}
		</div>
	);
}
