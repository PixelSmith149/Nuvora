"use client";

import Link from "next/link";
import {
	FiAlertTriangle,
	FiArrowRight,
	FiCheckCircle,
	FiClock,
	FiRefreshCw,
	FiX,
} from "react-icons/fi";
import { formatCurrency } from "@/lib/utils";

// 1. Enforce types directly matching your mappedOrders structure
type OrderDetails = {
	id: string;
	serviceName: string;
	providerName: string;
	targetUrl: string;
	quantity: number;
	chargeAmount: number; // 🎯 This matches order.cost mapping
	providerCost: number;
	profitAmount: number;
	startCount: number | null;
	remains: number | null;
	status: string;
	createdAt: string;
	updatedAt: string;
	tracking_code?: string | null; // Optional fallback
};

interface OrderDetailsSheetProps {
	order: OrderDetails | null;
	open: boolean;
	onClose: () => void;
}

export function OrderDetailsSheet({
	order,
	open,
	onClose,
}: OrderDetailsSheetProps) {
	if (!open || !order) return null;

	// Status mapping UI configurations
	const statusConfig: Record<string, { color: string; bg: string; icon: any }> =
		{
			pending: {
				color: "text-amber-400",
				bg: "bg-amber-400/10",
				icon: FiClock,
			},
			processing: {
				color: "text-blue-400",
				bg: "bg-blue-400/10",
				icon: FiRefreshCw,
			},
			completed: {
				color: "text-green-400",
				bg: "bg-green-400/10",
				icon: FiCheckCircle,
			},
			refunded: {
				color: "text-rose-400",
				bg: "bg-rose-400/10",
				icon: FiAlertTriangle,
			},
		};

	const currentStatus = statusConfig[order.status] || statusConfig.pending;
	const StatusIcon = currentStatus.icon;

	// 🎯 FIX: Read clean, mapped numbers directly
	const safeCost = Number(order.chargeAmount || 0);

	return (
		<>
			{/* Background Overlay */}
			<div
				onClick={onClose}
				className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
			/>

			{/* Simplified Drawer Sheet */}
			<div className="fixed right-0 top-0 z-50 h-screen w-full max-w-md border-l border-zinc-900 bg-zinc-950 text-white shadow-2xl p-6 flex flex-col justify-between页">
				{/* Top Control Header */}
				<div className="space-y-6">
					<div className="flex items-center justify-between border-b border-zinc-900 pb-5">
						<div>
							<p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
								Order Summary
							</p>
							<h2 className="mt-1 text-sm font-mono font-bold text-zinc-300">
								#{order.tracking_code || order.id.substring(0, 8).toUpperCase()}
							</h2>
						</div>

						<button
							onClick={onClose}
							className="rounded-xl border border-zinc-850 p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
						>
							<FiX className="h-5 w-5" />
						</button>
					</div>

					{/* Quick Context Card */}
					<div className="space-y-4">
						<div
							className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold tracking-wide uppercase ${currentStatus.bg} ${currentStatus.color} border border-white/5`}
						>
							<StatusIcon
								className={order.status === "processing" ? "animate-spin" : ""}
							/>
							{order.status}
						</div>

						<div className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/20 space-y-1">
							<p className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold capitalize">
								{order.providerName || "Social Network Placement"}
							</p>
							<p className="text-base font-semibold text-zinc-200">
								{order.serviceName || "SMM Booster Pack"}
							</p>
						</div>

						<div className="grid grid-cols-2 gap-3 text-sm border-t border-zinc-900 pt-4">
							<div>
								<p className="text-xs text-zinc-500">Quantity</p>
								<p className="font-mono font-medium mt-0.5">{order.quantity}</p>
							</div>
							<div>
								<p className="text-xs text-zinc-500">Total Price</p>
								<p className="font-mono font-medium text-emerald-400 mt-0.5">
									{formatCurrency(safeCost)}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Streamlined Call to Actions */}
				<div className="space-y-3 pt-6 border-t border-zinc-900">
					<Link
						href={`/s/orders/${order.id}`}
						onClick={onClose}
						className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-bold text-sm text-center text-white shadow-lg shadow-blue-600/10 group"
					>
						View Full Progress Tracker
						<FiArrowRight className="transform group-hover:translate-x-0.5 transition-transform" />
					</Link>

					<button
						onClick={onClose}
						className="w-full px-4 py-3 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition font-medium text-xs tracking-wide uppercase"
					>
						Dismiss
					</button>
				</div>
			</div>
		</>
	);
}
