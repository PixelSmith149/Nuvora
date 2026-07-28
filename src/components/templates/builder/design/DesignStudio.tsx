"use client";

import React from "react";
import { ThemeSelector } from "@/components/templates/builder/design/ThemeSelector";
import { BackgroundPatternSelector } from "./BackgroundPatternSelector";
import { ColorPaletteSelector } from "./ColorPaletteSelector";
import { FontPairSelector } from "./FontPairSelector";

export function DesignStudio() {
	return (
		<div className="space-y-5">
			<h3 className="text-sm font-bold text-white">Design Studio</h3>
			<p className="text-xs text-zinc-500">Customize your template&apos;s look and feel</p>

			{/* ─── Theme ────────────────────────────────────────────────────── */}
			<ThemeSelector />

			{/* ─── Color Palette ────────────────────────────────────────────── */}
			<ColorPaletteSelector />

			{/* ─── Font Pair ────────────────────────────────────────────────── */}
			<FontPairSelector />

			{/* ─── Background Pattern ──────────────────────────────────────── */}
			<BackgroundPatternSelector />
		</div>
	);
}
