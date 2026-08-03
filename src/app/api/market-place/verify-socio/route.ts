import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runAssetVerificationEngine } from "@/services/accountAuditor"; // ← new modular engine

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify user
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await req.json();
    const { auditId, platformId, username, password, facebookUsername } = body;

    if (!auditId || !platformId || !username || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Load platform config
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: config, error: configError } = await supabaseAdmin
      .from("platform_configurations")
      .select("*")
      .eq("id", platformId)
      .single();

    if (configError || !config) {
      return NextResponse.json(
        { error: `Platform config not found: ${platformId}` },
        { status: 404 }
      );
    }

    // Fire and forget the worker (do not await long running process)
    runAssetVerificationEngine({
      auditId,
      config: {
        id: config.id,
        login_url: config.login_url,
        username_selector: config.username_selector,
        password_selector: config.password_selector,
        submit_selector: config.submit_selector,
        followers_extractor_js: config.followers_extractor_js || null,
      },
      authGroup: {
        u: username,
        p: password,
        facebookUsername: facebookUsername || undefined,
      },
    }).catch((err) => {
      console.error("Worker crashed:", err);
    });

    return NextResponse.json({
      success: true,
      message: "Verification worker started",
      auditId,
    });
  } catch (error: any) {
    console.error("verify-socio error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}