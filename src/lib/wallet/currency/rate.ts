/**
 * Fetch FX rate: 1 unit of `from` = `rate` units of `to`
 */
export async function fetchRate(from: string, to: string): Promise<number> {
  const base = from.toUpperCase();
  const quote = to.toUpperCase();

  if (base === quote) return 1;

  // Primary: open.er-api.com (no key, wide currency coverage incl. GHS/NGN/etc.)
  const primaryUrl = `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`;

  const res = await fetch(primaryUrl, {
    next: { revalidate: 3600 }, // cache ~1h if on Next server
  });

  if (!res.ok) {
    throw new Error(`FX provider HTTP ${res.status} for ${base}→${quote}`);
  }

  const data = await res.json();

  // open.er-api shape: { result: "success", rates: { GHS: 15.2, ... } }
  const rate =
    data?.rates?.[quote] ??
    data?.conversion_rates?.[quote]; // some providers use this key

  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
    console.error("FX missing or invalid:", { base, quote, data });
    throw new Error(`FX rate unavailable: ${base} → ${quote}`);
  }

  return rate;
}