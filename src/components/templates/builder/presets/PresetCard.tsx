"use client";

import {
	AlertCircle,
	ChevronDown,
	ChevronUp,
	Eye,
	Plus,
	Sparkles,
} from "lucide-react";
import React, { useState } from "react";

interface PresetCardProps {
	preset: {
		id: string;
		name: string;
		category: string;
		description: string;
		preview: string;
		tags: string[];
		html: string;
		css: string;
	};
	onUse: () => void;
	isDirty?: boolean;
}

export function PresetCard({
	preset,
	onUse,
	isDirty = false,
}: PresetCardProps) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="bg-black/50 border border-white/5 rounded-xl p-3 hover:border-white/15 transition-all group">
			<div className="flex items-start gap-3">
				<div className="text-2xl flex-shrink-0">{preset.preview}</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between">
						<div>
							<h4 className="text-sm font-bold text-white">{preset.name}</h4>
							<p className="text-[10px] text-zinc-400">{preset.description}</p>
						</div>
						<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								onClick={() => setExpanded(!expanded)}
								className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
								title="Preview"
							>
								{expanded ? (
									<ChevronUp className="h-3.5 w-3.5" />
								) : (
									<ChevronDown className="h-3.5 w-3.5" />
								)}
							</button>
							<button
								onClick={onUse}
								className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors"
								title="Use this preset"
							>
								<Plus className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>
					<div className="flex flex-wrap gap-1 mt-1">
						<span className="text-[8px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">
							{preset.category}
						</span>
						{preset.tags.map((tag) => (
							<span
								key={tag}
								className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500"
							>
								{tag}
							</span>
						))}
					</div>
					{isDirty && (
						<div className="flex items-center gap-1 mt-1">
							<AlertCircle className="h-3 w-3 text-amber-400" />
							<span className="text-[8px] text-amber-400">Unsaved changes</span>
						</div>
					)}
				</div>
			</div>

			{expanded && (
				<div className="mt-2 p-2 bg-black rounded-lg border border-white/5">
					<div className="flex items-center gap-2 mb-1.5">
						<Sparkles className="h-3 w-3 text-amber-400" />
						<span className="text-[10px] text-zinc-500 font-medium">
							Preview
						</span>
					</div>
					<div
						className="text-[10px] text-zinc-400 font-mono whitespace-pre-wrap max-h-[100px] overflow-auto bg-zinc-950/50 rounded p-2"
						dangerouslySetInnerHTML={{
							__html: preset.html
								.replace(/</g, "&lt;")
								.replace(/>/g, "&gt;")
								.replace(/\n/g, "<br />"),
						}}
					/>
					<div className="flex items-center gap-2 mt-1.5">
						<button
							onClick={onUse}
							className="flex-1 text-center text-[10px] py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
						>
							Use This Template
						</button>
						<button
							onClick={() => setExpanded(false)}
							className="text-[10px] py-1 px-2 text-zinc-500 hover:text-white transition-colors"
						>
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
