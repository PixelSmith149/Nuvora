// lib/st/services/ai.service.ts

import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import OpenAI from "openai";
import type {
	ChatCompletion,
	ChatCompletionChunk,
} from "openai/resources/chat/completions";
import { calculateCost, logAIUsage } from "@/lib/services/ai-usage.service";
import { withRetry } from "@/lib/st/retry";

// ─── Configuration ──────────────────────────────────────────────

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!OPENAI_API_KEY) {
	console.warn(
		"⚠️ OPENAI_API_KEY is not set. AI features will fall back to Claude.",
	);
}

// ─── OpenAI Client ──────────────────────────────────────────────

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
	timeout: 60000,
	maxRetries: 0,
});

// ─── Anthropic Client ───────────────────────────────────────────

const anthropic = new Anthropic({
	apiKey: ANTHROPIC_API_KEY,
	timeout: 60000,
	maxRetries: 0,
});

if (!OPENAI_API_KEY && !ANTHROPIC_API_KEY) {
	console.warn("⚠️ No AI API keys configured. AI features will be disabled.");
}

// ─── Model Configurations ──────────────────────────────────────

export const AI_MODELS = {
	primary: {
		chat: "gpt-4o-2024-08-06",
		generation: "gpt-4o-2024-08-06",
		edit: "gpt-4o-2024-08-06",
		maxTokens: {
			chat: 4096,
			generation: 16384,
			edit: 4096,
		},
	},
	fallback: {
		chat: "claude-3-5-haiku-20241022",
		generation: "claude-3-5-haiku-20241022",
		edit: "claude-3-5-haiku-20241022",
		maxTokens: {
			chat: 4096,
			generation: 16384,
			edit: 4096,
		},
	},
};

// ─── Types ──────────────────────────────────────────────────────

export interface AIMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export interface AIStreamOptions {
	model?: string;
	maxTokens?: number;
	temperature?: number;
	stream?: boolean;
	userId?: string;
	buildId?: string;
	endpoint?: "planner" | "generator" | "editor";
}

// ─── Core AI Service ────────────────────────────────────────────

export class AIService {
	private usePrimary: boolean = true;
	private lastError: Error | null = null;

	// ─── Private Helpers: Type Adapters ───────────────────────────

	private toOpenAIMessages(
		messages: AIMessage[],
	): OpenAI.Chat.ChatCompletionMessageParam[] {
		return messages.map((m) => ({
			role:
				m.role === "system"
					? "system"
					: m.role === "assistant"
						? "assistant"
						: "user",
			content: m.content,
		}));
	}

	private toAnthropicMessages(messages: AIMessage[]): Anthropic.MessageParam[] {
		return messages
			.filter((m) => m.role !== "system")
			.map((m) => ({
				role: m.role === "assistant" ? "assistant" : "user",
				content: m.content,
			}));
	}

	// ─── Public Methods ────────────────────────────────────────────

	// ✅ FIX 1: Added '*' and changed return type to AsyncGenerator<string>
	async *streamChat(
		messages: AIMessage[],
		options: AIStreamOptions = {},
	): AsyncGenerator<string> {
		const {
			model = AI_MODELS.primary.chat,
			maxTokens = AI_MODELS.primary.maxTokens.chat,
			temperature = 0.7,
			stream = true,
			userId,
			buildId,
			endpoint = "planner",
		} = options;

		let totalTokens = 0;
		let fullResponse = "";
		let usedModel = model;
		let usedProvider: "openai" | "anthropic" = "openai";
		let promptTokens = 0;
		let completionTokens = 0;

		try {
			const generator = this.streamOpenAI(messages, {
				model,
				maxTokens,
				temperature,
				stream,
			});
			for await (const chunk of generator) {
				fullResponse += chunk;
				yield chunk;
			}

			totalTokens = Math.ceil(fullResponse.length / 4);
			promptTokens = Math.ceil(
				messages.reduce((sum, m) => sum + m.content.length, 0) / 4,
			);
			completionTokens = totalTokens - promptTokens;
			const cost = calculateCost(totalTokens, model);

			await logAIUsage({
				buildId,
				userId,
				tokens: totalTokens,
				cost,
				model: usedModel,
				endpoint,
				meta: {
					provider: usedProvider,
					messages_count: messages.length,
					prompt_tokens: promptTokens,
					completion_tokens: completionTokens,
				},
			});
		} catch (error) {
			console.warn("⚠️ OpenAI failed, falling back to Claude:", error);
			this.lastError = error as Error;
			this.usePrimary = false;
			usedProvider = "anthropic";
			usedModel = AI_MODELS.fallback.chat;

			const generator = this.streamClaude(messages, {
				model: AI_MODELS.fallback.chat,
				maxTokens: AI_MODELS.fallback.maxTokens.chat,
				temperature,
				stream,
			});
			for await (const chunk of generator) {
				fullResponse += chunk;
				yield chunk;
			}

			totalTokens = Math.ceil(fullResponse.length / 4);
			promptTokens = Math.ceil(
				messages.reduce((sum, m) => sum + m.content.length, 0) / 4,
			);
			completionTokens = totalTokens - promptTokens;
			const cost = calculateCost(totalTokens, AI_MODELS.fallback.chat);

			await logAIUsage({
				buildId,
				userId,
				tokens: totalTokens,
				cost,
				model: AI_MODELS.fallback.chat,
				endpoint,
				meta: {
					provider: usedProvider,
					messages_count: messages.length,
					prompt_tokens: promptTokens,
					completion_tokens: completionTokens,
					fallback: true,
				},
			});
		}
	}

