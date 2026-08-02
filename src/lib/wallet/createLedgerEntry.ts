import { createClient } from "@/lib/supabase/server";

type LedgerType =
  | "deposit"
  | "withdrawal"
  | "transfer_in"
  | "transfer_out"
  | "purchase"
  | "refund"
  | "bonus"
  | "adjustment";

interface CreateLedgerEntryParams {
  walletId: string;
  amount: number;
  type: LedgerType;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  balanceAfter?: number;
  metadata?: Record<string, any>;
}

export async function createLedgerEntry(params: CreateLedgerEntryParams) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ledger_entries")
    .insert({
      wallet_id: params.walletId,
      amount: params.amount,
      type: params.type,
      description: params.description,
      reference_id: params.referenceId,
      reference_type: params.referenceType,
      balance_after: params.balanceAfter,
      metadata: params.metadata ?? {},
    })
    .select()
    .single();

  if (error) {
    console.error("CRITICAL: Ledger entry insertion failed!", {
      error,
      params,
    });
    throw new Error(`Ledger entry creation failed: ${error.message}`);
  }

  if (!data) {
    throw new Error("Ledger entry creation failed: No data returned from database.");
  }

  return data;
}