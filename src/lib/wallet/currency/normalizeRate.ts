export function normalizeRate(rate: number | undefined | null): number {
	if (!rate || rate <= 0 || Number.isNaN(rate)) {
		return 1; // NEVER ZERO
	}
	return rate;
}
