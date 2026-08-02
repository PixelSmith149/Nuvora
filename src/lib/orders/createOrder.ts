"use server";

import { createProviderOrder } from "@/lib/providers/provider.service";
import { calculateOrderAmount } from "@/lib/services/servicePricing";
import { isAutoService } from "@/lib/services/serviceMode";
import { createClient } from "@/lib/supabase/server";

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

  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) {
    throw new Error("Wallet not found. Please setup a wallet configuration.");
  }

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .eq("active", true)
    .single();

  if (serviceError || !service) {
    console.error("CREATE_ORDER: Service fetch error:", serviceError);
    throw new Error("The selected service is currently unavailable.");
  }

  // Hard block Auto until continuous-billing is built
  if (isAutoService(service.title || service.name || "")) {
    throw new Error(
      "Auto/subscription services are temporarily unavailable. Please choose a standard (non-Auto) service.",
    );
  }

  const { data: providerService, error: pServiceError } = await supabase
    .from("provider_services")
    .select("*")
    .eq("id", service.provider_service_id)
    .eq("active", true)
    .single();

  if (pServiceError || !providerService) {
    console.error("CREATE_ORDER: Wholesale mapping error:", pServiceError);
    throw new Error("Wholesale configuration mapping error for this service.");
  }

  if (
    quantity < providerService.min_qty ||
    quantity > providerService.max_qty
  ) {
    throw new Error(
      `Invalid quantity. Order bounds must be between ${providerService.min_qty} and ${providerService.max_qty}.`,
    );
  }

  const { data: provider, error: providerError } = await supabase
    .from("providers")
    .select("*")
    .eq("id", providerService.provider_id)
    .eq("active", true)
    .single();

  if (providerError || !provider) {
    console.error("CREATE_ORDER: Provider gateway error:", providerError);
    throw new Error("External provider network gateway is currently offline.");
  }

  const retailRate = Number(service.price_per_1000 ?? 0);

  if (!Number.isFinite(retailRate) || retailRate <= 0) {
    throw new Error(
      "This service has no valid retail price configured (price_per_1000).",
    );
  }

  const orderCost = calculateOrderAmount(retailRate, quantity);

  if (!Number.isFinite(orderCost) || orderCost <= 0) {
    throw new Error("Invalid order cost calculated.");
  }

  const { data: order, error: orderCreateError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      service_id: service.id,
      provider_id: provider.id,
      target,
      quantity,
      cost: orderCost,
      status: "pending",
    })
    .select()
    .single();

  if (orderCreateError || !order) {
    console.error("CREATE_ORDER: Failed to insert order record:", orderCreateError);
    throw new Error("System execution failure creating local order receipt.");
  }

  const { data: debitResult, error: debitError } = await supabase.rpc(
    "debit_wallet_for_purchase",
    {
      p_wallet_id: wallet.id,
      p_user_id: user.id,
      p_usd_amount: orderCost,
      p_description: `SMM Boosting: ${service.title || service.name || service.id}`,
      p_reference_id: order.id,
      p_reference_type: "boost_order",
      p_metadata: {
        service_id: service.id,
        provider_id: provider.id,
        quantity,
        target,
        order_id: order.id,
      },
    },
  );

  if (debitError) {
    console.error("CREATE_ORDER: Debit RPC failed:", debitError);

    await supabase
      .from("orders")
      .update({
        status: "failed",
        provider_response: { error: debitError.message },
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    throw new Error(
      debitError.message.includes("Insufficient")
        ? debitError.message
        : "Payment debit failed. Order has been canceled.",
    );
  }

  const ledgerId =
    debitResult && typeof debitResult === "object"
      ? (debitResult as any).ledger_id
      : null;

  try {
    const result = await createProviderOrder(
      provider.api_url,
      provider.api_key,
      providerService.external_service_id,
      target,
      quantity,
      // non-auto: no username / min / max / runs
    );

    const assignedExternalId = String(result.providerOrderId);

    await supabase
      .from("orders")
      .update({
        provider_order_id: assignedExternalId,
        provider_response: result.raw || result,
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return {
      success: true,
      orderId: order.id,
      trackingCode: order.tracking_code || order.id,
      ledgerId,
    };
  } catch (error: any) {
    console.error(
      "CRITICAL: Wholesaler order submission failed. Running refund RPC.",
      error,
    );

    const { error: refundError } = await supabase.rpc(
      "credit_wallet_for_refund",
      {
        p_wallet_id: wallet.id,
        p_usd_amount: orderCost,
        p_description: `Refund: Provider failure for Order ${order.tracking_code || order.id}`,
        p_reference_id: order.id,
        p_reference_type: "boost_order",
        p_metadata: {
          reason: error?.message || "provider_failure",
          order_id: order.id,
          original_ledger_id: ledgerId,
        },
      },
    );

    if (refundError) {
      console.error(
        "CATACLYSMIC: Debit succeeded, provider failed, refund RPC also failed",
        { orderId: order.id, refundError },
      );
    }

    await supabase
      .from("orders")
      .update({
        status: "refunded",
        provider_response: {
          error: error?.message || "Unknown external provider API fault",
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    throw new Error(
      error?.message ||
        "External API provider failure. Funds have been refunded to your wallet.",
    );
  }
}