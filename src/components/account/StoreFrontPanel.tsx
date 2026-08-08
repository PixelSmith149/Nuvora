"use client";

import {
	ArrowUpRight,
	Bell,
	ChevronDown,
	ExternalLink,
	Eye,
	FileCode,
	Globe,
	Layers,
	Loader2,
	Lock,
	Menu,
	MessageSquare,
	Package,
	Plus,
	Settings,
	Settings as SettingsIcon,
	ShieldCheck,
	ShoppingBag,
	Store,
	User,
	Users,
	Verified,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AssetPurchaseLocker } from "@/components/market/AssetPurchaseLocker";
import { CreateListingModal } from "@/components/market/CreateListingModal";
import { SellerListingsManager } from "@/components/market/SellerListingsManager";
import { SellerMessagingPanel } from "@/components/market/SellerMessagingPanel";
import { SellerSoldAssets } from "@/components/market/SellerSoldAssets";
import { SellerSoldAssetsModal } from "@/components/market/SellerSoldAssetsModal";
import { StoreSettingsModal } from "@/components/market/SellerStoreSettings";
import { StorefrontOnboardingModal } from "@/components/market/StorefrontOnboardingModal";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabase/client";
import type { MarketListing, Profile, TabCategory } from "@/lib/types";
import { useMarket } from "@/lib/use-market";
import { useAppRealtime } from "@/lib/useAppRealtime";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface StoreData {
	id: string;
	user_id: string;
	is_verified: boolean;
	tiktok_handle: string | null;
	snapchat_handle: string | null;
	contact_email: string | null;
	marketing_email: string | null;
	verification_video_url: string | null;
	store_avatar_url?: string | null;
	store_banner_url?: string | null;
	business_name?: string | null;
	store_description?: string | null;
	website_url?: string | null;
}

interface ListingWithDetails extends MarketListing {
	one_time_tool?: {
		id: string;
		product_title: string;
		sale_price: number;
		display_cover_url: string | null;
	} | null;
	reusable_product?: {
		id: string;
		product_title: string;
		sale_price: number;
		display_cover_url: string | null;
	} | null;
	socio_metrics?: {
		id: string;
		platform_name: string;
		target_username: string;
		followers_count: number;
	} | null;
}

