"use client";

import { ArrowLeft, Download, Eye, Globe, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { BuilderActions } from "@/components/templates/builder/header/BuilderActions";
import { BuilderBreadcrumb } from "@/components/templates/builder/header/BuilderBreadcrumb";
import { useBuilder } from "../core/BuilderProvider";

interface BuilderHeaderProps {
	userId: string;
	isEditMode?: boolean;
}

export function BuilderHeader({ userId }: BuilderHeaderProps) {
	const router = useRouter();
	const { isSaving, isDirty, name } = useBuilder();

	return (
		<header className="flex-shrink-0 border-b border-white/5 bg-zinc-950/40 backdrop-blur-sm">
			<div className="flex items-center justify-between px-4 py-2">
				{/* ─── Left: Back + Title ──────────────────────────────────── */}
				<div className="flex items-center gap-3 min-w-0">
					<button
						onClick={() => router.push("/social-tenant/t-a/templates")}
						className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
						aria-label="Back to templates"
					>
						<ArrowLeft className="h-4 w-4" />
					</button>

					<div className="flex items-center gap-2 min-w-0">
						<span className="text-sm font-bold text-white truncate">
							{name || "Untitled Template"}
						</span>
						{isDirty && (
							<span className="text-[10px] text-amber-400 flex-shrink-0">
								• Unsaved
							</span>
						)}
						{isSaving && (
							<Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400 flex-shrink-0" />
						)}
					</div>

					<BuilderBreadcrumb />
				</div>

				{/* ─── Right: Actions ────────────────────────────────────────── */}
				<BuilderActions userId={userId} />
			</div>
		</header>
	);
}
