// lib/st/services/template.client.ts
"use client";

import type { Template } from "@/lib/st/types/templates-animation";

// ─── Get templates for current user ──────────────────────────────────
export async function getTemplatesClient(): Promise<Template[]> {
	const response = await fetch("/api/st/t-a/templates", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to fetch templates");
	}

	const data = await response.json();
	return data.templates || [];
}

// ─── Get template stats ───────────────────────────────────────────────
export async function getTemplateStatsClient(): Promise<{
	total: number;
	published: number;
	drafts: number;
	public: number;
}> {
	const response = await fetch("/api/st/t-a/templates/stats", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to fetch template stats");
	}

	return response.json();
}

export async function createTemplateClient(
	userId: string,
	data: Partial<Template>,
): Promise<Template> {
	const response = await fetch("/api/st/t-a/templates", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ userId, ...data }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to create template");
	}

	const result = await response.json();
	return result.template;
}
