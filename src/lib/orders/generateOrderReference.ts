export function generateOrderReference() {
	return `ORD-${Date.now()}-${Math.random()
		.toString(36)
		.substring(2, 8)
		.toUpperCase()}`;
}
