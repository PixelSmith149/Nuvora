// app/api/st/upload/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// ─── Upload to Supabase Storage ──────────────────────────────────
		const fileExt = file.name.split(".").pop();
		const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
		const fileBuffer = await file.arrayBuffer();

		const { data, error } = await supabase.storage
			.from("template-previews")
			.upload(fileName, fileBuffer, {
				contentType: file.type,
				cacheControl: "3600",
				upsert: false,
			});

		if (error) {
			console.error("Upload error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// ─── Get public URL ──────────────────────────────────────────────
		const { data: urlData } = supabase.storage
			.from("template-previews")
			.getPublicUrl(fileName);

		return NextResponse.json({
			url: urlData.publicUrl,
			fileName,
			success: true,
		});
	} catch (error: any) {
		console.error("Upload error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
