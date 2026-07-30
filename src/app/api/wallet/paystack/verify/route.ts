import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ingestDeposit } from "@/lib/wallet/deposit/ingestDeposit";
import type { Currency } from "@/lib/wallet/currency/convert";

const ZERO_DECIMAL_CURRENCIES = new Set([
  "XOF",
  "XAF",
  "GNF",
  "RWF",
  "UGX",
]);

const ALLOWED_CURRENCIES = new Set<string>([
  "USD",
  "GHS",
  "NGN",
  "KES",
  "UGX",
  "TZS",
  "ZAR",
  "XOF",
  "XAF",
  "EGP",
  "MAD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "BTC",
]);

function toMajorAmount(amountMinor: number, currency: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(currency)) return amountMinor;
  return amountMinor / 100;
}

function asCurrency(value: string): Currency {
  const c = value.toUpperCase();
  if (!ALLOWED_CURRENCIES.has(c)) {
    // Ghana Paystack fallback — never pass a raw untyped string into ingest
    return "GHS";
  }
  return c as Currency;
}

function extractPaystackPayerInfo(data: any): {
  channel: string | null;
  phone: string | null;
  network: string | null;
} {
  const channel = data?.channel ? String(data.channel) : null;

  // Mobile money payloads vary by version
  const phone =
    data?.authorization?.mobile ??
    data?.authorization?.mobile_money?.phone ??
    data?.customer?.phone ??
    data?.metadata?.phone ??
    null;

  const network =
    data?.authorization?.brand ??
    data?.authorization?.mobile_money?.provider ??
    data?.authorization?.bank ??
    data?.metadata?.network ??
    null;

  return {
    channel,
    phone: phone ? String(phone) : null,
    network: network ? String(network) : null,
  };
}

export async function POST(req: Request) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecret) {
    return NextResponse.json(
      { error: "Server payment configuration missing" },
      { status: 500 },
    );
  }

  // ─── Auth: must be logged in ───────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ─── Body ──────────────────────────────────────────────────────────────
  let body: { reference?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const reference = String(body.reference || "").trim();
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  // ─── Load our pending / existing transaction (admin for RLS safety) ───
  const admin = createAdminClient();

  const { data: transaction, error: txError } = await admin
    .from("wallet_transactions")
    .select("id, wallet_id, status, amount, meta, provider")
    .eq("reference", reference)
    .maybeSingle();

  if (txError) {
    console.error("[paystack.verify] tx lookup:", txError.message);
    return NextResponse.json(
      { error: "Transaction lookup failed" },
      { status: 500 },
    );
  }

  if (!transaction) {
    return NextResponse.json(
      { error: "Transaction not found", status: "failed" },
      { status: 404 },
    );
  }

  const meta = (transaction.meta as Record<string, unknown>) || {};

  // Ensure this top-up belongs to the current user
  if (meta.user_id && meta.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Already credited (webhook may have won the race)
  if (transaction.status === "success") {
    return NextResponse.json({
      status: "success",
      amount: transaction.amount,
      reference,
      message: "Payment already confirmed",
    });
  }

  if (transaction.status === "failed" || transaction.status === "cancelled") {
    return NextResponse.json({
      status: "failed",
      message: "This payment can no longer be completed",
      reference,
    });
  }

  // ─── Verify with Paystack ──────────────────────────────────────────────
  let payload: any;
  try {
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    payload = await verifyRes.json();

    if (!verifyRes.ok || !payload?.status) {
      return NextResponse.json(
        {
          error: payload?.message || "Paystack verification failed",
          status: "failed",
        },
        { status: 400 },
      );
    }
  } catch (err: any) {
    console.error("[paystack.verify] network:", err?.message || err);
    return NextResponse.json(
      { error: "Failed to reach Paystack", status: "pending" },
      { status: 502 },
    );
  }

  const data = payload.data;
  if (!data) {
    return NextResponse.json(
      { error: "Empty verification payload", status: "failed" },
      { status: 400 },
    );
  }

  const paystackStatus = String(data.status || "").toLowerCase();
  // success | failed | abandoned | ongoing | reversed | ...

    // ─── Success → ingest (idempotent with webhook) ────────────────────────
  if (paystackStatus === "success") {
    const sourceCurrency = asCurrency(String(data.currency || "GHS"));
    const rawAmount = Number(data.amount);

    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid paid amount from Paystack", status: "failed" },
        { status: 400 },
      );
    }

    const sourceAmountMajor = toMajorAmount(rawAmount, sourceCurrency);
    const payer = extractPaystackPayerInfo(data); // ← use `data`, not eventData

    try {
      const result = await ingestDeposit({
        wallet_id: transaction.wallet_id,
        amount: sourceAmountMajor,
        currency: sourceCurrency,
        reference,
        provider: "paystack",
        asAdmin: true,
        channel: payer.channel,
        phone: payer.phone,
        network: payer.network,
        meta: {
          channel: payer.channel,
          phone: payer.phone,
          network: payer.network,
          gateway_response: data.gateway_response,
          paid_at: data.paid_at,
          fees: data.fees,
          paystack_status: paystackStatus,
          verified_via: "callback", // ← verify route, not webhook
        },
      });

      return NextResponse.json({
        status: "success",
        amount: result.credited_usd ?? transaction.amount,
        reference,
        channel: data.channel,
        idempotent: result.idempotent === true,
        message: result.idempotent
          ? "Payment already confirmed"
          : "Payment confirmed",
      });
    } catch (err: any) {
      console.error("[paystack.verify] ingestDeposit:", err?.message || err);

      const { data: again } = await admin
        .from("wallet_transactions")
        .select("status, amount")
        .eq("reference", reference)
        .maybeSingle();

      if (again?.status === "success") {
        return NextResponse.json({
          status: "success",
          amount: again.amount,
          reference,
          message: "Payment already confirmed",
        });
      }

      return NextResponse.json(
        {
          error: "Payment verified but wallet credit failed. Retry shortly.",
          status: "pending",
        },
        { status: 500 },
      );
    }
  }

  // ─── Terminal failure ──────────────────────────────────────────────────
  if (
    paystackStatus === "failed" ||
    paystackStatus === "abandoned" ||
    paystackStatus === "reversed"
  ) {
    if (transaction.status === "pending") {
      await admin
        .from("wallet_transactions")
        .update({
          status: "failed",
          meta: {
            ...meta,
            paystack_status: paystackStatus,
            gateway_response: data.gateway_response,
            failed_via: "callback_verify",
            failed_at: new Date().toISOString(),
          },
        })
        .eq("id", transaction.id)
        .eq("status", "pending");
    }

    return NextResponse.json({
      status: "failed",
      message: "Payment was not completed",
      reference,
      paystack_status: paystackStatus,
    });
  }

  // ─── Still processing (ongoing, etc.) ──────────────────────────────────
  return NextResponse.json({
    status: "pending",
    message: "Payment is still processing",
    reference,
    paystack_status: paystackStatus,
  });
}