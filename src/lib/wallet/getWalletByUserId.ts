import { createClient } from "@/lib/supabase/server";

export async function getWalletByUserId(userId: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("wallets")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (error) {
		throw error;
	}

	return data;
}
