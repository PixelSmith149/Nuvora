// src/app/[tech]/admin-dashboard/provider-analytics/global-actions.ts
"use server";

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Lightweight admin gate (keeps your current .env + handshake security model)
 */
async function assertIsAdmin() {
  const cookieStore = await cookies();

  const handshake = cookieStore.get("admin_portal_handshake_token");
  if (!handshake?.value) {
    throw new Error("Unauthorized");
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) throw new Error("Unauthorized");

  const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedEmails.includes(user.email.toLowerCase())) {
    throw new Error("Unauthorized");
  }
}

/**
 * High-performance version – prefers database-side aggregation
 */
export async function fetchPlatformLiveProfitBalance(): Promise<number> {
  await assertIsAdmin();

  // ────────────────────────────────────────────────
  // Preferred path: single efficient SQL query
  // ────────────────────────────────────────────────
  const { data, error } = await adminSupabase.rpc(
    "get_platform_live_profit_balance",
  );

  if (!error && typeof data === "number") {
    return data;
  }

  // ────────────────────────────────────────────────
  // Fallback: original in-memory calculation
  // (kept so the feature never breaks if RPC is missing)
  // ────────────────────────────────────────────────
  console.warn(
    "[ProfitBalance] RPC not available, falling back to in-memory calculation",
    error?.message,
  );

  const [provServicesRes, storeServicesRes, ordersRes] = await Promise.all([
    adminSupabase.from("provider_services").select("id, rate"),
    adminSupabase
      .from("services")
      .select("id, provider_service_id, price_per_1000"),
    adminSupabase
      .from("orders")
      .select("service_id, quantity, status")
      .not("status", "in", '("cancelled","failed")'),
  ]);

  if (provServicesRes.error) throw new Error(provServicesRes.error.message);
  if (storeServicesRes.error) throw new Error(storeServicesRes.error.message);
  if (ordersRes.error) throw new Error(ordersRes.error.message);

  const wholesaleRateMap = new Map<string, number>(
    (provServicesRes.data || []).map((ps) => [ps.id, Number(ps.rate) || 0]),
  );

  const serviceFinancialMap = new Map<
    string,
    { wholesaleRate: number; retailPrice: number }
  >();

  (storeServicesRes.data || []).forEach((ss) => {
    if (ss.provider_service_id && wholesaleRateMap.has(ss.provider_service_id)) {
      serviceFinancialMap.set(ss.id, {
        wholesaleRate: wholesaleRateMap.get(ss.provider_service_id)!,
        retailPrice: Number(ss.price_per_1000) || 0,
      });
    }
  });

  let totalPlatformProfit = 0;

  (ordersRes.data || []).forEach((order) => {
    const financialContext = serviceFinancialMap.get(order.service_id);
    if (!financialContext) return;

    const quantity = Number(order.quantity) || 0;
    const wholesaleCost = (quantity / 1000) * financialContext.wholesaleRate;
    const retailRevenue = (quantity / 1000) * financialContext.retailPrice;

    totalPlatformProfit += retailRevenue - wholesaleCost;
  });

  return totalPlatformProfit;
}