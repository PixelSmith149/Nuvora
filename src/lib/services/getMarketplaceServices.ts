"use server";

import { createClient } from "@/lib/supabase/server";
import { getPlatformSlug } from "./platform-slug";
import { calculateOrderAmount } from "./servicePricing";

interface MarketplaceFilters {
	category?: string;
	search?: string;
}

const DEFAULT_MIN_QTY = 10;
const DEFAULT_MAX_QTY = 10000;

function normalizeProviderInfo(
	provider:
		| {
				category: string | null;
				min_qty: number | null;
				max_qty: number | null;
		  }
		| {
				category: string | null;
				min_qty: number | null;
				max_qty: number | null;
		  }[]
		| null,
) {
	const info = Array.isArray(provider) ? provider[0] : provider;

	return {
		category: info?.category ?? "General",
		minQuantity: info?.min_qty ?? DEFAULT_MIN_QTY,
		maxQuantity: info?.max_qty ?? DEFAULT_MAX_QTY,
	};
}

//──────────────────────────────────────────────────────────────
// Marketplace Services
//──────────────────────────────────────────────────────────────

export async function getMarketplaceServices(filters?: MarketplaceFilters) {
	const supabase = await createClient();

	let query = supabase
		.from("services")
		.select(`
      id,
      platform,
      service_type,
      title,
      description,
      price_per_1000,
      provider_services!left(
        category,
        min_qty,
        max_qty
      )
    `)
		.eq("active", true);

	if (filters?.search?.trim()) {
		const keyword = filters.search.trim();
		query = query.or(
			[
				`title.ilike.%${keyword}%`,
				`platform.ilike.%${keyword}%`,
				`service_type.ilike.%${keyword}%`,
				`description.ilike.%${keyword}%`,
			].join(","),
		);
	}

	// Prefer filtering on the main table when possible.
	// If you still need category filtering, move category into services
	// or create a SQL view.
	if (filters?.category) {
		query = query.eq("provider_services.category", filters.category);
	}

	query = query
		.order("platform", { ascending: true })
		.order("title", { ascending: true });

	const { data, error } = await query;

	if (error) {
		console.error("[Marketplace] Failed to load services:", error.message);
		throw new Error("Could not load marketplace catalog.");
	}

	return (data ?? []).map((service) => {
		const provider = normalizeProviderInfo(service.provider_services);

		return {
			id: service.id,
			name: service.title,
			platform: service.platform,
			type: service.service_type,
			description: service.description ?? "",
			retailRate: Number(service.price_per_1000 ?? 0),
			category: provider.category,
			minQuantity: provider.minQuantity,
			maxQuantity: provider.maxQuantity,
		};
	});
}

//──────────────────────────────────────────────────────────────
// Marketplace Categories
//──────────────────────────────────────────────────────────────

export async function getMarketplaceCategories() {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("provider_services")
		.select("category")
		.eq("active", true);

	if (error) {
		console.error("[Marketplace] Failed to load categories:", error.message);
		return [];
	}

	return [
		...new Set(
			(data ?? [])
				.map((row) => row.category?.trim())
				.filter((value): value is string => Boolean(value)),
		),
	].sort((a, b) => a.localeCompare(b));
}

//──────────────────────────────────────────────────────────────
// Single Marketplace Service
//──────────────────────────────────────────────────────────────

export async function getMarketplaceService(serviceId: string) {
	const supabase = await createClient();

	const { data: service, error } = await supabase
		.from("services")
		.select(`
      id,
      title,
      description,
      platform,
      service_type,
      price_per_1000,
      provider_services!left(
        category,
        min_qty,
        max_qty
      )
    `)
		.eq("id", serviceId)
		.eq("active", true)
		.maybeSingle();

	if (error) {
		console.error("[Marketplace] Failed to load service:", error.message);
		return null;
	}

	if (!service) return null;

	const provider = normalizeProviderInfo(service.provider_services);

	return {
		id: service.id,
		name: service.title,
		platform: service.platform,
		type: service.service_type,
		description: service.description ?? "",
		retailRate: Number(service.price_per_1000 ?? 0),
		category: provider.category,
		minQuantity: provider.minQuantity,
		maxQuantity: provider.maxQuantity,
	};
}

//──────────────────────────────────────────────────────────────
// Preview Marketplace Order
//──────────────────────────────────────────────────────────────

export async function previewOrderCost(serviceId: string, quantity: number) {
	if (!serviceId) throw new Error("Missing service.");
	if (!Number.isFinite(quantity)) throw new Error("Invalid quantity.");

	const service = await getMarketplaceService(serviceId);

	if (!service) {
		throw new Error("Service not found or currently unavailable.");
	}

	if (quantity < service.minQuantity || quantity > service.maxQuantity) {
		throw new Error(
			`Quantity must be between ${service.minQuantity.toLocaleString()} and ${service.maxQuantity.toLocaleString()}.`,
		);
	}

	const amount = calculateOrderAmount(service.retailRate, quantity);

	return {
		serviceId: service.id,
		quantity,
		amount,
		service,
	};
}

//──────────────────────────────────────────────────────────────
// Marketplace Platforms
//──────────────────────────────────────────────────────────────

export async function getMarketplacePlatforms() {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("services")
		.select("platform")
		.eq("active", true);

	if (error) {
		console.error("[Marketplace] Failed to load platforms:", error.message);
		return [];
	}

	const uniquePlatforms = [
		...new Set(
			(data ?? [])
				.map((row) => row.platform?.trim())
				.filter((value): value is string => Boolean(value)),
		),
	].sort((a, b) => a.localeCompare(b));

	return uniquePlatforms.map((name) => ({
		name,
		slug: getPlatformSlug(name),
	}));
}

//──────────────────────────────────────────────────────────────
// Marketplace Services By Platform (accepts name or slug)
//──────────────────────────────────────────────────────────────

export async function getMarketplaceServicesPlatform(platformOrSlug: string) {
	const supabase = await createClient();

	// First try exact platform name match
	let { data, error } = await supabase
		.from("services")
		.select(`
      id,
      platform,
      service_type,
      title,
      description,
      price_per_1000,
      provider_services!left(
        category,
        min_qty,
        max_qty
      )
    `)
		.eq("active", true)
		.eq("platform", platformOrSlug)
		.order("title", { ascending: true });

	// If nothing found, resolve slug → platform name
	if ((!data || data.length === 0) && !error) {
		const platforms = await getMarketplacePlatforms();
		const match = platforms.find((p) => p.slug === platformOrSlug);

		if (match) {
			const result = await supabase
				.from("services")
				.select(`
          id,
          platform,
          service_type,
          title,
          description,
          price_per_1000,
          provider_services!left(
            category,
            min_qty,
            max_qty
          )
        `)
				.eq("active", true)
				.eq("platform", match.name)
				.order("title", { ascending: true });

			data = result.data;
			error = result.error;
		}
	}

	if (error) {
		console.error(
			"[Marketplace] Failed to load platform services:",
			error.message,
		);
		return [];
	}

	return (data ?? []).map((service) => {
		const provider = normalizeProviderInfo(service.provider_services);

		return {
			id: service.id,
			name: service.title,
			platform: service.platform,
			type: service.service_type,
			description: service.description ?? "",
			retailRate: Number(service.price_per_1000 ?? 0),
			category: provider.category,
			minQuantity: provider.minQuantity,
			maxQuantity: provider.maxQuantity,
		};
	});
}
