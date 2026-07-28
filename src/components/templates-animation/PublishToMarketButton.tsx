// components/templates-animation/PublishToMarketButton.tsx

"use client";

import {
	AlertCircle,
	CheckCircle2,
	ExternalLink,
	Globe,
	Loader2,
	Store,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { publishToGlobalMarketClient } from "@/lib/st/services/publish-to-market.client";

interface PublishToMarketButtonProps {
	templateId: string;
	userId: string;
	templateName: string;
	isPublished: boolean;
}

export function PublishToMarketButton({
	templateId,
	userId,
	templateName,
	isPublished,
}: PublishToMarketButtonProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState<
		"idle" | "success" | "error" | "need-store"
	>("idle");
	const [listingId, setListingId] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handlePublish = async () => {
		if (!isPublished) {
			setErrorMessage("Please publish the template first");
			setStatus("error");
			return;
		}

		setLoading(true);
		setStatus("idle");
		setErrorMessage(null);

		try {
			const result = await publishToGlobalMarketClient(templateId, userId);

			if (result.success) {
				setStatus("success");
				setListingId(result.listingId || null);
			} else if (result.needStore) {
				setStatus("need-store");
				setErrorMessage(result.error || "You need to create a store first");
			} else {
				setStatus("error");
				setErrorMessage(result.error || "Failed to publish to Global Market");
			}
		} catch (error: any) {
			setStatus("error");
			setErrorMessage(error.message || "An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	if (status === "success") {
		return (
			<div className="space-y-3">
				<div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
					<CheckCircle2 className="h-5 w-5" />
					<span className="text-sm font-medium">
						Template listed in Global Market!
					</span>
				</div>
				<div className="flex gap-3">
					<Button
						onClick={() => router.push("/m/global-market")}
						className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
					>
						<Store className="h-4 w-4 mr-2" />
						Go to Global Market
					</Button>
					{listingId && (
						<Button
							onClick={() =>
								router.push(`/m/global-market/listing/${listingId}`)
							}
							variant="outline"
							className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
						>
							<ExternalLink className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>
		);
	}

	if (status === "need-store") {
		return (
			<div className="space-y-3">
				<div className="flex items-start gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
					<AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
					<div>
						<p className="text-sm font-medium">{errorMessage}</p>
						<p className="text-xs text-zinc-400 mt-1">
							Complete storefront verification to list your templates.
						</p>
					</div>
				</div>
				<Button
					onClick={() => router.push("/st/onboarding")}
					className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl"
				>
					<Store className="h-4 w-4 mr-2" />
					Complete Storefront Setup
				</Button>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="space-y-3">
				<div className="flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
					<AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
					<div>
						<p className="text-sm font-medium">Failed to publish</p>
						<p className="text-xs text-zinc-400 mt-1">{errorMessage}</p>
					</div>
				</div>
				<Button
					onClick={handlePublish}
					className="w-full bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl"
				>
					Try Again
				</Button>
			</div>
		);
	}

	return (
		<Button
			onClick={handlePublish}
			disabled={loading || !isPublished}
			className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold rounded-xl h-11"
		>
			{loading ? (
				<Loader2 className="h-4 w-4 animate-spin mr-2" />
			) : (
				<Globe className="h-4 w-4 mr-2" />
			)}
			{loading ? "Publishing..." : "Publish to Global Market"}
		</Button>
	);
}
