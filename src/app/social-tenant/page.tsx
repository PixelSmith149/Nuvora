"use client";

import { motion } from "framer-motion";
import { Crown, Globe, Store, Zap } from "lucide-react";
import Link from "next/link";
import React from "react";

const doors = [
	{
		title: "Build your first website⚡",
		subtitle: "Get it done in less than 3min ",
		href: "/st",
		icon: <Globe className="w-9 h-9" />,
		color: "emerald",
		description: "Stunning professional & branded websites",
	},
	{
		title: "Link-in-Bio Tools",
		subtitle: "One Link. Maximum Reach.",
		href: "/st/link-in-bio",
		icon: <Zap className="w-9 h-9" />,
		color: "amber",
		description: "Trackable, high-converting smart links",
	},
	{
		title: "Templates animation hub",
		subtitle: "create and generate illusion templates with elite",
		href: "/social-tenant/t-a/public",
		icon: <Store className="w-9 h-9" />,
		color: "violet",
		description: "Premium marketplace with escrow",
	},
];

export default function PrimeBoosterLanding() {
	return (
		<div className="min-h-screen bg-black text-white overflow-hidden relative">
			{/* Background Effects */}
			<div className="absolute inset-0 bg-[radial-gradient(at_50%_20%,rgba(234,179,8,0.08)_0%,transparent_50%)]" />

			<div className="max-w-6xl mx-auto px-6 pt-16 pb-12 relative z-10">
				{/* Compact Hero */}
				<div className="text-center mb-16">
					<div className="inline-flex items-center gap-2 mb-4">
						<Crown className="w-6 h-6 text-amber-400" />
						<span className="uppercase tracking-[3px] text-xs font-medium text-amber-400">
							Elite Access
						</span>
					</div>
					<h1 className="text-5xl md:text-6xl font-bold tracking-tighter heading-font mb-4">
						Choose Your Realm
					</h1>
					<p className="text-zinc-400 max-w-md mx-auto">
						Three premium digital experiences on one powerful platform.
					</p>
				</div>

				{/* Grid - Always 3 columns, never collapses */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{doors.map((door, index) => (
						<Link key={index} href={door.href} className="group">
							<motion.div
								whileHover={{ scale: 1.03, y: -6 }}
								whileTap={{ scale: 0.98 }}
								className="relative h-full bg-zinc-950 border border-white/10 hover:border-white/30 rounded-3xl overflow-hidden transition-all duration-500 flex flex-col"
							>
								{/* Visual Area */}
								<div
									className={`h-64 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center relative overflow-hidden border-b border-white/5`}
								>
									<div className="text-[120px] opacity-10 group-hover:opacity-20 transition-opacity">
										{door.icon}
									</div>
									<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff08_0%,transparent_70%)]" />
								</div>

								{/* Content */}
								<div className="p-8 flex-1 flex flex-col">
									<h2 className="text-3xl font-bold tracking-tighter mb-3 text-white group-hover:text-white transition-colors">
										{door.title}
									</h2>
									<p className="text-lg text-zinc-400 mb-4">{door.subtitle}</p>
									<p className="text-sm text-zinc-500 flex-1">
										{door.description}
									</p>

									<div className="mt-6 text-sm font-medium text-white flex items-center gap-2 group-hover:gap-3 transition-all">
										Enter Experience
										<span className="text-xl transition-transform group-hover:translate-x-1">
											→
										</span>
									</div>
								</div>

								{/* Bottom Accent */}
								<div
									className={`h-1 bg-gradient-to-r from-transparent via-${door.color}-500/70 to-transparent w-0 group-hover:w-full transition-all duration-700`}
								/>
							</motion.div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
