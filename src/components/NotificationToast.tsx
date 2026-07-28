// components/NotificationToast.tsx
"use client";

import {
	AlertCircle,
	Bell,
	CheckCircle2,
	CreditCard,
	Package,
	ShoppingBag,
	Star,
	Store,
	User,
	X,
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
	withdrawal: <CreditCard className="w-5 h-5 text-amber-400" />,
	transaction: <CreditCard className="w-5 h-5 text-emerald-400" />,
	review: <Star className="w-5 h-5 text-yellow-400" />,
	follow: <User className="w-5 h-5 text-blue-400" />,
	store_verified: <Store className="w-5 h-5 text-emerald-400" />,
	order_purchase: <ShoppingBag className="w-5 h-5 text-emerald-400" />,
	order_delivered: <Package className="w-5 h-5 text-emerald-400" />,
	order_confirmed: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
	smm_order: <Package className="w-5 h-5 text-purple-400" />,
	wallet_balance: <CreditCard className="w-5 h-5 text-emerald-400" />,
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
				"fixed top-4 right-4 z-[9999] max-w-sm w-full",
				"transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
				isVisible
					? "translate-x-0 opacity-100 scale-100"
					: "translate-x-full opacity-0 scale-95",
				isExiting && "translate-x-full opacity-0 scale-95",
			)}
		>
			<div
				className={cn(
					"relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl",
					bgColor,
				)}
			>
				{/* Shimmer effect */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_infinite] bg-[length:200%_100%] pointer-events-none" />

				<div className="relative p-5 flex items-start gap-4">
					{/* Icon */}
					<div className="flex-shrink-0 mt-0.5">
						<div
							className={cn(
								"w-10 h-10 rounded-full flex items-center justify-center border border-white/5",
								notification.priority === "high"
									? "bg-red-500/10"
									: "bg-white/5",
							)}
						>
							{icon}
						</div>
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2">
							<h4 className="text-sm font-bold text-white tracking-tight">
								{notification.title}
							</h4>
							<button
								onClick={handleClose}
								className="flex-shrink-0 -mt-1 -mr-1 p-1 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
						<p className="text-sm text-zinc-400 leading-relaxed mt-0.5">
							{notification.body}
						</p>

						{/* Progress bar */}
						<div className="mt-3 h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full animate-[shrink_4s_linear_forwards]"
								style={{
									animationDuration: `${duration}ms`,
									transformOrigin: "left",
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
