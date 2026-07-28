// lib/st/services/planner.service.ts

import { PLANNER_SYSTEM_PROMPT } from "@/lib/st/prompts/planner-prompt";
import type { ChatMessage, SiteBlueprint } from "@/lib/st/types";
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

	// ✅ Fix: Properly type the messages conversion
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

		const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/);
		if (jsonMatch) {
			try {
				const parsed = JSON.parse(jsonMatch[1]);
				blueprint = parsed;
				isComplete = true;
			} catch {
				// JSON parse failed, but we still have the message
			}
		}

		if (
			fullResponse.includes("satisfied") ||
			fullResponse.includes("happy with")
		) {
			shouldConfirm = true;
		}

		return {
			message: fullResponse,
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

export async function detectSectionToEdit(
	userMessage: string,
	currentHtml: string,
): Promise<string | null> {
	const ai = getAIService();

	const prompt = `
Given the user message and the current HTML, identify which section they want to edit.

User message: "${userMessage}"

Current HTML is ${currentHtml.length} characters long.

Return ONLY the section name (one of: hero, about, services, products, testimonials, pricing, contact) or "unknown" if you can't determine it.
`;

	try {
		const response = await ai.generateEdit(
			prompt,
			"Identify the section to edit.",
			{
				maxTokens: 50,
				temperature: 0.1,
			},
		);

		const section = response.trim().toLowerCase();
		const validSections = [
			"hero",
			"about",
			"services",
			"products",
			"testimonials",
			"pricing",
			"contact",
		];

		if (validSections.includes(section)) {
			return section;
		}
		return null;
	} catch (error) {
		console.error("Section detection error:", error);
		return null;
	}
}

export async function generateEditHtml(
	section: string,
	newContent: string,
	currentHtml: string,
): Promise<string> {
	const ai = getAIService();

	const prompt = `
Update the "${section}" section in the following HTML.

Current HTML:
${currentHtml}

New content for ${section}:
${newContent}

Return ONLY the updated section HTML.
`;

	try {
		const result = await ai.generateEdit(prompt, "Update the section.", {
			maxTokens: 4096,
			temperature: 0.2,
		});
		return result;
	} catch (error) {
		console.error("Edit generation error:", error);
		return currentHtml;
	}
}
