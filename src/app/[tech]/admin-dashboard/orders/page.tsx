import { AdminOrderLedger } from "@/components/admin/admin-order-ledger";

export default function AdminOrdersPage() {
	return (
		<div className="space-y-4 animate-in fade-in duration-200">
			<div>
				<h1 className="text-xl font-bold tracking-tight text-white uppercase font-mono">
					Platform Transactions Ledger
				</h1>
				<p className="text-xs text-zinc-500">
					Live configuration manager for automated customer placements
				</p>
			</div>

			{/* Renders your functional client ledger file here inside the main middle viewport */}
			<AdminOrderLedger />
		</div>
	);
}
