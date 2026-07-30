import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/signup", url.origin));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/signup?error=auth_failed", url.origin),
    );
  }

  // Session is now established — check 2FA status
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("two_factor_enabled")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.two_factor_enabled === true) {
    // Force the user through the 2FA challenge before reaching /account
    return NextResponse.redirect(new URL("/auth/2fa-challenge", url.origin));
  }

  // No 2FA required
  return NextResponse.redirect(new URL("/account", url.origin));
}