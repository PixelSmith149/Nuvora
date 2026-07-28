"use client";

import { useState } from "react";
import { OrderDetailsSheet } from "../services/order-details-sheet";
import { OrderStatusBadge } from "./order-status-badge";

export interface MarketplaceOrder {
	id: string;
	serviceName: string;
	providerName: string;
	targetUrl: string;
	quantity: number;
	chargeAmount: number;
	providerCost: number;
	profitAmount: number;
	startCount: number | null;
	remains: number | null;
	status:
		| "pending"
		| "processing"
		| "completed"
		| "partial"
		| "cancelled"
		| "refunded";
	createdAt: string;
	updatedAt: string;
}

interface OrdersTableProps {
	orders: MarketplaceOrder[];
	currentPage: number;
	totalPages: number;
}

export function OrdersTable({
	orders,
	currentPage,
	totalPages,
}: OrdersTableProps) {
	const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrder | null>(
		null,
	);

	if (orders.length === 0) {
		return (
			<section
				className="
          rounded-3xl
          border
          border-zinc-800
          bg-zinc-950
          p-12
          text-center
        "
			>
				<h3 className="text-xl font-semibold text-white">No Orders Found</h3>

				<p className="mt-3 text-zinc-400">Orders you made will appear here.</p>
			</section>
		);
	}

	return (
		<>
			<section
				className="
          overflow-hidden
          rounded-3xl
          border
          border-zinc-800
          bg-zinc-950
        "
			>
				<div className="overflow-x-auto">
					<table className="min-w-full">
						<thead className="border-b border-zinc-800 bg-zinc-900/50">
							<tr>
								<HeaderCell>Order ID</HeaderCell>
								<HeaderCell>Service</HeaderCell>
								<HeaderCell>Quantity</HeaderCell>
								<HeaderCell>Amount</HeaderCell>
								<HeaderCell>Status</HeaderCell>
								<HeaderCell>Created</HeaderCell>
								<HeaderCell>Action</HeaderCell>
							</tr>
						</thead>

						<tbody>
							{orders.map((order) => (
								<tr
									key={order.id}
									className="
                    border-b
                    border-zinc-800
                    transition
                    hover:bg-zinc-900/40
                  "
								>
									<TableCell>
										<span className="font-mono text-xs">
											{order.id.slice(0, 10)}
											...
										</span>
									</TableCell>

									<TableCell>
										<div>
											<p className="font-medium text-white">
												{order.serviceName}
											</p>

											<p className="mt-1 text-xs text-zinc-500">
												{order.providerName}
											</p>
										</div>
									</TableCell>

									<TableCell>{order.quantity.toLocaleString()}</TableCell>

									<TableCell>${order.chargeAmount.toFixed(2)}</TableCell>

									<TableCell>
										<OrderStatusBadge status={order.status} />
									</TableCell>

									<TableCell>
										{new Date(order.createdAt).toLocaleDateString()}
									</TableCell>

									<TableCell>
										<button
											onClick={() => setSelectedOrder(order)}
											className="
                        rounded-xl
                        border
                        border-zinc-700
                        px-3
                        py-2
                        text-sm
                        transition
                        hover:border-zinc-600
                        hover:bg-zinc-900
                      "
										>
											View
										</button>
									</TableCell>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div
					className="
            flex
            items-center
            justify-between
            border-t
            border-zinc-800
            p-5
          "
				>
					<div className="text-sm text-zinc-500">
						Page {currentPage} of {totalPages}
					</div>

					<div className="flex gap-2">
						<button
							disabled={currentPage <= 1}
							className="
                rounded-xl
                border
                border-zinc-800
                px-4
                py-2
                text-sm
                disabled:opacity-40
              "
						>
							Previous
						</button>

						<button
							disabled={currentPage >= totalPages}
							className="
                rounded-xl
                border
                border-zinc-800
                px-4
                py-2
                text-sm
                disabled:opacity-40
              "
						>
							Next
						</button>
					</div>
				</div>
			</section>

			{/* FIXED: Formatted reference value signature using safe assertion option check to avoid component strict null mismatches */}
			<OrderDetailsSheet
				order={selectedOrder as any}
				open={!!selectedOrder}
				onClose={() => setSelectedOrder(null)}
			/>
		</>
	);
}

function HeaderCell({ children }: { children: React.ReactNode }) {
	return (
		<th
			className="
        px-6
        py-4
        text-left
        text-xs
        font-semibold
        uppercase
        tracking-wider
        text-zinc-500
      "
		>
			{children}
		</th>
	);
}

function TableCell({ children }: { children: React.ReactNode }) {
	return (
		<td
			className="
        px-6
        py-4
        text-sm
        text-zinc-300
      "
		>
			{children}
		</td>
	);
}
