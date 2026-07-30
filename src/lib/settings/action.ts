'server-only';
'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin'; // Separate client with SERVICE_ROLE_KEY
import { revalidatePath } from 'next/cache';

// Allowed values for security validation
const ALLOWED_THEMES = new Set(['dark', 'light', 'system']);
const ALLOWED_LANGUAGES = new Set(['en', 'es', 'fr', 'de', 'pt']); // Add supported languages

export async function updateUserSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  const rawLanguage = formData.get('language')?.toString().trim();
  const rawTheme = formData.get('theme')?.toString().trim();
  
  // Validate input parameters
  const language = rawLanguage && ALLOWED_LANGUAGES.has(rawLanguage) ? rawLanguage : 'en';
  const theme = rawTheme && ALLOWED_THEMES.has(rawTheme) ? rawTheme : 'dark';
  
  const emailNotifications = formData.get('emailNotifications') === 'true';
  const pushNotifications = formData.get('pushNotifications') === 'true';

  const { error } = await supabase
    .from('profiles')
    .update({
      language,
      theme,
      email_notifications: emailNotifications,
      push_notifications: pushNotifications,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('Update settings failed:', error);
    return { success: false, error: 'Failed to update settings.' };
  }

  revalidatePath('/account/settings');
  return { success: true };
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  // 1. Delete application rows scoped to the user primary keys/foreign keys
  // (Assuming ON DELETE CASCADE is NOT configured on all tables)
  const tablesToCleanByUserId = [
    'ta_templates',
    'ta_animations',
    'orders',
    'market_listings',
    'global_market_orders',
    'user_sites',
  ];

  for (const table of tablesToCleanByUserId) {
    const { error } = await supabase.from(table).delete().eq('user_id', user.id);
    if (error) {
      console.error(`Failed to delete from ${table}:`, error);
    }
  }

  // Delete profile record ('id' primary key)
  const { error: profileErr } = await supabase.from('profiles').delete().eq('id', user.id);
  if (profileErr) {
    console.error('Failed to delete profile:', profileErr);
  }

  // 2. Delete auth identity using the isolated Admin Service Role client
  const adminSupabase = createAdminClient();
  const { error: adminAuthError } = await adminSupabase.auth.admin.deleteUser(user.id);

  if (adminAuthError) {
    console.error('Admin deleteUser failed:', adminAuthError);
    return { success: false, error: 'Failed to delete account identity.' };
  }

  return { success: true };
}

export async function exportUserData() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // 1. Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // 2. Query relative tables safely
    const tables = ['ta_templates', 'ta_animations', 'orders', 'user_sites'];
    const exportData: Record<string, any> = {
      user: { id: user.id, email: user.email },
      profile: profile || null,
    };

    await Promise.all(
      tables.map(async (table) => {
        const { data: rows } = await supabase.from(table).select('*').eq('user_id', user.id);
        exportData[table] = rows || [];
      })
    );

    return { success: true, data: exportData };
  } catch (err: any) {
    console.error('Export data error:', err);
    return { success: false, error: 'Failed to compile export data.' };
  }
}