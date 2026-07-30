import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authenticator } from "otplib";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Get the user's 2FA secret + status
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("two_factor_secret, two_factor_enabled")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Unable to load security settings" },
        { status: 500 }
      );
    }

    // Safety: only allow challenge if 2FA is actually enabled
    if (!profile.two_factor_enabled || !profile.two_factor_secret) {
      return NextResponse.json(
        { error: "Two-factor authentication is not enabled" },
        { status: 400 }
      );
    }

    const isValid = authenticator.verify({
      token: code.replace(/\s/g, ""),
      secret: profile.two_factor_secret,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid authenticator code" },
        { status: 400 }
      );
    }

    // Optional: you can set a short-lived cookie / claim here if you want
    // extra protection, but for most apps verifying the code is enough.

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication verified",
    });
  } catch (error: any) {
    console.error("2FA challenge error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}