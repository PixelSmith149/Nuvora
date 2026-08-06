// lib/st/services/generator.service.ts

import { GENERATOR_SYSTEM_PROMPT } from "@/lib/st/prompts/generator-prompt";
import type { SiteBlueprint } from "@/lib/st/types";
import {
	createBuildPrompt,
	isBlueprintReady,
	normalizeBlueprint,
} from "@/lib/st/services/blueprint.service";
import { getAIService } from "./ai.service";

export interface GenerateStreamChunk {
	type: "start" | "chunk" | "complete" | "error";
	content: string;
	progress?: number;
}

export async function* generateWebsiteStream(
	blueprint: SiteBlueprint,
): AsyncGenerator<GenerateStreamChunk> {
	const ai = getAIService();

	// Always normalize + validate before generation
	const cleanBlueprint = normalizeBlueprint(blueprint);

	if (!isBlueprintReady(cleanBlueprint)) {
		yield {
			type: "error",
			content:
				"Blueprint is incomplete. Please finish the planning conversation first.",
			progress: 0,
		};
		return;
	}

	const buildPrompt = createBuildPrompt(cleanBlueprint);

	const systemPrompt = GENERATOR_SYSTEM_PROMPT.replace(
		"{blueprint_json}",
		buildPrompt,
	);

	const userMessage =
		"Generate a complete, production-ready website based on this blueprint. Return ONLY valid HTML.";

	yield {
		type: "start",
		content: "Starting website generation...",
		progress: 0,
	};

	try {
		let fullHtml = "";
		let chunkCount = 0;

		const stream = await ai.streamGeneration(systemPrompt, userMessage);

		for await (const chunk of stream) {
			fullHtml += chunk;
			chunkCount++;

			yield {
				type: "chunk",
				content: chunk,
				progress: Math.min(chunkCount / 50, 0.9),
			};
		}

		// Basic sanity check
		if (!fullHtml.includes("<!DOCTYPE html") && !fullHtml.includes("<html")) {
			yield {
				type: "error",
				content:
					"Generation produced invalid HTML. Please try again or adjust the blueprint.",
				progress: 0,
			};
			return;
		}

		yield {
			type: "complete",
			content: fullHtml,
			progress: 1,
		};
	} catch (error: any) {
		console.error("Generation error:", error);

		const isRetryable =
			error?.message?.includes("rate limit") ||
			error?.message?.includes("timeout") ||
			error?.status === 429 ||
			error?.status === 503;

		if (isRetryable) {
			yield {
				type: "error",
				content:
					'Our AI engine is currently experiencing heavy traffic. Your progress has been saved. Click "Resume" to continue.',
				progress: 0,
			};
		} else {
			yield {
				type: "error",
				content: error?.message || "An unexpected error occurred. Please try again.",
				progress: 0,
			};
		}
	}
}

export async function* resumeGeneration(
	blueprint: SiteBlueprint,
	partialHtml: string,
): AsyncGenerator<GenerateStreamChunk> {
	const ai = getAIService();
	const cleanBlueprint = normalizeBlueprint(blueprint);
	const buildPrompt = createBuildPrompt(cleanBlueprint);

	const systemPrompt = `
You are completing a partially generated website. Continue from where you left off.

Current HTML so far:
${partialHtml}

Complete the remaining sections based on this blueprint:
${buildPrompt}

Continue from where the HTML stopped. Do NOT repeat what is already written.
Return only the continuation (or the full completed document if easier).
`;

	yield {
		type: "start",
		content: "Resuming website generation...",
		progress: 0,
	};

	try {
		let fullHtml = partialHtml;
		let chunkCount = 0;

		const stream = await ai.streamGeneration(
			systemPrompt,
			"Complete the remaining sections.",
		);

		for await (const chunk of stream) {
			fullHtml += chunk;
			chunkCount++;

			yield {
				type: "chunk",
				content: chunk,
				progress: Math.min(chunkCount / 30, 0.95),
			};
		}

		yield {
			type: "complete",
			content: fullHtml,
			progress: 1,
		};
	} catch (error: any) {
		console.error("Resume generation error:", error);
		yield {
			type: "error",
			content:
				"Failed to resume generation. Please try again from the beginning.",
			progress: 0,
		};
	}
}