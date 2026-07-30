"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import React from "react";
import { useNotificationContext } from "@/components/NotificationProvider";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/lib/notification-client";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
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
    const {
        notifications: contextNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
    } = useNotificationContext();

    // Use context notifications if not provided via props
    const displayNotifications = propNotifications || contextNotifications;

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
        if (onNotificationClick) {
            onNotificationClick(notification);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    return (
        <div className="w-full max-w-4xl mx-auto rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5 bg-zinc-950/90 gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative p-2 rounded-full bg-white/5 text-white">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">Notifications</h1>
                        <p className="text-xs text-zinc-500">
                            {unreadCount} unread • {displayNotifications.length} total
                        </p>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Mark all read
                    </button>
                )}
            </div>

            {/* Notification List */}
            <div className="divide-y divide-white/5">
                {displayNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="p-4 rounded-full bg-white/5 mb-4 text-zinc-600">
                            <Bell className="h-8 w-8" />
                        </div>
                        <p className="text-base font-medium text-zinc-400">
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
                                "flex items-start gap-4 p-4 sm:p-5 cursor-pointer transition-all hover:bg-white/5",
                                !notification.is_read && "bg-white/[0.02]"
                            )}
                        >
                            <div className="flex-shrink-0 text-2xl mt-0.5">
                                {iconMap[notification.type] || iconMap.default}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <p
                                        className={cn(
                                            "text-sm font-semibold truncate",
                                            !notification.is_read
                                                ? "text-white"
                                                : "text-zinc-400"
                                        )}
                                    >
                                        {notification.title}
                                    </p>
                                    <span className="text-[11px] text-zinc-500 whitespace-nowrap">
                                        {formatDistanceToNow(
                                            new Date(notification.created_at),
                                            { addSuffix: true }
                                        )}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                                    {notification.body}
                                </p>
                            </div>

                            {!notification.is_read && (
                                <div className="flex-shrink-0 mt-2">
                                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}