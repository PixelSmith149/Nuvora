// app/api/st/link-in-bio/upload/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
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
		const formData = await req.formData();
		const file = formData.get("file") as File;
		const type = formData.get("type") as string; // 'avatar' or 'cover'

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		if (!type || !["avatar", "cover"].includes(type)) {
			return NextResponse.json(
				{ error: "Invalid upload type" },
				{ status: 400 },
			);
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			return NextResponse.json(
				{ error: "File size must be less than 5MB" },
				{ status: 400 },
			);
		}

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: "Only JPEG, PNG, WebP, and GIF are allowed" },
				{ status: 400 },
			);
		}

		// Generate unique filename
		const ext = file.name.split(".").pop();
		const filename = `${user.id}/${type}-${uuidv4()}.${ext}`;

		// Upload to Supabase Storage
		const { data, error } = await supabase.storage
			.from("link-in-bio")
			.upload(filename, file, {
				cacheControl: "3600",
				upsert: true,
			});

		if (error) {
			console.error("Upload error:", error);
			return NextResponse.json(
				{ error: "Failed to upload image" },
				{ status: 500 },
			);
		}

		// Get public URL
		const {
			data: { publicUrl },
		} = supabase.storage.from("link-in-bio").getPublicUrl(filename);

		return NextResponse.json({
			success: true,
			url: publicUrl,
			filename,
		});
	} catch (error: any) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ error: error.message || "Upload failed" },
			{ status: 500 },
		);
	}
}
