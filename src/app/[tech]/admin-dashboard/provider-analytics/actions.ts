"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface ProviderItem {
	id: string;
	name: string;
}

export interface ModalAnalysisPayload {
	servicesList: {
		id: string;
		title: string;
		platform: string;
		wholesaleRate: number;
		retailPrice: number;
	}[];
	sumOfRates: number;
	totalMoneyConsumedByWholesaler: number;
	totalCustomerSpend: number;
}

/**
 * Action 1: Fetch list of providers for the parent dashboard page
 */
export async function fetchRootProviders(): Promise<ProviderItem[]> {
	const { data, error } = await supabase
		.from("providers")
		.select("id, name")
		.order("name", { ascending: true });

	if (error)
		throw new Error(`Failed to fetch baseline providers: ${error.message}`);
	return data || [];
}

/**
 * Action 2: Perform targeted cross-table matching for the selected provider
 */
export async function fetchProviderDetailedMetrics(
	providerId: string,
): Promise<ModalAnalysisPayload> {
	// 1. Get all provider services belonging to this provider
	const { data: pServices, error: pse } = await supabase
		.from("provider_services")
		.select("id, rate")
		.eq("provider_id", providerId);
	if (pse) throw new Error(pse.message);

	const providerServiceIds = pServices?.map((ps) => ps.id) || [];
	const rateMap = new Map<string, number>(
		pServices?.map((ps) => [ps.id, Number(ps.rate) || 0]),
	);

	// Sum of baseline wholesale rates for all services belonging to this provider
	const sumOfRates =
		pServices?.reduce((sum, ps) => sum + (Number(ps.rate) || 0), 0) || 0;

	if (providerServiceIds.length === 0) {
		return {
			servicesList: [],
			sumOfRates: 0,
			totalMoneyConsumedByWholesaler: 0,
			totalCustomerSpend: 0,
		};
	}

	// 2. Fetch storefront services mapping to these provider services
	const { data: sServices, error: sse } = await supabase
		.from("services")
		.select("id, provider_service_id, title, platform, price_per_1000")
		.in("provider_service_id", providerServiceIds);
	if (sse) throw new Error(sse.message);

	const storefrontServiceIds = sServices?.map((ss) => ss.id) || [];

	// Transform into UI block representation
	const servicesList =
		sServices?.map((ss) => ({
			id: ss.id,
			title: ss.title,
			platform: ss.platform,
			wholesaleRate: rateMap.get(ss.provider_service_id!) || 0,
			retailPrice: Number(ss.price_per_1000) || 0,
		})) || [];

	if (storefrontServiceIds.length === 0) {
		return {
			servicesList,
			sumOfRates,
			totalMoneyConsumedByWholesaler: 0,
			totalCustomerSpend: 0,
		};
	}

	// 3. Query all historical orders processed under these specific storefront services
	const { data: orders, error: oer } = await supabase
		.from("orders")
		.select("service_id, quantity, status")
		.in("service_id", storefrontServiceIds);
	if (oer) throw new Error(oer.message);

	let totalMoneyConsumedByWholesaler = 0;
	let totalCustomerSpend = 0;

	orders?.forEach((order) => {
		if (order.status === "cancelled" || order.status === "failed") return;

		const quantity = Number(order.quantity) || 0;
		const targetService = sServices.find((s) => s.id === order.service_id);

		if (targetService) {
			const wholesaleRate =
				rateMap.get(targetService.provider_service_id!) || 0;
			const retailPrice = Number(targetService.price_per_1000) || 0;

			// Compute consumption metrics based on order batches of 1000 units
			totalMoneyConsumedByWholesaler += (quantity / 1000) * wholesaleRate;
			totalCustomerSpend += (quantity / 1000) * retailPrice;
		}
	});

	return {
		servicesList,
		sumOfRates,
		totalMoneyConsumedByWholesaler,
		totalCustomerSpend,
	};
}
