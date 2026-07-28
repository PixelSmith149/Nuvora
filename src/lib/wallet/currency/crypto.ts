export async function fetchBTCUSD(): Promise<number> {
	const res = await fetch(
		"https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
	);

	const data = await res.json();

	return data?.bitcoin?.usd;
}
