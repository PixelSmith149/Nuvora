// app/api/social/follow/status/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(req.url);
	const targetUserId = searchParams.get("target_user_id");

	if (!targetUserId) {
		return NextResponse.json(
			{ error: "Missing target_user_id" },
			{ status: 400 },
		);
	}

	try {
		// ✅ Check if following using composite key
		const { data: follow, error: followError } = await supabase
			.from("follows")
			.select("follower_id, following_id")
			.eq("follower_id", user.id)
			.eq("following_id", targetUserId)
			.maybeSingle();

		if (followError) {
			console.error("❌ Follow status error:", followError);
			return NextResponse.json(
				{ error: followError.message || "Failed to check follow status" },
				{ status: 500 },
			);
		}

		// ✅ Get follower count
		const { count: followersCount, error: countError } = await supabase
			.from("follows")
			.select("follower_id", { count: "exact", head: true })
			.eq("following_id", targetUserId);

		if (countError) {
			console.error("❌ Follower count error:", countError);
		}

		return NextResponse.json({
			is_following: !!follow,
			followers_count: followersCount || 0,
		});
	} catch (err: any) {
		console.error("❌ [follow/status] Unexpected error:", err);
		return NextResponse.json(
			{ error: err.message || "Internal server error" },
			{ status: 500 },
		);
	}
}
