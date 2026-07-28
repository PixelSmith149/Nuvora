// app/api/st/media/upload/route.ts

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

		// ─── Validate file type ──────────────────────────────────────────
		const validImageTypes = [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
			"image/svg+xml",
		];
		const validVideoTypes = ["video/mp4", "video/webm", "video/mov"];
		const isImage = validImageTypes.includes(file.type);
		const isVideo = validVideoTypes.includes(file.type);

		if (!isImage && !isVideo) {
			return NextResponse.json(
				{ error: "Unsupported file type" },
				{ status: 400 },
			);
		}

		// ─── Upload to Supabase Storage ──────────────────────────────────
		const fileExt = file.name.split(".").pop();
		const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
		const fileBuffer = await file.arrayBuffer();

		// ─── Check if bucket exists, create if not ──────────────────────
		const { data: buckets } = await supabase.storage.listBuckets();
		const bucketExists = buckets?.some((b) => b.name === "template-media");

		if (!bucketExists) {
			await supabase.storage.createBucket("template-media", {
				public: true,
				fileSizeLimit: 52428800, // 50MB
			});
		}

		const { data: uploadData, error: uploadError } = await supabase.storage
			.from("template-media")
			.upload(fileName, fileBuffer, {
				contentType: file.type,
				cacheControl: "3600",
				upsert: false,
			});

		if (uploadError) {
			console.error("Upload error:", uploadError);
			return NextResponse.json({ error: uploadError.message }, { status: 500 });
		}

		// ─── Get public URL ──────────────────────────────────────────────
		const { data: urlData } = supabase.storage
			.from("template-media")
			.getPublicUrl(fileName);

		// ─── Save to database ─────────────────────────────────────────────
		const { data: media, error: dbError } = await supabase
			.from("user_media")
			.insert({
				user_id: user.id,
				url: urlData.publicUrl,
				name: file.name,
				type: isImage ? "image" : "video",
				size: file.size,
				mime_type: file.type,
				uploaded_at: new Date().toISOString(),
			})
			.select()
			.single();

		if (dbError) {
			// ─── Clean up storage if DB insert fails ──────────────────────
			await supabase.storage.from("template-media").remove([fileName]);
			console.error("DB insert error:", dbError);
			return NextResponse.json({ error: dbError.message }, { status: 500 });
		}

		return NextResponse.json(media);
	} catch (error: any) {
		console.error("Upload error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
