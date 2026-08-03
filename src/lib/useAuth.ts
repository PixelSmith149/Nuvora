"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; 
export function useUser() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const supabase = createClient(); 
		let mounted = true;

		async function loadUser() {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (mounted) {
				setUser(user);
				setLoading(false);
			}
		}

		loadUser();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			setUser(session?.user ?? null);
			setLoading(false);
		});

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
	}, []);

	return {
		user,
		loading,
		isAuthenticated: !!user,
	};
}
