import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getProviderOrdersStatus } from "@/lib/providers/provider.service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
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
  provider_response: any;
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
  return Array.isArray(providers) ? (providers[0] ?? null) : providers;
}

/** Recover id from stored provider_response — NEVER call provider "add" */
function recoverProviderOrderIdFromResponse(providerResponse: any): string | null {
  if (!providerResponse || typeof providerResponse !== "object") return null;

  const candidates = [
    providerResponse.recovered_provider_order_id,
    providerResponse.order,
    providerResponse.order_id,
    providerResponse.id,
    providerResponse.raw?.order,
    providerResponse.raw?.order_id,
  ];

  for (const c of candidates) {
    if (c == null) continue;
    const s = String(c).trim();
    if (s && s !== "undefined" && s !== "null") return s;
  }
  return null;
}

function mapUpstreamStatus(raw: string): {
  localStatus: string;
  shouldRefundFull: boolean;
  isPartial: boolean;
} {
  const s = String(raw || "").toLowerCase().trim();

  if (s === "completed" || s === "success") {
    return {
      localStatus: "completed",
      shouldRefundFull: false,
      isPartial: false,
    };
  }
  if (s === "partial") {
    return {
      localStatus: "partial",
      shouldRefundFull: false,
      isPartial: true,
    };
  }
  if (
    s === "refunded" ||
    s === "cancelled" ||
    s === "canceled" ||
    s === "rejected"
  ) {
    return {
      localStatus: "refunded",
      shouldRefundFull: true,
      isPartial: false,
    };
  }
  if (
    s === "in progress" ||
    s === "in_progress" ||
    s === "pending" ||
    s === "processing"
  ) {
    return {
      localStatus: "processing",
      shouldRefundFull: false,
      isPartial: false,
    };
  }

  return {
    localStatus: "processing",
    shouldRefundFull: false,
    isPartial: false,
  };
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getAdminClient();

    let recovered = 0;
    let synchronized = 0;
    let refunded = 0;
    const errors: string[] = [];

    // ── STAGE 0: Recover provider_order_id from provider_response only ──
    // No createProviderOrder — never double-submit
    const { data: unlinkable, error: unlinkErr } = await supabase
      .from("orders")
      .select("id, provider_order_id, provider_response, status")
      .in("status", ["submitting", "needs_provider_link", "pending", "processing"])
      .is("provider_order_id", null)
      .not("provider_response", "is", null)
      .limit(50);

    if (unlinkErr) {
      console.error("[sync-orders] recover select failed:", unlinkErr);
    } else {
      for (const row of unlinkable ?? []) {
        const recoveredId = recoverProviderOrderIdFromResponse(
          row.provider_response,
        );
        if (!recoveredId) continue;

        const { error: linkErr } = await supabase
          .from("orders")
          .update({
            provider_order_id: recoveredId,
            status: "processing",
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id)
          .is("provider_order_id", null);

        if (linkErr) {
          errors.push(`recover ${row.id}: ${linkErr.message}`);
        } else {
          recovered += 1;
        }
      }
    }

    // ── STAGE 1: Sync only rows that HAVE provider_order_id ──
    const { data: activeOrders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
        provider_id,
        provider_order_id,
        provider_response,
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
      .in("status", ["processing", "in_progress", "partial"])
      .not("provider_order_id", "is", null)
      .order("updated_at", { ascending: true })
      .limit(200);

    if (ordersError) {
      console.error("[sync-orders] select failed:", ordersError);
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    if (!activeOrders?.length) {
      return NextResponse.json({
        success: true,
        message: "No active orders with provider_order_id to sync.",
        recovered,
        synchronized: 0,
        refunded: 0,
        errors: errors.length ? errors : undefined,
      });
    }

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
        const msg = e?.message || "Provider status batch failed";
        console.error(`[sync-orders] provider ${providerId}:`, msg);
        errors.push(`provider ${providerId}: ${msg}`);
        continue;
      }

      // Compare local ids with provider status map (fetch status only — not "add")
      const entries: Array<[string, any]> = Array.isArray(providerStatuses)
        ? []
        : Object.entries(providerStatuses || {});

      for (const [externalId, metrics] of entries) {
        const order = byExternalId[externalId];
        if (!order || !metrics || metrics.error) continue;

        const upstream = String(metrics.status || "");
        const { localStatus, shouldRefundFull, isPartial } =
          mapUpstreamStatus(upstream);

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
          refundAmount = Math.max(
            0,
            Number((remainsCount * unitCost).toFixed(4)),
          );
        }

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
              errors.push(
                `Refund failed for order ${order.id}: ${refundError.message}`,
              );
            } else {
              refunded += 1;
            }
          } else {
            errors.push(
              `No wallet for user ${order.user_id} on order ${order.id}`,
            );
          }
        }

        const updatePayload: Record<string, any> = {
          status: localStatus,
          provider_response: metrics,
          updated_at: new Date().toISOString(),
        };

        if (Number.isFinite(startCount as number)) {
          updatePayload.start_count = startCount;
        }
        if (Number.isFinite(remains as number)) {
          updatePayload.remains = remains;
        }

        const { error: updateError } = await supabase
          .from("orders")
          .update(updatePayload)
          .eq("id", order.id);

        if (updateError) {
          errors.push(
            `Update failed for order ${order.id}: ${updateError.message}`,
          );
          continue;
        }

        synchronized += 1;
      }
    }

    return NextResponse.json({
      success: true,
      scanned: activeOrders.length,
      recovered,
      synchronized,
      refunded,
      errors: errors.length ? errors : undefined,
    });
  } catch (error: any) {
    console.error("[sync-orders] Fatal:", error);
    return NextResponse.json(
      { error: error?.message || "Internal sync failure" },
      { status: 500 },
    );
  }
}