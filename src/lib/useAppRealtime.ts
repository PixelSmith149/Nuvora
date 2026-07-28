// hooks/useAppRealtime.ts

"use client";

import { useEffect, useRef } from "react";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { RealtimeService } from "@/lib/services/realtime.service";

// ─── Global Realtime Hook ────────────────────────────────────
export function useAppRealtime() {
	const { userId } = useAppSession();
	const serviceRef = useRef(RealtimeService.getInstance());

	useEffect(() => {
		if (!userId) return;

		const service = serviceRef.current;

		// ─── Subscribe to follows ──────────────────────────────
		service.subscribe({
			table: "follows",
			event: "INSERT",
			callback: (payload) => {
				if (payload.new.following_id === userId) {
					window.dispatchEvent(
						new CustomEvent("app:followers-update", { detail: { count: 1 } }),
					);
				}
			},
		});

		// ─── Subscribe to reviews ──────────────────────────────
		service.subscribe({
			table: "asset_reviews",
			event: "INSERT",
			callback: (payload) => {
				if (payload.new.seller_id === userId) {
					window.dispatchEvent(
						new CustomEvent("app:reviews-update", { detail: { count: 1 } }),
					);
				}
			},
		});

		// ─── Subscribe to orders ────────────────────────────────
		service.subscribe({
			table: "global_market_orders",
			event: "UPDATE",
			filter: `seller_id=eq.${userId}`,
			callback: (payload) => {
				if (payload.new.status === "completed") {
					window.dispatchEvent(
						new CustomEvent("app:order-completed", {
							detail: { order: payload.new },
						}),
					);
				}
			},
		});

		// ─── Subscribe to inbox ──────────────────────────────────
		service.subscribe({
			table: "market_inbox_messages",
			event: "INSERT",
			filter: `user_id=eq.${userId}`,
			callback: (payload) => {
				window.dispatchEvent(
					new CustomEvent("app:inbox-update", {
						detail: { message: payload.new },
					}),
				);
			},
		});

		// ─── Subscribe to listings ──────────────────────────────
		service.subscribe({
			table: "market_listings",
			event: "UPDATE",
			callback: (payload) => {
				window.dispatchEvent(
					new CustomEvent("app:listings-update", {
						detail: { listing: payload.new },
					}),
				);
			},
		});

		return () => {
			service.unsubscribeAll();
		};
	}, [userId]);

	// ─── Helper to listen to events ────────────────────────────
	const onEvent = (event: string, callback: (detail: any) => void) => {
		const handler = (e: CustomEvent) => callback(e.detail);
		window.addEventListener(event as any, handler);
		return () => window.removeEventListener(event as any, handler);
	};

	return { onEvent };
}
