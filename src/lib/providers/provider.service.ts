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

export type CreateProviderOrderOptions = {
  username?: string;
  min?: number;
  max?: number;
  runs?: number;
  isAuto?: boolean;
};

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
        timeout: 15000,
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
 * For Auto services, pass options.username (+ options.runs when required by the panel).
 */
export async function createProviderOrder(
  apiUrl: string,
  apiKey: string,
  service: string,
  link: string,
  quantity: number,
  options?: CreateProviderOrderOptions,
): Promise<{ providerOrderId: string; raw: any }> {
  try {
    const params: Record<string, string> = {
      key: apiKey,
      action: "add",
      service: String(service),
      link: String(link),
    };

    const isAuto = Boolean(options?.isAuto || options?.username);

    if (isAuto) {
      const username = (options?.username || "").trim().replace(/^@/, "");
      if (!username) {
        throw new Error("Missing username");
      }
      params.username = username;

      // JAP Auto: require min + max (min < max)
      const min = Number(options?.min);
      const max = Number(options?.max);

      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        throw new Error("Auto services require min and max quantity.");
      }
      if (min <= 0 || max <= 0) {
        throw new Error("Auto min/max must be greater than 0.");
      }
      if (min >= max) {
        throw new Error("Auto quantity min must be less than max.");
      }

      params.min = String(Math.floor(min));
      params.max = String(Math.floor(max));

      // Some panels still want quantity; if yours rejects it, remove this line
      // params.quantity = String(Math.floor(min));

      if (options?.runs != null && Number(options.runs) > 0) {
        params.runs = String(Math.floor(Number(options.runs)));
      }
    } else {
      // Normal (non-auto) services
      params.quantity = String(quantity);
    }

    const { data } = await axios.post(apiUrl, new URLSearchParams(params), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 20000,
    });

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