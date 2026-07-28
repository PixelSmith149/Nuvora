"use client";

import { Loader2 } from "lucide-react";
import React from "react";

interface LoaderProps {
	size?: "sm" | "md" | "lg";
	color?: string;
	className?: string;
	label?: string;
}

const sizes = {
	sm: "h-4 w-4",
	md: "h-6 w-6",
	lg: "h-8 w-8",
};

export function Loader({
	size = "md",
	color = "text-emerald-500",
	className = "",
	label,
}: LoaderProps) {
	return (
		<div className="flex flex-col items-center gap-2">
			<Loader2
				className={`${sizes[size]} ${color} animate-spin ${className}`}
			/>
			{label && <span className="text-xs text-zinc-500">{label}</span>}
		</div>
	);
}
