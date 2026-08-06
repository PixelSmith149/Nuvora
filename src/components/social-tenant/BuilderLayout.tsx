// components/social-tenant/BuilderLayout.tsx

"use client";

import {
	AlertCircle,
	ArrowLeft,
	CheckCircle2,
	Clock,
	Code2,
	Eye,
	Loader2,
	MessageSquare,
	Rocket,
	Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ChatPanel } from "@/components/social-tenant/ChatPanel";
import { CodePanel } from "@/components/social-tenant/CodePanel";
import { PreviewPanel } from "@/components/social-tenant/PreviewPanel";
import { Button } from "@/components/ui/button";
import { useBuilderStream } from "@/lib/hooks/useBuilderStream";
import { usePlannerChat } from "@/lib/hooks/usePlannerChat";
import { useSocialTenant } from "@/lib/hooks/useSocialTenant";

interface BuilderLayoutProps {
	siteId: string;
	userId: string;
	username: string;
}

type ViewMode = "chat" | "code" | "preview";

export function BuilderLayout({
	siteId,
	userId,
	username,
}: BuilderLayoutProps) {
	const router = useRouter();
	const [viewMode, setViewMode] = useState<ViewMode>("chat");
	const [isMobile, setIsMobile] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const { getSite, updateSite } = useSocialTenant();
	const {
		messages,
		isTyping,
		error: chatError,
		sendMessage,
		blueprint,
		isComplete,
		shouldConfirm,
	} = usePlannerChat(siteId);

	const {
		isGenerating,
		htmlBuffer,
		error: buildError,
		canResume,
		startGeneration,
		resumeGeneration,
	} = useBuilderStream();

	const [site, setSite] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmCount, setConfirmCount] = useState(0);

	// ─── Device detection ───────────────────────────────────────
	useEffect(() => {
		const check = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
			if (mobile && viewMode === "code") {
				setViewMode("preview");
			}
		};
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, [viewMode]);

	// ─── Load site ──────────────────────────────────────────────
	useEffect(() => {
		const load = async () => {
			const data = await getSite(siteId);
			if (data) {
				setSite(data);
				if (data.html_code) setViewMode("preview");
			}
			setLoading(false);
		};
		load();
	}, [siteId, getSite]);

	// ─── Handlers ───────────────────────────────────────────────
	const handleBuild = async () => {
		if (!blueprint) {
			setError("Please complete the planning phase first.");
			setTimeout(() => setError(null), 3000);
			return;
		}
		try {
			await startGeneration(siteId, blueprint);
			setViewMode(isMobile ? "preview" : "code");
			setError(null);
		} catch (err: any) {
			setError(err.message || "Failed to start generation");
			setTimeout(() => setError(null), 5000);
		}
	};

	const handleResume = async () => {
		if (!blueprint) return;
		try {
			await resumeGeneration(siteId, blueprint);
			setViewMode(isMobile ? "preview" : "code");
			setError(null);
		} catch (err: any) {
			setError(err.message || "Failed to resume generation");
			setTimeout(() => setError(null), 5000);
		}
	};

	const handleConfirmSession = async () => {
		const next = confirmCount + 1;
		setConfirmCount(next);

		if (next >= 3) {
			try {
				await updateSite(siteId, "status", "published");
				setShowConfirmModal(false);
				setConfirmCount(0);
				router.push("/st");
			} catch (err: any) {
				setError(err.message || "Failed to publish. Please try again.");
				setConfirmCount(0);
				setTimeout(() => setError(null), 5000);
			}
		}
	};

	const handleEditRequest = async (section: string, newContent: string) => {
		if (!site) {
			setError("No site loaded. Please refresh.");
			return;
		}
		try {
			const response = await fetch(`/api/st/edit`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					siteId: site.id,
					section,
					editType: "text",
					newContent,
					oldContent: site.html_code || "",
				}),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to apply edit");
			}
			const result = await response.json();
			if (result.site) {
				setSite(result.site);
				window.location.reload();
			}
			setError(null);
		} catch (err: any) {
			setError(err.message || "Failed to apply edit");
			setTimeout(() => setError(null), 5000);
		}
	};

	// ─── Loading / not found ────────────────────────────────────
	if (loading) {
		return (
			<div className="flex h-[100dvh] items-center justify-center bg-black">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
					<p className="text-xs text-zinc-500">Loading builder...</p>
				</div>
			</div>
		);
	}

	if (!site) {
		return (
			<div className="flex h-[100dvh] items-center justify-center bg-black px-4">
				<div className="text-center">
					<AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
					<h2 className="text-xl font-bold text-white">Site not found</h2>
					<Button onClick={() => router.push("/st")} className="mt-4">
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	const hasPreview =
		!!site.html_code || htmlBuffer.length > 0 || isGenerating;
	const canPublish =
		site.status === "generated" ||
		(!!site.html_code && site.status !== "published");

	// ─── Main ───────────────────────────────────────────────────
	return (
		<div className="flex h-[100dvh] flex-col overflow-hidden bg-black text-white">
			{/* ─── Top bar ─────────────────────────────────────────── */}
			<header className="flex flex-shrink-0 items-center gap-2 border-b border-white/5 bg-zinc-950/90 px-3 py-2.5 backdrop-blur-xl sm:gap-3 sm:px-4 sm:py-3">
				<button
					type="button"
					onClick={() => router.push("/st")}
					className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
					aria-label="Back to dashboard"
				>
					<ArrowLeft className="h-5 w-5" />
				</button>

				<div className="min-w-0 flex-1">
					<h1 className="truncate text-sm font-bold text-white">
						{site.site_name}
					</h1>
					<p className="truncate text-[10px] text-zinc-500">@{username}</p>
				</div>

				{/* Status chips – hide labels on very small screens */}
				<div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
					{isGenerating && (
						<div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-1 text-amber-400">
							<Loader2 className="h-3.5 w-3.5 animate-spin" />
							<span className="hidden text-[10px] font-medium sm:inline">
								Building...
							</span>
						</div>
					)}
					{site.is_session_active && !isGenerating && (
						<div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-400">
							<Clock className="h-3 w-3" />
							<span className="hidden text-[10px] sm:inline">Session</span>
						</div>
					)}
					{canPublish && !isGenerating && (
						<button
							type="button"
							onClick={() => setShowConfirmModal(true)}
							className="flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-1 text-[10px] font-bold text-sky-300 transition-colors hover:bg-sky-500/25"
						>
							<Rocket className="h-3 w-3" />
							<span className="hidden sm:inline">Publish</span>
						</button>
					)}
				</div>

				{/* Desktop view tabs */}
				{!isMobile && (
					<div className="ml-1 flex flex-shrink-0 items-center gap-0.5 rounded-xl bg-zinc-900/80 p-1">
						<button
							type="button"
							onClick={() => setViewMode("chat")}
							className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
								viewMode === "chat"
									? "bg-emerald-500/20 text-emerald-400"
									: "text-zinc-500 hover:text-white"
							}`}
							aria-label="Chat"
						>
							<MessageSquare className="h-4 w-4" />
						</button>
						<button
							type="button"
							onClick={() => setViewMode("code")}
							className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
								viewMode === "code"
									? "bg-emerald-500/20 text-emerald-400"
									: "text-zinc-500 hover:text-white"
							}`}
							aria-label="Code"
						>
							<Code2 className="h-4 w-4" />
						</button>
						<button
							type="button"
							onClick={() => setViewMode("preview")}
							disabled={!hasPreview}
							className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all disabled:opacity-30 ${
								viewMode === "preview"
									? "bg-emerald-500/20 text-emerald-400"
									: "text-zinc-500 hover:text-white"
							}`}
							aria-label="Preview"
						>
							<Eye className="h-4 w-4" />
						</button>
					</div>
				)}
			</header>

			{/* ─── Resume banner ───────────────────────────────────── */}
			{canResume && !isGenerating && (
				<div className="flex flex-shrink-0 flex-col gap-2 border-b border-amber-500/20 bg-amber-500/10 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
					<div className="flex items-start gap-2 text-sm text-amber-400">
						<AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
						<span className="text-xs leading-5 sm:text-sm">
							Generation was interrupted. You can resume from where it stopped.
						</span>
					</div>
					<Button
						onClick={handleResume}
						className="h-9 w-full flex-shrink-0 rounded-xl bg-amber-600 px-4 text-xs font-bold text-white hover:bg-amber-500 sm:w-auto"
					>
						Resume Build
					</Button>
				</div>
			)}

			{/* ─── Error bar ───────────────────────────────────────── */}
			{error && (
				<div className="flex flex-shrink-0 items-start gap-2 border-b border-red-500/15 bg-red-500/10 px-3 py-2 text-xs text-red-400 sm:px-4">
					<AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
					<span className="min-w-0 break-words">{error}</span>
				</div>
			)}

			{/* ─── Main content ────────────────────────────────────── */}
			<main className="relative min-h-0 flex-1 overflow-hidden">
				{viewMode === "chat" && (
					<div className="h-full min-h-0">
						<ChatPanel
							messages={messages}
							isTyping={isTyping}
							error={chatError}
							onSendMessage={sendMessage}
							onBuild={handleBuild}
							blueprint={blueprint}
							isComplete={isComplete}
							shouldConfirm={shouldConfirm}
							onConfirmSession={() => setShowConfirmModal(true)}
						/>
					</div>
				)}

				{viewMode === "code" && !isMobile && (
					<div className="h-full min-h-0">
						<CodePanel
							htmlBuffer={htmlBuffer}
							isGenerating={isGenerating}
							error={buildError}
						/>
					</div>
				)}

				{viewMode === "preview" && (
					<div className="h-full min-h-0">
						<PreviewPanel
							htmlBuffer={htmlBuffer}
							isGenerating={isGenerating}
							isComplete={!isGenerating && htmlBuffer.length > 0}
							siteHtml={site.html_code}
							onEditRequest={handleEditRequest}
						/>
					</div>
				)}
			</main>

			{/* ─── Mobile bottom nav ───────────────────────────────── */}
			{isMobile && (
				<nav className="flex flex-shrink-0 items-center justify-around border-t border-white/5 bg-zinc-950/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
					<button
						type="button"
						onClick={() => setViewMode("chat")}
						className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors ${
							viewMode === "chat"
								? "text-emerald-400"
								: "text-zinc-500 active:text-zinc-300"
						}`}
					>
						<MessageSquare className="h-5 w-5" />
						<span className="text-[10px] font-medium">Chat</span>
					</button>

					<button
						type="button"
						onClick={() => hasPreview && setViewMode("preview")}
						disabled={!hasPreview}
						className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors disabled:opacity-30 ${
							viewMode === "preview"
								? "text-emerald-400"
								: "text-zinc-500 active:text-zinc-300"
						}`}
					>
						<Eye className="h-5 w-5" />
						<span className="text-[10px] font-medium">Preview</span>
					</button>

					{canPublish && (
						<button
							type="button"
							onClick={() => setShowConfirmModal(true)}
							className="flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-sky-400 transition-colors active:text-sky-300"
						>
							<Rocket className="h-5 w-5" />
							<span className="text-[10px] font-medium">Publish</span>
						</button>
					)}
				</nav>
			)}

			{/* ─── Confirm / Publish modal ─────────────────────────── */}
			{showConfirmModal && (
				<div
					className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-4"
					role="dialog"
					aria-modal="true"
				>
					{/* Mobile: bottom sheet · Desktop: centered card */}
					<div className="w-full max-w-md rounded-t-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl sm:rounded-2xl sm:p-7">
						<div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/10 sm:hidden" />

						<div className="text-center">
							<div className="mb-3 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 p-2.5">
								<Sparkles className="h-6 w-6 text-emerald-400 sm:h-7 sm:w-7" />
							</div>

							<h3 className="text-lg font-bold text-white sm:text-xl">
								{confirmCount === 0 && "Ready to publish?"}
								{confirmCount === 1 && "Confirm publish"}
								{confirmCount >= 2 && "Final confirmation"}
							</h3>

							<p className="mt-2 text-sm leading-6 text-zinc-400">
								{confirmCount === 0 &&
									"Your site will go live at your subdomain. You can still edit later."}
								{confirmCount === 1 &&
									"Are you sure everything looks good? This will publish the site."}
								{confirmCount >= 2 &&
									"Last step. After this the site is public and the free edit session closes."}
							</p>

							<div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
								<Button
									onClick={() => {
										setShowConfirmModal(false);
										setConfirmCount(0);
									}}
									variant="outline"
									className="h-11 flex-1 rounded-xl border-white/10 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white"
								>
									{confirmCount >= 2 ? "Keep Editing" : "Not Yet"}
								</Button>
								<Button
									onClick={handleConfirmSession}
									className="h-11 flex-1 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-500"
								>
									{confirmCount === 0 && "Yes, Publish"}
									{confirmCount === 1 && "Confirm"}
									{confirmCount >= 2 && "Publish Now"}
								</Button>
							</div>

							<p className="mt-3 text-[10px] text-zinc-500">
								Step {Math.min(confirmCount + 1, 3)} of 3
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}