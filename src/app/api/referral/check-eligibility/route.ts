//  \src\app\api\referral\check-eligibility\route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ─── Check total spend threshold ($10+) ───────────────────────────
    const { data: transactions } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('wallet_id', user.id)
      .eq('status', 'success')
      .gte('amount', 0);

    const totalSpent = transactions?.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

    // ─── Check total deposit threshold ($10+) ────────────────────────
    const { data: deposits } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('wallet_id', user.id)
      .eq('type', 'deposit')
      .eq('status', 'success');

    const totalDeposited = deposits?.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

    const eligible = totalDeposited >= 10 || totalSpent >= 10;

    return NextResponse.json({
      eligible,
      message: eligible 
        ? 'You are eligible to refer others!' 
        : 'You need to deposit/spend at least $10 before you can refer others',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}