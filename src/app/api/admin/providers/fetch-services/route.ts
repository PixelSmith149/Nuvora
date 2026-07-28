// app/api/admin/providers/fetch-services/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { providerId, apiUrl, apiKey } = body;

		if (!providerId || !apiUrl || !apiKey) {
			return NextResponse.json(
				{ error: "Provider ID, API URL, and API Key are required" },
				{ status: 400 },
			);
		}

		// ─── Normalize the base URL ──────────────────────────────────────
		let baseUrl = apiUrl.replace(/\/+$/, ""); // Remove trailing slashes

		// Auto-correct common JAP base URL mistakes
		if (baseUrl.includes("justanotherpanel.com") || baseUrl.includes("jap.")) {
			if (!baseUrl.includes("/api/v2")) {
				if (baseUrl.endsWith("/api")) {
					baseUrl = `${baseUrl}/v2`;
				} else {
					baseUrl = `${baseUrl}/api/v2`;
				}
			}
		}

		// ─── Correct JAP / PerfectPanel style endpoint ───────────────────
		// Most SMM panels (including JAP) use: ?action=services&key=API_KEY
		const requestUrl = `${baseUrl}?action=services&key=${apiKey}`;

		console.log(
			`📡 Fetching services from: ${requestUrl.replace(apiKey, "***")}`,
		);

		const response = await fetch(requestUrl, {
			method: "GET",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
				Accept: "application/json",
				"Accept-Language": "en-US,en;q=0.9",
			},
			next: { revalidate: 0 },
		});

		const responseText = await response.text();

		// ─── Check for HTML / CAPTCHA / Cloudflare ───────────────────────
		if (
			responseText.includes("<!DOCTYPE") ||
			responseText.includes("<html") ||
			responseText.toLowerCase().includes("captcha") ||
			responseText.toLowerCase().includes("cloudflare") ||
			responseText.toLowerCase().includes("ddos")
		) {
			return NextResponse.json(
				{
					error:
						"Provider returned HTML instead of JSON (CAPTCHA / Cloudflare / DDoS protection)",
					suggestions: [
						"Verify the API key is correct and has API access",
						"Try the request from a different IP / server",
						"Contact the provider and ask them to whitelist your server IP",
					],
					preview: responseText.substring(0, 300),
					requestUrl: requestUrl.replace(apiKey, "***"),
				},
				{ status: 400 },
			);
		}

		// ─── Parse JSON ──────────────────────────────────────────────────
		let data: any;
		try {
			data = JSON.parse(responseText);
		} catch (e) {
			return NextResponse.json(
				{
					error: "Invalid JSON response from provider",
					preview: responseText.substring(0, 400),
					requestUrl: requestUrl.replace(apiKey, "***"),
				},
				{ status: 500 },
			);
		}

		// ─── Handle Provider API Errors ──────────────────────────────────
		// JAP and many panels return: { "error": "..." }
		if (data.error || data.status === "error") {
			return NextResponse.json(
				{
					error: `Provider API error: ${data.error || data.message || "Unknown error"}`,
					details: data.message || data.description || null,
					code: data.code || null,
					full_response: data,
					requestUrl: requestUrl.replace(apiKey, "***"),
				},
				{ status: 400 },
			);
		}

		// ─── Extract services (supports multiple response formats) ───────
		let services: any[] = [];

		if (Array.isArray(data)) {
			// Some panels return a pure array
			services = data;
		} else if (Array.isArray(data.services)) {
			services = data.services;
		} else if (data.services && typeof data.services === "object") {
			// Object keyed by service ID
			services = Object.entries(data.services).map(
				([id, service]: [string, any]) => ({
					id,
					...service,
				}),
			);
		} else if (Array.isArray(data.data)) {
			services = data.data;
		} else if (data.data && typeof data.data === "object") {
			services = Object.entries(data.data).map(
				([id, service]: [string, any]) => ({
					id,
					...service,
				}),
			);
		} else {
			// Fallback: look for common keys
			for (const key of ["items", "list", "results", "services_list"]) {
				if (Array.isArray(data[key])) {
					services = data[key];
					break;
				}
			}
		}

		if (services.length === 0) {
			return NextResponse.json(
				{
					error: "No services found in API response",
					data_keys: Object.keys(data),
					data_sample: JSON.stringify(data).substring(0, 600),
					requestUrl: requestUrl.replace(apiKey, "***"),
				},
				{ status: 404 },
			);
		}

		// ─── Normalize services ──────────────────────────────────────────
		const normalizedServices = services.map((service: any) => ({
			external_service_id: String(
				service.service || service.id || service.service_id || "",
			),
			name:
				service.name || service.service || service.title || "Unnamed Service",
			category: service.category || service.type || "other",
			rate: parseFloat(service.rate || service.price || service.cost || 0),
			min_qty: parseInt(service.min || service.min_qty || service.minimum || 0),
			max_qty: parseInt(service.max || service.max_qty || service.maximum || 0),
			refill: Boolean(
				service.refill && service.refill !== "0" && service.refill !== 0,
			),
			cancel: Boolean(
				service.cancel && service.cancel !== "0" && service.cancel !== 0,
			),
			active:
				service.active !== "0" &&
				service.active !== false &&
				service.active !== 0,
			avg_time:
				service.avg_time || service.time || service.delivery_time || null,
			avg_time_minutes: extractMinutes(
				service.avg_time || service.time || service.delivery_time || "",
			),
			raw: service,
		}));

		console.log(
			`✅ Successfully fetched ${normalizedServices.length} services`,
		);

		return NextResponse.json({
			success: true,
			providerId,
			total_fetched: services.length,
			total_normalized: normalizedServices.length,
			requestUrl: requestUrl.replace(apiKey, "***"),
			services: normalizedServices,
		});
	} catch (error: any) {
		console.error("Fetch services error:", error);
		return NextResponse.json(
			{
				error: error.message || "Failed to fetch services",
				details: error.stack || null,
			},
			{ status: 500 },
		);
	}
}

// ─── Helper: Extract average minutes ─────────────────────────────────
function extractMinutes(timeStr: string): number | null {
	if (!timeStr) return null;
	const lower = timeStr.toLowerCase();

	if (
		lower.includes("instant") ||
		lower.includes("immediate") ||
		lower.includes("now")
	) {
		return 1;
	}

	const minuteMatch = timeStr.match(/(\d+)\s*min/i);
	if (minuteMatch) return parseInt(minuteMatch[1]);

	const hourMatch = timeStr.match(/(\d+)\s*(hour|hr)/i);
	if (hourMatch) return parseInt(hourMatch[1]) * 60;

	const rangeMatch = timeStr.match(
		/(\d+)\s*[-–]\s*(\d+)\s*(hour|hr|min|minute)/i,
	);
	if (rangeMatch) {
		const avg = (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2;
		const unit = rangeMatch[3].toLowerCase();
		return unit.startsWith("h") ? Math.round(avg * 60) : Math.round(avg);
	}

	return null;
}
