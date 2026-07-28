import { fetchFromPrimary } from "@/lib/fx/providers";
import { createClient } from "@/lib/supabase/server";

const CURRENCIES = ["USD", "EUR", "GBP"];

export async function GET() {
	const supabase = await createClient();

	for (const base of CURRENCIES) {
		const rates = await fetchFromPrimary(base);

		if (!rates) continue;

		for (const [target, rate] of Object.entries(rates)) {
			await supabase.from("fx_rates").upsert({
				base_currency: base,
				target_currency: target,
				rate,
				provider: "cron-primary",
				updated_at: new Date().toISOString(),
			});
		}
	}

	return Response.json({ success: true });
}
