// lib/st/services/planner.service.ts

import { PLANNER_SYSTEM_PROMPT } from "@/lib/st/prompts/planner-prompt";
import type { ChatMessage, SiteBlueprint } from "@/lib/st/types";
import {
	isBlueprintReady,
	normalizeBlueprint,
} from "@/lib/st/services/blueprint.service";
import { type AIMessage, getAIService } from "./ai.service";

export interface PlannerResponse {
	message: string;
	blueprint?: SiteBlueprint;
	isComplete: boolean;
	shouldConfirm?: boolean;
}

export async function processPlannerMessage(
	messages: ChatMessage[],
	currentBlueprint?: SiteBlueprint | null,
): Promise<PlannerResponse> {
	const ai = getAIService();

	const aiMessages: AIMessage[] = [
		{ role: "system", content: PLANNER_SYSTEM_PROMPT },
		...messages.map(
			(m): AIMessage => ({
				role: m.role === "assistant" ? "assistant" : "user",
				content: m.content,
			}),
		),
	];

	try {
		let fullResponse = "";
		const stream = await ai.streamChat(aiMessages);

		for await (const chunk of stream) {
			fullResponse += chunk;
		}

		let blueprint: SiteBlueprint | undefined;
		let isComplete = false;
		let shouldConfirm = false;

		// 1. Try to extract JSON (supports both fenced and raw JSON)
		const jsonMatch =
			fullResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
			fullResponse.match(/\{[\s\S]*"brand_name"[\s\S]*\}/);

		if (jsonMatch) {
			try {
				const raw = JSON.parse(jsonMatch[1] || jsonMatch[0]);
				const normalized = normalizeBlueprint(raw);

				if (isBlueprintReady(normalized)) {
					blueprint = normalized;
					isComplete = true;
				} else {
					// Partial blueprint – keep it but do not mark complete
					blueprint = normalized;
				}
			} catch {
				// JSON parse failed – continue without blueprint
			}
		}

		// 2. Explicit confirmation signals from the model
		const lower = fullResponse.toLowerCase();
		if (
			lower.includes("does this look correct") ||
			lower.includes("are you happy with this plan") ||
			lower.includes("ready to build") ||
			lower.includes("shall i proceed")
		) {
			shouldConfirm = true;
		}

		// 3. If we already have a ready blueprint from previous turns, preserve it
		if (!blueprint && currentBlueprint && isBlueprintReady(currentBlueprint)) {
			blueprint = currentBlueprint;
		}

		// Clean the visible message: remove the raw JSON block so the user sees only natural language
		let cleanMessage = fullResponse
			.replace(/```json\s*[\s\S]*?\s*```/g, "")
			.trim();

		if (!cleanMessage) {
			cleanMessage = isComplete
				? "Your website blueprint is ready. Click Build when you are happy with it."
				: fullResponse;
		}

		return {
			message: cleanMessage,
			blueprint: blueprint || currentBlueprint || undefined,
			isComplete,
			shouldConfirm,
		};
	} catch (error) {
		console.error("Planner error:", error);
		return {
			message:
				"I'm having trouble processing your request right now. Please try again in a moment.",
			isComplete: false,
			shouldConfirm: false,
		};
	}
}