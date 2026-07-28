import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(req.url);

	const query = searchParams.get("q")?.trim().toLowerCase() || "";

	// Users current account follows
	const { data: follows, error: followsError } = await supabase
		.from("follows")
		.select("following_id")
		.eq("follower_id", user.id);

	if (followsError) {
		return NextResponse.json({ error: followsError.message }, { status: 500 });
	}

	if (!follows?.length) {
		return NextResponse.json({
			recipients: [],
		});
	}

	const recipientIds = follows.map((row) => row.following_id);

	const profilesQuery = supabase
		.from("profiles")
		.select(`
      id,
      username,
      display_name,
      avatar_url
    `)
		.in("id", recipientIds);

	const { data: profiles, error: profilesError } = await profilesQuery;

	if (profilesError) {
		return NextResponse.json({ error: profilesError.message }, { status: 500 });
	}

	let recipients = profiles ?? [];

	// local search inside follow list only
	if (query) {
		recipients = recipients.filter((profile) =>
			[profile.username, profile.display_name]
				.filter(Boolean)
				.some((value) => value!.toLowerCase().includes(query)),
		);
	}

	return NextResponse.json({
		recipients,
	});
}
