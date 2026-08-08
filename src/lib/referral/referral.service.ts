// src/lib/referral/referral.service.ts
import { createClient } from "@/lib/supabase/server";
import { getWalletByUserId } from "@/lib/wallet/getWalletByUserId";
import { creditReferralBalance } from "@/lib/wallet/creditReferralBalance";
import { 
  ReferralType, 
  ReferralStatus, 
  Referral, 
  ReferralCode, 
  ReferralStats,
  REFERRAL_BONUSES,
  REFERRAL_MAX_REFERRALS 
} from "./referral.types";

// ─── Generate / Update Referral Code ──────────────────────────────────
export async function generateReferralCode(
  userId: string,
  customCode?: string
): Promise<ReferralCode> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (customCode) {
    const cleanCode = customCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!/^[A-Z0-9]{3,20}$/.test(cleanCode)) {
      throw new Error('Referral code must be 3-20 characters (letters and numbers only).');
    }

    const { data: taken } = await supabase
      .from('referral_codes')
      .select('user_id')
      .eq('code', cleanCode)
      .maybeSingle();

    if (taken && taken.user_id !== userId) {
      throw new Error('This referral code is already taken. Please choose another.');
    }

    if (existing) {
      const { data: updated, error } = await supabase
        .from('referral_codes')
        .update({
          code: cleanCode,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return updated;
    }

    const { data, error } = await supabase
      .from('referral_codes')
      .insert({
        user_id: userId,
        code: cleanCode,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // No custom code
  if (existing) return existing;

  let code: string = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    code = generateRandomCode();
    const { data: existingCode } = await supabase
      .from('referral_codes')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    if (!existingCode) isUnique = true;
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique referral code. Please try again.');
  }

  const { data, error } = await supabase
    .from('referral_codes')
    .insert({
      user_id: userId,
      code,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── Track Referral ────────────────────────────────────────────────────
export async function trackReferral(
  referrerId: string,
  refereeId: string,
  referralCode: string,
  type: ReferralType
) {
  const supabase = await createClient();

  // Resolve code
  const { data: codeRecord, error: codeError } = await supabase
    .from('referral_codes')
    .select('id')
    .eq('code', referralCode)
    .eq('active', true)
    .maybeSingle();

  if (codeError || !codeRecord) {
    throw new Error('Invalid referral code');
  }

  // Prevent self-referral
  if (referrerId === refereeId) {
    throw new Error('Self-referral is not allowed');
  }

  // Idempotent check
  const { data: existingRef } = await supabase
    .from('referrals')
    .select('id, status')
    .eq('referee_id', refereeId)
    .eq('type', type)
    .maybeSingle();

  if (existingRef) {
    return existingRef;
  }

  // Note: We intentionally do NOT block tracking at 100.
  // Users can keep referring. We only stop crediting later.

  const { data, error } = await supabase
    .from('referrals')
    .insert({
      referrer_id: referrerId,
      referral_code_id: codeRecord.id,
      referee_id: refereeId,
      type,
      status: 'pending',
      bonus_amount: 0,
      bonus_paid: false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('referrals')
        .select('*')
        .eq('referee_id', refereeId)
        .eq('type', type)
        .maybeSingle();
      return existing;
    }
    throw new Error(error.message);
  }

  return data;
}

// ─── Helper: Check if referrer can still receive credits ───────────────
async function canReceiveReferralCredit(referrerId: string): Promise<boolean> {
  const supabase = await createClient();

  // Check if user is affiliate (unlimited)
  const { data: profile } = await supabase
    .from('profiles')
    .select('affiliate')
    .eq('id', referrerId)
    .maybeSingle();

  if (profile?.affiliate === true) {
    return true; // Affiliates have no limit
  }

  // Count total referrals for normal users
  const { count } = await supabase
    .from('referrals')
    .select('id', { count: 'exact', head: true })
    .eq('referrer_id', referrerId);

  // Stop crediting at 100
  return (count ?? 0) < REFERRAL_MAX_REFERRALS;
}

// ─── Complete Referral Action ──────────────────────────────────────────
export async function completeReferralAction(
  refereeId: string,
  type: ReferralType
) {
  const supabase = await createClient();

  const { data: referral, error: refError } = await supabase
    .from('referrals')
    .select(`
      *,
      referrer:referrer_id (
        id
      )
    `)
    .eq('referee_id', refereeId)
    .eq('type', type)
    .eq('status', 'pending')
    .maybeSingle();

  if (refError || !referral) {
    return { 
      referral: null, 
      bonusCredited: false, 
      error: `No pending ${type} referral found` 
    };
  }

  if (referral.status === 'completed' || referral.status === 'rewarded') {
    return { referral, bonusCredited: false, error: 'Referral already completed' };
  }

  const bonusAmount = REFERRAL_BONUSES[type] || 0;

  // Mark as completed first
  const { data: updated, error: updateError } = await supabase
    .from('referrals')
    .update({
      status: 'completed',
      bonus_amount: bonusAmount,
      completed_at: new Date().toISOString(),
    })
    .eq('id', referral.id)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);

  // ─── Credit only if under limit (or affiliate) ─────────────────────
  let credited = false;

  if (bonusAmount > 0 && referral.referrer_id) {
    const allowed = await canReceiveReferralCredit(referral.referrer_id);

    if (allowed) {
      try {
        const wallet = await getWalletByUserId(referral.referrer_id);

        if (wallet) {
          await creditReferralBalance({
            walletId: wallet.id,
            amount: bonusAmount,
            description: `${type} referral bonus for inviting user`,
            referenceId: referral.id,
            referenceType: 'referral_bonus',
          });

          await supabase
            .from('referrals')
            .update({
              status: 'rewarded',
              bonus_paid: true,
              rewarded_at: new Date().toISOString(),
            })
            .eq('id', referral.id);

          credited = true;
        }
      } catch (error) {
        console.error('Failed to credit referral bonus:', error);
      }
    } else {
      // Still mark as completed, but do not credit
      console.log(
        `Referrer ${referral.referrer_id} reached max referrals (${REFERRAL_MAX_REFERRALS}). Skipping credit.`
      );
    }
  }

  return { referral: updated, bonusCredited: credited };
}

// ─── Get Referral Stats ────────────────────────────────────────────────
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const supabase = await createClient();

  const { data: referrals, error } = await supabase
    .from('referrals')
    .select('status, type, bonus_amount')
    .eq('referrer_id', userId);

  if (error) throw new Error(error.message);

  const list = referrals || [];

  const total = list.length;
  const pending = list.filter(r => r.status === 'pending').length;
  const completed = list.filter(r => r.status === 'completed').length;
  const rewarded = list.filter(r => r.status === 'rewarded').length;
  const totalEarned = list.reduce((sum, r) => sum + Number(r.bonus_amount || 0), 0);

  let availableBalance = 0;
  try {
    const wallet = await getWalletByUserId(userId);
    if (wallet) {
      const { data: balanceData } = await supabase
        .from('wallet_balances')
        .select('referral_balance')
        .eq('wallet_id', wallet.id)
        .maybeSingle();

      availableBalance = Number(balanceData?.referral_balance || 0);
    }
  } catch {
    availableBalance = 0;
  }

  return {
    total_referrals: total,
    pending_referrals: pending,
    completed_referrals: completed,
    rewarded_referrals: rewarded,
    total_earned: totalEarned,
    available_balance: availableBalance,
    by_type: {
      boost: list.filter(r => r.type === 'boost').length,
      build: list.filter(r => r.type === 'build').length,
      publish: list.filter(r => r.type === 'publish').length,
    },
  };
}

// ─── Get Referral List ─────────────────────────────────────────────────
export async function getReferrals(
  userId: string, 
  status?: ReferralStatus, 
  type?: ReferralType
): Promise<Referral[]> {
  const supabase = await createClient();

  let query = supabase
    .from('referrals')
    .select(`
      *,
      referee:referee_id (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (type) query = query.eq('type', type);

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data || [];
}

// ─── Helper ────────────────────────────────────────────────────────────
function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}