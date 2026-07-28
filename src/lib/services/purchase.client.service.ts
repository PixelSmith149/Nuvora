// lib/services/purchase.client.service.ts

"use client";

export interface PurchaseResult {
	success: boolean;
	error?: string;
	order_id?: string;
	escrow_id?: string;
}

export async function processPurchaseClient(
	listingId: string,
	buyerId: string,
): Promise<PurchaseResult> {
	try {
		const response = await fetch("/api/purchase/confirm", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				listing_id: listingId,
			}),
		});

		const data = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: data.error || "Purchase failed",
			};
		}

		return {
			success: true,
			order_id: data.order_id,
			escrow_id: data.escrow_id,
		};
	} catch (err) {
		console.error("❌ [processPurchaseClient] Error:", err);
		return {
			success: false,
			error: err instanceof Error ? err.message : "Purchase failed",
		};
	}
}
