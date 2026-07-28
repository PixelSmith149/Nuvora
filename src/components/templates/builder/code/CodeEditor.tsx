"use client";

import { Plus, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/lib/use-toast";
import { AnimationLibraryModal } from "../animations/AnimationLibraryModal";
import { useBuilder } from "../core/BuilderProvider";
import { CSSEditor } from "./CSSEditor";
import { EditorTabs } from "./EditorTabs";
import { HTMLEditor } from "./HTMLEditor";
import { JSEditor } from "./JSEditor";

export function CodeEditor() {
	const { activeTab, htmlCode, setHtmlCode, cssCode, setCssCode, setIsDirty } =
		useBuilder();
	const { toast } = useToast();
	const [showAnimationLibrary, setShowAnimationLibrary] = useState(false);

	// ─── Handle animation selection ──────────────────────────────────────
	const handleAnimationSelect = (animation: {
		id: string;
		name: string;
		className: string;
		cssCode: string;
		type: string;
		duration: number;
	}) => {
		// ─── Insert instruction comment in HTML ────────────────────────────
		const instruction = `\n\n<!-- 🎬 Animation: ${animation.name} -->\n<!-- Add class "${animation.className}" to any element -->\n<!-- Example: <div class="${animation.className}">Content</div> -->\n`;
		setHtmlCode(htmlCode + instruction);

		// ─── Inject CSS into the template ──────────────────────────────────
		const cssComment = `\n\n/* 🎬 Animation: ${animation.name} */\n/* Duration: ${animation.duration}ms | Type: ${animation.type} */\n`;
		setCssCode(cssCode + cssComment + animation.cssCode);

		setIsDirty(true);

		toast({
			title: "✅ Animation Applied",
			description: `"${animation.name}" added to your template. Add class "${animation.className}" to any element.`,
			variant: "success",
		});

		setShowAnimationLibrary(false);
	};

	return (
		<>
			<div className="bg-zinc-950/40 border border-white/5 rounded-xl p-4 space-y-3">
				{/* ─── Header ──────────────────────────────────────────────────── */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h3 className="text-sm font-bold text-white flex items-center gap-2">
							<span className="text-zinc-400">Code Editor</span>
							<span className="text-[10px] text-zinc-500 font-normal">
								(Live editing)
							</span>
						</h3>
					</div>
					<div className="flex items-center gap-2">
						{/* ─── Add Animation Button ────────────────────────────────── */}
						<button
							onClick={() => setShowAnimationLibrary(true)}
							className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 hover:border-purple-500/30 transition-all"
							title="Add animation to your template"
						>
							<Sparkles className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">Add Animation</span>
							<Plus className="h-3 w-3 sm:hidden" />
						</button>

						<EditorTabs />
					</div>
				</div>

				{/* ─── Editor Content ──────────────────────────────────────────── */}
				<div className="min-h-[300px]">
					{activeTab === "html" && <HTMLEditor />}
					{activeTab === "css" && <CSSEditor />}
					{activeTab === "js" && <JSEditor />}
				</div>

				{/* ─── Quick Tip ────────────────────────────────────────────────── */}
				<div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-1 border-t border-white/5">
					<span>
						💡 Tip: Click <span className="text-purple-400">Add Animation</span>{" "}
						to apply saved animations to your template
					</span>
				</div>
			</div>

			{/* ─── Animation Library Modal ──────────────────────────────────── */}
			<AnimationLibraryModal
				isOpen={showAnimationLibrary}
				onClose={() => setShowAnimationLibrary(false)}
				onSelect={handleAnimationSelect}
			/>
		</>
	);
}
