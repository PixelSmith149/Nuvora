"use client";

import { Code, Layout, Terminal } from "lucide-react";
import React from "react";
import { useBuilder } from "../core/BuilderProvider";

export function EditorTabs() {
	const { activeTab, setActiveTab } = useBuilder();

	const tabs = [
		{ id: "html", label: "HTML", icon: Layout },
		{ id: "css", label: "CSS", icon: Code },
		{ id: "js", label: "JS", icon: Terminal },
	] as const;

	return (
		<div className="flex items-center gap-0.5 bg-black/50 rounded-lg p-0.5">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					onClick={() => setActiveTab(tab.id)}
					className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
						activeTab === tab.id
							? "bg-emerald-500/20 text-emerald-400"
							: "text-zinc-500 hover:text-white hover:bg-white/5"
					}`}
				>
					<tab.icon className="h-3.5 w-3.5" />
					{tab.label}
				</button>
			))}
		</div>
	);
}
