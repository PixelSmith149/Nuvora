// app/api/market-place/verify-socio/route.ts

import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { runAssetVerificationEngine } from "@/lib/accountAuditor";

// ─── Module-scoped admin client (initialized once) ─────────
const supabaseUrl =
	process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
	console.error("❌ [ROUTE] Supabase env vars missing at module init");
}

const supabaseAdmin =
	supabaseUrl && supabaseServiceKey
		? createClient(supabaseUrl, supabaseServiceKey)
		: null;

// ─── Helper: resolve the user ID from the JWT ──────────────
async function resolveUserId(
	authHeader: string | null,
): Promise<string | null> {
	if (!authHeader || !supabaseUrl || !supabaseServiceKey) return null;

	// Use a short-lived client that carries the user's JWT
	const userClient = createClient(supabaseUrl, supabaseServiceKey, {
		global: { headers: { Authorization: authHeader } },
	});

	const {
		data: { user },
		error,
	} = await userClient.auth.getUser();

	if (error || !user) {
		console.error(
			"❌ [ROUTE] Failed to resolve user from JWT:",
			error?.message,
		);
		return null;
	}
	return user.id;
}

// ─── POST handler ──────────────────────────────────────────
export async function POST(req: NextRequest) {
	try {
		if (!supabaseAdmin) {
			return NextResponse.json(
				{
					error: "Server cluster failed to resolve environment configurations.",
				},
				{ status: 500 },
			);
		}

		const authHeader = req.headers.get("Authorization");
		const userId = await resolveUserId(authHeader);
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthenticated operational access." },
				{ status: 401 },
			);
		}

		// ✅ FIX: Parse all fields including facebookUsername
		const { auditId, platformId, username, password, facebookUsername } =
			await req.json();

		if (!auditId || !platformId || !username || !password) {
			return NextResponse.json(
				{ error: "Missing core tracking parameters." },
				{ status: 400 },
			);
		}

		// 1. Fetch platform config
		const { data: configRow, error: configError } = await supabaseAdmin
			.from("platform_configurations")
			.select("*")
			.eq("id", platformId)
			.single();

		if (configError || !configRow) {
			return NextResponse.json(
				{ error: "Target platform selector footprint unmapped." },
				{ status: 404 },
			);
		}

		// 2. Verify the audit record exists AND belongs to this user
		const { data: auditRow } = await supabaseAdmin
			.from("asset_audits")
			.select("id, user_id")
			.eq("id", auditId)
			.maybeSingle();

		if (!auditRow) {
			return NextResponse.json(
				{ error: "Audit record not found. Please restart the process." },
				{ status: 404 },
			);
		}

		// Stamp user_id onto the audit row so RLS policies can match it
		if (!auditRow.user_id) {
			await supabaseAdmin
				.from("asset_audits")
				.update({ user_id: userId })
				.eq("id", auditId);
		}

		// 3. Invoke the Playwright engine.
		//    ✅ FIX: Include facebookUsername in the authGroup
		const isFacebook =
			platformId === "facebook" || platformId === "facebook_com";

		runAssetVerificationEngine({
			auditId,
			config: configRow,
			authGroup: {
				u: username,
				p: password,
				// ✅ FIX: Only pass facebookUsername if it's a Facebook platform
				...(isFacebook && facebookUsername ? { facebookUsername } : {}),
			},
		}).catch(async (err) => {
			console.error("🚨 Background worker error:", err.message);
			try {
				await supabaseAdmin
					.from("asset_audits")
					.update({
						status: "FAILED_TIMEOUT",
						error_message: `Worker crashed: ${err.message}`,
					})
					.eq("id", auditId);
			} catch (dbErr) {
				console.warn("Failed to update error status in database:", dbErr);
			}
		});

		// Return immediate acknowledgment — the frontend tracks progress via realtime
		return NextResponse.json(
			{
				processing: true,
				status: "INITIALIZED",
				message: "Verification worker started. Monitor progress via the UI.",
			},
			{ status: 202 },
		);
	} catch (err: any) {
		console.error("🚨 Route failure:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
