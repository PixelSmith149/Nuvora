import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const RP_NAME = process.env.NEXT_PUBLIC_RP_NAME || "Nuvora";
const RP_ID = process.env.NEXT_PUBLIC_RP_ID || "localhost";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Existing passkeys via Supabase (same DB your app already uses)
    const { data: existing, error: existingError } = await supabase
      .from("passkeys")
      .select("credential_id")
      .eq("user_id", user.id);

    if (existingError) {
      console.warn("[register-options] excludeCredentials:", existingError.message);
    }

    const excludeCredentials = (existing || [])
      .filter((row) => row.credential_id)
      .map((row) => ({ id: row.credential_id as string }));

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: new TextEncoder().encode(user.id),
      userName: user.email || user.id,
      userDisplayName: user.email || user.id,
      attestationType: "none",
      excludeCredentials,
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform",
      },
    });

    const cookieStore = await cookies();

    cookieStore.set("webauthn_reg_challenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    });

    cookieStore.set("webauthn_reg_user", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    });

    return NextResponse.json(options);
  } catch (err: unknown) {
    console.error("[register-options] fatal:", err);
    return NextResponse.json(
      { error: "Failed to generate registration options." },
      { status: 500 }
    );
  }
}