// components/social-tenant/EmptyState.tsx

"use client";

import {
	Building2,
	Globe,
	LayoutTemplate,
	Plus,
	Rocket,
	Sparkles,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
	onCreate: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
	return (
		<div className="max-w-4xl mx-auto">
			<div className="text-center py-16 px-4">
				<div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
					<Building2 className="h-12 w-12 text-emerald-400" />
				</div>
				<h2 className="text-2xl font-bold text-white mb-3">
					Build Your First Website
				</h2>
				<p className="text-sm text-zinc-400 max-w-md mx-auto mb-8">
					Create a stunning website in minutes with our AI-powered builder.
					Describe what you want and watch it come to life.
				</p>
				<Button
					onClick={onCreate}
					className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-8 py-6 text-sm flex items-center gap-2 mx-auto"
				>
					<Plus className="h-5 w-5" />
					Start Building
				</Button>
			</div>

			{/* Feature Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
				<div className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl text-center">
					<div className="inline-flex p-3 rounded-full bg-emerald-500/10 mb-4">
						<Sparkles className="h-6 w-6 text-emerald-400" />
					</div>
					<h3 className="text-sm font-bold text-white">AI-Powered Design</h3>
					<p className="text-xs text-zinc-500 mt-2 leading-relaxed">
						Describe your vision and our AI creates a complete, stunning website
						for you.
					</p>
				</div>
				<div className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl text-center">
					<div className="inline-flex p-3 rounded-full bg-sky-500/10 mb-4">
						<Globe className="h-6 w-6 text-sky-400" />
					</div>
					<h3 className="text-sm font-bold text-white">Instant Publishing</h3>
					<p className="text-xs text-zinc-500 mt-2 leading-relaxed">
						Go live immediately with your own URL. Share your site with the
						world.
					</p>
				</div>
				<div className="p-6 bg-zinc-950/40 border border-white/5 rounded-xl text-center">
					<div className="inline-flex p-3 rounded-full bg-purple-500/10 mb-4">
						<LayoutTemplate className="h-6 w-6 text-purple-400" />
					</div>
					<h3 className="text-sm font-bold text-white">Easy Editing</h3>
					<p className="text-xs text-zinc-500 mt-2 leading-relaxed">
						Edit text, colors, and layout with simple controls. No coding
						required.
					</p>
				</div>
			</div>

			{/* Pricing Card */}
			<div className="mt-8 p-6 bg-zinc-950/40 border border-white/5 rounded-xl text-center max-w-md mx-auto">
				<div className="flex items-center justify-center gap-2 mb-2">
					<Rocket className="h-5 w-5 text-emerald-400" />
					<span className="text-sm font-bold text-white">Build for $5.00</span>
				</div>
				<p className="text-xs text-zinc-500">
					One-time payment per build. Edits are free during your active session.
				</p>
			</div>
		</div>
	);
}
