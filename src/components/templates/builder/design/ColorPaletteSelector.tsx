"use client";

import { Check, Palette } from "lucide-react";
import React, { useState } from "react";
import { useBuilder } from "../core/BuilderProvider";

export const COLOR_PALETTES = [
	{
		id: "emerald",
		name: "Emerald",
		primary: "#10b981",
		secondary: "#059669",
		accent: "#34d399",
	},
	{
		id: "purple",
		name: "Purple",
		primary: "#8b5cf6",
		secondary: "#7c3aed",
		accent: "#a78bfa",
	},
	{
		id: "blue",
		name: "Blue",
		primary: "#3b82f6",
		secondary: "#2563eb",
		accent: "#60a5fa",
	},
	{
		id: "rose",
		name: "Rose",
		primary: "#f43f5e",
		secondary: "#e11d48",
		accent: "#fb7185",
	},
	{
		id: "amber",
		name: "Amber",
		primary: "#f59e0b",
		secondary: "#d97706",
		accent: "#fbbf24",
	},
	{
		id: "cyan",
		name: "Cyan",
		primary: "#06b6d4",
		secondary: "#0891b2",
		accent: "#22d3ee",
	},
	{
		id: "indigo",
		name: "Indigo",
		primary: "#6366f1",
		secondary: "#4f46e5",
		accent: "#818cf8",
	},
	{
		id: "pink",
		name: "Pink",
		primary: "#ec4899",
		secondary: "#db2777",
		accent: "#f472b6",
	},
	{
		id: "teal",
		name: "Teal",
		primary: "#14b8a6",
		secondary: "#0d9488",
		accent: "#2dd4bf",
	},
	{
		id: "orange",
		name: "Orange",
		primary: "#f97316",
		secondary: "#ea580c",
		accent: "#fb923c",
	},
	{
		id: "lime",
		name: "Lime",
		primary: "#84cc16",
		secondary: "#65a30d",
		accent: "#a3e635",
	},
	{
		id: "violet",
		name: "Violet",
		primary: "#8b5cf6",
		secondary: "#7c3aed",
		accent: "#a78bfa",
	},
	{
		id: "fuchsia",
		name: "Fuchsia",
		primary: "#d946ef",
		secondary: "#c026d3",
		accent: "#e879f9",
	},
	{
		id: "sky",
		name: "Sky",
		primary: "#0ea5e9",
		secondary: "#0284c7",
		accent: "#38bdf8",
	},
	{
		id: "stone",
		name: "Stone",
		primary: "#78716c",
		secondary: "#57534e",
		accent: "#a8a29e",
	},
];

export function ColorPaletteSelector() {
	const { selectedPalette, setSelectedPalette } = useBuilder();
	const [showCustom, setShowCustom] = useState(false);
	const [customColor, setCustomColor] = useState("#10b981");

	const handleCustomSelect = () => {
		setSelectedPalette(customColor);
		setShowCustom(false);
	};

	return (
		<div className="space-y-2">
			<label className="text-xs text-zinc-400 font-medium">Color Palette</label>
			<div className="flex flex-wrap gap-1.5">
				{COLOR_PALETTES.map((palette) => (
					<button
						key={palette.id}
						onClick={() => setSelectedPalette(palette.id)}
						className={`w-8 h-8 rounded-full border-2 transition-all relative ${
							selectedPalette === palette.id
								? "border-white scale-110"
								: "border-transparent hover:scale-110"
						}`}
						style={{
							background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
						}}
						title={palette.name}
					>
						{selectedPalette === palette.id && (
							<Check className="h-3 w-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-lg" />
						)}
					</button>
				))}
				<button
					onClick={() => setShowCustom(!showCustom)}
					className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
						showCustom
							? "border-white bg-emerald-500/20"
							: "border-white/20 hover:border-white/50"
					}`}
					title="Custom color"
				>
					<Palette className="h-4 w-4 text-zinc-400" />
				</button>
			</div>

			{/* ─── Custom Color Picker ────────────────────────────────────── */}
			{showCustom && (
				<div className="flex items-center gap-2 mt-2 p-2 bg-black/50 rounded-xl border border-white/10">
					<input
						type="color"
						value={customColor}
						onChange={(e) => setCustomColor(e.target.value)}
						className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
					/>
					<input
						type="text"
						value={customColor}
						onChange={(e) => setCustomColor(e.target.value)}
						className="flex-1 bg-black/50 border border-white/10 text-white rounded-lg px-3 py-1.5 text-sm font-mono focus:border-emerald-500/30 focus:outline-none"
						placeholder="#000000"
					/>
					<button
						onClick={handleCustomSelect}
						className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
					>
						Apply
					</button>
				</div>
			)}
		</div>
	);
}
