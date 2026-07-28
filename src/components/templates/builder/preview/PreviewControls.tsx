"use client";

import { RefreshCw, Sparkles } from "lucide-react";
import React from "react";
import { useBuilder } from "../core/BuilderProvider";

interface PreviewControlsProps {
	onRefresh: () => void;
}

export function PreviewControls({ onRefresh }: PreviewControlsProps) {
	const { autoRefresh, setAutoRefresh } = useBuilder();

	return (
		<div className="flex items-center gap-1.5">
			<button
				onClick={onRefresh}
				className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
				title="Refresh preview"
			>
				<RefreshCw className="h-4 w-4" />
			</button>
			<label className="flex items-center gap-1.5 text-[10px] text-zinc-500 cursor-pointer select-none">
				<input
					type="checkbox"
					checked={autoRefresh}
					onChange={(e) => setAutoRefresh(e.target.checked)}
					className="w-3 h-3 rounded border-white/20 bg-black text-emerald-500 focus:ring-emerald-500/20"
				/>
				<span className="flex items-center gap-1">
					<Sparkles className="h-3 w-3" />
					Auto
				</span>
			</label>
		</div>
	);
}
