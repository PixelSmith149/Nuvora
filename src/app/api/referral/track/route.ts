// app/api/referral/track/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { trackReferral } from '@/lib/referral/referral.service';
import { ReferralType } from '@/lib/referral/referral.types';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { referralCode, type = 'publish' } = body;

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    const cleanCode = String(referralCode).trim().toUpperCase();
    const validTypes: ReferralType[] = ['boost', 'build', 'publish'];
    const referralType = validTypes.includes(type) ? type : 'publish';

    // Resolve referrer from referral_codes table (source of truth)
    const { data: codeRecord, error: codeError } = await supabase
      .from('referral_codes')
      .select('id, user_id')
      .eq('code', cleanCode)
      .eq('active', true)
      .maybeSingle();

    if (codeError || !codeRecord) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Prevent self-referral
    if (codeRecord.user_id === user.id) {
      return NextResponse.json({ error: 'Self-referral is not allowed' }, { status: 400 });
    }

    // Use the service for consistent tracking
    const referral = await trackReferral(
      codeRecord.user_id,
      user.id,
      cleanCode,
      referralType
    );

    return NextResponse.json({
      success: true,
      referral,
      message: 'Referral tracked successfully',
    });
  } catch (error: any) {
    // Handle known business errors gracefully
    if (
      error.message?.includes('already referred') ||
      error.message?.includes('maximum referral limit') ||
      error.message?.includes('Invalid referral code')
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Referral track error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}