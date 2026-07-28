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
	const [isDesktop, setIsDesktop] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// ─── Hooks ──────────────────────────────────────────────────
	const { getSite, updateSite } = useSocialTenant();
	const {
		messages,
		isTyping,
		error: chatError,
		sendMessage,
		resetChat,
		blueprint,
		isComplete,
		shouldConfirm,
	} = usePlannerChat(siteId);

	const {
		isGenerating,
		htmlBuffer,
		error: buildError,
		startGeneration,
		reset: resetBuilder,
	} = useBuilderStream();

	const [site, setSite] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmCount, setConfirmCount] = useState(0);

	// ─── Detect Device ─────────────────────────────────────────
	useEffect(() => {
		const checkDevice = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
			setIsDesktop(!mobile);

			if (mobile && viewMode === "code") {
				setViewMode("preview");
			}
		};

		checkDevice();
		window.addEventListener("resize", checkDevice);
		return () => window.removeEventListener("resize", checkDevice);
	}, [viewMode]);

	// ─── Load Site ─────────────────────────────────────────────
	useEffect(() => {
		const loadSite = async () => {
			const siteData = await getSite(siteId);
			if (siteData) {
				setSite(siteData);
				if (siteData.html_code) {
					setViewMode("preview");
				}
			}
			setLoading(false);
		};
		loadSite();
	}, [siteId, getSite]);

	// ─── Handle Build Trigger ──────────────────────────────────
	const handleBuild = async () => {
		if (!blueprint) {
			setError("Please complete the planning phase first.");
			setTimeout(() => setError(null), 3000);
			return;
		}

		try {
			await startGeneration(siteId, blueprint);
			setViewMode(isDesktop ? "code" : "preview");
			setError(null);
		} catch (err: any) {
			setError(err.message || "Failed to start generation");
			setTimeout(() => setError(null), 5000);
		}
	};

	// ─── Handle Session Confirm ────────────────────────────────
	const handleConfirmSession = async () => {
		const newCount = confirmCount + 1;
		setConfirmCount(newCount);

		if (newCount >= 3) {
			try {
				await updateSite(siteId, "status", { status: "published" });
				setShowConfirmModal(false);
				setConfirmCount(0);
				router.push("/st");
			} catch (err: any) {
				setError(err.message || "Failed to close session. Please try again.");
				setConfirmCount(0);
				setTimeout(() => setError(null), 5000);
			}
		}
	};

	// ─── Handle Edit Request from Chat ──────────────────────────
	const handleEditRequest = async (section: string, newContent: string) => {
		if (!site) {
			setError("No site loaded. Please refresh.");
			return;
		}

		try {
			// Send edit request to API
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

			// Update site with new HTML
			if (result.site) {
				setSite(result.site);
				// Refresh to show changes
				window.location.reload();
			}

			setError(null);
		} catch (err: any) {
			setError(err.message || "Failed to apply edit");
			setTimeout(() => setError(null), 5000);
		}
	};

	// ─── Loading State ──────────────────────────────────────────
	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-black">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
					<p className="text-xs text-zinc-500">Loading builder...</p>
				</div>
			</div>
		);
	}

	if (!site) {
		return (
			<div className="flex items-center justify-center h-screen bg-black">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
					<h2 className="text-xl font-bold text-white">Site not found</h2>
					<Button onClick={() => router.push("/st")} className="mt-4">
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	// ─── Main Render ────────────────────────────────────────────
	return (
		<div className="h-screen bg-black text-white flex flex-col">
			{/* ─── Top Bar ──────────────────────────────────────────── */}
			<div className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl px-4 py-3 flex items-center justify-between flex-shrink-0">
				<div className="flex items-center gap-3">
					<button
						onClick={() => router.push("/st")}
						className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
					</button>
					<div>
						<h1 className="text-sm font-bold text-white">{site.site_name}</h1>
						<p className="text-[10px] text-zinc-500">@{username}</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{isGenerating && (
						<div className="flex items-center gap-2 text-amber-400">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span className="text-xs font-medium">Building...</span>
						</div>
					)}
					{site.is_session_active && (
						<div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
							<Clock className="h-3 w-3" />
							<span>Session Active</span>
						</div>
					)}
				</div>

				<div className="flex items-center gap-1 bg-zinc-900/50 rounded-lg p-1">
					<button
						onClick={() => setViewMode("chat")}
						className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
							viewMode === "chat"
								? "bg-emerald-500/20 text-emerald-400"
								: "text-zinc-400 hover:text-white"
						}`}
					>
						<MessageSquare className="h-4 w-4" />
					</button>

					{isDesktop && (
						<button
							onClick={() => setViewMode("code")}
							className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
								viewMode === "code"
									? "bg-emerald-500/20 text-emerald-400"
									: "text-zinc-400 hover:text-white"
							}`}
						>
							<Code2 className="h-4 w-4" />
						</button>
					)}

					<button
						onClick={() => setViewMode("preview")}
						className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
							viewMode === "preview"
								? "bg-emerald-500/20 text-emerald-400"
								: "text-zinc-400 hover:text-white"
						}`}
					>
						<Eye className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* ─── Error Display ───────────────────────────────────── */}
			{error && (
				<div className="px-4 py-2 bg-red-500/10 border-b border-red-500/10 text-red-400 text-sm flex items-center gap-2 flex-shrink-0">
					<AlertCircle className="h-4 w-4" />
					<span>{error}</span>
				</div>
			)}

			{/* ─── Main Content ────────────────────────────────────── */}
			<div className="flex-1 overflow-hidden">
				{viewMode === "chat" && (
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
				)}

				{viewMode === "code" && isDesktop && (
					<CodePanel
						htmlBuffer={htmlBuffer}
						isGenerating={isGenerating}
						error={buildError}
					/>
				)}

				{viewMode === "preview" && (
					<PreviewPanel
						htmlBuffer={htmlBuffer}
						isGenerating={isGenerating}
						isComplete={!isGenerating && htmlBuffer.length > 0}
						siteHtml={site.html_code}
						onEditRequest={handleEditRequest}
					/>
				)}
			</div>

			{/* ─── Session Confirmation Modal ──────────────────────── */}
			{showConfirmModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
					<div className="bg-zinc-950 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
						<div className="text-center">
							<div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
								<Sparkles className="h-8 w-8 text-emerald-400" />
							</div>
							<h3 className="text-xl font-bold text-white mb-2">
								{confirmCount < 2
									? "Are you satisfied?"
									: "One more confirmation"}
							</h3>
							<p className="text-sm text-zinc-400 mb-6">
								{confirmCount === 0 &&
									"We want to make sure you're happy with your website. Are you satisfied with everything?"}
								{confirmCount === 1 &&
									"Are you sure you want to close this session? You can still edit manually later."}
								{confirmCount === 2 &&
									"This will close the session. After this, you'll need to edit manually or start a new build."}
							</p>

							<div className="flex gap-3">
								<Button
									onClick={() => {
										setShowConfirmModal(false);
										setConfirmCount(0);
									}}
									variant="outline"
									className="flex-1 border-white/10 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl h-11"
								>
									{confirmCount >= 2 ? "Keep Editing" : "Not Yet"}
								</Button>
								<Button
									onClick={handleConfirmSession}
									className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-11"
								>
									{confirmCount >= 2
										? "Yes, Close Session"
										: "Yes, I'm Satisfied"}
								</Button>
							</div>

							<p className="text-[10px] text-zinc-500 mt-4">
								{confirmCount < 2
									? `Confirmation ${confirmCount + 1} of 3`
									: "Final confirmation"}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
