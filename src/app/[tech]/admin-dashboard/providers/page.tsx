import { Cpu, ShieldCheck } from "lucide-react";
import Providers from "@/components/admin/Providers";

export const metadata = {
	title: "API Provider Registry Management Center",
	description:
		"Secure gateway node routing controls for external SMM wholesalers.",
};

export default function AdminProvidersPage() {
	return (
		<div className="space-y-6 p-6 max-w-7xl mx-auto">
			{/* Structural Dashboard Page Header Context */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
						<span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
							Administrative Control Core
						</span>
					</div>
					<h1 className="text-2xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
						<Cpu className="h-6 w-6 text-red-500" />
						API Gateway Providers
					</h1>
					<p className="text-xs font-mono text-zinc-400 max-w-xl">
						Register, authenticate, and configure connection metrics for
						third-party wholesaler endpoints. Changes commit instantly to
						production infrastructure layers.
					</p>
				</div>

				{/* Status Hub Badge Indicator */}
				<div className="flex items-center gap-3 bg-zinc-950 px-4 py-2.5 rounded-xl border border-white/[0.06] self-start md:self-auto">
					<ShieldCheck className="h-4 w-4 text-emerald-400" />
					<div className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
						Clearance Tier:{" "}
						<span className="text-white font-bold">Root Admin</span>
					</div>
				</div>
			</div>

			{/* Main Table Matrix Component Viewport */}
			<main className="animate-in fade-in duration-300">
				<Providers />
			</main>
		</div>
	);
}
