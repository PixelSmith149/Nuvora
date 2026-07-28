"use client";

import {
	ArrowLeft,
	Calendar,
	ChevronDown,
	Contact,
	ExternalLink,
	FileCode,
	FileText,
	Globe,
	Grid3x3,
	Heart,
	Info,
	Layers,
	Mail,
	MapPin,
	MessageCircle,
	Package,
	Phone,
	Shield,
	ShoppingBag,
	Star,
	Store,
	TrendingUp,
	User,
	Users,
	Verified,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { FollowButton } from "@/components/social/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabase/client";
import { useMarket } from "@/lib/use-market";
import { useAppRealtime } from "@/lib/useAppRealtime";
import { MarketAssetDetail } from "./MarketAssetDetail";

// ============================================================
// TYPES
// ============================================================

interface SellerProfile {
	id: string;
	display_name: string | null;
	username: string | null;
	avatar_url: string | null;
	created_at: string;
}

interface StoreData {
	id: string;
	user_id: string;
	is_verified: boolean;
	store_avatar_url: string | null;
	store_banner_url: string | null;
	business_name: string | null;
	store_description: string | null;
	about_store: string | null;
	contact_email: string | null;
	contact_phone: string | null;
	business_address: string | null;
	website_url: string | null;
	return_policy: string | null;
	shipping_policy: string | null;
	tiktok_handle: string | null;
	snapchat_handle: string | null;
}

interface SellerStorefrontProps {
	seller: SellerProfile;
	store: StoreData | null;
	listings: any[];
	totalSales: number;
	categories: string[];
	currentUserId?: string;
	onPurchase?: (listingId: string) => void;
}

// ============================================================
// ASSET CARD COMPONENT
// ============================================================

function StoreAssetCard({
	listing,
	onClick,
}: {
	listing: any;
	onClick: (id: string) => void;
}) {
	const getTypeIcon = () => {
		if (listing.tab_category === "socio_market")
			return <Users className="h-3.5 w-3.5" />;
		if (listing.product_sale_type === "one_time")
			return <Package className="h-3.5 w-3.5" />;
		return <Layers className="h-3.5 w-3.5" />;
	};

	const getTypeLabel = () => {
		if (listing.tab_category === "socio_market") return "Social";
		if (listing.product_sale_type === "one_time") return "One-Time";
		return "Reusable";
	};

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={() => onClick(listing.id)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick(listing.id);
				}
			}}
			className="group relative bg-zinc-950/60 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer"
		>
			<div className="aspect-[4/3] bg-zinc-900 relative overflow-hidden">
				{listing.display_pic_url ? (
					<img
						src={listing.display_pic_url}
						alt={listing.title}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-zinc-900/50">
						{getTypeIcon()}
					</div>
				)}

				<Badge className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm border-white/10 text-[9px] font-bold flex items-center gap-1.5 text-zinc-300">
					{getTypeIcon()}
					{getTypeLabel()}
				</Badge>

				<div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1">
					<span className="text-xs font-black text-emerald-400">
						${listing.price?.toFixed(2) || "0.00"}
					</span>
				</div>

				<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
					<div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-2 border border-white/10">
						<span className="text-xs font-bold text-white">View Details</span>
					</div>
				</div>
			</div>

			<div className="p-4 space-y-1">
				<h4 className="text-sm font-bold text-white truncate">
					{listing.title}
				</h4>
				<p className="text-[10px] text-zinc-500 truncate">
					{listing.description || "No description"}
				</p>
			</div>
		</div>
	);
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SellerStorefront({
	seller,
	store,
	listings,
	totalSales,
	categories,
	currentUserId,
}: SellerStorefrontProps) {
	const {
		userId,
		profile: globalProfile,
		storeData: globalStoreData,
		isLoading: globalLoading,
	} = useAppSession();

	const [selectedListing, setSelectedListing] = useState<string | null>(null);
	const [showDropdown, setShowDropdown] = useState(false);
	const [followersCount, setFollowersCount] = useState(0);
	const [reviewsCount, setReviewsCount] = useState(0);
	const { purchaseListing, refresh } = useMarket(currentUserId ?? null);
	const [storeData, setStoreData] = useState<StoreData | null>(null);
	const websiteUrl = storeData?.website_url;
	const tiktokHandle = store?.tiktok_handle;
	const snapchatHandle = store?.snapchat_handle;

	const isVerified = store?.is_verified ?? false;
	const { onEvent } = useAppRealtime();

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "long",
			year: "numeric",
		});
	};

	// ─── Fetch real followers count ──────────────────────────
	useEffect(() => {
		async function fetchFollowersCount() {
			if (!seller.id) return;

			try {
				const response = await fetch(
					`/api/social/followers?user_id=${seller.id}`,
				);
				if (!response.ok) {
					return;
				}
				const data = await response.json();
				setFollowersCount(data.followers || 0);
			} catch (err) {}
		}

		fetchFollowersCount();
	}, [seller.id]);

	// ─── Fetch Reviews Count ────────────────────────────────
	useEffect(() => {
		async function fetchReviewsCount() {
			if (!seller.id) return;

			try {
				const { count, error } = await supabase
					.from("asset_reviews")
					.select("id", { count: "exact", head: true })
					.eq("seller_id", seller.id);

				if (error) {
					console.error("Failed to fetch reviews count:", error);
					return;
				}

				setReviewsCount(count || 0);
			} catch (err) {
				console.error("Error fetching reviews count:", err);
			}
		}

		fetchReviewsCount();
	}, [seller.id]); // ✅ Single dependency: seller.id

	// ─── Use store data with fallbacks ──────────────────────
	const storeName =
		store?.business_name || seller.display_name || seller.username || "Store";
	const storeAvatar = store?.store_avatar_url || seller.avatar_url;
	const storeBanner = store?.store_banner_url;
	const displayName = seller.display_name || seller.username || "User";
	const username = seller.username || "user";
	const storeDescription = store?.store_description;

	// ─── Stats ──────────────────────────────────────────────

	const assetsCount = listings.length;

	// ─── If a listing is selected ──────────────────────────────
	if (selectedListing) {
		const handlePurchase = async (listingId: string) => {
			const result = await purchaseListing(listingId);
			if (result.success) {
				alert("Purchase successful!");
				setSelectedListing(null);
			} else {
				alert(result.error || "Purchase failed");
			}
		};

		return (
			<MarketAssetDetail
				listingId={selectedListing}
				userId={currentUserId || ""}
				onBack={() => setSelectedListing(null)}
				onPurchase={handlePurchase}
				onMessageSeller={(sellerId, listingId) => {}}
				isPurchasing={false}
			/>
		);
	}

	// ─── Check if any store info exists ──────────────────────
	const hasStoreInfo =
		store?.about_store ||
		store?.contact_email ||
		store?.contact_phone ||
		store?.business_address ||
		store?.website_url ||
		store?.return_policy ||
		store?.shipping_policy;

	// ─── Main Render ──────────────────────────────────────────
	return (
		<div className="min-h-screen bg-black text-white overflow-x-hidden">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-5">
				{/* ─── TOP BAR: Back Button + Dropdown ─────────────────── */}
				<div className="flex items-center justify-between">
					<Link href="/m/global-market">
						<Button
							variant="ghost"
							className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl text-xs"
						>
							<ArrowLeft className="h-4 w-4 mr-1.5" />
							Back
						</Button>
					</Link>

					{hasStoreInfo && (
						<div className="relative">
							<Button
								variant="outline"
								onClick={() => setShowDropdown(!showDropdown)}
								className="h-8 px-3 rounded-xl border-white/10 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors text-xs"
							>
								<Info className="h-3.5 w-3.5 mr-1" />
								Store Info
								<ChevronDown
									className={`h-3 w-3 ml-1 transition-transform ${showDropdown ? "rotate-180" : ""}`}
								/>
							</Button>

							{showDropdown && (
								<>
									<div
										className="fixed inset-0 z-40"
										onClick={() => setShowDropdown(false)}
									/>

									<div className="absolute right-0 top-full z-50 mt-3 w-[360px] max-h-[80vh] overflow-y-auto rounded-[30px] border border-white/[0.06] bg-black/75 p-6 backdrop-blur-3xl shadow-[0_30px_100px_rgba(0,0,0,0.75)]">
										{/* Header */}
										<div className="mb-7 text-center">
											<h3 className="text-lg font-bold tracking-tight text-white">
												{storeName}
											</h3>

											<p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-zinc-500">
												Store Information
											</p>
										</div>

										{/* About */}
										{store?.about_store && (
											<section className="mb-7">
												<div className="mb-3 flex items-center gap-2">
													<Info className="h-4 w-4 text-emerald-400" />
													<span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
														About
													</span>
												</div>

												<p className="text-[15px] leading-7 text-zinc-300 whitespace-pre-wrap">
													{store.about_store}
												</p>
											</section>
										)}

										{/* Contact */}
										{(store?.contact_email ||
											store?.contact_phone ||
											store?.business_address ||
											store?.website_url) && (
											<section className="mb-7">
												<div className="mb-4 flex items-center gap-2">
													<Contact className="h-4 w-4 text-sky-400" />
													<span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
														Contact
													</span>
												</div>

												<div className="space-y-3">
													{store?.contact_email && (
														<a
															href={`mailto:${store.contact_email}`}
															className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.03] px-4 py-3 transition-all hover:border-emerald-500/20 hover:bg-white/[0.05]"
														>
															<Mail className="h-4 w-4 text-emerald-400" />
															<span className="truncate text-sm text-zinc-200">
																{store.contact_email}
															</span>
														</a>
													)}

													{store?.contact_phone && (
														<a
															href={`tel:${store.contact_phone}`}
															className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.03] px-4 py-3 transition-all hover:border-emerald-500/20 hover:bg-white/[0.05]"
														>
															<Phone className="h-4 w-4 text-sky-400" />
															<span className="text-sm text-zinc-200">
																{store.contact_phone}
															</span>
														</a>
													)}

													{store?.business_address && (
														<div className="flex items-start gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.03] px-4 py-3">
															<MapPin className="mt-0.5 h-4 w-4 text-amber-400" />
															<span className="text-sm leading-6 text-zinc-200">
																{store.business_address}
															</span>
														</div>
													)}

													{store?.website_url && (
														<a
															href={store.website_url}
															target="_blank"
															rel="noopener noreferrer"
															className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-white/[0.03] px-4 py-3 transition-all hover:border-emerald-500/20 hover:bg-white/[0.05]"
														>
															<div className="flex items-center gap-3">
																<Globe className="h-4 w-4 text-indigo-400" />
																<span className="text-sm text-zinc-200">
																	{store.website_url.replace(
																		/^https?:\/\//,
																		"",
																	)}
																</span>
															</div>

															<ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
														</a>
													)}
												</div>
											</section>
										)}

										{/* Policies */}
										{(store?.return_policy || store?.shipping_policy) && (
											<section>
												<div className="mb-4 flex items-center gap-2">
													<Shield className="h-4 w-4 text-amber-400" />
													<span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
														Store Policies
													</span>
												</div>

												<div className="space-y-4">
													{store?.return_policy && (
														<div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">
															<h5 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
																Returns
															</h5>

															<p className="text-sm leading-6 text-zinc-300">
																{store.return_policy}
															</p>
														</div>
													)}

													{store?.shipping_policy && (
														<div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">
															<h5 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
																Delivery
															</h5>

															<p className="text-sm leading-6 text-zinc-300">
																{store.shipping_policy}
															</p>
														</div>
													)}
												</div>
											</section>
										)}
									</div>
								</>
							)}
						</div>
					)}
				</div>

				{/* ─── TIKTOK-STYLE COVER CARD ───────────────────────── */}
				<div className="relative w-full rounded-2xl overflow-hidden border border-white/5 bg-zinc-950/40">
					{/* Cover Image */}
					<div className="w-full aspect-[3/1] md:aspect-[4/1] bg-zinc-900 relative">
						{storeBanner ? (
							<img
								src={storeBanner}
								alt={storeName}
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
						<p className="text-[10px] md:text-xs text-zinc-400">@{username}</p>
					</div>
				</div>

				{/* ─── SPACER ──────────────────────────────────────────── */}
				<div className="h-10" />

				{/* ─── STATS BAR ───────────────────────────────────────── */}
				<div className="w-full bg-zinc-950/40 border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-2">
					{/* Followers with Plus Button */}
					<div className="flex-1 text-center relative">
						<div className="flex items-center justify-center gap-1">
							<p className="text-xs font-bold text-white">{followersCount}</p>
							{currentUserId && currentUserId !== seller.id && (
								<FollowButton
									targetUserId={seller.id}
									currentUserId={currentUserId}
									size="sm"
									variant="ghost"
									isPlusMode={true} // ← This makes it a small plus
									showCount={false}
									onFollowChange={(isFollowing, newCount) => {
										// Update count if needed
									}}
								/>
							)}
						</div>
					</div>

					{/* Reviews */}
					<div className="flex-1 text-center border-x border-white/5 px-2">
						<p className="text-xs font-bold text-white">{reviewsCount}</p>
						<p className="text-[9px] text-zinc-500 uppercase tracking-wider">
							Reviews
						</p>
					</div>

					{/* Assets */}
					<div className="flex-1 text-center">
						<p className="text-xs font-bold text-white">{assetsCount}</p>
						<p className="text-[9px] text-zinc-500 uppercase tracking-wider">
							Assets
						</p>
					</div>
				</div>

				{isVerified && (
					<div className="flex w-full justify-center">
						<Badge className="h-9 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-300 backdrop-blur-xl">
							<Verified className="mr-2 h-3.5 w-3.5 fill-current" />
							Verified Seller
						</Badge>
					</div>
				)}

				{/* ─── SOCIALS ─────────────────────────────────────── */}
				<div className="flex w-full flex-wrap items-center justify-center gap-3">
					{tiktokHandle && ( // ✅ Use tiktokHandle from store
						<div className="flex h-10 items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 backdrop-blur-xl transition-all hover:border-white/10 hover:bg-white/[0.05]">
							<span className="text-base">🎵</span>
							<span className="text-sm font-medium text-zinc-200">
								{tiktokHandle}
							</span>
						</div>
					)}

					{snapchatHandle && ( // ✅ Use snapchatHandle from store
						<div className="flex h-10 items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 backdrop-blur-xl transition-all hover:border-white/10 hover:bg-white/[0.05]">
							<span className="text-base">👻</span>
							<span className="text-sm font-medium text-zinc-200">
								{snapchatHandle}
							</span>
						</div>
					)}

					{!tiktokHandle &&
						!snapchatHandle && ( // ✅ Use the variables
							<span className="text-sm text-zinc-500">
								No social profiles available
							</span>
						)}
				</div>

				{/* ─── BIO ─────────────────────────────────────────── */}
				{storeDescription && ( // ✅ Already using store
					<div className="mx-auto max-w-3xl">
						<p className="text-center text-[15px] leading-8 text-zinc-300">
							{storeDescription}
						</p>
					</div>
				)}

				{/* ─── WEBSITE ─────────────────────────────────────── */}
				{websiteUrl && ( // ✅ Use websiteUrl from store
					<div className="flex w-full justify-center">
						<a
							href={websiteUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="group inline-flex h-11 items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.025] px-5 text-sm font-medium text-zinc-300 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/20 hover:bg-white/[0.05] hover:text-white"
						>
							<Globe className="h-4 w-4 text-emerald-400" />
							<span>{websiteUrl.replace(/^https?:\/\//, "")}</span>
							<ExternalLink className="h-3.5 w-3.5 opacity-50 transition-opacity group-hover:opacity-100" />
						</a>
					</div>
				)}

				{/* ─── MESSAGE SELLER BUTTON ──────────────────────────── */}
				<div className="w-full">
					<Link href={`/m/${username}/chat?user=${seller.id}`}>
						<Button className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm h-11">
							<MessageCircle className="h-4 w-4 mr-2" />
							Message Seller
						</Button>
					</Link>
				</div>

				{/* ─── CATEGORIES ────────────────────────────────────── */}
				{categories.length > 0 && (
					<div className="flex flex-wrap gap-2">
						<span className="text-xs text-zinc-500 font-medium mr-1">
							Categories:
						</span>
						{categories.map((cat) => (
							<Badge
								key={cat}
								className="bg-zinc-900 border-white/5 text-zinc-400 text-[9px]"
							>
								{cat.replace("_", " ")}
							</Badge>
						))}
					</div>
				)}

				{/* ─── LISTINGS GRID ──────────────────────────────────── */}
				<div className="space-y-3 pt-2">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-bold text-white flex items-center gap-2">
							<Grid3x3 className="h-4 w-4 text-emerald-400" />
							All Listings
						</h2>
						<span className="text-xs text-zinc-500">
							{assetsCount} {assetsCount === 1 ? "item" : "items"}
						</span>
					</div>

					{listings.length === 0 ? (
						<div className="text-center py-12 rounded-2xl border border-dashed border-white/10 bg-zinc-950/20">
							<Store className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
							<p className="text-sm font-semibold text-zinc-400">
								No active listings
							</p>
							<p className="text-xs text-zinc-600 mt-1">
								This seller hasn't listed any items yet.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-2 gap-4">
							{listings.map((listing) => (
								<StoreAssetCard
									key={listing.id}
									listing={listing}
									onClick={setSelectedListing}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
