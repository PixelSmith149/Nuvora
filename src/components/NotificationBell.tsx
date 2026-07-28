"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNotificationContext } from "@/components/NotificationProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/lib/notification-client";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
	// Optional props for flexibility
	notifications?: Notification[];
	onNotificationClick?: (notification: Notification) => void;
}

const iconMap: Record<string, string> = {
	withdrawal: "💳",
	transaction: "💰",
	review: "⭐",
	follow: "👤",
	store_verified: "✅",
	order_purchase: "🛒",
	order_delivered: "📦",
	order_confirmed: "✅",
	smm_order: "📊",
	wallet_balance: "💰",
	default: "🔔",
};

export function NotificationBell({
	notifications: propNotifications,
	onNotificationClick,
}: NotificationBellProps) {
	const [isOpen, setIsOpen] = useState(false);
	const {
		notifications: contextNotifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
	} = useNotificationContext();

	const dropdownRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	// Use context notifications if not provided via props
	const displayNotifications = propNotifications || contextNotifications;

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				buttonRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleNotificationClick = async (notification: Notification) => {
		if (!notification.is_read) {
			await markAsRead(notification.id);
		}
		if (onNotificationClick) {
			onNotificationClick(notification);
		}
		setIsOpen(false);
	};

	const handleMarkAllRead = async () => {
		await markAllAsRead();
	};

	return (
		<div className="relative">
			<Button
				ref={buttonRef}
				variant="ghost"
				size="sm"
				className="relative h-9 w-9 p-0 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
				onClick={() => setIsOpen(!isOpen)}
			>
				<Bell className="h-5 w-5" />

				{unreadCount > 0 && (
					<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</Button>

			{isOpen && (
				<>
					<div
						className="fixed inset-0 z-40 bg-black/40"
						onClick={() => setIsOpen(false)}
					/>

					<div
						ref={dropdownRef}
						className="absolute right-0 top-full mt-2 z-50 w-[420px] max-h-[520px] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
					>
						{/* Header */}
						<div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-950/90">
							<div>
								<h3 className="text-sm font-bold text-white">Notifications</h3>
								<p className="text-[10px] text-zinc-500">
									{unreadCount} unread • {displayNotifications.length} total
								</p>
							</div>
							{unreadCount > 0 && (
								<button
									onClick={handleMarkAllRead}
									className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
								>
									<CheckCheck className="h-3.5 w-3.5" />
									Mark all read
								</button>
							)}
						</div>

						{/* Notification List */}
						<div className="overflow-y-auto max-h-[400px]">
							{displayNotifications.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<Bell className="h-10 w-10 text-zinc-600 mb-3" />
									<p className="text-sm font-medium text-zinc-400">
										No notifications yet
									</p>
									<p className="text-xs text-zinc-500 mt-1">
										You're all caught up!
									</p>
								</div>
							) : (
								displayNotifications.map((notification) => (
									<div
										key={notification.id}
										onClick={() => handleNotificationClick(notification)}
										className={cn(
											"flex items-start gap-3 px-4 py-4 cursor-pointer transition-all border-b border-white/5 hover:bg-white/5",
											!notification.is_read && "bg-white/[0.02]",
										)}
									>
										<div className="flex-shrink-0 text-2xl mt-0.5">
											{iconMap[notification.type] || iconMap.default}
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex justify-between items-start gap-2">
												<p
													className={cn(
														"text-sm font-medium truncate",
														!notification.is_read
															? "text-white"
															: "text-zinc-400",
													)}
												>
													{notification.title}
												</p>
												<span className="text-[10px] text-zinc-500 whitespace-nowrap">
													{formatDistanceToNow(
														new Date(notification.created_at),
														{ addSuffix: true },
													)}
												</span>
											</div>
											<p className="text-xs text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
												{notification.body}
											</p>
										</div>

										{!notification.is_read && (
											<div className="flex-shrink-0 mt-1">
												<div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
											</div>
										)}
									</div>
								))
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
}
