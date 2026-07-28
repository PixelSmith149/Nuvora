import { createClient } from "@/lib/supabase/server";

export async function getServiceById(serviceId: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("services")
		.select("*")
		.eq("id", serviceId)
		.single();

	if (error) throw error;

	return data;
}
