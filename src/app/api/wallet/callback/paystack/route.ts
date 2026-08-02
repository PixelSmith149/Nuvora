import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ingestDeposit } from "@/lib/wallet/deposit/ingestDeposit";
import type { Currency } from "@/lib/wallet/currency/convert";

const ZERO_DECIMAL = new Set(["XOF", "XAF", "GNF", "RWF", "UGX"]);

function toMajor(amountMinor: number, currency: string) {
  if (ZERO_DECIMAL.has(currency.toUpperCase())) return amountMinor;
  return amountMinor / 100;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference =
    searchParams.get("reference") || searchParams.get("trxref");
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!reference) {
    return NextResponse.redirect(
      `${siteUrl}/account/wallet?status=error&message=Missing+reference`,
    );
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    return NextResponse.redirect(
      `${siteUrl}/account/wallet?status=error&message=Server+configuration+error`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${siteUrl}/login?redirectTo=/account/wallet`,
    );
  }

  try {
    const { data: tx, error: txError } = await supabase
      .from("wallet_transactions")
      .select("id, wallet_id, status, meta, metadata")
      .eq("reference", reference)
      .maybeSingle();

    if (txError || !tx) {
      return NextResponse.redirect(
        `${siteUrl}/account/wallet?status=error&message=Transaction+not+found`,
      );
    }

    // Unified status
    if (tx.status === "success" || tx.status === "completed") {
      return NextResponse.redirect(
        `${siteUrl}/account/wallet?status=success&reference=${reference}`,
      );
    }

    if (tx.status === "failed" || tx.status === "cancelled") {
      return NextResponse.redirect(
        `${siteUrl}/account/wallet?status=error&message=Transaction+failed`,
      );
    }

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

    const verifyData = await verifyRes.json();

    if (
      !verifyRes.ok ||
      !verifyData.status ||
      verifyData.data?.status !== "success"
    ) {
      await supabase
        .from("wallet_transactions")
        .update({
          status: "failed",
          meta: {
            ...(tx.meta || {}),
            error: verifyData.message || "Paystack verification failed",
          },
        })
        .eq("id", tx.id);

      return NextResponse.redirect(
        `${siteUrl}/account/wallet?status=error&message=Payment+verification+failed`,
      );
    }

    const currency = String(
      verifyData.data.currency || "GHS",
    ).toUpperCase() as Currency;
    const sourceAmountMajor = toMajor(
      Number(verifyData.data.amount),
      currency,
    );

    // SAME path as webhook — idempotent if webhook already ran
    await ingestDeposit({
      wallet_id: tx.wallet_id,
      amount: sourceAmountMajor,
      currency,
      reference,
      provider: "paystack",
      channel: verifyData.data.channel ?? null,
      meta: {
        channel: verifyData.data.channel,
        paystack_id: verifyData.data.id,
        verified_via: "callback",
        gateway_response: verifyData.data.gateway_response,
      },
    });

    return NextResponse.redirect(
      `${siteUrl}/account/wallet?status=success&reference=${reference}`,
    );
  } catch (err: any) {
    console.error("[paystack.callback]", err);
    return NextResponse.redirect(
      `${siteUrl}/account/wallet?status=error&message=Internal+verification+error`,
    );
  }
}