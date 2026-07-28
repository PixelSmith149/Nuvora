// components/social-tenant/CodePanel.tsx

"use client";

import { AlertCircle, CheckCircle2, Code2, Copy, Loader2 } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface CodePanelProps {
	htmlBuffer: string;
	isGenerating: boolean;
	error: string | null;
}

export function CodePanel({ htmlBuffer, isGenerating, error }: CodePanelProps) {
	const terminalRef = useRef<HTMLDivElement>(null);
	const [copied, setCopied] = React.useState(false);

	// ─── Auto-scroll ────────────────────────────────────────────
	useEffect(() => {
		if (terminalRef.current) {
			terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
		}
	}, [htmlBuffer]);

	// ─── Copy Code ──────────────────────────────────────────────
	const handleCopy = async () => {
		if (!htmlBuffer) return;
		try {
			await navigator.clipboard.writeText(htmlBuffer);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Copy failed:", err);
		}
	};

	return (
		<div className="flex flex-col h-full bg-black">
			{/* ─── Header ───────────────────────────────────────────── */}
			<div className="border-b border-white/5 px-4 py-3 flex-shrink-0 bg-zinc-950/30 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Code2 className="h-4 w-4 text-emerald-400" />
					<span className="text-xs font-bold text-white">Live Code</span>
					{isGenerating && (
						<span className="text-[10px] text-amber-400 flex items-center gap-1">
							<Loader2 className="h-3 w-3 animate-spin" />
							Generating...
						</span>
					)}
					{!isGenerating && htmlBuffer && (
						<span className="text-[10px] text-emerald-400 flex items-center gap-1">
							<CheckCircle2 className="h-3 w-3" />
							Complete
						</span>
					)}
				</div>
				<Button
					onClick={handleCopy}
					disabled={!htmlBuffer}
					variant="ghost"
					className="h-8 px-3 text-xs text-zinc-400 hover:text-white"
				>
					{copied ? (
						<CheckCircle2 className="h-4 w-4 text-emerald-400" />
					) : (
						<Copy className="h-4 w-4" />
					)}
					<span className="ml-1.5">{copied ? "Copied!" : "Copy"}</span>
				</Button>
			</div>

			{/* ─── Terminal ─────────────────────────────────────────── */}
			<div
				ref={terminalRef}
				className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-black/50"
			>
				{!htmlBuffer && !isGenerating && !error ? (
					<div className="flex flex-col items-center justify-center h-full text-center">
						<Code2 className="h-12 w-12 text-zinc-700 mb-4" />
						<p className="text-sm text-zinc-500">No code generated yet</p>
						<p className="text-xs text-zinc-600">
							Build your website to see the code here
						</p>
					</div>
				) : error ? (
					<div className="flex flex-col items-center justify-center h-full text-center">
						<AlertCircle className="h-12 w-12 text-red-400 mb-4" />
						<p className="text-sm text-red-400">{error}</p>
					</div>
				) : (
					<div className="space-y-1">
						{htmlBuffer.split("\n").map((line, index) => {
							// Syntax highlighting simulation
							let color = "text-zinc-300";
							if (line.includes("{") || line.includes("}"))
								color = "text-amber-300";
							if (line.includes("<")) color = "text-emerald-300";
							if (line.includes(">")) color = "text-emerald-300";
							if (line.includes("</")) color = "text-emerald-300";
							if (line.includes("=")) color = "text-sky-300";
							if (line.includes('"')) color = "text-amber-300";
							if (line.includes("/*") || line.includes("//"))
								color = "text-zinc-500";
							if (line.includes("@media")) color = "text-purple-300";
							if (line.trim().startsWith(".")) color = "text-sky-300";
							if (line.trim().startsWith("#")) color = "text-sky-300";
							if (line.trim().startsWith("@")) color = "text-purple-300";

							return (
								<div
									key={index}
									className={`${color} whitespace-pre-wrap leading-relaxed`}
								>
									{line || " "}
								</div>
							);
						})}
						{isGenerating && (
							<span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5" />
						)}
					</div>
				)}
			</div>
		</div>
	);
}
