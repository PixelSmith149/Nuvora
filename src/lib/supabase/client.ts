import { createBrowserClient } from "@supabase/ssr";

// 1. Keep the factory function for hooks or utilities that need fresh instances
export function createClient() {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);
}

// 2. FIXED: Create and export a default singleton instance for all your existing files
const supabase = createClient();

export default supabase;
