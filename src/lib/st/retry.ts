// lib/st/utils/retry.ts

/**
 * Exponential backoff retry utility with jitter
 * Handles 429 (Rate Limit) and 503 (Service Unavailable) errors
 */

export interface RetryOptions {
	maxRetries?: number;
	initialDelay?: number;
	maxDelay?: number;
	backoffFactor?: number;
	retryableStatuses?: number[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
	maxRetries: 3,
	initialDelay: 1000, // 1 second
	maxDelay: 30000, // 30 seconds
	backoffFactor: 2,
	retryableStatuses: [429, 503, 408, 500, 502, 504],
};

export async function withRetry<T>(
	fn: () => Promise<T>,
	options: RetryOptions = {},
): Promise<T> {
	const config = { ...DEFAULT_OPTIONS, ...options };
	let lastError: Error | null = null;
	let delay = config.initialDelay;

	for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error: any) {
			lastError = error;

			// Check if error is retryable
			const statusCode =
				error?.status || error?.statusCode || error?.response?.status;
			const isRetryable =
				config.retryableStatuses.includes(statusCode) ||
				error?.message?.includes("rate limit") ||
				error?.message?.includes("timeout") ||
				error?.message?.includes("overloaded");

			if (!isRetryable || attempt === config.maxRetries) {
				break;
			}

			// Calculate delay with jitter
			const jitter = Math.random() * 0.3 + 0.85; // 0.85 - 1.15
			const waitTime = Math.min(delay * jitter, config.maxDelay);

			console.log(
				`[Retry] Attempt ${attempt + 1}/${config.maxRetries} failed. Retrying in ${Math.round(waitTime)}ms...`,
			);

			await new Promise((resolve) => setTimeout(resolve, waitTime));
			delay = Math.min(delay * config.backoffFactor, config.maxDelay);
		}
	}

	throw lastError || new Error("Operation failed after retries");
}

export function isRetryableError(error: any): boolean {
	const status = error?.status || error?.statusCode || error?.response?.status;
	return (
		[429, 503, 408, 500, 502, 504].includes(status) ||
		error?.message?.includes("rate limit") ||
		error?.message?.includes("timeout") ||
		error?.message?.includes("overloaded")
	);
}
