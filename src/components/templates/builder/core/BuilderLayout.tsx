"use client";

import React, { type ReactNode } from "react";
import { CodeEditor } from "../code/CodeEditor";
import { BuilderHeader } from "../header/BuilderHeader";
import { CategoryTemplatePreview } from "../preview/CategoryTemplatePreview";
import { LivePreview } from "../preview/LivePreview";
import { PreviewStatus } from "../preview/PreviewStatus";
import { BuilderProvider } from "./BuilderProvider";
import { BuilderSidebar } from "./BuilderSidebar";

interface BuilderLayoutProps {
	children?: ReactNode;
	userId: string;
	isEditMode?: boolean;
}

export function BuilderLayout({
	children,
	userId,
	isEditMode = false,
}: BuilderLayoutProps) {
	return (
		<BuilderProvider>
			{/* ─── Full viewport, no scroll ────────────────────────────── */}
			<div className="h-screen bg-black text-white flex flex-col overflow-hidden">
				{/* ─── Header: Fixed height ────────────────────────────────── */}
				<BuilderHeader userId={userId} isEditMode={isEditMode} />

				{/* ─── Main row: Sidebar + Content ────────────────────────── */}
				<div className="flex flex-1 overflow-hidden">
					{/* ─── Sidebar: Fixed width ────────────────────────────── */}
					<BuilderSidebar />

					{/* ─── Content: Code Editor + Preview ────────────────────── */}
					<div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6">
						<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
							{/* ─── Left: Code Editor ────────────────────────────── */}
							<div className="flex flex-col overflow-hidden">
								<CodeEditor />
							</div>

							{/* ─── Right: Live Preview ────────────────────────────── */}
							<div className="flex flex-col overflow-hidden">
								<LivePreview />
								<PreviewStatus />
							</div>
						</div>
					</div>
				</div>
			</div>
		</BuilderProvider>
	);
}
