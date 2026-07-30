import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecret) {
    return NextResponse.json(
      { error: "Server payment configuration missing" },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { amount?: number; phone?: string; network?: string; currency?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { amount, phone, network, currency } = body;

  if (!amount || amount <= 0 || !phone || !network || !currency) {
    return NextResponse.json({ error: "Missing required payment details" }, { status: 400 });
  }

  // 1. Fetch user wallet
  const { data: wallet, error: walletError } = await supabase
    .from("wallet_balances")
    .select("wallet_id")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) {
    return NextResponse.json({ error: "Wallet lookup failed" }, { status: 404 });
  }

  const reference = `pb-momo-${crypto.randomUUID()}`;

  // 2. Insert audit transaction
  const { data: pendingTx, error: dbError } = await supabase
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.wallet_id,
      reference: reference,
      amount: Number(amount),
      status: "pending",
      provider: "paystack_momo",
      meta: {
        currency,
        phone,
        network,
        user_id: user.id,
        initiated_at: new Date().toISOString(),
      },
    })
    .select("id")
    .single();

  if (dbError || !pendingTx) {
    return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 });
  }

  // 3. Initiate Direct Charge on Paystack
  try {
    const res = await fetch("https://api.paystack.co/charge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(Number(amount) * 100),
        currency,
        reference,
        mobile_money: {
          phone,
          provider: network,
        },
        metadata: {
          user_id: user.id,
          wallet_id: wallet.wallet_id,
          transaction_id: pendingTx.id,
        },
      }),
    });

    const payload = await res.json();

    if (!res.ok || !payload.status) {
      await supabase
        .from("wallet_transactions")
        .update({ status: "failed", meta: { error: payload.message } })
        .eq("id", pendingTx.id);

      return NextResponse.json({ error: payload.message || "MoMo charge failed" }, { status: 400 });
    }

    // Return reference directly for Realtime tracking
    return NextResponse.json({ reference });
  } catch (error) {
    await supabase
      .from("wallet_transactions")
      .update({ status: "failed", meta: { error: "Network error" } })
      .eq("id", pendingTx.id);

    return NextResponse.json({ error: "Paystack communication error" }, { status: 502 });
  }
}