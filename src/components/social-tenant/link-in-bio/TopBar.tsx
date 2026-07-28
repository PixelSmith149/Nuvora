// /app/component/st/topBar.tsx

"use client";

import {
	AlertCircle,
	ArrowLeft,
	CheckCircle2,
	Copy,
	ExternalLink,
	Globe,
	Loader2,
	Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface TopBarProps {
	template: {
		name: string;
		description: string;
	};
	username?: string;
	isPublished?: boolean;
	saving?: boolean;
	uploading?: boolean;
	uploadType?: string;
	error?: string | null;
	success?: string | null;
	copied?: boolean;
	onSave?: () => void;
	onPublish?: () => void;
	onCopyLink?: () => void;
}

export function TopBar({
	template,
	username,
	isPublished = false,
	saving = false,
	uploading = false,
	uploadType = "",
	error = null,
	success = null,
	copied = false,
	onSave,
	onPublish,
	onCopyLink,
}: TopBarProps) {
	const router = useRouter();

	return (
		<div className="sticky top-0 z-30 border-b border-white/5 bg-zinc-950/70 backdrop-blur-2xl">
			<div className="mx-auto flex min-w-0 items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 lg:gap-4">
				{/* Left Section - Fixed width, won't shrink */}
				<div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
					<button
						onClick={() => router.push("/st/link-in-bio")}
						className="group relative overflow-hidden flex h-9 w-9 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.03] text-zinc-400 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:border-white/15 hover:bg-white/[0.08] hover:text-white hover:shadow-[0_15px_35px_rgba(255,255,255,0.08)] active:translate-y-0 active:scale-95"
					>
						<span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
						<ArrowLeft className="relative z-10 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:-translate-x-1" />
					</button>

					<div className="min-w-0 flex-1">
						<h1 className="truncate text-xs sm:text-sm font-bold text-white">
							Editing: {template.name}
						</h1>
						<p className="hidden sm:block truncate text-[10px] text-zinc-500">
							{template.description}
						</p>
					</div>
				</div>

				{/* Right Section - Liquid Grid: shrinks instead of wrapping */}
				<div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-1.5">
					{/* Status Messages - Shrink with text truncation */}
					{uploading && (
						<span className="inline-flex flex-shrink min-w-0 items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-medium text-amber-300">
							<Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 animate-spin" />
							<span className="truncate">Uploading {uploadType}...</span>
						</span>
					)}

					{error && (
						<span className="inline-flex flex-shrink min-w-0 items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-medium text-red-300">
							<AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
							<span className="truncate">{error}</span>
						</span>
					)}

					{success && (
						<span className="inline-flex flex-shrink min-w-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-medium text-emerald-300">
							<CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
							<span className="truncate">{success}</span>
						</span>
					)}

					{/* Action Buttons - Liquid shrink */}
					<Button
						onClick={onSave}
						disabled={saving || uploading}
						className="group relative overflow-hidden flex-shrink min-w-0 rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.04] px-2 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:border-white/15 hover:bg-white/[0.08] hover:shadow-[0_15px_35px_rgba(255,255,255,0.08)] active:scale-95"
					>
						<span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
						<span className="relative z-10 flex items-center gap-1 sm:gap-2">
							{saving ? (
								<Loader2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 animate-spin" />
							) : (
								<Save className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />
							)}
							<span className="hidden xs:inline">Save Draft</span>
							<span className="inline xs:hidden">Save</span>
						</span>
					</Button>

					<Button
						onClick={onPublish}
						disabled={saving || uploading || isPublished}
						className="group relative overflow-hidden flex-shrink min-w-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-2 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold text-black transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_18px_40px_rgba(16,185,129,0.45)] active:scale-95"
					>
						<span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
						<span className="relative z-10 flex items-center gap-1 sm:gap-2">
							{isPublished ? (
								<>
									<CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
									<span className="hidden xs:inline">Published</span>
									<span className="inline xs:hidden">Pub.</span>
								</>
							) : (
								<>
									<Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
									<span className="hidden xs:inline">Publish</span>
									<span className="inline xs:hidden">Pub.</span>
								</>
							)}
						</span>
					</Button>

					{/* View Button - Only show when published */}
					{isPublished && (
						<a
							href={`/u/${username}`}
							target="_blank"
							rel="noopener noreferrer"
							className="group relative overflow-hidden flex-shrink min-w-0 flex items-center gap-1 rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.04] px-2 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-medium text-white transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:border-white/15 hover:bg-white/[0.08] hover:shadow-[0_15px_35px_rgba(255,255,255,0.08)] active:scale-95"
						>
							<span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
							<ExternalLink className="relative z-10 h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
							<span className="relative z-10 hidden xs:inline">View</span>
						</a>
					)}

					{/* Copy Link Button - Only show when published */}
					{isPublished && (
						<button
							onClick={onCopyLink}
							title="Copy link to clipboard"
							className="group relative overflow-hidden flex-shrink min-w-0 flex items-center gap-1 rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.04] px-2 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-medium text-white transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:border-white/15 hover:bg-white/[0.08] hover:shadow-[0_15px_35px_rgba(255,255,255,0.08)] active:scale-95"
						>
							<span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
							<span className="relative z-10 flex items-center gap-1 sm:gap-2">
								{copied ? (
									<CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
								) : (
									<Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />
								)}
								<span className="hidden xs:inline">
									{copied ? "Copied!" : "Copy Link"}
								</span>
							</span>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
