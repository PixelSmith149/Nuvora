"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { useNotificationContext } from "@/components/NotificationProvider";
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

function getDisplayUrl(url: string) {
  try {
    const parsed = new URL(url);

    // TikTok
    if (parsed.hostname.includes("tiktok.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);

      const username = parts.find((p) => p.startsWith("@"));
      const isVideo = parts.includes("video");

      return username
        ? `${username}${isVideo ? "/video" : ""}`
        : "TikTok";
    }

    // Instagram
    if (parsed.hostname.includes("instagram.com")) {
      const username = parsed.pathname.split("/").filter(Boolean)[0];

      return username
        ? `@${username}`
        : "Instagram";
    }

    // YouTube
    if (parsed.hostname.includes("youtube.com")) {
      return "YouTube";
    }

    // X
    if (parsed.hostname.includes("x.com")) {
      const username = parsed.pathname.split("/").filter(Boolean)[0];

      return username
        ? `@${username}`
        : "X";
    }

    // Facebook
    if (parsed.hostname.includes("facebook.com")) {
      return "Facebook";
    }

    // Fallback
    return parsed.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function renderNotificationBody(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return text.split(urlRegex).map((part, index) => {
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-emerald-500/20
            bg-emerald-500/10
            px-3
            py-1.5
            text-xs
            font-medium
            text-emerald-300
            hover:bg-emerald-500/20
            transition-all
          "
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {getDisplayUrl(part)}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

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
  <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-black backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.65)]">

    {/* Ambient glow */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-cyan-500/6 blur-3xl" />
    </div>

    {/* Header */}
    <div className="relative flex items-center justify-between border-b border-white/5 px-6 py-5">

      <div className="flex items-center gap-4">

        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-[0_0_35px_rgba(16,185,129,0.12)]">

          <Bell className="h-6 w-6 text-white" />

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full border border-red-400/20 bg-red-500 text-[11px] font-bold text-white shadow-lg shadow-red-500/30">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}

        </div>

        <div>

          <h1 className="text-xl font-semibold tracking-tight text-white">
            Notifications
          </h1>

          <div className="mt-1 flex items-center gap-2">

            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              {unreadCount} unread
            </span>

            <span className="text-xs text-zinc-500">
              {displayNotifications.length} total
            </span>

          </div>

        </div>

      </div>

      {unreadCount > 0 && (
        <button
          onClick={handleMarkAllRead}
          className="
            group
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-emerald-500/20
            bg-emerald-500/10
            px-4
            py-2
            text-sm
            font-medium
            text-emerald-300
            transition-all
            hover:border-emerald-400/40
            hover:bg-emerald-500/15
          "
        >
          <CheckCheck className="h-4 w-4 transition-transform group-hover:scale-110" />
          Mark all read
        </button>
      )}

    </div>

    {/* List */}

    <div className="space-y-3 p-4">

      {displayNotifications.length === 0 ? (

        <div className="flex min-h-[350px] flex-col items-center justify-center">

          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900">

            <Bell className="h-9 w-9 text-zinc-500" />

          </div>

          <h3 className="text-lg font-semibold text-white">
            Nothing here yet
          </h3>

          <p className="mt-2 max-w-sm text-center text-sm leading-6 text-zinc-500">
            We'll notify you whenever something important happens across your account.
          </p>

        </div>

      ) : (

        displayNotifications.map((notification) => (

          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]",
              !notification.is_read &&
                "border-emerald-500/15 bg-emerald-500/[0.03]"
            )}
          >

            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-500/8 blur-3xl" />
            </div>

            <div className="relative flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900">

                {iconMap[notification.type] || iconMap.default}

              </div>

              <div className="min-w-0 flex-1">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <h3
                      className={cn(
                        "text-[15px] font-semibold tracking-tight",
                        notification.is_read
                          ? "text-zinc-300"
                          : "text-white"
                      )}
                    >
                      {notification.title}
                    </h3>

                    <div className="mt-2">
                      {renderNotificationBody(notification.body)}
                    </div>

                  </div>

                  <div className="flex flex-col items-end gap-2">

                    <span className="text-[11px] text-zinc-500">
                      {formatDistanceToNow(
                        new Date(notification.created_at),
                        { addSuffix: true }
                      )}
                    </span>

                    {!notification.is_read && (
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>

        ))

      )}

    </div>

  </div>
 );
}