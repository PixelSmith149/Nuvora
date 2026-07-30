// Primary provider: Open ExchangeRate-API (Free, open access)
export async function fetchFromPrimary(from: string): Promise<Record<string, number> | null> {
    try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${from}`, {
            next: { revalidate: 3600 } // Revalidate hourly if using Next.js App Router
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

// Backup provider: Frankfurter API (Free, open source, no API key required)
export async function fetchFromBackup(from: string): Promise<Record<string, number> | null> {
    try {
        const res = await fetch(`https://api.frankfurter.app/latest?from=${from}`);

        if (!res.ok) return null;

        const data = await res.json();
        if (!data?.rates) return null;

        // Note: Frankfurter returns rates relative to base, but omits the base currency itself.
        // We include base: 1.0 for consistency.
        return {
            [from.toUpperCase()]: 1.0,
            ...data.rates
        };
    } catch (error) {
        console.error("Backup FX provider failed:", error);
        return null;
    }
}