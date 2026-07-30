"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import WalletPanel from "@/components/account/WalletPanel";
import Link from "next/link";
import { FiChevronLeft, FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";

function WalletContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	
	const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

	useEffect(() => {
		const status = searchParams.get("status");
		const message = searchParams.get("message");
		const reference = searchParams.get("reference");

		if (status === "success") {
			setBanner({
				type: "success",
				message: reference
					? `Payment verified successfully! Reference: ${reference}`
					: "Your wallet balance was updated successfully.",
			});
			// Clean up URL parameters after reading
			router.replace("/account/wallet", { scroll: false });
		} else if (status === "error") {
			setBanner({
				type: "error",
				message: message ? decodeURIComponent(message) : "Payment process failed or was canceled.",
			});
			router.replace("/account/wallet", { scroll: false });
		}
	}, [searchParams, router]);

	return (
		<main className="min-h-screen bg-black text-white px-6 py-8">
			<section className="mx-auto w-full max-w-5xl space-y-8">
				<Link
					href="/account"
					className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
				>
					<FiChevronLeft /> Back to Account
				</Link>

				<header>
					<p className="text-xs uppercase tracking-[0.5em] text-white/40">
						Secure Wallet
					</p>

					<p className="text-white/50 mt-3 max-w-xl">
						Manage your USD balance, deposits, transfers, and withdrawals.
					</p>
				</header>

				{/* Verification Result Banner */}
				{banner && (
					<div
						className={`flex items-center justify-between p-4 rounded-xl border text-sm transition-all ${
							banner.type === "success"
								? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
								: "bg-rose-500/10 border-rose-500/20 text-rose-400"
						}`}
					>
						<div className="flex items-center gap-3">
							{banner.type === "success" ? (
								<FiCheckCircle className="text-lg flex-shrink-0" />
							) : (
								<FiAlertCircle className="text-lg flex-shrink-0" />
							)}
							<span>{banner.message}</span>
						</div>
						<button
							onClick={() => setBanner(null)}
							className="p-1 text-zinc-400 hover:text-white transition-colors"
							aria-label="Close notification"
						>
							<FiX />
						</button>
					</div>
				)}

				<WalletPanel />
			</section>
		</main>
	);
}

export default function WalletPage() {
	return (
		
			<Suspense fallback={<div className="min-h-screen bg-black text-white px-6 py-8">Loading wallet details...</div>}>
				<WalletContent />
			</Suspense>
		
	);
}