// components/social-tenant/ChatPanel.tsx

"use client";

import {
	AlertCircle,
	CheckCircle2,
	Loader2,
	MessageSquare,
	Rocket,
	Send,
	Sparkles,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BUSINESS_BLUEPRINTS } from "@/lib/business-blueprint";
import type { ChatMessage, SiteBlueprint } from "@/lib/st/types";

interface ChatPanelProps {
	messages: ChatMessage[];
	isTyping: boolean;
	error: string | null;
	onSendMessage: (content: string) => Promise<void>;
	onBuild: () => void;
	blueprint: SiteBlueprint | null;
	isComplete: boolean;
	shouldConfirm: boolean;
	onConfirmSession: () => void;
}

export function ChatPanel({
	messages,
	isTyping,
	error,
	onSendMessage,
	onBuild,
	blueprint,
	isComplete,
	shouldConfirm,
	onConfirmSession,
}: ChatPanelProps) {
	const [inputValue, setInputValue] = useState("");
	const [isMobile, setIsMobile] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	// ─── Detect Mobile ──────────────────────────────────────────
	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// ─── Auto-scroll ────────────────────────────────────────────
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isTyping]);

	// ─── Focus on desktop only ──────────────────────────────────
	useEffect(() => {
		if (!isMobile) {
			textareaRef.current?.focus();
		}
	}, [isMobile]);

	// ─── Send ───────────────────────────────────────────────────
	const handleSend = async () => {
		const trimmed = inputValue.trim();
		if (!trimmed || isTyping || isComplete) return;
		setInputValue("");
		if (textareaRef.current) {
			textareaRef.current.style.height = "40px";
		}
		await onSendMessage(trimmed);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	// ─── Blueprint card (compact on mobile) ─────────────────────
	const renderBlueprintPreview = () => {
		if (!blueprint) return null;

		return (
			<div className="flex-shrink-0 border-t border-white/5 bg-zinc-950/80 px-3 py-3 sm:px-4">
				<div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3">
					<div className="flex items-center justify-between gap-2">
						<p className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
							<CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
							<span>Blueprint Ready</span>
						</p>
						{isComplete && (
							<span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
								Complete
							</span>
						)}
					</div>

					<div className="mt-2 grid grid-cols-1 gap-1.5 text-[11px] sm:grid-cols-2">
						<div className="min-w-0 truncate">
							<span className="text-zinc-500">Brand:</span>{" "}
							<span className="text-white">{blueprint.brand_name}</span>
						</div>
						<div className="min-w-0 truncate">
							<span className="text-zinc-500">Theme:</span>{" "}
							<span className="text-white">
								{blueprint.theme || blueprint.design_style || "—"}
							</span>
						</div>
						<div className="min-w-0 sm:col-span-2">
							<span className="text-zinc-500">Sections:</span>{" "}
							<span className="text-white">
								{(blueprint.sections || []).slice(0, 6).join(", ")}
								{(blueprint.sections || []).length > 6 ? "…" : ""}
							</span>
						</div>
					</div>

					<Button
						onClick={onBuild}
						className="mt-3 h-10 w-full rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500"
					>
						<Rocket className="mr-1.5 h-3.5 w-3.5" />
						Build Website ($5)
					</Button>
				</div>
			</div>
		);
	};

	// ─── Single message ─────────────────────────────────────────
	const renderMessage = (message: ChatMessage) => {
		const isUser = message.role === "user";

		return (
			<div
				key={message.id}
				className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
			>
				<div className={`max-w-[min(85%,28rem)] min-w-0 ${isUser ? "" : ""}`}>
					{!isUser && (
						<div className="mb-1 flex items-center gap-1.5">
							<div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
								<Sparkles className="h-3 w-3 text-emerald-400" />
							</div>
							<span className="text-[10px] font-bold text-emerald-400">
								Planner
							</span>
							<span className="text-[9px] text-zinc-600">
								{new Date(message.timestamp).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</span>
						</div>
					)}
					<div
						className={`break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
							isUser
								? "bg-emerald-600 text-white"
								: "border border-white/5 bg-zinc-900/70 text-zinc-200"
						}`}
					>
						{message.content}
					</div>
				</div>
			</div>
		);
	};

	// ─── Empty state (business blueprints) ──────────────────────
	const renderEmptyState = () => (
		<div className="mx-auto flex w-full max-w-2xl flex-col items-center px-1 pb-4 pt-2 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 sm:h-16 sm:w-16">
				<Sparkles className="h-7 w-7 text-emerald-400 sm:h-8 sm:w-8" />
			</div>

			<h3 className="mt-4 text-lg font-bold tracking-tight text-white sm:text-xl">
				Let's Build Your Website
			</h3>

			<p className="mt-2 max-w-md text-xs leading-6 text-zinc-500 sm:text-sm">
				Describe your business, brand and goals. I'll create a complete
				blueprint for a premium website.
			</p>

			{/* Blueprint starters – clean mobile grid */}
			<div className="mt-6 w-full">
				<p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
					Quick Start
				</p>

				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
					{BUSINESS_BLUEPRINTS.slice(0, isMobile ? 8 : 12).map((item) => (
						<button
							key={item.id}
							type="button"
							onClick={() => {
								setInputValue(item.prompt);
								// Keep focus on mobile after selecting
								setTimeout(() => textareaRef.current?.focus(), 50);
							}}
							className="group flex min-w-0 flex-col items-start rounded-xl border border-white/5 bg-zinc-900/60 p-3 text-left transition-all active:scale-[0.98] hover:border-emerald-500/25 hover:bg-zinc-900"
						>
							<span className="mb-1.5 text-lg leading-none">{item.icon}</span>
							<span className="w-full truncate text-[11px] font-semibold text-white sm:text-xs">
								{item.title}
							</span>
						</button>
					))}
				</div>

				{BUSINESS_BLUEPRINTS.length > (isMobile ? 8 : 12) && (
					<p className="mt-3 text-[10px] text-zinc-600">
						Or just type your idea below
					</p>
				)}
			</div>
		</div>
	);

	// ─── Main layout ────────────────────────────────────────────
	return (
		<div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-black">
			{/* Header – never shrinks */}
			<div className="flex-shrink-0 border-b border-white/5 bg-zinc-950/80 px-3 py-3 backdrop-blur-xl sm:px-5 sm:py-4">
				<div className="flex items-center gap-2.5 sm:gap-3">
					<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 sm:h-9 sm:w-9">
						<MessageSquare className="h-3.5 w-3.5 text-emerald-400 sm:h-4 sm:w-4" />
					</div>

					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-1.5">
							<span className="truncate text-sm font-semibold text-white">
								AI Website Planner
							</span>
							{blueprint && (
								<span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-300">
									Ready
								</span>
							)}
						</div>
						<p className="mt-0.5 truncate text-[10px] text-zinc-500 sm:text-[11px]">
							Describe your vision — I'll craft the blueprint
						</p>
					</div>

					{isComplete && (
						<div className="hidden flex-shrink-0 items-center gap-1 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2.5 py-1 sm:flex">
							<CheckCircle2 className="h-3 w-3 text-emerald-400" />
							<span className="text-[10px] font-medium text-emerald-300">
								Complete
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Messages – only this area scrolls */}
			<div
				ref={scrollContainerRef}
				className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 sm:py-5"
			>
				{messages.length === 0 ? (
					renderEmptyState()
				) : (
					<div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
						{messages.map(renderMessage)}

						{isTyping && (
							<div className="flex justify-start">
								<div className="max-w-[85%]">
									<div className="mb-1.5 flex items-center gap-1.5">
										<div className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
											<Sparkles className="h-3 w-3 text-emerald-400" />
										</div>
										<span className="text-[10px] font-semibold text-emerald-300">
											Planner
										</span>
									</div>
									<div className="rounded-2xl border border-white/5 bg-zinc-900/70 px-4 py-3">
										<div className="flex items-center gap-1">
											<span
												className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400"
												style={{ animationDelay: "0ms" }}
											/>
											<span
												className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400"
												style={{ animationDelay: "150ms" }}
											/>
											<span
												className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400"
												style={{ animationDelay: "300ms" }}
											/>
										</div>
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} className="h-px" />
					</div>
				)}
			</div>

			{/* Blueprint – sits above input, never pushes it off-screen */}
			{blueprint && messages.length > 0 && renderBlueprintPreview()}

			{/* Error */}
			{error && (
				<div className="flex flex-shrink-0 items-start gap-2 border-t border-red-500/15 bg-red-500/10 px-3 py-2 text-xs text-red-400 sm:px-4">
					<AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
					<span className="min-w-0 break-words">{error}</span>
				</div>
			)}

			{/* Input bar – always visible, never hidden under edges */}
			<div className="flex-shrink-0 border-t border-white/5 bg-zinc-950/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:px-4 sm:pb-4">
				<div className="mx-auto flex w-full max-w-2xl items-end gap-2 rounded-2xl border border-white/10 bg-black/70 p-1.5 sm:gap-2.5 sm:p-2">
					<Textarea
						ref={textareaRef}
						value={inputValue}
						onChange={(e) => {
							setInputValue(e.target.value);
							e.target.style.height = "40px";
							e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
						}}
						onKeyDown={handleKeyDown}
						placeholder={
							isComplete
								? "Blueprint ready — click Build above"
								: "Describe the website you want…"
						}
						disabled={isComplete || isTyping}
						rows={1}
						className="min-h-[40px] max-h-[120px] flex-1 resize-none overflow-y-auto border-0 bg-transparent px-2.5 py-2 text-sm leading-5 text-white shadow-none placeholder:text-zinc-600 focus-visible:ring-0 disabled:opacity-50"
					/>

					<Button
						onClick={handleSend}
						disabled={!inputValue.trim() || isComplete || isTyping}
						size="icon"
						className="h-10 w-10 flex-shrink-0 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40"
					>
						{isTyping ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Send className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}