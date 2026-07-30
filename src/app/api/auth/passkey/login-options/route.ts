import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { cookies } from "next/headers";

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || "localhost";

export async function POST() {
  try {
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: "preferred",
    });

    const cookieStore = await cookies();
    cookieStore.set("webauthn_auth_challenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    });

    return NextResponse.json(options);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate authentication options." },
      { status: 500 }
    );
  }
}