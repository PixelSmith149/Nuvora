import { getProviderOrdersStatus } from "@/lib/providers/provider.service";
import { createClient } from "@/lib/supabase/server";
import { creditWallet } from "@/lib/wallet/creditWallet";

// Type definition matching the standard SMM panel responses
interface SMMStatusItem {
	status: string;
	start_count?: string | number;
	remains?: string | number;
	[key: string]: any;
}

interface SMMBatchResponse {
	[orderId: string]: SMMStatusItem;
}

function normalizeStatus(status: string): string {
	const value = status.toLowerCase();

	if (value.includes("complete")) return "completed";
	if (value.includes("process") || value.includes("progress"))
		return "processing";
	if (value.includes("partial")) return "partial";
	if (value.includes("cancel")) return "canceled";
	if (value.includes("refund")) return "refunded";

	return "pending";
}

export async function syncOrderStatuses() {
	const supabase = await createClient();

	// Explicitly initialize the tracking counter at the start of the execution scope
	let updatedCount = 0;

	// 1. Fetch active orders from your Supabase architecture
	const { data: orders, error: fetchError } = await supabase
		.from("orders")
		.select(`
      id,
      tracking_code,
      cost,
      status,
      provider_order_id,
      user_id,
      services (
        id,
        provider_services (
          providers (
            id,
            api_url,
            api_key
          )
        )
      ),
      wallets:user_id (
        id
      )
    `)
		.in("status", ["pending", "processing", "inprogress"])
		.not("provider_order_id", "is", null);

	if (fetchError || !orders || orders.length === 0) {
		if (fetchError)
			console.error("Error fetching sync orders:", fetchError.message);
		return { success: true, updatedCount: 0 };
	}

	// 2. Map and group orders by providerId safely resolving nested object/array schemas
	const providerGroups = new Map<string, any[]>();

	for (const order of orders) {
		try {
			// Cast down the nested relationship chains to clean any types to prevent deep compiler inference errors
			const serviceData = (
				Array.isArray(order.services) ? order.services[0] : order.services
			) as any;
			if (!serviceData) continue;

			const providerServiceData = (
				Array.isArray(serviceData.provider_services)
					? serviceData.provider_services[0]
					: serviceData.provider_services
			) as any;
			if (!providerServiceData) continue;

			const providerInfo = (
				Array.isArray(providerServiceData.providers)
					? providerServiceData.providers[0]
					: providerServiceData.providers
			) as any;

			if (!providerInfo?.id || !order.provider_order_id) continue;

			const providerId = providerInfo.id;
			const existing = providerGroups.get(providerId) || [];

			existing.push({
				...order,
				providerApiUrl: providerInfo.api_url,
				providerApiKey: providerInfo.api_key,
			});

			providerGroups.set(providerId, existing);
		} catch (err) {
			console.error(
				`Skipping order ${order.tracking_code} due to relational mapping structural error`,
				err,
			);
		}
	}

	// 3. Process each provider's bulk order queue
	for (const group of providerGroups.values()) {
		const providerApiUrl = group[0].providerApiUrl;
		const providerApiKey = group[0].providerApiKey;

		const providerOrderIds = group.map((o) => String(o.provider_order_id));

		try {
			// Execute the bulk comma-delimited call built inside your provider.service.ts
			const rawStatuses = await getProviderOrdersStatus(
				providerApiUrl,
				providerApiKey,
				providerOrderIds,
			);

			// Force type-cast to ensure compile validation passes
			const statuses = rawStatuses as SMMBatchResponse;
			if (!statuses) continue;

			for (const order of group) {
				const statusData = statuses[order.provider_order_id];
				if (!statusData) continue;

				const nextStatus = normalizeStatus(statusData.status);
				const userWallet = Array.isArray(order.wallets)
					? order.wallets[0]
					: order.wallets;

				// 4. Perform customer credit refunds if order failed delivery parameters
				if (
					(nextStatus === "canceled" || nextStatus === "refunded") &&
					order.status !== "refunded"
				) {
					if (userWallet?.id) {
						await creditWallet({
							walletId: userWallet.id,
							amount: Number(order.cost),
							type: "refund",
							description: `Refund: Order ${order.tracking_code} canceled by provider`,
							referenceId: order.id,
							referenceType: "boost_order",
						});
					}
				}

				// 5. Update the live database status changes
				await supabase
					.from("orders")
					.update({
						status: nextStatus === "canceled" ? "refunded" : nextStatus,
						start_count: statusData.start_count
							? Number(statusData.start_count)
							: undefined,
						remains: statusData.remains
							? Number(statusData.remains)
							: undefined,
						provider_response: statusData,
					})
					.eq("id", order.id);

				updatedCount++;
			}
		} catch (apiError) {
			console.error(
				`Failed executing batch lookup query for provider endpoint:`,
				apiError,
			);
		}
	}

	return { success: true, updatedCount };
}
