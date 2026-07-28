// components/social-tenant/SessionConfirmModal.tsx

"use client";

import { CheckCircle2, Loader2, Sparkles, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface SessionConfirmModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	confirmCount: number;
	isComplete: boolean;
	siteName: string;
}

export function SessionConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	confirmCount,
	isComplete,
	siteName,
}: SessionConfirmModalProps) {
	const [loading, setLoading] = useState(false);

	if (!isOpen) return null;

	const handleConfirm = async () => {
		setLoading(true);
		await onConfirm();
		setLoading(false);
	};

	const getMessage = () => {
		if (confirmCount === 0) {
			return {
				title: "Are you satisfied?",
				description: `We want to make sure you're happy with your website. Are you satisfied with everything on "${siteName}"?`,
				action: "Yes, I'm Satisfied",
				secondary: "Not Yet",
			};
		}
		if (confirmCount === 1) {
			return {
				title: "Ready to close?",
				description: `Are you sure you want to close this session? You can still edit manually later from your dashboard.`,
				action: "Yes, Close Session",
				secondary: "Keep Editing",
			};
		}
		return {
			title: "Final confirmation",
			description: `This will close the session. After this, you'll need to edit manually or start a new build for major changes.`,
			action: "Yes, Close It",
			secondary: "Cancel",
		};
	};

	const message = getMessage();

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
			<div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
				{/* Close button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
				>
					<X className="h-4 w-4" />
				</button>

				<div className="text-center">
					<div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
						<Sparkles className="h-8 w-8 text-emerald-400" />
					</div>

					<h3 className="text-xl font-bold text-white mb-2">
						{message.title}
						<span className="text-xs text-zinc-500 ml-2 font-normal">
							({confirmCount + 1}/3)
						</span>
					</h3>

					<p className="text-sm text-zinc-400 mb-6 leading-relaxed">
						{message.description}
					</p>

					{isComplete && (
						<div className="flex items-center justify-center gap-2 mb-4 text-emerald-400 text-xs">
							<CheckCircle2 className="h-4 w-4" />
							<span>Website generation complete</span>
						</div>
					)}

					<div className="flex flex-col sm:flex-row gap-3">
						<Button
							onClick={onClose}
							variant="outline"
							className="flex-1 border-white/10 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl h-11 text-sm font-medium order-2 sm:order-1"
						>
							{message.secondary}
						</Button>
						<Button
							onClick={handleConfirm}
							disabled={loading}
							className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold rounded-xl h-11 text-sm order-1 sm:order-2"
						>
							{loading ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : (
								message.action
							)}
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
	);
}
