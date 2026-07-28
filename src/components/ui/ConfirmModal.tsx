// components/ui/ConfirmModal.tsx

"use client";

import { AlertTriangle, X } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmModal({
	isOpen,
	title,
	message,
	confirmText = "Delete",
	cancelText = "Cancel",
	onConfirm,
	onCancel,
}: ConfirmModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
			<div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
				<div className="flex items-start gap-4">
					<div className="p-2 rounded-full bg-red-500/10 border border-red-500/20 flex-shrink-0">
						<AlertTriangle className="h-6 w-6 text-red-400" />
					</div>
					<div className="flex-1">
						<h3 className="text-lg font-bold text-white">{title}</h3>
						<p className="text-sm text-zinc-400 mt-1">{message}</p>
					</div>
					<button
						onClick={onCancel}
						className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="flex gap-3 mt-6">
					<Button
						onClick={onCancel}
						variant="outline"
						className="flex-1 border-white/10 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl h-11"
					>
						{cancelText}
					</Button>
					<Button
						onClick={onConfirm}
						className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl h-11"
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</div>
	);
}
