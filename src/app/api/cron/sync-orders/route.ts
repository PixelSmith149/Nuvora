import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { 
  getProviderOrdersStatus, 
  createProviderOrder 
} from "@/lib/providers/provider.service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type ProviderRow = {
  id: string;
  api_url: string;
  api_key: string;
};

type OrderRow = {
  id: string;
  user_id: string;
  service_id: string | null;
  provider_id: string | null;
  provider_order_id: string | null;
  target: string | null;
  quantity: number;
  cost: number | string;
  status: string;
  tracking_code: string | null;
  providers: ProviderRow | ProviderRow[] | null;
  services?: {
    id: string;
    provider_services?: {
      external_service_id: string | number;
    } | { external_service_id: string | number }[] | null;
  } | { id: string; provider_services?: any }[] | null;
};

function normalizeProvider(
  providers: OrderRow["providers"],
): ProviderRow | null {
  if (!providers) return null;
  return Array.isArray(providers) ? providers[0] ?? null : providers;
}

function mapUpstreamStatus(raw: string): {
  localStatus: string;
  shouldRefundFull: boolean;
  isPartial: boolean;
} {
  const s = String(raw || "").toLowerCase().trim();

  if (s === "completed" || s === "success") {
    return { localStatus: "completed", shouldRefundFull: false, isPartial: false };
  }
  if (s === "partial") {
    return { localStatus: "partial", shouldRefundFull: false, isPartial: true };
  }
  if (
    s === "refunded" ||
    s === "cancelled" ||
    s === "canceled" ||
    s === "rejected"
  ) {
    return { localStatus: "refunded", shouldRefundFull: true, isPartial: false };
  }
  if (
    s === "in progress" ||
    s === "in_progress" ||
    s === "pending" ||
    s === "processing"
  ) {
    return { localStatus: "processing", shouldRefundFull: false, isPartial: false };
  }

  return { localStatus: "processing", shouldRefundFull: false, isPartial: false };
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getAdminClient();

    // 1. Fetch orders in non-terminal states needing submit or sync
    const { data: activeOrders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
        service_id,
        provider_id,
        provider_order_id,
        target,
        quantity,
        cost,
        status,
        tracking_code,
        providers (
          id,
          api_url,
          api_key
        ),
        services (
          id,
          provider_services (
            external_service_id
          )
        )
      `,
      )
      .in("status", ["pending", "processing", "in_progress", "partial"])
      .order("created_at", { ascending: true })
      .limit(200);

    if (ordersError) {
      console.error("[sync-orders] Select query failed:", ordersError);
      return NextResponse.json(
        { error: ordersError.message },
        { status: 500 },
      );
    }

    if (!activeOrders?.length) {
      return NextResponse.json({
        success: true,
        message: "No active orders to sync.",
        synchronized: 0,
      });
    }

    let submitted = 0;
    let synchronized = 0;
    let refunded = 0;
    const errors: string[] = [];

    const groups: Record<
      string,
      {
        provider: ProviderRow;
        externalIds: string[];
        byExternalId: Record<string, OrderRow>;
      }
    > = {};

    for (const raw of activeOrders as unknown as OrderRow[]) {
      const provider = normalizeProvider(raw.providers);
      if (!provider?.api_url || !provider?.api_key) {
        errors.push(`Order ${raw.id}: Missing provider API credentials`);
        continue;
      }

      // ----------------------------------------------------
      // STAGE A: Order HAS NO provider_order_id -> Submit to Provider
      // ----------------------------------------------------
      if (!raw.provider_order_id) {
        // Extract external_service_id through services -> provider_services relationship
        const serviceData = Array.isArray(raw.services) ? raw.services[0] : raw.services;
        const pServices = serviceData?.provider_services;
        const pService = Array.isArray(pServices) ? pServices[0] : pServices;

        const externalServiceId = pService?.external_service_id;

        if (!externalServiceId || !raw.target) {
          errors.push(`order ${raw.id}: missing target or external_service_id`);
          continue;
        }

        try {
          const serviceIdStr = String(externalServiceId);

          const result = await createProviderOrder(
            provider.api_url,
            provider.api_key,
            serviceIdStr,
            raw.target,
            raw.quantity
          );

          // Safe extraction without TS property errors
          const rawResponse = result.raw ?? {};
          const newProviderOrderId = String(
            result.providerOrderId || rawResponse.order || rawResponse.order_id || ""
          );

          if (newProviderOrderId) {
            const { error: updateOrderError } = await supabase
              .from("orders")
              .update({
                provider_order_id: newProviderOrderId,
                provider_response: result.raw ?? result,
                status: "processing",
                updated_at: new Date().toISOString(),
              })
              .eq("id", raw.id);

            if (updateOrderError) {
              errors.push(`submit update failed for ${raw.id}: ${updateOrderError.message}`);
            } else {
              submitted += 1;
            }
          } else {
            errors.push(`submit order ${raw.id}: provider returned empty order ID`);
          }
        } catch (err: any) {
          console.error(`[sync-orders] Order ${raw.id} submit error:`, err);
          errors.push(`submit order ${raw.id}: ${err.message}`);
        }
        continue;
      }
      
      // STAGE B: Has provider_order_id -> Batch Grouping
      if (!groups[provider.id]) {
        groups[provider.id] = {
          provider,
          externalIds: [],
          byExternalId: {},
        };
      }

      groups[provider.id].externalIds.push(raw.provider_order_id);
      groups[provider.id].byExternalId[raw.provider_order_id] = raw;
    }

    // STAGE C: Process Batch Status Syncing & Automated Refunds
    for (const providerId of Object.keys(groups)) {
      const { provider, externalIds, byExternalId } = groups[providerId];

      let providerStatuses: Record<string, any>;
      try {
        providerStatuses = await getProviderOrdersStatus(
          provider.api_url,
          provider.api_key,
          externalIds,
        );
      } catch (e: any) {
        const msg = e?.message || "Provider status batch execution failed";
        console.error(`[sync-orders] Provider ${providerId}:`, msg);
        errors.push(`Provider ${providerId}: ${msg}`);
        continue;
      }

      const entries: Array<[string, any]> = Array.isArray(providerStatuses)
        ? []
        : Object.entries(providerStatuses || {});

      for (const [externalId, metrics] of entries) {
        const order = byExternalId[externalId];
        if (!order || !metrics || metrics.error) continue;

        const upstream = String(metrics.status || "");
        const { localStatus, shouldRefundFull, isPartial } = mapUpstreamStatus(upstream);

        const startCount =
          metrics.start_count !== undefined && metrics.start_count !== null
            ? Number(metrics.start_count)
            : null;
        const remains =
          metrics.remains !== undefined && metrics.remains !== null
            ? Number(metrics.remains)
            : null;

        const cost = Number(order.cost) || 0;
        const qty = Number(order.quantity) || 1;

        let refundAmount = 0;
        if (shouldRefundFull && cost > 0) {
          refundAmount = cost;
        } else if (isPartial && cost > 0) {
          const remainsCount = Number(metrics.remains ?? 0);
          const unitCost = cost / qty;
          refundAmount = Math.max(0, Number((remainsCount * unitCost).toFixed(4)));
        }

        // Check if state transitioned from active to terminal refund state
        const isAlreadyRefunded = order.status === "refunded";

        if (refundAmount > 0 && !isAlreadyRefunded) {
          const { data: wallet } = await supabase
            .from("wallets")
            .select("id")
            .eq("user_id", order.user_id)
            .maybeSingle();

          if (wallet?.id) {
            const { error: refundError } = await supabase.rpc(
              "credit_wallet_for_refund",
              {
                p_wallet_id: wallet.id,
                p_usd_amount: refundAmount,
                p_description: `Auto refund (${localStatus}): order ${order.tracking_code || order.id}`,
                p_reference_id: order.id,
                p_reference_type: "boost_order",
                p_metadata: {
                  upstream_status: upstream,
                  provider_order_id: externalId,
                  source: "cron_sync_orders",
                },
              },
            );

            if (refundError) {
              console.error("[sync-orders] Refund RPC failure:", {
                orderId: order.id,
                refundError,
              });
              errors.push(`Refund failed for order ${order.id}: ${refundError.message}`);
            } else {
              refunded += 1;
            }
          } else {
            errors.push(`No active wallet found for user ${order.user_id} on order ${order.id}`);
          }
        }

        // Update final order state in database
        const updatePayload: Record<string, any> = {
          status: localStatus,
          provider_response: metrics,
          updated_at: new Date().toISOString(),
        };

        if (Number.isFinite(startCount)) updatePayload.start_count = startCount;
        if (Number.isFinite(remains)) updatePayload.remains = remains;

        const { error: updateError } = await supabase
          .from("orders")
          .update(updatePayload)
          .eq("id", order.id);

        if (updateError) {
          console.error("[sync-orders] State update failed:", {
            orderId: order.id,
            updateError,
          });
          errors.push(`Update failed for order ${order.id}: ${updateError.message}`);
          continue;
        }

        synchronized += 1;
      }
    }

    return NextResponse.json({
      success: true,
      scanned: activeOrders.length,
      submitted,
      synchronized,
      refunded,
      errors: errors.length ? errors : undefined,
    });
  } catch (error: any) {
    console.error("[sync-orders] Fatal execution failure:", error);
    return NextResponse.json(
      { error: error?.message || "Internal sync failure" },
      { status: 500 },
    );
  }
}