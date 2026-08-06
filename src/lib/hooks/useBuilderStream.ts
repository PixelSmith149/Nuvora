// lib/hooks/useBuilderStream.ts

"use client";

import { useCallback, useRef, useState } from "react";

interface StreamChunk {
	type: "start" | "chunk" | "complete" | "error";
	content?: string;
	message?: string;
	canResume?: boolean;
	partialHtml?: string;
	progress?: number;
}

interface UseBuilderStreamReturn {
	isGenerating: boolean;
	htmlBuffer: string;
	error: string | null;
	canResume: boolean;
	partialHtml: string;
	startGeneration: (siteId: string, blueprint: any) => Promise<void>;
	resumeGeneration: (siteId: string, blueprint: any) => Promise<void>;
	reset: () => void;
}

export function useBuilderStream(): UseBuilderStreamReturn {
	const [isGenerating, setIsGenerating] = useState(false);
	const [htmlBuffer, setHtmlBuffer] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [canResume, setCanResume] = useState(false);
	const [partialHtml, setPartialHtml] = useState("");
	const abortControllerRef = useRef<AbortController | null>(null);

	const reset = useCallback(() => {
		setHtmlBuffer("");
		setError(null);
		setIsGenerating(false);
		setCanResume(false);
		setPartialHtml("");
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
	}, []);

	const runStream = useCallback(
		async (
			siteId: string,
			blueprint: any,
			resume = false,
			existingPartial = "",
		) => {
			setIsGenerating(true);
			setError(null);
			setCanResume(false);

			if (!resume) {
				setHtmlBuffer("");
				setPartialHtml("");
			}

			try {
				const controller = new AbortController();
				abortControllerRef.current = controller;

				const response = await fetch("/api/st/generate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						siteId,
						blueprint,
						resume,
						partialHtml: existingPartial,
					}),
					signal: controller.signal,
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(errorData.error || "Generation failed");
				}

				const reader = response.body?.getReader();
				if (!reader) {
					throw new Error("No response body");
				}

				const decoder = new TextDecoder();
				let buffer = resume ? existingPartial : "";

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value);
					const lines = chunk.split("\n");

					for (const line of lines) {
						if (line.startsWith("data: ")) {
							const jsonStr = line.slice(6);
							try {
								const data: StreamChunk = JSON.parse(jsonStr);

								if (data.type === "chunk" && data.content) {
									buffer += data.content;
									setHtmlBuffer(buffer);
								} else if (data.type === "complete") {
									setIsGenerating(false);
									setHtmlBuffer(buffer);
									setCanResume(false);
									setPartialHtml("");
								} else if (data.type === "error") {
									setError(data.message || data.content || "Generation error");
									setIsGenerating(false);
									setCanResume(!!data.canResume);
									setPartialHtml(data.partialHtml || buffer);
								}
							} catch {
								// ignore parse errors on partial lines
							}
						}
					}
				}

				setIsGenerating(false);
			} catch (err: any) {
				if (err.name === "AbortError") return;

				setError(err.message || "Generation failed");
				setIsGenerating(false);
				setCanResume(true);
				setPartialHtml((prev) => prev || htmlBuffer);
			}
		},
		[htmlBuffer],
	);

	const startGeneration = useCallback(
		async (siteId: string, blueprint: any) => {
			reset();
			await runStream(siteId, blueprint, false, "");
		},
		[reset, runStream],
	);

	const resumeGeneration = useCallback(
		async (siteId: string, blueprint: any) => {
			await runStream(siteId, blueprint, true, partialHtml || htmlBuffer);
		},
		[runStream, partialHtml, htmlBuffer],
	);

	return {
		isGenerating,
		htmlBuffer,
		error,
		canResume,
		partialHtml,
		startGeneration,
		resumeGeneration,
		reset,
	};
}