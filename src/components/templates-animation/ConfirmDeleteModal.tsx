// components/templates-animation/ConfirmDeleteModal.tsx
"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import React from "react";

interface ConfirmDeleteModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	title: string;
	message: string;
	isDeleting: boolean;
}

export function ConfirmDeleteModal({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	isDeleting,
}: ConfirmDeleteModalProps) {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget && !isDeleting) onClose();
			}}
		>
			<div
				className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="p-4 border-b border-white/5 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
							<AlertTriangle className="h-5 w-5 text-red-400" />
						</div>
						<h3 className="text-lg font-bold text-white">{title}</h3>
					</div>
					<button
						onClick={onClose}
						disabled={isDeleting}
						className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="p-4">
					<p className="text-sm text-zinc-400">{message}</p>
					<p className="text-xs text-zinc-500 mt-2">
						This action cannot be undone.
					</p>

					<div className="flex items-center gap-3 mt-4">
						<button
							type="button"
							onClick={onClose}
							disabled={isDeleting}
							className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={onConfirm}
							disabled={isDeleting}
							className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
						>
							{isDeleting ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
