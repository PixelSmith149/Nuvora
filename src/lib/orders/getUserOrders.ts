import { createClient } from "@/lib/supabase/server";

export interface MarketplaceOrder {
	id: string;

	serviceName: string;

	providerName: string;

	targetUrl: string;

	quantity: number;

	chargeAmount: number;

	providerCost: number;

	profitAmount: number;

	startCount: number | null;

	remains: number | null;

	status:
		| "pending"
		| "processing"
		| "completed"
		| "partial"
		| "cancelled"
		| "refunded";

	createdAt: string;

	updatedAt: string;
}

export async function getUserOrders(userId: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("orders")
		.select(`
      *,
      services (
        title,
        platform,
        service_type
      )
    `)
		.eq("user_id", userId)
		.order("created_at", {
			ascending: false,
		});

	if (error) {
		throw error;
	}

	return data ?? [];
}
