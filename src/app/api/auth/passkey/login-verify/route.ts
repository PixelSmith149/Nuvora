import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || "localhost";
const ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get("webauthn_auth_challenge")?.value;

    if (!expectedChallenge) {
      return NextResponse.json(
        { error: "Authentication session expired or invalid challenge." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { credential } = body;

    if (!credential || !credential.id) {
      return NextResponse.json(
        { error: "Missing credential response." },
        { status: 400 }
      );
    }

    // 1. Fetch passkey from SQL database by credential_id
    const dbResult = await db.query(
      `SELECT id, user_id, credential_id, public_key, counter 
       FROM public.passkeys 
       WHERE credential_id = $1 LIMIT 1`,
      [credential.id]
    );

    if (dbResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Passkey credential not recognized." },
        { status: 404 }
      );
    }

    const storedPasskey = dbResult.rows[0];

    // 2. Decode Base64 public key back into a Uint8Array / Buffer
    const publicKeyBuffer = Buffer.from(storedPasskey.public_key, "base64");

    // 3. Perform cryptographic verification (updated for @simplewebauthn/server v10+)
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: storedPasskey.credential_id,
        publicKey: publicKeyBuffer,
        counter: Number(storedPasskey.counter),
      },
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: "Invalid biometric signature." },
        { status: 401 }
      );
    }

    const newCounter = verification.authenticationInfo.newCounter;

    // 4. Update signature counter and last_used_at timestamp to prevent replay attacks
    await db.query(
      `UPDATE public.passkeys 
       SET counter = $1, last_used_at = NOW() 
       WHERE id = $2`,
      [newCounter, storedPasskey.id]
    );

    // Clear challenge cookie
    cookieStore.delete("webauthn_auth_challenge");

    return NextResponse.json({
      success: true,
      userId: storedPasskey.user_id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Passkey authentication failed." },
      { status: 500 }
    );
  }
}