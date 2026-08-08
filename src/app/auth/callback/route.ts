// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { trackReferral } from "@/lib/referral/referral.service";
import { ReferralType } from "@/lib/referral/referral.types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // 1. Resolve referral parameters from URL or cookie
  let referralCode = url.searchParams.get("ref");
  let referralType: ReferralType = "publish";

  if (!referralCode) {
    const cookieStore = await cookies();
    const refCookie = cookieStore.get("nu_referral")?.value;

    if (refCookie) {
      try {
        // Support both JSON payload and plain string
        if (refCookie.startsWith("{")) {
          const parsed = JSON.parse(refCookie);
          referralCode = parsed.code || null;
          referralType = (parsed.type as ReferralType) || "publish";
        } else {
          referralCode = refCookie;
        }
      } catch (err) {
        console.error("Failed to parse nu_referral cookie:", err);
      }
    }
  }

  if (!code) {
    return NextResponse.redirect(new URL("/signup", url.origin));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/signup?error=auth_failed", url.origin)
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  // ─── Clean & Safe Referral Tracking ────────────────────────────────
  if (referralCode) {
    try {
      const cleanCode = referralCode.trim().toUpperCase();

      // Resolve from the correct table (referral_codes)
      const { data: codeRecord } = await supabase
        .from("referral_codes")
        .select("id, user_id")
        .eq("code", cleanCode)
        .eq("active", true)
        .maybeSingle();

      if (codeRecord && codeRecord.user_id !== user.id) {
        await trackReferral(
          codeRecord.user_id,
          user.id,
          cleanCode,
          referralType
        );
      }
    } catch (refError) {
      // Never block the user from logging in because of referral issues
      console.error("OAuth referral tracking error:", refError);
    }
  }

  // Clear the referral cookie after processing
  const response = NextResponse.redirect(new URL("/account", url.origin));
  response.cookies.set("nu_referral", "", {
    maxAge: 0,
    path: "/",
  });

  // 2FA check
  const { data: profile } = await supabase
    .from("profiles")
    .select("two_factor_enabled")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.two_factor_enabled === true) {
    return NextResponse.redirect(new URL("/auth/2fa-challenge", url.origin));
  }

  return response;
}