	// ✅ FIX 2: Same fix for streamGeneration
	async *streamGeneration(
		systemPrompt: string,
		userMessage: string,
		options: AIStreamOptions = {},
	): AsyncGenerator<string> {
		const {
			model = AI_MODELS.primary.generation,
			maxTokens = AI_MODELS.primary.maxTokens.generation,
			temperature = 0.3,
			stream = true,
			userId,
			buildId,
			endpoint = "generator",
		} = options;

		const messages: AIMessage[] = [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: userMessage },
		];

		let totalTokens = 0;
		let fullResponse = "";
		let usedModel = model;
		let usedProvider: "openai" | "anthropic" = "openai";
		let promptTokens = 0;
		let completionTokens = 0;

		try {
			const generator = this.streamOpenAI(messages, {
				model,
				maxTokens,
				temperature,
				stream,
			});
			for await (const chunk of generator) {
				fullResponse += chunk;
				yield chunk;
			}

			totalTokens = Math.ceil(fullResponse.length / 4);
			promptTokens = Math.ceil(
				messages.reduce((sum, m) => sum + m.content.length, 0) / 4,
			);
			completionTokens = totalTokens - promptTokens;
			const cost = calculateCost(totalTokens, model);

			await logAIUsage({
				buildId,
				userId,
				tokens: totalTokens,
				cost,
				model: usedModel,
				endpoint,
				meta: {
					provider: usedProvider,
					output_length: fullResponse.length,
					prompt_tokens: promptTokens,
					completion_tokens: completionTokens,
				},
			});
		} catch (error) {
			console.warn(
				"⚠️ OpenAI generation failed, falling back to Claude:",
				error,
			);
			this.lastError = error as Error;
			this.usePrimary = false;
			usedProvider = "anthropic";
			usedModel = AI_MODELS.fallback.generation;

			const generator = this.streamClaude(messages, {
				model: AI_MODELS.fallback.generation,
				maxTokens: AI_MODELS.fallback.maxTokens.generation,
				temperature,
				stream,
			});
			for await (const chunk of generator) {
				fullResponse += chunk;
				yield chunk;
			}

			totalTokens = Math.ceil(fullResponse.length / 4);
			promptTokens = Math.ceil(
				messages.reduce((sum, m) => sum + m.content.length, 0) / 4,
			);
			completionTokens = totalTokens - promptTokens;
			const cost = calculateCost(totalTokens, AI_MODELS.fallback.generation);

			await logAIUsage({
				buildId,
				userId,
				tokens: totalTokens,
				cost,
				model: AI_MODELS.fallback.generation,
				endpoint,
				meta: {
					provider: usedProvider,
					output_length: fullResponse.length,
					prompt_tokens: promptTokens,
					completion_tokens: completionTokens,
					fallback: true,
				},
			});
		}
	}

	// ─── generateEdit (no changes needed, but kept for completeness) ──

	async generateEdit(
		systemPrompt: string,
		userMessage: string,
		options: AIStreamOptions = {},
	): Promise<string> {
		const {
			model = AI_MODELS.primary.edit,
			maxTokens = AI_MODELS.primary.maxTokens.edit,
			temperature = 0.4,
			userId,
			buildId,
			endpoint = "editor",
		} = options;

		const messages: AIMessage[] = [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: userMessage },
		];

		let usedModel = model;
		let usedProvider: "openai" | "anthropic" = "openai";

		try {
			const response = await withRetry<ChatCompletion>(async () => {
				return openai.chat.completions.create({
					model,
					messages: this.toOpenAIMessages(messages),
					max_tokens: maxTokens,
					temperature,
				});
			});

			const content = response.choices[0]?.message?.content || "";
			const tokens =
				response.usage?.total_tokens || Math.ceil(content.length / 4);
			const cost = calculateCost(tokens, model);

			await logAIUsage({
				buildId,
				userId,
				tokens,
				cost,
				model: usedModel,
				endpoint,
				meta: {
					provider: usedProvider,
					output_length: content.length,
					prompt_tokens: response.usage?.prompt_tokens || 0,
					completion_tokens: response.usage?.completion_tokens || 0,
				},
			});

			return content;
		} catch (error) {
			console.warn("⚠️ OpenAI edit failed, falling back to Claude:", error);
			this.lastError = error as Error;
			this.usePrimary = false;
			usedProvider = "anthropic";
			usedModel = AI_MODELS.fallback.edit;

			const response = await withRetry<Anthropic.Message>(async () => {
				return anthropic.messages.create({
					model: AI_MODELS.fallback.edit,
					system: systemPrompt,
					messages: this.toAnthropicMessages(messages),
					max_tokens: AI_MODELS.fallback.maxTokens.edit,
					temperature,
				});
			});

			const content =
				response.content[0]?.type === "text" ? response.content[0].text : "";
			const tokens = Math.ceil(content.length / 4);
			const cost = calculateCost(tokens, AI_MODELS.fallback.edit);

			await logAIUsage({
				buildId,
				userId,
				tokens,
				cost,
				model: AI_MODELS.fallback.edit,
				endpoint,
				meta: {
					provider: usedProvider,
					output_length: content.length,
					fallback: true,
				},
			});

			return content;
		}
	}

	async healthCheck(): Promise<{
		healthy: boolean;
		provider: string;
		error?: string;
	}> {
		try {
			await withRetry<ChatCompletion>(async () => {
				return openai.chat.completions.create({
					model: AI_MODELS.primary.chat,
					messages: [{ role: "user", content: "ping" }],
					max_tokens: 5,
				});
			});
			return { healthy: true, provider: "openai" };
		} catch (error) {
			try {
				await withRetry<Anthropic.Message>(async () => {
					return anthropic.messages.create({
						model: AI_MODELS.fallback.chat,
						messages: [{ role: "user", content: "ping" }],
						max_tokens: 5,
					});
				});
				return { healthy: true, provider: "anthropic" };
			} catch (fallbackError) {
				const errorMessage =
					fallbackError instanceof Error
						? fallbackError.message
						: "Unknown error";
				return { healthy: false, provider: "none", error: errorMessage };
			}
		}
	}

	// ─── Private Stream Methods (already correct) ──────────────────

	private async *streamOpenAI(
		messages: AIMessage[],
		options: {
			model: string;
			maxTokens: number;
			temperature: number;
			stream: boolean;
		},
	): AsyncGenerator<string> {
		const response = await withRetry<
			ChatCompletion | AsyncIterable<ChatCompletionChunk>
		>(async () => {
			return openai.chat.completions.create({
				model: options.model,
				messages: this.toOpenAIMessages(messages),
				max_tokens: options.maxTokens,
				temperature: options.temperature,
				stream: options.stream,
			});
		});

		if (!options.stream) {
			const completion = response as ChatCompletion;
			const content = completion.choices[0]?.message?.content || "";
			yield content;
			return;
		}

		const streamResponse = response as AsyncIterable<ChatCompletionChunk>;
		for await (const chunk of streamResponse) {
			const content = chunk.choices[0]?.delta?.content;
			if (content) {
				yield content;
			}
		}
	}

	private async *streamClaude(
		messages: AIMessage[],
		options: {
			model: string;
			maxTokens: number;
			temperature: number;
			stream: boolean;
		},
	): AsyncGenerator<string> {
		const systemPrompt =
			messages.find((m) => m.role === "system")?.content || "";
		const userMessages = this.toAnthropicMessages(messages);

		const response = await withRetry<
			Anthropic.Message | AsyncIterable<Anthropic.MessageStreamEvent>
		>(async () => {
			return anthropic.messages.create({
				model: options.model,
				system: systemPrompt,
				messages: userMessages,
				max_tokens: options.maxTokens,
				temperature: options.temperature,
				stream: options.stream,
			});
		});

		if (!options.stream) {
			const message = response as Anthropic.Message;
			const content =
				message.content[0]?.type === "text" ? message.content[0].text : "";
			yield content;
			return;
		}

		const streamResponse =
			response as AsyncIterable<Anthropic.MessageStreamEvent>;
		for await (const chunk of streamResponse) {
			if (chunk.type === "content_block_delta") {
				// Narrow the delta type to TextDelta
				const delta = chunk.delta;
				if ("text" in delta && typeof delta.text === "string") {
					yield delta.text;
				}
			}
		}
	}
}

// ─── Singleton Instance ─────────────────────────────────────────

let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
	if (!aiServiceInstance) {
		aiServiceInstance = new AIService();
	}
	return aiServiceInstance;
}

export default getAIService;
