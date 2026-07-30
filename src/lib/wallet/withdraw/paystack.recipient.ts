type RecipientInput = {
	account_number: string;
	bank_code: string;
	account_name: string;
	currency: string;
	recipient_type: "nuban" | "mobile_money";
};

export async function createRecipient(input: RecipientInput) {
	const response = await fetch("https://api.paystack.co/transferrecipient", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			type: input.recipient_type,
			name: input.account_name,
			account_number: input.account_number,
			bank_code: input.bank_code,
			currency: input.currency,
		}),
	});

	const data = await response.json();

	if (!data.status) {
		throw new Error(data.message || "Failed to create recipient");
	}

	return data.data.recipient_code;
}
