// lib/notification-client.ts

import supabase from "@/lib/supabase/client";

export interface Notification {
	id: string;
	user_id: string;
	title: string;
	body: string;
	type: string;
	priority: "high" | "normal" | "low";
	is_read: boolean;
	metadata: Record<string, any>;
	created_at: string;
	read_at: string | null;
}

// ─── Fetch Unread Count ──────────────────────────────────
export async function fetchUnreadCount(userId: string): Promise<number> {
	if (!userId) return 0;

	try {
		const { count, error } = await supabase
			.from("user_notifications")
			.select("id", { count: "exact", head: true })
			.eq("user_id", userId)
			.eq("is_read", false);

		if (error) {
			console.error("Error fetching unread count:", error);
			return 0;
		}

		return count || 0;
	} catch (err) {
		console.error("Error fetching unread count:", err);
		return 0;
	}
}

// ─── Fetch Notifications ──────────────────────────────────
export async function fetchNotifications(
	userId: string,
	limit = 50,
): Promise<Notification[]> {
	if (!userId) return [];

	try {
		const { data, error } = await supabase
			.from("user_notifications")
			.select("*")
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (error) {
			console.error("Error fetching notifications:", error);
			return [];
		}

		return data || [];
	} catch (err) {
		console.error("Error fetching notifications:", err);
		return [];
	}
}

// ─── Mark Notification as Read ────────────────────────────
export async function markNotificationRead(id: string): Promise<boolean> {
	if (!id) return false;

	try {
		const { error } = await supabase
			.from("user_notifications")
			.update({ is_read: true, read_at: new Date().toISOString() })
			.eq("id", id);

		if (error) {
			console.error("Error marking notification read:", error);
			return false;
		}
		return true;
	} catch (err) {
		console.error("Error marking notification read:", err);
		return false;
	}
}

// ─── Mark All Notifications as Read ──────────────────────
export async function markAllNotificationsRead(
	userId: string,
): Promise<boolean> {
	if (!userId) return false;

	try {
		const { error } = await supabase
			.from("user_notifications")
			.update({ is_read: true, read_at: new Date().toISOString() })
			.eq("user_id", userId)
			.eq("is_read", false);
		if (error) {
			console.error("Error marking all notifications read:", error);
			return false;
		}
		return true;
	} catch (err) {
		console.error("Error marking all notifications read:", err);
		return false;
	}
}

// ─── Store active subscriptions ────────────────────────────
const subscriptions = new Map<string, any>();

// ─── Subscribe to New Notifications ──────────────────────
export function subscribeToNotifications(
	userId: string,
	onNotification: (notification: Notification) => void,
) {
	if (!userId) {
		console.warn("subscribeToNotifications: No userId provided");
		return () => {};
	}

	const channelName = `user_notifications_${userId}`;

	// Clean up any existing subscription for this user
	if (subscriptions.has(channelName)) {
		const existing = subscriptions.get(channelName);
		try {
			existing.unsubscribe();
		} catch (e) {}
		subscriptions.delete(channelName);
	}

	

	const channel = supabase.channel(channelName);

	channel
		.on(
			"postgres_changes",
			{
				event: "INSERT",
				schema: "public",
				table: "user_notifications",
				filter: `user_id=eq.${userId}`,
			},
			(payload) => {
				onNotification(payload.new as Notification);
			},
		)
		.subscribe((status) => {
		});

	const unsubscribe = () => {
		try {
			supabase.removeChannel(channel);
		} catch (e) {}
		subscriptions.delete(channelName);
	};

	subscriptions.set(channelName, { unsubscribe, channel });

	return unsubscribe;
}
