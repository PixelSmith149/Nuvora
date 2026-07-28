// app/st/link-in-bio/page.tsx

import { ArrowRight, Link2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
	getAvailableTemplates,
	getOrCreateProfile,
} from "@/lib/st/services/link-in-bio.service";
import type { Template } from "@/lib/st/types/link-in-bio";
import { createClient } from "@/lib/supabase/server";

export default async function LinkInBioLanding() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/auth/login?redirect=/st/link-in-bio");
	}

	const username =
		user?.user_metadata?.username || user?.email?.split("@")[0] || "user";

	// ─── Get or create profile ──────────────────────────────────
	await getOrCreateProfile(user.id, username);

	// ─── Get templates ──────────────────────────────────────────
	const templates: Template[] = getAvailableTemplates();

	// ─── Render ──────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-black text-white">
			<div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
				{/* ─── Header ──────────────────────────────────────────── */}
				<div className="text-center space-y-4 mb-12">
					<div className="flex items-center justify-center gap-3">
						<Link2 className="h-8 w-8 text-emerald-400" />
						<h1 className="text-3xl font-bold text-white">Link-in-Bio</h1>
					</div>
					<p className="text-sm text-zinc-400 max-w-md mx-auto">
						Choose a template to create your personalized link-in-bio page. All
						your links in one beautiful page.
					</p>
					<div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
						<span>@{username}</span>
						<span className="w-px h-3 bg-white/10" />
						<span>{templates.length} templates available</span>
					</div>
				</div>

				{/* ─── Templates Grid ──────────────────────────────────── */}
				<div className="space-y-4">
					{templates.map((template, index) => (
						<div
							key={template.id}
							className="group bg-zinc-950/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300"
						>
							<div className="flex flex-col md:flex-row items-stretch">
								{/* ─── Preview ───────────────────────────────────── */}
								<div className="md:w-64 bg-zinc-900/50 p-4 flex items-center justify-center min-h-[180px]">
									<div className="w-full max-w-[180px] aspect-[3/4] rounded-xl bg-zinc-800/50 overflow-hidden flex items-center justify-center">
										<span className="text-6xl opacity-20">
											{template.id === "minimal"
												? "✨"
												: template.id === "dark-luxe"
													? "🌙"
													: template.id === "glass"
														? "🪟"
														: template.id === "gradient"
															? "🌈"
															: template.id === "bold"
																? "💪"
																: template.id === "elegant"
																	? "🌸"
																	: template.id === "neon"
																		? "💫"
																		: template.id === "nature"
																			? "🌿"
																			: template.id === "professional"
																				? "💼"
																				: "🎨"}
										</span>
									</div>
								</div>

								{/* ─── Content ───────────────────────────────────── */}
								<div className="flex-1 p-5 flex flex-col justify-between">
									<div>
										<div className="flex items-center gap-3 mb-1">
											<h3 className="text-lg font-bold text-white">
												{template.name}
											</h3>
											<span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800/50 border border-white/5 text-zinc-400">
												{template.category}
											</span>
										</div>
										<p className="text-sm text-zinc-400">
											{template.description}
										</p>

										{/* ─── Style Tags ────────────────────────────── */}
										<div className="flex flex-wrap gap-1.5 mt-3">
											<span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-zinc-900/50 border border-white/5 text-zinc-500">
												{template.styles.fontFamily.replace("font-", "")}
											</span>
											<span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-zinc-900/50 border border-white/5 text-zinc-500">
												{template.defaultSettings.buttonRadius.replace(
													"rounded-",
													"",
												)}
											</span>
											<span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-zinc-900/50 border border-white/5 text-zinc-500">
												{template.defaultSettings.animation}
											</span>
										</div>
									</div>

									<div className="mt-4 flex items-center justify-between">
										<span className="text-[10px] text-zinc-600">
											#{String(index + 1).padStart(2, "0")}
										</span>
										<Link
											href={`/st/link-in-bio/edit/${template.id}`}
											className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all group/btn"
										>
											Select Template
											<ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
										</Link>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* ─── Footer ──────────────────────────────────────────── */}
				<div className="mt-12 text-center text-xs text-zinc-600 border-t border-white/5 pt-6">
					<p>Nu-vora | Elite Home — Link-in-Bio</p>
				</div>
			</div>
		</div>
	);
}
