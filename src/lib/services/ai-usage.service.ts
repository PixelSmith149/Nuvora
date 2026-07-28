// lib/services/ai-usage.service.ts

import { createClient } from "@supabase/supabase-js";

interface AIUsageLog {
	buildId?: string;
	userId?: string;
	tokens: number;
	cost: number;
	model: string;
	endpoint: "planner" | "generator" | "editor";
	meta?: Record<string, any>;
}

export async function logAIUsage(log: AIUsageLog): Promise<void> {
	const supabaseAdmin = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	);

	try {
		const { error } = await supabaseAdmin.from("ai_usage_logs").insert({
			build_id: log.buildId || null,
			user_id: log.userId || null,
			tokens: log.tokens,
			cost: log.cost,
			model: log.model,
			endpoint: log.endpoint,
			meta: log.meta || {},
			created_at: new Date().toISOString(),
		});

		if (error) {
			console.error("Failed to log AI usage:", error);
		}
	} catch (error) {
		console.error("AI usage logging error:", error);
	}
}

export function calculateCost(
	tokens: number,
	model: string = "gpt-4o-mini",
): number {
	const rates: Record<string, number> = {
		"gpt-4o-mini": 0.00000015, // $0.15 per 1M tokens
		"gpt-4o": 0.000005, // $5.00 per 1M tokens
		"claude-3-haiku": 0.00000025, // $0.25 per 1M tokens
		"claude-3-sonnet": 0.000003, // $3.00 per 1M tokens
		"gemini-flash": 0.00000035, // $0.35 per 1M tokens
		"gemini-pro": 0.0000025, // $2.50 per 1M tokens
	};

	return tokens * (rates[model] || rates["gpt-4o-mini"]);
}
