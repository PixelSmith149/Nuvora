import { createClient } from "@/lib/supabase/server";

export async function getWalletBalance(walletId: string) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ledger_entries")
		.select("amount")
		.eq("wallet_id", walletId);

	if (error) {
		throw error;
	}

	return data.reduce((sum, row) => sum + Number(row.amount), 0);
}
