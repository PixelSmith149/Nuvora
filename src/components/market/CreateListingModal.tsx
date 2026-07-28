// C:\primebooster\src\components\market\CreateListingModal.tsx
"use client";

import { ArrowLeft, Layers, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { TabCategory } from "@/lib/types";

// Import the 3 isolated asset deployment engines
import { OneTimeUploadPanel } from "./OneTimeUploadPanel";
import { ReusableUploadPanel } from "./ReusableUploadPanel";
import { SocioConfirmationPanel } from "./SocioConfirmationPanel";

interface CreateListingModalProps {
	open: boolean;
	onClose: () => void;
	category: TabCategory;
	userId: string;
	onSuccess: () => void;
}

export function CreateListingModal({
	open,
	onClose,
	category,
	userId,
	onSuccess,
}: CreateListingModalProps) {
	const [activeTab, setActiveTab] = useState<TabCategory>(category);

	// Keep internal tab type state instantly synced if top-level view modifies it
	useEffect(() => {
		setActiveTab(category);
	}, [category]);

	// Generate a runtime isolation audit token for the socio verification pipeline session
	const runtimeAuditId =
		typeof window !== "undefined" ? window.crypto.randomUUID() : "";

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 bg-zinc-950 text-zinc-100 flex flex-col antialiased animate-in fade-in duration-200">
			{/* IMMERSIVE HEADER PANEL */}
			<header className="border-b border-white/5 bg-zinc-900/40 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md shrink-0">
				<div className="flex items-center gap-4 w-full sm:w-auto">
					<button
						type="button"
						onClick={onClose}
						className="p-2.5 hover:bg-zinc-900 rounded-xl border border-white/5 transition-colors group"
						title="Return to Marketplace"
					>
						<ArrowLeft className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
					</button>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden xs:inline-block">
								Escrow Core
							</span>
							<h1 className="text-lg font-black tracking-tight text-white">
								Asset Deployment Pipeline
							</h1>
						</div>
						<p className="text-xs text-zinc-500 mt-0.5">
							Select a category path to initialize structural deployment logs.
						</p>
					</div>
				</div>

				{/* LIQUID GRID TAB SELECTOR CONTROLLER */}
				<div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900/80 rounded-xl border border-white/5 w-full sm:w-auto max-w-md">
					{(
						[
							{ id: "socio_market", label: "Socio Asset" },
							{ id: "product", label: "One-Time Sale" },
							{ id: "digital_tool", label: "Reusable Item" },
						] as const
					).map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id as TabCategory)}
							className={`px-3 py-2 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
								activeTab === tab.id
									? "bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/10"
									: "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
							}`}
						>
							<Layers className="h-3 w-3 shrink-0" />
							<span className="truncate">{tab.label}</span>
						</button>
					))}
				</div>
			</header>

			{/* LIQUID SCROLLABLE CONTENT BODY */}
			<main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 overflow-y-auto min-h-0">
				<div className="w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
					{/* POLYMORPHIC CONTEXT SWITCHBOARD SWITCH */}
					{activeTab === "socio_market" && (
						<SocioConfirmationPanel
							userId={userId}
							auditId={runtimeAuditId}
							onSuccess={() => {
								onSuccess();
								onClose();
							}}
						/>
					)}

					{activeTab === "product" && (
						<OneTimeUploadPanel
							userId={userId}
							onSuccess={() => {
								onSuccess();
								onClose();
							}}
						/>
					)}

					{activeTab === "digital_tool" && (
						<ReusableUploadPanel
							userId={userId}
							onSuccess={() => {
								onSuccess();
								onClose();
							}}
						/>
					)}
				</div>
			</main>
		</div>
	);
}
