import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GLOBAL_SUPPORTED_CURRENCIES } from "@/lib/wallet/currency/constants";
import type { Currency } from "@/lib/wallet/currency/convert";

export async function POST(req: Request) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecret) {
    return NextResponse.json(
      { error: "Server payment configuration missing" },
      { status: 500 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Parse and validate input payload
  let body: { amount?: number; currency?: Currency };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawAmount = Number(body.amount);
  if (isNaN(rawAmount) || rawAmount <= 0) {
    return NextResponse.json({ error: "Invalid top-up amount" }, { status: 400 });
  }

  const selectedCurrency = (body.currency || "USD").toUpperCase() as Currency;

  // Verify currency capability
  const isSupported = GLOBAL_SUPPORTED_CURRENCIES.some(
    (c) => c.code.toUpperCase() === selectedCurrency
  );
  if (!isSupported) {
    return NextResponse.json(
      { error: `Currency ${selectedCurrency} is not supported` },
      { status: 400 }
    );
  }

  // 2. Fetch user's wallet
  const { data: wallet, error: walletError } = await supabase
    .from("wallet_balances")
    .select("wallet_id")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) {
    return NextResponse.json(
      { error: "Wallet lookup failed" },
      { status: 404 }
    );
  }

  const reference = `pb-${crypto.randomUUID()}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // 3. Record pending transaction inside DB BEFORE calling Paystack
  const initialMeta = {
    currency: selectedCurrency,
    user_id: user.id,
    initiated_at: new Date().toISOString(),
  };

  const { data: pendingTx, error: dbError } = await supabase
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.wallet_id,
      reference: reference,
      amount: rawAmount,
      status: "pending",
      provider: "paystack",
      meta: initialMeta,
    })
    .select("id")
    .single();

  if (dbError || !pendingTx) {
    return NextResponse.json(
      { error: "Failed to create payment audit record" },
      { status: 500 }
    );
  }

  // 4. Initialize Paystack Checkout Session
  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(rawAmount * 100), // Minor unit conversion (kobo/pesewas/cents)
        currency: selectedCurrency,
        reference: reference,
        callback_url: `${siteUrl}/account/wallet`,
        metadata: {
          user_id: user.id,
          wallet_id: wallet.wallet_id,
          transaction_id: pendingTx.id,
          intended_currency: selectedCurrency,
        },
      }),
    });

    const payload = await res.json();

    if (!res.ok || !payload.status) {
      // Mark transaction as failed without wiping previous meta fields
      await supabase
        .from("wallet_transactions")
        .update({
          status: "failed",
          meta: { ...initialMeta, error: payload.message || "Rejected by Paystack" },
        })
        .eq("id", pendingTx.id);

      return NextResponse.json(
        { error: payload.message || "Payment initialization rejected" },
        { status: 400 }
      );
    }

    // 🎯 MATCHES FRONTEND: Wrap inside `data` property
    return NextResponse.json({
      data: {
        authorization_url: payload.data.authorization_url,
        reference: reference,
      },
    });
  } catch (error) {
    // Clean up pending transaction on connection failure
    await supabase
      .from("wallet_transactions")
      .update({
        status: "failed",
        meta: { ...initialMeta, error: "Network error during setup" },
      })
      .eq("id", pendingTx.id);

    return NextResponse.json(
      { error: "Failed to communicate with Paystack payment gateway" },
      { status: 502 }
    );
  }
}