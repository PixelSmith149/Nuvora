"use client";

import { useEffect, useMemo, useState } from "react";
import { createOrder } from "@/lib/orders/createOrder";

import { previewOrderCost } from "@/lib/services/getMarketplaceServices";
import type { MarketplaceService } from "./service-catalog";

interface OrderSheetProps {
	open: boolean;
	service: MarketplaceService | null;
	onClose: () => void;
	onSuccess?: () => void;
}

interface CostPreview {
	quantity: number;
	providerCost: number;
	retailCost: number;
	profit: number;
}

interface RowProps {
	label: string;
	value: string;
}

function Row({ label, value }: RowProps) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-sm text-zinc-400">{label}</span>
			<span className="font-medium text-white">{value}</span>
		</div>
	);
}

export function OrderSheet({
	open,
	service,
	onClose,
	onSuccess,
}: OrderSheetProps) {
	const [link, setLink] = useState("");
	const [quantity, setQuantity] = useState("");
	const [preview, setPreview] = useState<CostPreview | null>(null);
	const [loadingPreview, setLoadingPreview] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Added visual highlight flags for invalid inputs
	const [highlightLink, setHighlightLink] = useState(false);
	const [highlightQuantity, setHighlightQuantity] = useState(false);

	const quantityNumber = useMemo(() => Number(quantity || 0), [quantity]);

	useEffect(() => {
		if (!service) return;

		if (
			quantityNumber < service.minQuantity ||
			quantityNumber > service.maxQuantity
		) {
			setPreview(null);
			return;
		}

		let active = true;

		async function loadPreview() {
			try {
				setLoadingPreview(true);

				if (!service) return;

				const result = await previewOrderCost(service.id, quantityNumber);

				if (!active) return;

				setPreview({
					quantity: result.quantity,
					retailCost: result.amount,
					providerCost: 0,
					profit: 0,
				});
			} catch {
				if (!active) return;

				setPreview(null);
			} finally {
				if (active) setLoadingPreview(false);
			}
		}

		loadPreview();

		return () => {
			active = false;
		};
	}, [quantityNumber, service]);

	useEffect(() => {
		if (!open) {
			setLink("");
			setQuantity("");
			setPreview(null);
			setError(null);
			setHighlightLink(false);
			setHighlightQuantity(false);
		}
	}, [open]);

	if (!open || !service) return null;

	async function handleSubmit() {
		try {
			if (!service) return;

			setError(null);
			setHighlightLink(false);
			setHighlightQuantity(false);

			let hasValidationErrors = false;
			let validationMessage = "";

			// 🎯 Link and Handle format validation regex pattern
			const trimmedLink = link.trim();
			const isValidLinkOrHandle =
				/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?.*$/i.test(
					trimmedLink,
				) ||
				/^@[\w.-]+$/.test(trimmedLink) ||
				trimmedLink.length >= 4; // Absolute minimum length safety floor for fallback tracking IDs

			// Enhanced Link Validation
			if (!trimmedLink) {
				setHighlightLink(true);
				hasValidationErrors = true;
				validationMessage =
					"Please fill out all necessary fields with valid details before continuing.";
			} else if (!isValidLinkOrHandle) {
				setHighlightLink(true);
				hasValidationErrors = true;
				validationMessage =
					"The target link provided appears invalid. Please input a valid URL or platform handle.";
			}

			// Quantity Validation
			if (
				!quantity ||
				quantityNumber < service.minQuantity ||
				quantityNumber > service.maxQuantity
			) {
				setHighlightQuantity(true);
				hasValidationErrors = true;
				if (!validationMessage) {
					validationMessage =
						"Please fill out all necessary fields with valid details before continuing.";
				}
			}

			if (hasValidationErrors) {
				setError(validationMessage);
				return;
			}

			setSubmitting(true);

			await createOrder({
				serviceId: service.id,
				quantity: quantityNumber,
				target: trimmedLink,
			});

			onSuccess?.();
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create order.");
		} finally {
			setSubmitting(false);
		}
	}
	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Sheet */}
			<div className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-xl flex-col border-l border-zinc-800 bg-black">
				{/* Header */}
				<div className="border-b border-zinc-800 p-6">
					<h2 className="text-xl font-semibold text-white">Create Order</h2>
					<p className="mt-2 text-sm text-zinc-400">{service.name}</p>
				</div>

				{/* Content */}
				<div className="flex-1 space-y-6 overflow-y-auto p-6">
					{/* URL */}
					<div>
						<label className="mb-2 block text-sm text-zinc-400">
							Target Link
						</label>
						<input
							value={link}
							onChange={(e) => {
								setLink(e.target.value);
								if (e.target.value.trim()) setHighlightLink(false);
							}}
							placeholder="https://...com@primeboost"
							className={`w-full rounded-2xl border bg-zinc-950 px-4 py-3 text-white outline-none transition-all duration-200 ${
								highlightLink
									? "border-amber-500 ring-2 ring-amber-500/20"
									: "border-zinc-800 focus:border-zinc-600"
							}`}
						/>
					</div>

					{/* Quantity */}
					<div>
						<label className="mb-2 block text-sm text-zinc-400">Quantity</label>
						<input
							type="number"
							value={quantity}
							onChange={(e) => {
								setQuantity(e.target.value);
								if (e.target.value) setHighlightQuantity(false);
							}}
							min={service.minQuantity}
							max={service.maxQuantity}
							className={`w-full rounded-2xl border bg-zinc-950 px-4 py-3 text-white outline-none transition-all duration-200 ${
								highlightQuantity
									? "border-amber-500 ring-2 ring-amber-500/20"
									: "border-zinc-800 focus:border-zinc-600"
							}`}
						/>
						<p className="mt-2 text-xs text-zinc-500">
							Min: {service.minQuantity.toLocaleString()} • Max:{" "}
							{service.maxQuantity.toLocaleString()}
						</p>
					</div>

					{/* Pricing Preview */}
					<div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
						<h3 className="mb-4 font-medium text-white">Cost Preview</h3>

						{loadingPreview ? (
							<p className="text-sm text-zinc-400">Calculating...</p>
						) : preview ? (
							<div className="space-y-3">
								<Row label="Quantity" value={String(preview.quantity)} />
								<Row
									label="Total Cost"
									value={`$${preview.retailCost.toFixed(2)}`}
								/>
							</div>
						) : (
							<p className="text-sm text-zinc-500">
								Please enter a valid quantity.
							</p>
						)}
					</div>

					{/* Beautiful Amber Missing Details Notice */}
					{error && (
						<div
							className={`rounded-2xl border p-4 text-sm flex items-start gap-3 transition-all duration-300 ${
								error.includes("fill out all necessary fields")
									? "border-amber-500/30 bg-amber-500/5 text-amber-300"
									: "border-red-900 bg-red-950/50 text-red-300"
							}`}
						>
							{error.includes("fill out all necessary fields") && (
								<svg
									className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 animate-pulse"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
							)}
							<span className="leading-relaxed font-medium">{error}</span>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="border-t border-zinc-800 p-6">
					<button
						type="button"
						onClick={handleSubmit}
						disabled={submitting}
						className="w-full rounded-2xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
					>
						{submitting ? "Creating Order..." : "Create Order"}
					</button>
				</div>
			</div>
		</>
	);
}
