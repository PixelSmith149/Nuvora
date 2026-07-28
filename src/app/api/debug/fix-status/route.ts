// app/api/debug/fix-status/route.ts

import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { auditId, status } = await req.json();

		const supabase = createClient(
			process.env.SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!,
		);

		const { data, error } = await supabase
			.from("asset_audits")
			.update({ status: status || "AUTHENTICATING" })
			.eq("id", auditId)
			.select();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true, data });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
