import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ZERO_DECIMAL = new Set(["XOF", "XAF", "GNF", "RWF", "UGX"]);

function getPaystackProviderCode(network: string): string {
  const n = network.toLowerCase().trim();
  switch (n) {
    case "mtn":
      return "MTN";
    case "telecel":
    case "vodafone":
    case "vod":
      return "VOD";
    case "at":
    case "airteltigo":
    case "atl":
      return "ATL";
    case "mpesa":
    case "safaricom":
      return "MPESA";
    case "orange":
      return "ORA";
    case "moov":
      return "MOV";
    default:
      return network.toUpperCase();
  }
}

function toMinorUnits(amount: number, currency: string): number {
  if (ZERO_DECIMAL.has(currency.toUpperCase())) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, phone, network, currency = "GHS" } = body;

    if (!amount || Number(amount) <= 0 || !phone || !network) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json(
        { error: "Paystack secret key missing." },
        { status: 500 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found." }, { status: 404 });
    }

    const cleanPhone = String(phone).replace(/[^0-9]/g, "");
    const providerCode = getPaystackProviderCode(network);
    const currencyCode = String(currency).toUpperCase();
    const amountMajor = Number(amount);
    const amountInMinorUnits = toMinorUnits(amountMajor, currencyCode);

    // Create pending row BEFORE charge (webhook needs this)
    const reference = `momo-${crypto.randomUUID()}`;

    const meta = {
      channel: "mobile_money",
      network: providerCode,
      phone: cleanPhone,
      display_currency: currencyCode,
      display_amount: amountMajor,
      charge_currency: currencyCode,
      charge_amount: amountMajor,
      initiated_at: new Date().toISOString(),
    };

    const { data: pendingTx, error: dbError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        reference,
        type: "deposit",
        status: "pending",
        provider: "paystack",
        amount: amountMajor, // refined to USD in ingestDeposit if needed
        meta,
      })
      .select("id")
      .single();

    if (dbError || !pendingTx) {
      console.error("[momo] pending insert failed:", dbError);
      return NextResponse.json(
        { error: "Failed to create payment record." },
        { status: 500 },
      );
    }

    const paystackResponse = await fetch("https://api.paystack.co/charge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountInMinorUnits,
        currency: currencyCode,
        reference, // critical: same as DB
        mobile_money: {
          phone: cleanPhone,
          provider: providerCode,
        },
        metadata: {
          user_id: user.id,
          wallet_id: wallet.id,
          transaction_id: pendingTx.id,
          channel: "mobile_money",
        },
      }),
    });

    const chargeResult = await paystackResponse.json();

    if (!paystackResponse.ok || !chargeResult.status) {
      await supabase
        .from("wallet_transactions")
        .update({
          status: "failed",
          meta: { ...meta, error: chargeResult.message },
        })
        .eq("id", pendingTx.id);

      return NextResponse.json(
        { error: chargeResult.message || "Failed to initiate Mobile Money charge." },
        { status: paystackResponse.status || 400 },
      );
    }

    // Paystack may return its own reference — prefer theirs if present
    const resData = chargeResult.data;
    const paystackRef = String(resData.reference || reference);

    if (paystackRef !== reference) {
      await supabase
        .from("wallet_transactions")
        .update({ reference: paystackRef })
        .eq("id", pendingTx.id);
    }

    return NextResponse.json({
      success: true,
      reference: paystackRef,
      status: resData.status,
      displayText:
        resData.display_text ||
        resData.displayText ||
        resData.message ||
        "Charge initiated.",
    });
  } catch (error: any) {
    console.error("[momo]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 },
    );
  }
}