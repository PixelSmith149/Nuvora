"use client";

import {
	ChevronLeft,
	ChevronRight,
	LayoutTemplate,
	Palette,
	Settings,
	Sparkles,
} from "lucide-react";
import React from "react";
import { ComponentLibrary } from "../components/ComponentLibrary";
import { DesignStudio } from "../design/DesignStudio";
import { TemplatePresets } from "../presets/TemplatePresets";
import { TemplateSettings } from "../settings/TemplateSettings";
import { type SidebarTab, useBuilder } from "./BuilderProvider";

const SIDEBAR_TABS: {
	id: SidebarTab;
	label: string;
	icon: React.ElementType;
}[] = [
	{ id: "settings", label: "Settings", icon: Settings },
	{ id: "design", label: "Design", icon: Palette },
	{ id: "components", label: "Components", icon: LayoutTemplate },
	{ id: "presets", label: "Presets", icon: Sparkles },
];

export function BuilderSidebar() {
	const { sidebarTab, setSidebarTab, showThemePanel } = useBuilder();
	const [isCollapsed, setIsCollapsed] = React.useState(false);

	const renderContent = () => {
		switch (sidebarTab) {
			case "settings":
				return <TemplateSettings />;
			case "design":
				return <DesignStudio />;
			case "components":
				return <ComponentLibrary />;
			case "presets":
				return <TemplatePresets />;
			default:
				return null;
		}
	};

	return (
		<div
			className={`relative flex-shrink-0 transition-all duration-300 ${
				isCollapsed ? "w-12" : "w-80"
			}`}
		>
			{/* ─── Toggle Button ──────────────────────────────────────────── */}
			<button
				onClick={() => setIsCollapsed(!isCollapsed)}
				className="absolute -right-3 top-4 z-10 p-1 rounded-full bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-colors"
			>
				{isCollapsed ? (
					<ChevronRight className="h-4 w-4" />
				) : (
					<ChevronLeft className="h-4 w-4" />
				)}
			</button>

			{!isCollapsed ? (
				<div className="h-full bg-zinc-950/60 border-r border-white/5 flex flex-col">
					{/* ─── Tabs ────────────────────────────────────────────────── */}
					<div className="flex items-center gap-1 p-2 border-b border-white/5">
						{SIDEBAR_TABS.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setSidebarTab(tab.id)}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
									sidebarTab === tab.id
										? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
										: "text-zinc-400 hover:text-white hover:bg-white/5"
								}`}
							>
								<tab.icon className="h-3.5 w-3.5" />
								{tab.label}
							</button>
						))}
					</div>

					{/* ─── Content ────────────────────────────────────────────── */}
					<div className="flex-1 overflow-y-auto p-3">{renderContent()}</div>
				</div>
			) : (
				<div className="h-full bg-zinc-950/60 border-r border-white/5 flex flex-col items-center py-4">
					{SIDEBAR_TABS.map((tab) => (
						<button
							key={tab.id}
							onClick={() => {
								setSidebarTab(tab.id);
								setIsCollapsed(false);
							}}
							className={`p-2 rounded-lg transition-all ${
								sidebarTab === tab.id
									? "bg-emerald-500/20 text-emerald-400"
									: "text-zinc-400 hover:text-white hover:bg-white/5"
							}`}
							title={tab.label}
						>
							<tab.icon className="h-5 w-5" />
						</button>
					))}
				</div>
			)}
		</div>
	);
}
