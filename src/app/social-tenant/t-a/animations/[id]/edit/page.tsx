"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
	AnimationBuilder,
	type AnimationFormData,
} from "@/components/templates/builder/animations/AnimationBuilder";
import { useUser } from "@/lib/useAuth";

export default function EditAnimationPage() {
	const router = useRouter();
	const params = useParams();
	const animationId = params.id as string;
	const { user, loading: userLoading } = useUser();

	const [animation, setAnimation] = useState<AnimationFormData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!user || !animationId) return;

		async function loadAnimation() {
			try {
				const response = await fetch(`/api/st/t-a/animations/${animationId}`);
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Failed to load animation");
				}

				const anim = data.animation;
				setAnimation({
					id: anim.id,
					name: anim.name,
					description: anim.description || "",
					type: anim.type,
					duration: anim.duration,
					delay: anim.delay,
					easing: anim.easing,
					direction: anim.direction,
					iterationCount: anim.iteration_count,
					fillMode: anim.fill_mode,
					trigger: anim.trigger,
					keyframes: anim.keyframes,
				});
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}

		loadAnimation();
	}, [user, animationId]);

	if (userLoading || loading) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-purple-500" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
					<h2 className="text-lg font-bold mb-2">Failed to Load Animation</h2>
					<p className="text-zinc-400">{error}</p>
					<button
						onClick={() => router.push("/social-tenant/t-a/animations")}
						className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors"
					>
						Back to Animations
					</button>
				</div>
			</div>
		);
	}

	if (!user) {
		router.push("/auth/login");
		return null;
	}

	if (!animation) {
		router.push("/social-tenant/t-a/animations");
		return null;
	}

	return (
		<div className="min-h-screen bg-black text-white">
			<AnimationBuilder
				userId={user.id}
				initialData={animation}
				isEditMode={true}
			/>
		</div>
	);
}
