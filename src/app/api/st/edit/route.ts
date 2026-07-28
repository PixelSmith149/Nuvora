// app/api/st/edit/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getAIService } from "@/lib/st/services/ai.service";
import {
	applyEditToHtml,
	getSiteEdits,
	saveSiteEdit,
} from "@/lib/st/services/edit.service";
import { getSiteById, updateSiteHtml } from "@/lib/st/services/site.service";
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
		const { siteId, section, editType, newContent, oldContent } = body;

		if (!siteId || !section || !editType || !newContent) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Verify ownership
		const site = await getSiteById(siteId);
		if (!site || site.user_id !== user.id) {
			return NextResponse.json(
				{ error: "Site not found or unauthorized" },
				{ status: 404 },
			);
		}

		// Check AI health
		const ai = getAIService();
		const health = await ai.healthCheck();

		if (!health.healthy) {
			return NextResponse.json(
				{
					error:
						"AI service temporarily unavailable. Please try again in a few minutes.",
					type: "ai_unavailable",
				},
				{ status: 503 },
			);
		}

		// Check if session is active (free edits) or manual
		const isFreeEdit =
			site.is_session_active && site.session_expires_at
				? new Date(site.session_expires_at) > new Date()
				: false;

		// Save the edit
		const edit = await saveSiteEdit(
			siteId,
			user.id,
			section,
			newContent,
			editType as "text" | "color" | "layout",
			oldContent,
		);

		// Apply edit to HTML if we have HTML code
		let updatedSite = site;
		if (site.html_code) {
			const newHtml = await applyEditToHtml(
				site.html_code,
				section,
				newContent,
			);
			updatedSite = await updateSiteHtml(siteId, newHtml, site.status);
		}

		return NextResponse.json({
			success: true,
			edit,
			site: updatedSite,
			isFreeEdit,
		});
	} catch (error: any) {
		console.error("Edit error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to apply edit" },
			{ status: 500 },
		);
	}
}

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
		const siteId = url.searchParams.get("siteId");

		if (!siteId) {
			return NextResponse.json(
				{ error: "Site ID is required" },
				{ status: 400 },
			);
		}

		const site = await getSiteById(siteId);
		if (!site || site.user_id !== user.id) {
			return NextResponse.json(
				{ error: "Site not found or unauthorized" },
				{ status: 404 },
			);
		}

		const edits = await getSiteEdits(siteId);
		return NextResponse.json({ edits });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
