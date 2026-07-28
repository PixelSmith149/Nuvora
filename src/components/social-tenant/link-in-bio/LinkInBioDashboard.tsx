// components/social-tenant/link-in-bio/LinkInBioDashboard.tsx

"use client";

import {
	CheckCircle2,
	Copy,
	ExternalLink,
	Eye,
	Loader2,
	Pencil,
	Plus,
	Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	getAvailableTemplates,
	getOrCreateProfile,
} from "@/lib/st/services/link-in-bio.service";
import type { LinkInBioProfile, Template } from "@/lib/st/types/link-in-bio";
import { TemplateCard } from "./TemplateCard";

interface LinkInBioDashboardProps {
	userId: string;
	username: string;
}

export function LinkInBioDashboard({
	userId,
	username,
}: LinkInBioDashboardProps) {
	const router = useRouter();
	const [templates] = useState<Template[]>(getAvailableTemplates());
	const [profile, setProfile] = useState<LinkInBioProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [copied, setCopied] = useState(false);

	// ─── Load Profile ──────────────────────────────────────────────
	useEffect(() => {
		const loadProfile = async () => {
			try {
				const data = await getOrCreateProfile(userId, username);
				setProfile(data);
			} catch (error) {
				console.error("Failed to load profile:", error);
			} finally {
				setLoading(false);
			}
		};
		loadProfile();
	}, [userId, username]);

	// ─── Handle Template Selection ──────────────────────────────
	const handleSelectTemplate = (templateId: string) => {
		router.push(`/st/link-in-bio/edit/${templateId}`);
	};

	// ─── Handle Copy URL ──────────────────────────────────────────
	const handleCopyUrl = () => {
		const url = `${window.location.origin}/@${username}`;
		navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	// ─── Loading State ────────────────────────────────────────────
	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
			</div>
		);
	}

	// ─── Main Render ──────────────────────────────────────────────
	return (
		<div className="space-y-8">
			{/* ─── Header ────────────────────────────────────────────── */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-white">Link-in-Bio</h1>
					<p className="text-sm text-zinc-400">
						Choose a template to create your personalized link-in-bio page
					</p>
				</div>
				<div className="flex items-center gap-3">
					{profile?.is_published && (
						<div className="flex items-center gap-2">
							<span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
								Published ✓
							</span>
						</div>
					)}
					<button
						onClick={handleCopyUrl}
						className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800 rounded-xl border border-white/5 text-sm text-zinc-400 hover:text-white transition-colors"
					>
						{copied ? (
							<CheckCircle2 className="h-4 w-4 text-emerald-400" />
						) : (
							<Copy className="h-4 w-4" />
						)}
						<span>{copied ? "Copied!" : "Copy URL"}</span>
					</button>
					{profile?.is_published && (
						<a
							href={`/@${username}`}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors"
						>
							<ExternalLink className="h-4 w-4" />
							View Live
						</a>
					)}
				</div>
			</div>

			{/* ─── Stats ──────────────────────────────────────────────── */}
			{profile && (
				<div className="grid grid-cols-3 gap-4">
					<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl text-center">
						<p className="text-2xl font-bold text-white">
							{profile.view_count || 0}
						</p>
						<p className="text-xs text-zinc-500">Views</p>
					</div>
					<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl text-center">
						<p className="text-2xl font-bold text-white">0</p>
						<p className="text-xs text-zinc-500">Clicks</p>
					</div>
					<div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl text-center">
						<p className="text-2xl font-bold text-white">
							{profile.is_published ? "✅" : "📝"}
						</p>
						<p className="text-xs text-zinc-500">
							{profile.is_published ? "Published" : "Draft"}
						</p>
					</div>
				</div>
			)}

			{/* ─── Templates Grid ────────────────────────────────────── */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-bold text-white flex items-center gap-2">
						<Sparkles className="h-4 w-4 text-emerald-400" />
						Choose Your Template
					</h2>
					<span className="text-xs text-zinc-500">
						{templates.length} templates
					</span>
				</div>

				<div className="space-y-4">
					{templates.map((template, index) => (
						<TemplateCard
							key={template.id}
							template={template}
							index={index}
							onSelect={handleSelectTemplate}
						/>
					))}
				</div>
			</div>

			{/* ─── Quick Create ───────────────────────────────────────── */}
			<div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-emerald-500/30 transition-all">
				<div className="inline-flex p-3 rounded-full bg-zinc-900/50 mb-4">
					<Plus className="h-6 w-6 text-zinc-500" />
				</div>
				<p className="text-sm font-medium text-zinc-400">
					Not seeing what you like?
				</p>
				<p className="text-xs text-zinc-500 mt-1">
					You can fully customize any template after selecting it
				</p>
			</div>
		</div>
	);
}
