import { ShieldCheck, ShoppingBag } from "lucide-react";
import Services from "@/components/admin/Services";

export const metadata = {
	title: "Storefront Service Catalog Controller",
	description:
		"Configure client-facing catalog listings, platform groupings, and automated profit markups.",
};

export default function AdminServicesCatalogPage() {
	return (
		<div className="space-y-6 p-6 max-w-7xl mx-auto">
			{/* Structural Admin Page Context Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
						<span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
							Platform Merchandising Layer
						</span>
					</div>
					<h1 className="text-2xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
						<ShoppingBag className="h-6 w-6 text-red-500" />
						Storefront Catalog Services
					</h1>
					<p className="text-xs font-mono text-zinc-400 max-w-xl">
						Design client bundles, adjust retail pricing metrics per 1,000
						units, and manage custom text assets. Link items back to wholesalers
						to enable hands-free execution routing.
					</p>
				</div>

				{/* Clearance Verification Node */}
				<div className="flex items-center gap-3 bg-zinc-950 px-4 py-2.5 rounded-xl border border-white/[0.06] self-start md:self-auto">
					<ShieldCheck className="h-4 w-4 text-emerald-400" />
					<div className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
						Clearance Tier:{" "}
						<span className="text-white font-bold">Root Admin</span>
					</div>
				</div>
			</div>

			{/* Main Reactive Table Viewport Node */}
			<main className="animate-in fade-in duration-300">
				<Services />
			</main>
		</div>
	);
}
