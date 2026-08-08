// app/api/referral/list/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getReferrals } from '@/lib/referral/referral.service';
import { ReferralStatus, ReferralType } from '@/lib/referral/referral.types';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const statusParam = url.searchParams.get('status');
    const typeParam = url.searchParams.get('type');

    // ─── Validate status if provided ──────────────────────────────────
    let status: ReferralStatus | undefined;
    if (statusParam) {
      if (!['pending', 'completed', 'rewarded', 'expired'].includes(statusParam)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be: pending, completed, rewarded, or expired' },
          { status: 400 }
        );
      }
      status = statusParam as ReferralStatus;
    }

    // ─── Validate type if provided ──────────────────────────────────
    let type: ReferralType | undefined;
    if (typeParam) {
      if (!['boost', 'build', 'publish'].includes(typeParam)) {
        return NextResponse.json(
          { error: 'Invalid type. Must be: boost, build, or publish' },
          { status: 400 }
        );
      }
      type = typeParam as ReferralType;
    }

    const referrals = await getReferrals(user.id, status, type);

    return NextResponse.json({ referrals });
  } catch (error: any) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}