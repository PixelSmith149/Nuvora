import { NextRequest, NextResponse } from "next/server";
import { fetchFxRates } from "@/lib/fx/providers";
import { createClient } from "@/lib/supabase/server";

const CURRENCIES = ["USD", "EUR", "GBP"];

export async function GET(req: NextRequest) {
    // 1. Verify Authorization Header
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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