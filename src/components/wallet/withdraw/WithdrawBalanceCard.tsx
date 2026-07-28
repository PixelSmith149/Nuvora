"use client";

import { ArrowUpRight, Wallet } from "lucide-react";
import { useWallet } from "@/lib/wallet/useWallet";

export default function WithdrawBalanceCard() {
	const { wallet, loading } = useWallet();

	// Defensively extract balance with a hard fallback to prevent runtime crashes
	const currentBalance = wallet?.balance ?? 0;

	return (
		<section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4 sm:p-6 md:p-8 w-full max-w-6xl">
			{/* Aesthetic Background Glows - overflow-hidden clips these perfectly to the card borders */}
			<div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
			<div className="absolute -left-20 bottom-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

			{/* Main Structural Wrapper: Preserves a single row layout across all screens */}
			<div className="relative flex flex-row items-center justify-between gap-4 w-full">
				{/* LEFT NODE: Balance Info Group (Allows fluid shrinking) */}
				<div className="flex items-center gap-3 min-w-0 shrink">
					<div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-green-500/10">
						<Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
					</div>

					{/* min-w-0 here is critical; it enables truncation within flex children */}
					<div className="min-w-0">
						<p className="text-[9px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-zinc-500 font-medium truncate">
							Available Balance
						</p>

						<h1 className="mt-0.5 text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white truncate">
							{loading ? (
								<span className="tracking-widest">••••••</span>
							) : (
								`$${currentBalance.toFixed(2)}`
							)}
						</h1>

						<p className="mt-1 text-[9px] sm:text-xs text-zinc-500 font-mono hidden sm:block">
							Base wallet currency: USD
						</p>
					</div>
				</div>

				{/* RIGHT NODE: Status Indicators Grid (Stays locked on the right line, scaling down) */}
				<div className="flex flex-row items-center gap-2 sm:gap-4 shrink-0">
					{/* Withdrawal Status Container */}
					<div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] p-2.5 sm:p-4 text-center min-w-[75px] sm:min-w-[120px]">
						<p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
							Withdrawal
						</p>
						<p className="mt-0.5 text-xs sm:text-base font-black text-green-400">
							Enabled
						</p>
					</div>

					{/* Settlement Status Container */}
					<div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] p-2.5 sm:p-4 text-center min-w-[75px] sm:min-w-[120px]">
						<p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
							Settlement
						</p>
						<div className="mt-0.5 flex items-center justify-center gap-1">
							<ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400 shrink-0" />
							<span className="text-xs sm:text-base font-bold text-zinc-200">
								Live FX
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
