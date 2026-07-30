import { createClient } from "@/lib/supabase/server";
import { type Currency, convertToUSD } from "@/lib/wallet/currency/convert";

type DepositInput = {
	wallet_id: string;
	amount: number; // Major currency unit (e.g., 50 GHS, 10 USD)
	currency: Currency;
	reference: string;
	provider: "paystack" | "momo" | "btcpay";
};

export async function ingestDeposit(input: DepositInput) {
	const supabase = await createClient();

	// 1. Fetch transaction and verify existence + idempotent state
	const { data: transaction, error: transactionError } = await supabase
		.from("wallet_transactions")
		.select("*")
		.eq("reference", input.reference)
		.single();

	if (transactionError || !transaction) {
		throw new Error(`Transaction not found for reference: ${input.reference}`);
	}

	// Idempotency Guard: Stop immediately if already credited
	if (transaction.status === "success") {
		return {
			success: true,
			idempotent: true,
			transaction_id: transaction.id,
			wallet_id: input.wallet_id,
		};
	}

	// 2. Convert standard unit amount to USD
	const usdAmount = await convertToUSD(input.amount, input.currency);
	const normalizedUsdAmount = Number(usdAmount.toFixed(2));

	if (isNaN(normalizedUsdAmount) || normalizedUsdAmount <= 0) {
		throw new Error(`Invalid USD conversion result: ${usdAmount}`);
	}

	// 3. Execute Atomic Ingest Database RPC (Handles FOR UPDATE row-locking, ledger entry, balance credit, & status update)
	const { data: rpcResult, error: rpcError } = await supabase.rpc(
		"ingest_wallet_deposit",
		{
			p_wallet_id: input.wallet_id,
			p_usd_amount: normalizedUsdAmount,
			p_reference: input.reference,
			p_provider: input.provider,
			p_transaction_id: transaction.id,
		}
	);

	if (rpcError) {
		throw new Error(`Database RPC ingest failure: ${rpcError.message}`);
	}

	return {
		success: true,
		idempotent: false,
		wallet_id: input.wallet_id,
		credited_usd: normalizedUsdAmount,
		transaction_id: transaction.id,
		new_balance: rpcResult.new_balance,
		ledger_entry_id: rpcResult.ledger_entry_id,
	};
}