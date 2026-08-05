// components/NotificationToast.tsx
"use client";

import {
  ArrowUpRight,
  ArrowLeftRight,
  Wallet,
  Star,
  UserPlus,
  BadgeCheck,
  ShoppingCart,
  Truck,
  TrendingUp,
  Banknote,
  RotateCcw,
  Crown,
  Bell,
  X,
  ShieldAlert,
  Sparkles,
  TicketPercent,
  MessageCircle,
  AtSign,
  Shield,
  LogIn,
  KeyRound,
  Fingerprint,
  ShieldCheck,
  Bot,
  Globe,
  Link2,
  LayoutTemplate,
  BarChart3,
  Megaphone,
  Receipt,
} from "lucide-react";

import { useEffect, useState } from "react";
import type { Notification } from "@/lib/notification-client";
import { cn } from "@/lib/utils";

interface NotificationToastProps {
	notification: Notification;
	onClose: (id: string) => void;
	duration?: number;
}

const iconMap: Record<string, React.ReactNode> = {
  withdrawal: <ArrowUpRight className="w-5 h-5 text-amber-400" />,

  transaction: <ArrowLeftRight className="w-5 h-5 text-emerald-400" />,

  wallet_balance: <Wallet className="w-5 h-5 text-emerald-400" />,

  review: <Star className="w-5 h-5 text-yellow-400" />,

  follow: <UserPlus className="w-5 h-5 text-sky-400" />,

  store_verified: <BadgeCheck className="w-5 h-5 text-emerald-400" />,

  order_purchase: <ShoppingCart className="w-5 h-5 text-cyan-400" />,

  order_confirmed: <BadgeCheck className="w-5 h-5 text-emerald-400" />,

  order_delivered: <Truck className="w-5 h-5 text-indigo-400" />,

  smm_order: <TrendingUp className="w-5 h-5 text-violet-400" />,
};

const priorityColors: Record<string, string> = {
	high: "border-red-500/30 bg-red-950/40",
	normal: "border-white/10 bg-zinc-950/60",
	low: "border-white/5 bg-zinc-950/30",
};

export function NotificationToast({
	notification,
	onClose,
	duration = 5000,
}: NotificationToastProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [isExiting, setIsExiting] = useState(false);

	useEffect(() => {
		// Enter animation
		requestAnimationFrame(() => {
			setIsVisible(true);
		});

		// Auto dismiss
		const timer = setTimeout(() => {
			handleClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [duration]);

	const handleClose = () => {
		setIsExiting(true);
		setIsVisible(false);
		setTimeout(() => onClose(notification.id), 400);
	};

	const icon = iconMap[notification.type] || (
		<Bell className="w-5 h-5 text-zinc-400" />
	);
	const bgColor =
		priorityColors[notification.priority] || priorityColors.normal;

	return (
  <div
    className={cn(
      "fixed top-5 right-5 z-[9999] w-full max-w-sm",
      "transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
      isVisible
        ? "translate-x-0 opacity-100"
        : "translate-x-[120%] opacity-0",
      isExiting && "translate-x-[120%] opacity-0"
    )}
  >
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl",
        "border border-white/8",
        "bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-black/95",
        "backdrop-blur-2xl",
        "shadow-[0_15px_60px_rgba(0,0,0,0.55)]",
        "transition-all duration-300 hover:border-white/15 hover:shadow-[0_25px_70px_rgba(16,185,129,0.12)]"
      )}
    >
      {/* Ambient Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-cyan-400/8 blur-3xl" />

        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-emerald-500/[0.03]" />
      </div>

      {/* Top Accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />

      {/* Shimmer */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/[0.04] to-transparent bg-[length:220%_100%] animate-[shimmer_5s_linear_infinite]" />

      <div className="relative flex gap-4 p-5">

        {/* Icon */}
        <div
          className={cn(
            "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            "border border-white/10",
            "bg-gradient-to-br from-zinc-800 to-zinc-900",
            "shadow-[0_0_25px_rgba(16,185,129,0.08)]",
            notification.priority === "high" &&
              "border-red-500/20 shadow-[0_0_25px_rgba(239,68,68,0.15)]"
          )}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent" />
          {icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <h4 className="truncate text-[15px] font-semibold tracking-tight text-white">
                {notification.title}
              </h4>

              <p className="mt-1 text-[13px] leading-6 text-zinc-400">
                {notification.body}
              </p>

            </div>

            <button
              onClick={handleClose}
              className="
                flex h-8 w-8 shrink-0 items-center justify-center
                rounded-xl
                border border-transparent
                text-zinc-500
                transition-all
                duration-200
                hover:border-white/10
                hover:bg-white/5
                hover:text-white
              "
            >
              <X className="h-4 w-4" />
            </button>

          </div>

          {/* Progress */}
          <div className="mt-4 overflow-hidden rounded-full bg-white/5">

            <div
              className="
                relative
                h-[3px]
                rounded-full
                bg-gradient-to-r
                from-emerald-400
                via-cyan-400
                to-emerald-500
                animate-[shrink_linear_forwards]
              "
              style={{
                animationDuration: `${duration}ms`,
                transformOrigin: "left",
              }}
            >
              <div className="absolute inset-0 bg-white/30 blur-[2px]" />
            </div>

          </div>

        </div>
      </div>
    </div>
  </div>
 );
}
