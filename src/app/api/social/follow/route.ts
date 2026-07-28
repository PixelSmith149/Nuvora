// app/api/social/follow/route.ts

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

	if (target_user_id === user.id) {
		return NextResponse.json(
			{ error: "You cannot follow yourself" },
			{ status: 400 },
		);
	}

	// ✅ Check if already following (using composite key)
	const { data: existing, error: checkError } = await supabase
		.from("follows")
		.select("follower_id, following_id") // ✅ No "id" column
		.eq("follower_id", user.id)
		.eq("following_id", target_user_id)
		.maybeSingle();

	if (checkError) {
		console.error("❌ Follow check error:", checkError);
		return NextResponse.json({ error: checkError.message }, { status: 500 });
	}

	if (existing) {
		return NextResponse.json({
			success: true,
			followed: true,
			message: "Already following",
		});
	}

	// ✅ Insert without "id" - composite key handles it
	const { data, error } = await supabase
		.from("follows")
		.insert({
			follower_id: user.id,
			following_id: target_user_id,
			created_at: new Date().toISOString(),
		})
		.select()
		.single();

	if (error) {
		console.error("❌ Follow error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	const { count: followersCount } = await supabase
		.from("follows")
		.select("follower_id", { count: "exact", head: true })
		.eq("following_id", target_user_id);

	return NextResponse.json({
		success: true,
		followed: true,
		followers_count: followersCount || 0,
	});
}
