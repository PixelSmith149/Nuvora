import { type NextRequest, NextResponse } from "next/server";
import { getProviderOrdersStatus } from "@/lib/providers/provider.service";
import { createClient } from "@/lib/supabase/server";
import { creditWallet } from "@/lib/wallet/creditWallet";

export async function GET(request: NextRequest) {
    try {
        // 1. Security Check
        const authHeader = request.headers.get("authorization");
        if (
            process.env.CRON_SECRET &&
            authHeader !== `Bearer ${process.env.CRON_SECRET}`
        ) {
            return NextResponse.json(
                { error: "Unauthorized access path." },
                { status: 401 },
            );
        }

        const supabase = await createClient();

        // 2. Fetch ALL non-final orders (Include pending, processing, in_progress)
        const { data: activeOrders, error: ordersError } = await supabase
            .from("orders")
            .select(`
                id,
                provider_order_id,
                total_price,
                quantity,
                wallet_id,
                tracking_code,
                providers (
                  id,
                  api_url,
                  api_key
                )
            `)
            .in("status", ["pending", "processing", "in_progress"]) // FIX #1: Added pending & in_progress
            .not("provider_order_id", "is", null);

        if (ordersError) throw ordersError;
        if (!activeOrders || activeOrders.length === 0) {
            return NextResponse.json(
                { message: "No active processing orders to synchronize." },
                { status: 200 },
            );
        }

        // 3. Group open orders by provider
        const providerGroups: Record<
            string,
            { provider: any; orderIds: string[]; localMap: Record<string, any> }
        > = {};

        activeOrders.forEach((order) => {
            const provider = Array.isArray(order.providers)
                ? order.providers[0]
                : order.providers;

            if (!provider || !order.provider_order_id) return;

            if (!providerGroups[provider.id]) {
                providerGroups[provider.id] = {
                    provider,
                    orderIds: [],
                    localMap: {},
                };
            }

            providerGroups[provider.id].orderIds.push(order.provider_order_id);
            providerGroups[provider.id].localMap[order.provider_order_id] = order;
        });

        let synchronizedCount = 0;

        // 4. Batch Sync Execution Loop
        for (const providerId of Object.keys(providerGroups)) {
            const { provider, orderIds, localMap } = providerGroups[providerId];

            try {
                const providerStatuses = await getProviderOrdersStatus(
                    provider.api_url,
                    provider.api_key,
                    orderIds,
                );

                for (const externalId of Object.keys(providerStatuses)) {
                    const apiMetrics = providerStatuses[externalId];
                    const localOrderRecord = localMap[externalId];

                    if (!localOrderRecord || apiMetrics?.error) continue;

                    const upstreamStatus = String(apiMetrics.status).toLowerCase();
                    let targetLocalStatus = "processing";
                    let refundAmount = 0;

                    if (
                        upstreamStatus === "completed" ||
                        upstreamStatus === "success"
                    ) {
                        targetLocalStatus = "completed";
                    } else if (
                        upstreamStatus === "refunded" ||
                        upstreamStatus === "cancelled" ||
                        upstreamStatus === "canceled"
                    ) {
                        targetLocalStatus = "canceled";
                        refundAmount = Number(localOrderRecord.total_price);
                    } else if (upstreamStatus === "partial") {
                        targetLocalStatus = "partial";
                        // FIX #3: Calculate prorated refund for partial orders based on remains
                        const remainsCount = Number(apiMetrics.remains || 0);
                        const totalQty = Number(localOrderRecord.quantity || 1);
                        const unitPrice = Number(localOrderRecord.total_price) / totalQty;
                        refundAmount = Math.max(0, remainsCount * unitPrice);
                    } else if (
                        upstreamStatus === "in progress" ||
                        upstreamStatus === "in_progress" ||
                        upstreamStatus === "pending"
                    ) {
                        targetLocalStatus = "in_progress";
                    }

                    // 5. Trigger Compensatory Refund if applicable
                    if (refundAmount > 0) {
                        console.warn(
                            `[Cron Sync] Order #${localOrderRecord.tracking_code} marked ${upstreamStatus} upstream. Refunding ${refundAmount}.`,
                        );

                        await creditWallet({
                            walletId: localOrderRecord.wallet_id,
                            amount: refundAmount,
                            type: "refund",
                            description: `Automated Refund (${targetLocalStatus}): Order processed as ${upstreamStatus} by provider network.`,
                            referenceType: "boost_order",
                            referenceId: localOrderRecord.id,
                        });
                    }

                    // FIX #2: Explicitly parse numbers and pass null instead of undefined
                    const parsedStartCount =
                        apiMetrics.start_count !== undefined && apiMetrics.start_count !== null
                            ? Number(apiMetrics.start_count)
                            : null;

                    const parsedRemains =
                        apiMetrics.remains !== undefined && apiMetrics.remains !== null
                            ? Number(apiMetrics.remains)
                            : null;

                    // 6. Update Database
                    await supabase
                        .from("orders")
                        .update({
                            status: targetLocalStatus,
                            start_count: parsedStartCount,
                            remains: parsedRemains,
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", localOrderRecord.id);

                    synchronizedCount++;
                }
            } catch (grpErr) {
                console.error(
                    `[Cron Sync Error] Error updating batch groups for provider profile ID: ${providerId}`,
                    grpErr,
                );
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: `Successfully synchronized operational metrics for ${synchronizedCount} tracking records.`,
            },
            { status: 200 },
        );
    } catch (error: any) {
        console.error(
            "CRITICAL: Global Cron Synchronization Routine Failure:",
            error,
        );
        return NextResponse.json(
            {
                error:
                    error?.message || "Internal sync failure wrapper execution error.",
            },
            { status: 500 },
        );
    }
}