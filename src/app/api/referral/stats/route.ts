// app/api/referral/stats/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getReferralStats } from '@/lib/referral/referral.service';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getReferralStats(user.id);

    return NextResponse.json({
      stats: {
        total_referrals: stats.total_referrals,
        pending_referrals: stats.pending_referrals,
        completed_referrals: stats.completed_referrals,
        rewarded_referrals: stats.rewarded_referrals,
        referral_balance: stats.available_balance,
        total_earned: stats.total_earned,
        by_type: stats.by_type,
      },
    });
  } catch (error: any) {
    console.error('Referral stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load stats' },
      { status: 500 }
    );
  }
}