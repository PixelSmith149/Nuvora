// app/api/admin/services/fetch-50/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST() {
	try {
		// ─── Step 1: Get all provider_service_ids already in services table ──
		const { data: existingServices, error: existingError } = await supabase
			.from("services")
			.select("provider_service_id")
			.not("provider_service_id", "is", null);

		if (existingError) {
			console.error("Existing services error:", existingError);
			return NextResponse.json(
				{ error: existingError.message },
				{ status: 500 },
			);
		}

		// ─── Step 2: Extract IDs into an array ──────────────────────────────
		const existingIds =
			existingServices?.map((s) => s.provider_service_id).filter(Boolean) || [];

		// ─── Step 3: Build the query ────────────────────────────────────────
		let query = supabase
			.from("provider_services")
			.select("*", { count: "exact" });

		// ─── Step 4: If there are existing IDs, exclude them ────────────────
		if (existingIds.length > 0) {
			query = query.not(
				"id",
				"in",
				`(${existingIds.map((id) => `'${id}'`).join(",")})`,
			);
		}

		// ─── Step 5: Get total count ────────────────────────────────────────
		const { count: totalAvailable, error: countError } = await query;

		if (countError) {
			console.error("Count error:", countError);
		}

		// ─── Step 6: Fetch 50 services ──────────────────────────────────────
		const { data: providerServices, error } = await query
			.limit(50)
			.order("rate", { ascending: true });

		if (error) {
			console.error("Fetch error:", error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// ─── Step 7: Get imported count ──────────────────────────────────────
		const { count: totalImported, error: importedError } = await supabase
			.from("services")
			.select("*", { count: "exact", head: true })
			.not("provider_service_id", "is", null);

		if (importedError) {
			console.error("Imported count error:", importedError);
		}

		// ─── Step 8: Map to preview format ──────────────────────────────────
		const services = (providerServices || []).map((ps: any) => ({
			id: ps.id,
			provider_service_id: ps.id,
			name: ps.name || "Unnamed Service",
			category: ps.category || "other",
			rate: ps.rate || 0,
			min_qty: ps.min_qty || 0,
			max_qty: ps.max_qty || 0,
			avg_time: ps.avg_time || null,
			quality_tier: ps.quality_tier || null,
			price_per_1000: parseFloat((ps.rate * 1.2).toFixed(2)), // 20% markup
			selected: true,
		}));

		return NextResponse.json({
			success: true,
			services,
			total_available: totalAvailable || 0,
			total_imported: totalImported || 0,
		});
	} catch (error: any) {
		console.error("Fetch 50 error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to fetch services" },
			{ status: 500 },
		);
	}
}
