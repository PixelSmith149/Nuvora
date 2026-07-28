// lib/services/realtime.service.ts

import supabase from "@/lib/supabase/client";

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE";

interface RealtimeSubscription {
	table: string;
	filter?: string;
	event: RealtimeEvent;
	callback: (payload: any) => void;
}

// ─── Realtime Subscription Manager ──────────────────────────
export class RealtimeService {
	private static instance: RealtimeService;
	private channels: Map<string, any> = new Map();

	static getInstance(): RealtimeService {
		if (!RealtimeService.instance) {
			RealtimeService.instance = new RealtimeService();
		}
		return RealtimeService.instance;
	}

	// ─── Subscribe to a table ───────────────────────────────────
	subscribe({ table, filter, event, callback }: RealtimeSubscription): string {
		const channelId = `${table}-${filter || "all"}-${event}`;

		if (this.channels.has(channelId)) {
			console.log(`🔄 [Realtime] Already subscribed to ${channelId}`);
			return channelId;
		}

		console.log(`📡 [Realtime] Subscribing to ${channelId}`);

		const channel = supabase
			.channel(channelId)
			.on(
				"postgres_changes",
				{
					event: event,
					schema: "public",
					table: table,
					filter: filter || undefined,
				},
				(payload) => {
					console.log(`📡 [Realtime] Event: ${event} on ${table}`, payload);
					callback(payload);
				},
			)
			.subscribe((status) => {
				console.log(`📡 [Realtime] ${channelId} status: ${status}`);
			});

		this.channels.set(channelId, channel);
		return channelId;
	}

	// ─── Unsubscribe ────────────────────────────────────────────
	unsubscribe(channelId: string): void {
		const channel = this.channels.get(channelId);
		if (channel) {
			supabase.removeChannel(channel);
			this.channels.delete(channelId);
			console.log(`📡 [Realtime] Unsubscribed from ${channelId}`);
		}
	}

	// ─── Unsubscribe from all ──────────────────────────────────
	unsubscribeAll(): void {
		this.channels.forEach((channel) => {
			supabase.removeChannel(channel);
		});
		this.channels.clear();
		console.log("📡 [Realtime] Unsubscribed from all channels");
	}
}

// ─── Hook for React components ──────────────────────────────
import { useEffect, useRef } from "react";

export function useRealtimeSubscription(
	table: string,
	event: RealtimeEvent,
	callback: (payload: any) => void,
	filter?: string,
	dependencies: any[] = [],
) {
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		const service = RealtimeService.getInstance();
		const channelId = service.subscribe({
			table,
			filter,
			event,
			callback: (payload) => callbackRef.current(payload),
		});

		return () => {
			service.unsubscribe(channelId);
		};
	}, [table, event, filter, ...dependencies]);
}
