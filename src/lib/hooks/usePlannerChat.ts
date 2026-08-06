// lib/hooks/usePlannerChat.ts

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, SiteBlueprint } from "@/lib/st/types";

interface UsePlannerChatReturn {
	messages: ChatMessage[];
	isTyping: boolean;
	error: string | null;
	sendMessage: (content: string) => Promise<void>;
	resetChat: () => void;
	blueprint: SiteBlueprint | null;
	isComplete: boolean;
	shouldConfirm: boolean;
	isLoadingHistory: boolean;
}

export function usePlannerChat(siteId?: string): UsePlannerChatReturn {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [blueprint, setBlueprint] = useState<SiteBlueprint | null>(null);
	const [isComplete, setIsComplete] = useState(false);
	const [shouldConfirm, setShouldConfirm] = useState(false);
	const [isLoadingHistory, setIsLoadingHistory] = useState(!!siteId);
	const abortControllerRef = useRef<AbortController | null>(null);
	const historyLoadedRef = useRef(false);

	// ─── Load existing chat history + blueprint on mount ───────
	useEffect(() => {
		if (!siteId || historyLoadedRef.current) return;

		const loadHistory = async () => {
			try {
				const res = await fetch(`/api/st/sites/${siteId}`);
				if (!res.ok) return;

				const data = await res.json();
				const site = data.site;

				if (site?.chat_history && Array.isArray(site.chat_history)) {
					const restored: ChatMessage[] = site.chat_history.map(
						(m: any, idx: number) => ({
							id: m.id || `hist-${idx}`,
							role: m.role === "assistant" ? "assistant" : "user",
							content: m.content || "",
							timestamp: m.timestamp || new Date().toISOString(),
						}),
					);
					setMessages(restored);
				}

				if (site?.blueprint && Object.keys(site.blueprint).length > 0) {
					setBlueprint(site.blueprint);
					// If blueprint already has required fields, mark as complete
					if (
						site.blueprint.brand_name &&
						Array.isArray(site.blueprint.sections) &&
						site.blueprint.sections.length > 0
					) {
						setIsComplete(true);
					}
				}
			} catch (err) {
				console.error("Failed to load chat history:", err);
			} finally {
				setIsLoadingHistory(false);
				historyLoadedRef.current = true;
			}
		};

		loadHistory();
	}, [siteId]);

	const resetChat = useCallback(() => {
		setMessages([]);
		setBlueprint(null);
		setIsComplete(false);
		setShouldConfirm(false);
		setError(null);
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
	}, []);

	const sendMessage = useCallback(
		async (content: string) => {
			if (!content.trim()) return;

			const userMessage: ChatMessage = {
				id: crypto.randomUUID(),
				role: "user",
				content: content.trim(),
				timestamp: new Date().toISOString(),
			};

			setMessages((prev) => [...prev, userMessage]);
			setIsTyping(true);
			setError(null);

			try {
				const controller = new AbortController();
				abortControllerRef.current = controller;

				const response = await fetch("/api/st/planner", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						messages: [...messages, userMessage],
						siteId,
						blueprint,
					}),
					signal: controller.signal,
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to get response");
				}

				const data = await response.json();

				const assistantMessage: ChatMessage = {
					id: crypto.randomUUID(),
					role: "assistant",
					content: data.response || "I'm here to help you build your website!",
					timestamp: new Date().toISOString(),
				};

				setMessages((prev) => [...prev, assistantMessage]);

				if (data.blueprint) {
					setBlueprint(data.blueprint);
				}

				setIsComplete(data.isComplete || false);
				setShouldConfirm(data.shouldConfirm || false);
			} catch (err: any) {
				if (err.name === "AbortError") return;
				setError(err.message || "Failed to send message");
			} finally {
				setIsTyping(false);
			}
		},
		[messages, siteId, blueprint],
	);

	return {
		messages,
		isTyping,
		error,
		sendMessage,
		resetChat,
		blueprint,
		isComplete,
		shouldConfirm,
		isLoadingHistory,
	};
}