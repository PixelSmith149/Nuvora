// lib/st/services/generator.service.ts

import { GENERATOR_SYSTEM_PROMPT } from "@/lib/st/prompts/generator-prompt";
import type { SiteBlueprint } from "@/lib/st/types";
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

	const systemPrompt = GENERATOR_SYSTEM_PROMPT.replace(
		"{blueprint_json}",
		JSON.stringify(blueprint, null, 2),
	);

	const userMessage = "Generate a complete website based on this blueprint.";

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
					'🚧 Our AI engine is currently experiencing heavy traffic. Your website progress has been saved. Click "Resume" to continue building.',
				progress: 0,
			};
		} else {
			yield {
				type: "error",
				content: `❌ ${error?.message || "An unexpected error occurred. Please try again."}`,
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

	const systemPrompt = `
You are completing a partially generated website. Continue from where you left off.

The current HTML is:
${partialHtml}

Complete the remaining sections based on this blueprint:
${JSON.stringify(blueprint, null, 2)}

Continue from where the HTML stopped. Do NOT repeat what's already written.
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
				"❌ Failed to resume generation. Please try again from the beginning.",
			progress: 0,
		};
	}
}
