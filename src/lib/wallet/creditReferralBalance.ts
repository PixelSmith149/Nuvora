// src/lib/wallet/creditReferralBalance.ts
import { createClient } from "@/lib/supabase/server";
import { createLedgerEntry } from "./createLedgerEntry";

interface CreditReferralParams {
  walletId: string;
  amount: number;
  description?: string;
  referenceId?: string;
  referenceType?: string;
}

export async function creditReferralBalance(params: CreditReferralParams) {
  const supabase = await createClient();

  // ─── First, verify wallet exists ──────────────────────────────────
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("id")
    .eq("id", params.walletId)
    .single();

  if (walletError || !wallet) {
    throw new Error(`Wallet not found: ${params.walletId}`);
  }

  // ─── Get current referral balance ──────────────────────────────────
  const { data: balanceData, error: balanceError } = await supabase
    .from("wallet_balances")
    .select("referral_balance")
    .eq("wallet_id", params.walletId)
    .single();

  if (balanceError) {
    // If no balance record, create one
    if (balanceError.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from("wallet_balances")
        .insert({
          wallet_id: params.walletId,
          balance: 0,
          referral_balance: params.amount,
        });

      if (insertError) {
        throw new Error(`Failed to create wallet balance: ${insertError.message}`);
      }

      // ─── Create ledger entry ──────────────────────────────────────
      await createLedgerEntry({
        walletId: params.walletId,
        amount: params.amount,
        type: "referral",
        description: params.description || "Referral bonus credited",
        referenceId: params.referenceId,
        referenceType: params.referenceType || "referral",
        balanceAfter: params.amount,
        metadata: {
          referral_bonus: true,
          previous_balance: 0,
        },
      });

      return {
        success: true,
        previousBalance: 0,
        newBalance: params.amount,
      };
    }

    throw new Error(`Failed to get referral balance: ${balanceError.message}`);
  }

  const currentBalance = balanceData?.referral_balance || 0;
  const newBalance = currentBalance + params.amount;

  // ─── Update referral balance ──────────────────────────────────────
  const { error: updateError } = await supabase
    .from("wallet_balances")
    .update({
      referral_balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("wallet_id", params.walletId);

  if (updateError) {
    throw new Error(`Failed to update referral balance: ${updateError.message}`);
  }

  // ─── Create ledger entry ──────────────────────────────────────────
  await createLedgerEntry({
    walletId: params.walletId,
    amount: params.amount,
    type: "referral",
    description: params.description || "Referral bonus credited",
    referenceId: params.referenceId,
    referenceType: params.referenceType || "referral",
    balanceAfter: newBalance,
    metadata: {
      referral_bonus: true,
      previous_balance: currentBalance,
    },
  });

  return {
    success: true,
    previousBalance: currentBalance,
    newBalance: newBalance,
  };
}