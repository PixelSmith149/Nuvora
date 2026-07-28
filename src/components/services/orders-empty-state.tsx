// /components/services/orders-empty-state.tsx

import Link from "next/link";

interface OrdersEmptyStateProps {
	title?: string;
	description?: string;
	showBrowseServices?: boolean;
}

export function OrdersEmptyState({
	title = "No orders found",
	description = "Orders will appear here once customers start placing service requests.",
	showBrowseServices = true,
}: OrdersEmptyStateProps) {
	return (
		<div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50">
			<div className="mx-auto flex max-w-lg flex-col items-center px-6 py-16 text-center">
				{/* Icon */}
				<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-8 w-8 text-zinc-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={1.5}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3 7.5L12 3l9 4.5M3 7.5v9L12 21m-9-13.5L12 12m9-4.5V12M12 21v-9m0 0L21 7.5"
						/>
					</svg>
				</div>

				<h3 className="text-xl font-semibold text-white">{title}</h3>

				<p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>

				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					{showBrowseServices && (
						<Link
							href="/services"
							className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
						>
							Browse Services
						</Link>
					)}

					<Link
						href="/orders"
						className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900"
					>
						Refresh
					</Link>
				</div>
			</div>
		</div>
	);
}
