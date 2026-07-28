import { AdminServiceSync } from "@/components/admin/ProviderServices";

export default function AdminServicesPage() {
	return (
		<div className="space-y-4 animate-in fade-in duration-200">
			<div>
				<h1 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
					Dynamic Wholesale Profiles
				</h1>
				<p className="text-xs text-zinc-500">
					Configure retail calculations and toggle network category switches
				</p>
			</div>

			{/* Renders your functional markup multiplier manager component */}
			<AdminServiceSync />
		</div>
	);
}
