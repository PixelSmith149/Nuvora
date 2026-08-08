// app/api/referral/generate-code/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateReferralCode } from '@/lib/referral/referral.service';

function getBaseUrl(req: Request): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  if (host) return `${protocol}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
}

// ─── GET: Retrieve or Auto-Generate ───────────────────────────────────
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = getBaseUrl(req);

    const codeRecord = await generateReferralCode(user.id);

    return NextResponse.json({
      code: codeRecord.code,
      referralCode: codeRecord.code,
      referralUrl: `${baseUrl}/signup?ref=${codeRecord.code}`,
    });
  } catch (error: any) {
    console.error('Generate code GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── POST: Set Custom Code ────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = getBaseUrl(req);
    const body = await req.json().catch(() => ({}));
    const inputCode = body.customCode || body.code;

    if (!inputCode) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    const cleanCode = String(inputCode)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    if (cleanCode.length < 3 || cleanCode.length > 20) {
      return NextResponse.json(
        { error: 'Referral code must be between 3 and 20 alphanumeric characters.' },
        { status: 400 }
      );
    }

    const codeRecord = await generateReferralCode(user.id, cleanCode);

    return NextResponse.json({
      code: codeRecord.code,
      referralCode: codeRecord.code,
      referralUrl: `${baseUrl}/signup?ref=${codeRecord.code}`,
    });
  } catch (error: any) {
    if (
      error.message?.includes('already taken') ||
      error.message?.includes('must be')
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Generate code POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}