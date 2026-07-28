// components/NotificationProvider.tsx
"use client";

import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { NotificationToast } from "@/components/NotificationToast";
import type { Notification } from "@/lib/notification-client";
import { useNotifications } from "@/lib/useNotification";

interface NotificationContextType {
	notifications: Notification[];
	unreadCount: number;
	markAsRead: (id: string) => Promise<void>;
	markAllAsRead: () => Promise<void>;
	refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotificationContext() {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			"useNotificationContext must be used within NotificationProvider",
		);
	}
	return context;
}

interface NotificationProviderProps {
	children: React.ReactNode;
	userId: string | null;
}

export function NotificationProvider({
	children,
	userId,
}: NotificationProviderProps) {
	const [activeToasts, setActiveToasts] = useState<Notification[]>([]);

	// ─── Debug: Log userId ──────────────────────────────────
	useEffect(() => {
		console.log("🔔 NotificationProvider userId:", userId);
	}, [userId]);

	const { notifications, unreadCount, markAsRead, markAllAsRead, refresh } =
		useNotifications({
			userId,
			onNotification: (notification) => {
				console.log("🔔 New notification:", notification);
				setActiveToasts((prev) => [...prev, notification]);
			},
		});

	const removeToast = useCallback((id: string) => {
		setActiveToasts((prev) => prev.filter((n) => n.id !== id));
	}, []);

	return (
		<NotificationContext.Provider
			value={{
				notifications: notifications,
				unreadCount,
				markAsRead,
				markAllAsRead,
				refresh,
			}}
		>
			{children}

			{activeToasts.map((notification) => (
				<NotificationToast
					key={notification.id}
					notification={notification}
					onClose={removeToast}
				/>
			))}
		</NotificationContext.Provider>
	);
}
