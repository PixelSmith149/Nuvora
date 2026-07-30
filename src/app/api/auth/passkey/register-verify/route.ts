import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || "localhost";
const ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000";

function sanitizeDeviceName(input: unknown): string {
  if (typeof input !== "string") return "Biometrics / Security Key";
  const cleaned = input.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 64);
  return cleaned || "Biometrics / Security Key";
}

function toBase64Url(value: string | Uint8Array): string {
  if (typeof value === "string") {
    return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return Buffer.from(value).toString("base64url");
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

    const expectedChallenge = cookieStore.get("webauthn_reg_challenge")?.value;
    const challengeUserId = cookieStore.get("webauthn_reg_user")?.value;

    if (!expectedChallenge || !challengeUserId) {
      return NextResponse.json(
        { error: "Registration session expired. Please try again." },
        { status: 400 }
      );
    }

    if (challengeUserId !== user.id) {
      return NextResponse.json({ error: "Invalid registration session." }, { status: 403 });
    }

    const body = await req.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json({ error: "Missing credential." }, { status: 400 });
    }

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Passkey verification failed." }, { status: 400 });
    }

    const { credential: cred } = verification.registrationInfo;
    const credentialID = toBase64Url(cred.id);
    const publicKeyBase64 = Buffer.from(cred.publicKey).toString("base64");
    const signCount = cred.counter ?? 0;
    const deviceName = sanitizeDeviceName(body.deviceName ?? body.deviceLabel);

    const { data: inserted, error: insertError } = await supabase
      .from("passkeys")
      .insert({
        user_id: user.id,
        credential_id: credentialID,
        public_key: publicKeyBase64,
        sign_count: signCount,
        device_name: deviceName,
        last_used: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();

    if (insertError) {
      // Unique violation = already registered
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "This passkey is already registered." },
          { status: 409 }
        );
      }
      console.error("[register-verify] insert:", insertError);
      return NextResponse.json({ error: "Failed to save passkey." }, { status: 500 });
    }

    cookieStore.delete("webauthn_reg_challenge");
    cookieStore.delete("webauthn_reg_user");

    return NextResponse.json({
      success: true,
      passkeyId: inserted?.id ?? null,
    });
  } catch (err: unknown) {
    cookieStore.delete("webauthn_reg_challenge");
    cookieStore.delete("webauthn_reg_user");
    console.error("[register-verify] fatal:", err);
    return NextResponse.json(
      { error: "Failed to complete passkey registration." },
      { status: 500 }
    );
  }
}