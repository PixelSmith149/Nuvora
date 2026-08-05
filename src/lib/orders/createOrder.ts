"use server";

import { createProviderOrder } from "@/lib/providers/provider.service";
import { calculateOrderAmount } from "@/lib/services/servicePricing";
import { isAutoService } from "@/lib/services/serviceMode";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

interface CreateOrderParams {
  serviceId: string;
  quantity: number;
  target: string;
}

type CreateOrderResult =
  | {
      success: true;
      orderId: string;
      trackingCode: string;
      ledgerId: string | null;
      cost: number;
      providerOrderId: string | null;
    }
  | {
      success: false;
      error: string;
    };

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return createSupabaseJsClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function mapDebitError(message: string): string {
  if (/insufficient/i.test(message)) {
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

function extractProviderOrderId(result: any): string {
  const raw = result?.raw ?? result ?? {};
  for (const c of [
    result?.providerOrderId,
    raw?.order,
    raw?.order_id,
    raw?.id,
  ]) {
    if (c == null) continue;
    const s = String(c).trim();
    if (s && s !== "undefined" && s !== "null") return s;
  }
  return "";
}

export async function createOrder({
  serviceId,
  quantity,
  target,
}: CreateOrderParams): Promise<CreateOrderResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required." };
    }

    // ── Wallet ──────────────────────────────────────────────
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return {
        success: false,
        error: "Wallet not found. Please setup a wallet configuration.",
      };
    }

    const { data: balanceRow } = await supabase
      .from("wallet_balances")
      .select("balance")
      .eq("wallet_id", wallet.id)
      .maybeSingle();

    const availableBalance = Number(balanceRow?.balance ?? 0);

    // ── Service / provider ──────────────────────────────────
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .eq("active", true)
      .single();

    if (serviceError || !service) {
      return {
        success: false,
        error: "The selected service is currently unavailable.",
      };
    }

    if (isAutoService(service.title || service.name || "")) {
      return {
        success: false,
        error:
          "Auto/subscription services are temporarily unavailable. Please choose a standard (non-Auto) service.",
      };
    }

    const { data: providerService, error: pServiceError } = await supabase
      .from("provider_services")
      .select("*")
      .eq("id", service.provider_service_id)
      .eq("active", true)
      .single();

    if (pServiceError || !providerService) {
      return {
        success: false,
        error: "Wholesale configuration mapping error for this service.",
      };
    }

    if (
      quantity < providerService.min_qty ||
      quantity > providerService.max_qty
    ) {
      return {
        success: false,
        error: `Invalid quantity. Order bounds must be between ${providerService.min_qty} and ${providerService.max_qty}.`,
      };
    }

    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("*")
      .eq("id", providerService.provider_id)
      .eq("active", true)
      .single();

    if (providerError || !provider?.api_url || !provider?.api_key) {
      return {
        success: false,
        error: "External provider network gateway is currently offline.",
      };
    }

    // ── Cost ────────────────────────────────────────────────
    const retailRate = Number(service.price_per_1000 ?? 0);
    if (!Number.isFinite(retailRate) || retailRate <= 0) {
      return {
        success: false,
        error:
          "This service has no valid retail price configured (price_per_1000).",
      };
    }

    const orderCost = Number(
      calculateOrderAmount(retailRate, quantity).toFixed(4),
    );
    if (!Number.isFinite(orderCost) || orderCost <= 0) {
      return { success: false, error: "Invalid order cost calculated." };
    }

    if (availableBalance < orderCost) {
      return {
        success: false,
        error: `Insufficient wallet balance. Required: $${orderCost.toFixed(2)}, Available: $${availableBalance.toFixed(2)}. Please top up and try again.`,
      };
    }

    const orderId = crypto.randomUUID();

    // ── Debit ───────────────────────────────────────────────
    const { data: debitResult, error: debitError } = await supabase.rpc(
      "debit_wallet_for_purchase",
      {
        p_wallet_id: wallet.id,
        p_user_id: user.id,
        p_usd_amount: orderCost,
        p_description: `SMM Boosting: ${service.title || service.name || service.id}`,
        p_reference_id: orderId,
        p_reference_type: "boost_order",
        p_metadata: {
          service_id: service.id,
          provider_id: provider.id,
          quantity,
          target,
        },
      },
    );

    if (debitError) {
      console.error("CREATE_ORDER: Debit RPC failed:", debitError);
      return {
        success: false,
        error: mapDebitError(debitError.message || ""),
      };
    }

    const ledgerId =
      debitResult && typeof debitResult === "object"
        ? ((debitResult as any).ledger_id as string | null)
        : null;

    // ── Insert (no tracking_code — your DB/trigger owns ORD-…) ─
    const { data: order, error: orderCreateError } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        user_id: user.id,
        service_id: service.id,
        provider_id: provider.id,
        target,
        quantity,
        cost: orderCost,
        status: "pending",
        is_auto: false,
      })
      .select("id, tracking_code")
      .single();

    if (orderCreateError || !order) {
      console.error("CREATE_ORDER: insert failed after debit", orderCreateError);

      await supabase.rpc("credit_wallet_for_refund", {
        p_wallet_id: wallet.id,
        p_usd_amount: orderCost,
        p_description: "Refund: order record could not be created",
        p_reference_id: orderId,
        p_reference_type: "boost_order",
        p_metadata: {
          reason: "order_insert_failed",
          db_message: orderCreateError?.message,
          original_ledger_id: ledgerId,
        },
      });

      return {
        success: false,
        error:
          "Could not create order after payment. Your wallet has been refunded.",
      };
    }

    const trackingCode = order.tracking_code || order.id;
    const admin = getAdminClient();

    // ── JAP call + service-role update (always persist response) ─
    try {
      console.info("[CREATE_ORDER] calling JAP", {
        orderId: order.id,
        service: providerService.external_service_id,
        url: provider.api_url,
      });

      const result = await createProviderOrder(
        provider.api_url,
        provider.api_key,
        String(providerService.external_service_id),
        target,
        quantity,
      );

      const raw =
        result && typeof result === "object" && "raw" in (result as any)
          ? (result as any).raw ?? result
          : result;

      const assignedExternalId = extractProviderOrderId(result);

      console.info("[CREATE_ORDER] JAP returned", {
        orderId: order.id,
        providerOrderId: assignedExternalId || null,
        hasRaw: raw != null,
        rawPreview:
          typeof raw === "object" ? JSON.stringify(raw).slice(0, 500) : raw,
      });

      // ALWAYS write provider_response via service role
      const { data: updated, error: updateError } = await admin
        .from("orders")
        .update({
          provider_response: raw ?? { empty: true },
          provider_order_id: assignedExternalId || null,
          status: assignedExternalId ? "processing" : "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .select("id, provider_order_id, provider_response, status, tracking_code")
        .single();

      if (updateError) {
        console.error("[CREATE_ORDER] service-role update FAILED", updateError);
      } else {
        console.info("[CREATE_ORDER] row after update", {
          id: updated?.id,
          status: updated?.status,
          provider_order_id: updated?.provider_order_id,
          has_response: updated?.provider_response != null,
        });
      }

      return {
        success: true,
        orderId: order.id,
        trackingCode: updated?.tracking_code || trackingCode,
        ledgerId,
        cost: orderCost,
        providerOrderId: assignedExternalId || null,
      };
    } catch (error: any) {
      console.error("[CREATE_ORDER] JAP hard failure", error);

      await supabase.rpc("credit_wallet_for_refund", {
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
      });

      await admin
        .from("orders")
        .update({
          status: "refunded",
          provider_response: {
            error: error?.message || "Unknown external provider API fault",
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      return {
        success: false,
        error:
          "Provider rejected the order. Funds have been refunded to your wallet.",
      };
    }
  } catch (err: any) {
    console.error("UNHANDLED_SERVER_ACTION_ERROR:", err);
    return {
      success: false,
      error: err?.message || "An unexpected system error occurred.",
    };
  }
}