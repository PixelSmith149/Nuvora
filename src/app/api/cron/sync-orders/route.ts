import { type NextRequest, NextResponse } from "next/server";
import { getProviderOrdersStatus } from "@/lib/providers/provider.service";
import { createClient } from "@/lib/supabase/server";
import { creditWallet } from "@/lib/wallet/creditWallet";

export async function GET(request: NextRequest) {
	try {
		// 1. Security Check: Enforce a secret token guardrail so random internet users can't trigger your cron sync
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

		// 2. Pull all active processing orders alongside their provider credential records
		const { data: activeOrders, error: ordersError } = await supabase
			.from("orders")
			.select(`
        id,
        provider_order_id,
        total_price,
        wallet_id,
        tracking_code,
        providers (
          id,
          api_url,
          api_key
        )
      `)
			.eq("status", "processing");

		if (ordersError) throw ordersError;
		if (!activeOrders || activeOrders.length === 0) {
			return NextResponse.json(
				{ message: "No active processing orders to synchronize." },
				{ status: 200 },
			);
		}

		// 3. Group open orders by provider to utilize optimized batch-lookup lookups
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

		// 4. Run through grouped collections and execute the status API synchronization sweeps
		for (const providerId of Object.keys(providerGroups)) {
			const { provider, orderIds, localMap } = providerGroups[providerId];

			try {
				// Query the upstream provider for status updates in batches
				const providerStatuses = await getProviderOrdersStatus(
					provider.api_url,
					provider.api_key,
					orderIds,
				);

				// Process individual order feedbacks returned from the API payload context
				for (const externalId of Object.keys(providerStatuses)) {
					const apiMetrics = providerStatuses[externalId];
					const localOrderRecord = localMap[externalId];

					if (!localOrderRecord || apiMetrics?.error) continue;

					// Normalize the incoming string map status state fields from the provider
					const upstreamStatus = String(apiMetrics.status).toLowerCase();
					let targetLocalStatus = "processing";
					let shouldTriggerRefund = false;

					if (upstreamStatus === "completed" || upstreamStatus === "success") {
						targetLocalStatus = "completed";
					} else if (
						upstreamStatus === "refunded" ||
						upstreamStatus === "cancelled" ||
						upstreamStatus === "partial"
					) {
						targetLocalStatus = "refunded";
						shouldTriggerRefund = true;
					}

					// 5. If provider failed or cancelled the order, process an automatic compensatory refund
					if (shouldTriggerRefund) {
						console.warn(
							`[Cron Sync] Order #${localOrderRecord.tracking_code} was marked ${upstreamStatus} upstream. Initiating system refund loop.`,
						);

						await creditWallet({
							walletId: localOrderRecord.wallet_id,
							amount: Number(localOrderRecord.total_price),
							type: "refund",
							description: `Automated Refund: Order cancelled/partialed by provider network gateway (${upstreamStatus})`,
							referenceType: "boost_order",
							referenceId: localOrderRecord.id,
						});
					}

					// 6. Update database record with fresh live telemetry counts
					await supabase
						.from("orders")
						.update({
							status: targetLocalStatus,
							start_count: apiMetrics.start_count
								? Number(apiMetrics.start_count)
								: undefined,
							remains:
								apiMetrics.remains !== undefined
									? Number(apiMetrics.remains)
									: undefined,
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
