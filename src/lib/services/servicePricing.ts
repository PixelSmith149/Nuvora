interface ServicePricingInput {
	providerRate: number;
	markupPercent: number;
}

export function calculateRetailRate({
	providerRate,
	markupPercent,
}: ServicePricingInput) {
	const retailRate = providerRate * (1 + markupPercent / 100);

	return Number(retailRate.toFixed(4));
}

export function calculateOrderAmount(retailRate: number, quantity: number) {
	const amount = (retailRate * quantity) / 1000;

	return Number(amount.toFixed(4));
}

export function publishService(
	service: {
		providerRate: number;
	},
	markupPercent: number,
) {
	const retailRate = calculateRetailRate({
		providerRate: service.providerRate,
		markupPercent,
	});

	return {
		retailRate,
		markupPercent,
		isActive: true,
	};
}

export function recalculateRetailRate(
	providerRate: number,
	markupPercent: number,
) {
	return calculateRetailRate({
		providerRate,
		markupPercent,
	});
}
