// components/market/DeliveryConfirmationModal.tsx

"use client";

import {
	CheckCircle2,
	Clock,
	Layers,
	Loader2,
	Package,
	Shield,
	User,
	Users,
	X,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DeliveryConfirmationModalProps {
	open: boolean;
	onClose: () => void;
	order: any;
	listing: any;
	sellerName: string;
	sellerAvatar?: string | null;
	onConfirm: () => Promise<void>;
	onReview: (orderId: string) => void;
}

export function DeliveryConfirmationModal({
	open,
	onClose,
	order,
	listing,
	sellerName,
	sellerAvatar,
	onConfirm,
	onReview,
}: DeliveryConfirmationModalProps) {
	const [loading, setLoading] = useState(false);
	const [confirmed, setConfirmed] = useState(false);

	if (!open) return null;

	const handleConfirm = async () => {
		setLoading(true);
		await onConfirm();
		setLoading(false);
		setConfirmed(true);
	};

	// Determine asset icon
	const getAssetIcon = () => {
		if (listing?.tab_category === "socio_market") {
			return <Users className="h-5 w-5 text-purple-400" />;
		}
		if (listing?.product_sale_type === "one_time") {
			return <Package className="h-5 w-5 text-emerald-400" />;
		}
		return <Layers className="h-5 w-5 text-sky-400" />;
	};

	const getAssetTypeLabel = () => {
		if (listing?.tab_category === "socio_market") return "Social Account";
		if (listing?.product_sale_type === "one_time") return "One-Time Product";
		return "Reusable Tool";
	};

	return (
		<div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-200">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-md"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-lg mx-4 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors z-10"
				>
					<X className="h-4 w-4" />
				</button>

				{/* Header */}
				<div
					className={`p-6 border-b border-white/5 ${confirmed ? "bg-emerald-900/20" : "bg-gradient-to-r from-emerald-900/30 to-teal-900/30"}`}
				>
					<div className="flex items-center gap-3">
						{confirmed ? (
							<CheckCircle2 className="h-6 w-6 text-emerald-400" />
						) : (
							<Shield className="h-6 w-6 text-emerald-400" />
						)}
						<div>
							<h3 className="text-lg font-bold text-white">
								{confirmed ? "✅ Asset Confirmed!" : "Confirm Receipt"}
							</h3>
							<p className="text-xs text-zinc-400">
								{confirmed
									? "Thank you! The seller has been credited."
									: "Confirm that you have received the asset"}
							</p>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="p-6 space-y-4">
					{/* Asset Preview */}
					<div className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
						<div className="w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
							{listing?.display_pic_url ? (
								<img
									src={listing.display_pic_url}
									alt={listing?.title || "Asset"}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center">
									{getAssetIcon()}
								</div>
							)}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-bold text-white truncate">
								{listing?.title || "Unknown Asset"}
							</p>
							<div className="flex items-center gap-2 mt-1">
								<Badge className="bg-zinc-800 text-zinc-300 text-[9px]">
									{getAssetTypeLabel()}
								</Badge>
								<Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">
									${order?.amount_paid?.toFixed(2) || "0.00"}
								</Badge>
							</div>
						</div>
					</div>

					{/* Seller Info */}
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

					{/* Order Details */}
					<div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-900/30 border border-white/5 text-xs">
						<div>
							<p className="text-[9px] text-zinc-500">Order ID</p>
							<p className="text-zinc-300 font-mono text-[10px]">
								{order?.id?.slice(0, 8)}...
							</p>
						</div>
						<div>
							<p className="text-[9px] text-zinc-500">Purchased</p>
							<p className="text-zinc-300">
								{new Date(order?.purchased_at).toLocaleDateString()}
							</p>
						</div>
					</div>

					{/* Actions */}
					{!confirmed ? (
						<div className="flex flex-col gap-2 pt-2">
							<Button
								onClick={handleConfirm}
								disabled={loading}
								className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold rounded-xl h-11"
							>
								{loading ? (
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
								) : (
									"✅ Confirm Receipt"
								)}
							</Button>
							<p className="text-[9px] text-zinc-600 text-center">
								By confirming, you acknowledge that you have received the asset.
								Funds will be released to the seller.
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-2 pt-2">
							<Button
								onClick={() => onReview(order.id)}
								className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl h-11"
							>
								⭐ Leave a Review
							</Button>
							<Button
								variant="ghost"
								onClick={onClose}
								className="w-full text-zinc-400 hover:text-white"
							>
								Close
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
