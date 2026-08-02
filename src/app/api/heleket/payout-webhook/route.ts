import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function verifyHeleketSignature(
  rawBody: string,
  receivedSign: string,
  apiKey: string,
): boolean {
  try {
    const parsed = JSON.parse(rawBody);
    const { sign, ...bodyWithoutSign } = parsed;
    const json = JSON.stringify(bodyWithoutSign);
    const base64 = Buffer.from(json).toString("base64");
    const expected = createHash("md5")
      .update(base64 + apiKey)
      .digest("hex");
    return expected === receivedSign;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // Payout webhooks are signed with the PAYOUT key
    const payoutApiKey = process.env.HELEKET_PAYOUT_API_KEY;
    if (!payoutApiKey) {
      return NextResponse.json(
        { error: "Missing HELEKET_PAYOUT_API_KEY" },
        { status: 500 },
      );
    }

    const rawBody = await req.text();
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const receivedSign = event.sign;
    if (!receivedSign || !verifyHeleketSignature(rawBody, receivedSign, payoutApiKey)) {
      console.warn("[heleket payout] invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const orderId = event.order_id;
    const status = String(event.status || "").toLowerCase();
    const uuid = event.uuid;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: tx, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("reference", orderId)
      .single();

    if (error || !tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Already final
    if (["success", "failed", "cancelled"].includes(tx.status)) {
      return NextResponse.json({ status: "already_final" });
    }

    // Success states from Heleket
    if (status === "paid" || status === "completed" || status === "success") {
      await supabase
        .from("wallet_transactions")
        .update({
          status: "success",
          metadata: {
            ...(tx.metadata || {}),
            heleket_uuid: uuid,
            heleket_final_status: status,
            txid: event.txid,
            completed_at: new Date().toISOString(),
          },
        })
        .eq("id", tx.id);

      return NextResponse.json({ status: "success" });
    }

    // Failure / cancel states
    if (
      status === "cancel" ||
      status === "fail" ||
      status === "failed" ||
      status === "system_fail" ||
      status === "wrong_amount"
    ) {
      // Refund the user
      const usdAmount = Number(tx.amount_usd || tx.metadata?.usd_amount || 0);
      const feeUsd = 0;

      await supabase.rpc("refund_failed_withdrawal", {
        p_wallet_id: tx.wallet_id,
        p_usd_amount: usdAmount,
        p_fee_usd: feeUsd,
        p_transaction_id: tx.id,
        p_reason: `Heleket payout ${status}`,
      });

      await supabase
        .from("wallet_transactions")
        .update({
          status: "failed",
          metadata: {
            ...(tx.metadata || {}),
            heleket_uuid: uuid,
            heleket_final_status: status,
            failed_at: new Date().toISOString(),
          },
        })
        .eq("id", tx.id);

      return NextResponse.json({ status: "failed_and_refunded" });
    }

    // Intermediate states
    return NextResponse.json({ status: "ignored", current: status });
  } catch (err: any) {
    console.error("[heleket payout webhook]", err);
    return NextResponse.json(
      { error: err?.message || "Webhook failed" },
      { status: 500 },
    );
  }
}