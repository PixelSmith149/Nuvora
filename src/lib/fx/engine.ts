import { createClient } from "@/lib/supabase/server";
import { isSupportedPair } from "./isSupportedPair";
import { fetchFromBackup, fetchFromPrimary } from "./providers";

export async function getFxRate(from: string, to: string): Promise<number> {
	const supabase = await createClient();

	// 1. VALIDATE PAIR FIRST (SAFE GUARD)
	if (!isSupportedPair(from, to)) {
		throw new Error(`Unsupported FX pair: ${from} → ${to}`);
	}

	// 2. CACHE LOOKUP (FAST PATH)
	const { data: cached } = await supabase
		.from("fx_rates")
		.select("rate")
		.eq("base_currency", from)
		.eq("target_currency", to)
		.maybeSingle();

	if (cached?.rate) {
		return Number(cached.rate);
	}

	// 3. PRIMARY PROVIDER
	let rates = await fetchFromPrimary(from);

	// 4. BACKUP PROVIDER
	if (!rates || !rates[to]) {
		rates = await fetchFromBackup(from);
	}

	const rate = rates?.[to];

	if (!rate) {
		throw new Error(`FX rate missing: ${from} → ${to}`);
	}

	// 5. CACHE WRITE (NON-BLOCKING SAFE SAVE)
	supabase.from("fx_rates").upsert({
		base_currency: from,
		target_currency: to,
		rate,
		provider: "auto-sync",
		updated_at: new Date().toISOString(),
	});

	return rate;
}
