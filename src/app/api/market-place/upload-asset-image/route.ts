// app/api/market-place/upload-asset-image/route.ts

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const auditId = formData.get("auditId") as string;

		// Validate required fields
		if (!file || !auditId) {
			return NextResponse.json(
				{ error: "Missing file or auditId" },
				{ status: 400 },
			);
		}

		// Validate file size (5MB max)
		if (file.size > 5 * 1024 * 1024) {
			return NextResponse.json(
				{ error: "File too large (max 5MB)" },
				{ status: 400 },
			);
		}

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{
					error:
						"Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
				},
				{ status: 400 },
			);
		}

		// Initialize Supabase client
		const supabaseUrl = process.env.SUPABASE_URL;
		const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

		if (!supabaseUrl || !supabaseKey) {
			console.error("❌ Missing Supabase environment variables");
			return NextResponse.json(
				{ error: "Server configuration error" },
				{ status: 500 },
			);
		}

		const supabase = createClient(supabaseUrl, supabaseKey);

		// Convert file to buffer
		const buffer = Buffer.from(await file.arrayBuffer());
		const fileExt = file.name.split(".").pop() || "jpg";
		const fileName = `${auditId}/${randomUUID()}.${fileExt}`;

		// Upload to Supabase Storage
		const { error: uploadError } = await supabase.storage
			.from("asset-cover-images")
			.upload(fileName, buffer, {
				contentType: file.type,
				upsert: false,
			});

		if (uploadError) {
			console.error("❌ Upload error:", uploadError);
			return NextResponse.json(
				{ error: `Failed to upload image: ${uploadError.message}` },
				{ status: 500 },
			);
		}

		// Get public URL - FIXED: Safe access with null check
		const { data: urlData } = supabase.storage
			.from("asset-cover-images")
			.getPublicUrl(fileName);

		// ✅ FIX 1 & 2: Check if urlData exists and has publicUrl
		if (!urlData || !urlData.publicUrl) {
			console.error("❌ Failed to get public URL for uploaded file");
			return NextResponse.json(
				{ error: "Failed to generate public URL for uploaded image" },
				{ status: 500 },
			);
		}

		// ✅ Return the URL
		return NextResponse.json({
			url: urlData.publicUrl,
			success: true,
		});
	} catch (error: any) {
		console.error("❌ Upload handler error:", error);
		return NextResponse.json(
			{ error: error.message || "Internal server error" },
			{ status: 500 },
		);
	}
}
