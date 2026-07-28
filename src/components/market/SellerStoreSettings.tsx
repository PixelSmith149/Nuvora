// components/seller/StoreSettingsModal.tsx

"use client";

import {
	AlertCircle,
	Camera,
	CheckCircle2,
	Globe,
	Image as ImageIcon,
	Loader2,
	Mail,
	MapPin,
	Phone,
	RefreshCw,
	Settings,
	Shield,
	Store,
	User,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import supabase from "@/lib/supabase/client";

// ============================================================
// TYPES
// ============================================================

interface StoreSettingsModalProps {
	open: boolean;
	onClose: () => void;
	userId: string;
	storeData: any | null;
	onSave: () => void;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function StoreSettingsModal({
	open,
	onClose,
	userId,
	storeData: initialStore,
	onSave,
}: StoreSettingsModalProps) {
	// ─── Form State ──────────────────────────────────────────
	const [storeData, setStoreData] = useState({
		// Identity
		store_avatar_url: initialStore?.store_avatar_url || "",
		store_banner_url: initialStore?.store_banner_url || "",
		business_name: initialStore?.business_name || "",
		store_description: initialStore?.store_description || "",
		about_store: initialStore?.about_store || "",

		// Contact
		tiktok_handle: initialStore?.tiktok_handle || "",
		snapchat_handle: initialStore?.snapchat_handle || "",
		contact_email: initialStore?.contact_email || "",
		marketing_email: initialStore?.marketing_email || "",
		contact_phone: initialStore?.contact_phone || "",
		website_url: initialStore?.website_url || "",
		business_address: initialStore?.business_address || "",

		// Policies
		return_policy: initialStore?.return_policy || "",
		shipping_policy: initialStore?.shipping_policy || "",
	});

	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [avatarPreview, setAvatarPreview] = useState(
		storeData.store_avatar_url,
	);
	const [bannerPreview, setBannerPreview] = useState(
		storeData.store_banner_url,
	);

	const avatarInputRef = useRef<HTMLInputElement>(null);
	const bannerInputRef = useRef<HTMLInputElement>(null);

	// ─── Reset form when modal opens ──────────────────────────
	useEffect(() => {
		if (open && initialStore) {
			setStoreData({
				store_avatar_url: initialStore.store_avatar_url || "",
				store_banner_url: initialStore.store_banner_url || "",
				business_name: initialStore.business_name || "",
				store_description: initialStore.store_description || "",
				about_store: initialStore.about_store || "",
				tiktok_handle: initialStore.tiktok_handle || "",
				snapchat_handle: initialStore.snapchat_handle || "",
				contact_email: initialStore.contact_email || "",
				marketing_email: initialStore.marketing_email || "",
				contact_phone: initialStore.contact_phone || "",
				website_url: initialStore.website_url || "",
				business_address: initialStore.business_address || "",
				return_policy: initialStore.return_policy || "",
				shipping_policy: initialStore.shipping_policy || "",
			});
			setAvatarPreview(initialStore.store_avatar_url || "");
			setBannerPreview(initialStore.store_banner_url || "");
		}
	}, [open, initialStore]);

	// ─── Upload Image ──────────────────────────────────────────
	const uploadImage = useCallback(
		async (file: File): Promise<string | null> => {
			if (file.size > 2 * 1024 * 1024) {
				setError("Image must be less than 2MB");
				return null;
			}

			const allowedTypes = [
				"image/jpeg",
				"image/png",
				"image/webp",
				"image/gif",
			];
			if (!allowedTypes.includes(file.type)) {
				setError("Only JPEG, PNG, WebP, and GIF are allowed");
				return null;
			}

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

				return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/marketplace-public/${ticket.storagePath}`;
			} catch (err: any) {
				setError(err.message || "Failed to upload image");
				return null;
			}
		},
		[],
	);

	// ─── Handle Avatar Upload ─────────────────────────────────
	const handleAvatarUpload = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			setLoading(true);
			setError(null);

			const url = await uploadImage(file);
			if (url) {
				setAvatarPreview(url);
				setStoreData((prev) => ({ ...prev, store_avatar_url: url }));
			}

			setLoading(false);
			e.target.value = "";
		},
		[uploadImage],
	);

	// ─── Handle Banner Upload ─────────────────────────────────
	const handleBannerUpload = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			setLoading(true);
			setError(null);

			const url = await uploadImage(file);
			if (url) {
				setBannerPreview(url);
				setStoreData((prev) => ({ ...prev, store_banner_url: url }));
			}

			setLoading(false);
			e.target.value = "";
		},
		[uploadImage],
	);

	// ─── Save Settings ─────────────────────────────────────────
	const handleSave = useCallback(async () => {
		setSaving(true);
		setError(null);
		setSuccess(false);

		try {
			const { error: updateError } = await supabase
				.from("global_market_stores")
				.update({
					store_avatar_url: storeData.store_avatar_url,
					store_banner_url: storeData.store_banner_url,
					business_name: storeData.business_name,
					store_description: storeData.store_description,
					about_store: storeData.about_store,
					tiktok_handle: storeData.tiktok_handle,
					snapchat_handle: storeData.snapchat_handle,
					contact_email: storeData.contact_email,
					marketing_email: storeData.marketing_email,
					contact_phone: storeData.contact_phone,
					website_url: storeData.website_url,
					business_address: storeData.business_address,
					return_policy: storeData.return_policy,
					shipping_policy: storeData.shipping_policy,
					updated_at: new Date().toISOString(),
				})
				.eq("user_id", userId);

			if (updateError) {
				throw new Error(updateError.message);
			}

			setSuccess(true);
			onSave();
			setTimeout(() => {
				setSuccess(false);
				onClose();
			}, 1500);
		} catch (err: any) {
			setError(err.message || "Failed to save store settings");
		} finally {
			setSaving(false);
		}
	}, [userId, storeData, onSave, onClose]);

	// ─── Remove Avatar ─────────────────────────────────────────
	const removeAvatar = useCallback(() => {
		setAvatarPreview("");
		setStoreData((prev) => ({ ...prev, store_avatar_url: "" }));
	}, []);

	// ─── Remove Banner ─────────────────────────────────────────
	const removeBanner = useCallback(() => {
		setBannerPreview("");
		setStoreData((prev) => ({ ...prev, store_banner_url: "" }));
	}, []);

	// ─── Don't render if not open ─────────────────────────────
	if (!open) return null;

	// ─── Render ────────────────────────────────────────────────
	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-200">
			{/* ─── Backdrop ────────────────────────────────────────── */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-md"
				onClick={onClose}
			/>

			{/* ─── Modal ───────────────────────────────────────────── */}
			<div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl mx-4">
				<div className="sticky top-0 bg-zinc-950/95 backdrop-blur-md border-b border-white/10 p-5 flex items-center justify-between z-10 rounded-t-3xl">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
							<Settings className="h-5 w-5 text-emerald-400" />
						</div>
						<div>
							<h2 className="text-base font-bold text-white tracking-tight">
								Store Settings
							</h2>
							<p className="text-[10px] text-zinc-500 font-medium">
								Manage your storefront appearance and information
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="p-6 space-y-6">
					{/* ─── Success Message ───────────────────────────────── */}
					{success && (
						<div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2 animate-in fade-in duration-200">
							<CheckCircle2 className="h-4 w-4" />
							Store settings saved successfully!
						</div>
					)}

					{/* ─── Error Message ─────────────────────────────────── */}
					{error && (
						<div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-in fade-in duration-200">
							<AlertCircle className="h-4 w-4" />
							{error}
						</div>
					)}

					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSave();
						}}
						className="space-y-6"
					>
						{/* ─── SECTION: Store Branding ─────────────────────── */}
						<div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-5">
							<h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
								<Camera className="h-3.5 w-3.5" />
								Store Branding
							</h3>

							{/* Avatar */}
							<div className="space-y-2">
								<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
									Store Avatar
								</Label>
								<div className="flex items-center gap-4">
									<Avatar className="h-20 w-20 rounded-2xl border-2 border-white/10">
										{avatarPreview ? (
											<AvatarImage src={avatarPreview} />
										) : (
											<AvatarFallback className="bg-zinc-800 text-2xl text-zinc-400">
												<Store className="h-8 w-8" />
											</AvatarFallback>
										)}
									</Avatar>

									<div className="flex-1 space-y-1.5">
										<div className="flex items-center gap-2">
											<input
												type="file"
												ref={avatarInputRef}
												accept="image/*"
												onChange={handleAvatarUpload}
												className="hidden"
											/>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => avatarInputRef.current?.click()}
												disabled={loading}
												className="h-8 border-white/10 text-zinc-300 hover:text-white text-xs"
											>
												{loading ? (
													<Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
												) : (
													<Camera className="h-3.5 w-3.5 mr-1" />
												)}
												Upload
											</Button>
											{avatarPreview && (
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={removeAvatar}
													className="h-8 text-red-400 hover:text-red-300 text-xs"
												>
													<X className="h-3.5 w-3.5 mr-1" />
													Remove
												</Button>
											)}
										</div>
										<p className="text-[9px] text-zinc-600">
											JPEG, PNG, WebP, GIF · Max 2MB · Recommended: 200x200
										</p>
									</div>
								</div>
							</div>

							{/* Banner */}
							<div className="space-y-2">
								<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
									Store Banner
								</Label>
								<div className="space-y-2">
									{bannerPreview ? (
										<div className="relative rounded-xl overflow-hidden border border-white/10 h-32 bg-zinc-900">
											<img
												src={bannerPreview}
												alt="Store Banner"
												className="w-full h-full object-cover"
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={removeBanner}
												className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white h-7 w-7 p-0 rounded-full"
											>
												<X className="h-3.5 w-3.5" />
											</Button>
										</div>
									) : (
										<div className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20 hover:border-zinc-700 transition-colors">
											<input
												type="file"
												ref={bannerInputRef}
												accept="image/*"
												onChange={handleBannerUpload}
												className="hidden"
											/>
											<Button
												type="button"
												variant="ghost"
												onClick={() => bannerInputRef.current?.click()}
												disabled={loading}
												className="text-zinc-400 hover:text-white"
											>
												{loading ? (
													<Loader2 className="h-4 w-4 animate-spin mr-2" />
												) : (
													<ImageIcon className="h-4 w-4 mr-2" />
												)}
												Upload Banner Image
											</Button>
											<p className="text-[9px] text-zinc-600">
												JPEG, PNG, WebP, GIF · Max 2MB · Recommended: 1200x300
											</p>
										</div>
									)}
								</div>
							</div>

							{/* Business Name */}
							<div className="space-y-1.5">
								<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
									Business Name
								</Label>
								<Input
									value={storeData.business_name}
									onChange={(e) =>
										setStoreData((prev) => ({
											...prev,
											business_name: e.target.value,
										}))
									}
									className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl"
									placeholder="Your store name"
								/>
							</div>

							{/* Store Description */}
							<div className="space-y-1.5">
								<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
									Store Description
								</Label>
								<Textarea
									value={storeData.store_description}
									onChange={(e) =>
										setStoreData((prev) => ({
											...prev,
											store_description: e.target.value,
										}))
									}
									className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl resize-none"
									rows={2}
									placeholder="Brief description of your store"
								/>
							</div>

							{/* About Store */}
							<div className="space-y-1.5">
								<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
									About Store
								</Label>
								<Textarea
									value={storeData.about_store}
									onChange={(e) =>
										setStoreData((prev) => ({
											...prev,
											about_store: e.target.value,
										}))
									}
									className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl resize-none"
									rows={3}
									placeholder="Tell buyers about your store, your story, and what you offer..."
								/>
							</div>
						</div>

						{/* ─── SECTION: Contact Information ────────────────── */}
						<div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
							<h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
								<User className="h-3.5 w-3.5" />
								Contact Information
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
										<Mail className="h-3 w-3" />
										Contact Email
									</Label>
									<Input
										value={storeData.contact_email}
										onChange={(e) =>
											setStoreData((prev) => ({
												...prev,
												contact_email: e.target.value,
											}))
										}
										className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl"
										placeholder="contact@yourstore.com"
										type="email"
									/>
								</div>

								<div className="space-y-1.5">
									<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
										<Mail className="h-3 w-3" />
										Marketing Email
									</Label>
									<Input
										value={storeData.marketing_email}
										onChange={(e) =>
											setStoreData((prev) => ({
												...prev,
												marketing_email: e.target.value,
											}))
										}
										className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl"
										placeholder="marketing@yourstore.com"
										type="email"
									/>
								</div>

								<div className="space-y-1.5">
									<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
										<Phone className="h-3 w-3" />
										Phone Number
									</Label>
									<Input
										value={storeData.contact_phone}
										onChange={(e) =>
											setStoreData((prev) => ({
												...prev,
												contact_phone: e.target.value,
											}))
										}
										className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl"
										placeholder="+1 (555) 000-0000"
									/>
								</div>

								<div className="space-y-1.5">
									<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
										<Globe className="h-3 w-3" />
										Website
									</Label>
									<Input
										value={storeData.website_url}
										onChange={(e) =>
											setStoreData((prev) => ({
												...prev,
												website_url: e.target.value,
											}))
										}
										className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl"
										placeholder="https://yourwebsite.com"
									/>
								</div>

								<div className="space-y-1.5 md:col-span-2">
									<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
										<MapPin className="h-3 w-3" />
										Business Address
									</Label>
									<Input
										value={storeData.business_address}
										onChange={(e) =>
											setStoreData((prev) => ({
												...prev,
												business_address: e.target.value,
											}))
										}
										className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl"
										placeholder="123 Main St, City, Country"
									/>
								</div>
							</div>
						</div>

						{/* ─── SECTION: Social Handles ─────────────────────── */}
						<div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
							<h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
								<Globe className="h-3.5 w-3.5" />
								Social Handles
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
										TikTok Handle
									</Label>
									<Input
										value={storeData.tiktok_handle}
										onChange={(e) =>
											setStoreData((prev) => ({
												...prev,
												tiktok_handle: e.target.value,
											}))
										}
										className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl"
										placeholder="@yourhandle"
									/>
								</div>

								<div className="space-y-1.5">
									<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
										Snapchat Handle
									</Label>
									<Input
										value={storeData.snapchat_handle}
										onChange={(e) =>
											setStoreData((prev) => ({
												...prev,
												snapchat_handle: e.target.value,
											}))
										}
										className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl"
										placeholder="@yourhandle"
									/>
								</div>
							</div>
						</div>

						{/* ─── SECTION: Store Policies ─────────────────────── */}
						<div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
							<h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
								<Shield className="h-3.5 w-3.5" />
								Store Policies
							</h3>

							<div className="space-y-1.5">
								<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
									Return Policy
								</Label>
								<Textarea
									value={storeData.return_policy}
									onChange={(e) =>
										setStoreData((prev) => ({
											...prev,
											return_policy: e.target.value,
										}))
									}
									className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl resize-none"
									rows={3}
									placeholder="Describe your return policy..."
								/>
							</div>

							<div className="space-y-1.5">
								<Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
									Shipping / Delivery Policy
								</Label>
								<Textarea
									value={storeData.shipping_policy}
									onChange={(e) =>
										setStoreData((prev) => ({
											...prev,
											shipping_policy: e.target.value,
										}))
									}
									className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl resize-none"
									rows={3}
									placeholder="Describe your shipping or digital delivery policy..."
								/>
							</div>
						</div>

						{/* ─── Actions ──────────────────────────────────────── */}
						<div className="flex items-center gap-4 pt-2 border-t border-white/5">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								className="border-white/10 text-zinc-400 hover:text-white"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={saving}
								className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm h-11 rounded-xl"
							>
								{saving ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin mr-2" />
										Saving...
									</>
								) : (
									<>
										<CheckCircle2 className="h-4 w-4 mr-2" />
										Save Settings
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
