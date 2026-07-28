// app/[tech]/admin-dashboard/providers/page.tsx or wherever you want the button

import { ImportServiceDataButton } from "@/components/admin/ImportServiceDataButton";

export default function ProvidersPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-white">Providers</h1>
				<ImportServiceDataButton />
			</div>
			{/* ... rest of your providers list */}
		</div>
	);
}
