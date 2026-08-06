// lib/st/types.ts

export type SiteStatus =
	| "draft"
	| "generating"
	| "generated" // ← new intermediate status
	| "published"
	| "failed"
	| "archived";

export interface SiteBlueprint {
	// Core identity
	business_type: string;
	brand_name: string;
	brand_tagline?: string;
	industry?: string;
	target_audience?: string;
	business_goal?: string;

	// Design
	design_style?: string;
	theme?: string;
	tone?: string;
	primary_cta?: string;
	secondary_cta?: string;

	colors?: {
		primary?: string;
		secondary?: string;
		accent?: string;
		background?: string;
		text?: string;
	};

	typography?: {
		heading?: string;
		body?: string;
	};

	layout?: {
		corner_radius?: string;
		card_style?: string;
		button_style?: string;
		animation_style?: string;
		spacing?: string;
	};

	// Structure
	sections: string[];
	features?: string[];
	services?: string[];

	// Contact & social
	social_links?: {
		instagram?: string;
		facebook?: string;
		tiktok?: string;
		twitter?: string;
		youtube?: string;
		linkedin?: string;
	};

	contact_information?: {
		email?: string;
		phone?: string;
		address?: string;
	};

	// SEO
	seo?: {
		title?: string;
		description?: string;
		keywords?: string[];
	};

	// Platform extras (kept for settings)
	custom_domain?: string;
	custom_domain_verified?: boolean;
	custom_domain_verified_at?: string | null;
	custom_domain_verification_error?: string | null;
	analytics_id?: string;
	site_description?: string;
}

export interface UserSite {
	id: string;
	user_id: string;
	username: string;
	site_slug: string;
	site_name: string;
	blueprint: SiteBlueprint;
	html_code: string | null;
	status: SiteStatus;
	session_id: string | null;
	session_expires_at: string | null;
	is_session_active: boolean;
	published_at: string | null;
	chat_history?: ChatMessage[];
	created_at: string;
	updated_at: string;
}

export interface SiteCharge {
	id: string;
	site_id: string;
	user_id: string;
	amount: number;
	status: "pending" | "success" | "refunded" | "failed";
	transaction_id: string | null;
	meta: Record<string, any>;
	created_at: string;
	updated_at: string;
}

export interface SiteEdit {
	id: string;
	site_id: string;
	user_id: string;
	section: string;
	old_content: string | null;
	new_content: string;
	edit_type: "text" | "color" | "layout";
	created_at: string;
}

export interface ChatMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: string;
	isTyping?: boolean;
}

export interface PlannerResponse {
	message: string;
	blueprint?: SiteBlueprint;
	isComplete: boolean;
	shouldConfirm?: boolean;
}

export interface EditRequest {
	siteId: string;
	section: string;
	editType: "text" | "color" | "layout";
	newContent: string;
	oldContent?: string;
}

export const SYSTEM_WALLET_ID = "997f4dd7-2124-4f36-9a71-e636e7e6d56a";
export const SESSION_EXPIRY_HOURS = 48;
export const BUILD_COST = 5.0;

// Required fields that must exist before we allow generation
export const REQUIRED_BLUEPRINT_FIELDS = [
	"brand_name",
	"sections",
] as const;