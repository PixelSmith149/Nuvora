"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useBuilder } from "../core/BuilderProvider";

interface BuilderBreadcrumbProps {
	isEditMode?: boolean;
}

export function BuilderBreadcrumb() {
	const { name } = useBuilder();

	return (
		<nav className="hidden md:flex items-center text-xs text-zinc-500 ml-2">
			<Link
				href="/social-tenant/t-a"
				className="hover:text-white transition-colors"
			>
				Dashboard
			</Link>
			<ChevronRight className="h-3 w-3 mx-1" />
			<Link
				href="/social-tenant/t-a/templates"
				className="hover:text-white transition-colors"
			>
				Templates
			</Link>
			<ChevronRight className="h-3 w-3 mx-1" />
			<span className="text-white font-medium truncate max-w-[120px]">
				{name || "New Template"}
			</span>
		</nav>
	);
}
