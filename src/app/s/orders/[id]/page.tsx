import Link from "next/link";
import { notFound } from "next/navigation";
import {
	FiAlertTriangle,
	FiCheckCircle,
	FiChevronLeft,
	FiClock,
	FiExternalLink,
	FiRefreshCw,
} from "react-icons/fi";
import { PLATFORM_CONFIG } from "@/lib/services/platform-config";
import { createClient } from "@/lib/supabase/server";

interface OrderPageProps {
	params: Promise<{ id: string }>;
}

// 1. Explicitly declare the custom type mapping for your Supabase Join statement
interface ServiceJoinedData {
	platform: string | null;
	service_type: string | null;
	title: string | null;
	description: string | null;
	price_per_1000: number | string | null;
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
	const { id } = await params;
	const supabase = await createClient();

	// Validate the logged-in authentication context state
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return notFound();

	// Execute the exact database read position query block
	const { data: rawOrder, error } = await supabase
		.from("orders")
		.select(`
      id,
      target,
      quantity,
      cost,
      status,
      start_count,
      remains,
      created_at,
      tracking_code,
      services (
        platform,
        service_type,
        title,
        description,
        price_per_1000
      )
    `)
		.eq("id", id)
		.eq("user_id", user.id)
		.single();

	if (error || !rawOrder) {
		return notFound();
	}

	// 2. CRITICAL TYPE SHIELD: Extract relation data arrays/objects safely to eliminate compiler bugs
	const order = rawOrder as any;
	const rawServiceData = order.services;

	const service: ServiceJoinedData | null = Array.isArray(rawServiceData)
		? (rawServiceData[0] as ServiceJoinedData)
		: (rawServiceData as ServiceJoinedData) || null;

	// Visual status milestone profile configs
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

	// Resolve cross-platform icons using defensive mapping checks
	const platformKey = service?.platform?.toLowerCase() ?? "";
	const platformConfig =
		PLATFORM_CONFIG[platformKey as keyof typeof PLATFORM_CONFIG];
	const PlatformIcon = platformConfig?.icon;

	// 3. DEFENSIVE CALCULATIONS: Ensure safe fallback operations if database numbers are null
	const totalQuantity = Number(order.quantity || 0);
	const remainingQuantity =
		order.remains !== null && order.remains !== undefined
			? Number(order.remains)
			: totalQuantity;
	const deliveredQuantity = Math.max(0, totalQuantity - remainingQuantity);
	const deliveryPercent =
		totalQuantity > 0
			? Math.round((deliveredQuantity / totalQuantity) * 100)
			: 0;

	const baseCost = Number(order.cost || 0);
	const retailPricePer1k = Number(service?.price_per_1000 || 0);

