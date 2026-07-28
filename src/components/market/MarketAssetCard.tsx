// components/market/MarketAssetCard.tsx

"use client";

import {
	Clock,
	Eye,
	FileCode,
	Layers,
	Package,
	ShoppingCart,
	Star,
	Users,
} from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ListingWithMetrics } from "@/lib/use-market";

// ============================================================
// TYPES
// ============================================================

interface MarketAssetCardProps {
	listing: ListingWithMetrics;
	onClick?: (id: string) => void;
	onPurchase?: (id: string) => void;
	showActions?: boolean;
	isPurchasing?: boolean;
	currentUserId?: string | null;
	variant?: "browse" | "manage";
}

// ============================================================
// HELPERS
// ============================================================

// components/market/MarketAssetCard.tsx (Key changes only)

// Update the getAssetType function to match category names
const getAssetType = (listing: ListingWithMetrics) => {
	if (listing.socio_metrics) {
		return {
			label: "Socio Asset",
			icon: <Users className="h-3.5 w-3.5" />,
			color: "text-purple-400",
			bg: "bg-purple-500/10 border-purple-500/20",
		};
	}
	if (listing.one_time_tool) {
		return {
			label: "One-Time Product",
			icon: <Package className="h-3.5 w-3.5" />,
			color: "text-emerald-400",
			bg: "bg-emerald-500/10 border-emerald-500/20",
		};
	}
	if (listing.reusable_product) {
		return {
			label: "Reusable Product",
			icon: <Layers className="h-3.5 w-3.5" />,
			color: "text-purple-400",
			bg: "bg-purple-500/10 border-purple-500/20",
		};
	}
	return {
		label: "Digital Asset",
		icon: <FileCode className="h-3.5 w-3.5" />,
		color: "text-zinc-400",
		bg: "bg-zinc-500/10 border-zinc-500/20",
	};
};

// ─── Updated Status Config ──────────────────────────────────
const getStatusConfig = (status: string) => {
	const map: Record<string, { label: string; className: string }> = {
		active: {
			label: "Active",
			className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
		},
		draft: {
			label: "Draft",
			className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
		},
		pending_verification: {
			label: "Pending",
			className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
		},
		locked_escrow: {
			label: "In Escrow",
			className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
		},
		sold_pinned: {
			label: "Sold",
			className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
		},
		suspended: {
			label: "Suspended",
			className: "bg-red-500/20 text-red-400 border-red-500/30",
		},
		deleted: {
			label: "Deleted",
			className: "bg-red-500/20 text-red-400 border-red-500/30 line-through",
		},
	};
	return map[status] || map.draft;
};
// ============================================================
// MAIN COMPONENT
// ============================================================

