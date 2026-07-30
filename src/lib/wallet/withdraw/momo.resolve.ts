export type MoMoNetwork = "MTN" | "TELECEL" | "AIRTELTIGO" | "UNKNOWN";
export type MoMoRiskLevel = "low" | "medium" | "high" | "blocked";

export type MoMoResolved = {
    phone: string;            // Standardized 10-digit format (024XXXXXXX)
    phone_e164: string;       // E.164 format (+23324XXXXXXX)
    network: MoMoNetwork;
    account_name: string | null;
    is_valid: boolean;
    risk_score: number;
    risk_level: MoMoRiskLevel;
    message?: string;
};

// Map Paystack Ghana MoMo provider codes
const PAYSTACK_MOMO_CODES: Record<Exclude<MoMoNetwork, "UNKNOWN">, string> = {
    MTN: "MTN",        // MTN Mobile Money
    TELECEL: "VOD",    // Telecel (formerly Vodafone Cash)
    AIRTELTIGO: "ATL", // AirtelTigo Money
};

/**
 * Normalizes input to 10-digit national format (e.g. 0241234567)
 */
function normalizePhone(phone: string): { national: string; e164: string } {
    let digits = phone.replace(/\D/g, "");

    // Handle standard international prefix
    if (digits.startsWith("233") && digits.length === 12) {
        digits = "0" + digits.slice(3);
    }

    const national = digits;
    const e164 = digits.startsWith("0") ? `+233${digits.slice(1)}` : `+${digits}`;

    return { national, e164 };
}

/**
 * Detects network using updated National Communications Authority (NCA) Ghana prefix allocations
 */

export function detectNetwork(nationalPhone: string): MoMoNetwork {
    if (nationalPhone.length !== 10) return "UNKNOWN";

    // MTN: 024, 025, 053, 054, 055, 059
    if (/^(024|025|053|054|055|059)/.test(nationalPhone)) return "MTN";

    // Telecel: 020, 050
    if (/^(020|050)/.test(nationalPhone)) return "TELECEL";

    // AirtelTigo: 026, 027, 056, 057
    if (/^(026|027|056|057)/.test(nationalPhone)) return "AIRTELTIGO";

    return "UNKNOWN";
}

/**
 * Resolves registered Mobile Money account name using Paystack's /bank/resolve API
 */
async function resolveAccountName(
    nationalPhone: string,
    network: MoMoNetwork
): Promise<string | null> {
    if (network === "UNKNOWN") return null;

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
        console.warn("PAYSTACK_SECRET_KEY missing. Skipping live name resolution.");
        return null;
    }

    const bankCode = PAYSTACK_MOMO_CODES[network];

    try {
        const url = `https://api.paystack.co/bank/resolve?account_number=${nationalPhone}&bank_code=${bankCode}`;
        const res = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${paystackSecret}`,
                "Content-Type": "application/json",
            },
            next: { revalidate: 300 } // Cache results briefly if using Next.js
        });

        if (!res.ok) return null;

        const data = await res.json();
        if (data?.status && data?.data?.account_name) {
            return data.data.account_name;
        }

        return null;
    } catch (error) {
        console.error("MoMo account resolution failed:", error);
        return null;
    }
}

/**
 * Computes risk metrics based on pattern heuristics and resolution status
 */
function computeRisk(
    nationalPhone: string,
    network: MoMoNetwork,
    accountName: string | null
): number {
    let score = 0;

    // Invalid length or network
    if (nationalPhone.length !== 10) score += 50;
    if (network === "UNKNOWN") score += 50;

    // Repeating digits attack vector (e.g. 0244444444)
    if (/(.)\1{6,}/.test(nationalPhone)) score += 40;

    // Sequenced test numbers (e.g. 0123456789)
    if ("0123456789".includes(nationalPhone.slice(3))) score += 40;

    // Unverifiable account name adds slight friction score
    if (!accountName) score += 15;

    return Math.min(100, score);
}

/**
 * Main resolution wrapper for recipient validation
 */
export async function resolveMoMoRecipient(
    phone: string
): Promise<MoMoResolved> {
    const { national, e164 } = normalizePhone(phone);
    const network = detectNetwork(national);

    const account_name = await resolveAccountName(national, network);
    const risk_score = computeRisk(national, network, account_name);

    let risk_level: MoMoRiskLevel = "low";
    if (risk_score >= 80) risk_level = "blocked";
    else if (risk_score >= 50) risk_level = "high";
    else if (risk_score >= 25) risk_level = "medium";

    const is_valid = national.length === 10 && network !== "UNKNOWN" && risk_level !== "blocked";

    return {
        phone: national,
        phone_e164: e164,
        network,
        account_name,
        is_valid,
        risk_score,
        risk_level,
    };
}