import { randomUUID } from "crypto";
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function createHeleketSign(body: object, apiKey: string): string {
  const json = JSON.stringify(body);
  const base64 = Buffer.from(json).toString("base64");
  return createHash("md5").update(base64 + apiKey).digest("hex");
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const usdAmount = Number(body.usdAmount);
    const cryptoAmount = Number(body.cryptoAmount);
    const currency = String(body.currency || "").toUpperCase(); // BTC | USDT | LTC
    const network = body.network ? String(body.network).toUpperCase() : undefined;
    const address = String(body.address || "").trim();
    const asset = body.asset; // e.g. USDT-TRC20

    if (!usdAmount || usdAmount <= 0 || isNaN(usdAmount)) {
      return NextResponse.json({ error: "Invalid USD amount" }, { status: 400 });
    }
    if (!cryptoAmount || cryptoAmount <= 0) {
      return NextResponse.json({ error: "Invalid crypto amount" }, { status: 400 });
    }
    if (!currency || !address) {
      return NextResponse.json(
        { error: "Currency and destination address are required" },
        { status: 400 },
      );
    }

    // Resolve wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Balance check
    const { data: balanceRow } = await supabase
      .from("wallet_balances")
      .select("balance")
      .eq("wallet_id", wallet.id)
      .single();

    const balance = Number(balanceRow?.balance ?? 0);
    if (usdAmount > balance) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 },
      );
    }

    const reference = `CRYPTO-WD-${Date.now()}-${randomUUID()}`;
    const feeUsd = 0; // adjust if you charge a platform fee

    // 1. Atomic debit (reuse existing RPC)
    const { data: txResult, error: txError } = await supabase.rpc(
      "process_withdrawal",
      {
        p_user_id: user.id,
        p_amount: usdAmount,
        p_fee_usd: feeUsd,
        p_meta: {
          type: "crypto",
          asset,
          currency,
          network,
          address,
          crypto_amount: cryptoAmount,
          provider: "heleket",
        },
      },
    );

    if (txError) {
      throw new Error(`Wallet deduction failure: ${txError.message}`);
    }

    const wallet_id = txResult.wallet_id;
    const transaction_id = txResult.transaction_id;

    // 2. Create Heleket payout
    const merchantId = process.env.HELEKET_MERCHANT_ID;
    const payoutApiKey = process.env.HELEKET_PAYOUT_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!merchantId || !payoutApiKey) {
      // rollback
      await supabase.rpc("refund_failed_withdrawal", {
        p_wallet_id: wallet_id,
        p_usd_amount: usdAmount,
        p_fee_usd: feeUsd,
        p_transaction_id: transaction_id,
        p_reason: "Missing Heleket payout credentials",
      });
      return NextResponse.json(
        { error: "Crypto payout gateway not configured" },
        { status: 500 },
      );
    }

    const payoutPayload: Record<string, any> = {
      amount: cryptoAmount.toFixed(8),
      currency,
      order_id: reference,
      address,
      is_subtract: true, // fee taken from the amount
      url_callback: `${appUrl}/api/heleket/payout-webhook`,
    };

    if (network) {
      payoutPayload.network = network;
    }

    const sign = createHeleketSign(payoutPayload, payoutApiKey);

    try {
      const heleketRes = await fetch("https://api.heleket.com/v1/payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          merchant: merchantId,
          sign,
        },
        body: JSON.stringify(payoutPayload),
      });

      const heleketData = await heleketRes.json();

      if (!heleketRes.ok || !heleketData?.result) {
        throw new Error(
          heleketData?.message ||
            heleketData?.error ||
            "Heleket payout rejected",
        );
      }

      const result = heleketData.result;

      // Update transaction
      await supabase
        .from("wallet_transactions")
        .update({
          status: "processing",
          reference, // keep our reference
          metadata: {
            type: "crypto",
            asset,
            currency,
            network,
            address,
            crypto_amount: cryptoAmount,
            usd_amount: usdAmount,
            heleket_uuid: result.uuid,
            heleket_status: result.status,
            provider: "heleket",
          },
        })
        .eq("id", transaction_id);

      return NextResponse.json({
        success: true,
        status: "processing",
        transaction_id,
        reference,
        heleket_uuid: result.uuid,
      });
    } catch (err: any) {
      console.error("[crypto withdraw] Heleket error → rolling back", err);

      await supabase.rpc("refund_failed_withdrawal", {
        p_wallet_id: wallet_id,
        p_usd_amount: usdAmount,
        p_fee_usd: feeUsd,
        p_transaction_id: transaction_id,
        p_reason: err?.message || "Heleket payout failed",
      });

      throw err;
    }
  } catch (error: any) {
    console.error("[crypto withdraw]", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Crypto withdrawal processing failure",
      },
      { status: 400 },
    );
  }
}