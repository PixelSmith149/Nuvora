import { createClient } from "@/lib/supabase/server";

export async function getServices(platform: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("services")
		.select("*")
		.eq("platform", platform)
		.eq("active", true)
		.order("title");

	if (error) throw error;

	return data ?? [];
}
