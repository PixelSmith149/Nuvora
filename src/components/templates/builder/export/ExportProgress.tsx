"use client";

import React from "react";

interface ExportProgressProps {
	progress: number;
}

export function ExportProgress({ progress }: ExportProgressProps) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between text-xs">
				<span className="text-zinc-400">Exporting...</span>
				<span className="text-zinc-500">{Math.round(progress)}%</span>
			</div>
			<div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
				<div
					className="h-full bg-emerald-500 rounded-full transition-all duration-300"
					style={{ width: `${progress}%` }}
				/>
			</div>
		</div>
	);
}
