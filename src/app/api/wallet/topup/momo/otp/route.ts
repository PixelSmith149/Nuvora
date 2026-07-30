import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { otp, reference } = await req.json();

    if (!otp || !reference) {
      return NextResponse.json({ error: "OTP and reference are required." }, { status: 400 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json({ error: "Paystack credentials missing." }, { status: 500 });
    }

    const response = await fetch("https://api.paystack.co/charge/submit_otp", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp, reference }),
    });

    const result = await response.json();

    if (!response.ok || !result.status) {
      return NextResponse.json(
        { error: result.message || "Invalid OTP code provided." },
        { status: response.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: result.data.status,
      message: result.data.displayText || "OTP verified! Direct USSD prompt sent to phone.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error submitting OTP." }, { status: 500 });
  }
}