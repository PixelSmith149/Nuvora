// components/ui/spinner.tsx
"use client";

import { Loader2 } from "lucide-react";
import React from "react";

interface SpinnerProps {
	size?: "sm" | "md" | "lg";
	color?: string;
	className?: string;
}

const sizes = {
	sm: "h-4 w-4",
	md: "h-6 w-6",
	lg: "h-8 w-8",
};

export function Spinner({
	size = "md",
	color = "text-emerald-500",
	className = "",
}: SpinnerProps) {
	return (
		<Loader2 className={`${sizes[size]} ${color} animate-spin ${className}`} />
	);
}

// ─── Skeleton Components ─────────────────────────────────────────────────

export function TemplateCardSkeleton() {
	return (
		<div className="bg-zinc-950/40 border border-white/5 rounded-xl overflow-hidden">
			<div className="aspect-video bg-zinc-900 animate-pulse" />
			<div className="p-3 space-y-2">
				<div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
				<div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse" />
				<div className="flex justify-between">
					<div className="h-3 bg-zinc-800 rounded w-1/4 animate-pulse" />
					<div className="h-3 bg-zinc-800 rounded w-1/4 animate-pulse" />
				</div>
			</div>
		</div>
	);
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{Array.from({ length: count }).map((_, i) => (
				<TemplateCardSkeleton key={i} />
			))}
		</div>
	);
}
