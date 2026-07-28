// app/api/st/link-in-bio/export/route.ts

import { type NextRequest, NextResponse } from "next/server";
import {
	getLinks,
	getProfileByUsername,
	getSocials,
} from "@/lib/st/services/link-in-bio.service";
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
		const url = new URL(req.url);
		const username = url.searchParams.get("username");

		if (!username) {
			return NextResponse.json({ error: "Username required" }, { status: 400 });
		}

		const profile = await getProfileByUsername(username);
		if (!profile || profile.user_id !== user.id) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}

		const [links, socials] = await Promise.all([
			getLinks(profile.id),
			getSocials(profile.id),
		]);

		return NextResponse.json({
			profile: {
				display_name: profile.display_name,
				bio: profile.bio,
				avatar_url: profile.avatar_url,
				cover_image_url: profile.cover_image_url,
				contact_email: profile.contact_email,
				contact_phone: profile.contact_phone,
				contact_location: profile.contact_location,
				theme_color: profile.theme_color,
				template_id: profile.template_id,
			},
			links: links.map((l) => ({
				title: l.title,
				url: l.url,
				platform: l.platform,
				icon: l.icon,
			})),
			socials: socials.map((s) => ({
				platform: s.platform,
				url: s.url,
			})),
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
