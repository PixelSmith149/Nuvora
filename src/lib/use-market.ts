// src/lib/use-market.ts

"use client";

import { useCallback, useEffect, useState } from "react";
import { processPurchaseClient } from "@/lib/services/purchase.client.service";
import supabase from "@/lib/supabase/client";
import type {
	GlobalMarketOrder,
	GlobalMarketStore,
	InboxMessage,
	MarketListing,
	TabCategory,
} from "@/lib/types";

// ============================================================
// TYPES
// ============================================================

export interface SocioMarketMetric {
	id: string;
	listing_id: string;
	platform_name: string;
	target_username: string;
	followers_count: number;
	account_bio: string | null;
	last_verified_sync: string;
	following_count: number | null;
	likes_or_posts_count: number | null;
}

export interface OneTimeDigitalTool {
	id: string;
	listing_id: string | null;
	seller_id: string;
	product_title: string;
	product_description: string | null;
	sale_price: number;
	display_cover_url: string | null;
	storage_vault_path: string;
	file_original_name: string;
	file_size_bytes: number;
	file_mime_type: string;
	created_at: string;
	updated_at: string;
	safety_status: "clean" | "suspicious" | "pending" | null;
	safety_logs: string | null;
	file_checksum: string | null;
	asset_category: string | null;
	asset_type: string | null;
	asset_content: any | null;
	scanned_at: string | null;
}

export interface ReusableDigitalProduct {
	id: string;
	listing_id: string | null;
	seller_id: string;
	asset_category: string;
	product_title: string;
	product_description: string | null;
	usage_guidelines_diy: string | null;
	risk_cautions: string | null;
	sale_price: number;
	display_cover_url: string | null;
	fulfillment_payload: Record<string, unknown>;
	safety_status: "clean" | "flagged" | "pending" | null;
	safety_logs: string | null;
	file_checksum: string | null;
	created_at: string;
	updated_at: string;
}

export interface ListingWithMetrics extends MarketListing {
	socio_metrics: SocioMarketMetric | null;
	one_time_tool: OneTimeDigitalTool | null;
	reusable_product: ReusableDigitalProduct | null;

	profile: {
		display_name: string | null;
		username: string | null;
	} | null;

	store: {
		business_name: string | null;
		about_store: string | null;
		store_description: string | null;
	} | null;
}

interface UseMarketReturn {
	store: GlobalMarketStore | null;
	listings: ListingWithMetrics[];
	orders: GlobalMarketOrder[];
	inbox: InboxMessage[];
	loading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
	completeOnboarding: (data: OnboardingInput) => Promise<boolean>;
	createListing: (data: CreateListingInput) => Promise<MarketListing | null>;
	markInboxRead: (messageId: string) => Promise<void>;
	purchaseListing: (
		listingId: string,
	) => Promise<{ success: boolean; error?: string; order_id?: string }>;
}

export interface OnboardingInput {
	contact_email: string;
	marketing_email: string;
	tiktok_handle: string;
	snapchat_handle: string;
	verification_video_url: string;
}

export interface CreateListingInput {
	title: string;
	description: string;
	display_pic_url: string;
	price: number;
	tab_category: TabCategory;
	product_sale_type: "one_time" | "recurring" | "not_applicable";
	asset_payload: Record<string, unknown>;
	verified_metrics?: {
		platform_name: string;
		username: string;
		followers_count: number;
		following_count: number;
		likes_or_posts_count: number;
		account_bio: string;
	};
}

// ============================================================
// MARKET ROTATION ENGINE
// ============================================================

function hashString(value: string): number {
	let hash = 0;

	for (let i = 0; i < value.length; i++) {
		hash = (hash << 5) - hash + value.charCodeAt(i);
		hash |= 0;
	}

	return Math.abs(hash);
}

function createSeededRandom(seed: number) {
	return () => {
		seed ^= seed << 13;
		seed ^= seed >> 17;
		seed ^= seed << 5;

		return ((seed >>> 0) % 1000000) / 1000000;
	};
}

function shuffleListingsDaily<T extends { id: string }>(items: T[]): T[] {
	const today = new Date().toISOString().slice(0, 10);

	const random = createSeededRandom(hashString(today));

	const shuffled = [...items];

	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));

		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	return shuffled;
}

// ============================================================
// MAIN HOOK IMPLEMENTATION
// ============================================================

