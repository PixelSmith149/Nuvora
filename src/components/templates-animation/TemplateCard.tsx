// components/templates-animation/TemplateCard.tsx
"use client";

import {
	CheckCircle2,
	Copy,
	Download,
	Edit,
	ExternalLink,
	Eye,
	Globe,
	LayoutTemplate,
	MoreVertical,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import type { Template } from "@/lib/st/types/templates-animation";

interface TemplateCardProps {
	template: Template;
	onClone?: (template: Template) => void;
	onDelete?: (template: Template) => void;
	showActions?: boolean;
	isOwner?: boolean;
}

export function TemplateCard({
	template,
	onClone,
	onDelete,
	showActions = true,
	isOwner = false,
}: TemplateCardProps) {
	const router = useRouter();
	const [showMenu, setShowMenu] = React.useState(false);

	const handleClick = () => {
		if (isOwner) {
			router.push(`/social-tenant/t-a/templates/${template.id}`);
		} else {
			router.push(`/social-tenant/t-a/templates/${template.id}`);
		}
	};

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		router.push(`/social-tenant/t-a/templates/${template.id}/edit`);
	};

	const handleClone = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onClone) onClone(template);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onDelete) onDelete(template);
	};

	return (
		<div
			onClick={handleClick}
			className="group bg-zinc-950/40 border border-white/5 rounded-xl  hover:border-white/15 transition-all cursor-pointer relative"
		>
			{/* ─── Preview Image ──────────────────────────────────────────── */}
			<div className="aspect-video bg-zinc-900 relative overflow-hidden">
				{template.preview_image ? (
					<img
						src={template.preview_image}
						alt={template.name}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
						loading="lazy"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
						<LayoutTemplate className="h-10 w-10 text-zinc-700" />
					</div>
				)}

				{/* ─── Status Badges ────────────────────────────────────────── */}
				<div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
					{template.is_published && (
						<span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-0.5">
							<CheckCircle2 className="h-2.5 w-2.5" />
							Published
						</span>
					)}
					{template.is_public && (
						<span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-0.5">
							<Globe className="h-2.5 w-2.5" />
							Public
						</span>
					)}
					{!template.is_published && (
						<span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
							Draft
						</span>
					)}
				</div>

				{/* ─── Stats Overlay ────────────────────────────────────────── */}
				<div className="absolute bottom-2 right-2 flex items-center gap-2 text-[10px] text-zinc-400 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
					<span className="flex items-center gap-1">
						<Eye className="h-3 w-3" />
						{template.view_count || 0}
					</span>
					<span className="flex items-center gap-1">
						<Copy className="h-3 w-3" />
						{template.clone_count || 0}
					</span>
					<span className="flex items-center gap-1">
						<Download className="h-3 w-3" />
						{template.download_count || 0}
					</span>
				</div>
			</div>

			{/* ─── Content ────────────────────────────────────────────────── */}
			<div className="p-3">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 min-w-0">
						<h3 className="text-sm font-bold text-white truncate">
							{template.name}
						</h3>
						{template.description && (
							<p className="text-xs text-zinc-500 truncate mt-0.5">
								{template.description}
							</p>
						)}
					</div>

					{showActions && isOwner && (
						<div className="relative flex-shrink-0">
							<button
								onClick={(e) => {
									e.stopPropagation();
									setShowMenu(!showMenu);
								}}
								className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
							>
								<MoreVertical className="h-4 w-4" />
							</button>

							{showMenu && (
								<div
									className="absolute right-0 top-6 w-40 bg-zinc-900 border border-white/10 rounded-xl shadow-xl py-1 z-50"
									onClick={(e) => e.stopPropagation()}
								>
									<button
										onClick={handleEdit}
										className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 transition-colors"
									>
										<Edit className="h-3.5 w-3.5" />
										Edit
									</button>
									<button
										onClick={handleClone}
										className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 transition-colors"
									>
										<Copy className="h-3.5 w-3.5" />
										Clone
									</button>
									<button
										onClick={handleDelete}
										className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
									>
										<Trash2 className="h-3.5 w-3.5" />
										Delete
									</button>
								</div>
							)}
						</div>
					)}
				</div>

				<div className="flex items-center justify-between mt-2">
					<span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 capitalize">
						{template.category}
					</span>
					<span className="text-[10px] text-zinc-600">
						{new Date(template.created_at).toLocaleDateString()}
					</span>
				</div>
			</div>
		</div>
	);
}
