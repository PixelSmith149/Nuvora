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

function isInsufficientBalanceError(message: string): boolean {
  return /insufficient/i.test(message);
}

function mapDebitError(message: string): string {
  if (isInsufficientBalanceError(message)) {
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

/** Pull external order id from common JAP / panel response shapes */
function extractProviderOrderId(result: any): string {
  const raw = result?.raw ?? result ?? {};
  const candidates = [
    result?.providerOrderId,
    raw?.order,
    raw?.order_id,
    raw?.id,
  ];

  for (const c of candidates) {
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

    // ── 1. WALLET ───────────────────────────────────────────
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

    // ── 2. SERVICE & PROVIDER ───────────────────────────────
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .eq("active", true)
      .single();

    if (serviceError || !service) {
      console.error("CREATE_ORDER: Service fetch error:", serviceError);
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
      console.error("CREATE_ORDER: Wholesale mapping error:", pServiceError);
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

    if (providerError || !provider) {
      console.error("CREATE_ORDER: Provider gateway error:", providerError);
      return {
        success: false,
        error: "External provider network gateway is currently offline.",
      };
    }

    // ── 3. COST ─────────────────────────────────────────────
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

    // ── 4. DEBIT FIRST ──────────────────────────────────────
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
          phase: "pre_order_debit",
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

    // ── 5. INSERT (submitting — cron must not resubmit) ─────
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
        status: "submitting",
        provider_order_id: null,
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
        p_reference_id: orderId,
        p_reference_type: "boost_order",
        p_metadata: {
          reason: "order_insert_failed",
          original_ledger_id: ledgerId,
        },
      });

      return {
        success: false,
        error:
          "Could not create order after payment. Your wallet has been refunded.",
      };
    }

    // ── 6. PROVIDER ─────────────────────────────────────────
    // JAP may accept the order even when no providerOrderId is returned.
    // Then: NO refund, NO user failure — save provider_response, status=pending,
    // cron recovers provider_order_id from provider_response (never re-add).
    try {
      const result = await createProviderOrder(
        provider.api_url,
        provider.api_key,
        String(providerService.external_service_id),
        target,
        quantity,
      );

      const raw =
        result && typeof result === "object" && "raw" in result
          ? (result as any).raw ?? result
          : result;

      const assignedExternalId = extractProviderOrderId(result);

      // ── 6a. Usable provider order id ───────────────────────
      if (assignedExternalId) {
        const { data: updated, error: updateError } = await supabase
          .from("orders")
          .update({
            provider_order_id: assignedExternalId,
            provider_response: raw,
            status: "processing",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id)
          .select("id, provider_order_id, status, tracking_code")
          .single();

        if (updateError || !updated?.provider_order_id) {
          console.error(
            "CREATE_ORDER: failed to persist provider_order_id — pending for cron",
            { orderId: order.id, assignedExternalId, updateError },
          );

          await supabase
            .from("orders")
            .update({
              provider_order_id: null,
              provider_response: {
                ...(typeof raw === "object" && raw ? raw : { payload: raw }),
                recovered_provider_order_id: assignedExternalId,
                local_error: "failed_to_persist_provider_order_id",
              },
              status: "pending",
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);

          return {
            success: true,
            orderId: order.id,
            trackingCode: order.tracking_code || order.id,
            ledgerId,
            cost: orderCost,
            providerOrderId: null,
          };
        }

        return {
          success: true,
          orderId: order.id,
          trackingCode: updated.tracking_code || order.id,
          ledgerId,
          cost: orderCost,
          providerOrderId: String(updated.provider_order_id),
        };
      }

      // ── 6b. No providerOrderId — still treat as accepted ───
      console.warn(
        "CREATE_ORDER: no providerOrderId — pending for cron recovery",
        { orderId: order.id, raw },
      );

      const { error: pendingUpdateError } = await supabase
        .from("orders")
        .update({
          provider_order_id: null,
          provider_response: raw,
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (pendingUpdateError) {
        console.error(
          "CREATE_ORDER: failed to save pending provider_response",
          pendingUpdateError,
        );
      }

      return {
        success: true,
        orderId: order.id,
        trackingCode: order.tracking_code || order.id,
        ledgerId,
        cost: orderCost,
        providerOrderId: null,
      };
    } catch (error: any) {
      // ── 6c. Hard failure only → refund ─────────────────────
      console.error(
        "CRITICAL: Provider API failed after debit. Refunding...",
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
        console.error("CATACLYSMIC: Refund RPC failed:", {
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

      const rawErrorMsg = error?.message || "";
      const isBalanceError = /balance|not enough/i.test(rawErrorMsg);

      return {
        success: false,
        error: isBalanceError
          ? "Service currently unavailable due to provider limits. Your wallet balance has been refunded."
          : "Provider rejected the order. Funds have been refunded to your wallet.",
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