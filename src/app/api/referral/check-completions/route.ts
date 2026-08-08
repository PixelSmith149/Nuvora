// app/api/referral/check-completions/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processPendingReferrals } from '@/lib/referral/process-completions';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await processPendingReferrals(user.id);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      completed: result.completed,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}