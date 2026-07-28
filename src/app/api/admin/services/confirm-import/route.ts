// app/api/admin/services/confirm-import/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { services } = body;

		if (!services || !Array.isArray(services) || services.length === 0) {
			return NextResponse.json(
				{ error: "No services to import" },
				{ status: 400 },
			);
		}

		let inserted = 0;
		let skipped = 0;
		const errors: string[] = [];
		const insertedIds: string[] = [];

		// ─── Insert each service ──────────────────────────────────────────
		for (const service of services) {
			try {
				// ─── Double-check if already exists ────────────────────────────
				const { data: existing } = await supabase
					.from("services")
					.select("id")
					.eq("provider_service_id", service.provider_service_id)
					.maybeSingle();

				if (existing) {
					skipped++;
					continue;
				}

				// ─── Insert ────────────────────────────────────────────────────
				const { data, error } = await supabase
					.from("services")
					.insert({
						provider_service_id: service.provider_service_id,
						platform: service.platform,
						service_type: service.service_type,
						title: service.title,
						description: service.description,
						price_per_1000: service.price_per_1000,
						avg_time_delivery: service.avg_time_delivery,
						active: true,
						created_at: new Date().toISOString(),
					})
					.select()
					.single();

				if (error) {
					errors.push(`Failed to insert ${service.title}: ${error.message}`);
				} else if (data) {
					inserted++;
					insertedIds.push(data.id);
				}
			} catch (err: any) {
				errors.push(`Error inserting ${service.title}: ${err.message}`);
			}
		}

		return NextResponse.json({
			success: true,
			total_processed: services.length,
			total_inserted: inserted,
			total_skipped: skipped,
			errors,
			inserted_ids: insertedIds,
		});
	} catch (error: any) {
		console.error("Confirm import error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to import services" },
			{ status: 500 },
		);
	}
}
