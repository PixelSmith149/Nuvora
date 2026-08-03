// Primary provider: Open ExchangeRate-API (Free, open access)
export async function fetchFromPrimary(from: string): Promise<Record<string, number> | null> {
    try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${from}`, {
            next: { revalidate: 3600 }
        });

        if (!res.ok) return null;

        const data = await res.json();
        if (data?.result !== "success" || !data?.rates) return null;

        return data.rates;
    } catch (error) {
        console.error("Primary FX provider failed:", error);
        return null;
    }
}

// Backup provider: Frankfurter API
export async function fetchFromBackup(from: string): Promise<Record<string, number> | null> {
    try {
        const res = await fetch(`https://api.frankfurter.app/latest?from=${from}`);

        if (!res.ok) return null;

        const data = await res.json();
        if (!data?.rates) return null;

        return {
            [from.toUpperCase()]: 1.0,
            ...data.rates
        };
    } catch (error) {
        console.error("Backup FX provider failed:", error);
        return null;
    }
}

// Combined FX Fetcher with Fallback
export async function fetchFxRates(base: string): Promise<{ rates: Record<string, number> | null; provider: string }> {
    let rates = await fetchFromPrimary(base);
    if (rates) return { rates, provider: "open-er-api" };

    console.warn(`Primary FX provider failed for ${base}, switching to backup...`);
    rates = await fetchFromBackup(base);
    if (rates) return { rates, provider: "frankfurter" };

    return { rates: null, provider: "none" };
}