	return (
		<main className="min-h-screen bg-black text-white px-6 py-24">
			<div className="mx-auto w-full max-w-3xl space-y-8">
				{/* Navigation Action Layer */}
				<Link
					href="/s/orders"
					className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition group"
				>
					<FiChevronLeft className="transform group-hover:-translate-x-0.5 transition-transform" />
					Back to Orders
				</Link>

				{/* Top Header Identity Profile Block */}
				<div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-8">
					<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div className="flex items-center gap-5">
							{PlatformIcon ? (
								<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-black shrink-0">
									<PlatformIcon
										className={`h-8 w-8 ${platformConfig?.color}`}
									/>
								</div>
							) : (
								<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 shrink-0 text-zinc-500 font-mono text-xs uppercase font-bold">
									SMM
								</div>
							)}
							<div>
								<p className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-bold">
									{service?.platform || "Premium Service Placement"}
								</p>
								<h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
									{service?.title || "SMM Order Position Entry"}
								</h1>
								{service?.description && (
									<p className="mt-2 max-w-xl text-zinc-400 text-sm leading-relaxed">
										{service.description}
									</p>
								)}
							</div>
						</div>

						<div
							className={`inline-flex items-center gap-3 rounded-2xl px-5 py-3 ${currentStatus.bg} ${currentStatus.color} self-start lg:self-auto shrink-0 border border-white/5`}
						>
							<StatusIcon
								className={order.status === "processing" ? "animate-spin" : ""}
							/>
							<span className="font-semibold text-sm capitalize tracking-wide">
								{order.status}
							</span>
						</div>
					</div>
				</div>

				{/* Complete Responsive 3-Column Content Data Layout Layer */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
					{/* Main Context Details & Counters Layout Column (Spans 2 blocks) */}
					<div className="md:col-span-2 space-y-6">
						{/* Target Information Card */}
						<div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-5">
							<h2 className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
								Target Fulfillment Coordinates
							</h2>

							<div className="grid grid-cols-2 gap-4 border-b border-zinc-900 pb-5">
								<div>
									<p className="text-[11px] text-zinc-500 uppercase tracking-wider">
										Target Domain Channel
									</p>
									<p className="mt-1 text-base font-semibold capitalize text-zinc-200">
										{service?.platform || "Social Media Network"}
									</p>
								</div>
								<div>
									<p className="text-[11px] text-zinc-500 uppercase tracking-wider">
										Service Metric Action Type
									</p>
									<p className="mt-1 text-base font-semibold text-zinc-200">
										{service?.service_type || "Growth Boost Engine"}
									</p>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
									Target Link Objective
								</label>
								<a
									href={order.target || "#"}
									target="_blank"
									rel="noreferrer"
									className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black p-4 text-sm font-mono hover:border-zinc-700 transition text-zinc-300 group"
								>
									<span className="truncate mr-4">
										{order.target || "No target reference link provided"}
									</span>
									<FiExternalLink className="text-zinc-500 group-hover:text-white shrink-0 transition" />
								</a>
							</div>
						</div>

						{/* Live Progress Metrics Panel (Hides completely if the position was Refunded) */}
						{order.status !== "refunded" && (
							<div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-4">
								<div className="flex justify-between items-center">
									<h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
										Live Delivery Counter Analytics
									</h2>
									<span className="text-xs text-zinc-400 font-mono font-bold">
										{deliveryPercent}% Complete
									</span>
								</div>

								{/* Progress Metric Bar line */}
								<div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-850">
									<div
										className="bg-green-500 h-full transition-all duration-500"
										style={{ width: `${deliveryPercent}%` }}
									/>
								</div>

								<div className="grid grid-cols-3 gap-3 text-center pt-2">
									<div className="p-3 rounded-xl bg-black/40 border border-zinc-900">
										<div className="text-[10px] uppercase text-zinc-500 tracking-wider">
											Ordered
										</div>
										<div className="text-base font-bold font-mono mt-0.5 text-white">
											{totalQuantity}
										</div>
									</div>
									<div className="p-3 rounded-xl bg-black/40 border border-zinc-900">
										<div className="text-[10px] uppercase text-zinc-500 tracking-wider">
											Start Point
										</div>
										<div className="text-base font-bold font-mono mt-0.5 text-white">
											{order.start_count !== null &&
											order.start_count !== undefined
												? order.start_count
												: "---"}
										</div>
									</div>
									<div className="p-3 rounded-xl bg-black/40 border border-zinc-900">
										<div className="text-[10px] uppercase text-zinc-500 tracking-wider">
											Remains
										</div>
										<div className="text-base font-bold font-mono mt-0.5 text-zinc-400">
											{remainingQuantity}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Ledger Financial Invoicing Panel (Spans 1 block) */}
					<div className="space-y-6 w-full">
						<div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-4">
							<h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
								Financial Ledger Invoice
							</h2>

							<div className="space-y-3 pt-1">
								<div className="flex justify-between text-xs text-zinc-400">
									<span>Base Rate (per 1k):</span>
									<span className="font-mono text-zinc-300">
										${retailPricePer1k.toFixed(2)}
									</span>
								</div>
								<div className="flex justify-between text-xs text-zinc-400">
									<span>Target Amount Size:</span>
									<span className="font-mono text-zinc-300">
										x{totalQuantity}
									</span>
								</div>
								<hr className="border-zinc-900 my-1" />
								<div className="flex justify-between items-baseline pt-1">
									<span className="text-xs font-medium text-white uppercase tracking-wider">
										Amount Deducted:
									</span>
									<span className="text-2xl font-black text-green-400 font-mono">
										${baseCost.toFixed(2)}
									</span>
								</div>
							</div>

							<div className="pt-2 text-[10px] leading-relaxed text-zinc-500 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900/50 font-mono">
								Invoice Reference:
								<br />
								<span className="text-zinc-400 text-[11px] block mt-0.5 truncate">
									{order.tracking_code ||
										order.id.replace(/-/g, "").substring(0, 12).toUpperCase()}
								</span>
							</div>
						</div>

						{/* Isolated Contextual Support Gateway */}
						<Link
							href={`/account/support?reason=order&order_id=${order.id}&code=${order.tracking_code || order.id}`}
							className="flex items-center justify-center w-full px-4 py-3.5 rounded-xl border border-zinc-800 hover:bg-zinc-950 hover:border-zinc-700 transition-all font-bold text-xs tracking-wider uppercase text-center text-zinc-400 hover:text-white"
						>
							Report Issues with Order
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
}
