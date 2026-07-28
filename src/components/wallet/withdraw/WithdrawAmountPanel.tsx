"use client";

import { useEffect, useState } from "react";
import type { WithdrawDraft } from "@/lib/wallet/types";
import { useWallet } from "@/lib/wallet/useWallet";

type Quote = {
	usd_amount: number;
	payout_amount: number;
	payout_currency: string;
	exchange_rate: number;
	fee: number;
	total_received: number;
};

type Props = {
	value: WithdrawDraft;
	onBack: () => void;
	onNext: (draft: Partial<WithdrawDraft>) => void;
};

export default function WithdrawAmountPanel({ value, onBack, onNext }: Props) {
	const { wallet } = useWallet();

	const [amount, setAmount] = useState("");
	const [loading, setLoading] = useState(false);

	const [quote, setQuote] = useState<Quote | null>(null);

	const [error, setError] = useState("");

	useEffect(() => {
		if (!amount) {
			setQuote(null);
			return;
		}

		const usd = Number(amount);

		if (Number.isNaN(usd) || usd <= 0) {
			setQuote(null);
			return;
		}

		if (usd > wallet.balance) {
			setError("Insufficient wallet balance.");
			setQuote(null);
			return;
		}

		setError("");

		const timeout = setTimeout(async () => {
			try {
				setLoading(true);

				const res = await fetch("/api/wallet/withdraw/quote", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						usd_amount: usd,
						country: value.country,
						currency: value.currency,
						method: value.method,
					}),
				});

				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error ?? "Quote failed.");
				}

				setQuote(data);
			} catch (err: any) {
				setQuote(null);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}, 400);

		return () => clearTimeout(timeout);
	}, [amount, value.country, value.currency, value.method, wallet.balance]);

	function continueStep() {
		if (!quote) return;

		onNext({
			amountUsd: quote.usd_amount,

			payoutAmount: quote.payout_amount,

			currency: quote.payout_currency,

			exchangeRate: quote.exchange_rate,

			fee: quote.fee,

			totalReceived: quote.total_received,
		});
	}

	return (
		<section className="space-y-8">
			<div>
				<h2 className="text-3xl font-black">Withdrawal Amount</h2>

				<p className="mt-2 text-zinc-400">
					Your wallet balance is stored in USD, but you can withdraw to your
					prefered currency
				</p>
			</div>

			<div className="rounded-3xl border border-white/10 bg-zinc-950 p-6 space-y-6">
				<div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
					<p className="text-sm text-zinc-400">Available Balance</p>

					<h3 className="mt-2 text-4xl font-black">
						${wallet.balance.toFixed(2)}
					</h3>
				</div>

				<div>
					<label className="block mb-2 text-sm text-zinc-400">
						Amount (USD)
					</label>

					<input
						type="number"
						min="1"
						step="0.01"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder="0.00"
						className="w-full rounded-xl border border-white/10 bg-black px-4 py-4 text-xl outline-none"
					/>
				</div>

				{loading && (
					<div className="rounded-xl border border-white/10 p-4 text-zinc-400">
						Fetching live exchange rate...
					</div>
				)}

				{error && (
					<div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
						{error}
					</div>
				)}

				{quote && (
					<div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-5">
						<Row
							label="You Withdraw"
							value={`$${quote.usd_amount.toFixed(2)}`}
						/>

						<Row label="Recipient Currency" value={quote.payout_currency} />

						<Row
							label="Exchange Rate"
							value={`1 USD = ${quote.exchange_rate.toLocaleString()} ${quote.payout_currency}`}
						/>

						<Row
							label="Estimated Payout"
							value={`${quote.payout_amount.toLocaleString()} ${quote.payout_currency}`}
						/>

						<Row
							label="Processing Fee"
							value={`${quote.fee.toLocaleString()} ${quote.payout_currency}`}
						/>

						<div className="border-t border-white/10 pt-4">
							<Row
								label="Recipient Receives"
								value={`${quote.total_received.toLocaleString()} ${quote.payout_currency}`}
								highlight
							/>
						</div>
					</div>
				)}

				<div className="flex justify-between pt-4">
					<button
						onClick={onBack}
						className="rounded-xl border border-white/10 px-6 py-3"
					>
						Back
					</button>

					<button
						disabled={!quote}
						onClick={continueStep}
						className="rounded-xl bg-white px-8 py-3 font-bold text-black disabled:opacity-40"
					>
						Continue
					</button>
				</div>
			</div>
		</section>
	);
}

function Row({
	label,
	value,
	highlight = false,
}: {
	label: string;
	value: string;
	highlight?: boolean;
}) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-zinc-500">{label}</span>

			<span
				className={highlight ? "font-black text-green-400" : "font-semibold"}
			>
				{value}
			</span>
		</div>
	);
}
