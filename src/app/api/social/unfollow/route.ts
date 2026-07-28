// app/api/social/unfollow/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await req.json();
	const { target_user_id } = body;

	if (!target_user_id) {
		return NextResponse.json(
			{ error: "Missing target_user_id" },
			{ status: 400 },
		);
	}

	// ✅ Delete using composite key
	const { error } = await supabase
		.from("follows")
		.delete()
		.eq("follower_id", user.id)
		.eq("following_id", target_user_id);

	if (error) {
		console.error("❌ Unfollow error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	const { count: followersCount } = await supabase
		.from("follows")
		.select("follower_id", { count: "exact", head: true })
		.eq("following_id", target_user_id);

	return NextResponse.json({
		success: true,
		followed: false,
		followers_count: followersCount || 0,
	});
}
