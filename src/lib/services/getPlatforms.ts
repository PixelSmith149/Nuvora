import { createClient } from "@/lib/supabase/server";

export async function getPlatforms() {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("services")
		.select("platform")
		.eq("active", true);

	if (error) throw error;

	const grouped = new Map<string, number>();

	for (const row of data ?? []) {
		grouped.set(row.platform, (grouped.get(row.platform) ?? 0) + 1);
	}

	return [...grouped.entries()]
		.map(([platform, total_services]) => ({
			platform,
			total_services,
		}))
		.sort((a, b) => a.platform.localeCompare(b.platform));
}
