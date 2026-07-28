// lib/st/types.ts

export type SiteStatus =
	| "draft"
	| "generating"
	| "published"
	| "failed"
	| "archived";

// lib/st/types.ts

export interface SiteBlueprint {
	brand_name: string;
	brand_tagline?: string;
	theme: string;
	sections: string[];
	colors?: {
		primary?: string;
		secondary?: string;
		accent?: string;
		background?: string;
		text?: string;
	};
	fonts?: {
		heading?: string;
		body?: string;
	};
	cta_text?: string;
	social_links?: {
		instagram?: string;
		facebook?: string;
		tiktok?: string;
		twitter?: string;
		youtube?: string;
	};
	contact_email?: string;
	contact_phone?: string;

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

export interface BuilderState {
	siteId: string | null;
	sessionId: string | null;
	isSessionActive: boolean;
	sessionExpiresAt: string | null;
	isGenerating: boolean;
	isComplete: boolean;
	chatHistory: ChatMessage[];
	htmlBuffer: string;
	blueprint: SiteBlueprint | null;
}

export interface ChatMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: string;
	isTyping?: boolean;
}

export interface PlannerResponse {
	type: "planning" | "code" | "confirmation" | "edit";
	content: string;
	blueprint?: SiteBlueprint;
	section?: string;
	htmlChunk?: string;
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
