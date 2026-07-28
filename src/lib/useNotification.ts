// hooks/useNotifications.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	fetchNotifications,
	fetchUnreadCount,
	markAllNotificationsRead,
	markNotificationRead,
	type Notification,
	subscribeToNotifications,
} from "@/lib/notification-client";

interface UseNotificationsOptions {
	userId: string | null;
	onNotification?: (notification: Notification) => void;
}

export function useNotifications({
	userId,
	onNotification,
}: UseNotificationsOptions) {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const unsubscribeRef = useRef<(() => void) | null>(null);
	const isMounted = useRef(true);

	// ─── Load initial notifications ──────────────────────────
	const loadNotifications = useCallback(async () => {
		if (!userId) {
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			const [fetched, count] = await Promise.all([
				fetchNotifications(userId),
				fetchUnreadCount(userId),
			]);

			if (isMounted.current) {
				setNotifications(fetched);
				setUnreadCount(count);
			}
		} catch (err) {
			console.error("Failed to load notifications:", err);
		} finally {
			if (isMounted.current) {
				setLoading(false);
			}
		}
	}, [userId]);

	// ─── Mark single notification as read ────────────────────
	const markAsRead = useCallback(async (id: string) => {
		const success = await markNotificationRead(id);
		if (success && isMounted.current) {
			setNotifications((prev) =>
				prev.map((n) =>
					n.id === id
						? { ...n, is_read: true, read_at: new Date().toISOString() }
						: n,
				),
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		}
	}, []);

	// ─── Mark all as read ────────────────────────────────────
	const markAllAsRead = useCallback(async () => {
		if (!userId) return;
		const success = await markAllNotificationsRead(userId);
		if (success && isMounted.current) {
			setNotifications((prev) =>
				prev.map((n) => ({
					...n,
					is_read: true,
					read_at: new Date().toISOString(),
				})),
			);
			setUnreadCount(0);
		}
	}, [userId]);

	// ─── Play notification sound ─────────────────────────────
	const playSound = useCallback(() => {
		try {
			if (!audioRef.current) {
				audioRef.current = new Audio("/sounds/notification.mp3");
				audioRef.current.volume = 0.5;
			}

			const sound = audioRef.current.cloneNode() as HTMLAudioElement;
			sound.volume = 0.5;
			sound.play().catch(() => {});
		} catch (err) {
			// Silently fail
		}
	}, []);

	// ─── Handle new notification ─────────────────────────────
	const handleNewNotification = useCallback(
		(notification: Notification) => {
			if (!isMounted.current) return;

			setNotifications((prev) => {
				if (prev.some((n) => n.id === notification.id)) return prev;
				return [notification, ...prev];
			});
			setUnreadCount((prev) => prev + 1);
			playSound();

			if (onNotification) {
				onNotification(notification);
			}
		},
		[playSound, onNotification],
	);

	// ─── Subscribe to realtime updates ──────────────────────
	useEffect(() => {
		isMounted.current = true;

		if (!userId) {
			setLoading(false);
			return;
		}

		loadNotifications();

		// Clean up previous subscription
		if (unsubscribeRef.current) {
			unsubscribeRef.current();
		}

		// Create new subscription
		unsubscribeRef.current = subscribeToNotifications(
			userId,
			handleNewNotification,
		);

		return () => {
			isMounted.current = false;
			if (unsubscribeRef.current) {
				unsubscribeRef.current();
				unsubscribeRef.current = null;
			}
		};
	}, [userId]); // ← Only depend on userId, not other functions

	// ─── Clean up audio on unmount ──────────────────────────
	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
		};
	}, []);

	return {
		notifications,
		unreadCount,
		loading,
		markAsRead,
		markAllAsRead,
		refresh: loadNotifications,
	};
}
