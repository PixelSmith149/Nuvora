// app/api/admin/providers/upsert-services/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BATCH_SIZE = 400; // Safe batch size

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { providerId, services } = body;

		if (!providerId) {
			return NextResponse.json(
				{ error: "Provider ID is required" },
				{ status: 400 },
			);
		}

		if (!services || !Array.isArray(services) || services.length === 0) {
			return NextResponse.json(
				{ error: "No services provided" },
				{ status: 400 },
			);
		}

		// ─── Verify provider exists ─────────────────────────────────────
		const { data: provider, error: providerError } = await supabase
			.from("providers")
			.select("id, name")
			.eq("id", providerId)
			.single();

		if (providerError || !provider) {
			return NextResponse.json(
				{ error: "Provider not found" },
				{ status: 404 },
			);
		}

		// ─── Batch Processing ───────────────────────────────────────────
		let totalInserted = 0;
		let totalUpdated = 0;
		let totalProcessed = 0;
		let totalPremium = 0;
		let totalStandard = 0;
		let totalBasic = 0;
		const allErrors: string[] = [];

		// Split services into batches
		for (let i = 0; i < services.length; i += BATCH_SIZE) {
			const batch = services.slice(i, i + BATCH_SIZE);
			const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
			const totalBatches = Math.ceil(services.length / BATCH_SIZE);

			console.log(
				`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} services)...`,
			);

			const { data, error } = await supabase.rpc(
				"upsert_provider_services_smart",
				{
					p_provider_id: providerId,
					p_services: batch,
				},
			);

			if (error) {
				console.error(`❌ Batch ${batchNumber} failed:`, error.message);
				allErrors.push(`Batch ${batchNumber}: ${error.message}`);
				continue; // Continue with next batch instead of failing everything
			}

			const result = data && data[0] ? data[0] : {};

			totalInserted += result.inserted_count || 0;
			totalUpdated += result.updated_count || 0;
			totalProcessed += result.total_count || 0;
			totalPremium += result.premium_count || 0;
			totalStandard += result.standard_count || 0;
			totalBasic += result.basic_count || 0;

			if (result.errors && Array.isArray(result.errors)) {
				allErrors.push(...result.errors);
			}
		}

		console.log(
			`✅ Import finished. Inserted: ${totalInserted}, Updated: ${totalUpdated}`,
		);

		return NextResponse.json({
			success: true,
			providerId,
			providerName: provider.name,
			added: totalInserted,
			updated: totalUpdated,
			total: totalProcessed,
			premium: totalPremium,
			standard: totalStandard,
			basic: totalBasic,
			errors: allErrors.slice(0, 50), // Return only first 50 errors to avoid huge response
			total_errors: allErrors.length,
			message: `Processed ${services.length} services in batches of ${BATCH_SIZE}`,
		});
	} catch (error: any) {
		console.error("Upsert services error:", error);
		return NextResponse.json(
			{
				error: error.message || "Failed to upsert services",
				details: error.stack || null,
			},
			{ status: 500 },
		);
	}
}
