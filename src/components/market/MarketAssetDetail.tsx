// components/market/MarketAssetDetail.tsx

"use client";

import {
	AlertCircle,
	ArrowLeft,
	Award,
	Calendar,
	CheckCircle2,
	Clock,
	Eye,
	FileCode,
	FileText,
	HardDrive,
	Layers,
	Loader2,
	Lock,
	MessageCircle,
	Package,
	Share2,
	Shield,
	ShoppingCart,
	Store,
	TrendingUp,
	User,
	Users,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { FollowButton } from "@/components/social/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabase/client";
import type { ListingWithMetrics } from "@/lib/use-market";

// ============================================================
// TYPES
// ============================================================

interface SellerProfile {
	id: string;
	display_name: string | null;
	username: string | null;
	avatar_url: string | null;
	email: string | null;
	created_at: string;
	store_avatar_url: string | null;
}

interface MarketAssetDetailProps {
	listingId: string;
	userId: string;
	onBack: () => void;
	onPurchase?: (id: string) => void;
	onMessageSeller?: (sellerId: string, listingId: string) => void;
	isPurchasing?: boolean;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function MarketAssetDetail({
	listingId,
	userId,
	onBack,
	onPurchase,
	onMessageSeller,
	isPurchasing = false,
}: MarketAssetDetailProps) {
	// ─── State ────────────────────────────────────────────────
	const [listing, setListing] = useState<ListingWithMetrics | null>(null);
	const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [totalSales, setTotalSales] = useState(0);
	const [showAssetPreview, setShowAssetPreview] = useState(false);

	// ─── Debug Logger ──────────────────────────────────────────
	const debug = useCallback((...args: any[]) => {}, []);

	// ─── Fetch Listing ────────────────────────────────────────
	const fetchListing = useCallback(async () => {
		if (!listingId) return;

		setLoading(true);
		setError(null);

		try {
			debug("🔍 Fetching listing:", listingId);

			// ─── 1. Fetch main listing ──────────────────────────────
			const { data: listingData, error: listingError } = await supabase
				.from("market_listings")
				.select("*")
				.eq("id", listingId)
				.single();

			if (listingError) {
				debug("❌ Listing fetch error:", listingError);
				throw listingError;
			}

			if (!listingData) {
				debug("❌ No listing found for ID:", listingId);
				throw new Error("Listing not found");
			}

			debug("✅ Listing found:", {
				id: listingData.id,
				title: listingData.title,
				seller_id: listingData.seller_id,
				tab_category: listingData.tab_category,
				product_sale_type: listingData.product_sale_type,
			});

			// ─── 2. Determine seller_id from the asset table ─────────
			let sellerId = listingData.seller_id;
			let oneTimeTool = null;
			let reusableProduct = null;
			let socioMetrics = null;

			// ─── Fetch from the correct asset table ──────────────────
			if (listingData.product_sale_type === "one_time") {
				debug("📦 Fetching one_time_digital_tools...");
				const { data, error } = await supabase
					.from("one_time_digital_tools")
					.select("*")
					.eq("listing_id", listingId)
					.maybeSingle();

				if (error) {
					debug("❌ One-time tool fetch error:", error);
				}

				if (data) {
					oneTimeTool = data;
					sellerId = data.seller_id || listingData.seller_id;
					debug("✅ One-time tool found:", {
						id: data.id,
						product_title: data.product_title,
						seller_id: data.seller_id,
						file_original_name: data.file_original_name,
					});
				} else {
					debug("⚠️ No one-time tool found for listing:", listingId);
				}
			}

			if (
				listingData.product_sale_type === "recurring" ||
				listingData.tab_category === "digital_tool"
			) {
				debug("🔄 Fetching reusable_digital_products...");
				const { data, error } = await supabase
					.from("reusable_digital_products")
					.select("*")
					.eq("listing_id", listingId)
					.maybeSingle();

				if (error) {
					debug("❌ Reusable product fetch error:", error);
				}

				if (data) {
					reusableProduct = data;
					sellerId = data.seller_id || listingData.seller_id;
					debug("✅ Reusable product found:", {
						id: data.id,
						product_title: data.product_title,
						seller_id: data.seller_id,
						asset_category: data.asset_category,
					});
				} else {
					debug("⚠️ No reusable product found for listing:", listingId);
				}
			}

			if (listingData.tab_category === "socio_market") {
				debug("👥 Fetching socio_market_metrics...");
				const { data, error } = await supabase
					.from("socio_market_metrics")
					.select("*")
					.eq("listing_id", listingId)
					.maybeSingle();

				if (error) {
					debug("❌ Socio metrics fetch error:", error);
				}

				if (data) {
					socioMetrics = data;
					sellerId = data.seller_id || listingData.seller_id;
					debug("✅ Socio metrics found:", {
						id: data.id,
						platform_name: data.platform_name,
						target_username: data.target_username,
						seller_id: data.seller_id,
					});
				} else {
					debug("⚠️ No socio metrics found for listing:", listingId);
				}
			}

			debug("👤 Final seller_id from asset table:", sellerId);

			// ─── 3. Fetch seller profile ─────────────────────────────
			debug("🔍 Fetching seller profile for ID:", sellerId);

			// ─── 3. Fetch seller profile ─────────────────────────────
			debug("🔍 Fetching seller profile for ID:", sellerId);

			const { data: sellerData, error: sellerError } = await supabase
				.from("profiles")
				.select("id, display_name, username, avatar_url, email, created_at")
				.eq("id", sellerId)
				.maybeSingle();

			if (sellerError) {
				debug("❌ Seller fetch error:", sellerError);
			}

			if (sellerData) {
				debug("✅ Seller profile found:", {
					id: sellerData.id,
					username: sellerData.username,
					display_name: sellerData.display_name,
				});
				setSellerProfile(sellerData as SellerProfile);
			} else {
				debug("⚠️ No seller profile found for ID:", sellerId);
				// ✅ FALLBACK: Use the sellerId as the username
				setSellerProfile({
					id: sellerId,
					display_name: "Unknown Seller",
					username: sellerId, // ← Use the ID as username fallback
					avatar_url: null,
					store_avatar_url: null,
					email: null,
					created_at: new Date().toISOString(),
				});
			}

			// ─── 4. Fetch total sales ──────────────────────────────
			debug("📊 Fetching total sales...");
			const { count } = await supabase
				.from("global_market_orders")
				.select("id", { count: "exact", head: true })
				.eq("listing_id", listingId);

			setTotalSales(count || 0);
			debug("📊 Total sales:", count || 0);

			// ─── 5. Enrich listing ──────────────────────────────────
			const enriched: ListingWithMetrics = {
				...listingData,
				one_time_tool: oneTimeTool,
				reusable_product: reusableProduct,
				socio_metrics: socioMetrics,
			};

			setListing(enriched);

			debug("✅ Listing enrichment complete");
			debug("📝 Description source:", {
				listing_description: listingData.description,
				one_time_desc: oneTimeTool?.product_description,
				reusable_desc: reusableProduct?.product_description,
				socio_bio: socioMetrics?.account_bio,
			});
		} catch (err: any) {
			debug("❌ Fatal error:", err);
			setError(err.message || "Failed to load listing");
		} finally {
			setLoading(false);
			debug("🏁 Fetch complete, loading:", false);
		}
	}, [listingId]);

	useEffect(() => {
		fetchListing();
	}, [fetchListing]);

	// ─── Format helpers ──────────────────────────────────────
	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return bytes + " B";
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
		if (bytes < 1024 * 1024 * 1024)
			return (bytes / 1024 / 1024).toFixed(1) + " MB";
		return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";
	};

	// ─── Loading ──────────────────────────────────────────────
	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-20 gap-3">
				<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
				<p className="text-xs text-zinc-500 font-medium">
					Loading asset details...
				</p>
			</div>
		);
	}

	// ─── Error ─────────────────────────────────────────────────
	if (error || !listing) {
		return (
			<div className="text-center py-20 rounded-2xl border border-red-500/20 bg-red-500/5">
				<AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
				<p className="text-sm font-semibold text-red-400">
					{error || "Listing not found"}
				</p>
				<Button
					onClick={onBack}
					className="mt-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Go Back
				</Button>
			</div>
		);
	}

	// ─── Determine asset type ─────────────────────────────────
	let assetIcon = <Package className="h-6 w-6" />;
	let assetTypeLabel = "Digital Asset";

	if (listing.socio_metrics) {
		assetIcon = <Users className="h-6 w-6 text-purple-400" />;
		assetTypeLabel = "Social Account";
	} else if (listing.one_time_tool) {
		assetIcon = <Package className="h-6 w-6 text-emerald-400" />;
		assetTypeLabel = "One-Time Product";
	} else if (listing.reusable_product) {
		assetIcon = <Layers className="h-6 w-6 text-purple-400" />;
		assetTypeLabel = "Reusable Tool";
	}

	// ─── Get display data ────────────────────────────────────
	const displayTitle =
		listing.one_time_tool?.product_title ||
		listing.reusable_product?.product_title ||
		listing.socio_metrics?.target_username ||
		listing.title ||
		"Untitled Asset";

	const displayDescription =
		listing.one_time_tool?.product_description ||
		listing.reusable_product?.product_description ||
		listing.socio_metrics?.account_bio ||
		listing.description ||
		"No description provided.";

	const displayImage =
		listing.one_time_tool?.display_cover_url ||
		listing.reusable_product?.display_cover_url ||
		listing.display_pic_url;

	const displayPrice =
		listing.one_time_tool?.sale_price ||
		listing.reusable_product?.sale_price ||
		listing.price;

	// ─── Buyer-only seller info ─────────────────────────────
	const sellerName =
		sellerProfile?.display_name || sellerProfile?.username || "Unknown Seller";

	const sellerUsername = sellerProfile?.username || listing.seller_id;
	const storeAvatar =
		sellerProfile?.store_avatar_url || sellerProfile?.avatar_url;

	const isActive = listing.status === "active";
	const isSold = listing.status === "sold_pinned";

	// ─── Render ────────────────────────────────────────────────
	return (
		<div className="w-full max-w-6xl mx-auto pb-20">
			{/* Back Button */}
			<Button
				variant="ghost"
				onClick={onBack}
				className="h-9 px-4 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl mb-8 flex items-center gap-2"
			>
				<ArrowLeft className="h-4 w-4" />
				Back to Browse
			</Button>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* MAIN CONTENT - Left Side */}
				<div className="lg:col-span-8 space-y-8">
					{/* HERO IMAGE */}
					<div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
						<div className="aspect-[16/9] relative">
							{displayImage ? (
								<img
									src={displayImage}
									alt={displayTitle}
									className="absolute inset-0 h-full w-full object-cover"
								/>
							) : (
								<div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
									{assetIcon}
								</div>
							)}

							<div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_60%)]" />

							{/* Top Badges */}
							<div className="absolute left-6 top-6 flex flex-wrap gap-3">
								<Badge className="rounded-full bg-black/70 border border-white/10 backdrop-blur-xl px-4 py-1.5 text-sm font-semibold flex items-center gap-2">
									{assetIcon}
									<span>{assetTypeLabel}</span>
								</Badge>

								<Badge
									className={`rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur-xl ${
										isActive
											? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
											: isSold
												? "border-amber-500/30 bg-amber-500/10 text-amber-300"
												: "border-red-500/30 bg-red-500/10 text-red-300"
									}`}
								>
									{isActive
										? "ACTIVE"
										: isSold
											? "SOLD"
											: listing.status.toUpperCase()}
								</Badge>
							</div>

							{isActive && !isSold && (
								<div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-5 py-2">
									<Zap className="h-4 w-4 text-emerald-400" />
									<span className="text-sm font-semibold text-emerald-300">
										Instant Delivery
									</span>
								</div>
							)}
						</div>
					</div>

					{/* TITLE + META + DESCRIPTION */}
					<div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 md:p-10">
						<h1 className="text-4xl font-black text-white tracking-tighter mb-4">
							{displayTitle}
						</h1>

						<div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-zinc-400 mb-8">
							<div className="flex items-center gap-2">
								<User className="h-4 w-4" />
								by <span className="text-white font-medium">{sellerName}</span>
							</div>
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								{formatDate(listing.created_at)}
							</div>
							{totalSales > 0 && (
								<div className="flex items-center gap-2 text-emerald-400 font-medium">
									<TrendingUp className="h-4 w-4" />
									{totalSales} sales
								</div>
							)}
						</div>

						<div className="prose prose-zinc prose-invert max-w-none">
							<p className="text-zinc-300 leading-relaxed text-[15.5px] whitespace-pre-wrap">
								{displayDescription}
							</p>
						</div>

						{/* Secure Guarantee */}
						<div className="mt-10 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
							<div className="flex gap-4">
								<Shield className="h-6 w-6 text-emerald-400 mt-0.5 flex-shrink-0" />
								<div>
									<p className="font-semibold text-emerald-300">
										Secure Purchase Guarantee
									</p>
									<p className="text-sm text-zinc-400 mt-1.5">
										Your purchase of{" "}
										<span className="text-white">"{displayTitle}"</span> is
										fully protected. Funds are held in escrow until you confirm
										receipt.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* ASSET CONTENT CARD */}
					<div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 md:p-10">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-xl font-semibold text-white flex items-center gap-3">
								<Lock className="h-5 w-5" />
								Asset Content
							</h3>
							{isActive && !isSold && (
								<Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
									🔒 Locked until purchase
								</Badge>
							)}
						</div>

						<div className="relative rounded-2xl overflow-hidden border border-white/5 bg-zinc-900/70 min-h-[180px]">
							<div className="p-6">
								{listing.one_time_tool && (
									<div className="flex items-center gap-5 p-5 rounded-2xl bg-zinc-800/40 border border-white/5">
										<FileText className="h-9 w-9 text-emerald-400 flex-shrink-0" />
										<div className="flex-1 min-w-0">
											<p className="font-medium text-white text-lg">
												{listing.one_time_tool.file_original_name ||
													"Product file"}
											</p>
											<p className="text-sm text-zinc-500">
												{listing.one_time_tool.file_size_bytes
													? formatFileSize(
															listing.one_time_tool.file_size_bytes,
														)
													: "Unknown size"}{" "}
												•{" "}
												{listing.one_time_tool.file_mime_type ||
													"Unknown format"}
											</p>
										</div>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => setShowAssetPreview(!showAssetPreview)}
										>
											<Eye className="h-5 w-5" />
										</Button>
									</div>
								)}

								{listing.reusable_product && (
									<div className="flex items-center gap-5 p-5 rounded-2xl bg-zinc-800/40 border border-white/5">
										<Layers className="h-9 w-9 text-purple-400 flex-shrink-0" />
										<div className="flex-1">
											<p className="font-medium text-white text-lg">
												{listing.reusable_product.product_title}
											</p>
											<p className="text-sm text-zinc-500">
												Reusable Digital Tool
											</p>
										</div>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => setShowAssetPreview(!showAssetPreview)}
										>
											<Eye className="h-5 w-5" />
										</Button>
									</div>
								)}

								{listing.socio_metrics && (
									<div className="flex items-center gap-5 p-5 rounded-2xl bg-zinc-800/40 border border-white/5">
										<Users className="h-9 w-9 text-purple-400 flex-shrink-0" />
										<div className="flex-1">
											<p className="font-medium text-white text-lg">
												@{listing.socio_metrics.target_username}
											</p>
											<p className="text-sm text-zinc-500">
												{listing.socio_metrics.platform_name} •{" "}
												{listing.socio_metrics.followers_count.toLocaleString()}{" "}
												followers
											</p>
										</div>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => setShowAssetPreview(!showAssetPreview)}
										>
											<Eye className="h-5 w-5" />
										</Button>
									</div>
								)}
							</div>

							{/* Overlays */}
							{!showAssetPreview && isActive && !isSold && (
								<div className="absolute inset-0 bg-black/75 backdrop-blur flex flex-col items-center justify-center gap-4">
									<Lock className="h-12 w-12 text-zinc-500" />
									<p className="text-white font-medium">
										Purchase to unlock full content
									</p>
									<Button
										variant="outline"
										onClick={() => setShowAssetPreview(true)}
									>
										Preview Asset
									</Button>
								</div>
							)}

							{showAssetPreview && isActive && !isSold && (
								<div className="absolute inset-0 bg-black/70 backdrop-blur flex flex-col items-center justify-center gap-4">
									<Eye className="h-12 w-12 text-emerald-400" />
									<p className="text-white font-medium">Preview Mode</p>
									<Button
										variant="ghost"
										onClick={() => setShowAssetPreview(false)}
									>
										Close Preview
									</Button>
								</div>
							)}

							{isSold && (
								<div className="absolute inset-0 bg-black/75 backdrop-blur flex flex-col items-center justify-center gap-4">
									<Clock className="h-12 w-12 text-amber-400" />
									<p className="text-amber-400 font-medium text-lg">
										This asset has been sold
									</p>
								</div>
							)}
						</div>
					</div>

					{/* DETAILS GRID */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* File Details */}
						{listing.one_time_tool && (
							<div className="bg-zinc-950 border border-white/10 rounded-3xl p-8">
								<h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
									<HardDrive className="h-4 w-4" /> FILE DETAILS
								</h4>
								<div className="space-y-5">
									<div className="flex justify-between pb-4 border-b border-white/5">
										<span className="text-zinc-500">File Name</span>
										<span className="text-white font-medium text-right truncate max-w-[220px]">
											{listing.one_time_tool.file_original_name ||
												"Not specified"}
										</span>
									</div>
									<div className="flex justify-between pb-4 border-b border-white/5">
										<span className="text-zinc-500">File Size</span>
										<span className="text-white font-medium">
											{listing.one_time_tool.file_size_bytes
												? formatFileSize(listing.one_time_tool.file_size_bytes)
												: "Unknown"}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-zinc-500">Format</span>
										<span className="text-white font-medium">
											{listing.one_time_tool.file_mime_type || "Unknown"}
										</span>
									</div>
								</div>
							</div>
						)}

						{/* Social Metrics */}
						{listing.socio_metrics && (
							<div className="bg-zinc-950 border border-white/10 rounded-3xl p-8">
								<h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
									<TrendingUp className="h-4 w-4" /> SOCIAL METRICS
								</h4>
								<div className="grid grid-cols-2 gap-6">
									<div>
										<p className="text-xs text-zinc-500">Platform</p>
										<p className="text-lg font-bold text-white mt-1">
											{listing.socio_metrics.platform_name}
										</p>
									</div>
									<div>
										<p className="text-xs text-zinc-500">Username</p>
										<p className="text-lg font-bold text-white mt-1">
											@{listing.socio_metrics.target_username}
										</p>
									</div>
									<div>
										<p className="text-xs text-zinc-500">Followers</p>
										<p className="text-lg font-bold text-emerald-400 mt-1">
											{listing.socio_metrics.followers_count.toLocaleString()}
										</p>
									</div>
									<div>
										<p className="text-xs text-zinc-500">Following</p>
										<p className="text-lg font-bold text-white mt-1">
											{listing.socio_metrics.following_count?.toLocaleString() ||
												"N/A"}
										</p>
									</div>
								</div>
								{listing.socio_metrics.account_bio && (
									<div className="mt-8 pt-6 border-t border-white/5">
										<p className="text-xs text-zinc-500 mb-2">Account Bio</p>
										<p className="text-sm text-zinc-300 leading-relaxed">
											{listing.socio_metrics.account_bio}
										</p>
									</div>
								)}
							</div>
						)}
					</div>

					{/* WHAT'S INCLUDED */}
					<div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 md:p-10">
						<h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
							<FileText className="h-5 w-5" /> What's Included
						</h3>

						<div className="text-zinc-300 leading-relaxed">
							{displayDescription ? (
								<>
									<p className="text-[15.5px] text-center w-full">
										{displayDescription.split(". ")[0]}.
									</p>

									{displayDescription.split(". ").length > 1 && (
										<p className="text-sm text-zinc-500 mt-4 italic">
											Continue reading below for full details...
										</p>
									)}
								</>
							) : (
								<p className="text-zinc-500 text-center">
									No details available.
								</p>
							)}
						</div>

						{/* Optional: Keep a small real benefits list */}
						<div className="mt-8 pt-6 border-t border-white/10">
							<p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
								Always Included
							</p>
							<ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-zinc-400">
								<li className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-emerald-400" /> Secure
									checkout
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle2 className="h-4 w-4 text-emerald-400" /> Escrow
									protection
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* SIDEBAR - Right Side */}
				<div className="lg:col-span-4 space-y-6">
					{/* PRICE & BUY CARD */}
					<div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 sticky top-8">
						<p className="uppercase text-xs tracking-widest text-zinc-500 font-bold">
							Price
						</p>
						<p className="text-5xl font-black text-emerald-400 mt-2 mb-6">
							${displayPrice?.toFixed(2) || "0.00"}
						</p>

						{isActive && !isSold && onPurchase && (
							<Button
								onClick={() => {
									debug("🛒 Purchase button clicked for listing:", listingId);
									onPurchase(listing.id);
								}}
								disabled={isPurchasing}
								className="w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:brightness-110 text-black font-bold text-base h-14 rounded-2xl shadow-lg shadow-emerald-500/30"
							>
								{isPurchasing ? (
									<Loader2 className="h-5 w-5 animate-spin mr-2" />
								) : (
									<ShoppingCart className="h-5 w-5 mr-2" />
								)}
								Purchase Now
							</Button>
						)}

						{(!isActive || isSold) && (
							<div className="text-center py-6 text-zinc-500 font-medium">
								{isSold
									? "This asset has been sold"
									: "This listing is not available"}
							</div>
						)}

						<div className="flex justify-center gap-6 mt-8 text-xs text-zinc-500">
							<div className="flex items-center gap-1.5">
								<Shield className="h-4 w-4 text-emerald-400" /> Secure
							</div>
							<div className="flex items-center gap-1.5">
								<Award className="h-4 w-4 text-emerald-400" /> Verified
							</div>
							<div className="flex items-center gap-1.5">
								<Clock className="h-4 w-4 text-emerald-400" /> Instant
							</div>
						</div>
					</div>

					{/* SELLER CARD */}
					<div className="bg-zinc-950 border border-white/10 rounded-3xl p-8">
						<h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-5 flex items-center gap-2">
							<User className="h-4 w-4" /> SELLER
						</h4>

						<div className="flex items-center gap-4 mb-6">
							<Avatar className="h-14 w-14 rounded-2xl">
								{storeAvatar ? (
									<AvatarImage src={storeAvatar} />
								) : (
									<AvatarFallback className="bg-zinc-800 text-2xl text-zinc-400">
										{sellerName?.[0] || "U"}
									</AvatarFallback>
								)}
							</Avatar>
							<div>
								<p className="font-semibold text-lg text-white">{sellerName}</p>
								<p className="text-xs text-zinc-500">
									Member since{" "}
									{sellerProfile?.created_at
										? formatDate(sellerProfile.created_at)
										: "N/A"}
								</p>
							</div>
						</div>

						<Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-6">
							Verified Seller
						</Badge>

						<div className="space-y-3">
							<FollowButton
								targetUserId={listing.seller_id}
								currentUserId={userId}
								size="sm"
								variant="outline"
								showCount={true}
							/>

							<Button
								variant="outline"
								onClick={() => {
									debug(
										"💬 Message Seller clicked for seller:",
										listing.seller_id,
									);
									if (onMessageSeller) {
										onMessageSeller(listing.seller_id, listingId);
									}
								}}
								className="w-full border-white/10 hover:bg-white/5 h-11"
							>
								<MessageCircle className="h-4 w-4 mr-2" />
								Message Seller
							</Button>

							<Link href={`/m/${sellerUsername}/store`}>
								<Button
									variant="outline"
									className="w-full border-white/10 hover:bg-white/5 h-11"
								>
									<Store className="h-4 w-4 mr-2" />
									Visit Seller Store
								</Button>
							</Link>
						</div>
					</div>

					{/* META CARD */}
					<div className="bg-zinc-950 border border-white/10 rounded-3xl p-8 text-sm">
						<div className="space-y-4">
							<div className="flex justify-between">
								<span className="text-zinc-500">Category</span>
								<span className="text-white capitalize font-medium">
									{listing.tab_category?.replace("_", " ") || "General"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-zinc-500">Type</span>
								<span className="text-white capitalize font-medium">
									{listing.product_sale_type?.replace("_", " ") || "Standard"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-zinc-500">Posted</span>
								<span className="text-white">
									{formatDate(listing.created_at)}
								</span>
							</div>
							{listing.updated_at &&
								listing.updated_at !== listing.created_at && (
									<div className="flex justify-between">
										<span className="text-zinc-500">Last Updated</span>
										<span className="text-white">
											{formatDate(listing.updated_at)}
										</span>
									</div>
								)}
							<div className="flex justify-between pt-2 border-t border-white/5">
								<span className="text-zinc-500">Listing ID</span>
								<span className="font-mono text-zinc-500 text-xs">
									{listingId.slice(0, 8)}...
								</span>
							</div>
						</div>
					</div>

					{/* SHARE */}
					<Button
						variant="ghost"
						className="w-full border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 h-11 rounded-2xl"
					>
						<Share2 className="h-4 w-4 mr-2" />
						Share this asset
					</Button>
				</div>
			</div>
		</div>
	);
}
