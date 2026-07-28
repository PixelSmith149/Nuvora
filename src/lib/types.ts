export type TabCategory = "digital_tool" | "socio_market" | "product";
export type ProductSaleType = "one_time" | "recurring" | "not_applicable";
export type ListingStatus =
	| "active"
	| "locked_escrow"
	| "sold_pinned"
	| "deleted";
export type TransactionType = "transfer" | "credit" | "debit";
export type MessagePriority = "normal" | "high";

export interface Profile {
	id: string;
	username: string;
	display_name: string;
	avatar_url: string | null;
	created_at: string;
	updated_at: string;
}

export interface Wallet {
	id: string;
	user_id: string;
	balance: number;
	created_at: string;
	updated_at: string;
}

export interface WalletTransaction {
	id: string;
	wallet_id: string;
	type: TransactionType;
	amount: number;
	counterparty_wallet_id: string | null;
	reference_type: string | null;
	reference_id: string | null;
	memo: string | null;
	created_at: string;
}

export interface GlobalMarketStore {
	id: string;
	user_id: string;
	contact_email: string;
	marketing_email: string;
	tiktok_handle: string | null;
	snapchat_handle: string | null;
	verification_video_url: string;
	is_verified: boolean;
	created_at: string;
	updated_at: string;
}

export interface MarketListing {
	id: string;
	seller_id: string;
	store_id: string;
	title: string;
	description: string;
	display_pic_url: string | null;
	price: number;
	tab_category: TabCategory;
	product_sale_type: ProductSaleType;
	status: ListingStatus;
	encrypted_asset_payload: string;
	created_at: string;
	updated_at: string;
}

export interface SocioMarketMetric {
	id: string;
	listing_id: string;
	platform_name: string;
	target_username: string;
	followers_count: number;
	account_bio: string | null;
	last_verified_sync: string;
}

export interface RecurringProductKey {
	id: string;
	listing_id: string;
	management_key: string;
	next_rotation_trigger: string | null;
	created_at: string;
	updated_at: string;
}

export interface GlobalMarketOrder {
	id: string;
	listing_id: string;
	buyer_id: string;
	seller_id: string;
	amount_paid: number;
	purchased_at: string;
	status: string;
	escrow_id?: string | null;
	delivered_at?: string | null;
	confirmed_at?: string | null;
	revealed_credentials?: Record<string, any> | null;
	created_at?: string;
	updated_at?: string;
}

export interface InboxMessage {
	id: string;
	user_id: string;
	priority: MessagePriority;
	title: string;
	body: string;
	is_read: boolean;
	created_at: string;
	conversation_id: string;
	receiver_id: string;
	listing_id: string;
	listing_title: string;
	listing_image: string;
	sender_name: string;
	sender_avatar: string;
	sender_id: string;
}

// Decoded asset payload shapes (stored as JSON string in encrypted_asset_payload)
export interface SocioMarketPayload {
	username: string;
	password: string;
	platform_name: string;
}

export interface OneTimeProductPayload {
	access_details: string;
}

export interface RecurringProductPayload {
	description: string;
}

// Listing with joined metrics for display
export interface ListingWithMetrics extends MarketListing {
	socio_metrics?: SocioMarketMetric | null;
	recurring_key?: RecurringProductKey | null;
}

// Purchase result returned to the buyer's locker
export interface PurchaseResult {
	order: GlobalMarketOrder;
	revealed: Record<string, unknown>;
}
