// app/api/market/reusable-upload/route.ts

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import yauzl from "yauzl";

const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
	try {
		const authHeader = req.headers.get("Authorization");
		if (!authHeader)
			return NextResponse.json(
				{ error: "Unauthenticated process entry." },
				{ status: 401 },
			);

		const jwt = authHeader.replace("Bearer ", "");
		const {
			data: { user },
			error: authErr,
		} = await supabaseAdmin.auth.getUser(jwt);
		if (authErr || !user)
			return NextResponse.json({ error: "Access denied." }, { status: 403 });

		const body = await req.json();
		const {
			title,
			description,
			diyManual,
			cautions,
			price,
			coverUrl,
			category,
			rawPayload,
		} = body;

		// 1. Setup the core base listing framework as hidden until cleared by the system
		const { data: listing, error: lErr } = await supabaseAdmin
			.from("market_listings")
			.insert({
				seller_id: user.id,
				title: title.trim(),
				description: description.trim(),
				display_pic_url: coverUrl,
				price: parseFloat(price),
				tab_category: "product",
				product_sale_type: "reusable",
				status: "pending_verification",
			})
			.select()
			.single();

		if (lErr || !listing)
			throw new Error(`Listing setup rejected: ${lErr?.message}`);

		// 2. Map structural payload properties polymorphically inside your schema database row
		let initialStatus: "PENDING_SCAN" | "BYPASSED_TEXT" = "PENDING_SCAN";
		let finalPayload: any = {};

		if (category === "source_code" || category === "design_template") {
			finalPayload = {
				delivery_type: "file_download",
				storage_vault_path: rawPayload.vaultPath,
				file_original_name: rawPayload.fileName,
				file_size_bytes: parseInt(rawPayload.fileSize),
			};
		} else if (category === "ebook_guide") {
			initialStatus = "BYPASSED_TEXT";
			finalPayload = {
				delivery_type: "raw_content_stream",
				secure_text_content: rawPayload.textContent, // Clean markdown/text stream
			};
		} else if (category === "access_code") {
			initialStatus = "BYPASSED_TEXT";
			finalPayload = {
				delivery_type: "credential_release",
				credentials_list: rawPayload.keys
					.split("\n")
					.filter((k: string) => k.trim() !== ""),
			};
		}

		// 3. Write target variables straight to the reusable tracker table
		const { data: product, error: pErr } = await supabaseAdmin
			.from("reusable_digital_products")
			.insert({
				listing_id: listing.id,
				seller_id: user.id,
				asset_category: category,
				product_title: title.trim(),
				product_description: description.trim(),
				usage_guidelines_diy: diyManual.trim(),
				risk_cautions: cautions.trim(),
				sale_price: parseFloat(price),
				display_cover_url: coverUrl,
				fulfillment_payload: finalPayload,
				safety_status: initialStatus,
				safety_logs:
					initialStatus === "BYPASSED_TEXT"
						? "Text entry bypass: Static payload verified without sandbox decompression."
						: "Pending security validation scan.",
			})
			.select()
			.single();

		if (pErr || !product) throw pErr;

		// 4. Trigger structural file scanning asynchronously if binary paths exist
		if (initialStatus === "PENDING_SCAN") {
			runBackgroundFileCheck(
				listing.id,
				product.id,
				rawPayload.vaultPath,
			).catch((err) => console.error(err));
		} else {
			// For instant text access products, auto-activate immediately
			await supabaseAdmin
				.from("market_listings")
				.update({ status: "active" })
				.eq("id", listing.id);
		}

		return NextResponse.json({
			success: true,
			listingId: listing.id,
			productId: product.id,
		});
	} catch (err: any) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}

// Background validation processor logic execution loops
async function runBackgroundFileCheck(
	listingId: string,
	productId: string,
	storagePath: string,
) {
	const { data: fileBuffer } = await supabaseAdmin.storage
		.from("assets-private")
		.download(storagePath);
	if (!fileBuffer) return;

	const buffer = Buffer.from(await fileBuffer.arrayBuffer());
	const fileChecksum = crypto.createHash("sha256").update(buffer).digest("hex");

	// Verify file magic bytes (ZIP header indicator check)
	if (buffer.toString("hex", 0, 4).toUpperCase() !== "504B0304") {
		await invalidateProduct(
			listingId,
			productId,
			"FAILED_CORRUPTED",
			"Structure violation: Uploaded file is not a valid zip bundle.",
		);
		return;
	}

	yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
		if (err || !zipfile) {
			invalidateProduct(
				listingId,
				productId,
				"FAILED_CORRUPTED",
				"Corrupt structural streaming compression layer.",
			);
			return;
		}

		zipfile.readEntry();
		zipfile.on("entry", (entry) => {
			if ((entry.generalPurposeBitFlags & 0x1) !== 0) {
				invalidateProduct(
					listingId,
					productId,
					"FAILED_ENCRYPTED",
					"Malicious security strategy: Archive is password protected.",
				);
				zipfile.close();
				return;
			}

			const lower = entry.fileName.toLowerCase();
			if (
				lower.endsWith(".exe") ||
				lower.endsWith(".bat") ||
				lower.endsWith(".sh") ||
				lower.endsWith(".dmg")
			) {
				invalidateProduct(
					listingId,
					productId,
					"FAILED_MALWARE",
					`Banned execution vector blocked: [${entry.fileName}].`,
				);
				zipfile.close();
				return;
			}
			zipfile.readEntry();
		});

		zipfile.on("end", async () => {
			await supabaseAdmin
				.from("reusable_digital_products")
				.update({
					safety_status: "PASSED",
					file_checksum: fileChecksum,
					safety_logs:
						"Passed file structural analysis and malware vector heuristic scanning.",
				})
				.eq("id", productId);

			await supabaseAdmin
				.from("market_listings")
				.update({ status: "active" })
				.eq("id", listingId);
		});
	});
}

async function invalidateProduct(
	lId: string,
	pId: string,
	flag: any,
	log: string,
) {
	await supabaseAdmin
		.from("reusable_digital_products")
		.update({ safety_status: flag, safety_logs: log })
		.eq("id", pId);
	await supabaseAdmin
		.from("market_listings")
		.update({ status: "suspended" })
		.eq("id", lId);
}
