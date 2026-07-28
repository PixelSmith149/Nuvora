"use client";

import React from "react";
import { useBuilder } from "../core/BuilderProvider";

export const FONT_PAIRS = [
	{
		id: "inter",
		name: "Inter + Inter",
		heading: "Inter",
		body: "Inter",
		url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap",
	},
	{
		id: "playfair",
		name: "Playfair Display + Inter",
		heading: "Playfair Display",
		body: "Inter",
		url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;600&display=swap",
	},
	{
		id: "space-grotesk",
		name: "Space Grotesk + Inter",
		heading: "Space Grotesk",
		body: "Inter",
		url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;600&display=swap",
	},
	{
		id: "manrope",
		name: "Manrope + Inter",
		heading: "Manrope",
		body: "Inter",
		url: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;600&display=swap",
	},
	{
		id: "cormorant",
		name: "Cormorant + Inter",
		heading: "Cormorant Garamond",
		body: "Inter",
		url: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;600&display=swap",
	},
	{
		id: "bodoni",
		name: "Bodoni + Inter",
		heading: "Bodoni Moda",
		body: "Inter",
		url: "https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;600;700&family=Inter:wght@400;600&display=swap",
	},
	{
		id: "lora",
		name: "Lora + Inter",
		heading: "Lora",
		body: "Inter",
		url: "https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Inter:wght@400;600&display=swap",
	},
	{
		id: "dm-sans",
		name: "DM Sans + Inter",
		heading: "DM Sans",
		body: "Inter",
		url: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Inter:wght@400;600&display=swap",
	},
	{
		id: "urbanist",
		name: "Urbanist + Inter",
		heading: "Urbanist",
		body: "Inter",
		url: "https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&family=Inter:wght@400;600&display=swap",
	},
	{
		id: "clash",
		name: "Clash Display + Inter",
		heading: "Clash Display",
		body: "Inter",
		url: "https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Inter:wght@400;600&display=swap",
	},
	{
		id: "sentient",
		name: "Sentient + Inter",
		heading: "Sentient",
		body: "Inter",
		url: "https://fonts.googleapis.com/css2?family=Sentient:wght@400;500;600;700&family=Inter:wght@400;600&display=swap",
	},
	{
		id: "zodiak",
		name: "Zodiak + Inter",
		heading: "Zodiak",
		body: "Inter",
		url: "https://fonts.googleapis.com/css2?family=Zodiak:wght@400;500;600;700&family=Inter:wght@400;600&display=swap",
	},
];

export function FontPairSelector() {
	const { selectedFontPair, setSelectedFontPair } = useBuilder();

	return (
		<div className="space-y-2">
			<label className="text-xs text-zinc-400 font-medium">Font Pair</label>
			<select
				value={selectedFontPair}
				onChange={(e) => setSelectedFontPair(e.target.value)}
				className="w-full bg-black border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500/30 focus:outline-none transition-colors"
			>
				{FONT_PAIRS.map((font) => (
					<option key={font.id} value={font.id}>
						{font.name}
					</option>
				))}
			</select>
			<div className="flex items-center gap-4 text-xs text-zinc-500 mt-1">
				<span>
					Heading:{" "}
					<span
						className="text-white"
						style={{
							fontFamily: FONT_PAIRS.find((f) => f.id === selectedFontPair)
								?.heading,
						}}
					>
						{FONT_PAIRS.find((f) => f.id === selectedFontPair)?.heading}
					</span>
				</span>
				<span>
					Body:{" "}
					<span
						className="text-white"
						style={{
							fontFamily: FONT_PAIRS.find((f) => f.id === selectedFontPair)
								?.body,
						}}
					>
						{FONT_PAIRS.find((f) => f.id === selectedFontPair)?.body}
					</span>
				</span>
			</div>
		</div>
	);
}
