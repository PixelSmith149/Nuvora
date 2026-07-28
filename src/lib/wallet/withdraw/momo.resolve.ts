export type MoMoNetwork = "MTN" | "TELECEL" | "AIRTELTIGO" | "UNKNOWN";

export type MoMoRiskLevel = "low" | "medium" | "high" | "blocked";

export type MoMoResolved = {
	phone: string;
	network: MoMoNetwork;
	account_name: string | null;
	is_valid: boolean;
	risk_score: number;
	risk_level: MoMoRiskLevel;
};

function detectNetwork(phone: string): MoMoNetwork {
	const cleaned = phone.replace(/\D/g, "");

	if (/^(024|054|055|059)/.test(cleaned)) return "MTN";
	if (/^(020|050)/.test(cleaned)) return "TELECEL";
	if (/^(027|025)/.test(cleaned)) return "AIRTELTIGO";

	return "UNKNOWN";
}

async function resolveAccountName(phone: string): Promise<string | null> {
	try {
		/**
		 * REALITY:
		 * Paystack does NOT support MoMo name resolution.
		 * This is a placeholder for:
		 * - Hubtel API
		 * - Flutterwave verification
		 * - Telco APIs
		 */

		// SAFE FALLBACK STRATEGY
		return null;
	} catch {
		return null;
	}
}

function computeRisk(
	phone: string,
	network: MoMoNetwork,
	accountName: string | null,
): number {
	let score = 0;

	if (network === "UNKNOWN") score += 60;

	if (!accountName) score += 20;

	if (/(.)\1{6,}/.test(phone)) score += 20;

	if (phone.length < 10) score += 30;

	return Math.min(100, score);
}

export async function resolveMoMoRecipient(
	phone: string,
): Promise<MoMoResolved> {
	const cleaned = phone.replace(/\D/g, "");

	const network = detectNetwork(cleaned);

	const account_name = await resolveAccountName(cleaned);

	const risk_score = computeRisk(cleaned, network, account_name);

	let risk_level: MoMoRiskLevel = "low";

	if (risk_score >= 80) risk_level = "blocked";
	else if (risk_score >= 50) risk_level = "high";
	else if (risk_score >= 25) risk_level = "medium";

	const is_valid = network !== "UNKNOWN" && risk_level !== "blocked";

	return {
		phone: cleaned,
		network,
		account_name,
		is_valid,
		risk_score,
		risk_level,
	};
}
