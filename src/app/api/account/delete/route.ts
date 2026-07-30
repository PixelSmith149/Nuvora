import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Table mappings to handle custom foreign key names
const USER_TABLE_CONFIGS: Array<{ table: string; keyColumn: string }> = [
  { table: 'market_listings', keyColumn: 'seller_id' },
  { table: 'global_market_stores', keyColumn: 'user_id' },
  { table: 'ta_templates', keyColumn: 'user_id' },
  { table: 'ta_animations', keyColumn: 'user_id' },
  { table: 'orders', keyColumn: 'user_id' },
  { table: 'user_sites', keyColumn: 'user_id' },
  { table: 'reusable_digital_products', keyColumn: 'user_id' },
  { table: 'one_time_digital_tools', keyColumn: 'user_id' },
  { table: 'socio_market_metrics', keyColumn: 'user_id' },
  { table: 'passkeys', keyColumn: 'user_id' },
  { table: 'ta_downloads', keyColumn: 'user_id' },
  { table: 'ta_template_tags', keyColumn: 'user_id' },
  { table: 'site_charges', keyColumn: 'user_id' },
  { table: 'site_edits', keyColumn: 'user_id' },
  { table: 'contact_submissions', keyColumn: 'user_id' },
  { table: 'wallet_balances', keyColumn: 'user_id' },
  { table: 'wallet_transactions', keyColumn: 'user_id' },
  { table: 'wallet_escrow', keyColumn: 'user_id' },
  { table: 'market_inbox_messages', keyColumn: 'user_id' },
  { table: 'provider_services', keyColumn: 'user_id' },
  // Profiles primary key is 'id'
  { table: 'profiles', keyColumn: 'id' },
];

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ─── Verify confirmation token ──────────────────────────────────────
    const body = await request.json();
    const { confirmToken } = body;

    if (!confirmToken || confirmToken !== 'DELETE_ACCOUNT_CONFIRM') {
      return NextResponse.json(
        { error: 'Invalid confirmation token' },
        { status: 400 }
      );
    }

    const userEmail = user.email || 'unknown';
    console.log(`🗑️ Initiating account deletion for user: ${userEmail} (${user.id})`);

    // ─── Delete application table data ──────────────────────────────────
    const errors: string[] = [];

    for (const { table, keyColumn } of USER_TABLE_CONFIGS) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq(keyColumn, user.id);

        if (error && error.code !== 'PGRST204' && error.code !== '42703') {
          errors.push(`${table}: ${error.message}`);
          console.error(`Failed to delete from ${table}:`, error);
        }
      } catch (err: any) {
        errors.push(`${table}: ${err.message}`);
      }
    }

    // ─── Delete Auth User using Service Role Admin Client ───────────────
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json(
        { error: 'Server configuration error preventing auth deletion' },
        { status: 500 }
      );
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { error: deleteUserError } = await adminSupabase.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      console.error('Failed to delete auth user:', deleteUserError);
      return NextResponse.json(
        {
          error: 'Failed to delete authentication user record.',
          details: deleteUserError.message,
        },
        { status: 500 }
      );
    }

    console.log(`✅ Account successfully deleted for user: ${userEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}