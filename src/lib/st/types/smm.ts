// lib/st/types/smm.ts

export interface ProviderService {
	id: string;
	provider_id: string;
	external_service_id: string;
	name: string;
	category: string | null;
	rate: number;
	min_qty: number;
	max_qty: number;
	refill: boolean | null;
	cancel: boolean | null;
	active: boolean | null;
	avg_time: string | null;
	avg_time_minutes: number | null;
	quality_tier: "premium" | "standard" | "basic" | "unknown" | null;
	quality_score: number | null;
	is_recommended: boolean | null;
	raw: any;
	created_at: string;
	updated_at: string;
}

export interface ServicePreview {
	provider_service_id: string;
	platform: string;
	service_type: string;
	title: string;
	description: string;
	price_per_1000: number;
	avg_time_delivery: string | null;
	is_new: boolean;
	rate: number;
	min_qty: number;
	max_qty: number;
	quality_tier: string | null;
}

export interface ServiceImportResult {
	success: boolean;
	total_processed: number;
	total_inserted: number;
	total_skipped: number;
	errors: string[];
	inserted_ids: string[];
}
