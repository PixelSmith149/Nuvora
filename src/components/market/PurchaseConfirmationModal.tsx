"use client";

import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	Loader2,
	Shield,
	X,
	Zap,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/use-toast";

interface PurchaseConfirmationModalProps {
	open: boolean;
	onClose: () => void;
	listing: any;
	sellerName: string;
	sellerAvatar?: string | null;
	onConfirm: () => Promise<{ success: boolean; error?: string } | void>;
}

export function PurchaseConfirmationModal({
	open,
	onClose,
	listing,
	sellerName,
	sellerAvatar,
	onConfirm,
}: PurchaseConfirmationModalProps) {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!open) return null;

	const handleConfirm = async () => {
		if (loading) return;
		setLoading(true);
		setError(null);

		try {
			const result = await onConfirm();

			// Handle both old void and new object return
			if (result && typeof result === "object" && result.success === false) {
				throw new Error(result.error || "Purchase failed");
			}

			setSuccess(true);

			setTimeout(() => {
				const currentPath = window.location.pathname;
				const searchParams = new URLSearchParams(window.location.search);
				searchParams.set("view", "locker");
				const newUrl = `${currentPath}?${searchParams.toString()}`;
				window.location.href = newUrl;
			}, 1500);
		} catch (error: any) {
			console.warn("Purchase failed:", error.message);
			setError(error.message || "Purchase failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		if (error) {
			setError(null);
			setLoading(false);
			onClose();
			return;
		}

		if (!loading) {
			onClose();
		}
	};

	// ─── ERROR STATE ──────────────────────────────────────────────
	if (error) {
		return (
			<div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-200">
				<div
					className="absolute inset-0 bg-black/80 backdrop-blur-md"
					onClick={handleClose}
				/>
				<div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
					<div className="p-8 text-center space-y-4">
						<div className="flex justify-center">
							<div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
								<AlertTriangle className="h-12 w-12 text-red-400" />
							</div>
						</div>

						<h3 className="text-xl font-bold text-white">Purchase Failed ❌</h3>

						<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
							{error}
						</div>

						<p className="text-xs text-zinc-500">
							Please check your balance and try again.
						</p>

						<Button
							onClick={() => {
								setError(null); // ← Clear error
								onClose(); // ← NOW close the modal
							}}
							className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 rounded-xl"
						>
							Close
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// ─── SUCCESS STATE ──────────────────────────────────────────
	if (success) {
		return (
			<div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-200">
				<div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
				<div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
					<div className="p-8 text-center space-y-4">
						<div className="flex justify-center">
							<div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
								<CheckCircle2 className="h-12 w-12 text-emerald-400" />
							</div>
						</div>

						<h3 className="text-xl font-bold text-white">
							Purchase Successful! 🎉
						</h3>

						<p className="text-sm text-zinc-400">
							Your asset has been delivered to your locker.
						</p>

						<div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 text-left space-y-1">
							<p className="text-xs text-zinc-500">Asset</p>
							<p className="text-sm font-medium text-white truncate">
								{listing?.title}
							</p>
							<p className="text-xs text-emerald-400 mt-2">
								⏳ Redirecting to your locker...
							</p>
						</div>

						<Button
							onClick={() => {
								setSuccess(false);
								onClose();
							}}
							className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 rounded-xl"
						>
							Close
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// ─── LOADING STATE ──────────────────────────────────────────
	if (loading) {
		return (
			<div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-200">
				<div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
				<div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
					<div className="p-8 text-center space-y-4">
						<div className="flex justify-center">
							<Loader2 className="h-12 w-12 animate-spin text-emerald-400" />
						</div>
						<h3 className="text-xl font-bold text-white">
							Processing Purchase...
						</h3>
						<p className="text-sm text-zinc-400">
							Please wait while we securely process your transaction.
						</p>
						<div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4">
							<div className="flex items-center justify-between text-xs text-zinc-400">
								<span>🔒 Securing payment</span>
								<span className="animate-pulse">•••</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// ─── CONFIRMATION STATE ──────────────────────────────────────
	return (
		<div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-200">
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-md"
				onClick={handleClose}
			/>

			<div className="relative w-full max-w-lg mx-4 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
				<button
					onClick={handleClose}
					className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors z-10"
				>
					<X className="h-4 w-4" />
				</button>

				<div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 p-6 border-b border-white/5">
					<h3 className="text-lg font-bold text-white text-center">
						Confirm Purchase
					</h3>
					<p className="text-xs text-zinc-400 text-center mt-1">
						Review the details before confirming your purchase
					</p>
				</div>

				<div className="p-6 space-y-4">
					<div className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
						<div className="w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
							{listing?.display_pic_url ? (
								<img
									src={listing.display_pic_url}
									alt={listing.title}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<span className="text-2xl">📦</span>
								</div>
							)}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-bold text-white truncate">
								{listing?.title}
							</p>
							<p className="text-xs text-zinc-400 truncate">
								{listing?.description || "No description"}
							</p>
							<div className="flex items-center gap-2 mt-1">
								<Badge className="bg-zinc-800 text-zinc-300 text-[9px]">
									{listing?.tab_category?.replace("_", " ") || "Product"}
								</Badge>
								<Badge className="bg-zinc-800 text-zinc-300 text-[9px]">
									{listing?.product_sale_type?.replace("_", " ") || "Standard"}
								</Badge>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/30 border border-white/5">
						<Avatar className="h-8 w-8 rounded-lg">
							{sellerAvatar ? (
								<AvatarImage src={sellerAvatar} />
							) : (
								<AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
									{sellerName?.[0] || "S"}
								</AvatarFallback>
							)}
						</Avatar>
						<div className="flex-1 min-w-0">
							<p className="text-xs font-medium text-white truncate">
								{sellerName}
							</p>
							<p className="text-[10px] text-zinc-500">Seller</p>
						</div>
						<Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">
							Verified
						</Badge>
					</div>

					<div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-zinc-900/30 border border-white/5">
						<div className="text-center">
							<p className="text-[9px] text-zinc-500 uppercase tracking-wider">
								Price
							</p>
							<p className="text-sm font-black text-emerald-400">
								${listing?.price?.toFixed(2) || "0.00"}
							</p>
						</div>
						<div className="text-center border-x border-white/5">
							<p className="text-[9px] text-zinc-500 uppercase tracking-wider">
								Delivery
							</p>
							<div className="flex items-center justify-center gap-1 text-xs text-zinc-300">
								<Clock className="h-3 w-3 text-emerald-400" />
								Instant
							</div>
						</div>
						<div className="text-center">
							<p className="text-[9px] text-zinc-500 uppercase tracking-wider">
								Guarantee
							</p>
							<div className="flex items-center justify-center gap-1 text-xs text-zinc-300">
								<Shield className="h-3 w-3 text-emerald-400" />
								Escrow
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-2 pt-2">
						<Button
							onClick={handleConfirm}
							className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold rounded-xl h-11"
						>
							Confirm Purchase
						</Button>
						<Button
							variant="ghost"
							onClick={handleClose}
							className="w-full text-zinc-400 hover:text-white"
						>
							Cancel
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