type PanelView = "listings" | "messages" | "sold" | "inbox" | "locker";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function StoreFrontPanel() {
	// ─── Global Session ────────────────────────────────────────────────────────
	const {
		userId,
		profile: globalProfile,
		storeData: globalStoreData,
		isLoading: globalLoading,
	} = useAppSession();

	// ─── Local State ──────────────────────────────────────────────────────────
	const [profile, setProfile] = useState<Profile | null>(null);
	const [storeData, setStoreData] = useState<StoreData | null>(null);
	const [authLoading, setAuthLoading] = useState(true);

	// ─── UI State ─────────────────────────────────────────────────────────────
	const [storeSettingsOpen, setStoreSettingsOpen] = useState(false);
	const [activeView, setActiveView] = useState<PanelView>("listings");
	const [activeCategory, setActiveCategory] =
		useState<TabCategory>("digital_tool");
	const [onboardingOpen, setOnboardingOpen] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [selectedListingId, setSelectedListingId] = useState<string | null>(
		null,
	);
	const [toast, setToast] = useState<{
		msg: string;
		type: "success" | "error";
	} | null>(null);
	const [soldAssetsModalOpen, setSoldAssetsModalOpen] = useState(false);

	// ─── Global Realtime ──────────────────────────────────────────────────────
	const { onEvent } = useAppRealtime();

	// ─── Counts State ─────────────────────────────────────────────────────────
	const [followersCount, setFollowersCount] = useState(0);
	const [reviewsCount, setReviewsCount] = useState(0);

	const isVerified = storeData?.is_verified ?? false;
	// ─── Market Data ──────────────────────────────────────────────────────────
	const {
		store,
		listings,
		orders,
		inbox,
		loading: marketLoading,
		completeOnboarding,
		createListing,
		refresh: refreshMarket,
	} = useMarket(profile?.id ?? null);

	// ──────────────────────────────────────────────────────────────────────────
	// EFFECTS
	// ──────────────────────────────────────────────────────────────────────────

	// ─── Listen to realtime events ───────────────────────────────────────────
	useEffect(() => {
		const unsubscribeFollow = onEvent("app:followers-update", (detail) => {
			setFollowersCount((prev) => prev + (detail?.count || 1));
		});

		const unsubscribeReviews = onEvent("app:reviews-update", (detail) => {
			setReviewsCount((prev) => prev + (detail?.count || 1));
		});

		return () => {
			unsubscribeFollow?.();
			unsubscribeReviews?.();
		};
	}, [onEvent]);

	// ─── Sync global session to local state ──────────────────────────────────
	useEffect(() => {
		if (!globalLoading) {
			if (globalProfile) {
				setProfile(globalProfile as Profile);
				setAuthLoading(false);
			}
			if (globalStoreData) {
				setStoreData(globalStoreData as StoreData);
			}
		}
	}, [globalProfile, globalStoreData, globalLoading]);

	// ─── Session Sync Fallback ───────────────────────────────────────────────
	useEffect(() => {
		let active = true;

		async function syncActiveSession() {
			if (!globalLoading && globalProfile) {
				return;
			}

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
			} catch (err) {
				console.error("Market auth sync failure:", err);
			} finally {
				if (active) setAuthLoading(false);
			}
		}

		if (!globalLoading && !globalProfile) {
			syncActiveSession();
		}

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
				} else {
					if (active) {
						setProfile(null);
						setStoreData(null);
					}
				}
			},
		);

		return () => {
			active = false;
			authListener.subscription.unsubscribe();
		};
	}, [globalLoading, globalProfile]);

	// ─── Fetch Followers Count ───────────────────────────────────────────────
	useEffect(() => {
		async function fetchFollowersCount() {
			if (!userId) return;

			try {
				const response = await fetch(`/api/social/followers?user_id=${userId}`);
				if (!response.ok) {
					console.error("Failed to fetch followers count");
					return;
				}
				const data = await response.json();
				setFollowersCount(data.followers || 0);
			} catch (err) {
				console.error("Error fetching followers count:", err);
			}
		}

		if (isVerified && userId) {
			fetchFollowersCount();
		}
	}, [userId, isVerified]);

	// ─── Fetch Reviews Count ──────────────────────────────────────────────────
	useEffect(() => {
		async function fetchReviewsCount() {
			if (!userId) return;

			try {
				const { count, error } = await supabase
					.from("asset_reviews")
					.select("id", { count: "exact", head: true })
					.eq("seller_id", userId);

				if (error) {
					console.error("Failed to fetch reviews count:", error);
					return;
				}

				setReviewsCount(count || 0);
			} catch (err) {
				console.error("Error fetching reviews count:", err);
			}
		}

		if (isVerified && userId) {
			fetchReviewsCount();
		}
	}, [userId, isVerified]);

	// ──────────────────────────────────────────────────────────────────────────
	// COMPUTED VALUES
	// ──────────────────────────────────────────────────────────────────────────

	const unreadInbox = inbox.filter((m) => !m.is_read).length;

	const storeAvatar = storeData?.store_avatar_url || profile?.avatar_url;
	const storeBanner = storeData?.store_banner_url;
	const displayName =
		storeData?.business_name ||
		profile?.display_name ||
		profile?.username ||
		"User";
	const username = profile?.username || "user";
	const storeDescription = storeData?.store_description;
	const websiteUrl = storeData?.website_url;

	// ──────────────────────────────────────────────────────────────────────────
	// CALLBACKS
	// ──────────────────────────────────────────────────────────────────────────

	// ─── Filter listings ──────────────────────────────────────────────────────
	const getFilteredListings = useCallback((): ListingWithDetails[] => {
		const sellerListings = listings.filter(
			(listing) => listing.seller_id === userId,
		);

		return sellerListings.filter((listing) => {
			switch (activeCategory) {
				case "digital_tool":
					return (
						listing.reusable_product !== null ||
						(listing.one_time_tool === null && listing.socio_metrics === null)
					);
				case "product":
					return listing.one_time_tool !== null;
				case "socio_market":
					return listing.socio_metrics !== null;
				default:
					return true;
			}
		}) as ListingWithDetails[];
	}, [listings, userId, activeCategory]);

	// ─── Toast Helper ─────────────────────────────────────────────────────────
	const showToast = useCallback(
		(msg: string, type: "success" | "error" = "success") => {
			setToast({ msg, type });
			setTimeout(() => setToast(null), 4000);
		},
		[],
	);

	// ─── Handle Listing Click ────────────────────────────────────────────────
	const handleListingClick = (listingId: string) => {
		setSelectedListingId(listingId);
	};

	const handleBackToListings = () => {
		setSelectedListingId(null);
	};

	// ──────────────────────────────────────────────────────────────────────────
	// RENDER HELPERS
	// ──────────────────────────────────────────────────────────────────────────

	// ─── Loading State ────────────────────────────────────────────────────────
	if (authLoading || globalLoading) {
		return (
			<div className="flex h-[40vh] w-full items-center justify-center bg-black">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
					<p className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">
						Syncing Session Gateway...
					</p>
				</div>
			</div>
		);
	}

	// ─── Unauthenticated ──────────────────────────────────────────────────────
	if (!profile) {
		return (
			<div className="flex flex-col items-center justify-center bg-black py-12 px-4 text-center">
				<div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 max-w-md w-full shadow-2xl">
					<div className="mx-auto w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
						<User className="h-6 w-6 text-red-400" />
					</div>
					<h3 className="text-lg font-bold text-white mb-2">
						Authentication Required
					</h3>
					<p className="text-sm text-zinc-400 leading-relaxed mb-6">
						Please authenticate to access your seller dashboard.
					</p>
				</div>
			</div>
		);
	}

	// ──────────────────────────────────────────────────────────────────────────
	// RENDER: CONTENT
	// ──────────────────────────────────────────────────────────────────────────

	const renderContent = () => {
		// ─── FULL PAGE: Messages ──────────────────────────────────────────────
		if (activeView === "messages") {
			return (
				<div className="w-full">
					<SellerMessagingPanel
						userId={userId!}
						authenticatedUserId={userId!}
					/>
				</div>
			);
		}

		// ─── FULL PAGE: Sold Assets ────────────────────────────────────────────
		if (activeView === "sold") {
			return (
				<div className="w-full">
					<SellerSoldAssets userId={userId!} />
				</div>
			);
		}

		// ─── FULL PAGE: Asset Locker ───────────────────────────────────────────
		if (activeView === "locker") {
			return (
				<div className="w-full">
					<AssetPurchaseLocker
						orders={orders}
						listings={listings}
						currentUserId={userId}
						onRefresh={refreshMarket}
					/>
				</div>
			);
		}

		// ─── FULL PAGE: Listing Detail ─────────────────────────────────────────
		if (selectedListingId) {
			return (
				<div className="w-full">
					<SellerListingsManager
						listingId={selectedListingId}
						userId={userId!}
						onBack={handleBackToListings}
						onUpdate={refreshMarket}
						onDelete={() => {
							setSelectedListingId(null);
							refreshMarket();
						}}
					/>
				</div>
			);
		}

		{/* ─── Not Verified ─────────────────────────────────────────────── */}
if (!isVerified) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-amber-400/[0.14] bg-[#0b0d0f] p-5 sm:p-6">
      {/* Ambient security glow */}
      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-48
          w-48
          rounded-full
          bg-amber-400/[0.055]
          blur-[70px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-16
          -left-10
          h-32
          w-32
          rounded-full
          bg-emerald-400/[0.025]
          blur-[55px]
        "
      />

      {/* Top reflection */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-8
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-amber-300/20
          to-transparent
        "
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Verification icon */}
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-[15px]
              border
              border-amber-400/[0.18]
              bg-amber-400/[0.06]
              text-amber-300
              shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
            "
          >
            <ShieldCheck
              className="h-5 w-5"
              strokeWidth={1.7}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
                Complete Storefront Verification
              </h2>

              <span
                className="
                  rounded-full
                  border
                  border-amber-400/[0.14]
                  bg-amber-400/[0.05]
                  px-2
                  py-0.5
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-amber-300/70
                "
              >
                Required
              </span>
            </div>

            <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-500">
              To start listing and selling assets, you need to complete
              the identity verification process.
            </p>
          </div>
        </div>

        {/* Verification action */}
        <Link
          href={`/m/${username}/onboarding`}
          className="
            group
            relative
            mt-6
            flex
            w-full
            items-center
            justify-between
            overflow-hidden
            rounded-[16px]
            border
            border-amber-400/[0.18]
            bg-amber-400/[0.055]
            px-4
            py-3.5
            transition-all
            duration-300
            hover:-translate-y-[1px]
            hover:border-amber-400/[0.30]
            hover:bg-amber-400/[0.085]
            hover:shadow-[0_12px_35px_rgba(251,191,36,0.08)]
            active:translate-y-0
            active:scale-[0.99]
          "
        >
          {/* Shimmer */}
          <span
            className="
              pointer-events-none
              absolute
              inset-y-0
              -left-[100%]
              w-1/2
              skew-x-[-20deg]
              bg-gradient-to-r
              from-transparent
              via-white/[0.09]
              to-transparent
              transition-transform
              duration-700
              group-hover:translate-x-[400%]
            "
          />

          <span className="relative flex items-center gap-3">
            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                border-amber-300/[0.18]
                bg-amber-300/[0.07]
              "
            >
              <ShieldCheck
                className="h-4 w-4 text-amber-300"
                strokeWidth={1.8}
              />
            </span>

            <span className="text-sm font-semibold text-amber-100">
              Start Verification
            </span>
          </span>

          <ArrowUpRight
            className="
              relative
              h-4
              w-4
              text-amber-400/60
              transition-all
              duration-300
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
              group-hover:text-amber-300
            "
            strokeWidth={1.8}
          />
        </Link>

        {/* Trust indicator */}
        <div className="mt-4 flex items-center gap-2 text-[10px] text-zinc-600">
          <Lock
            className="h-3 w-3"
            strokeWidth={1.8}
          />

          <span>
            Secure identity verification
          </span>

          <span className="h-1 w-1 rounded-full bg-zinc-700" />

          <span>
            Required before selling
          </span>
        </div>
      </div>

      {/* Bottom accent */}
      <div
        className="
          absolute
          bottom-0
          left-1/2
          h-[2px]
          w-[35%]
          -translate-x-1/2
          rounded-full
          bg-gradient-to-r
          from-transparent
          via-amber-400/60
          to-transparent
        "
      />
    </div>
  );
}

		// ─── MAIN LISTINGS GRID ─────────────────────────────────────────────────
		const filteredListings = getFilteredListings();

		return (
			<div className="w-full space-y-4">
				{/* ─── Category Tabs ────────────────────────────────────────────── */}
				<div className="w-full border-b border-white/5 pb-3">
                 <div className="flex items-center justify-center overflow-x-auto scrollbar-hide">
                  <div className="flex flex-nowrap items-center gap-2 min-w-max">
						<Button
							variant={activeCategory === "digital_tool" ? "default" : "ghost"}
							onClick={() => setActiveCategory("digital_tool")}
							className={`h-8 px-4 text-xs rounded-xl font-bold transition-all ${
								activeCategory === "digital_tool"
									? "bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
									: "text-zinc-400 hover:text-white hover:bg-white/5"
							}`}
						>
							<FileCode className="h-3.5 w-3.5 mr-1.5" />
							Digital Tools
						</Button>
						<Button
							variant={activeCategory === "product" ? "default" : "ghost"}
							onClick={() => setActiveCategory("product")}
							className={`h-8 px-4 text-xs rounded-xl font-bold transition-all ${
								activeCategory === "product"
									? "bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
									: "text-zinc-400 hover:text-white hover:bg-white/5"
							}`}
						>
							<Package className="h-3.5 w-3.5 mr-1.5" />
							Products
						</Button>
						<Button
							variant={activeCategory === "socio_market" ? "default" : "ghost"}
							onClick={() => setActiveCategory("socio_market")}
							className={`h-8 px-4 text-xs rounded-xl font-bold transition-all ${
								activeCategory === "socio_market"
									? "bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
									: "text-zinc-400 hover:text-white hover:bg-white/5"
							}`}
						>
							<Users className="h-3.5 w-3.5 mr-1.5" />
							Social Accounts
						</Button>

						 <Badge className="ml-2 flex-none bg-zinc-900 border-white/5 text-zinc-400 text-[10px] font-bold">
							{filteredListings.length}
						</Badge>
					</div>
				  </div>
				</div>

				{/* ─── Listings Grid ────────────────────────────────────────────── */}
				{marketLoading ? (
					<div className="flex flex-col items-center justify-center py-16 gap-3">
						<Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
						<p className="text-xs text-zinc-500 font-medium">
							Loading your listings...
						</p>
					</div>
				) : filteredListings.length === 0 ? (
					<div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-zinc-950/20">
						<Package className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
						<p className="text-sm font-semibold text-zinc-400">
							No listings in this category
						</p>
						<p className="text-xs text-zinc-600 mt-1">
							{activeCategory === "digital_tool" &&
								"Create a reusable digital tool listing."}
							{activeCategory === "product" &&
								"Create a one-time product listing."}
							{activeCategory === "socio_market" &&
								"List a social media account."}
						</p>
						<Button
							onClick={() => setCreateOpen(true)}
							className="mt-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs px-4 py-2"
						>
							<Plus className="h-3.5 w-3.5 mr-1.5" />
							Create New Listing
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-2 gap-2 sm:gap-4">
						{filteredListings.map((listing) => {
							// ─── Card Data ────────────────────────────────────────────
							let displayTitle = listing.title;
							let displayImage = listing.display_pic_url;
							let assetType = "";
							let assetIcon = <Package className="h-4 w-4" />;

							if (listing.one_time_tool) {
								displayTitle =
									listing.one_time_tool.product_title || listing.title;
								displayImage =
									listing.one_time_tool.display_cover_url ||
									listing.display_pic_url;
								assetType = "One-Time";
								assetIcon = <Package className="h-4 w-4" />;
							} else if (listing.reusable_product) {
								displayTitle =
									listing.reusable_product.product_title || listing.title;
								displayImage =
									listing.reusable_product.display_cover_url ||
									listing.display_pic_url;
								assetType = "Reusable";
								assetIcon = <FileCode className="h-4 w-4" />;
							} else if (listing.socio_metrics) {
								displayTitle =
									listing.socio_metrics.target_username || listing.title;
								displayImage = listing.display_pic_url;
								assetType = listing.socio_metrics.platform_name || "Social";
								assetIcon = <Users className="h-4 w-4" />;
							}

							const statusMap: Record<
								string,
								{ label: string; className: string }
							> = {
								active: {
									label: "Active",
									className:
										"bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
								},
								draft: {
									label: "Draft",
									className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
								},
								suspended: {
									label: "Suspended",
									className: "bg-red-500/20 text-red-400 border-red-500/30",
								},
								sold: {
									label: "Sold",
									className:
										"bg-amber-500/20 text-amber-400 border-amber-500/30",
								},
								deleted: {
									label: "Deleted",
									className:
										"bg-red-500/20 text-red-400 border-red-500/30 line-through",
								},
							};
							const status = statusMap[listing.status] || statusMap.draft;

							// ─── Card Render ──────────────────────────────────────────
							return (
								<div
									key={listing.id}
									role="button"
									tabIndex={0}
									onClick={() => handleListingClick(listing.id)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											handleListingClick(listing.id);
										}
									}}
									className="group relative bg-zinc-950/60 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer"
								>
									<div className="aspect-video bg-zinc-900 relative overflow-hidden">
										{displayImage ? (
											<img
												src={displayImage}
												alt={displayTitle}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center bg-zinc-900/50">
												{assetIcon}
											</div>
										)}

										<div className="absolute top-3 left-3">
											<Badge
												variant="outline"
												className="border-white/10 bg-black/70 backdrop-blur-sm text-[9px] font-bold flex items-center gap-1.5 text-zinc-300"
											>
												{assetIcon}
												{assetType}
											</Badge>
										</div>

										<div className="absolute top-3 right-3">
											<Badge
												className={`text-[9px] font-bold border ${status.className}`}
											>
												{status.label}
											</Badge>
										</div>

										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
											<div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-2 border border-white/10">
												<Eye className="h-4 w-4 text-white" />
												<span className="text-xs font-bold text-white">
													View Details
												</span>
											</div>
										</div>
									</div>

									<div className="p-4 space-y-1.5">
										<h4 className="text-sm font-bold text-white truncate">
											{displayTitle}
										</h4>
										<div className="flex items-center justify-between">
											<span className="text-sm font-black text-emerald-400">
												${listing.price?.toFixed(2) || "0.00"}
											</span>
											<span className="text-[9px] text-zinc-600">
												{new Date(listing.created_at).toLocaleDateString()}
											</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		);
	};

	// ──────────────────────────────────────────────────────────────────────────
	// RENDER: MAIN
	// ──────────────────────────────────────────────────────────────────────────

	return (
		<div className="w-full bg-black text-white min-h-screen overflow-x-hidden">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-5">
				{/* ─── TOP BAR: Menu Button ──────────────────────────────────────── */}
				<div className="flex items-center justify-end">
					<div className="relative">
						<Button
							variant="outline"
							onClick={() => setShowMenu(!showMenu)}
							className="h-9 px-3 rounded-xl border-white/10 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
						>
							<Menu className="h-4 w-4" />
							<ChevronDown
								className={`h-3.5 w-3.5 ml-1 transition-transform ${showMenu ? "rotate-180" : ""}`}
							/>
						</Button>

						{showMenu && (
							<>
								<div
									className="fixed inset-0 z-40"
									onClick={() => setShowMenu(false)}
								/>
								<div className="absolute right-0 top-full mt-1.5 z-50 w-56 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl py-1.5 overflow-hidden">
									{/* My Listings */}
									<button
										onClick={() => {
											setActiveView("listings");
											setSelectedListingId(null);
											setShowMenu(false);
										}}
										className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${
											activeView === "listings" && !selectedListingId
												? "text-emerald-400 bg-emerald-500/10"
												: "text-zinc-300 hover:bg-white/5"
										}`}
									>
										<Layers className="h-4 w-4" />
										My Listings
									</button>

									{/* Messages */}
									<Link
										href={`/m/${username}/chat`}
										className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${
											activeView === "messages"
												? "text-emerald-400 bg-emerald-500/10"
												: "text-zinc-300 hover:bg-white/5"
										}`}
										onClick={() => setShowMenu(false)}
									>
										<MessageSquare className="h-4 w-4" />
										Messages
									</Link>

									{/* Sold Assets */}
									<button
										onClick={() => {
											setActiveView("sold");
											setSelectedListingId(null);
											setShowMenu(false);
										}}
										className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${
											activeView === "sold"
												? "text-emerald-400 bg-emerald-500/10"
												: "text-zinc-300 hover:bg-white/5"
										}`}
									>
										<ShoppingBag className="h-4 w-4" />
										Sold Assets
									</button>

									<div className="h-px bg-white/5 my-1" />

									{/* Asset Locker */}
									<button
										onClick={() => {
											setActiveView("locker");
											setSelectedListingId(null);
											setShowMenu(false);
										}}
										className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${
											activeView === "locker"
												? "text-emerald-400 bg-emerald-500/10"
												: "text-zinc-300 hover:bg-white/5"
										}`}
									>
										<Lock className="h-4 w-4" />
										Asset Locker
									</button>

									<div className="h-px bg-white/5 my-1" />

									{/* Create Listing (Shortcut) */}
									{isVerified && (
										<button
											onClick={() => {
												setCreateOpen(true);
												setShowMenu(false);
											}}
											className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"
										>
											<Plus className="h-4 w-4" />
											Create New Listing
										</button>
									)}

									{/* Store Settings */}
									<button
										onClick={() => {
											setShowMenu(false);
											setStoreSettingsOpen(true);
										}}
										className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-white/5 transition-colors"
									>
										<SettingsIcon className="h-4 w-4" />
										Store Settings
									</button>
								</div>
							</>
						)}
					</div>
				</div>

				{/* ─── PROFILE HEADER ────────────────────────────────────────────── */}
				{activeView === "listings" && !selectedListingId && (
					<>
						{/* ─── Cover Card ────────────────────────────────────────────── */}
						<div className="relative w-full rounded-2xl overflow-hidden border  border-white/5 bg-zinc-950/40">
							<div className="w-full aspect-[3/1] md:aspect-[4/1] bg-zinc-900 relative">
								{storeBanner ? (
									<img
										src={storeBanner}
										alt={displayName}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full bg-gradient-to-r from-emerald-900/30 via-zinc-800 to-emerald-900/30 flex items-center justify-center">
										<Store className="h-12 w-12 text-zinc-700" />
									</div>
								)}
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
							</div>

							{/* Avatar Overlay */}
							<div className="absolute bottom-0 left-4 md:left-6 translate-y-1/2">
								<Avatar className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-black shadow-xl">
									{storeAvatar ? (
										<AvatarImage src={storeAvatar} className="object-cover" />
									) : (
										<AvatarFallback className="bg-zinc-800 text-3xl text-zinc-400">
											{displayName?.[0] || "S"}
										</AvatarFallback>
									)}
								</Avatar>
							</div>

							{/* Display Name & Username */}
							<div className="absolute bottom-3 right-4 md:right-6 text-right">
								<div className="flex items-center gap-2 justify-end">
									<span className="text-sm md:text-base font-bold text-white">
										{displayName}
									</span>
									{isVerified && (
										<Verified className="h-4 w-4 text-emerald-400 fill-emerald-400" />
									)}
								</div>
								<p className="text-[10px] md:text-xs text-zinc-400">
									@{username}
								</p>
							</div>
						</div>

						{/* ─── Spacer ─────────────────────────────────────────────────── */}
						<div className="h-10" />

						{/* ─── Stats Bar ─────────────────────────────────────────────── */}
						<div className="w-full bg-zinc-950/40 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-2">
							<div className="flex-1 text-center">
								<p className="text-xs font-bold text-white">{followersCount}</p>
								<p className="text-[9px] text-zinc-500 uppercase tracking-wider">
									Followers
								</p>
							</div>
							<div className="flex-1 text-center border-x border-white/5 px-2">
								<p className="text-xs font-bold text-white">{reviewsCount}</p>
								<p className="text-[9px] text-zinc-500 uppercase tracking-wider">
									Reviews
								</p>
							</div>
							<div className="flex-1 text-center">
								<p className="text-xs font-bold text-white">
									{listings.filter((l) => l.seller_id === userId).length}
								</p>
								<p className="text-[9px] text-zinc-500 uppercase tracking-wider">
									Assets
								</p>
							</div>
						</div>

						{/* ─── Handles & Verified ────────────────────────────────────── */}
						<div className="w-full h-10 flex flex-wrap items-center justify-center gap-3 text-center">
							<div className="flex flex-wrap items-center gap-3">
								{storeData?.tiktok_handle && (
									<div className="flex items-center gap-1 text-sm text-zinc-400">
										<span className="text-base">🎵</span>
										<span>{storeData.tiktok_handle}</span>
									</div>
								)}
								{storeData?.snapchat_handle && (
									<div className="flex items-center gap-1 text-sm text-zinc-400">
										<span className="text-base">👻</span>
										<span>{storeData.snapchat_handle}</span>
									</div>
								)}
								{!storeData?.tiktok_handle && !storeData?.snapchat_handle && (
									<span className="text-sm text-zinc-500">
										No social handles
									</span>
								)}
							</div>
							{isVerified && (
								<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-bold flex items-center gap-1 px-3 py-1">
									<Verified className="h-4 w-4" />
									Verified Seller
								</Badge>
							)}
						</div>

						{/* ─── Bio ────────────────────────────────────────────────────── */}
						{storeDescription && (
							<div className="w-full text-center">
								<p className="text-sm text-zinc-300 leading-relaxed">
									{storeDescription}
								</p>
							</div>
						)}

						{/* ─── Website ────────────────────────────────────────────────── */}
						{websiteUrl && (
							<div className="w-full flex justify-center">
								<a
									href={websiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-emerald-400 text-center hover:text-emerald-300 transition-colors flex items-center gap-1"
								>
									<Globe className="h-4 w-4" />
									{websiteUrl.replace(/^https?:\/\//, "")}
									<ExternalLink className="h-3 w-3 text-center" />
								</a>
							</div>
						)}
					</>
				)}

				{/* ─── CONTENT AREA ───────────────────────────────────────────────── */}
				<div className="w-full min-h-[50vh] pt-4">{renderContent()}</div>

				{/* ─── Floating Action Button ────────────────────────────────────── */}
				{isVerified && activeView === "listings" && !selectedListingId && (
					<Button
						onClick={() => setCreateOpen(true)}
						className="fixed bottom-6 right-6 z-30 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/20 px-5 py-3"
					>
						<Plus className="h-5 w-5 mr-2" />
						New Listing
					</Button>
				)}
			</div>

			{/* ────────────────────────────────────────────────────────────────────── */}
			{/* MODALS                                                                 */}
			{/* ────────────────────────────────────────────────────────────────────── */}

			<StorefrontOnboardingModal
				open={onboardingOpen}
				onClose={() => setOnboardingOpen(false)}
				onComplete={async (data) => {
					const ok = await completeOnboarding(data);
					if (ok) {
						showToast(
							"Storefront unlocked! You can now list assets.",
							"success",
						);
						setOnboardingOpen(false);
						const { data: s } = await supabase
							.from("global_market_stores")
							.select("*")
							.eq("user_id", userId)
							.maybeSingle();
						if (s) setStoreData(s as StoreData);
					} else {
						showToast("Verification failed. Please try again.", "error");
					}
					return ok;
				}}
			/>

			<SellerSoldAssetsModal
				open={soldAssetsModalOpen}
				onClose={() => setSoldAssetsModalOpen(false)}
				sellerId={userId!}
			/>

			<StoreSettingsModal
				open={storeSettingsOpen}
				onClose={() => setStoreSettingsOpen(false)}
				userId={userId!}
				storeData={storeData}
				onSave={async () => {
					const { data: s } = await supabase
						.from("global_market_stores")
						.select("*")
						.eq("user_id", userId)
						.maybeSingle();
					if (s) setStoreData(s as StoreData);
				}}
			/>

			{userId && (
				<CreateListingModal
					open={createOpen}
					onClose={() => setCreateOpen(false)}
					category={activeCategory}
					userId={userId}
					onSuccess={() => {
						showToast("Listing deployed successfully!", "success");
						refreshMarket();
					}}
				/>
			)}

			{/* ─── TOAST ────────────────────────────────────────────────────────── */}
			{toast && (
				<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300">
					<div
						className={`rounded-xl border px-4 py-3 text-xs shadow-2xl font-bold tracking-wide backdrop-blur-md ${
							toast.type === "success"
								? "border-emerald-500/20 bg-emerald-950/90 text-emerald-300"
								: "border-red-500/20 bg-red-950/90 text-red-300"
						}`}
					>
						{toast.msg}
					</div>
				</div>
			)}
		</div>
	);
}
