import { Suspense } from "react";
import { OrderFilters } from "@/components/orders/order-filters";
import { OrderStats } from "@/components/orders/order-stats";

import { OrdersTable } from "@/components/orders/orders-table";
import { getUserOrders } from "@/lib/orders/getUserOrders";
import { createClient } from "@/lib/supabase/server";

interface OrdersPageProps {
	searchParams: Promise<{
		page?: string;
		status?: string;
		search?: string;
	}>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
	const params = await searchParams;

	const page = Number(params.page ?? "1");
	const status = params.status || undefined;
	const search = params.search || undefined;

	// 1. Resolve the secure authenticated session context directly on the server
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("Authentication required to view orders.");
	}

	// 2. Fetch data directly using your existing file utility
	const rawOrders = await getUserOrders(user.id);

	// 3. Map database column configurations to match the formatting required by <OrdersTable />
	const mappedOrders = rawOrders.map((order: any) => ({
		id: order.id,
		serviceName: order.services?.title ?? "Deleted Service",
		providerName: order.services?.platform ?? "-",
		targetUrl: order.target ?? "",
		quantity: Number(order.quantity || 0),
		chargeAmount: Number(order.cost || 0),
		providerCost: 0,
		profitAmount: 0,
		startCount: order.start_count ?? null,
		remains: order.remains ?? null,
		status: order.status || "pending",
		createdAt: order.created_at,
		updatedAt: order.created_at,
	}));

	// 4. Calculate stats summary numbers dynamically out of the fetched array rows
	const stats = {
		total: mappedOrders.length,
		pending: mappedOrders.filter((o) => o.status === "pending").length,
		processing: mappedOrders.filter((o) => o.status === "processing").length,
		completed: mappedOrders.filter((o) => o.status === "completed").length,
		cancelled: mappedOrders.filter(
			(o) => o.status === "canceled" || o.status === "cancelled",
		).length,
	};

	return (
		<main className="min-h-screen bg-black text-white">
			<div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
				{/* Header */}
				<section>
					<h1 className="text-4xl font-bold">Orders</h1>
					<p className="mt-2 text-zinc-400">
						Track order status, fulfillment progress and delivery history.
					</p>
				</section>

				{/* Filters */}
				<Suspense>
					<OrderFilters currentStatus={status} currentSearch={search} />
				</Suspense>

				{/* Stats */}
				<Suspense>
					<OrderStats
						total={stats.total}
						pending={stats.pending}
						processing={stats.processing}
						completed={stats.completed}
						cancelled={stats.cancelled}
					/>
				</Suspense>

				{/* Table */}
				<Suspense>
					<OrdersTable
						orders={mappedOrders}
						totalPages={1} // Defaults to 1 since current getUserOrders query returns the full list
						currentPage={page}
					/>
				</Suspense>
			</div>
		</main>
	);
}
