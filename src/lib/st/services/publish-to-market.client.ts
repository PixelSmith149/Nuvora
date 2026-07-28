// lib/st/services/publish-to-market.client.ts
"use client";

export interface PublishResult {
	success: boolean;
	listingId?: string;
	needStore?: boolean;
	needVerification?: boolean;
	error?: string;
}

export async function publishToGlobalMarketClient(
	templateId: string,
	userId: string,
): Promise<PublishResult> {
	try {
		const response = await fetch("/api/st/t-a/publish-to-market", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ templateId, userId }),
		});

		const data = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: data.error || "Failed to publish to Global Market",
			};
		}

		return data;
	} catch (error: any) {
		return {
			success: false,
			error: error.message || "An unexpected error occurred",
		};
	}
}

export async function unpublishFromGlobalMarketClient(
	listingId: string,
	userId: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await fetch("/api/st/t-a/unpublish-from-market", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ listingId, userId }),
		});

		const data = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: data.error || "Failed to unpublish from Global Market",
			};
		}

		return data;
	} catch (error: any) {
		return {
			success: false,
			error: error.message || "An unexpected error occurred",
		};
	}
}

export async function getUserStoreStatusClient(userId: string): Promise<{
	hasStore: boolean;
	isVerified: boolean;
	storeId?: string;
	username?: string;
}> {
	try {
		const response = await fetch("/api/st/user/store-status", {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});

		const data = await response.json();

		if (!response.ok) {
			return { hasStore: false, isVerified: false };
		}

		return data;
	} catch (error) {
		return { hasStore: false, isVerified: false };
	}
}
