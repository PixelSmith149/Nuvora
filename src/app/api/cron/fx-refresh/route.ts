import { NextRequest, NextResponse } from "next/server";
import { fetchFxRates } from "@/lib/fx/providers";
import { createAdminClient } from "@/lib/supabase/admin"; // Use Service Role Client

export const dynamic = "force-dynamic";

const CURRENCIES = ["USD", "EUR", "GBP"];

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET?.trim();

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Initialize Service Role Supabase Client (bypasses RLS)
    const supabase = createAdminClient();
    const results: Record<string, { count: number; provider: string }> = {};
    const errors: string[] = [];

    for (const base of CURRENCIES) {
        const { rates, provider } = await fetchFxRates(base);

        if (!rates) {
            errors.push(`Failed to fetch FX rates for ${base}`);
            continue;
        }

        // 2. Map payload
        const payload = Object.entries(rates).map(([target, rate]) => ({
            base_currency: base,
            target_currency: target,
            rate: Number(rate),
            provider,
            updated_at: new Date().toISOString(),
        }));

        // 3. Upsert into database
        const { data, error } = await supabase
            .from("fx_rates")
            .upsert(payload, { onConflict: "base_currency,target_currency" })
            .select();

        if (error) {
            console.error(`Supabase FX upsert error for ${base}:`, error);
            errors.push(`DB error [${base}]: ${error.message}`);
        } else {
            results[base] = { count: data?.length ?? payload.length, provider };
        }
    }

    return NextResponse.json({
        success: errors.length === 0,
        updated: results,
        errors: errors.length > 0 ? errors : undefined,
    });
}