"use client";

import { FileArchive, FileCode, FileJson } from "lucide-react";
import React from "react";

interface ExportFormatSelectorProps {
	selected: "html" | "zip" | "json";
	onChange: (format: "html" | "zip" | "json") => void;
}

const FORMATS = [
	{
		id: "html",
		label: "HTML",
		icon: FileCode,
		description: "Single HTML file",
	},
	{
		id: "zip",
		label: "ZIP",
		icon: FileArchive,
		description: "Complete package",
	},
	{ id: "json", label: "JSON", icon: FileJson, description: "Template data" },
] as const;

export function ExportFormatSelector({
	selected,
	onChange,
}: ExportFormatSelectorProps) {
	return (
		<div className="grid grid-cols-3 gap-2">
			{FORMATS.map((format) => {
				const isSelected = selected === format.id;
				const Icon = format.icon;
				return (
					<button
						key={format.id}
						onClick={() => onChange(format.id)}
						className={`p-3 rounded-xl border-2 transition-all text-center ${
							isSelected
								? "border-emerald-500/50 bg-emerald-500/10"
								: "border-white/10 hover:border-white/20 bg-white/5"
						}`}
					>
						<Icon
							className={`h-5 w-5 mx-auto mb-1 ${
								isSelected ? "text-emerald-400" : "text-zinc-400"
							}`}
						/>
						<p
							className={`text-xs font-bold ${
								isSelected ? "text-white" : "text-zinc-400"
							}`}
						>
							{format.label}
						</p>
						<p className="text-[8px] text-zinc-500 mt-0.5">
							{format.description}
						</p>
					</button>
				);
			})}
		</div>
	);
}
