// app/api/storage/download/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
	const supabase = await createClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const { path, fileName } = await req.json();

		if (!path) {
			return NextResponse.json({ error: "Missing path" }, { status: 400 });
		}

		// ─── Generate signed URL for the file ──────────────────
		const { data, error: signError } = await supabase.storage
			.from("assets-private")
			.createSignedUrl(path, 60); // 60 seconds expiry

		if (signError) {
			console.error("Sign URL error:", signError);
			return NextResponse.json({ error: signError.message }, { status: 400 });
		}

		if (!data?.signedUrl) {
			return NextResponse.json(
				{ error: "Failed to generate download URL" },
				{ status: 400 },
			);
		}

		// Return the signed URL - frontend will handle the download
		return NextResponse.json({
			url: data.signedUrl,
			fileName: fileName || path.split("/").pop() || "download",
		});
	} catch (err: any) {
		console.error("Download error:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
