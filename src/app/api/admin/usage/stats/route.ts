// app/api/admin/usage/stats/route.ts

import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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
		// ─── 1. Total Sellers ──────────────────────────────────────
		const { data: sellers } = await supabaseAdmin
			.from("global_market_stores")
			.select("user_id, is_verified, created_at")
			.eq("is_verified", true);

		const totalSellers = sellers?.length || 0;

		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const activeSellers =
			sellers?.filter((s) => new Date(s.created_at) >= thirtyDaysAgo).length ||
			0;

		// ─── 2. Total Builds ──────────────────────────────────────
		const { data: builds } = await supabaseAdmin
			.from("site_charges")
			.select("id")
			.eq("status", "success");

		const totalBuilds = builds?.length || 0;

		// ─── 3. Token Usage ──────────────────────────────────────
		let totalTokens = 0;
		let totalTokenCost = 0;
		let avgTokensPerBuild = 0;
		let avgCostPerBuild = 0;
		let tokenUsageTrend = 0;

		try {
			// Get real token data from ai_usage_logs
			const { data: tokenData } = await supabaseAdmin
				.from("ai_usage_logs")
				.select("tokens, cost, created_at")
				.order("created_at", { ascending: false })
				.limit(1000);

			if (tokenData && tokenData.length > 0) {
				totalTokens = tokenData.reduce(
					(sum: number, t: any) => sum + (t.tokens || 0),
					0,
				);
				totalTokenCost = tokenData.reduce(
					(sum: number, t: any) => sum + (t.cost || 0),
					0,
				);

				// ✅ Fix: Use totalBuilds from site_charges instead of build_id from logs
				const uniqueBuilds = totalBuilds;
				avgTokensPerBuild = uniqueBuilds > 0 ? totalTokens / uniqueBuilds : 0;
				avgCostPerBuild = uniqueBuilds > 0 ? totalTokenCost / uniqueBuilds : 0;

				// Calculate trend
				const now = new Date();
				const thirtyDaysAgo = new Date(now);
				thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
				const sixtyDaysAgo = new Date(now);
				sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

				const recentTokens = tokenData
					.filter((t: any) => new Date(t.created_at) >= thirtyDaysAgo)
					.reduce((sum: number, t: any) => sum + (t.tokens || 0), 0);

				const previousTokens = tokenData
					.filter(
						(t: any) =>
							new Date(t.created_at) >= sixtyDaysAgo &&
							new Date(t.created_at) < thirtyDaysAgo,
					)
					.reduce((sum: number, t: any) => sum + (t.tokens || 0), 0);

				if (previousTokens > 0) {
					tokenUsageTrend =
						((recentTokens - previousTokens) / previousTokens) * 100;
				}
			}
		} catch (err) {
			console.log("AI usage logs not available yet");
		}

		// ─── 4. Fallback: Estimate based on builds ──────────────
		if (totalTokens === 0 && totalBuilds > 0) {
			const EST_AVG_TOKENS_PER_BUILD = 2500;
			const EST_COST_PER_1K_TOKENS = 0.015;

			totalTokens = totalBuilds * EST_AVG_TOKENS_PER_BUILD;
			totalTokenCost =
				totalBuilds *
				(EST_AVG_TOKENS_PER_BUILD / 1000) *
				EST_COST_PER_1K_TOKENS;
			avgTokensPerBuild = EST_AVG_TOKENS_PER_BUILD;
			avgCostPerBuild =
				(EST_AVG_TOKENS_PER_BUILD / 1000) * EST_COST_PER_1K_TOKENS;
		}

		return NextResponse.json({
			totalTokens,
			totalTokenCost,
			totalSellers,
			activeSellers,
			totalBuilds,
			avgTokensPerBuild,
			avgCostPerBuild,
			tokenUsageTrend,
		});
	} catch (error: any) {
		console.error("Usage stats error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
