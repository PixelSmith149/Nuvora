export type SupportedCurrency =
	// USD base
	| "USD"

	// African currencies
	| "GHS"
	| "NGN"
	| "KES"
	| "UGX"
	| "TZS"
	| "ZAR"
	| "XOF"
	| "XAF"
	| "RWF"
	| "ETB"
	| "EGP"
	| "MAD"
	| "DZD"

	// Global fiat
	| "EUR"
	| "GBP"
	| "JPY"
	| "CAD"
	| "AUD"
	| "CHF"
	| "CNY"
	| "INR"
	| "BRL"
	| "MXN"

	// Crypto (expandable)
	| "BTC";

type FXCache = {
	rate: number;
	timestamp: number;
};
