import { createClient } from "@/lib/supabase/server";

export async function getCurrentBalance(userId: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("wallet_balances")
		.select(`
      balance,
      wallets!inner(
        user_id
      )
    `)
		.eq("wallets.user_id", userId)
		.single();

	if (error) {
		throw error;
	}

	return Number(data.balance);
}
