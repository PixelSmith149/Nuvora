// lib/services/revenue.service.ts

import { createClient } from "@supabase/supabase-js";

export interface RevenueRecord {
	source: "website_build" | "platform_fee";
	amount: number;
	userId?: string;
	referenceId?: string;
	referenceType?: string;
	meta?: Record<string, any>;
}

// ─── Track Revenue ──────────────────────────────────────────────

export async function trackRevenue(record: RevenueRecord): Promise<void> {
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
		const { source, amount, userId, referenceId, referenceType, meta } = record;

		const { error } = await supabaseAdmin.from("platform_revenue").insert({
			source,
			amount,
			user_id: userId || null,
			reference_id: referenceId || null,
			reference_type: referenceType || null,
			status: "confirmed",
			meta: meta || {},
			created_at: new Date().toISOString(),
		});

		if (error) {
			console.error("Failed to track revenue:", error);
		}
	} catch (error) {
		console.error("Revenue tracking error:", error);
	}
}

// ─── Get Revenue Summary ────────────────────────────────────────

export async function getRevenueStats() {
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
		// ─── Website Build Revenue ──────────────────────────────────
		const { data: buildCharges } = await supabaseAdmin
			.from("site_charges")
			.select("amount, created_at")
			.eq("status", "success");

		const websiteBuildRevenue =
			buildCharges?.reduce((sum, c) => sum + c.amount, 0) || 0;
		const websiteBuildCount = buildCharges?.length || 0;

		// ─── Platform Fee Revenue ───────────────────────────────────
		const { data: feeTransactions } = await supabaseAdmin
			.from("platform_revenue")
			.select("amount, created_at")
			.eq("source", "platform_fee")
			.eq("status", "confirmed");

		const platformFeeRevenue =
			feeTransactions?.reduce((sum, f) => sum + f.amount, 0) || 0;
		const platformFeeCount = feeTransactions?.length || 0;

		// ─── Today's Revenue ────────────────────────────────────────
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

		// ─── Pending Escrow ────────────────────────────────────────
		const { data: escrow } = await supabaseAdmin
			.from("escrow_holdings")
			.select("amount")
			.eq("status", "pending");

		const pendingEscrow = escrow?.reduce((sum, e) => sum + e.amount, 0) || 0;

		return {
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
		};
	} catch (error) {
		console.error("Revenue stats error:", error);
		return {
			totalRevenue: 0,
			websiteBuildRevenue: 0,
			platformFeeRevenue: 0,
			todayWebsiteBuild: 0,
			todayPlatformFee: 0,
			todayTotal: 0,
			websiteBuildCount: 0,
			platformFeeCount: 0,
			totalTransactions: 0,
			pendingEscrow: 0,
		};
	}
}
