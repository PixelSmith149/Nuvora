// app/global-market/page.tsx

"use client";

import { Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { GlobalMarketView } from "@/components/market/GlobalMarketView";
import supabase from "@/lib/supabase/client";

export default function MarketPage() {
	const [userId, setUserId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function getSession() {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUserId(user?.id || null);
			setIsLoading(false);
		}
		getSession();
	}, []);

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-black">
				<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
			</div>
		);
	}

	// Shouldn't happen behind auth, but just in case
	if (!userId) {
		return null;
	}

	return (
		<Suspense
			fallback={
				<div className="flex h-screen items-center justify-center bg-black">
					<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
				</div>
			}
		>
			<GlobalMarketView userId={userId} />
		</Suspense>
	);
}
