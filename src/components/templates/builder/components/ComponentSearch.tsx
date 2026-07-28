"use client";

import { Search, X } from "lucide-react";
import React from "react";

interface ComponentSearchProps {
	value: string;
	onChange: (value: string) => void;
}

export function ComponentSearch({ value, onChange }: ComponentSearchProps) {
	return (
		<div className="relative">
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Search components..."
				className="w-full pl-9 pr-8 py-1.5 bg-black/50 border border-white/10 text-white rounded-lg text-xs focus:border-emerald-500/30 focus:outline-none transition-colors"
			/>
			{value && (
				<button
					onClick={() => onChange("")}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
				>
					<X className="h-3 w-3" />
				</button>
			)}
		</div>
	);
}
