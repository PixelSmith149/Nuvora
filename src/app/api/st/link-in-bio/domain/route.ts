// app/api/st/link-in-bio/domain/route.ts

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

	try {
		const body = await req.json();
		const { domain } = body;

		if (!domain) {
			return NextResponse.json(
				{ error: "Domain is required" },
				{ status: 400 },
			);
		}

		// Clean domain
		const cleanDomain = domain
			.replace(/^https?:\/\//, "")
			.replace(/\/.*$/, "")
			.toLowerCase();

		// Check if domain is already taken
		const { data: existing } = await supabase
			.from("link_in_bio_profiles")
			.select("id")
			.eq("custom_domain", cleanDomain)
			.neq("user_id", user.id)
			.maybeSingle();

		if (existing) {
			return NextResponse.json(
				{ error: "Domain is already taken" },
				{ status: 400 },
			);
		}

		// Update profile with custom domain
		const { data: profile, error } = await supabase
			.from("link_in_bio_profiles")
			.update({ custom_domain: cleanDomain })
			.eq("user_id", user.id)
			.select()
			.single();

		if (error) throw error;

		return NextResponse.json({
			success: true,
			domain: cleanDomain,
			profile,
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