export function MarketAssetCard({
	listing,
	onClick,
	onPurchase,
	showActions = true,
	isPurchasing = false,
	currentUserId,
	variant = "browse",
}: MarketAssetCardProps) {
	const assetType = getAssetType(listing);
	const statusConfig = getStatusConfig(listing.status);
	const isOwner = currentUserId === listing.seller_id;
	const isActive = listing.status === "active";
	const isSold = listing.status === "sold_pinned";

	// Determine display title and image
	let displayTitle = listing.title;
	let displayImage = listing.display_pic_url;
	let displayPrice = listing.price;

	if (listing.one_time_tool) {
		displayTitle = listing.one_time_tool.product_title || listing.title;
		displayImage =
			listing.one_time_tool.display_cover_url || listing.display_pic_url;
		displayPrice = listing.one_time_tool.sale_price || listing.price;
	} else if (listing.reusable_product) {
		displayTitle = listing.reusable_product.product_title || listing.title;
		displayImage =
			listing.reusable_product.display_cover_url || listing.display_pic_url;
		displayPrice = listing.reusable_product.sale_price || listing.price;
	} else if (listing.socio_metrics) {
		displayTitle = listing.socio_metrics.target_username || listing.title;
		displayImage = listing.display_pic_url;
	}

	const handleClick = () => {
		if (onClick) onClick(listing.id);
	};

	const handlePurchase = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onPurchase) onPurchase(listing.id);
	};

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={handleClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleClick();
				}
			}}
			className="group relative bg-zinc-950/60 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 cursor-pointer"
		>
			{/* ─── Image ────────────────────────────────────────── */}
			<div className="aspect-video bg-zinc-900 relative overflow-hidden">
				{displayImage ? (
					<img
						src={displayImage}
						alt={displayTitle}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-zinc-900/50">
						{assetType.icon}
					</div>
				)}

				{/* ─── Asset Type Badge ──────────────────────────── */}
				<Badge
					variant="outline"
					className={`absolute top-3 left-3 border-white/10 bg-black/70 backdrop-blur-sm text-[9px] font-bold flex items-center gap-1.5 ${assetType.color}`}
				>
					{assetType.icon}
					{assetType.label}
				</Badge>

				{/* ─── Status Badge ──────────────────────────────── */}
				<Badge
					className={`absolute top-3 right-3 text-[9px] font-bold border ${statusConfig.className}`}
				>
					{statusConfig.label}
				</Badge>

				{/* ─── Owner Badge ───────────────────────────────── */}
				{isOwner && variant === "browse" && (
					<Badge className="absolute bottom-3 left-3 bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] font-bold">
						Your Listing
					</Badge>
				)}

				{/* ─── Inactive Overlay ──────────────────────────── */}
				{!isActive && (
					<div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
						<div className="text-center">
							<Clock className="h-6 w-6 text-zinc-500 mx-auto mb-2" />
							<p className="text-xs text-zinc-400 font-bold">Not Available</p>
							<p className="text-[10px] text-zinc-600">
								{listing.status === "sold_pinned"
									? "Already sold"
									: "Listing is inactive"}
							</p>
						</div>
					</div>
				)}

				{/* ─── Hover Overlay ─────────────────────────────── */}
				<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
					<div className="flex items-center gap-2">
						<div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-1.5 border border-white/10">
							<Eye className="h-3.5 w-3.5 text-white" />
							<span className="text-[10px] font-bold text-white">
								View Details
							</span>
						</div>
						{showActions && isActive && !isOwner && onPurchase && (
							<Button
								size="sm"
								onClick={handlePurchase}
								disabled={isPurchasing}
								className="h-7 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] rounded-xl"
							>
								{isPurchasing ? (
									<div className="h-3.5 w-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
								) : (
									<>
										<ShoppingCart className="h-3 w-3 mr-1" />$
										{displayPrice?.toFixed(2) || "0.00"}
									</>
								)}
							</Button>
						)}
						{isOwner && variant === "manage" && (
							<div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-1.5 border border-white/10">
								<span className="text-[10px] font-bold text-white">Manage</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* ─── Content ────────────────────────────────────── */}
			<div className="p-3 md:p-4 space-y-1.5">
				<h4 className="text-sm font-bold text-white truncate">
					{displayTitle}
				</h4>

				<div className="flex items-center justify-between">
					<span className="text-sm font-black text-emerald-400">
						${displayPrice?.toFixed(2) || "0.00"}
					</span>

					{/* ─── Seller Info ─────────────────────────────── */}
					{variant === "browse" && listing.seller_id && (
						<span className="text-[9px] text-zinc-600 truncate max-w-[100px]">
							by {listing.seller_id.slice(0, 8)}
						</span>
					)}

					{/* ─── Date ────────────────────────────────────── */}
					{variant === "manage" && (
						<span className="text-[9px] text-zinc-600">
							{new Date(listing.created_at).toLocaleDateString()}
						</span>
					)}
				</div>

				{/* ─── Stats ────────────────────────────────────── */}
				{listing.socio_metrics && (
					<div className="flex items-center gap-3 pt-1">
						<span className="text-[9px] text-zinc-500 flex items-center gap-1">
							<Users className="h-3 w-3" />
							{listing.socio_metrics.followers_count.toLocaleString()} followers
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
