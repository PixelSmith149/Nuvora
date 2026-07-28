// app/m/[username]/store/page.tsx

import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { SellerStorefront } from "@/components/market/SellerStorefront";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
	title: "Seller Store | PrimeBooster",
	description: "Browse digital assets from this seller.",
};

interface StorePageProps {
	params: Promise<{
		username: string;
	}>;
}

export default async function SellerStorePage({ params }: StorePageProps) {
	// ✅ FIX: Await createClient()
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	const userId = user?.id; // ← Current logged-in user
	const { username } = await params;

	// ─── 1. Get seller profile by username ──────────────────
	const { data: profile, error: profileError } = await supabase
		.from("profiles")
		.select("id, display_name, username, avatar_url, created_at")
		.eq("username", username)
		.maybeSingle();

	if (profileError || !profile) {
		return (
			<div className="flex h-[60vh] items-center justify-center bg-black text-white">
				<div className="text-center max-w-md mx-auto p-8 rounded-2xl border border-white/10 bg-zinc-950/50">
					<h2 className="text-xl font-bold text-white mb-2">
						Seller Not Found
					</h2>
					<p className="text-sm text-zinc-400">
						The seller "{username}" does not exist or has no storefront.
					</p>
				</div>
			</div>
		);
	}

	// ─── 2. Get seller's store data ──────────────────────────
	const { data: store } = await supabase
		.from("global_market_stores")
		.select("*")
		.eq("user_id", profile.id)
		.maybeSingle();

	console.log("🔍 Store data fetched:", store);
	console.log("🔍 TikTok handle:", store?.tiktok_handle);
	console.log("🔍 Snapchat handle:", store?.snapchat_handle);

	// ─── 3. Get seller's active listings ──────────────────────
	const { data: listings } = await supabase
		.from("market_listings")
		.select("*")
		.eq("seller_id", profile.id)
		.eq("status", "active")
		.order("created_at", { ascending: false });

	// ─── 4. Get total sales count ─────────────────────────────
	const { count: totalSales } = await supabase
		.from("global_market_orders")
		.select("id", { count: "exact", head: true })
		.eq("seller_id", profile.id);

	// ─── 5. Get seller's categories ───────────────────────────
	const categories = listings?.length
		? [...new Set(listings.map((l) => l.tab_category))].filter(Boolean)
		: [];

	return (
		<Suspense
			fallback={
				<div className="flex h-screen items-center justify-center bg-black">
					<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
				</div>
			}
		>
			<SellerStorefront
				seller={profile}
				store={store}
				listings={listings || []}
				totalSales={totalSales || 0}
				categories={categories as string[]}
				currentUserId={userId}
			/>
		</Suspense>
	);
}
