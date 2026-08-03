import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getProviderOrdersStatus } from "@/lib/providers/provider.service";

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
  provider_id: string | null;
  provider_order_id: string | null;
  cost: number | string;
  quantity: number;
  status: string;
  tracking_code: string | null;
  providers: ProviderRow | ProviderRow[] | null;
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

  // Unknown → keep processing so we retry next cron
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

    // Active orders that already have a provider reference
    const { data: activeOrders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
        provider_id,
        provider_order_id,
        cost,
        quantity,
        status,
        tracking_code,
        providers (
          id,
          api_url,
          api_key
        )
      `,
      )
      .in("status", ["pending", "processing", "in_progress", "partial"])
      .not("provider_order_id", "is", null)
      .order("updated_at", { ascending: true })
      .limit(200);

    if (ordersError) {
      console.error("[sync-orders] select failed:", ordersError);
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

    // Group by provider
    const groups: Record<
      string,
      {
        provider: ProviderRow;
        externalIds: string[];
        byExternalId: Record<string, OrderRow>;
      }
    > = {};

    for (const raw of activeOrders as OrderRow[]) {
      const provider = normalizeProvider(raw.providers);
      if (!provider?.api_url || !provider?.api_key || !raw.provider_order_id) {
        continue;
      }

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

    let synchronized = 0;
    let refunded = 0;
    const errors: string[] = [];

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
        const msg = e?.message || "provider status batch failed";
        console.error(`[sync-orders] provider ${providerId}:`, msg);
        errors.push(`provider ${providerId}: ${msg}`);
        continue;
      }

      // JAP returns either a map { "123": {...} } or sometimes a single object
      const entries: Array<[string, any]> = Array.isArray(providerStatuses)
        ? []
        : Object.entries(providerStatuses || {});

      for (const [externalId, metrics] of entries) {
        const order = byExternalId[externalId];
        if (!order) continue;
        if (!metrics || metrics.error) continue;

        const upstream = String(metrics.status || "");
        const { localStatus, shouldRefundFull, isPartial } =
          mapUpstreamStatus(upstream);

        // Skip no-op updates (same status, no refund path)
        if (
          order.status === localStatus &&
          !shouldRefundFull &&
          !isPartial
        ) {
          // Still refresh start_count / remains if present
        }

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
          const unit = cost / qty;
          refundAmount = Math.max(0, Number((remainsCount * unit).toFixed(4)));
        }

        // Refund once: only when moving into refunded/partial from a non-terminal state
        const alreadyTerminal =
          order.status === "refunded" || order.status === "completed";

        if (refundAmount > 0 && !alreadyTerminal) {
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
              console.error("[sync-orders] refund RPC failed:", {
                orderId: order.id,
                refundError,
              });
              errors.push(`refund ${order.id}: ${refundError.message}`);
              // Still update status below so we don't loop forever without visibility
            } else {
              refunded += 1;
            }
          } else {
            errors.push(`no wallet for user ${order.user_id} order ${order.id}`);
          }
        }

        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: localStatus,
            start_count: Number.isFinite(startCount as number)
              ? startCount
              : undefined,
            remains: Number.isFinite(remains as number) ? remains : undefined,
            provider_response: metrics,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (updateError) {
          console.error("[sync-orders] update failed:", {
            orderId: order.id,
            updateError,
          });
          errors.push(`update ${order.id}: ${updateError.message}`);
          continue;
        }

        synchronized += 1;
      }
    }

    return NextResponse.json({
      success: true,
      scanned: activeOrders.length,
      synchronized,
      refunded,
      errors: errors.length ? errors : undefined,
    });
  } catch (error: any) {
    console.error("[sync-orders] fatal:", error);
    return NextResponse.json(
      { error: error?.message || "Internal sync failure" },
      { status: 500 },
    );
  }
}