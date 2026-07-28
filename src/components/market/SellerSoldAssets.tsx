// components/market/SellerSoldAssets.tsx

"use client";

import {
	AlertTriangle,
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
	Globe,
	HardDrive,
	KeyRound,
	Layers,
	Link as LinkIcon,
	Loader2,
	Mail,
	Package,
	Phone,
	User,
	Users,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import supabase from "@/lib/supabase/client";

// ============================================================
// TYPES
// ============================================================

type AssetType = "one_time" | "socio" | "reusable";

interface SoldAsset {
	id: string;
	listing_id: string;
	buyer_id: string;
	seller_id: string;
	amount_paid: number;
	revealed_credentials: any;
	purchased_at: string;
	status: string;
	// Joined fields
	listing_title: string;
	listing_display_pic_url: string | null;
	listing_tab_category: string;
	listing_product_sale_type: string;
	buyer_name: string;
	buyer_email: string;
	buyer_avatar_url: string | null;
	// Asset data
	asset_type: AssetType;
	asset_data: any;
}

interface SellerSoldAssetsProps {
	userId: string;
}

// ============================================================
// HELPERS
// ============================================================

function determineAssetType(listing: any): AssetType {
	if (listing?.tab_category === "socio_market") return "socio";
	if (listing?.product_sale_type === "one_time") return "one_time";
	return "reusable";
}

function formatDate(date: string) {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatPrice(amount: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
}

function getWeekGroup(date: string): string {
	const d = new Date(date);
	const now = new Date();
	const diff = now.getTime() - d.getTime();
	const days = diff / (1000 * 60 * 60 * 24);

	if (days < 7) return "This Week";
	if (days < 14) return "Last Week";
	if (days < 30) return "This Month";
	return "Older";
}

function getAssetIcon(assetType: AssetType) {
	switch (assetType) {
		case "socio":
			return <Users className="h-4 w-4 text-purple-400" />;
		case "one_time":
			return <Package className="h-4 w-4 text-emerald-400" />;
		default:
			return <Layers className="h-4 w-4 text-sky-400" />;
	}
}

function getAssetLabel(assetType: AssetType) {
	switch (assetType) {
		case "socio":
			return "Social Account";
		case "one_time":
			return "One-Time Product";
		default:
			return "Reusable Tool";
	}
}

// ============================================================
// ASSET CONTENT RENDERER
// ============================================================

interface AssetContentRendererProps {
	assetType: AssetType;
	assetData: any;
	listing: any;
}

function AssetContentRenderer({
	assetType,
	assetData,
	listing,
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
			<div className="text-center py-6 text-zinc-500">
				<p className="text-sm">No asset data available</p>
			</div>
		);
	}

	// ─── ONE-TIME PRODUCT ──────────────────────────────────────
	if (assetType === "one_time") {
		const tool = assetData;

		return (
			<div className="space-y-3">
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
					{tool.storage_vault_path && (
						<Button
							size="sm"
							variant="ghost"
							className="text-emerald-400 hover:text-emerald-300"
						>
							<Download className="h-4 w-4" />
						</Button>
					)}
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

	// ─── SOCIO ACCOUNT ─────────────────────────────────────────
	if (assetType === "socio") {
		const socio = assetData;

		// Get credentials from listing's encrypted_asset_payload
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
			<div className="space-y-3">
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
							{socio.followers_count?.toLocaleString() || 0}
						</p>
					</div>
				</div>

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

	// ─── REUSABLE PRODUCT ──────────────────────────────────────
	if (assetType === "reusable") {
		const product = assetData;

		return (
			<div className="space-y-3">
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

				{product.risk_cautions && (
					<div className="space-y-1.5">
						<p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
							<AlertTriangle className="h-3.5 w-3.5 inline mr-1.5" />
							Risk & Cautions
						</p>
						<p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
							{product.risk_cautions}
						</p>
					</div>
				)}

				{product.fulfillment_payload && (
					<div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
						<p className="text-xs text-zinc-500 font-medium mb-2">
							Fulfillment Details
						</p>
						<pre className="text-xs text-zinc-300 bg-zinc-950 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
							{typeof product.fulfillment_payload === "string"
								? product.fulfillment_payload
								: JSON.stringify(product.fulfillment_payload, null, 2)}
						</pre>
					</div>
				)}

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

	return (
		<div className="text-center py-6 text-zinc-500">
			<p className="text-sm">Unknown asset type</p>
		</div>
	);
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SellerSoldAssets({ userId }: SellerSoldAssetsProps) {
	const [soldAssets, setSoldAssets] = useState<SoldAsset[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedAsset, setSelectedAsset] = useState<SoldAsset | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [totalRevenue, setTotalRevenue] = useState(0);

	// ─── Fetch Sold Assets ──────────────────────────────────────
	const fetchSoldAssets = useCallback(async () => {
		if (!userId) return;
		setLoading(true);

		try {
			// ─── Step 1: Fetch completed orders ────────────────────
			const { data: orders, error: ordersError } = await supabase
				.from("global_market_orders")
				.select("*")
				.eq("seller_id", userId)
				.eq("status", "completed")
				.order("purchased_at", { ascending: false });

			if (ordersError) throw ordersError;

			if (!orders || orders.length === 0) {
				setSoldAssets([]);
				setTotalRevenue(0);
				setLoading(false);
				return;
			}

			// ─── Step 2: Get buyer profiles ────────────────────────
			const buyerIds = orders
				.map((o) => o.buyer_id)
				.filter((id) => id !== null && id !== undefined);

			const profileMap = new Map();
			if (buyerIds.length > 0) {
				const { data: profiles, error: profilesError } = await supabase
					.from("profiles")
					.select("id, display_name, username, email, avatar_url")
					.in("id", buyerIds);

				if (profilesError) throw profilesError;
				profiles?.forEach((p) => profileMap.set(p.id, p));
			}

			// ─── Step 3: Get listings ──────────────────────────────
			const listingIds = orders
				.map((o) => o.listing_id)
				.filter((id) => id !== null && id !== undefined);

			const listingMap = new Map();
			if (listingIds.length > 0) {
				const { data: listings, error: listingsError } = await supabase
					.from("market_listings")
					.select("*")
					.in("id", listingIds);

				if (listingsError) throw listingsError;
				listings?.forEach((l) => listingMap.set(l.id, l));
			}

			// ─── Step 4: Fetch asset data for each listing ─────────
			const enriched: SoldAsset[] = await Promise.all(
				orders.map(async (order) => {
					const listing = listingMap.get(order.listing_id);
					const buyer = profileMap.get(order.buyer_id);
					const assetType = listing ? determineAssetType(listing) : "reusable";
					let assetData = null;

					// Fetch asset data from the correct table
					if (listing) {
						if (assetType === "one_time") {
							const { data } = await supabase
								.from("one_time_digital_tools")
								.select("*")
								.eq("listing_id", listing.id)
								.maybeSingle();
							assetData = data;
						} else if (assetType === "socio") {
							const { data } = await supabase
								.from("socio_market_metrics")
								.select("*")
								.eq("listing_id", listing.id)
								.maybeSingle();
							assetData = data;
						} else {
							const { data } = await supabase
								.from("reusable_digital_products")
								.select("*")
								.eq("listing_id", listing.id)
								.maybeSingle();
							assetData = data;
						}
					}

					return {
						id: order.id,
						listing_id: order.listing_id,
						buyer_id: order.buyer_id,
						seller_id: order.seller_id,
						amount_paid: order.amount_paid,
						revealed_credentials: order.revealed_credentials,
						purchased_at: order.purchased_at,
						status: order.status,
						listing_title: listing?.title || "Unknown Product",
						listing_display_pic_url: listing?.display_pic_url || null,
						listing_tab_category: listing?.tab_category || "product",
						listing_product_sale_type: listing?.product_sale_type || "one_time",
						buyer_name:
							buyer?.display_name ||
							buyer?.username ||
							buyer?.email ||
							"Unknown Buyer",
						buyer_email: buyer?.email || "No email",
						buyer_avatar_url: buyer?.avatar_url || null,
						asset_type: assetType,
						asset_data: assetData,
					};
				}),
			);

			setSoldAssets(enriched);
			const total = enriched.reduce((sum, asset) => sum + asset.amount_paid, 0);
			setTotalRevenue(total);
		} catch (err) {
			console.error("Failed to fetch sold assets:", err);
		} finally {
			setLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		fetchSoldAssets();
	}, [fetchSoldAssets]);

	// ─── Loading State ──────────────────────────────────────────
	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-16 gap-3">
				<Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
				<p className="text-xs text-zinc-500 font-medium">
					Loading sold assets...
				</p>
			</div>
		);
	}

	// ─── Empty State ──────────────────────────────────────────
	if (soldAssets.length === 0) {
		return (
			<div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-zinc-950/20">
				<Package className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
				<p className="text-sm font-semibold text-zinc-400">No sales yet</p>
				<p className="text-xs text-zinc-600 mt-1">
					Your sold assets will appear here once you make your first sale.
				</p>
			</div>
		);
	}

	// ─── Group by week ──────────────────────────────────────────
	const groupedAssets = soldAssets.reduce(
		(groups, asset) => {
			const week = getWeekGroup(asset.purchased_at);
			if (!groups[week]) groups[week] = [];
			groups[week].push(asset);
			return groups;
		},
		{} as Record<string, SoldAsset[]>,
	);

	const weekOrder = ["This Week", "Last Week", "This Month", "Older"];

	// ─── Render ──────────────────────────────────────────────────
	return (
		<div className="w-full space-y-6">
			{/* ─── Revenue Summary ────────────────────────────────── */}
			<div className="bg-zinc-950/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
						<DollarSign className="h-5 w-5 text-emerald-400" />
					</div>
					<div>
						<p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
							Total Revenue
						</p>
						<p className="text-2xl font-black text-emerald-400">
							{formatPrice(totalRevenue)}
						</p>
					</div>
				</div>
				<Badge className="bg-zinc-900 border-white/10 text-zinc-400 text-[10px] font-bold">
					{soldAssets.length} {soldAssets.length === 1 ? "Sale" : "Sales"}
				</Badge>
			</div>

			{/* ─── Grouped List ────────────────────────────────────── */}
			{weekOrder.map((week) => {
				const assets = groupedAssets[week] || [];
				if (assets.length === 0) return null;

				return (
					<div key={week} className="space-y-2">
						<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">
							{week}
						</h3>
						<div className="space-y-2">
							{assets.map((asset) => (
								<div
									key={asset.id}
									className="flex items-center gap-4 bg-zinc-950/40 border border-white/5 rounded-2xl p-3 hover:border-white/15 transition-all duration-300"
								>
									{/* ─── Thumbnail ────────────────────────────── */}
									<div className="w-16 h-16 rounded-xl bg-zinc-900 overflow-hidden flex-shrink-0">
										{asset.listing_display_pic_url ? (
											<img
												src={asset.listing_display_pic_url}
												alt={asset.listing_title}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center bg-zinc-800">
												{getAssetIcon(asset.asset_type)}
											</div>
										)}
									</div>

									{/* ─── Content ──────────────────────────────── */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<h4 className="text-sm font-bold text-white truncate">
												{asset.listing_title}
											</h4>
											<Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] flex-shrink-0">
												<CheckCircle2 className="h-3 w-3 mr-1" />
												Sold
											</Badge>
										</div>
										<div className="flex items-center gap-3 mt-0.5">
											<div className="flex items-center gap-1.5 text-xs text-zinc-400">
												<User className="h-3 w-3" />
												<span className="truncate max-w-[120px]">
													{asset.buyer_name}
												</span>
											</div>
											<div className="flex items-center gap-1.5 text-xs text-zinc-500">
												<Calendar className="h-3 w-3" />
												<span>{formatDate(asset.purchased_at)}</span>
											</div>
											<div className="flex items-center gap-1 text-xs text-zinc-500">
												{getAssetIcon(asset.asset_type)}
												<span className="text-[9px]">
													{getAssetLabel(asset.asset_type)}
												</span>
											</div>
										</div>
									</div>

									{/* ─── Price & Action ───────────────────────── */}
									<div className="flex items-center gap-3 flex-shrink-0">
										<span className="text-sm font-bold text-emerald-400">
											{formatPrice(asset.amount_paid)}
										</span>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => {
												setSelectedAsset(asset);
												setIsDetailsOpen(true);
											}}
											className="h-8 px-3 text-[10px] text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
										>
											<Eye className="h-3.5 w-3.5 mr-1" />
											View
										</Button>
									</div>
								</div>
							))}
						</div>
					</div>
				);
			})}

			{/* ─── DETAILS MODAL ──────────────────────────────────── */}
			<Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
				<DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-white font-bold text-lg flex items-center gap-2">
							{selectedAsset && getAssetIcon(selectedAsset.asset_type)}
							Sale Details
						</DialogTitle>
					</DialogHeader>

					{selectedAsset && (
						<div className="space-y-4">
							{/* ─── Product Info ────────────────────────────── */}
							<div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5">
								<div className="w-14 h-14 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
									{selectedAsset.listing_display_pic_url ? (
										<img
											src={selectedAsset.listing_display_pic_url}
											alt={selectedAsset.listing_title}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											{getAssetIcon(selectedAsset.asset_type)}
										</div>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-bold text-white truncate">
										{selectedAsset.listing_title}
									</p>
									<div className="flex items-center gap-2 mt-0.5">
										<Badge className="bg-zinc-800 text-zinc-300 text-[9px]">
											{selectedAsset.listing_tab_category?.replace("_", " ") ||
												"Product"}
										</Badge>
										<Badge className="bg-zinc-800 text-zinc-300 text-[9px]">
											{selectedAsset.listing_product_sale_type?.replace(
												"_",
												" ",
											) || "Standard"}
										</Badge>
										<Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">
											Sold {formatDate(selectedAsset.purchased_at)}
										</Badge>
									</div>
								</div>
								<span className="text-lg font-black text-emerald-400 flex-shrink-0">
									{formatPrice(selectedAsset.amount_paid)}
								</span>
							</div>

							{/* ─── Buyer Info ──────────────────────────────── */}
							<div className="space-y-1.5">
								<p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
									Buyer
								</p>
								<div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-white/5">
									<Avatar className="w-10 h-10 rounded-full flex-shrink-0">
										{selectedAsset.buyer_avatar_url ? (
											<AvatarImage src={selectedAsset.buyer_avatar_url} />
										) : (
											<AvatarFallback className="bg-zinc-800 text-zinc-400">
												{selectedAsset.buyer_name?.[0] || "U"}
											</AvatarFallback>
										)}
									</Avatar>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-bold text-white">
											{selectedAsset.buyer_name}
										</p>
										<p className="text-xs text-zinc-500 truncate">
											{selectedAsset.buyer_email}
										</p>
									</div>
									<Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
										<CheckCircle2 className="h-3 w-3 mr-1" />
										Completed
									</Badge>
								</div>
							</div>

							{/* ─── Asset Content ───────────────────────────── */}
							<div className="space-y-1.5">
								<p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-2">
									<Package className="h-3.5 w-3.5" />
									Asset Details
								</p>
								<div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5">
									<AssetContentRenderer
										assetType={selectedAsset.asset_type}
										assetData={selectedAsset.asset_data}
										listing={{
											encrypted_asset_payload:
												selectedAsset.revealed_credentials,
										}}
									/>
								</div>
							</div>

							{/* ─── Close Button ────────────────────────────── */}
							<Button
								onClick={() => setIsDetailsOpen(false)}
								className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl"
							>
								Close
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
