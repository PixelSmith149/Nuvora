"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface CatalogServiceRecord {
	id: string; // uuid, Primary
	provider_service_id: string | null; // uuid, Nullable
	platform: string; // text
	service_type: string; // text
	title: string; // text
	description: string | null; // text, Nullable
	price_per_1000: number; // numeric
	active: boolean | null; // bool, Nullable
	created_at: string | null; // timestamptz, Nullable
}

/**
 * READ: Fetch all storefront catalog services
 */
export async function fetchCatalogServices(): Promise<CatalogServiceRecord[]> {
	const { data, error } = await supabase
		.from("services")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);

	return (
		(data as any[])?.map((row) => ({
			...row,
			price_per_1000: Number(row.price_per_1000),
		})) || []
	);
}

/**
 * CREATE: Insert a new production storefront service line matching strict constraints
 */
export async function insertCatalogService(
	record: Omit<CatalogServiceRecord, "id" | "created_at">,
): Promise<{ success: boolean; data?: CatalogServiceRecord; error?: string }> {
	const { data, error } = await supabase
		.from("services")
		.insert([record])
		.select()
		.single();

	if (error) return { success: false, error: error.message };
	return {
		success: true,
		data: { ...data, price_per_1000: Number(data.price_per_1000) },
	};
}

/**
 * UPDATE: Atomic cell mutation processor
 */
export async function updateCatalogServiceField(
	id: string,
	field: keyof CatalogServiceRecord,
	value: any,
): Promise<boolean> {
	const { error } = await supabase
		.from("services")
		.update({ [field]: value })
		.eq("id", id);

	if (error) {
		console.error(
			`Database write error on services column '${field}':`,
			error.message,
		);
		return false;
	}
	return true;
}

/**
 * DELETE: Drop an active storefront service item row completely
 */
export async function deleteCatalogService(id: string): Promise<boolean> {
	const { error } = await supabase.from("services").delete().eq("id", id);

	if (error) {
		console.error(
			"Failed to execute target catalog row erasure:",
			error.message,
		);
		return false;
	}
	return true;
}
