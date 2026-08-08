// app/api/referral/complete/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { completeReferralAction } from '@/lib/referral/referral.service';
import { ReferralType } from '@/lib/referral/referral.types';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid or missing JSON payload' }, { status: 400 });
    }

    const { type } = body;

    // ─── Validate type ──────────────────────────────────────────────────
    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      );
    }

    if (!['boost', 'build', 'publish'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid referral type. Must be boost, build, or publish' },
        { status: 400 }
      );
    }

    // completeReferralAction takes exactly 2 arguments: (refereeId, type)
    const result = await completeReferralAction(user.id, type as ReferralType);

    if (!result.referral) {
      return NextResponse.json(
        { error: result.error || 'No pending referral found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      referral: result.referral,
      bonusCredited: result.bonusCredited,
    });
  } catch (error: any) {
    console.error('Referral completion error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}