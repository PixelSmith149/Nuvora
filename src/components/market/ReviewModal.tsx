// components/market/ReviewModal.tsx

"use client";

import { Loader2, Star, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewModalProps {
	open: boolean;
	onClose: () => void;
	orderId: string;
	assetTitle: string;
	onSubmit: (
		orderId: string,
		rating: number,
		reviewText: string,
	) => Promise<void>;
}

export function ReviewModal({
	open,
	onClose,
	orderId,
	assetTitle,
	onSubmit,
}: ReviewModalProps) {
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [reviewText, setReviewText] = useState("");
	const [loading, setLoading] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	if (!open) return null;

	// ReviewModal.tsx - Add debounce to submit

	const handleSubmit = async () => {
		if (rating === 0 || loading) return;

		setLoading(true);
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

			const result = await response.json();

			// ✅ Check for duplicate error
			if (result.duplicate || result.exists) {
				setSubmitted(true);
				onSubmit(orderId, rating, reviewText);
				return;
			}

			if (response.ok) {
				setSubmitted(true);
				onSubmit(orderId, rating, reviewText);
			} else {
				alert(result.error || "Failed to submit review");
			}
		} catch (err) {
			alert("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	if (submitted) {
		return (
			<div className="fixed inset-0 z-[300] flex items-center justify-center animate-in fade-in duration-200">
				<div
					className="absolute inset-0 bg-black/80 backdrop-blur-md"
					onClick={onClose}
				/>
				<div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl p-6 text-center">
					<div className="text-4xl mb-4">⭐</div>
					<h3 className="text-lg font-bold text-white">Review Submitted!</h3>
					<p className="text-sm text-zinc-400 mt-2">
						Thank you for your feedback on "{assetTitle}"
					</p>
					<Button
						onClick={onClose}
						className="mt-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl"
					>
						Done
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-[300] flex items-center justify-center animate-in fade-in duration-200">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-md"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative w-full max-w-md mx-4 bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl p-6 space-y-4">
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors"
				>
					<X className="h-4 w-4" />
				</button>

				{/* Header */}
				<div className="text-center">
					<h3 className="text-lg font-bold text-white">Leave a Review</h3>
					<p className="text-xs text-zinc-400 mt-1">
						How was your experience with "{assetTitle}"?
					</p>
				</div>

				{/* Rating */}
				<div className="flex justify-center gap-2 py-2">
					{[1, 2, 3, 4, 5].map((star) => (
						<button
							key={star}
							onClick={() => setRating(star)}
							onMouseEnter={() => setHoverRating(star)}
							onMouseLeave={() => setHoverRating(0)}
							className="transition-transform hover:scale-110"
						>
							<Star
								className={`h-8 w-8 ${
									star <= (hoverRating || rating)
										? "fill-amber-400 text-amber-400"
										: "text-zinc-600"
								} transition-colors`}
							/>
						</button>
					))}
				</div>

				{/* Review Text */}
				<div>
					<Textarea
						value={reviewText}
						onChange={(e) => setReviewText(e.target.value)}
						placeholder="Tell others about your experience with this asset..."
						className="bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl resize-none h-24"
					/>
				</div>

				{/* Actions */}
				<div className="flex gap-2 pt-2">
					<Button
						onClick={handleSubmit}
						disabled={rating === 0 || loading}
						className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl h-10"
					>
						{loading ? (
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
						) : (
							"Submit Review"
						)}
					</Button>
					<Button
						variant="ghost"
						onClick={onClose}
						className="text-zinc-400 hover:text-white"
					>
						Skip
					</Button>
				</div>
			</div>
		</div>
	);
}
