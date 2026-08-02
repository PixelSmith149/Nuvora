import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { type Currency, convertToUSD } from "@/lib/wallet/currency/convert";

type DepositInput = {
  wallet_id: string;
  amount: number; // major units of paid currency
  currency: Currency;
  reference: string;
  provider: "paystack" | "momo" | "btcpay" | "heleket";
  meta?: Record<string, unknown>;
  asAdmin?: boolean;
  /** Optional from Paystack payload */
  channel?: string | null;
  phone?: string | null;
  network?: string | null;
};

export async function ingestDeposit(input: DepositInput) {
  const supabase = input.asAdmin ? createAdminClient() : await createClient();

  const paidCurrency = String(input.currency || "GHS").toUpperCase() as Currency;
  const paidAmount = Number(input.amount);

  if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
    throw new Error(`Invalid deposit amount: ${input.amount}`);
  }

  const { data: transaction, error: transactionError } = await supabase
    .from("wallet_transactions")
    .select("id, wallet_id, status, amount, meta")
    .eq("reference", input.reference)
    .maybeSingle();

  if (transactionError) {
    throw new Error(`Transaction lookup failed: ${transactionError.message}`);
  }
  if (!transaction) {
    throw new Error(`Transaction not found: ${input.reference}`);
  }
  if (transaction.wallet_id !== input.wallet_id) {
    throw new Error(`Wallet mismatch for ${input.reference}`);
  }
  if (transaction.status === "success") {
    return {
      success: true,
      idempotent: true,
      transaction_id: transaction.id,
      wallet_id: input.wallet_id,
      credited_usd: Number(transaction.amount),
    };
  }
  if (transaction.status === "failed" || transaction.status === "cancelled") {
    throw new Error(`Cannot ingest: status is ${transaction.status}`);
  }

  const usdAmount = await convertToUSD(paidAmount, paidCurrency);
  const normalizedUsdAmount = Number(usdAmount.toFixed(2));

  if (!Number.isFinite(normalizedUsdAmount) || normalizedUsdAmount <= 0) {
    throw new Error(`Invalid USD conversion: ${usdAmount} from ${paidAmount} ${paidCurrency}`);
  }

  const prevMeta =
    transaction.meta && typeof transaction.meta === "object"
      ? (transaction.meta as Record<string, unknown>)
      : {};

  const channel = input.channel ?? (input.meta?.channel as string) ?? null;
  const phone = input.phone ?? (input.meta?.phone as string) ?? null;
  const network = input.network ?? (input.meta?.network as string) ?? null;

  const nextMeta = {
    ...prevMeta,
    ...(input.meta || {}),
    paid_currency: paidCurrency,
    paid_amount: paidAmount,
    credited_usd: normalizedUsdAmount,
    channel,
    phone,
    network,
    ingested_at: new Date().toISOString(),
    ingest_provider: input.provider,
  };

  // Atomic credit
  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "ingest_wallet_deposit",
    {
      p_wallet_id: input.wallet_id,
      p_usd_amount: normalizedUsdAmount,
      p_reference: input.reference,
      p_provider: input.provider,
      p_transaction_id: transaction.id,
    },
  );

  if (rpcError) {
    console.error("[ingestDeposit] RPC error:", rpcError);
    throw new Error(`Database RPC ingest failure: ${rpcError.message}`);
  }

  const result = (
    rpcResult && typeof rpcResult === "object"
      ? Array.isArray(rpcResult)
        ? rpcResult[0]
        : rpcResult
      : {}
  ) as { new_balance?: number; ledger_entry_id?: string };

  const ledgerEntryId = result?.ledger_entry_id ?? null;

  // Persist money + channel fields on the row (source of truth for later)
  const { error: updateError } = await supabase
    .from("wallet_transactions")
    .update({
      status: "success",
      amount: normalizedUsdAmount,
      currency: "USD",
      ledger_currency: "USD",
      charge_currency: paidCurrency,
      charge_amount: paidAmount,
      channel,
      phone,
      network,
      ledger_entry_id: ledgerEntryId,
      meta: nextMeta,
      updated_at: new Date().toISOString(),
    })
    .eq("id", transaction.id);

  if (updateError) {
    console.error("[ingestDeposit] post-RPC update failed:", updateError);
    // RPC may have credited already — log hard; do not throw if that causes double credit risk
    // Prefer RPC to set status=success itself. If RPC already sets success, this is backup.
  }

  return {
    success: true,
    idempotent: false,
    wallet_id: input.wallet_id,
    credited_usd: normalizedUsdAmount,
    paid_amount: paidAmount,
    paid_currency: paidCurrency,
    transaction_id: transaction.id,
    new_balance: result?.new_balance,
    ledger_entry_id: ledgerEntryId,
  };
}