// app/api/st/t-a/presets/route.ts

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

		const url = new URL(request.url);
		const category = url.searchParams.get("category");

		let query = supabase
			.from("ta_animation_presets")
			.select("*")
			.order("category", { ascending: true });

		if (category && category !== "all") {
			query = query.eq("category", category);
		}

		const { data, error } = await query;

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ presets: data });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
