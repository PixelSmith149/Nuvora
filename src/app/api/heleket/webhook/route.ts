import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ingestDeposit } from "@/lib/wallet/deposit/ingestDeposit";

/**
 * Heleket webhook signature:
 * sign = md5( base64( json_body_without_sign ) + paymentApiKey )
 */
function verifyHeleketSignature(rawBody: string, receivedSign: string, apiKey: string): boolean {
  try {
    const parsed = JSON.parse(rawBody);
    const { sign, ...bodyWithoutSign } = parsed;

    // Recreate the exact string Heleket signed (order + PHP-style escaping is best-effort here)
    const json = JSON.stringify(bodyWithoutSign);
    const base64 = Buffer.from(json).toString("base64");
    const expected = createHash("md5").update(base64 + apiKey).digest("hex");

    return expected === receivedSign;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const paymentApiKey = process.env.HELEKET_PAYMENT_API_KEY;

    if (!paymentApiKey) {
      return NextResponse.json(
        { error: "Missing HELEKET_PAYMENT_API_KEY" },
        { status: 500 },
      );
    }

    // Important: read raw body for signature verification
    const rawBody = await req.text();
    let event: any;

    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const receivedSign = event.sign;
    if (!receivedSign) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Verify signature (production note: for absolute fidelity prefer a verified SDK or raw-byte method)
    const isValid = verifyHeleketSignature(rawBody, receivedSign, paymentApiKey);
    if (!isValid) {
      console.warn("[heleket] signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const orderId = event.order_id;
    const status = String(event.status || "").toLowerCase();
    const uuid = event.uuid;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Only process successful final payments
    const isPaid = status === "paid" || status === "paid_over";

    if (!isPaid) {
      return NextResponse.json({ status: "ignored", current: status });
    }

    const supabase = await createClient();

    const { data: transaction, error: txError } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("reference", orderId)
      .single();

    if (txError || !transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.status === "success") {
      return NextResponse.json({ status: "already_processed" });
    }

    const metadata = transaction.metadata || {};
    const paidAmount = Number(event.payment_amount || event.amount || metadata.estimated_usd || 0);
    const paidCurrency = String(event.payer_currency || event.currency || "USD").toUpperCase();

    await ingestDeposit({
      wallet_id: transaction.wallet_id,
      amount: paidAmount,
      currency: paidCurrency as any,
      reference: transaction.reference,
      provider: "heleket",
      meta: {
        heleket_uuid: uuid,
        heleket_status: status,
        network: event.network,
        txid: event.txid,
        payment_amount_usd: event.payment_amount_usd,
        merchant_amount: event.merchant_amount,
      },
    });

    // Status is also set inside ingestDeposit, but we keep this as safety
    await supabase
      .from("wallet_transactions")
      .update({ status: "success" })
      .eq("id", transaction.id);

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("[heleket webhook]", error);
    return NextResponse.json(
      { error: error?.message || "Webhook failed" },
      { status: 500 },
    );
  }
}