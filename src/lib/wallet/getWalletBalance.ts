//  src\lib\wallet\getWalletBalance.ts
import { createClient } from "@/lib/supabase/server";

export async function getWalletBalance(walletId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ledger_entries")
    .select("amount")
    .eq("wallet_id", walletId);

  if (error) {
    console.error("GET_WALLET_BALANCE ERROR:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    return 0;
  }

  // Sum all ledger credit (+) and debit (-) entries accurately
  const calculatedBalance = data.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  return Number(calculatedBalance.toFixed(2));
}