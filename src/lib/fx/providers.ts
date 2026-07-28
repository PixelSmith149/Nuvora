export async function fetchFromPrimary(from: string) {
	const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
	const data = await res.json();
	return data?.rates ?? null;
}

export async function fetchFromBackup(from: string) {
	const res = await fetch(`https://api.exchangerate.host/latest?base=${from}`);
	const data = await res.json();
	return data?.rates ?? null;
}
