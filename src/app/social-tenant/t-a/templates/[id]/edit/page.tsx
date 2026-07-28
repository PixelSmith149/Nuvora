"use client";

import { AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BuilderWrapper } from "@/components/templates/builder/BuilderWrapper";
import { BuilderProvider } from "@/components/templates/builder/core/BuilderProvider";
import { Loader } from "@/components/templates/builder/ui/Loader";
import { useUser } from "@/lib/useAuth";

export default function EditTemplatePage() {
	const router = useRouter();
	const params = useParams();
	const templateId = params.id as string;
	const { user, loading: userLoading } = useUser();

	const [template, setTemplate] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// ─── Load template data ──────────────────────────────────────────────
	useEffect(() => {
		if (!user || !templateId) return;

		async function loadTemplate() {
			try {
				const response = await fetch(`/api/st/t-a/templates/${templateId}`);
				const data = await response.json();

				if (!response.ok) {
					throw new Error(data.error || "Failed to load template");
				}

				setTemplate(data.template);
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}

		loadTemplate();
	}, [user, templateId]);

	// ─── Loading State ──────────────────────────────────────────────────
	if (userLoading || loading) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<Loader size="lg" label="Loading template..." />
			</div>
		);
	}

	// ─── Error State ────────────────────────────────────────────────────
	if (error) {
		return (
			<div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
					<h2 className="text-lg font-bold mb-2">Failed to Load Template</h2>
					<p className="text-zinc-400">{error}</p>
					<button
						onClick={() => router.push("/social-tenant/t-a/templates")}
						className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors"
					>
						Back to Templates
					</button>
				</div>
			</div>
		);
	}

	// ─── Authentication Check ──────────────────────────────────────────
	if (!user) {
		router.push("/auth/login");
		return null;
	}

	// ─── Render Builder with loaded template ──────────────────────────
	return (
		<BuilderProvider>
			<BuilderWrapper
				userId={user.id}
				template={template}
				isEditMode={true}
				isLoading={loading}
			/>
		</BuilderProvider>
	);
}
