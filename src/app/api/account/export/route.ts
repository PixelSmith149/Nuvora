import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Configuration mapping each table to its correct ownership column based on your database schema
const TABLE_MAPPINGS: Array<{ table: string; keyColumn: string; filterType?: 'or' | 'eq' }> = [
  { table: 'ta_templates', keyColumn: 'user_id' },
  { table: 'ta_animations', keyColumn: 'user_id' },
  { table: 'orders', keyColumn: 'user_id' },
  { table: 'user_sites', keyColumn: 'user_id' },
  { table: 'market_listings', keyColumn: 'seller_id' },
  { table: 'global_market_orders', keyColumn: 'buyer_id', filterType: 'or' }, // Handles buyer_id OR seller_id
  { table: 'reusable_digital_products', keyColumn: 'user_id' },
  { table: 'one_time_digital_tools', keyColumn: 'user_id' },
  { table: 'socio_market_metrics', keyColumn: 'user_id' },
  { table: 'passkeys', keyColumn: 'user_id' },
  { table: 'ta_downloads', keyColumn: 'user_id' },
  { table: 'site_charges', keyColumn: 'user_id' },
  { table: 'site_edits', keyColumn: 'user_id' },
  { table: 'contact_submissions', keyColumn: 'user_id' },
  { table: 'wallet_balances', keyColumn: 'user_id' },
  { table: 'wallet_transactions', keyColumn: 'user_id' },
  { table: 'wallet_escrow', keyColumn: 'user_id' },
  { table: 'market_inbox_messages', keyColumn: 'user_id' },
  { table: 'global_market_stores', keyColumn: 'user_id' },
];

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ─── 1. Fetch user profile (profiles.id -> auth.users.id) ──────
    const profilePromise = supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // ─── 2. Fetch all user table data concurrently ───
    const tablePromises = TABLE_MAPPINGS.map(async ({ table, keyColumn, filterType }) => {
      let query = supabase.from(table).select('*');

      if (filterType === 'or') {
        query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
      } else {
        query = query.eq(keyColumn, user.id);
      }

      const { data, error } = await query;
      return { table, data: data || [], error };
    });

    // Execute concurrently using Promise.allSettled
    const [profileResult, ...tableResults] = await Promise.all([
      profilePromise,
      Promise.allSettled(tablePromises),
    ]);

    const exportData: Record<string, any> = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        profile: profileResult.data || null,
      },
    };

    const errors: string[] = [];

    (tableResults[0] as PromiseSettledResult<{ table: string; data: any[]; error: any }>[]).forEach((result) => {
      if (result.status === 'fulfilled') {
        const { table, data, error } = result.value;
        if (error) {
          errors.push(`${table}: ${error.message}`);
          exportData[table] = [];
        } else {
          exportData[table] = data;
        }
      } else {
        errors.push(`Failed to execute query for a table`);
      }
    });

    // ─── 3. Compute summary counts ──────────────────────────────────────────────
    exportData.summary = {
      total_templates: exportData.ta_templates?.length || 0,
      total_animations: exportData.ta_animations?.length || 0,
      total_orders: exportData.orders?.length || 0,
      total_sites: exportData.user_sites?.length || 0,
      total_listings: exportData.market_listings?.length || 0,
      total_passkeys: exportData.passkeys?.length || 0,
    };

    if (errors.length > 0) {
      exportData.export_errors = errors;
    }

    return NextResponse.json({
      success: true,
      data: exportData,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Export data error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export data' },
      { status: 500 }
    );
  }
}