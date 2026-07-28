"use client";

import {
	ArrowLeft,
	Layers,
	Lock,
	Package,
	Search,
	Sparkles,
	Store,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { StoreFrontPanel } from "@/components/account/StoreFrontPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import supabase from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { useMarket } from "@/lib/use-market";
import { toast } from "@/lib/use-toast";
import { useWallet } from "@/lib/wallet/useWallet";
import { AssetPurchaseLocker } from "./AssetPurchaseLocker";
import { MarketAssetDetail } from "./MarketAssetDetail";
// ─── Tab Components ──────────────────────────────────────────
import { MarketBrowseGrid } from "./MarketBrowseGrid";
import { PurchaseConfirmationModal } from "./PurchaseConfirmationModal";

// ─── Types ──────────────────────────────────────────────────

type View = "browse" | "store" | "locker" | "messages";
type AssetCategory = "socio_assets" | "one_time_products" | "reusable_products";

interface StoreData {
	id: string;
	user_id: string;
	is_verified: boolean;
}

interface GlobalMarketViewProps {
	userId: string;
}

// ============================================================
// SUB-COMPONENT: Category Tabs (No "All" Tab)
// ============================================================

interface CategoryTabsProps {
	activeCategory: AssetCategory;
	onCategoryChange: (category: AssetCategory) => void;
}

function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
	const categories: {
		id: AssetCategory;
		label: string;
		icon: React.ReactNode;
	}[] = [
		{
			id: "socio_assets",
			label: "Socio Assets",
			icon: <Users className="h-4 w-4" />,
		},
		{
			id: "one_time_products",
			label: "One-Time Products",
			icon: <Package className="h-4 w-4" />,
		},
		{
			id: "reusable_products",
			label: "Reusable Products",
			icon: <Layers className="h-4 w-4" />,
		},
	];

	return (
		<div className="w-full px-3 py-3">
			<div className="flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
				{categories.map((cat) => {
					const active = activeCategory === cat.id;

					return (
						<button
							key={cat.id}
							onClick={() => onCategoryChange(cat.id)}
							className={`
                group
                relative
                flex
                h-11
                flex-shrink-0
                items-center
                gap-2
                rounded-full
                px-5
                text-sm
                font-medium
                transition-all
                duration-300

                ${
									active
										? "bg-white/[0.08] text-white border border-white/[0.10] shadow-[0_8px_30px_rgba(255,255,255,0.05)]"
										: "border border-transparent text-zinc-400 hover:border-white/[0.05] hover:bg-white/[0.04] hover:text-white"
								}
              `}
						>
							<span
								className={`
                  transition-all
                  duration-300
                  ${
										active
											? "text-emerald-400"
											: "text-zinc-500 group-hover:text-zinc-300"
									}
                `}
							>
								{cat.icon}
							</span>

							<span>{cat.label}</span>

							{active && (
								<span className="absolute inset-0 rounded-full ring-1 ring-emerald-400/20" />
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function GlobalMarketView({ userId }: GlobalMarketViewProps) {
	// ─── State ──────────────────────────────────────────────
	const router = useRouter();
	const [profile, setProfile] = useState<Profile | null>(null);
	const [storeData, setStoreData] = useState<StoreData | null>(null);
	const [activeView, setActiveView] = useState<View>("browse");
	const [activeCategory, setActiveCategory] =
		useState<AssetCategory>("reusable_products");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedListingId, setSelectedListingId] = useState<string | null>(
		null,
	);
	const [purchasingId, setPurchasingId] = useState<string | null>(null);

	// ─── Purchase Modal State ───────────────────────────────
	const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
	const [purchaseListingData, setPurchaseListingData] = useState<any>(null);
	const [purchaseSellerName, setPurchaseSellerName] = useState("");
	const [purchaseSellerAvatar, setPurchaseSellerAvatar] = useState<
		string | null
	>(null);

	// ─── Hooks ──────────────────────────────────────────────
	const { listings, orders, inbox, loading, refresh, completeOnboarding } =
		useMarket(userId);

	const handlePurchaseClick = useCallback(
		async (listingId: string) => {
			const listing = listings.find((l) => l.id === listingId);
			if (!listing) {
				alert("Listing not found");
				return;
			}

			try {
				const { data: sellerData, error: sellerError } = await supabase
					.from("profiles")
					.select("display_name, username, avatar_url")
					.eq("id", listing.seller_id)
					.maybeSingle();

				let sellerName = "Seller";
				let sellerAvatar: string | null = null;
				if (sellerData) {
					sellerName =
						sellerData.display_name || sellerData.username || "Seller";
					sellerAvatar = sellerData.avatar_url || null;
				}

				setPurchaseListingData(listing);
				setPurchaseSellerName(sellerName);
				setPurchaseSellerAvatar(sellerAvatar);
				setPurchaseModalOpen(true);
			} catch (err) {
				alert("Failed to load seller details");
			}
		},
		[listings],
	);

	const handlePurchaseConfirm = useCallback(async () => {
		if (!purchaseListingData) return;

		try {
			const response = await fetch("/api/purchase/confirm", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ listing_id: purchaseListingData.id }),
			});

			const result = await response.json();

			if (!response.ok) {
				const errorMsg = result.error || "Purchase failed";
				console.warn("Purchase failed:", errorMsg);
				return { success: false, error: errorMsg };
			}

			toast({
				title: "🎉 Purchase Successful!",
				description: `${purchaseListingData.title} has been added to your locker.`,
				variant: "success",
				duration: 4000,
			});

			setPurchaseModalOpen(false);
			setPurchaseListingData(null);
			await refresh();

			return { success: true };
		} catch (err: any) {
			console.warn("Purchase error:", err.message);
			return { success: false, error: err.message };
		}
	}, [purchaseListingData, refresh]);

	const handleListingClick = useCallback((listingId: string) => {
		setSelectedListingId(listingId);
	}, []);

	const handleBack = useCallback(() => {
		setSelectedListingId(null);
	}, []);

	const handleMessageSeller = useCallback(
		(sellerId: string, listingId: string) => {
			const username = profile?.username;

			if (username) {
				// ✅ Client-side navigation to chat page
				router.push(`/m/${username}/chat?user=${sellerId}`);
			} else {
				// Fallback
				setActiveView("messages");
			}
		},
		[profile, router],
	);

	// ─── Session Sync ────────────────────────────────────────
	useEffect(() => {
		let active = true;

		async function syncSession() {
			try {
				const { data: session } = await supabase.auth.getSession();
				if (session.session?.user && active) {
					const uid = session.session.user.id;

					const { data: p } = await supabase
						.from("profiles")
						.select("*")
						.eq("id", uid)
						.maybeSingle();
					if (p && active) setProfile(p as Profile);

					const { data: s } = await supabase
						.from("global_market_stores")
						.select("*")
						.eq("user_id", uid)
						.maybeSingle();
					if (s && active) setStoreData(s as StoreData);
				}
			} catch (err) {}
		}

		syncSession();

		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				if (session?.user && active) {
					supabase
						.from("profiles")
						.select("*")
						.eq("id", session.user.id)
						.maybeSingle()
						.then(({ data: p }) => {
							if (p && active) setProfile(p as Profile);
						});

					supabase
						.from("global_market_stores")
						.select("*")
						.eq("user_id", session.user.id)
						.maybeSingle()
						.then(({ data: s }) => {
							if (s && active) setStoreData(s as StoreData);
						});
				}
			},
		);

		return () => {
			active = false;
			authListener.subscription.unsubscribe();
		};
	}, []);

	// ─── Render Content ──────────────────────────────────────
	const renderContent = () => {
		if (selectedListingId) {
			return (
				<MarketAssetDetail
					listingId={selectedListingId}
					userId={userId}
					onBack={handleBack}
					onPurchase={handlePurchaseClick}
					onMessageSeller={handleMessageSeller}
					isPurchasing={purchasingId === selectedListingId}
				/>
			);
		}

		switch (activeView) {
			case "store":
				return <StoreFrontPanel />;

			case "locker":
				return (
					<AssetPurchaseLocker
						orders={orders}
						listings={listings}
						currentUserId={userId}
						onRefresh={refresh}
					/>
				);

			case "messages":
				return (
					<div className="text-center py-20 text-zinc-400">
						<h3 className="text-xl font-bold text-white">Messages</h3>
						<p className="text-sm mt-2">Coming soon...</p>
					</div>
				);

			case "browse":
			default:
				return (
					<MarketBrowseGrid
						userId={userId}
						listings={listings}
						loading={loading}
						searchQuery={searchQuery}
						category={activeCategory}
						onListingClick={handleListingClick}
						onPurchase={handlePurchaseClick}
						purchasingId={purchasingId}
					/>
				);
		}
	};

	// ─── Loading ────────────────────────────────────────────
	if (!profile) {
		return (
			<div className="flex h-[60vh] w-full items-center justify-center bg-black">
				<div className="flex flex-col items-center gap-3">
					<div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
					<p className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">
						Loading marketplace...
					</p>
				</div>
			</div>
		);
	}

	// ─── Render ─────────────────────────────────────────────
	return (
		<div className="min-h-screen overflow-hidden bg-black text-white">
			{/* ───────────────── ELITE HERO ───────────────── */}
			<div className="sticky top-0 z-50 border-b border-white/5 bg-gradient-to-b from-black via-black/95 to-transparent backdrop-blur-2xl">
				<div className="mx-auto max-w-7xl px-6 pt-6 pb-8">
					{/* Top Row */}
					<div className="flex items-start justify-between">
						{activeView !== "browse" && (
							<button
								onClick={() => setActiveView("browse")}
								className="rounded-full bg-zinc-900/80 border border-white/10 p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all backdrop-blur-sm"
								aria-label="Close storefront"
							>
								<ArrowLeft className="h-5 w-5" />
							</button>
						)}

						{activeView === "browse" && <div className="w-10" />}

						<Button
							variant={activeView === "store" ? "default" : "ghost"}
							onClick={() => setActiveView("store")}
							className={`
      h-11 rounded-full
      px-6
      border border-white/10
      bg-white/[0.04]
      text-white
      hover:bg-white/[0.08]
      transition-all
      backdrop-blur-xl
    `}
						>
							<Store className="mr-2 h-4 w-4" />
							Your Store
						</Button>
					</div>

					{/* Hero */}
					<div className="mt-6 flex flex-col items-center text-center">
						<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/15 bg-amber-400/5 px-4 py-1.5">
							<Sparkles className="h-4 w-4 text-amber-400" />
							<span className="text-[11px] uppercase tracking-[0.35em] text-amber-300">
								Elite Digital Experience
							</span>
						</div>

						<h1 className="text-5xl font-black tracking-[-0.05em] text-white sm:text-6xl">
							Digital Assets Hub
						</h1>

						<p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
							Discover premium digital products, assets, verified creators,
							exclusive experiences and trusted business services from around
							the world.
						</p>

						{/* Search */}
						<div className="mt-10 w-full max-w-3xl">
							<div className="group relative">
								<Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-emerald-400" />

								<Input
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search products, brands, creators or experiences..."
									className="
              h-12
              rounded-full
              text-center
              border
              border-white/8
              bg-white/[0.035]
              pl-14
              pr-6
              text-base
              text-emerald/800
              placeholder:text-zinc-500
              backdrop-blur-3xl
              shadow-[0_0_60px_rgba(255,255,255,0.03)]
              transition-all
              hover:border-white/15
              focus:border-emerald-500/40
              focus:bg-white/[0.045]
              focus:ring-0
            "
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* ───────────────── Floating Category Tabs ───────────────── */}
			{activeView === "browse" && (
				<div className="px-4 pt-4">
					<div className="mx-auto max-w-7xl rounded-full border border-white/[0.04] bg-white/[0.02] backdrop-blur-3xl shadow-[0_6px_30px_rgba(0,0,0,.25)]">
						<CategoryTabs
							activeCategory={activeCategory}
							onCategoryChange={setActiveCategory}
						/>
					</div>
				</div>
			)}

			{/* ───────────────── Main Content ───────────────── */}
			<div className="mx-auto max-w-7xl px-4 py-8 pb-20">{renderContent()}</div>

			{/* ───────────────── Purchase Confirmation Modal ──────────── */}
			<PurchaseConfirmationModal
				open={purchaseModalOpen}
				onClose={() => {
					// ✅ Only close if there's NO error in the modal
					// The modal manages its own error state
					setPurchaseModalOpen(false);
					setPurchaseListingData(null);
				}}
				listing={purchaseListingData}
				sellerName={purchaseSellerName}
				sellerAvatar={purchaseSellerAvatar}
				onConfirm={handlePurchaseConfirm}
			/>
		</div>
	);
}
