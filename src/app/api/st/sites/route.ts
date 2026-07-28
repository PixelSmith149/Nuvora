// app/api/st/sites/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { createSite, getUserSites } from "@/lib/st/services/site.service";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const sites = await getUserSites(user.id);
		return NextResponse.json({ sites });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

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
		const { site_name, site_slug } = body; // ✅ Added site_slug

		if (!site_name) {
			return NextResponse.json(
				{ error: "Site name is required" },
				{ status: 400 },
			);
		}

		if (!site_slug || !/^[a-z0-9-]+$/.test(site_slug)) {
			return NextResponse.json(
				{
					error:
						"Slug must contain only lowercase letters, numbers, and hyphens",
				},
				{ status: 400 },
			);
		}

		// Get user's profile for username
		const { data: profile } = await supabase
			.from("profiles")
			.select("username")
			.eq("id", user.id)
			.single();

		if (!profile) {
			return NextResponse.json({ error: "Profile not found" }, { status: 404 });
		}

		// ✅ Pass site_slug as the 4th argument
		const site = await createSite(
			user.id,
			profile.username,
			site_name,
			site_slug,
		);
		return NextResponse.json({ site });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
