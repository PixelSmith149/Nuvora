export function normalizeRate(rate: number | undefined | null): number {
  if (rate == null || !Number.isFinite(rate) || rate <= 0) {
    throw new Error("Invalid FX rate");
  }
  return rate;
}