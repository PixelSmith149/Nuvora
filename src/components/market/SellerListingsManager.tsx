// components/market/SellerListingsManager.tsx

"use client";

import {
	AlertCircle,
	ArrowLeft,
	BookOpen,
	Code,
	Database,
	FileCode,
	FileText,
	Globe,
	Image as ImageIcon,
	Layers,
	Loader2,
	Music,
	Package,
	Palette,
	Save,
	ShoppingBag,
	Smartphone,
	Trash2,
	TrendingUp,
	Users,
	Video,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import supabase from "@/lib/supabase/client";

// ============================================================
// TYPES
// ============================================================

interface OneTimeTool {
	id: string;
	product_title: string;
	product_description: string | null;
	sale_price: number;
	display_cover_url: string | null;
	asset_category?: string | null;
	asset_type?: string | null;
	asset_content?: any | null;
	storage_vault_path?: string | null;
	file_original_name?: string | null;
	file_size_bytes?: number | null;
	file_mime_type?: string | null;
}

interface ListingDetail {
	id: string;
	title: string;
	description: string | null;
	price: number;
	display_pic_url: string | null;
	status: string;
	product_sale_type: string;
	tab_category: string;
	created_at: string;
	// Joined data
	one_time_tool?: OneTimeTool | null;
	reusable_product?: {
		id: string;
		product_title: string;
		product_description: string | null;
		sale_price: number;
		display_cover_url: string | null;
	} | null;
	socio_metrics?: {
		id: string;
		platform_name: string;
		target_username: string;
		followers_count: number;
		account_bio: string | null;
	} | null;
}

interface SellerListingsManagerProps {
	listingId: string;
	userId: string;
	onBack: () => void;
	onUpdate: () => void;
	onDelete: () => void;
}

// ─── Category Icon Map ──────────────────────────────────────
const getCategoryIcon = (category: string | null | undefined) => {
	const iconMap: Record<string, React.ReactNode> = {
		source_code: <Code className="h-3.5 w-3.5" />,
		website_template: <Globe className="h-3.5 w-3.5" />,
		theme_plugin: <Layers className="h-3.5 w-3.5" />,
		ui_kit_component: <Palette className="h-3.5 w-3.5" />,
		automation_script: <Code className="h-3.5 w-3.5" />,
		api_integration: <Code className="h-3.5 w-3.5" />,
		database_schema: <Database className="h-3.5 w-3.5" />,
		config_file: <FileText className="h-3.5 w-3.5" />,
		logo_template: <Palette className="h-3.5 w-3.5" />,
		font_typography: <FileText className="h-3.5 w-3.5" />,
		stock_media: <ImageIcon className="h-3.5 w-3.5" />,
		mockup_template: <Palette className="h-3.5 w-3.5" />,
		social_media_kit: <TrendingUp className="h-3.5 w-3.5" />,
		ad_creative: <TrendingUp className="h-3.5 w-3.5" />,
		email_template: <FileText className="h-3.5 w-3.5" />,
		ebook_guide: <BookOpen className="h-3.5 w-3.5" />,
		pdf_manual: <FileText className="h-3.5 w-3.5" />,
		course_video: <Video className="h-3.5 w-3.5" />,
		workshop_material: <BookOpen className="h-3.5 w-3.5" />,
		spreadsheet_tool: <FileText className="h-3.5 w-3.5" />,
		browser_extension: <Globe className="h-3.5 w-3.5" />,
		notion_template: <FileText className="h-3.5 w-3.5" />,
		obsidian_vault: <FileText className="h-3.5 w-3.5" />,
		ai_prompt: <Code className="h-3.5 w-3.5" />,
		game_asset: <Layers className="h-3.5 w-3.5" />,
		"3d_model": <Layers className="h-3.5 w-3.5" />,
		minecraft_map: <Layers className="h-3.5 w-3.5" />,
		dnd_resource: <BookOpen className="h-3.5 w-3.5" />,
		music_pack: <Music className="h-3.5 w-3.5" />,
		sound_effect: <Music className="h-3.5 w-3.5" />,
		stock_photo: <ImageIcon className="h-3.5 w-3.5" />,
		stock_video: <Video className="h-3.5 w-3.5" />,
	};
	return iconMap[category || ""] || <Package className="h-3.5 w-3.5" />;
};

const getCategoryLabel = (category: string | null | undefined): string => {
	const labelMap: Record<string, string> = {
		source_code: "Source Code",
		website_template: "Website Template",
		theme_plugin: "Theme / Plugin",
		ui_kit_component: "UI Kit",
		automation_script: "Automation Script",
		api_integration: "API Integration",
		database_schema: "Database Schema",
		config_file: "Config File",
		logo_template: "Logo Template",
		font_typography: "Font",
		stock_media: "Stock Media",
		mockup_template: "Mockup",
		social_media_kit: "Social Kit",
		ad_creative: "Ad Creative",
		email_template: "Email Template",
		ebook_guide: "E-book",
		pdf_manual: "PDF Manual",
		course_video: "Video Course",
		workshop_material: "Workshop",
		spreadsheet_tool: "Spreadsheet",
		browser_extension: "Extension",
		notion_template: "Notion Template",
		obsidian_vault: "Obsidian Vault",
		ai_prompt: "AI Prompt",
		game_asset: "Game Asset",
		"3d_model": "3D Model",
		minecraft_map: "Minecraft Map",
		dnd_resource: "D&D Resource",
		music_pack: "Music Pack",
		sound_effect: "Sound Effect",
		stock_photo: "Stock Photo",
		stock_video: "Stock Video",
	};
	return labelMap[category || ""] || category || "Custom";
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SellerListingsManager({
	listingId,
	userId,
	onBack,
	onUpdate,
	onDelete,
}: SellerListingsManagerProps) {
	const [listing, setListing] = useState<ListingDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);

	// ─── Form State ──────────────────────────────────────────
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		price: 0,
		display_pic_url: "",
		status: "active",
	});

	// ─── Asset Category Info ────────────────────────────────
	const [assetCategory, setAssetCategory] = useState<string | null>(null);
	const [assetType, setAssetType] = useState<string | null>(null);
	const [assetContent, setAssetContent] = useState<any>(null);

	// ─── Fetch Listing Data ──────────────────────────────────
	const fetchListing = useCallback(async () => {
		if (!listingId || !userId) return;

		setLoading(true);
		setError(null);

		try {
			// Fetch main listing
			const { data: listingData, error: listingError } = await supabase
				.from("market_listings")
				.select("*")
				.eq("id", listingId)
				.eq("seller_id", userId)
				.single();

			if (listingError) throw listingError;
			if (!listingData) throw new Error("Listing not found");

			// Fetch related data based on product_sale_type
			let oneTimeTool = null;
			let reusableProduct = null;
			let socioMetrics = null;

			if (listingData.product_sale_type === "one_time") {
				const { data } = await supabase
					.from("one_time_digital_tools")
					.select("*")
					.eq("listing_id", listingId)
					.maybeSingle();
				oneTimeTool = data;

				// Store category info for display
				if (data) {
					setAssetCategory(data.asset_category || null);
					setAssetType(data.asset_type || null);
					setAssetContent(data.asset_content || null);
				}
			}

			if (
				listingData.product_sale_type === "recurring" ||
				listingData.tab_category === "digital_tool"
			) {
				const { data } = await supabase
					.from("reusable_digital_products")
					.select("*")
					.eq("listing_id", listingId)
					.maybeSingle();
				reusableProduct = data;
			}

			if (listingData.tab_category === "socio_market") {
				const { data } = await supabase
					.from("socio_market_metrics")
					.select("*")
					.eq("listing_id", listingId)
					.maybeSingle();
				socioMetrics = data;
			}

			const enriched: ListingDetail = {
				...listingData,
				one_time_tool: oneTimeTool,
				reusable_product: reusableProduct,
				socio_metrics: socioMetrics,
			};

			setListing(enriched);

			// Populate form with appropriate data
			const productData = oneTimeTool || reusableProduct;
			setFormData({
				title: productData?.product_title || listingData.title || "",
				description:
					productData?.product_description || listingData.description || "",
				price: productData?.sale_price || listingData.price || 0,
				display_pic_url:
					productData?.display_cover_url || listingData.display_pic_url || "",
				status: listingData.status || "active",
			});
		} catch (err: any) {
			setError(err.message || "Failed to load listing");
		} finally {
			setLoading(false);
		}
	}, [listingId, userId]);

	useEffect(() => {
		fetchListing();
	}, [fetchListing]);

	// ─── Determine which table to update ─────────────────────
	const getTargetTable = useCallback(() => {
		if (!listing) return null;

		if (listing.one_time_tool) return "one_time_digital_tools";
		if (listing.reusable_product) return "reusable_digital_products";
		if (listing.socio_metrics) return "socio_market_metrics";
		return null;
	}, [listing]);

	const getTargetId = useCallback(() => {
		if (!listing) return null;

		if (listing.one_time_tool) return listing.one_time_tool.id;
		if (listing.reusable_product) return listing.reusable_product.id;
		if (listing.socio_metrics) return listing.socio_metrics.id;
		return null;
	}, [listing]);

	// ─── Save Changes ────────────────────────────────────────
	const handleSave = async () => {
		if (!listing) return;

		setSaving(true);
		setError(null);

		try {
			const targetTable = getTargetTable();
			const targetId = getTargetId();

			// 1. Update the main listing (status)
			const { error: listingError } = await supabase
				.from("market_listings")
				.update({
					status: formData.status,
					updated_at: new Date().toISOString(),
				})
				.eq("id", listingId);

			if (listingError) throw listingError;

			// 2. Update the specific asset table
			if (targetTable && targetId) {
				const updateData: any = {
					product_title: formData.title,
					product_description: formData.description || null,
					sale_price: formData.price,
					display_cover_url: formData.display_pic_url || null,
					updated_at: new Date().toISOString(),
				};

				// For socio metrics, update differently
				if (targetTable === "socio_market_metrics") {
					updateData.account_bio = formData.description || null;
					delete updateData.product_title;
					delete updateData.product_description;
					delete updateData.sale_price;
					delete updateData.display_cover_url;
				}

				// For one_time_tools, preserve category fields
				if (targetTable === "one_time_digital_tools") {
					// Don't modify asset_category, asset_type, asset_content - they're set at creation
					// Only update the core fields
				}

				const { error: updateError } = await supabase
					.from(targetTable)
					.update(updateData)
					.eq("id", targetId);

				if (updateError) throw updateError;
			} else {
				// Fallback: update just the listing
				const { error: updateError } = await supabase
					.from("market_listings")
					.update({
						title: formData.title,
						description: formData.description || null,
						price: formData.price,
						display_pic_url: formData.display_pic_url || null,
					})
					.eq("id", listingId);

				if (updateError) throw updateError;
			}

			onUpdate();
			fetchListing();
		} catch (err: any) {
			setError(err.message || "Failed to save changes");
		} finally {
			setSaving(false);
		}
	};

	// ─── Delete Listing ──────────────────────────────────────
	const handleDelete = async () => {
		if (!listing) return;

		if (!confirm("Are you sure you want to delete this listing?")) return;

		setDeleting(true);
		setError(null);

		try {
			const { error: deleteError } = await supabase
				.from("market_listings")
				.update({
					status: "deleted",
					updated_at: new Date().toISOString(),
				})
				.eq("id", listingId);

			if (deleteError) throw deleteError;

			onDelete();
		} catch (err: any) {
			setError(err.message || "Failed to delete listing");
			setDeleting(false);
		}
	};

	// ─── Upload Image ────────────────────────────────────────
	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			alert("Image must be less than 5MB");
			return;
		}

		const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
		if (!allowedTypes.includes(file.type)) {
			alert("Only JPEG, PNG, WebP, and GIF are allowed");
			return;
		}

		setIsUploading(true);
		setUploadProgress(0);

		try {
			const session = await supabase.auth.getSession();
			const token = session.data.session?.access_token;

			if (!token) throw new Error("Not authenticated");

			const ticketRes = await fetch("/api/market-place/upload-ticket", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					fileName: file.name,
					fileType: file.type,
					isPublicBucket: true,
				}),
			});

			if (!ticketRes.ok) {
				const err = await ticketRes.json();
				throw new Error(err.error || "Failed to get upload URL");
			}

			const ticket = await ticketRes.json();

			const xhr = new XMLHttpRequest();
			xhr.upload.addEventListener("progress", (event) => {
				if (event.lengthComputable) {
					setUploadProgress(Math.round((event.loaded / event.total) * 100));
				}
			});

			await new Promise<void>((resolve, reject) => {
				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) resolve();
					else reject(new Error(`Upload failed: ${xhr.status}`));
				};
				xhr.onerror = () => reject(new Error("Network error"));
				xhr.open("PUT", ticket.uploadUrl);
				xhr.setRequestHeader("Content-Type", file.type);
				xhr.send(file);
			});

			const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/marketplace-public/${ticket.storagePath}`;

			setFormData((prev) => ({
				...prev,
				display_pic_url: publicUrl,
			}));
		} catch (err) {
			alert("Failed to upload image");
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
			e.target.value = "";
		}
	};

	// ─── Render Asset Category Info ──────────────────────────
	const renderCategoryInfo = () => {
		if (!listing?.one_time_tool) return null;

		const category = assetCategory || "custom";
		const type = assetType || "file";
		const icon = getCategoryIcon(category);
		const label = getCategoryLabel(category);

		return (
			<div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
				<div className="flex items-center gap-1.5 text-emerald-400">
					{icon}
					<span className="text-xs font-bold text-zinc-200">{label}</span>
				</div>
				<span className="text-[9px] text-zinc-500">•</span>
				<span className="text-[9px] text-zinc-500 uppercase tracking-wider">
					Type: {type}
				</span>
				{type === "file" && listing.one_time_tool?.file_original_name && (
					<>
						<span className="text-[9px] text-zinc-500">•</span>
						<span className="text-[9px] text-zinc-500 truncate max-w-[120px]">
							{listing.one_time_tool.file_original_name}
						</span>
						<span className="text-[9px] text-zinc-500">
							(
							{(listing.one_time_tool.file_size_bytes || 0) / 1024 / 1024 < 1
								? `${Math.round((listing.one_time_tool.file_size_bytes || 0) / 1024)} KB`
								: `${((listing.one_time_tool.file_size_bytes || 0) / 1024 / 1024).toFixed(1)} MB`}
							)
						</span>
					</>
				)}
				{type !== "file" && assetContent && (
					<>
						<span className="text-[9px] text-zinc-500">•</span>
						<span className="text-[9px] text-zinc-400 truncate max-w-[200px]">
							{typeof assetContent === "object"
								? JSON.stringify(assetContent).slice(0, 50) +
									(JSON.stringify(assetContent).length > 50 ? "..." : "")
								: String(assetContent).slice(0, 50) +
									(String(assetContent).length > 50 ? "..." : "")}
						</span>
					</>
				)}
			</div>
		);
	};

	// ─── Loading State ────────────────────────────────────────
	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-16 gap-3">
				<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
				<p className="text-xs text-zinc-500 font-medium">
					Loading listing details...
				</p>
			</div>
		);
	}

	// ─── Error State ──────────────────────────────────────────
	if (error || !listing) {
		return (
			<div className="text-center py-16 rounded-2xl border border-red-500/20 bg-red-500/5">
				<AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
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

	// ─── Main Render ──────────────────────────────────────────
	return (
		<div className="w-full max-w-3xl mx-auto space-y-5">
			{/* ─── Header ──────────────────────────────────────────── */}
			<div className="flex items-center justify-between gap-3">
				<Button
					variant="ghost"
					onClick={onBack}
					className="h-9 px-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl"
				>
					<ArrowLeft className="h-4 w-4 mr-1.5" />
					Back to Listings
				</Button>

				<div className="flex items-center gap-2">
					<Badge className="bg-zinc-900 border-white/5 text-zinc-400 text-[10px] font-bold">
						{listing.tab_category.replace("_", " ")}
					</Badge>
					<Badge
						className={`text-[10px] font-bold border ${
							listing.status === "active"
								? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
								: listing.status === "suspended"
									? "bg-red-500/20 text-red-400 border-red-500/30"
									: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
						}`}
					>
						{listing.status}
					</Badge>
				</div>
			</div>

			{/* ─── Form ────────────────────────────────────────────── */}
			<div className="bg-zinc-950/60 border border-white/5 rounded-2xl p-6 space-y-4">
				{/* ─── Asset Type Info ───────────────────────────────── */}
				<div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
					{listing.socio_metrics ? (
						<Users className="h-4 w-4 text-purple-400" />
					) : listing.one_time_tool ? (
						<Package className="h-4 w-4 text-emerald-400" />
					) : (
						<FileCode className="h-4 w-4 text-sky-400" />
					)}
					<span className="text-xs text-zinc-400 font-medium">
						{listing.socio_metrics
							? `Social Account: ${listing.socio_metrics.platform_name} (@${listing.socio_metrics.target_username})`
							: listing.one_time_tool
								? "One-Time Digital Product"
								: "Reusable Digital Tool"}
					</span>
				</div>

				{/* ─── Category Info (for one_time_tools) ────────────── */}
				{listing.one_time_tool && renderCategoryInfo()}

				{/* ─── Image ─────────────────────────────────────────── */}
				<div className="space-y-1.5">
					<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
						Cover Image
					</Label>
					<div className="flex items-center gap-3">
						<div className="w-24 h-24 rounded-xl border border-white/10 bg-zinc-900 overflow-hidden flex-shrink-0">
							{formData.display_pic_url ? (
								<img
									src={formData.display_pic_url}
									alt={formData.title}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<ImageIcon className="h-6 w-6 text-zinc-600" />
								</div>
							)}
						</div>

						<div className="flex-1">
							<input
								type="file"
								id="image-upload"
								accept="image/*"
								onChange={handleImageUpload}
								className="hidden"
							/>
							<label
								htmlFor="image-upload"
								className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-900 text-xs font-bold text-zinc-300 cursor-pointer hover:bg-zinc-800 transition-colors ${
									isUploading ? "opacity-50 pointer-events-none" : ""
								}`}
							>
								{isUploading ? (
									<>
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
										{uploadProgress}%
									</>
								) : (
									<>
										<ImageIcon className="h-3.5 w-3.5" />
										Upload New Image
									</>
								)}
							</label>
							<p className="text-[9px] text-zinc-600 mt-1">
								JPEG, PNG, WebP, GIF · Max 5MB
							</p>
						</div>
					</div>
				</div>

				{/* ─── Title ─────────────────────────────────────────── */}
				<div className="space-y-1.5">
					<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
						{listing.socio_metrics ? "Account Name" : "Product Title"}
					</Label>
					<Input
						value={formData.title}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, title: e.target.value }))
						}
						className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl"
						disabled={!!listing.socio_metrics}
					/>
				</div>

				{/* ─── Description ──────────────────────────────────── */}
				<div className="space-y-1.5">
					<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
						{listing.socio_metrics ? "Account Bio" : "Description"}
					</Label>
					<Textarea
						value={formData.description || ""}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, description: e.target.value }))
						}
						className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl resize-none"
						rows={4}
					/>
				</div>

				{/* ─── Price ─────────────────────────────────────────── */}
				{!listing.socio_metrics && (
					<div className="space-y-1.5">
						<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
							Price (USD)
						</Label>
						<Input
							type="number"
							step="0.01"
							value={formData.price}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									price: parseFloat(e.target.value) || 0,
								}))
							}
							className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl"
						/>
					</div>
				)}

				{/* ─── Status ────────────────────────────────────────── */}
				<div className="space-y-1.5">
					<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
						Status
					</Label>
					<select
						value={formData.status}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, status: e.target.value }))
						}
						className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-700"
					>
						<option value="active">Active</option>
						<option value="draft">Draft</option>
						<option value="suspended">Suspended</option>
						{listing.status === "sold" && <option value="sold">Sold</option>}
					</select>
				</div>

				{/* ─── Created At ────────────────────────────────────── */}
				<div className="pt-2 border-t border-white/5 flex items-center justify-between">
					<span className="text-[10px] text-zinc-600">
						Created: {new Date(listing.created_at).toLocaleDateString()}
					</span>
					<span className="text-[10px] text-zinc-600">
						ID: {listingId.slice(0, 8)}...
					</span>
				</div>

				{/* ─── Actions ───────────────────────────────────────── */}
				<div className="flex items-center gap-3 pt-2 border-t border-white/5">
					<Button
						onClick={handleSave}
						disabled={saving}
						className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl"
					>
						{saving ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" />
								Save Changes
							</>
						)}
					</Button>

					<Button
						onClick={handleDelete}
						disabled={deleting || listing.status === "deleted"}
						variant="outline"
						className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl"
					>
						{deleting ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Trash2 className="h-4 w-4" />
						)}
					</Button>
				</div>

				{/* ─── Error Display ────────────────────────────────── */}
				{error && (
					<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
						<AlertCircle className="h-4 w-4 shrink-0" />
						<span>{error}</span>
					</div>
				)}
			</div>
		</div>
	);
}
