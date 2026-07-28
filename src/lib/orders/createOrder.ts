"use server";

// FIXED: Import directly from your single, error-handled service utility file
import { createProviderOrder } from "@/lib/providers/provider.service";
import { calculateOrderAmount } from "@/lib/services/servicePricing";
import { createClient } from "@/lib/supabase/server";
import { creditWallet } from "@/lib/wallet/creditWallet";
import { debitWallet } from "@/lib/wallet/debitWallet";
import { getWalletBalance } from "@/lib/wallet/getWalletBalance";

interface CreateOrderParams {
	serviceId: string;
	quantity: number;
	target: string;
}

export async function createOrder({
	serviceId,
	quantity,
	target,
}: CreateOrderParams) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("Authentication required.");
	}

	// 1. Fetch the user's active wallet
	const { data: wallet, error: walletError } = await supabase
		.from("wallets")
		.select("id")
		.eq("user_id", user.id)
		.single();

	if (walletError || !wallet) {
		throw new Error("Wallet not found. Please setup a wallet configuration.");
	}

	// Fetch true balance using your wallet helper utility
	const balance = await getWalletBalance(wallet.id);

	// 2. Fetch the target retail service package
	const { data: service, error: serviceError } = await supabase
		.from("services")
		.select("*")
		.eq("id", serviceId)
		.eq("is_active", true) // Safeguard column string name check (is_active vs active)
		.single();

	if (serviceError || !service) {
		throw new Error("The selected service is currently unavailable.");
	}

	// 3. Resolve the underlying wholesale provider mapping
	const { data: providerService, error: pServiceError } = await supabase
		.from("provider_services")
		.select("*")
		.eq("id", service.provider_service_id)
		.eq("active", true)
		.single();

	if (pServiceError || !providerService) {
		throw new Error("Wholesale configuration mapping error for this service.");
	}

	// Validate quantities against wholesale vendor guardrails
	if (
		quantity < providerService.min_qty ||
		quantity > providerService.max_qty
	) {
		throw new Error(
			`Invalid quantity. Order bounds must be between ${providerService.min_qty} and ${providerService.max_qty}.`,
		);
	}

	// 4. Resolve provider integration authentication keys
	const { data: provider, error: providerError } = await supabase
		.from("providers")
		.select("*")
		.eq("id", providerService.provider_id)
		.eq("active", true)
		.single();

	if (providerError || !provider) {
		throw new Error("External provider network gateway is currently offline.");
	}

	// 5. Calculate final customer cost
	const cost = calculateOrderAmount(
		Number(service.retail_rate || service.price_per_1000),
		quantity,
	);

	if (balance < cost) {
		throw new Error(
			"Insufficient funds to execute this order boosting request.",
		);
	}

	// ==========================================
	// TRANSACTION STAGE 1: DEBIT USER & WRITE LOCAL RECORD FIRST
	// ==========================================

	// Debit customer wallet balance
	await debitWallet({
		walletId: wallet.id,
		amount: cost,
		type: "purchase",
		description: `SMM Boosting: ${service.name || service.title}`,
		referenceType: "boost_order",
	});

	// Stamp the pending order directly into the database
	const { data: order, error: orderCreateError } = await supabase
		.from("orders")
		.insert({
			user_id: user.id,
			service_id: service.id,
			provider_id: provider.id,
			target_link: target, // Sync database map column string target_link
			quantity,
			total_price: cost, // Sync database map column string total_price
			status: "pending",
		})
		.select()
		.single();

	if (orderCreateError || !order) {
		// Immediate internal mitigation fallback: refund wallet if database record drops here
		await creditWallet({
			walletId: wallet.id,
			amount: cost,
			type: "refund",
			description: "Database execution failure backup rollback",
			referenceType: "boost_order",
		});
		throw new Error("System execution failure creating local order receipt.");
	}

	// ==========================================
	// TRANSACTION STAGE 2: TARGET OUTBOUND WHOLESALER API
	// ==========================================
	try {
		// FIXED: Invoked createProviderOrder using flat positional parameters as designed
		// in our production-safe provider.service file
		const result = await createProviderOrder(
			provider.api_url,
			provider.api_key,
			providerService.external_service_id,
			target,
			quantity,
		);

		const assignedExternalId = String(result.providerOrderId);

		// Update order receipt to active processing state
		await supabase
			.from("orders")
			.update({
				provider_order_id: assignedExternalId,
				provider_response: result.raw || result,
				status: "processing",
			})
			.eq("id", order.id);

		return {
			success: true,
			orderId: order.id,
			trackingCode: order.tracking_code || order.id,
		};
	} catch (error: any) {
		console.error(
			"CRITICAL: Wholesaler order submission failed. Initializing automatic refund engine.",
			error,
		);

		// ==========================================
		// TRANSACTION STAGE 3: ISOLATED AUTO-REFUND COMPENSATOR
		// ==========================================
		await creditWallet({
			walletId: wallet.id,
			amount: cost,
			type: "refund",
			description: `Refund: Wholesaler failure for Order ${order.tracking_code || order.id}`,
			referenceType: "boost_order",
			referenceId: order.id,
		});

		await supabase
			.from("orders")
			.update({
				status: "refunded",
				provider_response: {
					error: error?.message || "Unknown external provider API fault",
				},
			})
			.eq("id", order.id);

		throw new Error(
			error?.message ||
				"External API provider failure. Funds have been refunded to your wallet.",
		);
	}
}
