// src/lib/referral/referral.types.ts
export type ReferralType = 'boost' | 'build' | 'publish';

export type ReferralStatus = 'pending' | 'completed' | 'rewarded' | 'expired';

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referral_code_id: string;
  referee_id: string | null;
  type: ReferralType;
  status: ReferralStatus;
  bonus_amount: number;
  bonus_paid: boolean;
  completed_at: string | null;
  rewarded_at: string | null;
  created_at: string;
  updated_at: string;
  referee?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export interface ReferralStats {
  total_referrals: number;
  pending_referrals: number;
  completed_referrals: number;
  rewarded_referrals: number;
  total_earned: number;
  available_balance: number;
  by_type: {
    boost: number;
    build: number;
    publish: number;
  };
}

export const REFERRAL_BONUSES: Record<ReferralType, number> = {
  boost: 1.00,
  build: 1.00,
  publish: 0.10,
};

export const REFERRAL_PATHS: Record<ReferralType, string> = {
  boost: '/s/services',
  build: '/st/builder',
  publish: '/',
};

export const REFERRAL_MAX_REFERRALS = 100; // Internal only