import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GLOBAL_SUPPORTED_CURRENCIES } from "@/lib/wallet/currency/constants";
import {
  convertToUSD,
  convertFromUSD,
  type Currency,
} from "@/lib/wallet/currency/convert";

const PAYSTACK_CHARGE_CURRENCY = "GHS" as const;

export async function POST(req: Request) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecret) {
    return NextResponse.json(
      { error: "Server payment configuration missing" },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { amount?: number; currency?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const displayAmount = Number(body.amount);
  if (!Number.isFinite(displayAmount) || displayAmount <= 0) {
    return NextResponse.json({ error: "Invalid top-up amount" }, { status: 400 });
  }

  const displayCurrency = (body.currency || "USD").toUpperCase() as Currency;

  const isSupported = GLOBAL_SUPPORTED_CURRENCIES.some(
    (c) => c.code.toUpperCase() === displayCurrency,
  );
  if (!isSupported) {
    return NextResponse.json(
      { error: `Currency ${displayCurrency} is not supported for entry` },
      { status: 400 },
    );
  }

  let ledgerAmountUsd: number;
  let chargeAmountGhs: number;

  try {
    // Display → USD (wallet ledger)
    ledgerAmountUsd = await convertToUSD(displayAmount, displayCurrency);

    // USD → GHS (Paystack charge — Ghana merchant)
    if (displayCurrency === "GHS") {
      chargeAmountGhs = displayAmount;
    } else {
      const ghs = await convertFromUSD(ledgerAmountUsd, "GHS");
      chargeAmountGhs = ghs.amount;
    }
  } catch (err) {
    console.error("FX conversion failed:", err);
    return NextResponse.json(
      { error: "Unable to convert currency. Try again." },
      { status: 502 },
    );
  }

  if (!Number.isFinite(chargeAmountGhs) || chargeAmountGhs < 1) {
    return NextResponse.json(
      { error: "Amount is too small after conversion to GHS" },
      { status: 400 },
    );
  }

  if (!Number.isFinite(ledgerAmountUsd) || ledgerAmountUsd <= 0) {
    return NextResponse.json({ error: "Invalid ledger amount" }, { status: 400 });
  }

  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) {
    console.error("Paystack Topup Wallet Error:", walletError);
    return NextResponse.json({ error: "Wallet lookup failed" }, { status: 404 });
  }

  const reference = `pb-${crypto.randomUUID()}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const initialMeta = {
    display_currency: displayCurrency,
    display_amount: displayAmount,
    charge_currency: PAYSTACK_CHARGE_CURRENCY,
    charge_amount: chargeAmountGhs,
    ledger_currency: "USD",
    ledger_amount: ledgerAmountUsd,
    user_id: user.id,
    initiated_at: new Date().toISOString(),
  };

  // amount = intended USD credit (ingest still uses paid GHS from webhook)
  const { data: pendingTx, error: dbError } = await supabase
  .from("wallet_transactions")
  .insert({
    wallet_id: wallet.id,
    reference,
    // Ledger intent (USD)
    amount: ledgerAmountUsd,
    currency: "USD",
    ledger_currency: "USD",
    // What Paystack will charge
    charge_currency: "GHS",
    charge_amount: chargeAmountGhs,
    status: "pending",
    provider: "paystack",
    meta: {
      ...initialMeta,
      user_id: user.id,
    },
  })
  .select("id")
  .single();

  if (dbError || !pendingTx) {
    console.error("Paystack Audit Record Error:", dbError);
    return NextResponse.json(
      { error: "Failed to create payment audit record" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(chargeAmountGhs * 100), // pesewas
        currency: PAYSTACK_CHARGE_CURRENCY, // always GHS
        reference,
        callback_url: `${siteUrl}/account/wallet/paystack/callback`,
        channels: ["card", "bank", "mobile_money", "bank_transfer"],
        metadata: {
          user_id: user.id,
          wallet_id: wallet.id,
          transaction_id: pendingTx.id,
          display_currency: displayCurrency,
          display_amount: displayAmount,
          charge_currency: PAYSTACK_CHARGE_CURRENCY,
          charge_amount: chargeAmountGhs,
          ledger_amount: ledgerAmountUsd,
        },
      }),
    });

    const payload = await res.json();

    if (!res.ok || !payload.status) {
      await supabase
        .from("wallet_transactions")
        .update({
          status: "failed",
          meta: {
            ...initialMeta,
            error: payload.message || "Rejected by Paystack",
          },
        })
        .eq("id", pendingTx.id);

      return NextResponse.json(
        { error: payload.message || "Payment initialization rejected" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      authorization_url: payload.data.authorization_url,
      reference,
      charge_currency: PAYSTACK_CHARGE_CURRENCY,
      charge_amount: chargeAmountGhs,
      ledger_amount: ledgerAmountUsd,
      ledger_currency: "USD",
    });
  } catch {
    await supabase
      .from("wallet_transactions")
      .update({
        status: "failed",
        meta: { ...initialMeta, error: "Network error during setup" },
      })
      .eq("id", pendingTx.id);

    return NextResponse.json(
      { error: "Failed to communicate with Paystack payment gateway" },
      { status: 502 },
    );
  }
}