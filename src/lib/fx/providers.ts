// Primary provider: Open ExchangeRate-API
export async function fetchFromPrimary(from: string): Promise<Record<string, number> | null> {
    try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${from}`, {
            cache: "no-store",
            headers: {
                "User-Agent": "Primebooster-FX-Sync/1.0"
            }
        });

        if (!res.ok) {
            console.error(`Primary FX HTTP error [${from}]: ${res.status} ${res.statusText}`);
            return null;
        }

        const data = await res.json();
        if (data?.result !== "success" || !data?.rates) {
            console.error(`Primary FX invalid payload [${from}]:`, data);
            return null;
        }

        return data.rates;
    } catch (error) {
        console.error(`Primary FX fetch exception [${from}]:`, error);
        return null;
    }
}

// Backup provider: Frankfurter API
export async function fetchFromBackup(from: string): Promise<Record<string, number> | null> {
    try {
        const res = await fetch(`https://api.frankfurter.app/latest?from=${from}`, {
            cache: "no-store",
            headers: {
                "User-Agent": "Primebooster-FX-Sync/1.0"
            }
        });

        if (!res.ok) {
            console.error(`Backup FX HTTP error [${from}]: ${res.status} ${res.statusText}`);
            return null;
        }

        const data = await res.json();
        if (!data?.rates) {
            console.error(`Backup FX invalid payload [${from}]:`, data);
            return null;
        }

        return {
            [from.toUpperCase()]: 1.0,
            ...data.rates
        };
    } catch (error) {
        console.error(`Backup FX fetch exception [${from}]:`, error);
        return null;
    }
}

// Combined FX Fetcher
export async function fetchFxRates(base: string): Promise<{ rates: Record<string, number> | null; provider: string }> {
    let rates = await fetchFromPrimary(base);
    if (rates) return { rates, provider: "open-er-api" };

    console.warn(`Primary FX provider failed for ${base}, trying backup...`);
    rates = await fetchFromBackup(base);
    if (rates) return { rates, provider: "frankfurter" };

    return { rates: null, provider: "none" };
}