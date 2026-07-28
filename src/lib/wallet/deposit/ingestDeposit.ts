import { createClient } from "@/lib/supabase/server";
import { type Currency, convertToUSD } from "@/lib/wallet/currency/convert";

type DepositInput = {
	wallet_id: string;
	amount: number;
	currency: Currency;
	reference: string;
	provider: "paystack" | "momo" | "btcpay";
};

export async function ingestDeposit(input: DepositInput) {
	const supabase = await createClient();

	/*
    Find pending transaction
  */

	const { data: transaction, error: transactionError } = await supabase
		.from("wallet_transactions")
		.select("*")
		.eq("reference", input.reference)
		.single();

	if (transactionError || !transaction) {
		throw new Error("Transaction not found");
	}

	/*
    Idempotency protection
    Prevents double-crediting if
    Paystack / BTCPay / MoMo retries.
  */

	if (transaction.status === "success") {
		return true;
	}

	/*
    Convert incoming asset/currency
    into internal USD wallet value.
  */

	const usdAmount = await convertToUSD(input.amount, input.currency);

	/*
    Read current balance
  */

	const { data: balanceRow, error: balanceError } = await supabase
		.from("wallet_balances")
		.select("balance")
		.eq("wallet_id", input.wallet_id)
		.single();

	if (balanceError) {
		throw balanceError;
	}

	const currentBalance = Number(balanceRow?.balance ?? 0);

	const newBalance = currentBalance + usdAmount;

	/*
    Create immutable ledger record
  */

	const { data: ledgerEntry, error: ledgerError } = await supabase
		.from("ledger_entries")
		.insert({
			wallet_id: input.wallet_id,

			amount: usdAmount,

			type: "credit",

			description: `${input.provider} deposit`,

			reference_type: "wallet_transaction",

			reference_id: transaction.id,

			balance_after: newBalance,

			metadata: {
				provider: input.provider,

				original_amount: input.amount,

				original_currency: input.currency,

				credited_usd: usdAmount,

				reference: input.reference,
			},
		})
		.select()
		.single();

	if (ledgerError || !ledgerEntry) {
		throw ledgerError;
	}

	/*
    Update wallet balance
  */

	const { error: updateBalanceError } = await supabase
		.from("wallet_balances")
		.update({
			balance: newBalance,
			updated_at: new Date().toISOString(),
		})
		.eq("wallet_id", input.wallet_id);

	if (updateBalanceError) {
		throw updateBalanceError;
	}

	/*
    Link transaction to ledger
    and mark successful
  */

	const { error: transactionUpdateError } = await supabase
		.from("wallet_transactions")
		.update({
			ledger_entry_id: ledgerEntry.id,

			amount: usdAmount,

			status: "success",

			provider: input.provider,

			meta: {
				...(transaction.meta ?? {}),

				original_amount: input.amount,

				original_currency: input.currency,

				credited_usd: usdAmount,

				reference: input.reference,
			},
		})
		.eq("id", transaction.id);

	if (transactionUpdateError) {
		throw transactionUpdateError;
	}

	return {
		success: true,
		wallet_id: input.wallet_id,
		credited_usd: usdAmount,
		ledger_entry_id: ledgerEntry.id,
		transaction_id: transaction.id,
	};
}
