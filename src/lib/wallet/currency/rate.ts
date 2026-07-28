export async function fetchRate(from: string, to: string) {
	const res = await fetch(`https://api.exchangerate.host/latest?base=${from}`);
	const data = await res.json();

	if (!data?.rates?.[to]) {
		console.warn(`FX missing: ${from} → ${to}`);

		// fallback safety rate (NEVER 0)
		return 1;
	}

	return data.rates[to];
}
