// components/market/SessionHydrator.tsx

"use client";

import { useEffect, useRef } from "react";
import supabase from "@/lib/supabase/client";

export function SessionHydrator() {
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const isMounted = useRef(true);

	useEffect(() => {
		// ─── 1. Listen for auth state changes ──────────────────
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				if (!isMounted.current) return;

				if (session) {
				} else {
				}
			},
		);

		// ─── 2. Periodic session refresh (every 5 minutes) ──
		intervalRef.current = setInterval(
			async () => {
				if (!isMounted.current) return;

				try {
					const { data, error } = await supabase.auth.getSession();
					if (error) {
						return;
					}

					if (data.session) {
					}
				} catch (err) {
					// Silent fail - don't break the app
				}
			},
			5 * 60 * 1000,
		); // 5 minutes

		// ─── 3. Cleanup on unmount ─────────────────────────────
		return () => {
			isMounted.current = false;
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			authListener?.subscription.unsubscribe();
		};
	}, []);

	// This component doesn't render anything visible
	return null;
}
