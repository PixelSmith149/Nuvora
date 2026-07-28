"use client";

import {
	Droplets,
	Film,
	Layers,
	Moon,
	Palette,
	Sparkles,
	Square,
	Sun,
	Terminal,
	Zap,
} from "lucide-react";
import React from "react";
import { useBuilder } from "../core/BuilderProvider";

export const DESIGN_THEMES = [
	{
		id: "glassmorphism",
		name: "Glassmorphism",
		icon: Droplets,
		description: "Frosted glass with blur",
		css: {
			background: "rgba(255,255,255,0.05)",
			backdropFilter: "blur(20px)",
			border: "1px solid rgba(255,255,255,0.1)",
			boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
		},
	},
	{
		id: "neumorphism",
		name: "Neumorphism",
		icon: Layers,
		description: "Soft shadows & raised",
		css: {
			background: "#2a2a2a",
			boxShadow: "8px 8px 16px #1a1a1a, -8px -8px 16px #3a3a3a",
			borderRadius: "16px",
		},
	},
	{
		id: "minimalist",
		name: "Minimalist",
		icon: Square,
		description: "Clean & simple",
		css: {
			background: "#ffffff",
			color: "#111111",
			fontFamily: "Inter, sans-serif",
			border: "none",
			boxShadow: "none",
		},
	},
	{
		id: "dark-luxury",
		name: "Dark Luxury",
		icon: Moon,
		description: "Premium dark with gold",
		css: {
			background: "#0a0a0a",
			color: "#f5f5f5",
			border: "1px solid rgba(255,215,0,0.2)",
			boxShadow: "0 0 40px rgba(255,215,0,0.05)",
		},
	},
	{
		id: "vibrant",
		name: "Vibrant",
		icon: Zap,
		description: "Bold colors & gradients",
		css: {
			background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
			color: "#ffffff",
			borderRadius: "16px",
			boxShadow: "0 8px 32px rgba(102,126,234,0.4)",
		},
	},
	{
		id: "aurora",
		name: "Aurora",
		icon: Sparkles,
		description: "Animated gradient",
		css: {
			background:
				"linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #ff6b6b)",
			backgroundSize: "300% 100%",
			color: "#ffffff",
			animation: "aurora 8s ease-in-out infinite",
		},
	},
	{
		id: "cyberpunk",
		name: "Cyberpunk",
		icon: Terminal,
		description: "Neon & futuristic",
		css: {
			background: "#0a0a0a",
			color: "#00ff41",
			border: "1px solid #00ff41",
			boxShadow: "0 0 30px rgba(0,255,65,0.2)",
			fontFamily: "monospace",
		},
	},
	{
		id: "soft-organic",
		name: "Soft Organic",
		icon: Sun,
		description: "Warm & rounded",
		css: {
			background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
			color: "#2d1b0e",
			borderRadius: "24px",
			boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
		},
	},
	{
		id: "gradient-glass",
		name: "Gradient Glass",
		icon: Palette,
		description: "Glass with gradients",
		css: {
			background:
				"linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
			backdropFilter: "blur(10px)",
			border: "1px solid rgba(255,255,255,0.2)",
			boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
		},
	},
	{
		id: "noir",
		name: "Noir",
		icon: Film,
		description: "B&W with drama",
		css: {
			background: "#1a1a1a",
			color: "#f5f5f5",
			filter: "grayscale(0.8)",
			border: "1px solid #333333",
			boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
		},
	},
];

export function ThemeSelector() {
	const { selectedTheme, setSelectedTheme } = useBuilder();

	return (
		<div className="space-y-2">
			<label className="text-xs text-zinc-400 font-medium">Theme</label>
			<div className="grid grid-cols-2 gap-1.5">
				{DESIGN_THEMES.map((theme) => {
					const Icon = theme.icon;
					return (
						<button
							key={theme.id}
							onClick={() => setSelectedTheme(theme.id)}
							className={`p-2.5 rounded-xl text-xs transition-all text-left ${
								selectedTheme === theme.id
									? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
									: "bg-white/5 hover:bg-white/10 text-zinc-400 border border-transparent hover:border-white/10"
							}`}
						>
							<div className="flex items-center gap-2">
								<Icon className="h-4 w-4 flex-shrink-0" />
								<span className="font-medium">{theme.name}</span>
							</div>
							<p className="text-[10px] text-zinc-500 mt-0.5 truncate">
								{theme.description}
							</p>
						</button>
					);
				})}
			</div>
		</div>
	);
}
