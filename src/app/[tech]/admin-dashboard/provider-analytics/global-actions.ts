"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Calculates the exact real-time profit balance across all services and orders
 */
export async function fetchPlatformLiveProfitBalance(): Promise<number> {
	// 1. Fetch only the core operational slices required for the equation
	const [provServicesRes, storeServicesRes, ordersRes] = await Promise.all([
		supabase.from("provider_services").select("id, rate"),
		supabase.from("services").select("id, provider_service_id, price_per_1000"),
		supabase.from("orders").select("service_id, quantity, status"),
	]);

	if (provServicesRes.error) throw new Error(provServicesRes.error.message);
	if (storeServicesRes.error) throw new Error(storeServicesRes.error.message);
	if (ordersRes.error) throw new Error(ordersRes.error.message);

	const providerServices = provServicesRes.data || [];
	const storeServices = storeServicesRes.data || [];
	const orders = ordersRes.data || [];

	// 2. Map provider service rates for quick O(1) matching
	const wholesaleRateMap = new Map<string, number>(
		providerServices.map((ps) => [ps.id, Number(ps.rate) || 0]),
	);

	// 3. Map storefront services to their combined cost/retail parameters
	const serviceFinancialMap = new Map<
		string,
		{ wholesaleRate: number; retailPrice: number }
	>();
	storeServices.forEach((ss) => {
		if (
			ss.provider_service_id &&
			wholesaleRateMap.has(ss.provider_service_id)
		) {
			serviceFinancialMap.set(ss.id, {
				wholesaleRate: wholesaleRateMap.get(ss.provider_service_id)!,
				retailPrice: Number(ss.price_per_1000) || 0,
			});
		}
	});

	// 4. Compute the running net profit spread across the active orders ledger
	let totalPlatformProfit = 0;

	orders.forEach((order) => {
		if (order.status === "cancelled" || order.status === "failed") return;

		const financialContext = serviceFinancialMap.get(order.service_id);
		if (!financialContext) return;

		const quantity = Number(order.quantity) || 0;
		const wholesaleCost = (quantity / 1000) * financialContext.wholesaleRate;
		const retailRevenue = (quantity / 1000) * financialContext.retailPrice;

		totalPlatformProfit += retailRevenue - wholesaleCost;
	});

	return totalPlatformProfit;
}
