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
	const query = searchParams.get("q")?.trim();

	if (!query) {
		return NextResponse.json({ users: [] });
	}

	// search users by username or display_name
	const { data, error } = await supabase
		.from("profiles")
		.select("id, username, display_name, avatar_url")
		.or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
		.neq("id", user.id) // 🚫 no self selection
		.limit(10);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ users: data ?? [] });
}
