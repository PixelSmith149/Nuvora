// app/api/admin/revenue/stats/route.ts

import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	// ─── Use Service Role Key to bypass RLS ──────────────────────
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
		// ─── 1. Website Build Revenue ($5 per build) ──────────────
		const { data: buildCharges, error: buildError } = await supabaseAdmin
			.from("site_charges")
			.select("amount, created_at")
			.eq("status", "success");

		if (buildError) {
			console.error("Build charges error:", buildError);
		}

		const websiteBuildRevenue =
			buildCharges?.reduce((sum, c) => sum + c.amount, 0) || 0;
		const websiteBuildCount = buildCharges?.length || 0;

		// ─── 2. Platform Fee Revenue (4% of sales) ────────────────
		const { data: feeTransactions, error: feeError } = await supabaseAdmin
			.from("platform_revenue")
			.select("amount, created_at")
			.eq("source", "platform_fee")
			.eq("status", "confirmed");

		if (feeError) {
			console.error("Fee transactions error:", feeError);
		}

		const platformFeeRevenue =
			feeTransactions?.reduce((sum, f) => sum + f.amount, 0) || 0;
		const platformFeeCount = feeTransactions?.length || 0;

		// ─── 3. Today's Revenue ─────────────────────────────────────
		const today = new Date().toISOString().split("T")[0];

		const { data: todayBuilds } = await supabaseAdmin
			.from("site_charges")
			.select("amount")
			.eq("status", "success")
			.gte("created_at", `${today}T00:00:00Z`)
			.lt("created_at", `${today}T23:59:59Z`);

		const todayWebsiteBuild =
			todayBuilds?.reduce((sum, c) => sum + c.amount, 0) || 0;

		const { data: todayFees } = await supabaseAdmin
			.from("platform_revenue")
			.select("amount")
			.eq("source", "platform_fee")
			.eq("status", "confirmed")
			.gte("created_at", `${today}T00:00:00Z`)
			.lt("created_at", `${today}T23:59:59Z`);

		const todayPlatformFee =
			todayFees?.reduce((sum, f) => sum + f.amount, 0) || 0;

		// ─── 4. Pending Escrow ──────────────────────────────────────
		const { data: escrow } = await supabaseAdmin
			.from("escrow_holdings")
			.select("amount")
			.eq("status", "pending");

		const pendingEscrow = escrow?.reduce((sum, e) => sum + e.amount, 0) || 0;

		return NextResponse.json({
			totalRevenue: websiteBuildRevenue + platformFeeRevenue,
			websiteBuildRevenue,
			platformFeeRevenue,
			todayWebsiteBuild,
			todayPlatformFee,
			todayTotal: todayWebsiteBuild + todayPlatformFee,
			websiteBuildCount,
			platformFeeCount,
			totalTransactions: websiteBuildCount + platformFeeCount,
			pendingEscrow,
		});
	} catch (error: any) {
		console.error("Revenue stats error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
