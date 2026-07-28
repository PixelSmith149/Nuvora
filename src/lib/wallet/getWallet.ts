import { createClient } from "@/lib/supabase/server";

export async function getWallet() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return null;

	const { data, error } = await supabase
		.from("wallets")
		.select("*")
		.eq("user_id", user.id)
		.single();

	if (error) {
		throw error;
	}

	return data;
}
