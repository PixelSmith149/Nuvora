"use client";

import { useState } from "react";
import type { WithdrawDraft } from "@/lib/wallet/types";

type Props = {
	draft: WithdrawDraft;
	onBack: () => void;
	onSuccess: () => void;
};

export default function WithdrawReviewPanel({
	draft,
	onBack,
	onSuccess,
}: Props) {
	const [loading, setLoading] = useState(false);

	const {
		amountUsd,
		payoutAmount,
		currency,
		method,
		exchangeRate,
		fee,
		account_number,
		account_name,
		bank_code,
		provider,
		country,
	} = draft;

	// 🎯 FIXED: Check data values directly on the root draft scope object
	const isInvalid = !account_number || !country;

	async function confirmWithdrawal() {
		if (isInvalid) return;

		setLoading(true);

		try {
			const res = await fetch("/api/wallet/withdraw", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					amount: amountUsd,
					currency,
					method, // Track whether transaction is momo, bank, or crypto
					country,
					account_name: account_name || undefined,
					account_number: account_number,
					bank_code: bank_code || undefined,
					provider: provider, // Passes dynamic provider matching (e.g., orange, mtn, mpesa)
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Withdrawal engine processing fault.");
			}

			onSuccess();
		} catch (err: any) {
			alert(err.message ?? "Withdrawal processing exception encountered.");
		} finally {
			setLoading(false);
		}
	}

	if (isInvalid) {
		return (
			<div className="p-6 text-red-400 border border-red-500/10 bg-red-500/[0.02] rounded-2xl font-mono text-xs space-y-2">
				<p className="font-bold">⚠️ Data Integrity Fault Warning:</p>
				<p className="text-zinc-500 leading-relaxed">
					Missing critical destination variables (Account/Address or
					Jurisdiction Reference Code). Please re-route back to fill form
					details.
				</p>
				<button
					onClick={onBack}
					className="mt-2 px-4 py-2 border border-red-500/20 text-red-400 font-bold uppercase rounded-xl hover:bg-red-500/10 transition"
				>
					← Return to Form
				</button>
			</div>
		);
	}

	return (
		<div className="rounded-3xl border border-white/10 bg-zinc-950 p-6 space-y-6 max-w-xl mx-auto">
			<div>
				<h2 className="text-2xl font-black uppercase tracking-tight">
					Review Settlement
				</h2>
				<p className="text-zinc-500 text-xs mt-1">
					Verify transactional pipeline parameters prior to executing your
					withdrawal request.
				</p>
			</div>

			{/* FINANCIAL AUDIT LEDGER GRID */}
			<div className="space-y-3 text-xs font-mono border-b border-white/5 pb-4">
				<div className="flex justify-between items-center">
					<span className="text-zinc-500 uppercase font-bold">
						Ledger Debit Value
					</span>
					<span className="text-white font-bold">
						${(amountUsd ?? 0).toFixed(2)}
					</span>
				</div>

				<div className="flex justify-between items-center">
					<span className="text-zinc-500 uppercase font-bold">
						Upstream FX conversion rate
					</span>
					<span className="text-zinc-300">
						1 USD ≈ {(exchangeRate ?? 0).toLocaleString()} {currency ?? ""}
					</span>
				</div>

				<div className="flex justify-between items-center">
					<span className="text-zinc-500 uppercase font-bold">
						Gateway Processing Fee
					</span>
					<span className="text-red-400">
						-{(fee ?? 0).toFixed(2)} {currency ?? ""}
					</span>
				</div>

				<div className="flex justify-between items-center pt-2 border-t border-white/5 text-sm font-sans">
					<span className="text-zinc-400 font-bold">Net Payout Delivery</span>
					<span className="text-emerald-400 font-black tracking-tight">
						{(payoutAmount ?? 0).toLocaleString()} {currency ?? ""}
					</span>
				</div>
			</div>

			{/* CLEAN RECIPIENT LAYOUT CONTEXT BLOCK */}
			<div className="rounded-2xl border border-white/10 bg-black p-5 space-y-3 text-sm">
				<div className="flex justify-between items-start">
					<div>
						<span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 block">
							Payout Destination
						</span>
						<p className="font-mono mt-1 text-white font-bold tracking-tight select-all break-all">
							{account_number}
						</p>
					</div>
					<span className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-zinc-400 font-bold uppercase font-mono tracking-wider shrink-0">
						{method}
					</span>
				</div>

				{account_name && (
					<div>
						<span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 block">
							Account Holder Name
						</span>
						<p className="text-zinc-300 font-medium">{account_name}</p>
					</div>
				)}

				<div className="grid grid-cols-2 gap-4 pt-1 text-xs">
					{provider && (
						<div>
							<span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 block">
								Network / Route Provider
							</span>
							<p className="text-zinc-400 capitalize font-medium">{provider}</p>
						</div>
					)}
					{bank_code && (
						<div>
							<span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 block">
								Routing Sorting Code
							</span>
							<p className="text-zinc-400 font-mono font-medium">{bank_code}</p>
						</div>
					)}
					<div>
						<span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 block">
							Target Jurisdiction
						</span>
						<p className="text-zinc-400 font-bold font-mono uppercase">
							{country}
						</p>
					</div>
				</div>
			</div>

			{/* ACTIONS */}
			<div className="grid grid-cols-2 gap-4">
				<button
					onClick={onBack}
					disabled={loading}
					className="rounded-xl border border-white/10 py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-white/[0.02] active:scale-[0.98] disabled:opacity-40 transition-all text-zinc-400 hover:text-white"
				>
					Back
				</button>

				<button
					onClick={confirmWithdrawal}
					disabled={loading || isInvalid}
					className="rounded-xl bg-white text-black py-3.5 font-black text-xs uppercase tracking-wider hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-40 transition-all flex items-center justify-center shadow-lg shadow-white/5"
				>
					{loading ? "Authorizing Pipeline..." : "Confirm Settlement"}
				</button>
			</div>
		</div>
	);
}
