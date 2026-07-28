// app/api/st/link-in-bio/click/[linkId]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { trackClick } from "@/lib/st/services/link-in-bio.service";
import { createClient } from "@/lib/supabase/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ linkId: string }> },
) {
	const { linkId } = await params;
	const supabase = await createClient();
	const url = new URL(req.url);
	const redirectUrl = url.searchParams.get("redirect");

	if (!redirectUrl) {
		return NextResponse.json(
			{ error: "No redirect URL provided" },
			{ status: 400 },
		);
	}

	try {
		// Get profile_id for tracking
		const { data: link } = await supabase
			.from("link_in_bio_links")
			.select("profile_id")
			.eq("id", linkId)
			.single();

		if (link) {
			await trackClick(linkId, link.profile_id);
		}

		// Redirect to the actual URL
		return NextResponse.redirect(redirectUrl);
	} catch (error) {
		console.error("Click tracking error:", error);
		// Still redirect even if tracking fails
		return NextResponse.redirect(redirectUrl);
	}
}
