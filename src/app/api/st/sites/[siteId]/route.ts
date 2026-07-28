// app/api/st/sites/[siteId]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import {
	deleteSite,
	getSiteById,
	updateSiteBlueprint,
	updateSiteHtml,
	updateSiteStatus,
} from "@/lib/st/services/site.service";
import { createClient } from "@/lib/supabase/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ siteId: string }> }, // ✅ Mark params as Promise
) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// ✅ Unwrap params with await
		const { siteId } = await params;

		const site = await getSiteById(siteId);

		if (!site) {
			return NextResponse.json({ error: "Site not found" }, { status: 404 });
		}

		if (site.user_id !== user.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		return NextResponse.json({ site });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ siteId: string }> }, // ✅ Mark params as Promise
) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await req.json();
		const { type, data } = body;

		// ✅ Unwrap params with await
		const { siteId } = await params;

		// Verify ownership
		const site = await getSiteById(siteId);
		if (!site) {
			return NextResponse.json({ error: "Site not found" }, { status: 404 });
		}
		if (site.user_id !== user.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		let updatedSite;

		switch (type) {
			case "blueprint":
				updatedSite = await updateSiteBlueprint(siteId, data);
				break;
			case "html":
				updatedSite = await updateSiteHtml(siteId, data.html, data.status);
				break;
			case "status":
				updatedSite = await updateSiteStatus(siteId, data);
				break;
			default:
				return NextResponse.json(
					{ error: "Invalid update type" },
					{ status: 400 },
				);
		}

		return NextResponse.json({ site: updatedSite });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ siteId: string }> }, // ✅ Mark params as Promise
) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		// ✅ Unwrap params with await
		const { siteId } = await params;

		const site = await getSiteById(siteId);
		if (!site) {
			return NextResponse.json({ error: "Site not found" }, { status: 404 });
		}
		if (site.user_id !== user.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		await deleteSite(siteId);
		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
