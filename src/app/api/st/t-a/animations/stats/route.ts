// app/api/st/t-a/animations/stats/route.ts

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
			.from("ta_animations")
			.select("type, trigger")
			.eq("user_id", user.id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		const byType: Record<string, number> = {};
		const byTrigger: Record<string, number> = {};

		data.forEach((anim: any) => {
			byType[anim.type] = (byType[anim.type] || 0) + 1;
			byTrigger[anim.trigger] = (byTrigger[anim.trigger] || 0) + 1;
		});

		return NextResponse.json({
			total: data.length,
			byType,
			byTrigger,
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
