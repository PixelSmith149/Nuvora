// app/api/st/planner/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getAIService } from "@/lib/st/services/ai.service";
import { processPlannerMessage } from "@/lib/st/services/planner.service";
import { createClient } from "@/lib/supabase/server";


		// Simple in-memory rate limit (per user)
    const plannerRateLimit = new Map<string, { count: number; resetAt: number }>();
    const PLANNER_LIMIT = 20; // max messages per window
    const PLANNER_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
	
export async function POST(req: NextRequest) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Soft rate limit
const now = Date.now();
const userLimit = plannerRateLimit.get(user.id);

if (userLimit && now < userLimit.resetAt) {
	if (userLimit.count >= PLANNER_LIMIT) {
		return NextResponse.json(
			{
				error:
					"You're sending messages too quickly. Please wait a few minutes before continuing the conversation.",
				type: "rate_limited",
			},
			{ status: 429 },
		);
	}
	userLimit.count += 1;
} else {
	plannerRateLimit.set(user.id, {
		count: 1,
		resetAt: now + PLANNER_WINDOW_MS,
	});
}

	try {
		const body = await req.json();
		const { messages, siteId, blueprint } = body;

		if (!messages || !Array.isArray(messages) || messages.length === 0) {
			return NextResponse.json(
				{ error: "Messages are required" },
				{ status: 400 },
			);
		}

		// Check AI health
		const ai = getAIService();
		const health = await ai.healthCheck();

		if (!health.healthy) {
			return NextResponse.json(
				{
					error:
						"AI service temporarily unavailable. Please try again in a few minutes.",
					type: "ai_unavailable",
				},
				{ status: 503 },
			);
		}

		// Process the message with the planner
		const response = await processPlannerMessage(messages, blueprint);

		// ✅ Save chat message to site if siteId provided
		if (siteId) {
			// Verify site belongs to user
			const { data: site, error: siteError } = await supabase
				.from("user_sites")
				.select("blueprint, chat_history")
				.eq("id", siteId)
				.eq("user_id", user.id)
				.single();

			if (!siteError && site) {
				// Get the last user message and assistant response
				const lastUserMessage = messages.filter((m) => m.role === "user").pop();
				const assistantMessage = {
					role: "assistant",
					content: response.message,
					timestamp: new Date().toISOString(),
				};

				// Build chat history
				const chatHistory = site.chat_history || [];

				// Add user message if exists and not already saved
				if (lastUserMessage) {
					chatHistory.push({
						role: "user",
						content: lastUserMessage.content,
						timestamp: lastUserMessage.timestamp || new Date().toISOString(),
					});
				}

				// Add assistant response
				chatHistory.push(assistantMessage);

				// Update site with new chat history
				await supabase
					.from("user_sites")
					.update({
						chat_history: chatHistory,
						blueprint: {
							...site.blueprint,
							...(response.blueprint || {}),
						},
						updated_at: new Date().toISOString(),
					})
					.eq("id", siteId);
			}
		}

		return NextResponse.json({
			response: response.message,
			blueprint: response.blueprint,
			isComplete: response.isComplete,
			shouldConfirm: response.shouldConfirm,
		});
	} catch (error: any) {
		console.error("Planner error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to process request" },
			{ status: 500 },
		);
	}
}
