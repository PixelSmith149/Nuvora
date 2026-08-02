import Link from "next/link";
import { notFound } from "next/navigation";
import {
    FiAlertCircle,
    FiAlertTriangle,
    FiCheckCircle,
    FiClock,
    FiExternalLink,
    FiRefreshCw,
	FiChevronLeft,
    FiXCircle,
} from "react-icons/fi";
import { PLATFORM_CONFIG } from "@/lib/services/platform-config";
import { createClient } from "@/lib/supabase/server";

interface OrderPageProps {
    params: Promise<{ id: string }>;
}

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

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return notFound();

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

    const order = rawOrder as any;
    const rawServiceData = order.services;
    const service: ServiceJoinedData | null = Array.isArray(rawServiceData)
        ? (rawServiceData[0] as ServiceJoinedData)
        : (rawServiceData as ServiceJoinedData) || null;

    // Expanded status configuration covering standard SMM provider lifecycles
    const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
        pending: { color: "text-amber-400", bg: "bg-amber-400/10", icon: FiClock },
        processing: { color: "text-blue-400", bg: "bg-blue-400/10", icon: FiRefreshCw },
        in_progress: { color: "text-blue-400", bg: "bg-blue-400/10", icon: FiRefreshCw },
        completed: { color: "text-green-400", bg: "bg-green-400/10", icon: FiCheckCircle },
        partial: { color: "text-orange-400", bg: "bg-orange-400/10", icon: FiAlertCircle },
        canceled: { color: "text-zinc-400", bg: "bg-zinc-400/10", icon: FiXCircle },
        refunded: { color: "text-rose-400", bg: "bg-rose-400/10", icon: FiAlertTriangle },
    };

    const currentStatus = statusConfig[order.status?.toLowerCase()] || statusConfig.pending;
    const StatusIcon = currentStatus.icon;

    const platformKey = service?.platform?.toLowerCase() ?? "";
    const platformConfig = PLATFORM_CONFIG[platformKey as keyof typeof PLATFORM_CONFIG];
    const PlatformIcon = platformConfig?.icon;

    // Safe calculations & bounds clamping
    const totalQuantity = Number(order.quantity || 0);
    const remainingQuantity = order.remains !== null && order.remains !== undefined
        ? Number(order.remains)
        : totalQuantity;

    const deliveredQuantity = Math.max(0, totalQuantity - remainingQuantity);
    const deliveryPercent = totalQuantity > 0
        ? Math.min(100, Math.max(0, Math.round((deliveredQuantity / totalQuantity) * 100)))
        : 0;

    const baseCost = Number(order.cost || 0);
    const retailPricePer1k = Number(service?.price_per_1000 || 0);

    // Sanitize target URL to avoid internal route redirects on external links
    const formattedTargetUrl = order.target
        ? (order.target.startsWith("http://") || order.target.startsWith("https://")
            ? order.target
            : `https://${order.target}`)
        : null;

    const formattedDate = order.created_at
        ? new Date(order.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : null;

    return (
        <main className="min-h-screen bg-black text-white px-6 py-24">
            <div className="mx-auto w-full max-w-3xl space-y-8">
                <Link
                    href="/s/orders"
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition group"
                >
                    <FiChevronLeft className="transform group-hover:-translate-x-0.5 transition-transform" />
                    Back to Orders
                </Link>

                <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-5">
                            {PlatformIcon ? (
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-black shrink-0">
                                    <PlatformIcon className={`h-8 w-8 ${platformConfig?.color}`} />
                                </div>
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 shrink-0 text-zinc-500 font-mono text-xs uppercase font-bold">
                                    SMM
                                </div>
                            )}
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-bold">
                                    {service?.platform || "Service Package"}
                                </p>
                                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
                                    {service?.title || "Order Details"}
                                </h1>
                                {service?.description && (
                                    <p className="mt-2 max-w-xl text-zinc-400 text-sm leading-relaxed">
                                        {service.description}
                                    </p>
                                )}
                                {formattedDate && (
                                    <p className="mt-2 text-xs text-zinc-500">
                                        Placed on {formattedDate}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className={`inline-flex items-center gap-3 rounded-2xl px-5 py-3 ${currentStatus.bg} ${currentStatus.color} self-start lg:self-auto shrink-0 border border-white/5`}>
                            <StatusIcon className={["processing", "in_progress"].includes(order.status) ? "animate-spin" : ""} />
                            <span className="font-semibold text-sm capitalize tracking-wide">
                                {order.status?.replace("_", " ")}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2 space-y-6">
                        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-5">
                            <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
                                Target Details
                            </h2>

                            <div className="grid grid-cols-2 gap-4 border-b border-zinc-900 pb-5">
                                <div>
                                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider">
                                        Platform
                                    </p>
                                    <p className="mt-1 text-base font-semibold capitalize text-zinc-200">
                                        {service?.platform || "—"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider">
                                        Service Type
                                    </p>
                                    <p className="mt-1 text-base font-semibold text-zinc-200">
                                        {service?.service_type || "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                                    Target Link
                                </label>
                                {formattedTargetUrl ? (
                                    <a
                                        href={formattedTargetUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black p-4 text-sm font-mono hover:border-zinc-700 transition text-zinc-300 group"
                                    >
                                        <span className="truncate mr-4">{order.target}</span>
                                        <FiExternalLink className="text-zinc-500 group-hover:text-white shrink-0 transition" />
                                    </a>
                                ) : (
                                    <div className="rounded-xl border border-zinc-800 bg-black p-4 text-sm font-mono text-zinc-500">
                                        No target URL available
                                    </div>
                                )}
                            </div>
                        </div>

                        {!["refunded", "canceled"].includes(order.status) && (
                            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        Delivery Progress
                                    </h2>
                                    <span className="text-xs text-zinc-400 font-mono font-bold">
                                        {deliveryPercent}% Complete
                                    </span>
                                </div>

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
                                            Start Count
                                        </div>
                                        <div className="text-base font-bold font-mono mt-0.5 text-white">
                                            {order.start_count ?? "---"}
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

                    <div className="space-y-6 w-full">
                        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-4">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                Invoice
                            </h2>

                            <div className="space-y-3 pt-1">
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>Rate (per 1k):</span>
                                    <span className="font-mono text-zinc-300">
                                        ${retailPricePer1k.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-zinc-400">
                                    <span>Quantity:</span>
                                    <span className="font-mono text-zinc-300">
                                        x{totalQuantity}
                                    </span>
                                </div>
                                <hr className="border-zinc-900 my-1" />
                                <div className="flex justify-between items-baseline pt-1">
                                    <span className="text-xs font-medium text-white uppercase tracking-wider">
                                        Total Charged:
                                    </span>
                                    <span className="text-2xl font-black text-green-400 font-mono">
                                        ${baseCost.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-2 text-[10px] leading-relaxed text-zinc-500 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900/50 font-mono">
                                Order Reference:
                                <br />
                                <span className="text-zinc-400 text-[11px] block mt-0.5 truncate">
                                    {order.tracking_code ||
                                        order.id.replace(/-/g, "").substring(0, 12).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <Link
                            href={`/account/support?reason=order&order_id=${order.id}&code=${encodeURIComponent(order.tracking_code || order.id)}`}
                            className="flex items-center justify-center w-full px-4 py-3.5 rounded-xl border border-zinc-800 hover:bg-zinc-950 hover:border-zinc-700 transition-all font-bold text-xs tracking-wider uppercase text-center text-zinc-400 hover:text-white"
                        >
                            Report Issue With Order
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}