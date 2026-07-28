"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Transaction = {
	id: string;
	wallet_id: string;
	ledger_entry_id: string | null;
	created_at: string;
	type: "deposit" | "withdrawal" | "transfer_in" | "transfer_out" | string;
	amount: number;
	status: "success" | "pending" | "failed" | string;
	meta: Record<string, any> | null;
	reference: string | null;
	provider: string | null;
};

export default function TransactionsHistoryPage() {
	const supabase = createClient();

	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [filterType, setFilterType] = useState<string>("all");

	useEffect(() => {
		async function fetchTransactionHistory() {
			try {
				setLoading(true);

				// 1. Get current authenticated user
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) return;

				// 2. Fetch user's core wallet ID first
				const { data: wallet } = await supabase
					.from("wallets")
					.select("id")
					.eq("user_id", user.id)
					.single();

				if (!wallet) return;

				// 3. Fetch transactions matching this wallet context
				const { data, error } = await supabase
					.from("wallet_transactions")
					.select("*")
					.eq("wallet_id", wallet.id)
					.order("created_at", { ascending: false });

				if (error) throw error;
				setTransactions(data || []);
			} catch (err) {
				console.error("Error loading wallet transactions ledger:", err);
			} finally {
				setLoading(false);
			}
		}

		fetchTransactionHistory();
	}, []);

	// Filter computing matrix
	const filteredTransactions = useMemo(() => {
		if (filterType === "all") return transactions;
		return transactions.filter((tx) => tx.type === filterType);
	}, [transactions, filterType]);

	// Utility to isolate badge design structures programmatically
	const getStatusStyle = (status: string) => {
		switch (status?.toLowerCase()) {
			case "success":
			case "completed":
				return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
			case "pending":
			case "processing":
				return "bg-amber-500/10 text-amber-400 border-amber-500/20";
			case "failed":
				return "bg-rose-500/10 text-rose-400 border-rose-500/20";
			default:
				return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
		}
	};

	// Utility to isolate context tags and human descriptions
	const getTxDescription = (tx: Transaction) => {
		const typeLower = tx.type?.toLowerCase();
		if (typeLower === "transfer_out") {
			return `Sent to @${tx.meta?.recipient_username || "network user"}`;
		}
		if (typeLower === "transfer_in") {
			return `Received from @${tx.meta?.sender_username || "network user"}`;
		}
		if (typeLower === "withdrawal") {
			return `Payout via ${tx.provider || "Gateway Rail"}`;
		}
		if (typeLower === "deposit") {
			return `Funded wallet via ${tx.provider || "Paystack"}`;
		}
		return `Transaction Settlement (${tx.type})`;
	};

	return (
		<main className="min-h-screen bg-black text-white px-6 py-24">
			<div className="mx-auto max-w-3xl space-y-8">
				{/* NAV & LINK BACK CONTAINER */}
				<div className="flex items-center justify-between">
					<div className="space-y-1">
						<Link
							href="/account"
							className="text-xs font-bold uppercase text-zinc-500 hover:text-white transition tracking-wider flex items-center gap-1.5 mb-2"
						>
							← Account Dashboard
						</Link>
						<h1 className="text-3xl font-black uppercase tracking-tight">
							Ledger History
						</h1>
						<p className="text-sm text-zinc-400">
							Review all transaction actions settled on your digital wallet.
						</p>
					</div>
				</div>

				{/* CONTROLS & FILTERING PILLS */}
				<div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
					{["all", "deposit", "withdrawal", "transfer_in", "transfer_out"].map(
						(type) => (
							<button
								key={type}
								onClick={() => setFilterType(type)}
								className={`rounded-lg px-4 py-2 text-xs font-bold uppercase transition ${
									filterType === type
										? "bg-white text-black"
										: "bg-zinc-950 text-zinc-400 border border-white/5 hover:text-white hover:border-white/20"
								}`}
							>
								{type.replace("_", " ")}
							</button>
						),
					)}
				</div>

				{/* LEDGER RENDER LIST */}
				{loading ? (
					<div className="space-y-3 py-12 text-center">
						<p className="text-sm text-zinc-500 font-medium animate-pulse font-mono">
							Syncing secure transaction ledger matrix...
						</p>
					</div>
				) : filteredTransactions.length > 0 ? (
					<div className="rounded-3xl border border-white/10 bg-zinc-950 overflow-hidden divide-y divide-white/5">
						{filteredTransactions.map((tx) => {
							const isNegative =
								tx.type === "withdrawal" || tx.type === "transfer_out";
							return (
								<div
									key={tx.id}
									className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.01] transition"
								>
									{/* TRANSACTION METADATA INFO FRAME */}
									<div className="space-y-1 flex-1">
										<div className="flex items-center gap-2.5">
											<span
												className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(tx.status)}`}
											>
												{tx.status}
											</span>
											<span className="text-xs text-zinc-500 font-mono">
												{tx.reference
													? `#${tx.reference.substring(0, 12)}`
													: `#${tx.id.substring(0, 8)}`}
											</span>
										</div>
										<p className="text-sm font-bold text-white tracking-tight">
											{getTxDescription(tx)}
										</p>
										<p className="text-[11px] font-mono text-zinc-500">
											{new Date(tx.created_at).toLocaleString(undefined, {
												dateStyle: "medium",
												timeStyle: "short",
											})}
										</p>
									</div>

									{/* FINANCIAL SETTLEMENT COUNTERPART */}
									<div className="text-left sm:text-right font-mono">
										<p
											className={`text-base font-black ${isNegative ? "text-zinc-400" : "text-emerald-400"}`}
										>
											{isNegative ? "-" : "+"}${Number(tx.amount).toFixed(2)}
										</p>
										<p className="text-[10px] uppercase font-sans font-bold tracking-wider text-zinc-600">
											{tx.type.replace("_", " ")}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
						<p className="text-sm text-zinc-500 font-medium">
							No transaction records match the current ledger criteria.
						</p>
					</div>
				)}
			</div>
		</main>
	);
}
