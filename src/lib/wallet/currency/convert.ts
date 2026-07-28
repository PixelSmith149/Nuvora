import { fetchBTCUSD } from "./crypto";
import { normalizeRate } from "./normalizeRate";
import { fetchRate } from "./rate";

export type Currency =
	| "USD"
	| "GHS"
	| "NGN"
	| "KES"
	| "UGX"
	| "TZS"
	| "ZAR"
	| "XOF"
	| "XAF"
	| "EGP"
	| "MAD"
	| "EUR"
	| "GBP"
	| "JPY"
	| "CAD"
	| "BTC";

export async function convertToUSD(
	amount: number,
	currency: Currency,
): Promise<number> {
	if (currency === "USD") {
		return amount;
	}

	if (currency === "BTC") {
		const btcPrice = await fetchBTCUSD();
		return amount * btcPrice;
	}

	const rate = normalizeRate(await fetchRate(currency, "USD"));

	return amount * rate;
}

export async function convertFromUSD(
	amount: number,
	currency: Currency,
): Promise<{
	amount: number;
	rate: number;
}> {
	if (currency === "USD") {
		return {
			amount,
			rate: 1,
		};
	}

	if (currency === "BTC") {
		const btcPrice = await fetchBTCUSD();

		return {
			amount: amount / btcPrice,
			rate: 1 / btcPrice,
		};
	}

	const rate = await fetchRate("USD", currency);

	return {
		amount: amount * rate,
		rate,
	};
}
