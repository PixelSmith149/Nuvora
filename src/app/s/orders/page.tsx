import { Suspense } from "react";
import { OrderFilters } from "@/components/orders/order-filters";
import { OrderStats } from "@/components/orders/order-stats";
import { OrdersTable } from "@/components/orders/orders-table";
import { getOrderStats } from "@/lib/orders/getOrderStats";
import { getUserOrders } from "@/lib/orders/getUserOrders";
import { createClient } from "@/lib/supabase/server";

interface OrdersPageProps {
    searchParams: Promise<{
        page?: string;
        status?: string;
        search?: string;
    }>;
}

const PAGE_SIZE = 10;

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
    const params = await searchParams;

    const page = Math.max(1, Number(params.page ?? "1"));
    const status = params.status || undefined;
    const search = params.search || undefined;

    // 1. Resolve Auth Context
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Authentication required to view orders.");
    }

    // 2. Concurrently fetch paginated orders + global stats from Postgres
    const [{ data: rawOrders, totalPages }, stats] = await Promise.all([
        getUserOrders({
            userId: user.id,
            page,
            limit: PAGE_SIZE,
            status,
            search,
        }),
        getOrderStats(user.id),
    ]);

    // 3. Map backend schema to UI format
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
                <Suspense key={`${page}-${status}-${search}`}>
                    <OrdersTable
                        orders={mappedOrders}
                        totalPages={totalPages}
                        currentPage={page}
                    />
                </Suspense>
            </div>
        </main>
    );
}