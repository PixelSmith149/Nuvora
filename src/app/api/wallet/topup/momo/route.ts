import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getPaystackProviderCode(network: string): string {
  const normalizedNet = network.toLowerCase().trim();
  switch (normalizedNet) {
    case "mtn": return "MTN";
    case "telecel":
    case "vodafone":
    case "vod": return "VOD";
    case "at":
    case "airteltigo":
    case "atl": return "ATL";
    case "mpesa":
    case "safaricom": return "MPESA";
    case "orange": return "ORA";
    case "moov": return "MOV";
    default: return network.toUpperCase();
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, phone, network, currency = "GHS", email } = body;

    if (!amount || Number(amount) <= 0 || !phone || !network) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json({ error: "Paystack secret key missing." }, { status: 500 });
    }

    let userEmail = email;
    const authHeader = req.headers.get("Authorization");
    if (!userEmail && authHeader) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.email) userEmail = user.email;
    }

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const providerCode = getPaystackProviderCode(network);
    const amountInMinorUnits = Math.round(Number(amount) * 100);

    const paystackResponse = await fetch("https://api.paystack.co/charge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        amount: amountInMinorUnits,
        currency: currency.toUpperCase(),
        mobile_money: {
          phone: cleanPhone,
          provider: providerCode,
        },
      }),
    });

    const chargeResult = await paystackResponse.json();

    if (!paystackResponse.ok || !chargeResult.status) {
      return NextResponse.json(
        { error: chargeResult.message || "Failed to initiate Mobile Money charge." },
        { status: paystackResponse.status || 400 }
      );
    }

    const resData = chargeResult.data;

    // Paystack status can be "send_otp", "pay_offline", or "pending"
    return NextResponse.json({
      success: true,
      reference: resData.reference,
      status: resData.status, 
      displayText: resData.displayText || resData.message || "Charge initiated.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error." }, { status: 500 });
  }
}