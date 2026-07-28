"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface ProviderRegistryRecord {
	id: string; // uuid, Primary
	name: string; // text
	api_url: string; // text, Unique
	api_key: string; // text
	active: boolean | null; // bool, Nullable
	created_at: string | null; // timestamptz, Nullable
}

/**
 * READ: Fetch all vendor connection endpoints
 */
export async function fetchProviders(): Promise<ProviderRegistryRecord[]> {
	const { data, error } = await supabase
		.from("providers")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	return data || [];
}

/**
 * CREATE: Inject a new third-party wholesaler connection schema row
 */
export async function insertProvider(
	record: Omit<ProviderRegistryRecord, "id" | "created_at">,
): Promise<{
	success: boolean;
	data?: ProviderRegistryRecord;
	error?: string;
}> {
	const { data, error } = await supabase
		.from("providers")
		.insert([record])
		.select()
		.single();

	if (error) return { success: false, error: error.message };
	return { success: true, data };
}

/**
 * UPDATE: Modify any single property cell inline
 */
export async function updateProviderField(
	id: string,
	field: keyof ProviderRegistryRecord,
	value: any,
): Promise<boolean> {
	const { error } = await supabase
		.from("providers")
		.update({ [field]: value })
		.eq("id", id);

	if (error) {
		console.error(`Database write error on field '${field}':`, error.message);
		return false;
	}
	return true;
}

/**
 * DELETE: Drop an API provider instance entirely
 */
export async function deleteProvider(id: string): Promise<boolean> {
	const { error } = await supabase.from("providers").delete().eq("id", id);

	if (error) {
		console.error("Failed to drop provider row:", error.message);
		return false;
	}
	return true;
}
