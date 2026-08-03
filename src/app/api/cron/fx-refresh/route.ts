import { NextRequest, NextResponse } from "next/server";
import { fetchFxRates } from "@/lib/fx/providers";
import { createClient } from "@/lib/supabase/server";

const CURRENCIES = ["USD", "EUR", "GBP"];

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();

  // Defensive Check
  if (!cronSecret) {
    console.error("CRON_ERROR: CRON_SECRET is not defined in Vercel environment variables.");
    return NextResponse.json(
      { error: "Server misconfiguration: CRON_SECRET missing" },
      { status: 500 }
    );
  }

  const expectedHeader = `Bearer ${cronSecret}`;

  if (authHeader?.trim() !== expectedHeader) {
    console.warn("CRON_AUTH_FAILED: Received header does not match CRON_SECRET.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    const supabase = await createClient();
    const results: Record<string, { count: number; provider: string }> = {};

    for (const base of CURRENCIES) {
        const { rates, provider } = await fetchFxRates(base);

        if (!rates) {
            console.error(`Failed to retrieve FX rates for base: ${base}`);
            continue;
        }

        // 2. Prepare Batch Payload (Bulk Insert/Upsert)
        const payload = Object.entries(rates).map(([target, rate]) => ({
            base_currency: base,
            target_currency: target,
            rate: Number(rate),
            provider,
            updated_at: new Date().toISOString(),
        }));

        // 3. Single Bulk Upsert Query per Base Currency
        const { error } = await supabase
            .from("fx_rates")
            .upsert(payload, { onConflict: "base_currency,target_currency" });

        if (error) {
            console.error(`Supabase bulk upsert error for ${base}:`, error);
        } else {
            results[base] = { count: payload.length, provider };
        }
    }

    return NextResponse.json({
        success: true,
        updated: results,
    });
}