export type WithdrawMethod = "momo" | "bank" | "card" | "crypto";

export type WithdrawRecipient = {
	account_name: string;
	account_number: string;
	bank_code?: string;
	provider?: string;
	recipient_type: "nuban" | "mobile_money";
};

export type WithdrawDraft = {
	// Navigation Metadata Parameters
	method?: WithdrawMethod;
	country?: string;
	currency?: string;
	provider?: string;
	account_name?: string;
	account_number?: string;
	bank_code?: string;
	recipient_type?: "mobile_money" | "nuban";

	// Real-time API Quote Calculation Objects
	amountUsd?: number;
	payoutAmount?: number;
	exchangeRate?: number;
	fee?: number;
	totalReceived?: number;
	localAmount?: number;

	// Composite objects
	recipient?: WithdrawRecipient | null;
};
