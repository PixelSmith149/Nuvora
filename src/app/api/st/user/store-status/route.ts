// app/api/st/user/store-status/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// ─── Get user's store status ──────────────────────────────────────
		const { data: store, error } = await supabase
			.from("global_market_stores")
			.select("id, is_verified")
			.eq("user_id", user.id)
			.maybeSingle();

		if (error) {
			console.error("Store status fetch error:", error);
			return NextResponse.json(
				{ error: "Failed to fetch store status" },
				{ status: 500 },
			);
		}

		// ─── Get user's username for onboarding redirect ──────────────────
		const { data: profile } = await supabase
			.from("profiles")
			.select("username")
			.eq("id", user.id)
			.single();

		const username = profile?.username || "user";

		return NextResponse.json({
			hasStore: !!store,
			isVerified: store?.is_verified || false,
			storeId: store?.id || null,
			username,
		});
	} catch (error: any) {
		console.error("Store status API error:", error);
		return NextResponse.json(
			{ error: error.message || "Internal server error" },
			{ status: 500 },
		);
	}
}
