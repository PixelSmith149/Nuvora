// components/market/FollowPromptModal.tsx

"use client";

import { Loader2, UserPlus, X } from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface FollowPromptModalProps {
	open: boolean;
	onClose: () => void;
	sellerId: string;
	sellerName: string;
	sellerAvatar?: string | null;
	onFollowComplete: () => Promise<void>;
}

export function FollowPromptModal({
	open,
	onClose,
	sellerId,
	sellerName,
	sellerAvatar,
	onFollowComplete,
}: FollowPromptModalProps) {
	const [loading, setLoading] = useState(false);

	if (!open) return null;

	const handleFollowAndPurchase = async () => {
		setLoading(true);

		try {
			const response = await fetch("/api/social/follow", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ target_user_id: sellerId }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to follow seller");
			}

			await onFollowComplete();
			onClose();
		} catch (err: any) {
			alert(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-200">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-md"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl p-6 space-y-5">
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors"
				>
					<X className="h-4 w-4" />
				</button>

				{/* Content */}
				<div className="text-center space-y-4">
					<div className="flex justify-center">
						<Avatar className="w-16 h-16 rounded-2xl border-2 border-emerald-500/20">
							{sellerAvatar ? (
								<AvatarImage src={sellerAvatar} />
							) : (
								<AvatarFallback className="bg-zinc-800 text-2xl text-zinc-400">
									{sellerName?.[0] || "S"}
								</AvatarFallback>
							)}
						</Avatar>
					</div>

					<div>
						<h3 className="text-lg font-bold text-white">Follow to Purchase</h3>
						<p className="text-sm text-zinc-400 mt-1">
							You need to follow{" "}
							<span className="text-white font-semibold">{sellerName}</span>{" "}
							before you can make a purchase.
						</p>
					</div>

					<div className="flex flex-col gap-3 pt-2">
						<Button
							onClick={handleFollowAndPurchase}
							disabled={loading}
							className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl h-11"
						>
							{loading ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : (
								<UserPlus className="h-4 w-4 mr-2" />
							)}
							Follow & Continue
						</Button>

						<Button
							variant="ghost"
							onClick={onClose}
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
