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

function isInsufficientBalanceError(message: string): boolean {
  return /insufficient/i.test(message);
}

function mapDebitError(message: string): string {
  if (isInsufficientBalanceError(message)) {
    // Strip Postgres noise if present
    const cleaned = message
      .replace(/^.*insufficient/i, "Insufficient")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned.startsWith("Insufficient")
      ? cleaned
      : "Insufficient wallet balance for this order. Please top up and try again.";
  }
  return message || "Payment debit failed. No order was created.";
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

  // ── Wallet ──────────────────────────────────────────────
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) {
    throw new Error("Wallet not found. Please setup a wallet configuration.");
  }

  // Early balance read (clear UX; RPC remains source of truth)
  const { data: balanceRow } = await supabase
    .from("wallet_balances")
    .select("balance")
    .eq("wallet_id", wallet.id)
    .maybeSingle();

  const availableBalance = Number(balanceRow?.balance ?? 0);

  // ── Service ─────────────────────────────────────────────
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

  if (isAutoService(service.title || service.name || "")) {
    throw new Error(
      "Auto/subscription services are temporarily unavailable. Please choose a standard (non-Auto) service.",
    );
  }

  // ── Provider mapping ────────────────────────────────────
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

  // ── Cost ────────────────────────────────────────────────
  const retailRate = Number(service.price_per_1000 ?? 0);

  if (!Number.isFinite(retailRate) || retailRate <= 0) {
    throw new Error(
      "This service has no valid retail price configured (price_per_1000).",
    );
  }

  const orderCost = Number(
    calculateOrderAmount(retailRate, quantity).toFixed(4),
  );

  if (!Number.isFinite(orderCost) || orderCost <= 0) {
    throw new Error("Invalid order cost calculated.");
  }

  // Soft pre-check (no order row yet)
  if (availableBalance < orderCost) {
    throw new Error(
      `Insufficient wallet balance. Required: $${orderCost.toFixed(2)}, Available: $${availableBalance.toFixed(2)}. Please top up and try again.`,
    );
  }

  // ── STAGE 1: Debit FIRST (no order row on failure) ──────
  // Use a temporary reference id so ledger can link later
  const { data: debitResult, error: debitError } = await supabase.rpc(
    "debit_wallet_for_purchase",
    {
      p_wallet_id: wallet.id,
      p_user_id: user.id,
      p_usd_amount: orderCost,
      p_description: `SMM Boosting: ${service.title || service.name || service.id}`,
      p_reference_id: null, // filled after order exists if your RPC allows null
      p_reference_type: "boost_order",
      p_metadata: {
        service_id: service.id,
        provider_id: provider.id,
        quantity,
        target,
        phase: "pre_order_debit",
      },
    },
  );

  if (debitError) {
    console.error("CREATE_ORDER: Debit RPC failed:", debitError);
    throw new Error(mapDebitError(debitError.message || ""));
  }

  const ledgerId =
    debitResult && typeof debitResult === "object"
      ? ((debitResult as any).ledger_id as string | null)
      : null;

  // ── STAGE 2: Create order only after successful debit ───
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
    console.error(
      "CREATE_ORDER: Order insert failed after debit — refunding",
      orderCreateError,
    );

    await supabase.rpc("credit_wallet_for_refund", {
      p_wallet_id: wallet.id,
      p_usd_amount: orderCost,
      p_description: "Refund: order record could not be created",
      p_reference_id: null,
      p_reference_type: "boost_order",
      p_metadata: {
        reason: "order_insert_failed",
        original_ledger_id: ledgerId,
      },
    });

    throw new Error(
      "Could not create order after payment. Your wallet has been refunded.",
    );
  }

  // Optional: attach order id onto ledger metadata if you have an update helper
  // (skip if no such RPC/table update needed)

  // ── STAGE 3: Provider ───────────────────────────────────
  try {
    const result = await createProviderOrder(
      provider.api_url,
      provider.api_key,
      providerService.external_service_id,
      target,
      quantity,
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
      success: true as const,
      orderId: order.id,
      trackingCode: order.tracking_code || order.id,
      ledgerId,
      cost: orderCost,
    };
  } catch (error: any) {
    console.error(
      "CRITICAL: Provider failed after debit. Refunding.",
      error,
    );

    const { error: refundError } = await supabase.rpc(
      "credit_wallet_for_refund",
      {
        p_wallet_id: wallet.id,
        p_usd_amount: orderCost,
        p_description: `Refund: Provider failure for Order ${order.id}`,
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
      console.error("CATACLYSMIC: refund RPC failed", {
        orderId: order.id,
        refundError,
      });
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
        "Provider rejected the order. Funds have been refunded to your wallet.",
    );
  }
}