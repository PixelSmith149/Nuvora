import crypto from "crypto";
import { NextResponse } from "next/server";

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

function safeCompareSignatures(
  hash: string,
  signature: string | null,
): boolean {
  if (!signature) return false;

  const hashBuffer = Buffer.from(hash, "utf8");
  const sigBuffer = Buffer.from(signature, "utf8");

  if (hashBuffer.length !== sigBuffer.length) return false;

  return crypto.timingSafeEqual(hashBuffer, sigBuffer);
}

function toMajorAmount(amountMinor: number, currency: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(currency)) return amountMinor;
  return amountMinor / 100;
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
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    return NextResponse.json(
      { error: "Missing Paystack secret configuration" },
      { status: 500 },
    );
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  if (!safeCompareSignatures(hash, signature)) {
    return NextResponse.json({ error: "Invalid payload signature" }, { status: 401 });
  }

  let event: { event?: string; data?: any };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventType = String(event.event || "");
  const eventData = event.data;

  if (!eventData) {
    return NextResponse.json({ status: "ignored_no_data" });
  }

  const supabase = createAdminClient();

  // ─────────────────────────────────────────────
  // charge.success — deposits (card, MoMo, bank, etc.)
  // ─────────────────────────────────────────────
  if (eventType === "charge.success") {
    const reference = String(eventData.reference || "").trim();

    if (!reference) {
      console.error("[paystack.webhook] charge.success missing reference");
      return NextResponse.json({ status: "ignored_missing_reference" });
    }

    const { data: transaction, error } = await supabase
      .from("wallet_transactions")
      .select("id, wallet_id, status, meta")
      .eq("reference", reference)
      .maybeSingle();

    if (error) {
      console.error("[paystack.webhook] tx lookup error:", error.message);
      // 500 → Paystack retries
      return NextResponse.json({ error: "Transaction lookup failed" }, { status: 500 });
    }

    if (!transaction) {
      // Not our tx (or created outside topup flow) — do not retry forever
      console.warn("[paystack.webhook] unknown reference:", reference);
      return NextResponse.json({ status: "ignored_missing_transaction" });
    }

    if (transaction.status === "success") {
      return NextResponse.json({ status: "already_processed" });
    }

    if (transaction.status === "failed" || transaction.status === "cancelled") {
      return NextResponse.json({ status: "ignored_terminal_status" });
    }

    const sourceCurrency = String(eventData.currency || "GHS").toUpperCase();
    const rawAmount = Number(eventData.amount);

    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      console.error("[paystack.webhook] invalid amount:", eventData.amount);
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const sourceAmountMajor = toMajorAmount(rawAmount, sourceCurrency);
    const payer = extractPaystackPayerInfo(eventData);

    try {
    

await ingestDeposit({
  wallet_id: transaction.wallet_id,
  amount: sourceAmountMajor,
  currency: sourceCurrency as Currency,
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
    paystack_event: "charge.success",
    gateway_response: eventData.gateway_response,
    verified_via: "webhook",
  },
});
    } catch (err: any) {
      console.error("[paystack.webhook] ingestDeposit failed:", err?.message || err);
      // Retryable
      return NextResponse.json(
        { error: "Deposit ingest failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: "deposit_ingested" });
  }

  // ─────────────────────────────────────────────
  // transfer.failed / transfer.reversed — withdrawals
  // ─────────────────────────────────────────────
  if (eventType === "transfer.failed" || eventType === "transfer.reversed") {
    const reference = String(eventData.reference || "").trim();
    const reason =
      eventData.reason ||
      eventData.gateway_response ||
      "Paystack transfer processing failed";

    if (!reference) {
      return NextResponse.json({ status: "ignored_missing_reference" });
    }

    const possibleUuid = reference.startsWith("pb-tx-")
      ? reference.replace("pb-tx-", "")
      : reference;

    const isValidUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        possibleUuid,
      );

    let query = supabase
      .from("wallet_transactions")
      .select("id, wallet_id, amount, status, meta");

    if (isValidUuid) {
      query = query.or(`reference.eq.${reference},id.eq.${possibleUuid}`);
    } else {
      query = query.eq("reference", reference);
    }

    const { data: transaction, error } = await query.maybeSingle();

    if (error) {
      console.error("[paystack.webhook] transfer lookup error:", error.message);
      return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
    }

    if (!transaction) {
      console.warn("[paystack.webhook] unknown transfer reference:", reference);
      return NextResponse.json({ status: "ignored_missing_withdrawal" });
    }

    if (transaction.status === "failed") {
      return NextResponse.json({ status: "already_refunded" });
    }

    const meta = (transaction.meta as Record<string, any>) ?? {};
    const chargedFeeUsd = Number(meta.charged_fee_usd ?? 0) || 0;

    const { error: refundError } = await supabase.rpc("refund_failed_withdrawal", {
      p_wallet_id: transaction.wallet_id,
      p_usd_amount: transaction.amount,
      p_fee_usd: chargedFeeUsd,
      p_transaction_id: transaction.id,
      p_reason: `Paystack Event (${eventType}): ${reason}`,
    });

    if (refundError) {
      console.error("[paystack.webhook] refund RPC error:", refundError);
      return NextResponse.json(
        { error: "Failed to process automatic refund RPC" },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: "transfer_refunded" });
  }

  return NextResponse.json({ status: "ignored" });
}