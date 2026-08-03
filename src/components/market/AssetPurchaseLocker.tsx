// components/market/AssetPurchaseLocker.tsx

"use client";

import {
	AlertCircle,
	Calendar,
	CheckCircle2,
	Code,
	Copy,
	DollarSign,
	Download,
	ExternalLink,
	Eye,
	EyeOff,
	FileText,
	HardDrive,
	KeyRound,
	Layers,
	Link as LinkIcon,
	Loader2,
	Lock,
	Mail,
	MessageCircle,
	Package,
	Shield,
	ShoppingBag,
	Star,
	User,
	Users,
	X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabase/client";
import type { GlobalMarketOrder, ListingWithMetrics } from "@/lib/types";
import { DeliveryConfirmationModal } from "./DeliveryConfirmationModal";
import { ReviewModal } from "./ReviewModal";

// ============================================================
// TYPES
// ============================================================

interface OneTimeTool {
	id: string;
	listing_id: string;
	seller_id: string;
	product_title: string;
	product_description: string | null;
	sale_price: number;
	display_cover_url: string | null;
	storage_vault_path: string;
	file_original_name: string;
	file_size_bytes: number;
	file_mime_type: string;
	asset_category: string | null;
	asset_type: string | null;
	asset_content: any | null;
}

interface ReusableProduct {
	id: string;
	listing_id: string;
	seller_id: string;
	asset_category: string;
	product_title: string;
	product_description: string | null;
	usage_guidelines_diy: string | null;
	risk_cautions: string | null;
	sale_price: number;
	display_cover_url: string | null;
	fulfillment_payload: Record<string, unknown>;
}

interface SocioMetrics {
	id: string;
	listing_id: string;
	seller_id: string;
	platform_name: string;
	target_username: string;
	followers_count: number;
	account_bio: string | null;
}

interface EnrichedOrder extends GlobalMarketOrder {
	asset_type: "one_time" | "reusable" | "socio";
	asset_data: OneTimeTool | ReusableProduct | SocioMetrics | null;
}

interface AssetPurchaseLockerProps {
	orders: GlobalMarketOrder[];
	listings: ListingWithMetrics[];
	currentUserId: string | null;
	onRefresh: () => void;
}

// ============================================================
// SUB-COMPONENT: Asset Content Renderer
// ============================================================

interface AssetContentRendererProps {
	assetType: "one_time" | "reusable" | "socio";
	assetData: any;
	listing: any;
	onDownload?: (url: string, fileName: string) => void;
}

function AssetContentRenderer({
	assetType,
	assetData,
	listing,
	onDownload,
}: AssetContentRendererProps) {
	const [showCredentials, setShowCredentials] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleCopy = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	if (!assetData) {
		return (
			<div className="text-center py-8 text-zinc-500">
				<AlertCircle className="h-8 w-8 mx-auto mb-2" />
				<p className="text-sm">No asset data available</p>
			</div>
		);
	}

	// ─── ONE-TIME PRODUCT ──────────────────────────────────────
	if (assetType === "one_time") {
		const tool = assetData as OneTimeTool;

		return (
			<div className="space-y-4">
				{/* File Info */}
				<div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-white/5">
					<FileText className="h-5 w-5 text-emerald-400" />
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-white truncate">
							{tool.file_original_name || "Product file"}
						</p>
						<p className="text-xs text-zinc-500">
							{tool.file_size_bytes
								? `${(tool.file_size_bytes / 1024 / 1024).toFixed(2)} MB`
								: "Unknown size"}{" "}
							· {tool.file_mime_type || "Unknown format"}
						</p>
					</div>
					<Button
						size="sm"
						onClick={() =>
							onDownload?.(
								tool.storage_vault_path,
								tool.file_original_name || "download",
							)
						}
						className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-8 px-3 rounded-xl"
					>
						<Download className="h-3.5 w-3.5 mr-1.5" />
						Download
					</Button>
				</div>

				{/* Asset Content (if not file) */}
				{tool.asset_type !== "file" && tool.asset_content && (
					<div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
						<p className="text-xs text-zinc-500 font-medium mb-2">
							Asset Content
						</p>
						{tool.asset_type === "link" ? (
							<a
								href={tool.asset_content}
								target="_blank"
								rel="noopener noreferrer"
								className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
							>
								<ExternalLink className="h-3.5 w-3.5" />
								{tool.asset_content}
							</a>
						) : tool.asset_type === "code" ? (
							<pre className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
								<code>{tool.asset_content}</code>
							</pre>
						) : (
							<p className="text-sm text-zinc-300">{tool.asset_content}</p>
						)}
					</div>
				)}

				{/* Category */}
				{tool.asset_category && (
					<div className="flex items-center gap-2 text-xs">
						<span className="text-zinc-500">Category:</span>
						<Badge className="bg-zinc-800 text-zinc-300 border-white/5">
							{tool.asset_category.replace(/_/g, " ")}
						</Badge>
					</div>
				)}
			</div>
		);
	}

	// ─── REUSABLE PRODUCT ──────────────────────────────────────
	if (assetType === "reusable") {
		const product = assetData as ReusableProduct;

		return (
			<div className="space-y-4">
				{/* DIY Manual */}
				{product.usage_guidelines_diy && (
					<div className="space-y-1.5">
						<p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
							<FileText className="h-3.5 w-3.5 inline mr-1.5" />
							Setup Instructions
						</p>
						<p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
							{product.usage_guidelines_diy}
						</p>
					</div>
				)}

				{/* Risk Cautions */}
				{product.risk_cautions && (
					<div className="space-y-1.5">
						<p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
							<AlertCircle className="h-3.5 w-3.5 inline mr-1.5" />
							Risk & Cautions
						</p>
						<p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
							{product.risk_cautions}
						</p>
					</div>
				)}

				{/* Fulfillment Payload */}
				{product.fulfillment_payload && (
					<div className="space-y-1.5">
						<p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
							<Code className="h-3.5 w-3.5 inline mr-1.5" />
							Fulfillment Details
						</p>
						<pre className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-lg overflow-x-auto">
							<code>
								{JSON.stringify(product.fulfillment_payload, null, 2)}
							</code>
						</pre>
					</div>
				)}

				{/* Category */}
				{product.asset_category && (
					<div className="flex items-center gap-2 text-xs">
						<span className="text-zinc-500">Category:</span>
						<Badge className="bg-zinc-800 text-zinc-300 border-white/5">
							{product.asset_category.replace(/_/g, " ")}
						</Badge>
					</div>
				)}
			</div>
		);
	}

	// ─── SOCIAL ACCOUNT ────────────────────────────────────────
	if (assetType === "socio") {
		const socio = assetData as SocioMetrics;
		// Get credentials from the listing's encrypted_asset_payload
		let credentials = null;
		try {
			const payload = listing?.encrypted_asset_payload
				? JSON.parse(listing.encrypted_asset_payload)
				: null;
			if (payload) {
				credentials = {
					username: payload.username || socio.target_username,
					password: payload.password || "********",
				};
			}
		} catch {
			// Silent fail
		}

		return (
			<div className="space-y-4">
				{/* Account Info */}
				<div className="grid grid-cols-2 gap-3">
					<div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
						<p className="text-[9px] text-zinc-500 uppercase tracking-wider">
							Platform
						</p>
						<p className="text-sm font-bold text-white">
							{socio.platform_name}
						</p>
					</div>
					<div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
						<p className="text-[9px] text-zinc-500 uppercase tracking-wider">
							Followers
						</p>
						<p className="text-sm font-bold text-emerald-400">
							{socio.followers_count.toLocaleString()}
						</p>
					</div>
				</div>

				{/* Credentials */}
				{credentials && (
					<div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
						<div className="flex items-center justify-between mb-2">
							<p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
								<KeyRound className="h-3.5 w-3.5 inline mr-1.5" />
								Credentials
							</p>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => setShowCredentials(!showCredentials)}
								className="h-7 px-2 text-xs text-zinc-400 hover:text-white"
							>
								{showCredentials ? (
									<EyeOff className="h-3.5 w-3.5" />
								) : (
									<Eye className="h-3.5 w-3.5" />
								)}
							</Button>
						</div>
						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<span className="text-xs text-zinc-500">Username</span>
								<div className="flex items-center gap-2">
									<span className="text-sm font-mono text-white">
										{showCredentials ? credentials.username : "••••••••"}
									</span>
									{showCredentials && (
										<Button
											size="sm"
											variant="ghost"
											onClick={() => handleCopy(credentials.username)}
											className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
										>
											<Copy className="h-3 w-3" />
										</Button>
									)}
								</div>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-xs text-zinc-500">Password</span>
								<div className="flex items-center gap-2">
									<span className="text-sm font-mono text-white">
										{showCredentials ? credentials.password : "••••••••"}
									</span>
									{showCredentials && (
										<Button
											size="sm"
											variant="ghost"
											onClick={() => handleCopy(credentials.password)}
											className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
										>
											<Copy className="h-3 w-3" />
										</Button>
									)}
								</div>
							</div>
						</div>
						{copied && (
							<p className="text-[10px] text-emerald-400 mt-1">✓ Copied!</p>
						)}
					</div>
				)}

				{/* Bio */}
				{socio.account_bio && (
					<div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
						<p className="text-[9px] text-zinc-500 uppercase tracking-wider">
							Bio
						</p>
						<p className="text-sm text-zinc-300">{socio.account_bio}</p>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="text-center py-8 text-zinc-500">
			<p className="text-sm">Unknown asset type</p>
		</div>
	);
}

// ============================================================
// SUB-COMPONENT: Asset Detail Modal
// ============================================================

interface AssetDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	order: EnrichedOrder;
	listing: any;
	assetData: any;
	assetType: "one_time" | "reusable" | "socio";
	onConfirm: () => Promise<void>;
	onReview: (orderId: string) => void;
	onDownload: (url: string, fileName: string) => void;
	isConfirming: boolean;
}

function AssetDetailModal({
	isOpen,
	onClose,
	order,
	listing,
	assetData,
	assetType,
	onConfirm,
	onReview,
	onDownload,
	isConfirming,
}: AssetDetailModalProps) {
	const [isConfirmingLocal, setIsConfirmingLocal] = useState(false);

	if (!isOpen) return null;

	// ✅ Check if listing exists
	const isListingDeleted = !listing || listing === null;

	const isCompleted = order.status === "completed";
	const isPending =
		order.status === "pending_verification" || order.status === "delivered";

	const handleConfirm = async () => {
		setIsConfirmingLocal(true);
		await onConfirm();
		setIsConfirmingLocal(false);
	};

	const getAssetIcon = () => {
		if (assetType === "socio")
			return <Users className="h-5 w-5 text-purple-400" />;
		if (assetType === "one_time")
			return <Package className="h-5 w-5 text-emerald-400" />;
		return <Layers className="h-5 w-5 text-sky-400" />;
	};

	const getAssetTypeLabel = () => {
		if (assetType === "socio") return "Social Account";
		if (assetType === "one_time") return "One-Time Product";
		return "Reusable Tool";
	};

	// ✅ Display title with fallback
	const displayTitle = listing?.title || "Asset (No Longer Available)";
	const displayImage = listing?.display_pic_url || null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-200">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-md"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl">
				{/* Header */}
				<div className="sticky top-0 bg-zinc-950/95 backdrop-blur-md border-b border-white/10 p-5 flex items-center justify-between rounded-t-3xl z-10">
					<div className="flex items-center gap-3 min-w-0">
						<div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center flex-shrink-0">
							{getAssetIcon()}
						</div>
						<div className="min-w-0">
							<h3 className="text-base font-bold text-white truncate">
								{displayTitle}
							</h3>
							<div className="flex items-center gap-2">
								<span className="text-[10px] text-zinc-500">
									{getAssetTypeLabel()}
								</span>
								{isListingDeleted && (
									<Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px]">
										Asset Removed
									</Badge>
								)}
								{isCompleted ? (
									<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px]">
										✓ Confirmed
									</Badge>
								) : isPending ? (
									<Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px]">
										⏳ Pending
									</Badge>
								) : null}
							</div>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-5">
					{/* Asset Image */}
					{listing?.display_pic_url && (
						<div className="aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/5">
							<img
								src={listing.display_pic_url}
								alt={listing.title}
								className="w-full h-full object-cover"
							/>
						</div>
					)}

					{/* Description / DIY / Risk Cautions */}
					{assetType === "reusable" && assetData && (
						<div className="space-y-3">
							{assetData.product_description && (
								<div>
									<p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
										Description
									</p>
									<p className="text-sm text-zinc-300 leading-relaxed">
										{assetData.product_description}
									</p>
								</div>
							)}
						</div>
					)}

					{assetType === "one_time" && assetData && (
						<div>
							{assetData.product_description && (
								<div>
									<p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
										Description
									</p>
									<p className="text-sm text-zinc-300 leading-relaxed">
										{assetData.product_description}
									</p>
								</div>
							)}
						</div>
					)}

					{assetType === "socio" && assetData && (
						<div>
							{assetData.account_bio && (
								<div>
									<p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
										Account Bio
									</p>
									<p className="text-sm text-zinc-300 leading-relaxed">
										{assetData.account_bio}
									</p>
								</div>
							)}
						</div>
					)}

					{/* Asset Content */}
					<div className="border-t border-white/5 pt-4">
						<p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
							<Lock className="h-3.5 w-3.5 inline mr-1.5" />
							Asset Content
						</p>
						<AssetContentRenderer
							assetType={assetType}
							assetData={assetData}
							listing={listing}
							onDownload={onDownload}
						/>
					</div>

					{/* Confirm / Actions */}
					<div className="border-t border-white/5 pt-4 space-y-3">
						{isPending && (
							<Button
								onClick={handleConfirm}
								disabled={isConfirmingLocal || isConfirming}
								className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold rounded-xl h-11"
							>
								{isConfirmingLocal || isConfirming ? (
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
								) : (
									<CheckCircle2 className="h-4 w-4 mr-2" />
								)}
								Confirm Receipt
							</Button>
						)}

						{isCompleted && (
							<div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
								<CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
								<div>
									<p className="text-sm font-bold text-emerald-400">
										Confirmed
									</p>
									<p className="text-xs text-zinc-400">
										You confirmed receipt on{" "}
										{new Date(
											order.confirmed_at || order.purchased_at,
										).toLocaleDateString()}
									</p>
								</div>
							</div>
						)}

						{isCompleted && (
							<Button
								onClick={() => onReview(order.id)}
								variant="outline"
								className="w-full border-amber-500/20 text-amber-400 hover:bg-amber-500/10 rounded-xl h-10"
							>
								<Star className="h-4 w-4 mr-2" />
								Leave a Review
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

// ============================================================
// SUB-COMPONENT: Locker Card
// ============================================================

interface LockerCardProps {
	order: EnrichedOrder;
	listing: any;
	assetType: "one_time" | "reusable" | "socio";
	onClick: () => void;
}

function LockerCard({ order, listing, assetType, onClick }: LockerCardProps) {
	// ✅ Check if listing exists (may be null if deleted)
	const isListingDeleted = !listing || listing === null;

	const isCompleted = order.status === "completed";
	const isPending =
		order.status === "pending_verification" ||
		order.status === "delivered" ||
		order.status === "pending";

	const getStatusBadge = () => {
		if (isCompleted) {
			return (
				<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
					✓ Completed
				</Badge>
			);
		}
		if (isPending) {
			return (
				<Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
					⏳ Pending
				</Badge>
			);
		}
		return (
			<Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">
				{order.status}
			</Badge>
		);
	};

	const getAssetIcon = () => {
		if (assetType === "socio")
			return <Users className="h-4 w-4 text-purple-400" />;
		if (assetType === "one_time")
			return <Package className="h-4 w-4 text-emerald-400" />;
		return <Layers className="h-4 w-4 text-sky-400" />;
	};

	// ✅ Display title with fallback
	const displayTitle = listing?.title || "Asset (No Longer Available)";
	const displayImage = listing?.display_pic_url || null;

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
			className="group bg-zinc-950/60 border border-white/5 rounded-2xl p-4 hover:border-white/15 transition-all duration-300 cursor-pointer"
		>
			<div className="flex items-center gap-4">
				{/* Thumbnail */}
				<div className="w-14 h-14 rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0">
					{displayImage ? (
						<img
							src={displayImage}
							alt={displayTitle}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-zinc-800">
							{getAssetIcon()}
						</div>
					)}
				</div>

				{/* Details */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<p className="text-sm font-bold text-white truncate">
							{displayTitle}
						</p>
						{isListingDeleted && (
							<Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px]">
								Asset Removed
							</Badge>
						)}
						{getStatusBadge()}
					</div>
					<div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
						<span className="flex items-center gap-1">
							<DollarSign className="h-3 w-3" />${order.amount_paid.toFixed(2)}
						</span>
						<span className="flex items-center gap-1">
							<Calendar className="h-3 w-3" />
							{new Date(order.purchased_at).toLocaleDateString()}
						</span>
					</div>
				</div>

				{/* Action hint */}
				<div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
					<div className="p-2 rounded-xl bg-white/5 border border-white/10">
						<Eye className="h-4 w-4 text-zinc-400" />
					</div>
				</div>
			</div>
		</div>
	);
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AssetPurchaseLocker({
	orders,
	listings,
	currentUserId,
	onRefresh,
}: AssetPurchaseLockerProps) {
	const [enrichedOrders, setEnrichedOrders] = useState<EnrichedOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedOrder, setSelectedOrder] = useState<EnrichedOrder | null>(
		null,
	);
	const [selectedListing, setSelectedListing] = useState<any>(null);
	const [selectedAssetData, setSelectedAssetData] = useState<any>(null);
	const [selectedAssetType, setSelectedAssetType] = useState<
		"one_time" | "reusable" | "socio" | null
	>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [confirming, setConfirming] = useState(false);
	const [reviewModalOpen, setReviewModalOpen] = useState(false);
	const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// ─── Enrich orders with asset data ──────────────────────
	useEffect(() => {
		async function enrichOrders() {
			if (!currentUserId || orders.length === 0) {
				setEnrichedOrders([]);
				setLoading(false);
				return;
			}

			setLoading(true);

			try {
				const myOrders = orders.filter((o) => o.buyer_id === currentUserId);
				const enriched: EnrichedOrder[] = [];

				for (const order of myOrders) {
					const listing = listings.find((l) => l.id === order.listing_id);
					if (!listing) continue;

					let assetType: "one_time" | "reusable" | "socio" = "one_time";
					let assetData: any = null;

					// Determine asset type and fetch data
					if (listing.tab_category === "socio_market") {
						assetType = "socio";
						// Fetch from socio_market_metrics
						const { data } = await supabase
							.from("socio_market_metrics")
							.select("*")
							.eq("listing_id", listing.id)
							.maybeSingle();
						assetData = data;
					} else if (listing.product_sale_type === "one_time") {
						assetType = "one_time";
						const { data } = await supabase
							.from("one_time_digital_tools")
							.select("*")
							.eq("listing_id", listing.id)
							.maybeSingle();
						assetData = data;
					} else if (
						listing.product_sale_type === "recurring" ||
						listing.tab_category === "digital_tool"
					) {
						assetType = "reusable";
						const { data } = await supabase
							.from("reusable_digital_products")
							.select("*")
							.eq("listing_id", listing.id)
							.maybeSingle();
						assetData = data;
					}

					enriched.push({
						...order,
						asset_type: assetType,
						asset_data: assetData,
					});
				}

				setEnrichedOrders(enriched);
			} catch (err) {
			} finally {
				setLoading(false);
			}
		}

		enrichOrders();
	}, [orders, listings, currentUserId]);

	// ─── Handle card click ──────────────────────────────────
	const handleCardClick = (order: EnrichedOrder) => {
		const listing = listings.find((l) => l.id === order.listing_id);
		if (!listing) return;

		setSelectedOrder(order);
		setSelectedListing(listing);
		setSelectedAssetData(order.asset_data);
		setSelectedAssetType(order.asset_type);
		setModalOpen(true);
	};

	// ─── Handle delivery confirmation ──────────────────────────
	const handleDeliveryConfirm = async () => {
		if (!selectedOrder) return;

		setConfirming(true);
		try {
			const response = await fetch("/api/delivery/confirm", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ order_id: selectedOrder.id }),
			});

			const result = await response.json();

			if (response.ok) {
				// ✅ Force refresh multiple times to ensure state updates
				await onRefresh();

				// ✅ Also manually update the local order status
				const updatedOrder = {
					...selectedOrder,
					status: "completed",
					confirmed_at: new Date().toISOString(),
				};
				setSelectedOrder(updatedOrder as any);

				// ✅ Update the enrichedOrders list locally
				setEnrichedOrders((prev) =>
					prev.map((o) =>
						o.id === selectedOrder.id
							? { ...o, status: "completed" as any }
							: o,
					),
				);

				setModalOpen(false);
				setReviewOrderId(selectedOrder.id);
				setReviewModalOpen(true);
			} else {
				alert(result.error || "Failed to confirm delivery");
			}
		} catch (err) {
			alert("Something went wrong");
		} finally {
			setConfirming(false);
		}
	};

	// ─── Handle review submission ──────────────────────────
	const handleReviewSubmit = async (
		orderId: string,
		rating: number,
		reviewText: string,
	) => {
		try {
			const response = await fetch("/api/reviews/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					order_id: orderId,
					rating,
					review_text: reviewText,
				}),
			});

			if (response.ok) {
				setReviewModalOpen(false);
				setReviewOrderId(null);
				await onRefresh();
			} else {
				const error = await response.json();
				alert(error.error || "Failed to submit review");
			}
		} catch (err) {
			alert("Something went wrong");
		}
	};

	// ─── Handle download ────────────────────────────────────
	const handleDownload = async (path: string, fileName: string) => {
		try {
			const response = await fetch("/api/storage/download", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ path, fileName }),
			});

			const result = await response.json();

			if (!response.ok) {
				alert(result.error || "Failed to download");
				return;
			}

			if (result.url) {
				// Open in new tab or trigger download
				const a = document.createElement("a");
				a.href = result.url;
				a.download = result.fileName || fileName;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
			}
		} catch (err) {
			alert("Failed to download file");
		}
	};

	// ─── Loading state ──────────────────────────────────────
	if (!isClient || loading) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
				<p className="text-xs text-zinc-500 mt-2">Loading your assets...</p>
			</div>
		);
	}

	// ─── Empty state ────────────────────────────────────────
	if (enrichedOrders.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-4">
					<ShoppingBag className="h-8 w-8 text-zinc-600" />
				</div>
				<p className="text-sm font-semibold text-zinc-400">
					Your locker is empty
				</p>
				<p className="text-xs text-zinc-600 mt-1">
					Purchased assets will appear here once you make a purchase.
				</p>
			</div>
		);
	}


	return (
		<>
			{/* Cards */}
			<div className="space-y-3">
				{enrichedOrders.map((order) => {
					const listing = listings.find((l) => l.id === order.listing_id);
					if (!listing) return null;

					return (
						<LockerCard
							key={order.id}
							order={order}
							listing={listing}
							assetType={order.asset_type}
							onClick={() => handleCardClick(order)}
						/>
					);
				})}
			</div>

			{/* Asset Detail Modal */}
			{selectedOrder && selectedListing && selectedAssetType && (
				<AssetDetailModal
					isOpen={modalOpen}
					onClose={() => {
						setModalOpen(false);
						setSelectedOrder(null);
						setSelectedListing(null);
					}}
					order={selectedOrder}
					listing={selectedListing}
					assetData={selectedAssetData}
					assetType={selectedAssetType}
					onConfirm={handleDeliveryConfirm}
					onReview={(orderId) => {
						setModalOpen(false);
						setReviewOrderId(orderId);
						setReviewModalOpen(true);
					}}
					onDownload={handleDownload}
					isConfirming={confirming}
				/>
			)}

			{/* Review Modal */}
			{reviewOrderId && (
				<ReviewModal
					open={reviewModalOpen}
					onClose={() => {
						setReviewModalOpen(false);
						setReviewOrderId(null);
					}}
					orderId={reviewOrderId}
					assetTitle={selectedListing?.title || "Asset"}
					onSubmit={handleReviewSubmit}
				/>
			)}
		</>
	);
}
