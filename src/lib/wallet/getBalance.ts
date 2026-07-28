import { createClient } from "@/lib/supabase/server";
import { getWallet } from "./getWallet";

export async function getBalance() {
	const wallet = await getWallet();

	if (!wallet) return 0;

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("ledger_entries")
		.select("amount")
		.eq("wallet_id", wallet.id);

	if (error) {
		throw error;
	}

	return data.reduce((total, entry) => total + Number(entry.amount), 0);
}
