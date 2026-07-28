"use client";

import { useEffect, useState } from "react";
import {
	FiAlertCircle,
	FiCheckCircle,
	FiRefreshCw,
	FiSearch,
	FiSliders,
	FiXCircle,
} from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface OrderRecord {
	id: string;
	tracking_code: string | null;
	target: string | null;
	quantity: number;
	cost: number;
	status: string;
	start_count: number | null;
	remains: number | null;
	created_at: string;
	user_id: string;
	services: {
		title: string;
		platform: string;
	} | null;
}

export function AdminOrderLedger() {
	const supabase = createClient();
	const [orders, setOrders] = useState<OrderRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	// Fetch global order data records straight from database execution loop
	async function fetchGlobalOrders() {
		setLoading(true);
		const { data, error } = await supabase
			.from("orders")
			.select(`
        id,
        tracking_code,
        target,
        quantity,
        cost,
        status,
        start_count,
        remains,
        created_at,
        user_id,
        services (
          title,
          platform
        )
      `)
			.order("created_at", { ascending: false });

		if (!error && data) {
			setOrders(data as any[]);
		}
		setLoading(false);
	}

	useEffect(() => {
		fetchGlobalOrders();
	}, []);

	// 🎯 CORE REQ: Instant database synchronization with optimistic UI state engine updates
	async function handleUpdateStatus(orderId: string, nextStatus: string) {
		setUpdatingId(orderId);

		// 1. Optimistic Update (Immediate interface response strategy)
		const originalOrders = [...orders];
		setOrders((prev) =>
			prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
		);

		// 2. Direct Atomic Database Write Execution
		const { error } = await supabase
			.from("orders")
			.update({ status: nextStatus })
			.eq("id", orderId);

		if (error) {
			setOrders(originalOrders);
			alert("Failed to synchronize change directly with your database node.");
		}

		setUpdatingId(null);
	}

	// Filter evaluation matching criteria parameters
	const filteredOrders = orders.filter((order) => {
		const matchesSearch =
			order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(order.tracking_code?.toLowerCase() || "").includes(
				searchTerm.toLowerCase(),
			) ||
			(order.target?.toLowerCase() || "").includes(searchTerm.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || order.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	return (
		<div className="space-y-6 bg-black text-white p-6 rounded-3xl border border-zinc-900">
			{/* Configuration Controller Header Action Strip Layer */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
				<div>
					<h2 className="text-xl font-bold tracking-tight text-zinc-100">
						Global Operational Order Core
					</h2>
					<p className="text-xs text-zinc-500 mt-1">
						Live administration command deck monitoring user system purchases
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<div className="relative">
						<FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 text-sm" />
						<input
							type="text"
							placeholder="Search Target/ID/Code..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="bg-zinc-950 border border-zinc-850 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-700 w-64"
						/>
					</div>

					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-400 focus:outline-none focus:border-zinc-700"
					>
						<option value="all">All Status Nodes</option>
						<option value="pending">Pending</option>
						<option value="processing">Processing</option>
						<option value="completed">Completed</option>
						<option value="refunded">Refunded</option>
					</select>

					<button
						onClick={fetchGlobalOrders}
						className="p-2.5 rounded-xl border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-white transition"
					>
						<FiRefreshCw
							className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
						/>
					</button>
				</div>
			</div>

			{/* Global Ledger Database Presentation Layer Grid Table */}
			<div className="overflow-x-auto border border-zinc-900 rounded-2xl bg-zinc-950/40">
				<table className="w-full text-left border-collapse text-xs">
					<thead>
						<tr className="border-b border-zinc-900 text-zinc-500 uppercase font-bold tracking-wider bg-zinc-950">
							<th className="p-4">Target / Channel</th>
							<th className="p-4">Package Identity</th>
							<th className="p-4 font-mono">Metrics Size</th>
							<th className="p-4">Revenue Price</th>
							<th className="p-4">State Control</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-zinc-900 font-medium text-zinc-300">
						{filteredOrders.map((order) => (
							<tr key={order.id} className="hover:bg-zinc-900/30 transition">
								<td className="p-4 max-w-xs">
									<div className="font-bold text-zinc-200 font-mono truncate">
										{order.tracking_code ||
											order.id.substring(0, 8).toUpperCase()}
									</div>
									<div className="text-[11px] text-zinc-500 truncate font-mono mt-0.5">
										{order.target}
									</div>
								</td>
								<td className="p-4">
									<span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">
										{order.services?.platform}
									</span>
									<span className="text-zinc-200 mt-0.5 block">
										{order.services?.title || "Custom SMM Action Payload"}
									</span>
								</td>
								<td className="p-4 font-mono text-zinc-400">
									x{order.quantity}
								</td>
								<td className="p-4 font-mono font-bold text-emerald-400">
									{formatCurrency(order.cost)}
								</td>
								<td className="p-4">
									<div className="flex items-center gap-1.5">
										<select
											value={order.status}
											disabled={updatingId === order.id}
											onChange={(e) =>
												handleUpdateStatus(order.id, e.target.value)
											}
											className={`bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none focus:border-zinc-700 capitalize ${
												order.status === "completed"
													? "text-green-400"
													: order.status === "processing"
														? "text-blue-400"
														: order.status === "pending"
															? "text-amber-400"
															: "text-rose-400"
											}`}
										>
											<option value="pending">Pending</option>
											<option value="processing">Processing</option>
											<option value="completed">Completed</option>
											<option value="refunded">Refunded</option>
										</select>
									</div>
								</td>
							</tr>
						))}

						{!loading && filteredOrders.length === 0 && (
							<tr>
								<td
									colSpan={5}
									className="p-8 text-center text-zinc-600 font-mono text-[11px]"
								>
									No platform system order records found matching the active
									filters.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