export function useMarket(userId: string | null): UseMarketReturn {
	const [store, setStore] = useState<GlobalMarketStore | null>(null);
	const [listings, setListings] = useState<ListingWithMetrics[]>([]);
	const [orders, setOrders] = useState<GlobalMarketOrder[]>([]);
	const [inbox, setInbox] = useState<InboxMessage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const refresh = useCallback(async () => {
		if (!userId) {
			setLoading(false);
			return;
		}

		try {
			const { data: s, error: sErr } = await supabase
				.from("global_market_stores")
				.select("*")
				.eq("user_id", userId)
				.maybeSingle();

			if (sErr) console.warn("⚠️ Store fetch error:", sErr);
			setStore(s as GlobalMarketStore | null);

			const { data: stores } = await supabase
				.from("global_market_stores")
				.select(`
    id,
    business_name,
    about_store,
    store_description
  `);

			const storesMap = new Map(
				(stores ?? []).map((store) => [store.id, store]),
			);

			const { data: profiles } = await supabase.from("profiles").select(`
    id,
    display_name,
    username
  `);

			const profilesMap = new Map(
				(profiles ?? []).map((profile) => [profile.id, profile]),
			);

			const { data: l, error: lErr } = await supabase
				.from("market_listings")
				.select("*");

			if (lErr) {
				console.error("❌ [useMarket] Listings fetch error:", lErr);
				throw lErr;
			}

			const rawListings = (l as MarketListing[]) ?? [];

			const { data: metrics, error: mErr } = await supabase
				.from("socio_market_metrics")
				.select("*");

			if (mErr) console.warn("⚠️ Metrics fetch error:", mErr);
			const metricsMap = new Map<string, SocioMarketMetric>();
			(metrics as SocioMarketMetric[] | null)?.forEach((m) =>
				metricsMap.set(m.listing_id, m),
			);

			const { data: tools, error: tErr } = await supabase
				.from("one_time_digital_tools")
				.select("*");

			if (tErr) console.warn("⚠️ Tools fetch error:", tErr);
			const toolsMap = new Map<string, OneTimeDigitalTool>();
			(tools as OneTimeDigitalTool[] | null)?.forEach((t) => {
				if (t.listing_id) toolsMap.set(t.listing_id, t);
			});

			const { data: products, error: pErr } = await supabase
				.from("reusable_digital_products")
				.select("*");

			if (pErr) console.warn("⚠️ Products fetch error:", pErr);
			const productsMap = new Map<string, ReusableDigitalProduct>();
			(products as ReusableDigitalProduct[] | null)?.forEach((p) => {
				if (p.listing_id) productsMap.set(p.listing_id, p);
			});

			const enriched: ListingWithMetrics[] = rawListings.map((listing) => ({
				...listing,

				socio_metrics: metricsMap.get(listing.id) ?? null,
				one_time_tool: toolsMap.get(listing.id) ?? null,
				reusable_product: productsMap.get(listing.id) ?? null,

				profile: profilesMap.get(listing.seller_id) ?? null,

				store: storesMap.get(listing.store_id) ?? null,
			}));

			setListings(shuffleListingsDaily(enriched));

			const { data: o, error: oErr } = await supabase
				.from("global_market_orders")
				.select("*")
				.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
				.order("purchased_at", { ascending: false });

			if (oErr) console.warn("⚠️ Orders fetch error:", oErr);
			setOrders((o as GlobalMarketOrder[]) ?? []);

			const { data: m, error: inErr } = await supabase
				.from("market_inbox_messages")
				.select("*")
				.eq("user_id", userId)
				.order("created_at", { ascending: false });

			if (inErr) console.warn("⚠️ Inbox fetch error:", inErr);
			setInbox((m as InboxMessage[]) ?? []);
		} catch (e) {
			console.error("❌ [useMarket] Refresh error:", e);
			setError(
				e instanceof Error ? e.message : "Failed to synchronize market data",
			);
		} finally {
			setLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const completeOnboarding = useCallback(
		async (data: OnboardingInput): Promise<boolean> => {
			if (!userId) return false;
			try {
				const { error: upsertErr } = await supabase
					.from("global_market_stores")
					.upsert(
						{
							user_id: userId,
							contact_email: data.contact_email,
							marketing_email: data.marketing_email,
							tiktok_handle: data.tiktok_handle,
							snapchat_handle: data.snapchat_handle,
							verification_video_url: data.verification_video_url,
							is_verified: true,
							updated_at: new Date().toISOString(),
						},
						{ onConflict: "user_id" },
					);
				if (upsertErr) throw upsertErr;
				await refresh();
				return true;
			} catch {
				return false;
			}
		},
		[userId, refresh],
	);

	const createListing = useCallback(
		async (data: CreateListingInput): Promise<MarketListing | null> => {
			if (!userId || !store) return null;
			try {
				const { data: listing, error: lErr } = await supabase
					.from("market_listings")
					.insert({
						seller_id: userId,
						store_id: store.id,
						title: data.title,
						description: data.description,
						display_pic_url: data.display_pic_url || null,
						price: data.price,
						tab_category: data.tab_category,
						product_sale_type: data.product_sale_type,
						status: "active",
						encrypted_asset_payload: JSON.stringify(data.asset_payload),
					})
					.select()
					.single();
				if (lErr) throw lErr;

				const currentListingId = (listing as MarketListing).id;

				if (data.tab_category === "socio_market" && data.verified_metrics) {
					const m = data.verified_metrics;
					await supabase.from("socio_market_metrics").insert({
						listing_id: currentListingId,
						platform_name: m.platform_name,
						target_username: m.username,
						followers_count: m.followers_count,
						following_count: m.following_count,
						likes_or_posts_count: m.likes_or_posts_count,
						account_bio: m.account_bio || null,
						last_verified_sync: new Date().toISOString(),
					});
				}

				if (
					data.tab_category === "product" &&
					data.product_sale_type === "one_time"
				) {
					await supabase.from("one_time_digital_tools").insert({
						listing_id: currentListingId,
						seller_id: userId,
						product_title: data.title,
						product_description: data.description || null,
						sale_price: data.price,
						display_cover_url: data.display_pic_url || null,
						storage_vault_path: (data.asset_payload.vault_path as string) || "",
						file_original_name:
							(data.asset_payload.file_name as string) || "archive.zip",
						file_size_bytes: Number(data.asset_payload.file_size) || 0,
						file_mime_type:
							(data.asset_payload.file_type as string) || "application/zip",
						asset_category: (data.asset_payload.category as string) || "custom",
						asset_type: (data.asset_payload.asset_type as string) || "file",
						asset_content: data.asset_payload.content || null,
						safety_status: "pending",
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					});
				}

				if (
					data.tab_category === "digital_tool" ||
					data.product_sale_type === "recurring"
				) {
					await supabase.from("reusable_digital_products").insert({
						listing_id: currentListingId,
						seller_id: userId,
						asset_category: (data.asset_payload.category as string) || "custom",
						product_title: data.title,
						product_description: data.description || null,
						sale_price: data.price,
						display_cover_url: data.display_pic_url || null,
						fulfillment_payload: data.asset_payload,
						safety_status: "pending",
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					});
				}

				await refresh();
				return listing as MarketListing;
			} catch (err) {
				console.error("❌ Create listing error:", err);
				return null;
			}
		},
		[userId, store, refresh],
	);

	const markInboxRead = useCallback(
		async (messageId: string): Promise<void> => {
			await supabase
				.from("market_inbox_messages")
				.update({ is_read: true })
				.eq("id", messageId);
			setInbox((prev) =>
				prev.map((m) => (m.id === messageId ? { ...m, is_read: true } : m)),
			);
		},
		[],
	);

	// ─── ✅ Purchase Listing (Client-Safe) ──────────────────────
	const purchaseListing = useCallback(
		async (
			listingId: string,
		): Promise<{ success: boolean; error?: string; order_id?: string }> => {
			if (!userId) {
				return { success: false, error: "You must be logged in to purchase" };
			}

			try {
				const result = await processPurchaseClient(listingId, userId);

				if (result.success) {
					await refresh();
					return {
						success: true,
						order_id: result.order_id,
					};
				} else {
					return {
						success: false,
						error: result.error || "Purchase failed",
					};
				}
			} catch (err) {
				console.error("❌ [purchaseListing] Error:", err);
				return {
					success: false,
					error: err instanceof Error ? err.message : "Purchase failed",
				};
			}
		},
		[userId, refresh],
	);

	return {
		store,
		listings,
		orders,
		inbox,
		loading,
		error,
		refresh,
		completeOnboarding,
		createListing,
		markInboxRead,
		purchaseListing,
	};
}
