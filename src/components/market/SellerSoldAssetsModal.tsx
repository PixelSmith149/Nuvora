// components/market/SellerSoldAssetsModal.tsx

"use client";

import {
	Calendar,
	DollarSign,
	Layers,
	Loader2,
	Package,
	ShoppingBag,
	User,
	Users,
	X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SellerSoldAssetsModalProps {
	open: boolean;
	onClose: () => void;
	sellerId: string;
}

export function SellerSoldAssetsModal({
	open,
	onClose,
	sellerId,
}: SellerSoldAssetsModalProps) {
	const [orders, setOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!open || !sellerId) return;

		async function fetchSoldAssets() {
			setLoading(true);
			try {
				const response = await fetch(`/api/orders/seller`);
				if (response.ok) {
					const data = await response.json();
					setOrders(data.orders || []);
				}
			} catch (err) {
			} finally {
				setLoading(false);
			}
		}

		fetchSoldAssets();
	}, [open, sellerId]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-200">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-md"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl">
				{/* Header */}
				<div className="sticky top-0 bg-zinc-950/95 backdrop-blur-md border-b border-white/10 p-5 flex items-center justify-between rounded-t-3xl z-10">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
							<ShoppingBag className="h-5 w-5 text-emerald-400" />
						</div>
						<div>
							<h2 className="text-base font-bold text-white tracking-tight">
								Sold Assets
							</h2>
							<p className="text-[10px] text-zinc-500 font-medium">
								{orders.length} {orders.length === 1 ? "sale" : "sales"}
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Content */}
				<div className="p-5 space-y-3">
					{loading ? (
						<div className="flex flex-col items-center justify-center py-12 gap-3">
							<Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
							<p className="text-xs text-zinc-500 font-medium">
								Loading sold assets...
							</p>
						</div>
					) : orders.length === 0 ? (
						<div className="text-center py-12">
							<ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
							<p className="text-sm font-semibold text-zinc-400">
								No sales yet
							</p>
							<p className="text-xs text-zinc-600 mt-1">
								Your sold assets will appear here once you make your first sale.
							</p>
						</div>
					) : (
						orders.map((order) => {
							const listing = order.market_listings;
							const buyer = order.profiles;

							const getTypeIcon = () => {
								if (listing?.tab_category === "socio_market")
									return <Users className="h-4 w-4" />;
								if (listing?.product_sale_type === "one_time")
									return <Package className="h-4 w-4" />;
								return <Layers className="h-4 w-4" />;
							};

							return (
								<div
									key={order.id}
									className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 space-y-3"
								>
									<div className="flex items-center gap-4">
										{/* Thumbnail */}
										<div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
											{listing?.display_pic_url ? (
												<img
													src={listing.display_pic_url}
													alt={listing.title}
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													{getTypeIcon()}
												</div>
											)}
										</div>

										{/* Details */}
										<div className="flex-1 min-w-0">
											<p className="text-sm font-bold text-white truncate">
												{listing?.title || "Unknown Asset"}
											</p>
											<div className="flex items-center gap-3 text-xs text-zinc-400">
												<span className="flex items-center gap-1">
													<User className="h-3 w-3" />
													{buyer?.display_name ||
														buyer?.username ||
														"Unknown Buyer"}
												</span>
												<span className="flex items-center gap-1">
													<DollarSign className="h-3 w-3" />$
													{order.amount_paid.toFixed(2)}
												</span>
												<span className="flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													{new Date(order.purchased_at).toLocaleDateString()}
												</span>
											</div>
										</div>

										<Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">
											Sold
										</Badge>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
}
