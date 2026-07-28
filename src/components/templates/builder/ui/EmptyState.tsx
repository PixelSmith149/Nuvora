"use client";

import React, { type ReactNode } from "react";

interface EmptyStateProps {
	icon?: ReactNode;
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
	};
}

export function EmptyState({
	icon,
	title,
	description,
	action,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-xl text-center min-h-[200px]">
			{icon && <div className="mb-3">{icon}</div>}
			<h4 className="text-sm font-bold text-white">{title}</h4>
			<p className="text-xs text-zinc-400 mt-1">{description}</p>
			{action && (
				<button
					onClick={action.onClick}
					className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
				>
					{action.label}
				</button>
			)}
		</div>
	);
}
