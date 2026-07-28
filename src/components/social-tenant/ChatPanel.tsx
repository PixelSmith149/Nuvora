// components/social-tenant/ChatPanel.tsx

"use client";

import {
	AlertCircle,
	Building2,
	CheckCircle2,
	ChevronDown,
	Globe,
	LayoutTemplate,
	Loader2,
	MessageSquare,
	Palette,
	Rocket,
	Send,
	Sparkles,
	User,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
	const inputRef = useRef<HTMLInputElement>(null);

	// ─── Detect Mobile ──────────────────────────────────────────
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// ─── Auto-scroll ────────────────────────────────────────────
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isTyping]);

	// ─── Focus input on mount ──────────────────────────────────
	useEffect(() => {
		if (!isMobile) {
			inputRef.current?.focus();
		}
	}, [isMobile]);

	// ─── Send Message ──────────────────────────────────────────
	const handleSend = async () => {
		const trimmed = inputValue.trim();
		if (!trimmed) return;
		setInputValue("");
		await onSendMessage(trimmed);
	};

	// ─── Key press ─────────────────────────────────────────────
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	// ─── Render Blueprint Preview ──────────────────────────────
	const renderBlueprintPreview = () => {
		if (!blueprint) return null;

		return (
			<div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl mt-3">
				<p className="text-xs font-bold text-emerald-400 flex items-center gap-2">
					<CheckCircle2 className="h-4 w-4" />
					Blueprint Ready
				</p>
				<div className="grid grid-cols-2 gap-2 mt-2 text-xs">
					<div>
						<span className="text-zinc-500">Brand:</span>
						<span className="text-white ml-1">{blueprint.brand_name}</span>
					</div>
					<div>
						<span className="text-zinc-500">Theme:</span>
						<span className="text-white ml-1">{blueprint.theme}</span>
					</div>
					<div className="col-span-2">
						<span className="text-zinc-500">Sections:</span>
						<span className="text-white ml-1">
							{blueprint.sections.join(", ")}
						</span>
					</div>
				</div>
				<Button
					onClick={onBuild}
					className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-10 text-xs flex items-center justify-center gap-2"
				>
					<Rocket className="h-4 w-4" />
					Build Website ($5)
				</Button>
			</div>
		);
	};

	// ─── Render Message ─────────────────────────────────────────
	const renderMessage = (message: ChatMessage) => {
		const isUser = message.role === "user";

		return (
			<div
				key={message.id}
				className={`flex ${isUser ? "justify-end" : "justify-start"}`}
			>
				<div className={`max-w-[85%] ${isUser ? "order-1" : "order-0"}`}>
					{!isUser && (
						<div className="flex items-center gap-2 mb-1">
							<div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
								<Sparkles className="h-3 w-3 text-emerald-400" />
							</div>
							<span className="text-[10px] font-bold text-emerald-400">
								Planner
							</span>
							<span className="text-[9px] text-zinc-600">
								{new Date(message.timestamp).toLocaleTimeString()}
							</span>
						</div>
					)}
					<div
						className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
							isUser
								? "bg-emerald-600 text-white"
								: "bg-zinc-900/60 border border-white/5 text-zinc-200"
						}`}
					>
						{message.content}
					</div>
				</div>
			</div>
		);
	};

	// ─── Main Render ────────────────────────────────────────────
	return (
		<div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-zinc-950 via-black to-black">
			{/* ─── Chat Header ──────────────────────────────────────── */}
			<div className="relative border-b border-white/5 bg-zinc-950/50 px-5 py-4 backdrop-blur-xl">
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
							<MessageSquare className="h-4 w-4 text-emerald-400" />
						</div>

						<div>
							<div className="flex items-center gap-2">
								<span className="text-sm font-semibold tracking-tight text-white">
									AI Website Planner
								</span>

								{blueprint && (
									<span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
										Ready
									</span>
								)}
							</div>

							<p className="mt-0.5 text-[11px] text-zinc-500">
								Describe your vision and I'll build the perfect blueprint.
							</p>
						</div>
					</div>

					{isComplete && (
						<div className="flex items-center gap-1 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1">
							<CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
							<span className="text-[10px] font-medium text-emerald-300">
								Complete
							</span>
						</div>
					)}
				</div>
			</div>

			{/* ─── Messages ──────────────────────────────────────────── */}
			<div className="flex-1 overflow-y-auto px-5 py-6">
				{messages.length === 0 ? (
					<div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center pt-4 text-center">
						<div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
							<Sparkles className="h-9 w-9 text-emerald-400" />
						</div>

						<h3 className="mt-6 text-2xl font-bold tracking-tight text-white">
							Let's Build Your Website
						</h3>

						<p className="mt-3 max-w-lg text-sm leading-7 text-zinc-500">
							Tell me about your business, brand, style and goals. I'll gather
							everything needed to generate a premium website.
						</p>

						{/* Business Blueprints */}
						<div className="mt-10 w-full">
							<div className="mb-5">
								<p className="text-[10px] uppercase tracking-[0.35em] text-zinc-600">
									Business Blueprints
								</p>

								<p className="mt-1 text-xs text-zinc-500">
									Choose a business type and let the AI Planner generate a
									complete website blueprint.
								</p>
							</div>

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								{BUSINESS_BLUEPRINTS.map((item) => (
									<button
										key={item.id}
										onClick={() => setInputValue(item.prompt)}
										className="group rounded-2xl border border-white/5 bg-gradient-to-b from-zinc-900/80 to-black/40 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/20 hover:bg-zinc-900"
									>
										<div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-xl">
											{item.icon}
										</div>

										<h4 className="text-sm font-semibold text-white">
											{item.title}
										</h4>

										<p className="mt-2 line-clamp-3 text-xs leading-6 text-zinc-500">
											{item.prompt}
										</p>
									</button>
								))}
							</div>
						</div>
					</div>
				) : (
					<>
						{messages.map(renderMessage)}

						{isTyping && (
							<div className="flex justify-start">
								<div className="max-w-[85%]">
									<div className="mb-2 flex items-center gap-2">
										<div className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
											<Sparkles className="h-3.5 w-3.5 text-emerald-400" />
										</div>

										<span className="text-[11px] font-semibold text-emerald-300">
											Planner
										</span>
									</div>

									<div className="rounded-2xl border border-white/5 bg-zinc-900/60 px-4 py-3 backdrop-blur-xl">
										<div className="flex items-center gap-1">
											<span
												className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
												style={{ animationDelay: "0ms" }}
											/>
											<span
												className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
												style={{ animationDelay: "150ms" }}
											/>
											<span
												className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
												style={{ animationDelay: "300ms" }}
											/>
										</div>
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</>
				)}
			</div>

			{/* ─── Blueprint Preview ────────────────────────────────── */}
			{blueprint && messages.length > 0 && renderBlueprintPreview()}

			{/* ─── Error ────────────────────────────────────────────── */}
			{error && (
				<div className="flex flex-shrink-0 items-center gap-2 border-t border-red-500/10 bg-red-500/10 px-4 py-2 text-xs text-red-400">
					<AlertCircle className="h-4 w-4" />
					<span>{error}</span>
				</div>
			)}

			{/* ─── Input Area ───────────────────────────────────────── */}
			<div className="border-t border-white/5 bg-zinc-950/50 p-4 backdrop-blur-xl">
				<div className="flex items-end gap-3 rounded-2xl border border-white/5 bg-black/60 p-2">
					<Textarea
						ref={inputRef as any}
						value={inputValue}
						onChange={(e) => {
							setInputValue(e.target.value);

							// Auto-grow
							e.target.style.height = "0px";
							e.target.style.height = `${e.target.scrollHeight}px`;
						}}
						onKeyDown={handleKeyDown}
						placeholder={
							isComplete
								? "Session complete. Edit manually or start new build."
								: "Describe the website you want..."
						}
						disabled={isComplete}
						rows={1}
						className="
    min-h-[40px]
    max-h-40
    resize-none
    overflow-y-auto
    border-0
    bg-transparent
    text-sm
    leading-6
    text-white
    shadow-none
    placeholder:text-zinc-600
    focus-visible:ring-0
  "
					/>

					<Button
						onClick={handleSend}
						disabled={!inputValue.trim() || isComplete || isTyping}
						className="h-10 rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-500"
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
