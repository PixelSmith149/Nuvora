"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Strict TypeScript structure mapping directly to the database column constraints
export interface ProviderServiceRecord {
	id: string; // uuid, Primary
	provider_id: string; // uuid, Not Null
	external_service_id: string; // text, Not Null
	name: string; // text, Not Null
	category: string | null; // text, Nullable
	rate: number; // numeric, Not Null
	min_qty: number; // int4, Not Null
	max_qty: number; // int4, Not Null
	refill: boolean | null; // bool, Nullable
	cancel: boolean | null; // bool, Nullable
	active: boolean | null; // bool, Nullable
	raw: any | null; // jsonb, Nullable
	created_at: string | null; // timestamptz, Nullable
}

/**
 * FETCH: Retrieve all records directly matching database column targets
 */
export async function fetchProviderServices(): Promise<
	ProviderServiceRecord[]
> {
	const { data, error } = await supabase
		.from("provider_services")
		.select(
			"id, provider_id, external_service_id, name, category, rate, min_qty, max_qty, refill, cancel, active, raw, created_at",
		)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);

	return (
		(data as any[])?.map((row) => ({
			...row,
			rate: Number(row.rate), // Precision formatting parser
		})) || []
	);
}

/**
 * INSERT: Pushes record to database. Explicitly ensures nullable fields are formatted correctly.
 */
export async function insertProviderService(
	record: Omit<ProviderServiceRecord, "id" | "created_at">,
): Promise<{ success: boolean; data?: ProviderServiceRecord; error?: string }> {
	const { data, error } = await supabase
		.from("provider_services")
		.insert([record])
		.select()
		.single();

	if (error) return { success: false, error: error.message };
	return { success: true, data: { ...data, rate: Number(data.rate) } };
}

/**
 * UPDATE: Atomic property modification handler
 */
export async function updateProviderServiceField(
	id: string,
	field: keyof ProviderServiceRecord,
	value: any,
): Promise<boolean> {
	const { error } = await supabase
		.from("provider_services")
		.update({ [field]: value })
		.eq("id", id);

	if (error) {
		console.error(
			`Database write violation on column '${field}':`,
			error.message,
		);
		return false;
	}
	return true;
}

/**
 * DELETE: Immediate dynamic row termination logic
 */
export async function deleteProviderService(id: string): Promise<boolean> {
	const { error } = await supabase
		.from("provider_services")
		.delete()
		.eq("id", id);

	if (error) {
		console.error("Deletion lifecycle exception:", error.message);
		return false;
	}
	return true;
}
