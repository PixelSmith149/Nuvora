// app/api/st/t-a/templates/stats/route.ts

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

		const { data, error } = await supabase
			.from("ta_templates")
			.select("is_published, is_public")
			.eq("user_id", user.id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({
			total: data.length,
			published: data.filter((t: any) => t.is_published).length,
			drafts: data.filter((t: any) => !t.is_published).length,
			public: data.filter((t: any) => t.is_public).length,
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
