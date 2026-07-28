import axios from "axios";

/**
 * Universal safe parser to extract message profiles from Axios network layers
 */
function handleProviderError(error: any, defaultMessage: string): string {
	if (axios.isAxiosError(error)) {
		if (error.response) {
			return `Provider API rejected connection with status ${error.response.status}: ${JSON.stringify(error.response.data)}`;
		} else if (error.request) {
			return "No response received from the provider's API endpoint. Check server network state.";
		}
	}
	return error instanceof Error ? error.message : defaultMessage;
}

/**
 * Fetches current raw service configurations available from the external upstream API provider.
 */
export async function fetchProviderServices(
	apiUrl: string,
	apiKey: string,
): Promise<any[]> {
	try {
		const { data } = await axios.post(
			apiUrl,
			new URLSearchParams({ key: apiKey, action: "services" }),
			{
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				timeout: 15000, // 15-second gateway timeout constraint
			},
		);

		if (data?.error) {
			throw new Error(`Provider Error: ${data.error}`);
		}

		if (!Array.isArray(data)) {
			throw new Error(
				"Invalid catalog format returned by provider. Expected service array mapping.",
			);
		}

		return data;
	} catch (error) {
		throw new Error(
			handleProviderError(
				error,
				"Failed to pull upstream provider service catalog.",
			),
		);
	}
}

/**
 * Dispatches an automated placement payload request to create an upstream fulfillment order.
 */
export async function createProviderOrder(
	apiUrl: string,
	apiKey: string,
	service: string,
	link: string,
	quantity: number,
): Promise<{ providerOrderId: string; raw: any }> {
	try {
		const { data } = await axios.post(
			apiUrl,
			new URLSearchParams({
				key: apiKey,
				action: "add",
				service,
				link,
				quantity: quantity.toString(),
			}),
			{
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				timeout: 20000, // Extra headroom for transaction handling processing blocks
			},
		);

		// CRITICAL: Check for semantic operational errors passed inside a 200 OK block
		if (!data || data.error) {
			throw new Error(
				data?.error ||
					"Upstream wholesaling engine rejected order transmission.",
			);
		}

		if (!data.order) {
			throw new Error(
				"API responded successfully but failed to return a tracking Order ID reference.",
			);
		}

		return {
			providerOrderId: String(data.order),
			raw: data,
		};
	} catch (error) {
		throw new Error(
			handleProviderError(
				error,
				"Critical pipeline block creating provider order.",
			),
		);
	}
}

/**
 * Checks a single transaction order position state profile.
 */
export async function getProviderOrderStatus(
	apiUrl: string,
	apiKey: string,
	orderId: string,
): Promise<any> {
	try {
		const { data } = await axios.post(
			apiUrl,
			new URLSearchParams({ key: apiKey, action: "status", order: orderId }),
			{
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				timeout: 10000,
			},
		);

		if (data?.error) {
			throw new Error(`Provider Error: ${data.error}`);
		}

		return data;
	} catch (error) {
		throw new Error(
			handleProviderError(
				error,
				`Failed to sync tracking log metrics for position ID ${orderId}`,
			),
		);
	}
}

/**
 * Checks batch structural arrays of user transactions simultaneously.
 */
export async function getProviderOrdersStatus(
	apiUrl: string,
	apiKey: string,
	orderIds: string[],
): Promise<any> {
	try {
		if (orderIds.length === 0) return {};

		const { data } = await axios.post(
			apiUrl,
			new URLSearchParams({
				key: apiKey,
				action: "status",
				orders: orderIds.join(","),
			}),
			{
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				timeout: 15000,
			},
		);

		if (data?.error) {
			throw new Error(`Provider Error: ${data.error}`);
		}

		return data;
	} catch (error) {
		throw new Error(
			handleProviderError(
				error,
				"Batch order tracking synchronization step failed.",
			),
		);
	}
}

/**
 * Pulls available remaining financial balance lines.
 */
export async function getProviderBalance(
	apiUrl: string,
	apiKey: string,
): Promise<{ balance: string; currency: string; [key: string]: any }> {
	try {
		const { data } = await axios.post(
			apiUrl,
			new URLSearchParams({ key: apiKey, action: "balance" }),
			{
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				timeout: 10000,
			},
		);

		if (data?.error) {
			throw new Error(`Provider Error: ${data.error}`);
		}

		if (!data || data.balance === undefined) {
			throw new Error("Invalid structure returned from balance query gateway.");
		}

		return data;
	} catch (error) {
		throw new Error(
			handleProviderError(
				error,
				"Failed to resolve provider ledger balance coordinates.",
			),
		);
	}
}

/**
 * Verifies if the credentials provided connect properly and returns system validation diagnostics.
 */
export async function verifyProvider(
	apiUrl: string,
	apiKey: string,
): Promise<{ success: boolean; balance?: string; error?: string }> {
	try {
		const data = await getProviderBalance(apiUrl, apiKey);

		return {
			success: true,
			balance: String(data.balance ?? "0.00"),
		};
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Provider verification connection handshake failed.",
		};
	}
}
