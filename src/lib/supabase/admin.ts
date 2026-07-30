import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client with admin (SERVICE_ROLE) privileges.
 * ⚠️ WARNING: Bypasses Row Level Security (RLS). 
 * NEVER import or execute this file on the client side or in publicly accessible endpoints.
 */
export function createAdminClient() {
  // Guard against accidental client-side execution
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient() can only be called in a server environment.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}