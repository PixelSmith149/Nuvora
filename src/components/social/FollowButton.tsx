// components/social/FollowButton.tsx

"use client";

import { Check, Loader2, UserPlus } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabase/client";

// ✅ FIX: Use valid button sizes from shadcn/ui
type ButtonSize = "sm" | "lg" | "default" | "icon";

interface FollowButtonProps {
	targetUserId: string;
	currentUserId: string;
	size?: ButtonSize; // ← Changed from 'sm' | 'md' | 'lg'
	variant?: "default" | "outline" | "ghost";
	showCount?: boolean;
	onFollowChange?: (isFollowing: boolean, count: number) => void;
	// ✅ NEW: For minimal plus button in stats bar
	isPlusMode?: boolean;
}

export function FollowButton({
	targetUserId,
	currentUserId,
	size = "sm",
	variant = "outline",
	showCount = false,
	onFollowChange,
	isPlusMode = false, // ← New prop
}: FollowButtonProps) {
	const [isFollowing, setIsFollowing] = useState(false);
	const [followersCount, setFollowersCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);

	// components/social/FollowButton.tsx - Update fetchStatus

	// ─── Fetch initial status ──────────────────────────────
	useEffect(() => {
		async function fetchStatus() {
			if (!currentUserId || !targetUserId) return;

			try {
				// Fetch follow status and count in parallel
				const [statusRes, countRes] = await Promise.all([
					fetch(`/api/social/follow/status?target_user_id=${targetUserId}`),
					fetch(`/api/social/followers?user_id=${targetUserId}`),
				]);

				// ✅ Check if responses are OK before parsing JSON
				if (!statusRes.ok) {
					throw new Error(`Status API error: ${statusRes.status}`);
				}

				if (!countRes.ok) {
					throw new Error(`Count API error: ${countRes.status}`);
				}

				const statusData = await statusRes.json();
				const countData = await countRes.json();

				setIsFollowing(statusData.is_following || false);
				setFollowersCount(countData.followers || 0);
			} catch (err) {
				setIsFollowing(false);
				setFollowersCount(0);
			} finally {
				setLoading(false);
			}
		}

		fetchStatus();
	}, [targetUserId, currentUserId]);

	// ─── Handle follow/unfollow ─────────────────────────────
	// components/social/FollowButton.tsx - handleToggleFollow

	const handleToggleFollow = useCallback(async () => {
		if (!currentUserId || !targetUserId || updating) return;

		setUpdating(true);

		try {
			const endpoint = isFollowing
				? "/api/social/unfollow"
				: "/api/social/follow";
			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ target_user_id: targetUserId }),
			});

			// ✅ Check if response is OK
			if (!response.ok) {
				const text = await response.text();
				let errorMessage = "Failed to update follow status";
				try {
					const data = JSON.parse(text);
					errorMessage = data.error || errorMessage;
				} catch {
					errorMessage = text || errorMessage;
				}
				throw new Error(errorMessage);
			}

			const data = await response.json();

			// ✅ If already following, just update the state
			setIsFollowing(data.followed || false);
			if (data.followers_count !== undefined) {
				setFollowersCount(data.followers_count);
			}

			if (onFollowChange) {
				onFollowChange(
					data.followed || false,
					data.followers_count || followersCount,
				);
			}
		} catch (err: any) {
			if (
				err.message.includes("duplicate key") ||
				err.message.includes("Already following")
			) {
				setIsFollowing(true);
				return;
			}
			alert(err.message || "Something went wrong");
		} finally {
			setUpdating(false);
		}
	}, [
		isFollowing,
		targetUserId,
		currentUserId,
		updating,
		onFollowChange,
		followersCount,
	]);

	// ─── Loading ─────────────────────────────────────────────
	if (loading) {
		return (
			<Button variant="outline" size={size} disabled className="w-full">
				<Loader2 className="h-3.5 w-3.5 animate-spin" />
			</Button>
		);
	}

	// ─── Don't show follow button for self ──────────────────
	if (currentUserId === targetUserId) {
		return null;
	}

	// ─── Size classes for shadcn/ui button ──────────────────
	const sizeClasses = {
		sm: "h-8 px-3 text-xs",
		lg: "h-10 px-5 text-sm",
		default: "h-9 px-4 text-sm",
		icon: "h-8 w-8",
	};

	// ─── If in plus mode (for stats bar) ────────────────────
	if (isPlusMode) {
		return (
			<Button
				variant="ghost"
				size="icon"
				onClick={handleToggleFollow}
				disabled={updating}
				className={`h-5 w-5 rounded-full p-0 min-w-0 transition-all ${
					isFollowing
						? "text-emerald-400 hover:text-emerald-300"
						: "text-zinc-500 hover:text-emerald-400"
				}`}
			>
				{updating ? (
					<Loader2 className="h-3 w-3 animate-spin" />
				) : isFollowing ? (
					<Check className="h-3 w-3" />
				) : (
					<span className="text-base font-light leading-none">+</span>
				)}
			</Button>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Button
				variant={isFollowing ? "default" : variant}
				size={size}
				onClick={handleToggleFollow}
				disabled={updating}
				className={`${sizeClasses[size]} rounded-xl font-medium transition-all ${
					isFollowing
						? "bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-700"
						: variant === "ghost"
							? "text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10"
							: "border-white/10 text-zinc-300 hover:text-white hover:bg-white/5"
				}`}
			>
				{updating ? (
					<Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
				) : isFollowing ? (
					<>
						<Check className="h-3.5 w-3.5 mr-1.5" />
						Following
					</>
				) : (
					<>
						<UserPlus className="h-3.5 w-3.5 mr-1.5" />
						Follow
					</>
				)}
			</Button>
			{showCount && followersCount > 0 && (
				<span className="text-xs text-zinc-500 font-medium">
					{followersCount.toLocaleString()}
				</span>
			)}
		</div>
	);
}
