// components/social-tenant/SiteCard.tsx

"use client";

import {
	Building2,
	CheckCircle2,
	Clock,
	Edit3,
	ExternalLink,
	Eye,
	Globe,
	Loader2,
	Rocket,
	Settings,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import type { UserSite } from "@/lib/st/types";
import { getSitePublicUrl } from "@/lib/st/urls";

interface SiteCardProps {
	site: UserSite;
	onDelete: (id: string) => void;
	isDeleting: boolean;
}

export function SiteCard({ site, onDelete, isDeleting }: SiteCardProps) {
	const statusColors = {
		published: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
		generated: "bg-sky-500/10 border-sky-500/20 text-sky-400",
		draft: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
		generating:
			"bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse",
		failed: "bg-red-500/10 border-red-500/20 text-red-400",
		archived: "bg-zinc-600/10 border-zinc-600/20 text-zinc-500",
	};

	const publicUrl =
		site.site_slug && site.status === "published"
			? getSitePublicUrl(site.site_slug)
			: null;

	return (
		<div className="group bg-zinc-950/40 border border-white/5 rounded-xl overflow-hidden hover:border-white/15 transition-all">
			{/* Preview */}
			<div className="aspect-[16/9] bg-zinc-900 relative overflow-hidden">
				{site.html_code ? (
					<div
						className="w-full h-full overflow-hidden pointer-events-none opacity-60 scale-105"
						dangerouslySetInnerHTML={{ __html: site.html_code.slice(0, 1000) }}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
						<Building2 className="h-12 w-12 text-zinc-700" />
					</div>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

				{/* Status Badge */}
				<div className="absolute top-3 right-3">
					<span
						className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColors[site.status as keyof typeof statusColors]}`}
					>
						{site.status === "published" && (
							<CheckCircle2 className="h-3 w-3 inline mr-1" />
						)}
						{site.status === "generating" && (
							<Loader2 className="h-3 w-3 inline mr-1 animate-spin" />
						)}
						{site.status.charAt(0).toUpperCase() + site.status.slice(1)}
					</span>
				</div>

				{/* Subdomain Badge */}
				{publicUrl && (
					<div className="absolute bottom-3 left-3">
						<span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-zinc-300">
							{site.site_slug}.nu-vora.app
						</span>
					</div>
				)}

				{/* Hover Overlay */}
				<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
					<div className="flex items-center gap-3">
						{publicUrl && (
							<a
								href={publicUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
							>
								<Eye className="h-5 w-5" />
							</a>
						)}
						<Link
							href={
								site.status === "published"
									? `/st/edit/${site.id}`
									: `/st/builder/${site.id}`
							}
							className="p-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
						>
							{site.status === "published" ? (
								<Edit3 className="h-5 w-5" />
							) : (
								<Rocket className="h-5 w-5" />
							)}
						</Link>
						<Link
							href={`/st/settings/${site.id}`}
							className="p-2.5 rounded-full bg-zinc-500/20 hover:bg-zinc-500/30 text-zinc-400 transition-colors"
						>
							<Settings className="h-5 w-5" />
						</Link>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-4">
				<div className="flex items-start justify-between">
					<div className="flex-1 min-w-0">
						<h3 className="text-sm font-bold text-white truncate">
							{site.site_name}
						</h3>
						<p className="text-[10px] text-zinc-500 mt-0.5">
							{new Date(site.created_at).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</p>
					</div>
					<button
						onClick={() => onDelete(site.id)}
						disabled={isDeleting}
						className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors flex-shrink-0"
					>
						{isDeleting ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Trash2 className="h-4 w-4" />
						)}
					</button>
				</div>

				{/* Public URL */}
				{publicUrl && (
					<div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500">
						<Globe className="h-3 w-3" />
						<a
							href={publicUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="truncate hover:text-emerald-400 transition-colors"
						>
							{site.site_slug}.nu-vora.app
						</a>
					</div>
				)}

				{/* Session Status */}
				{site.is_session_active && (
					<div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400">
						<Clock className="h-3 w-3" />
						<span>Session active</span>
						{site.session_expires_at && (
							<span className="text-zinc-500">
								•{" "}
								{new Date(site.session_expires_at).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})}
							</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
}