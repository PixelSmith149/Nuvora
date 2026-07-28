// app/social-tenant/t-a/templates/[id]/page.tsx

import {
	ArrowLeft,
	CheckCircle2,
	Code,
	Copy,
	Download,
	Eye,
	Globe,
	LayoutTemplate,
	Sparkles,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TemplateDetailActions } from "@/components/templates-animation/TemplateDetailActions";
import { getAnimations } from "@/lib/st/services/animation.service";
import {
	getTemplateById,
	incrementTemplateView,
} from "@/lib/st/services/template.service";
import { createClient } from "@/lib/supabase/server";

export default async function TemplateDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/auth/login");
	}

	const template = await getTemplateById(id);

	if (!template) {
		redirect("/social-tenant/t-a");
	}

	const isOwner = template.user_id === user.id;

	if (isOwner) {
		await incrementTemplateView(id);
	}

	const animations = await getAnimations(user.id);
	const templateAnimations = animations.filter((a) => a.template_id === id);

	return (
		<div className="min-h-screen bg-black text-white p-4 md:p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* ─── Header ────────────────────────────────────────────── */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Link
							href={
								isOwner ? "/social-tenant/t-a" : "/social-tenant/t-a/public"
							}
							className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
						>
							<ArrowLeft className="h-5 w-5" />
						</Link>
						<div>
							<h1 className="text-xl font-bold text-white">{template.name}</h1>
							<div className="flex items-center gap-3 text-sm text-zinc-400">
								<span className="capitalize">{template.category}</span>
								<span>•</span>
								<span className="flex items-center gap-1">
									<Eye className="h-3.5 w-3.5" />
									{template.view_count || 0} views
								</span>
								<span className="flex items-center gap-1">
									<Download className="h-3.5 w-3.5" />
									{template.download_count || 0} downloads
								</span>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{template.is_published && (
							<span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
								<CheckCircle2 className="h-3 w-3" />
								Published
							</span>
						)}
						{template.is_public && (
							<span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-1">
								<Globe className="h-3 w-3" />
								Public
							</span>
						)}
					</div>
				</div>

				{/* ─── Main Content ────────────────────────────────────── */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* ─── Preview ──────────────────────────────────────────── */}
					<div className="lg:col-span-2">
						<div className="bg-zinc-950/40 border border-white/5 rounded-xl overflow-hidden">
							<div className="aspect-video bg-zinc-900 relative">
								{template.preview_image ? (
									<img
										src={template.preview_image}
										alt={template.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
										<LayoutTemplate className="h-16 w-16 text-zinc-700" />
									</div>
								)}
							</div>
							<div className="p-4 border-t border-white/5">
								<div className="flex items-center gap-4 text-sm">
									<button className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
										<Eye className="h-4 w-4" />
										Live Preview
									</button>
									<button className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
										<Code className="h-4 w-4" />
										View Code
									</button>
								</div>
							</div>
						</div>

						{/* ─── Description ────────────────────────────────────── */}
						{template.description && (
							<div className="mt-4 p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
								<p className="text-sm text-zinc-300">{template.description}</p>
							</div>
						)}

						{/* ─── Animations ────────────────────────────────────── */}
						{templateAnimations.length > 0 && (
							<div className="mt-4 p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
								<h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
									<Sparkles className="h-4 w-4 text-purple-400" />
									Animations ({templateAnimations.length})
								</h3>
								<div className="flex flex-wrap gap-2">
									{templateAnimations.map((anim) => (
										<span
											key={anim.id}
											className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300"
										>
											{anim.name} ({anim.type}, {anim.duration}ms)
										</span>
									))}
								</div>
							</div>
						)}
					</div>

					{/* ─── Sidebar ──────────────────────────────────────────── */}
					<div>
						{/* ─── Actions (Client Component) ────────────────────── */}
						<TemplateDetailActions
							template={template}
							isOwner={isOwner}
							userId={user.id}
						/>

						{/* ─── Stats ──────────────────────────────────────────── */}
						<div className="mt-4 bg-zinc-950/40 border border-white/5 rounded-xl p-4">
							<h3 className="text-sm font-bold text-white mb-2">Stats</h3>
							<div className="space-y-1.5 text-sm">
								<div className="flex justify-between text-zinc-400">
									<span>Created</span>
									<span className="text-white">
										{new Date(template.created_at).toLocaleDateString()}
									</span>
								</div>
								<div className="flex justify-between text-zinc-400">
									<span>Views</span>
									<span className="text-white">{template.view_count || 0}</span>
								</div>
								<div className="flex justify-between text-zinc-400">
									<span>Clones</span>
									<span className="text-white">
										{template.clone_count || 0}
									</span>
								</div>
								<div className="flex justify-between text-zinc-400">
									<span>Downloads</span>
									<span className="text-white">
										{template.download_count || 0}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
