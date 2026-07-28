// components/social-tenant/SocialTenantDashboard.tsx

"use client";

import {
	ArrowRight,
	Building2,
	LayoutTemplate,
	Link2,
	Palette,
	Plus,
	Smartphone,
	Sparkles,
	Store,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dashboard } from "./Dashboard";
import { LinkInBioDashboard } from "./link-in-bio/LinkInBioDashboard";

// ─── Import other components as they're built ──────────────────
// import { TemplateDesigner } from './TemplateDesigner';
// import { AnimationStudio } from './AnimationStudio';
// import { StorefrontBuilder } from './StorefrontBuilder';

type Tab =
	| "websites"
	| "link-in-bio"
	| "templates"
	| "animations"
	| "storefronts";

interface SocialTenantDashboardProps {
	userId: string;
	username: string;
}

export function SocialTenantDashboard({
	userId,
	username,
}: SocialTenantDashboardProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<Tab>("websites");

	const tabs = [
		{
			id: "websites",
			label: "Websites",
			icon: <Building2 className="h-4 w-4" />,
		},
		{
			id: "link-in-bio",
			label: "Link-in-Bio",
			icon: <Link2 className="h-4 w-4" />,
		},
		{
			id: "templates",
			label: "Templates",
			icon: <LayoutTemplate className="h-4 w-4" />,
		},
		{
			id: "animations",
			label: "Animations",
			icon: <Sparkles className="h-4 w-4" />,
		},
		{
			id: "storefronts",
			label: "Storefronts",
			icon: <Store className="h-4 w-4" />,
		},
	];

	return (
		<div className="space-y-6">
			{/* ─── Tabs ────────────────────────────────────────────── */}
			<div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id as Tab)}
						className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
							activeTab === tab.id
								? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
								: "text-zinc-400 hover:text-white hover:bg-white/5"
						}`}
					>
						{tab.icon}
						{tab.label}
					</button>
				))}
			</div>

			{/* ─── Content ──────────────────────────────────────────── */}
			<div className="min-h-[400px]">
				{activeTab === "websites" && (
					<Dashboard userId={userId} username={username} />
				)}
				{activeTab === "link-in-bio" && (
					<LinkInBioDashboard userId={userId} username={username} />
				)}
				{/* {activeTab === 'templates' && <TemplateDesigner userId={userId} username={username} />} */}
				{/* {activeTab === 'animations' && <AnimationStudio userId={userId} username={username} />} */}
				{/* {activeTab === 'storefronts' && <StorefrontBuilder userId={userId} username={username} />} */}
			</div>
		</div>
	);
}
