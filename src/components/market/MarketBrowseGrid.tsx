// components/market/MarketBrowseGrid.tsx

"use client";

import {
	FileCode,
	Filter,
	Layers,
	Loader2,
	Package,
	Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ListingWithMetrics } from "@/lib/use-market";
import { MarketAssetCard } from "./MarketAssetCard";

// ============================================================
// TYPES
// ============================================================

type AssetCategory = "socio_assets" | "one_time_products" | "reusable_products";

interface MarketBrowseGridProps {
	userId: string;
	listings: ListingWithMetrics[];
	loading: boolean;
	searchQuery?: string;
	category?: AssetCategory;
	onListingClick?: (id: string) => void;
	onPurchase?: (id: string) => void;
	purchasingId?: string | null;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function MarketBrowseGrid({
	userId,
	listings,
	loading,
	searchQuery = "",
	category = "reusable_products",
	onListingClick,
	onPurchase,
	purchasingId,
}: MarketBrowseGridProps) {
	// ─── Filter listings ──────────────────────────────────────
	const filteredListings = useMemo(() => {
		let filtered = listings;

		// ✅ Filter by category
		filtered = filtered.filter((listing) => {
			switch (category) {
				case "socio_assets":
					return listing.socio_metrics !== null && listing.status === "active";
				case "one_time_products":
					return listing.one_time_tool !== null && listing.status === "active";
				case "reusable_products":
					return (
						(listing.reusable_product !== null ||
							(listing.one_time_tool === null &&
								listing.socio_metrics === null)) &&
						listing.status === "active"
					);
				default:
					return true;
			}
		});

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();

			filtered = filtered
				.map((listing) => {
					let score = 0;

					const searchableFields = [
						// Business
						{ value: listing.store?.business_name, weight: 120 },
						{ value: listing.store?.about_store, weight: 40 },
						{ value: listing.store?.store_description, weight: 50 },

						// Seller
						{ value: listing.profile?.display_name, weight: 110 },
						{ value: listing.profile?.username, weight: 100 },

						// Listing
						{ value: listing.title, weight: 95 },
						{ value: listing.description, weight: 60 },

						// One-time Product
						{ value: listing.one_time_tool?.product_title, weight: 95 },
						{ value: listing.one_time_tool?.product_description, weight: 60 },
						{ value: listing.one_time_tool?.asset_category, weight: 30 },

						// Reusable Product
						{ value: listing.reusable_product?.product_title, weight: 95 },
						{
							value: listing.reusable_product?.product_description,
							weight: 60,
						},
						{ value: listing.reusable_product?.asset_category, weight: 30 },

						// Social Assets
						{ value: listing.socio_metrics?.target_username, weight: 90 },
						{ value: listing.socio_metrics?.platform_name, weight: 50 },
						{ value: listing.socio_metrics?.account_bio, weight: 35 },
					];

					for (const field of searchableFields) {
						if (!field.value) continue;

						const value = String(field.value).toLowerCase();

						if (value === query) score += field.weight + 80;
						else if (value.startsWith(query)) score += field.weight + 40;
						else if (value.includes(query)) score += field.weight;
					}

					return { listing, score };
				})
				.filter((item) => item.score > 0)
				.sort((a, b) => b.score - a.score)
				.map((item) => item.listing);
		}

		filtered = filtered.filter(
			(l) => l.status !== "deleted" && l.status !== "sold_pinned",
		);

		return filtered;
	}, [listings, category, searchQuery]);

	// ─── Loading ──────────────────────────────────────────────
	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-20 gap-3">
				<Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
				<p className="text-xs text-zinc-500 font-medium">
					Loading marketplace...
				</p>
			</div>
		);
	}

	// ─── Empty ─────────────────────────────────────────────────
	if (filteredListings.length === 0) {
		const categoryLabels: Record<AssetCategory, string> = {
			socio_assets: "No social accounts listed",
			one_time_products: "No one-time products available",
			reusable_products: "No reusable products available",
		};

		return (
			<div className="text-center py-20 rounded-2xl border border-dashed border-white/10 bg-zinc-950/20">
				<div className="w-12 h-11 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
					<Filter className="h-6 w-6 text-zinc-600" />
				</div>
				<p className="text-sm font-semibold text-zinc-400">
					{searchQuery
						? "No results found"
						: categoryLabels[category] || "No listings available"}
				</p>
				<p className="text-xs text-zinc-600 mt-1">
					{searchQuery
						? `Try adjusting your search for "${searchQuery}"`
						: "Check back later for new listings"}
				</p>
			</div>
		);
	}

	// ─── Render ────────────────────────────────────────────────
	return (
		<div className="w-full space-y-4">
			{/* ─── Results Count ──────────────────────────────────── */}
			<div className="mb-2 flex items-center justify-between rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-2 backdrop-blur-xl">
				<p className="text-xs font-medium text-zinc-500">
					<span className="font-semibold text-white">
						{filteredListings.length}
					</span>{" "}
					Assets Available
				</p>
				<Badge className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[10px] font-medium capitalize text-zinc-300">
					{category.replace(/_/g, " ")}
				</Badge>
			</div>

			{/* ─── Grid ───────────────────────────────────────────── */}
			<div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
				{filteredListings.map((listing) => (
					<MarketAssetCard
						key={listing.id}
						listing={listing}
						onClick={onListingClick}
						onPurchase={onPurchase}
						isPurchasing={purchasingId === listing.id}
						currentUserId={userId}
						variant="browse"
						showActions={true}
					/>
				))}
			</div>
		</div>
	);
}
