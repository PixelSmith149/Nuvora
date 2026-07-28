"use client";

import React from "react";
import { useBuilder } from "../core/BuilderProvider";

export const BACKGROUND_PATTERNS = [
	{ id: "none", name: "None", css: "", preview: "bg-zinc-800" },
	{
		id: "dots",
		name: "Dots",
		css: "background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px;",
		preview:
			"bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]",
	},
	{
		id: "grid",
		name: "Grid",
		css: "background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 40px 40px;",
		preview:
			"bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_40px]",
	},
	{
		id: "waves",
		name: "Waves",
		css: "background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px);",
		preview:
			"bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]",
	},
	{
		id: "gradient-mesh",
		name: "Gradient Mesh",
		css: "background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.05) 0%, transparent 50%);",
		preview:
			"bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.05)_0%,transparent_50%),radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.05)_0%,transparent_50%)]",
	},
	{
		id: "aurora-bg",
		name: "Aurora",
		css: "background: linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #ff6b6b); background-size: 300% 100%; animation: aurora 8s ease-in-out infinite;",
		preview:
			"bg-[linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff,#ff6b6b)] bg-[length:300%_100%] animate-[aurora_8s_ease-in-out_infinite]",
	},
];

export function BackgroundPatternSelector() {
	const { selectedPattern, setSelectedPattern } = useBuilder();

	return (
		<div className="space-y-2">
			<label className="text-xs text-zinc-400 font-medium">
				Background Pattern
			</label>
			<div className="grid grid-cols-3 gap-1.5">
				{BACKGROUND_PATTERNS.map((pattern) => (
					<button
						key={pattern.id}
						onClick={() => setSelectedPattern(pattern.id)}
						className={`h-12 rounded-xl border-2 transition-all ${
							selectedPattern === pattern.id
								? "border-emerald-500"
								: "border-white/10 hover:border-white/30"
						} ${pattern.preview}`}
						title={pattern.name}
					>
						<span
							className={`text-[8px] font-medium ${
								selectedPattern === pattern.id
									? "text-emerald-400"
									: "text-zinc-500"
							}`}
						>
							{pattern.name}
						</span>
					</button>
				))}
			</div>
		</div>
	);
}
