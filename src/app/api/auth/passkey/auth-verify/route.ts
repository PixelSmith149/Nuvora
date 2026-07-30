import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || "localhost";
const ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000";

function normalizeCredentialId(id: string): string {
  return id.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function POST(req: Request) {
  const cookieStore = await cookies();

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const expectedChallenge = cookieStore.get("webauthn_auth_challenge")?.value;
    const challengeUserId = cookieStore.get("webauthn_auth_user")?.value;

    if (!expectedChallenge || !challengeUserId) {
      return NextResponse.json(
        { error: "Authentication session expired. Please try again." },
        { status: 400 }
      );
    }

    if (challengeUserId !== user.id) {
      return NextResponse.json({ error: "Invalid authentication session." }, { status: 403 });
    }

    const body = await req.json();
    const { credential } = body;

    if (!credential?.id) {
      return NextResponse.json({ error: "Missing credential." }, { status: 400 });
    }

    const credentialId = normalizeCredentialId(credential.id);

    const { data: passkey, error: passkeyError } = await supabase
      .from("passkeys")
      .select("id, credential_id, public_key, sign_count")
      .eq("user_id", user.id)
      .eq("credential_id", credentialId)
      .maybeSingle();

    // Fallback: some browsers return id in different encoding
    let record = passkey;
    if (!record) {
      const { data: all } = await supabase
        .from("passkeys")
        .select("id, credential_id, public_key, sign_count")
        .eq("user_id", user.id);

      record =
        all?.find(
          (p) => normalizeCredentialId(p.credential_id) === credentialId
        ) || null;
    }

    if (passkeyError || !record) {
      return NextResponse.json({ error: "Passkey not recognized." }, { status: 400 });
    }

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: record.credential_id,
        publicKey: Buffer.from(record.public_key, "base64"),
        counter: record.sign_count ?? 0,
        transports: ["internal"] as AuthenticatorTransportFuture[],
      },
      requireUserVerification: true,
    });

        if (!verification.verified) {
      return NextResponse.json({ error: "Passkey verification failed." }, { status: 400 });
    }

    const newCounter = verification.authenticationInfo.newCounter ?? record.sign_count ?? 0;

    await supabase
      .from("passkeys")
      .update({
        sign_count: newCounter,
        last_used: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", record.id);

    // Clean up WebAuthn challenge cookies
    cookieStore.delete("webauthn_auth_challenge");
    cookieStore.delete("webauthn_auth_user");

    // ─── THIS is what unlocks the app ─────────────────────────
    cookieStore.delete("app_locked");

    // Optional client-readable signal (your existing logic)
    cookieStore.set("passkey_unlocked", "1", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    cookieStore.delete("webauthn_auth_challenge");
    cookieStore.delete("webauthn_auth_user");
    console.error("[auth-verify] fatal:", err);
    return NextResponse.json(
      { error: "Failed to verify passkey." },
      { status: 500 }
    );
  }
 
}