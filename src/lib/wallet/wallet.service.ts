import { createClient } from "@/lib/supabase/server";

export type WalletTransactionType = "deposit" | "withdraw" | "transfer";

export async function getWallet(userId: string) {
	const supabase = await createClient();

	const { data: wallet } = await supabase
		.from("wallets")
		.select("id")
		.eq("user_id", userId)
		.single();

	if (!wallet) return null;

	const [{ data: balance }, { data: transactions }] = await Promise.all([
		supabase
			.from("wallet_balances")
			.select("balance")
			.eq("wallet_id", wallet.id)
			.single(),

		supabase
			.from("wallet_transactions")
			.select("*")
			.eq("wallet_id", wallet.id)
			.order("created_at", { ascending: false })
			.limit(20),
	]);

	return {
		wallet_id: wallet.id,
		balance: balance?.balance ?? 0,
		transactions: transactions ?? [],
	};
}
