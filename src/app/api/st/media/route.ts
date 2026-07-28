// app/api/st/media/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { data, error } = await supabase
			.from("user_media")
			.select("*")
			.eq("user_id", user.id)
			.order("uploaded_at", { ascending: false });

		if (error) {
			console.error("Media fetch error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ media: data || [] });
	} catch (error: any) {
		console.error("Media API error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
