import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const COOKIE = "app_locked";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const res = NextResponse.json({
      locked: false,
      hasPasskey: false,
    });

    res.cookies.delete(COOKIE);

    return res;
  }

  const cookieStore = await cookies();
  const locked = cookieStore.get(COOKIE)?.value === "1";

  const { count } = await supabase
    .from("passkeys")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const hasPasskey = (count ?? 0) > 0;

  // User has no passkey -> remove any stale lock cookie
  if (!hasPasskey) {
    const res = NextResponse.json({
      locked: false,
      hasPasskey: false,
    });

    res.cookies.delete(COOKIE);

    return res;
  }

  return NextResponse.json({
    locked,
    hasPasskey: true,
  });
}