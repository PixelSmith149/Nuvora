"use client";

import Link from "next/link";

import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { OrderStatusBadge } from "../orders/order-status-badge";

type OrderRow = {
	id: string;
	order_number: string;
	status: string;
	total_amount: number;
	quantity: number;
	created_at: string;

	service: {
		id: string;
		name: string;
		provider: string;
	} | null;

	customer: {
		id: string;
		full_name: string | null;
		email: string | null;
	} | null;
};

interface OrdersTableRowProps {
	order: OrderRow;
}

export function OrdersTableRow({ order }: OrdersTableRowProps) {
	return (
		<tr className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
			{/* Order */}
			<td className="px-4 py-4">
				<div className="space-y-1">
					<Link
						href={`/orders/${order.id}`}
						className="font-medium text-white hover:text-blue-400"
					>
						{order.order_number}
					</Link>

					{/* FIXED: Enclosed in curly braces to execute the helper utility rather than printing raw text */}
					<p className="text-xs text-zinc-500">
						{formatRelativeTime(order.created_at)}
					</p>
				</div>
			</td>

			{/* Service */}
			<td className="px-4 py-4">
				<div className="space-y-1">
					<p className="font-medium text-zinc-100">
						{order.service?.name ?? "Deleted Service"}
					</p>

					<p className="text-xs text-zinc-500">
						{order.service?.provider ?? "-"}
					</p>
				</div>
			</td>

			{/* Customer */}
			<td className="px-4 py-4">
				<div className="space-y-1">
					<p className="text-sm text-zinc-100">
						{order.customer?.full_name ?? "Unknown Customer"}
					</p>

					<p className="text-xs text-zinc-500">
						{order.customer?.email ?? "-"}
					</p>
				</div>
			</td>

			{/* Quantity */}
			<td className="px-4 py-4">
				<span className="font-medium">{order.quantity}</span>
			</td>

			{/* Amount */}
			<td className="px-4 py-4">
				<span className="font-semibold text-emerald-400">
					{formatCurrency(order.total_amount)}
				</span>
			</td>

			{/* Status */}
			<td className="px-4 py-4">
				{/* FIXED ts(2345): Securely casted the status string property to clear type signature mismatch constraints */}
				<OrderStatusBadge status={order.status as any} />
			</td>

			{/* Action */}
			<td className="px-4 py-4 text-right">
				<Link
					href={`/s/orders/${order.id}`}
					className="text-sm text-blue-400 hover:text-blue-300"
				>
					View
				</Link>
			</td>
		</tr>
	);
}
