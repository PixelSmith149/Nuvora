// app/api/st/charge/route.ts

import { type NextRequest, NextResponse } from "next/server";
import {
	chargeForBuild,
	getSiteChargeStatus,
} from "@/lib/st/services/charge.service";
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
		const { siteId } = body;

		if (!siteId) {
			return NextResponse.json(
				{ error: "Site ID is required" },
				{ status: 400 },
			);
		}

		// Verify site exists and belongs to user
		const { data: site } = await supabase
			.from("user_sites")
			.select("id")
			.eq("id", siteId)
			.eq("user_id", user.id)
			.single();

		if (!site) {
			return NextResponse.json(
				{ error: "Site not found or unauthorized" },
				{ status: 404 },
			);
		}

		// Check if already charged
		const status = await getSiteChargeStatus(siteId);
		if (status === "success") {
			return NextResponse.json({
				success: true,
				message: "Already charged",
				status: "success",
			});
		}

		const result = await chargeForBuild(user.id, siteId);
		return NextResponse.json(result);
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

		const status = await getSiteChargeStatus(siteId);
		return NextResponse.json({ status });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
