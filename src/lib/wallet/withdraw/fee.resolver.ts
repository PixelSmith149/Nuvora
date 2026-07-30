export type RecipientType = "mobile_money" | "bank" | "domiciliary" | "general";

/**
 * Resolves payout processing fees for Paystack and international corridors.
 */
export function getExactPaystackFee(
    payoutAmount: number,
    currency: string,
    recipientType: RecipientType = "mobile_money"
): number {
    const code = currency.toUpperCase();

    switch (code) {
        case "NGN": {
            let fee = payoutAmount <= 5000 ? 10 : payoutAmount <= 50000 ? 25 : 50;
            // NIBSS / Central Bank Stamp Duty on payouts >= NGN 10,000
            if (payoutAmount >= 10000) fee += 50;
            return fee;
        }

        case "GHS": {
            // Paystack Ghana: GHS 1 for MoMo, GHS 8 for Bank Transfers
            return recipientType === "bank" ? 8 : 1;
        }

        case "KES": {
            if (recipientType === "bank") {
                if (payoutAmount <= 10000) return 80;
                if (payoutAmount <= 50000) return 120;
                return 140;
            }
            // Standard M-Pesa tiers
            if (payoutAmount <= 1500) return 20;
            if (payoutAmount <= 20000) return 40;
            return 60;
        }

        case "ZAR": {
            return 3; // Flat ZAR 3 per transfer
        }

        case "USD": {
            // Paystack USD Domiciliary Transfer Fee (Typical flat rate of $10 per payout)
            return recipientType === "domiciliary" ? 10 : 5;
        }

        case "XOF":
        case "XAF": {
            return 100; // Francophone Mobile Money flat fee
        }

        // --- Major Global Currencies (If using Multi-Provider Routing like Wise/Stripe) ---
        case "EUR":
            return 0.50; // Typical SEPA Instant transfer fee (€0.50)

        case "GBP":
            return 0.35; // Typical UK Faster Payments fee (£0.35)

        case "CAD":
            return 1.25; // Typical Interac e-Transfer / ACH fee ($1.25 CAD)

        default: {
            // Global percentage or flat fallback fee for unmapped corridors
            return 5.00;
        }
    }
}