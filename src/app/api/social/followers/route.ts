// app/api/social/followers/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
	const supabase = await createClient();

	const { searchParams } = new URL(req.url);
	const userId = searchParams.get("user_id");

	if (!userId) {
		return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
	}

	try {
		// ✅ Get followers count
		const { count: followersCount, error: followersError } = await supabase
			.from("follows")
			.select("follower_id", { count: "exact", head: true })
			.eq("following_id", userId);

		if (followersError) {
			console.error("❌ Followers count error:", followersError);
			return NextResponse.json(
				{ error: followersError.message || "Failed to get followers count" },
				{ status: 500 },
			);
		}

		// ✅ Get following count
		const { count: followingCount, error: followingError } = await supabase
			.from("follows")
			.select("following_id", { count: "exact", head: true })
			.eq("follower_id", userId);

		if (followingError) {
			console.error("❌ Following count error:", followingError);
			return NextResponse.json(
				{ error: followingError.message || "Failed to get following count" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			followers: followersCount || 0,
			following: followingCount || 0,
		});
	} catch (err: any) {
		console.error("❌ [followers] Unexpected error:", err);
		return NextResponse.json(
			{ error: err.message || "Internal server error" },
			{ status: 500 },
		);
	}
}
