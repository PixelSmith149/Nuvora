// app/api/market-place/verify-asset/route.ts

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import yauzl from "yauzl";

// ─── Environment Variables ──────────────────────────────────
const supabaseUrl =
	process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("🔍 [verify-asset] SUPABASE_URL exists:", !!supabaseUrl);
console.log("🔍 [verify-asset] SUPABASE_KEY exists:", !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
	console.error("❌ [verify-asset] Missing environment variables!");
}

const supabaseAdmin =
	supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

console.log("🔍 [verify-asset] supabaseAdmin initialized:", !!supabaseAdmin);

// ─── POST Handler ───────────────────────────────────────────
export async function POST(req: NextRequest) {
	console.log("🔍 [verify-asset] POST request received");

	try {
		if (!supabaseAdmin) {
			console.error("❌ [verify-asset] supabaseAdmin is null");
			return NextResponse.json(
				{ error: "Server configuration error: Missing Supabase credentials." },
				{ status: 500 },
			);
		}

		const authHeader = req.headers.get("Authorization");
		console.log("🔍 [verify-asset] Auth header present:", !!authHeader);

		if (!authHeader) {
			return NextResponse.json({ error: "Unauthenticated." }, { status: 401 });
		}

		const { listingId, toolId, storagePath } = await req.json();
		console.log("🔍 [verify-asset] listingId:", listingId);
		console.log("🔍 [verify-asset] toolId:", toolId);
		console.log("🔍 [verify-asset] storagePath:", storagePath);

		if (!listingId || !toolId) {
			console.error("❌ [verify-asset] Missing required fields");
			return NextResponse.json(
				{ error: "Missing required fields: listingId, toolId" },
				{ status: 400 },
			);
		}

		// ─── STEP 0: Get tool record to check asset type ──────
		const { data: toolRecord, error: toolFetchError } = await supabaseAdmin
			.from("one_time_digital_tools")
			.select("asset_category, asset_type, storage_vault_path")
			.eq("id", toolId)
			.single();

		if (toolFetchError || !toolRecord) {
			console.error("❌ [verify-asset] Tool record not found:", toolFetchError);
			await failListing(
				listingId,
				toolId,
				"FAILED_CORRUPTED",
				"Tool record not found.",
			);
			return NextResponse.json(
				{ verified: false, reason: "Tool record not found" },
				{ status: 400 },
			);
		}

		// ─── STEP 1: Handle Non-File Assets ─────────────────────
		// If asset_type is not 'file', skip the file scan entirely
		if (toolRecord.asset_type !== "file") {
			console.log(
				`✅ [verify-asset] Non-file asset detected (${toolRecord.asset_type}). Skipping scan.`,
			);

			await Promise.all([
				supabaseAdmin
					.from("one_time_digital_tools")
					.update({
						safety_status: "PASSED",
						safety_logs: `Non-file asset. Type: ${toolRecord.asset_type}. Category: ${toolRecord.asset_category || "custom"}. No scan required.`,
						scanned_at: new Date().toISOString(),
					})
					.eq("id", toolId),

				supabaseAdmin
					.from("market_listings")
					.update({
						status: "active",
					})
					.eq("id", listingId),
			]);

			return NextResponse.json({
				verified: true,
				status: "PASSED",
				message: `Non-file asset (${toolRecord.asset_type}) verified and listing is now active`,
				assetType: toolRecord.asset_type,
			});
		}

		// ─── STEP 2: Check if storagePath exists for file assets ─
		if (!storagePath) {
			console.error("❌ [verify-asset] Missing storagePath for file asset");
			await failListing(
				listingId,
				toolId,
				"FAILED_CORRUPTED",
				"Missing storage path for file asset.",
			);
			return NextResponse.json(
				{ verified: false, reason: "Missing storage path" },
				{ status: 400 },
			);
		}

		// ─── STEP 3: Download file from storage ──────────────────
		console.log("🔍 [verify-asset] Downloading file from:", storagePath);
		const { data: fileBuffer, error: downloadErr } = await supabaseAdmin.storage
			.from("assets-private")
			.download(storagePath);

		if (downloadErr || !fileBuffer) {
			console.error("❌ [verify-asset] Download error:", downloadErr);
			await failListing(
				listingId,
				toolId,
				"FAILED_CORRUPTED",
				"Failed to retrieve file asset from storage vault.",
			);
			return NextResponse.json(
				{
					verified: false,
					reason: "Storage read error",
					error: downloadErr?.message,
				},
				{ status: 400 },
			);
		}

		console.log("✅ [verify-asset] File downloaded, size:", fileBuffer.size);
		const buffer = Buffer.from(await fileBuffer.arrayBuffer());

		// ─── STEP 4: SHA-256 checksum ─────────────────────────
		const fileChecksum = crypto
			.createHash("sha256")
			.update(buffer)
			.digest("hex");
		console.log(
			"🔍 [verify-asset] File checksum:",
			fileChecksum.substring(0, 16) + "...",
		);

		// ─── STEP 5: Detect file type ──────────────────────────
		const magicNumber = buffer.toString("hex", 0, 4).toUpperCase();
		console.log("🔍 [verify-asset] Magic number:", magicNumber);

		const isZip = magicNumber === "504B0304";
		const isJson =
			magicNumber === "7B0A2020" ||
			magicNumber === "7B0D0A20" ||
			buffer.toString("utf8", 0, 1) === "{";
		const isPdf = magicNumber === "25504446";
		const isPng = magicNumber === "89504E47";
		const isJpg = magicNumber === "FFD8FFE0" || magicNumber === "FFD8FFE1";
		const isGif = magicNumber === "47494638";
		const isWebp = magicNumber === "52494646";
		const isMp4 =
			magicNumber === "00000020" || buffer.toString("hex", 4, 8) === "66747970";

		const safetyStatus = "PASSED";
		let safetyLog = `File scanned. Type: `;

		if (isZip) {
			safetyLog += "ZIP Archive. ";
			console.log(
				"🔍 [verify-asset] ZIP file detected - running security scan...",
			);

			// ─── STEP 6: Scan ZIP contents ────────────────────────
			let scanResult: { passed: boolean; reason?: string } = { passed: true };

			await new Promise<void>((resolve, reject) => {
				yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
					if (err || !zipfile) {
						console.error("❌ [verify-asset] Yauzl error:", err);
						failListing(
							listingId,
							toolId,
							"FAILED_CORRUPTED",
							`Archive read breakdown: ${err?.message}`,
						);
						scanResult = {
							passed: false,
							reason: err?.message || "Archive read error",
						};
						reject(new Error(scanResult.reason));
						return;
					}

					let hasError = false;
					let entryCount = 0;
					zipfile.readEntry();

					zipfile.on("entry", (entry) => {
						entryCount++;
						console.log(
							`🔍 [verify-asset] Scanning entry ${entryCount}: ${entry.fileName}`,
						);

						const isEncrypted = (entry.generalPurposeBitFlags & 0x1) !== 0;
						if (isEncrypted) {
							console.error("❌ [verify-asset] Encrypted archive detected");
							failListing(
								listingId,
								toolId,
								"FAILED_ENCRYPTED",
								"Archive is locked with a password.",
							);
							hasError = true;
							scanResult = {
								passed: false,
								reason: "Archive is encrypted with password",
							};
							zipfile.close();
							reject(new Error(scanResult.reason));
							return;
						}

						const lowerName = entry.fileName.toLowerCase();
						const bannedExtensions = [
							".exe",
							".dmg",
							".bat",
							".sh",
							".cmd",
							".com",
							".scr",
							".msi",
						];
						if (bannedExtensions.some((ext) => lowerName.endsWith(ext))) {
							console.error(`❌ [verify-asset] Banned file: ${entry.fileName}`);
							failListing(
								listingId,
								toolId,
								"FAILED_MALWARE",
								`Banned executable: [${entry.fileName}]`,
							);
							hasError = true;
							scanResult = {
								passed: false,
								reason: `Banned file type: ${entry.fileName}`,
							};
							zipfile.close();
							reject(new Error(scanResult.reason));
							return;
						}

						zipfile.readEntry();
					});

					zipfile.on("end", async () => {
						console.log(
							`✅ [verify-asset] Scan complete. ${entryCount} entries scanned.`,
						);

						if (!hasError) {
							safetyLog += `${entryCount} entries scanned. No threats detected.`;
							console.log("✅ [verify-asset] All checks passed!");
						}
						resolve();
					});

					zipfile.on("error", (err) => {
						console.error("❌ [verify-asset] Zip error:", err);
						failListing(
							listingId,
							toolId,
							"FAILED_CORRUPTED",
							`Archive processing error: ${err.message}`,
						);
						scanResult = { passed: false, reason: err.message };
						reject(err);
					});
				});
			});

			if (!scanResult.passed) {
				return NextResponse.json(
					{ verified: false, reason: scanResult.reason },
					{ status: 400 },
				);
			}
		} else {
			// ✅ Non-ZIP files - skip deep scan
			console.log(
				`✅ [verify-asset] Non-ZIP file detected. Skipping deep scan.`,
			);

			if (isJson) safetyLog += "JSON file. ";
			else if (isPdf) safetyLog += "PDF file. ";
			else if (isPng || isJpg || isGif || isWebp) safetyLog += "Image file. ";
			else if (isMp4) safetyLog += "Video file. ";
			else safetyLog += "Unknown format. ";

			safetyLog += "No security scan required.";
		}

		// ─── STEP 7: Update Records ────────────────────────────
		console.log("✅ [verify-asset] Updating records...");

		await Promise.all([
			supabaseAdmin
				.from("one_time_digital_tools")
				.update({
					safety_status: safetyStatus,
					file_checksum: fileChecksum,
					safety_logs: safetyLog,
					scanned_at: new Date().toISOString(),
				})
				.eq("id", toolId),

			supabaseAdmin
				.from("market_listings")
				.update({
					status: "active",
				})
				.eq("id", listingId),
		]);

		console.log("✅ [verify-asset] Verification complete!");
		return NextResponse.json({
			verified: true,
			status: "PASSED",
			checksum: fileChecksum,
			message: "Asset verified and listing is now active",
			fileType: isZip ? "ZIP" : "Other",
		});
	} catch (err: any) {
		console.error("❌ [verify-asset] Error:", err.message);
		console.error("❌ [verify-asset] Stack:", err.stack);
		return NextResponse.json(
			{ verified: false, status: "FAILED", reason: err.message },
			{ status: 400 },
		);
	}
}

// ─── Helper: Fail Listing ──────────────────────────────────
async function failListing(
	listingId: string,
	toolId: string,
	status: string,
	log: string,
) {
	console.log(
		`🔍 [failListing] Failing listing ${listingId} with status ${status}`,
	);

	if (!supabaseAdmin) {
		console.error("❌ [failListing] supabaseAdmin is null");
		return;
	}

	try {
		await Promise.all([
			supabaseAdmin
				.from("one_time_digital_tools")
				.update({
					safety_status: status,
					safety_logs: log,
					scanned_at: new Date().toISOString(),
				})
				.eq("id", toolId),

			supabaseAdmin
				.from("market_listings")
				.update({
					status: "suspended",
				})
				.eq("id", listingId),
		]);
		console.log("✅ [failListing] Records updated");
	} catch (err) {
		console.error("❌ [failListing] Error updating records:", err);
	}
}
