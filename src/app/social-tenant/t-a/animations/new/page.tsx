"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { AnimationBuilder } from "@/components/templates/builder/animations/AnimationBuilder";
import { useUser } from "@/lib/useAuth";

export default function CreateAnimationPage() {
	const router = useRouter();
	const { user, loading: userLoading } = useUser();

	if (userLoading) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-purple-500" />
			</div>
		);
	}

	if (!user) {
		router.push("/auth/login");
		return null;
	}

	return (
		<div className="min-h-screen bg-black text-white">
			<AnimationBuilder userId={user.id} isEditMode={false} />
		</div>
	);
}
