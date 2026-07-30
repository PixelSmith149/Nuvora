export type RecipientInput = {
	account_number: string;
	bank_code: string;
	account_name: string;
	currency: string;
	recipient_type: "nuban" | "mobile_money";
};

export async function createRecipient(input: RecipientInput): Promise<string> {
	const secret = process.env.PAYSTACK_SECRET_KEY;

	if (!secret) {
		throw new Error("Missing Paystack secret key configuration.");
	}

	if (!input.account_number || !input.bank_code || !input.currency) {
		throw new Error("Missing required recipient parameters (account number, bank code, or currency).");
	}

	const response = await fetch("https://api.paystack.co/transferrecipient", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${secret}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			type: input.recipient_type,
			name: input.account_name || "TRANSFER RECIPIENT",
			account_number: input.account_number.trim(),
			bank_code: input.bank_code.trim(),
			currency: input.currency.toUpperCase(),
		}),
	});

	const data = await response.json();

	if (!response.ok || !data.status) {
		throw new Error(data.message || "Failed to create Paystack transfer recipient.");
	}

	if (!data.data?.recipient_code) {
		throw new Error("Paystack did not return a valid recipient code.");
	}

	return data.data.recipient_code as string;
}