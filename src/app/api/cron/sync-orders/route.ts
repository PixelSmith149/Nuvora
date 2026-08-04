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

type ProviderRow = { id: string; api_url: string; api_key: string };

type OrderRow = {
  id: string;
  user_id: string;
  provider_order_id: string | null;
  provider_response: any;
  cost: number | string;
  quantity: number;
  status: string;
  tracking_code: string | null;
  providers: ProviderRow | ProviderRow[] | null;
};

function normalizeProvider(p: OrderRow["providers"]): ProviderRow | null {
  if (!p) return null;
  return Array.isArray(p) ? p[0] ?? null : p;
}

function recoverIdFromResponse(providerResponse: any): string | null {
  if (!providerResponse || typeof providerResponse !== "object") return null;
  for (const c of [
    providerResponse.recovered_provider_order_id,
    providerResponse.order,
    providerResponse.order_id,
    providerResponse.id,
    providerResponse.raw?.order,
    providerResponse.raw?.order_id,
  ]) {
    if (c == null) continue;
    const s = String(c).trim();
    if (s && s !== "undefined" && s !== "null") return s;
  }
  return null;
}

function mapUpstreamStatus(raw: string) {
  const s = String(raw || "").toLowerCase().trim();
  if (s === "completed" || s === "success") {
    return { localStatus: "completed", shouldRefundFull: false, isPartial: false };
  }
  if (s === "partial") {
    return { localStatus: "partial", shouldRefundFull: false, isPartial: true };
  }
  if (["refunded", "cancelled", "canceled", "rejected"].includes(s)) {
    return { localStatus: "refunded", shouldRefundFull: true, isPartial: false };
  }
  if (["in progress", "in_progress", "pending", "processing"].includes(s)) {
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
    let recovered = 0;
    let synchronized = 0;
    let refunded = 0;
    const errors: string[] = [];

    // Stage 0: link id from provider_response only (NEVER add/resubmit)
    const { data: unlinked } = await supabase
      .from("orders")
      .select("id, provider_order_id, provider_response, status")
      .eq("status", "pending")
      .is("provider_order_id", null)
      .not("provider_response", "is", null)
      .limit(50);

    for (const row of unlinked ?? []) {
      const id = recoverIdFromResponse(row.provider_response);
      if (!id) continue;

      const { error } = await supabase
        .from("orders")
        .update({
          provider_order_id: id,
          status: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id)
        .is("provider_order_id", null);

      if (error) errors.push(`recover ${row.id}: ${error.message}`);
      else recovered += 1;
    }

    // Stage 1: status sync only when provider_order_id is set
    const { data: activeOrders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
        provider_order_id,
        provider_response,
        cost,
        quantity,
        status,
        tracking_code,
        providers ( id, api_url, api_key )
      `,
      )
      .in("status", ["processing", "in_progress", "partial"])
      .not("provider_order_id", "is", null)
      .order("updated_at", { ascending: true })
      .limit(200);

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    if (!activeOrders?.length) {
      return NextResponse.json({
        success: true,
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
        errors.push(`provider ${providerId}: ${e?.message || "status failed"}`);
        continue;
      }

      for (const [externalId, metrics] of Object.entries(
        providerStatuses || {},
      )) {
        const order = byExternalId[externalId];
        if (!order || !metrics || (metrics as any).error) continue;

        const upstream = String((metrics as any).status || "");
        const { localStatus, shouldRefundFull, isPartial } =
          mapUpstreamStatus(upstream);

        const cost = Number(order.cost) || 0;
        const qty = Number(order.quantity) || 1;
        let refundAmount = 0;
        if (shouldRefundFull && cost > 0) refundAmount = cost;
        else if (isPartial && cost > 0) {
          const remainsCount = Number((metrics as any).remains ?? 0);
          refundAmount = Math.max(
            0,
            Number(((remainsCount * cost) / qty).toFixed(4)),
          );
        }

        if (refundAmount > 0 && order.status !== "refunded") {
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
              errors.push(`refund ${order.id}: ${refundError.message}`);
            } else {
              refunded += 1;
            }
          }
        }

        const startCount =
          (metrics as any).start_count != null
            ? Number((metrics as any).start_count)
            : null;
        const remains =
          (metrics as any).remains != null
            ? Number((metrics as any).remains)
            : null;

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
          errors.push(`update ${order.id}: ${updateError.message}`);
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
    console.error("[sync-orders] fatal:", error);
    return NextResponse.json(
      { error: error?.message || "Internal sync failure" },
      { status: 500 },
    );
  }
}