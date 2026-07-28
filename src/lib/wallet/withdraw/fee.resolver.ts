/**
 * Resolves the exact transaction fee Paystack bills your merchant account.
 * Deducting this directly from user ledgers balances your processing pipeline.
 */
export function getExactPaystackFee(
	payoutAmount: number,
	currency: string,
): number {
	const code = currency.toUpperCase();

	switch (code) {
		case "NGN":
			// Official Paystack Nigeria Transfer Tier Pricing
			if (payoutAmount <= 5000) return 10;
			if (payoutAmount <= 50000) return 25;
			return 50;

		case "GHS":
			// Official Paystack Ghana Flat Transfer Payout Pricing
			return 10;

		case "KES":
			// Paystack East Africa / Kenya M-Pesa Integration Flat Fee
			return 50;

		case "XOF":
		case "XAF":
			// Francophone Mobile Money Channel Flat Processing Fee
			return 100;

		default:
			// Global fallback flat processing fee for miscellaneous currency corridors
			return 50;
	}
}
