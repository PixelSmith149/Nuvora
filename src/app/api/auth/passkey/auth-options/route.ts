import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

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

    const { data: passkeys, error } = await supabase
      .from("passkeys")
      .select("credential_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("[auth-options] load passkeys:", error.message);
      return NextResponse.json({ error: "Failed to load passkeys." }, { status: 500 });
    }

    if (!passkeys?.length) {
      return NextResponse.json(
        { error: "No passkey registered on this account." },
        { status: 400 }
      );
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: "preferred",
      allowCredentials: passkeys.map((p) => ({
        id: p.credential_id,
      })),
    });

    const cookieStore = await cookies();

    cookieStore.set("webauthn_auth_challenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    });

    cookieStore.set("webauthn_auth_user", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300,
      path: "/",
    });

    return NextResponse.json(options);
  } catch (err) {
    console.error("[auth-options] fatal:", err);
    return NextResponse.json(
      { error: "Failed to generate authentication options." },
      { status: 500 }
    );
  }
}