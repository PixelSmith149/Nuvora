// components/templates-animation/PreviewToggle.tsx
"use client";

import { Monitor, Smartphone } from "lucide-react";
import React from "react";

interface PreviewToggleProps {
	view: "desktop" | "mobile";
	onViewChange: (view: "desktop" | "mobile") => void;
}

export function PreviewToggle({ view, onViewChange }: PreviewToggleProps) {
	return (
		<div className="flex items-center gap-1 p-0.5 bg-zinc-900/50 border border-white/5 rounded-lg">
			<button
				onClick={() => onViewChange("desktop")}
				className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
					view === "desktop"
						? "bg-white/10 text-white"
						: "text-zinc-500 hover:text-zinc-300"
				}`}
			>
				<Monitor className="h-3.5 w-3.5" />
				Desktop
			</button>
			<button
				onClick={() => onViewChange("mobile")}
				className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
					view === "mobile"
						? "bg-white/10 text-white"
						: "text-zinc-500 hover:text-zinc-300"
				}`}
			>
				<Smartphone className="h-3.5 w-3.5" />
				Mobile
			</button>
		</div>
	);
}
