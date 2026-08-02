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

    // 1. Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse & validate
    const body = await req.json();
    const usdAmount = Number(body.usdAmount);

    if (!usdAmount || usdAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid USD amount" },
        { status: 400 },
      );
    }

    // 3. Resolve wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: "Internal ledger entity profile not found" },
        { status: 404 },
      );
    }

    // 4. Platform reference
    const reference = `CRYPTO-${Date.now()}-${randomUUID()}`;

    // 5. Heleket credentials (deposit / invoice key)
    const merchantId = process.env.HELEKET_MERCHANT_ID;
    const paymentApiKey = process.env.HELEKET_PAYMENT_API_KEY; // deposit + invoice key
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!merchantId || !paymentApiKey) {
      console.error("Missing HELEKET_MERCHANT_ID or HELEKET_PAYMENT_API_KEY");
      return NextResponse.json(
        { error: "Crypto gateway server configuration mismatch error." },
        { status: 500 },
      );
    }

    // 6. Create invoice on Heleket
    // Amount is in USD. User selects crypto + network on Heleket payment page.
    const invoicePayload = {
      amount: usdAmount.toFixed(2),
      currency: "USD",
      order_id: reference,
      url_callback: `${appUrl}/api/heleket/webhook`,
      url_return: `${appUrl}/account/wallet`,
      url_success: `${appUrl}/account/wallet`,
      lifetime: 3600, // 1 hour
      is_payment_multiple: false,
    };

    const sign = createHeleketSign(invoicePayload, paymentApiKey);

    const heleketResponse = await fetch("https://api.heleket.com/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchant: merchantId,
        sign,
      },
      body: JSON.stringify(invoicePayload),
    });

    const invoiceData = await heleketResponse.json();

    if (!heleketResponse.ok || !invoiceData?.result?.url) {
      console.error("Heleket invoice rejection:", invoiceData);
      return NextResponse.json(
        {
          error:
            invoiceData?.message ||
            invoiceData?.error ||
            "Failed to create invoice on Heleket",
        },
        { status: 400 },
      );
    }

    const result = invoiceData.result;

    // 7. Insert pending transaction
    const { error: txError } = await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      reference,
      type: "deposit",
      provider: "heleket",
      status: "pending",
      amount_usd: usdAmount,
      metadata: {
        estimated_usd: usdAmount,
        heleket_uuid: result.uuid,
        heleket_order_id: reference,
        currency: "USD",
      },
    });

    if (txError) {
      console.error("Database tracking layer injection error:", txError);
      throw txError;
    }

    // 8. Return to frontend
    return NextResponse.json({
      reference,
      checkoutUrl: result.url, // https://pay.heleket.com/pay/<uuid>
      address: result.address || null,
      uuid: result.uuid,
    });
  } catch (error: any) {
    console.error("Critical Crypto Topup Exception:", error);
    return NextResponse.json(
      {
        error:
          error?.message || "Failed to create live ledger payment request context",
      },
      { status: 500 },
    );
  }
}