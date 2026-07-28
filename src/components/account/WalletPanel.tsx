"use client";

import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/wallet/useWallet";

export default function WalletPanel() {
	const router = useRouter();

	const { wallet, loading } = useWallet();

	if (loading) {
		return (
			<section className="space-y-6 animate-pulse">
				<div className="h-56 rounded-3xl border border-white/10 bg-white/[0.03]" />

				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="h-28 rounded-2xl border border-white/10 bg-white/[0.03]"
						/>
					))}
				</div>

				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-20 rounded-2xl border border-white/10 bg-white/[0.03]"
						/>
					))}
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-8">
			{/* Wallet Hero */}

			<div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-8">
				<div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-white/5 blur-3xl" />

				<div className="relative">
					<p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
						Prime Wallet
					</p>

					<p className="mt-6 text-zinc-400 text-sm">Available Balance</p>

					<h1 className="mt-2 text-5xl font-black tracking-tight">
						$
						{wallet.balance.toLocaleString(undefined, {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</h1>

					<div className="mt-4 inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
						● Wallet Active
					</div>
				</div>
			</div>

			{/* Actions */}

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<button
					onClick={() => router.push("/account/wallet/topup")}
					className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-left transition hover:scale-[1.02] hover:border-emerald-500"
				>
					<div className="text-3xl">＋</div>

					<h3 className="mt-5 font-bold">Top Up</h3>

					<p className="mt-1 text-xs text-zinc-400">Add funds instantly</p>
				</button>

				<button
					onClick={() => router.push("/account/wallet/transfer")}
					className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6 text-left transition hover:scale-[1.02] hover:border-blue-500"
				>
					<div className="text-3xl">⇄</div>

					<h3 className="mt-5 font-bold">Transfer</h3>

					<p className="mt-1 text-xs text-zinc-400">Send money to friends</p>
				</button>

				<button
					onClick={() => router.push("/account/wallet/withdraw")}
					className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-6 text-left transition hover:scale-[1.02] hover:border-orange-500"
				>
					<div className="text-3xl">↓</div>

					<h3 className="mt-5 font-bold">Withdraw</h3>

					<p className="mt-1 text-xs text-zinc-400">Move funds out</p>
				</button>

				<button
					onClick={() => router.push("/account/wallet/tnt")}
					className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-6 text-left transition hover:scale-[1.02] hover:border-purple-500"
				>
					<div className="text-3xl">🧾</div>

					<h3 className="mt-5 font-bold">History</h3>

					<p className="mt-1 text-xs text-zinc-400">View all activity</p>
				</button>
			</div>

			{/* Stats */}

			<div className="grid md:grid-cols-3 gap-4">
				<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
					<p className="text-xs uppercase tracking-widest text-zinc-500">
						Currency
					</p>

					<h2 className="mt-3 text-2xl font-bold">{wallet.currency}</h2>
				</div>

				<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
					<p className="text-xs uppercase tracking-widest text-zinc-500">
						Transactions
					</p>

					<h2 className="mt-3 text-2xl font-bold">
						{wallet.transactions.length}
					</h2>
				</div>

				<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
					<p className="text-xs uppercase tracking-widest text-zinc-500">
						Wallet Status
					</p>

					<h2 className="mt-3 text-2xl font-bold text-emerald-400">Active</h2>
				</div>
			</div>

			{/* Recent Activity */}

			<div className="rounded-3xl border border-white/10 bg-white/[0.02]">
				<div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
					<h2 className="font-bold text-lg">Recent Activity</h2>

					<button
						onClick={() => router.push("/wallet")}
						className="text-sm text-zinc-400 hover:text-white"
					>
						View all
					</button>
				</div>

				{wallet.transactions.length === 0 && (
					<div className="py-16 text-center text-zinc-500">
						No transactions yet.
					</div>
				)}

				{wallet.transactions.slice(0, 5).map((tx) => {
					const positive = tx.type === "deposit";

					return (
						<div
							key={tx.id}
							className="flex items-center justify-between border-b border-white/5 px-6 py-5 last:border-0"
						>
							<div className="flex items-center gap-4">
								<div
									className={`h-12 w-12 rounded-full flex items-center justify-center text-lg ${
										tx.type === "deposit"
											? "bg-emerald-500/15"
											: tx.type === "withdraw"
												? "bg-orange-500/15"
												: "bg-blue-500/15"
									}`}
								>
									{tx.type === "deposit"
										? "↓"
										: tx.type === "withdraw"
											? "↑"
											: "⇄"}
								</div>

								<div>
									<h3 className="font-medium capitalize">{tx.type}</h3>

									<p className="text-xs text-zinc-500">
										{new Date(tx.created_at).toLocaleString()}
									</p>
								</div>
							</div>

							<div className="text-right">
								<p
									className={`font-bold ${
										positive ? "text-emerald-400" : "text-white"
									}`}
								>
									{positive ? "+" : "-"}${Number(tx.amount).toFixed(2)}
								</p>

								<p
									className={`text-xs capitalize ${
										tx.status === "success"
											? "text-emerald-400"
											: tx.status === "pending"
												? "text-yellow-400"
												: "text-red-400"
									}`}
								>
									{tx.status}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
