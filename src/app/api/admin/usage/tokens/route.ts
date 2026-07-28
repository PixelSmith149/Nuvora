// app/api/admin/usage/tokens/route.ts

import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	// ─── Use Service Role Key ──────────────────────────────────────
	const supabaseAdmin = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	);

	try {
		const body = await req.json();
		const { build_id, tokens, cost, model } = body;

		if (!build_id || !tokens) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const { data, error } = await supabaseAdmin
			.from("ai_usage_logs")
			.insert({
				build_id,
				tokens,
				cost: cost || (tokens / 1000) * 0.015,
				model: model || "gpt-4o-mini",
				created_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (error) {
			console.error("Token log error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true, data });
	} catch (error: any) {
		console.error("Token tracking error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
