"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { BuilderWrapper } from "@/components/templates/builder/BuilderWrapper";
import { BuilderProvider } from "@/components/templates/builder/core/BuilderProvider";
import { Loader } from "@/components/templates/builder/ui/Loader";
import { useUser } from "@/lib/useAuth";

export default function CreateTemplatePage() {
	const router = useRouter();
	const { user, loading: userLoading } = useUser();

	// ─── Loading State ──────────────────────────────────────────────────
	if (userLoading) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<Loader size="lg" label="Loading builder..." />
			</div>
		);
	}

	// ─── Authentication Check ──────────────────────────────────────────
	if (!user) {
		router.push("/auth/login");
		return null;
	}

	// ─── Render Builder ──────────────────────────────────────────────────
	return (
		<BuilderProvider>
			<BuilderWrapper
				userId={user.id}
				isEditMode={false}
				isLoading={userLoading}
			/>
		</BuilderProvider>
	);
}
