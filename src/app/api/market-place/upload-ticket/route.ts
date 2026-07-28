// app/api/market-place/upload-ticket/route.ts

import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

console.log("🔍 [upload-ticket] Module loading...");

const supabaseUrl =
	process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 [upload-ticket] SUPABASE_URL exists:", !!supabaseUrl);
console.log("🔍 [upload-ticket] SUPABASE_KEY exists:", !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
	console.error("❌ [upload-ticket] Missing environment variables!");
}

const supabaseAdmin =
	supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

console.log("🔍 [upload-ticket] supabaseAdmin initialized:", !!supabaseAdmin);

export async function POST(req: NextRequest) {
	console.log("🔍 [upload-ticket] POST request received");

	try {
		// ─── Check Admin Client ───────────────────────────────────
		if (!supabaseAdmin) {
			console.error("❌ [upload-ticket] supabaseAdmin is null");
			return NextResponse.json(
				{ error: "Server configuration error: Missing Supabase credentials." },
				{ status: 500 },
			);
		}

		// ─── Auth ───────────────────────────────────────────────
		console.log("🔍 [upload-ticket] Checking authorization...");
		const authHeader = req.headers.get("Authorization");
		console.log("🔍 [upload-ticket] Auth header present:", !!authHeader);

		if (!authHeader) {
			console.error("❌ [upload-ticket] No auth header");
			return NextResponse.json(
				{ error: "Missing Authorization header." },
				{ status: 401 },
			);
		}

		const jwt = authHeader.replace("Bearer ", "");
		console.log("🔍 [upload-ticket] JWT length:", jwt.length);

		console.log("🔍 [upload-ticket] Getting user from JWT...");
		const {
			data: { user },
			error: authErr,
		} = await supabaseAdmin.auth.getUser(jwt);

		if (authErr) {
			console.error("❌ [upload-ticket] Auth error:", authErr.message);
			console.error(
				"❌ [upload-ticket] Auth error details:",
				JSON.stringify(authErr, null, 2),
			);
			return NextResponse.json(
				{ error: `Authentication failed: ${authErr.message}` },
				{ status: 403 },
			);
		}

		if (!user) {
			console.error("❌ [upload-ticket] No user found");
			return NextResponse.json(
				{ error: "User not found. Please log in again." },
				{ status: 403 },
			);
		}

		console.log("🔍 [upload-ticket] User authenticated:", user.id);

		// ─── Parse Request ──────────────────────────────────────
		console.log("🔍 [upload-ticket] Parsing request body...");
		const body = await req.json().catch((err) => {
			console.error("❌ [upload-ticket] Failed to parse JSON:", err);
			return null;
		});

		if (!body) {
			return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
		}

		const { fileName, fileType, isPublicBucket = false } = body;
		console.log("🔍 [upload-ticket] fileName:", fileName);
		console.log("🔍 [upload-ticket] fileType:", fileType);
		console.log("🔍 [upload-ticket] isPublicBucket:", isPublicBucket);

		if (!fileName) {
			console.error("❌ [upload-ticket] Missing fileName");
			return NextResponse.json({ error: "Missing fileName" }, { status: 400 });
		}

		// ─── Generate Storage Path ──────────────────────────────
		const targetBucket = isPublicBucket
			? "marketplace-public"
			: "assets-private";
		const fileUuid = uuidv4();
		const fileExtension = fileName.split(".").pop() || "bin";
		const storagePath = `${user.id}/${fileUuid}.${fileExtension}`;

		console.log("🔍 [upload-ticket] targetBucket:", targetBucket);
		console.log("🔍 [upload-ticket] storagePath:", storagePath);

		// ─── Check if Bucket Exists ──────────────────────────────
		console.log("🔍 [upload-ticket] Checking if bucket exists...");
		const { data: buckets, error: listErr } =
			await supabaseAdmin.storage.listBuckets();

		if (listErr) {
			console.error("❌ [upload-ticket] Failed to list buckets:", listErr);
		} else {
			const bucketExists = buckets?.some((b) => b.name === targetBucket);
			console.log(
				`🔍 [upload-ticket] Bucket "${targetBucket}" exists:`,
				bucketExists,
			);
			console.log(
				"🔍 [upload-ticket] Available buckets:",
				buckets?.map((b) => b.name).join(", "),
			);

			if (!bucketExists) {
				console.error(
					`❌ [upload-ticket] Bucket "${targetBucket}" does NOT exist!`,
				);
				return NextResponse.json(
					{
						error: `Storage bucket "${targetBucket}" does not exist. Please create it in Supabase dashboard.`,
					},
					{ status: 500 },
				);
			}
		}

		// ─── Create Signed Upload URL ───────────────────────────
		console.log("🔍 [upload-ticket] Creating signed upload URL...");
		console.log(`🔍 [upload-ticket] From: ${targetBucket}`);
		console.log(`🔍 [upload-ticket] Path: ${storagePath}`);

		const { data, error: signErr } = await supabaseAdmin.storage
			.from(targetBucket)
			.createSignedUploadUrl(storagePath);

		if (signErr) {
			console.error("❌ [upload-ticket] Signed URL error:", signErr);
			console.error(
				"❌ [upload-ticket] Error details:",
				JSON.stringify(signErr, null, 2),
			);

			// Try to get more info about the error
			if (signErr.message?.includes("bucket")) {
				console.error(
					"❌ [upload-ticket] This likely means the bucket does not exist or is not accessible.",
				);
			}

			return NextResponse.json(
				{
					error: `Failed to generate upload URL: ${signErr.message}`,
					details: signErr.message,
				},
				{ status: 500 },
			);
		}

		if (!data?.signedUrl) {
			console.error("❌ [upload-ticket] No signedUrl returned");
			console.error(
				"🔍 [upload-ticket] Data received:",
				JSON.stringify(data, null, 2),
			);
			return NextResponse.json(
				{ error: "Failed to generate signed URL - no URL returned." },
				{ status: 500 },
			);
		}

		console.log("✅ [upload-ticket] Signed URL generated successfully");
		console.log("🔍 [upload-ticket] Signed URL length:", data.signedUrl.length);
		console.log("🔍 [upload-ticket] tokenPath:", data.token);

		return NextResponse.json({
			uploadUrl: data.signedUrl,
			storagePath: storagePath,
			tokenPath: data.token,
		});
	} catch (err: any) {
		console.error("❌ [upload-ticket] Unhandled error:", err);
		console.error("❌ [upload-ticket] Stack:", err.stack);
		return NextResponse.json(
			{ error: err.message || "Internal server error" },
			{ status: 500 },
		);
	}
}
