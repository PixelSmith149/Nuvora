// hooks/useBuilderStream.ts

"use client";

import { useCallback, useRef, useState } from "react";

interface StreamChunk {
	type: "start" | "chunk" | "complete" | "error";
	content: string;
	message?: string;
}

interface UseBuilderStreamReturn {
	isGenerating: boolean;
	htmlBuffer: string;
	error: string | null;
	startGeneration: (siteId: string, blueprint: any) => Promise<void>;
	reset: () => void;
}

export function useBuilderStream(): UseBuilderStreamReturn {
	const [isGenerating, setIsGenerating] = useState(false);
	const [htmlBuffer, setHtmlBuffer] = useState("");
	const [error, setError] = useState<string | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	const reset = useCallback(() => {
		setHtmlBuffer("");
		setError(null);
		setIsGenerating(false);
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
	}, []);

	const startGeneration = useCallback(
		async (siteId: string, blueprint: any) => {
			reset();
			setIsGenerating(true);
			setError(null);
			setHtmlBuffer("");

			try {
				const controller = new AbortController();
				abortControllerRef.current = controller;

				const response = await fetch("/api/st/generate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ siteId, blueprint }),
					signal: controller.signal,
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Generation failed");
				}

				const reader = response.body?.getReader();
				if (!reader) {
					throw new Error("No response body");
				}

				const decoder = new TextDecoder();
				let buffer = "";

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value);
					const lines = chunk.split("\n");

					for (const line of lines) {
						if (line.startsWith("data: ")) {
							const jsonStr = line.slice(6);
							try {
								const data = JSON.parse(jsonStr);
								if (data.type === "chunk") {
									buffer += data.content;
									setHtmlBuffer(buffer);
								} else if (data.type === "complete") {
									setIsGenerating(false);
									setHtmlBuffer(buffer);
								} else if (data.type === "error") {
									setError(data.message || "Generation error");
									setIsGenerating(false);
								}
							} catch (e) {
								// Ignore parse errors
							}
						}
					}
				}

				setIsGenerating(false);
			} catch (err: any) {
				if (err.name === "AbortError") {
					// User cancelled, ignore
					return;
				}
				setError(err.message || "Generation failed");
				setIsGenerating(false);
			}
		},
		[reset],
	);

	return {
		isGenerating,
		htmlBuffer,
		error,
		startGeneration,
		reset,
	};
}
