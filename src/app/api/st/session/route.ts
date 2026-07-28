// app/api/st/session/route.ts

import { type NextRequest, NextResponse } from "next/server";
import {
	endSession,
	extendSession,
	startSession,
} from "@/lib/st/services/site.service";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await req.json();
		const { siteId, action } = body;

		if (!siteId) {
			return NextResponse.json(
				{ error: "Site ID is required" },
				{ status: 400 },
			);
		}

		// Verify ownership
		const { data: site } = await supabase
			.from("user_sites")
			.select("*")
			.eq("id", siteId)
			.eq("user_id", user.id)
			.single();

		if (!site) {
			return NextResponse.json({ error: "Site not found" }, { status: 404 });
		}

		let result;

		switch (action) {
			case "start":
				result = await startSession(siteId);
				break;
			case "end":
				result = await endSession(siteId);
				break;
			case "extend":
				result = await extendSession(siteId);
				break;
			default:
				return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}

		return NextResponse.json({ site: result });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function GET(req: NextRequest) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const url = new URL(req.url);
		const siteId = url.searchParams.get("siteId");

		if (!siteId) {
			return NextResponse.json(
				{ error: "Site ID is required" },
				{ status: 400 },
			);
		}

		const { data: site } = await supabase
			.from("user_sites")
			.select("session_id, session_expires_at, is_session_active")
			.eq("id", siteId)
			.eq("user_id", user.id)
			.single();

		if (!site) {
			return NextResponse.json({ error: "Site not found" }, { status: 404 });
		}

		return NextResponse.json({
			sessionId: site.session_id,
			expiresAt: site.session_expires_at,
			isActive: site.is_session_active,
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
