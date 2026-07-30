"use client";

import { useEffect, useRef, useState } from "react";
import BackButton from "@/components/BackButton";
import supabase from "@/lib/supabase/client";
import { useUser } from "@/lib/useAuth";
import {
	GLOBAL_SUPPORTED_CURRENCIES,
	GlobalCurrency,
} from "@/lib/wallet/currency/constants"; 
export default function PaystackPage() {
	const { user } = useUser();
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const [amount, setAmount] = useState("");
	const [loading, setLoading] = useState(false);
	const [reference, setReference] = useState<string | null>(null);

	// 🎯 Default initialization tracking to local region or global USD
	const [selectedCurrency, setSelectedCurrency] = useState<string>("GHS");
	const [status, setStatus] = useState<
		"idle" | "processing" | "pending" | "success"
	>("idle");

	// Center selected item smoothly in the swipe track view
	const handleCurrencySelect = (currencyCode: string, index: number) => {
		setSelectedCurrency(currencyCode);
		if (scrollContainerRef.current) {
			const element = scrollContainerRef.current.children[index] as HTMLElement;
			if (element) {
				scrollContainerRef.current.scrollTo({
					left:
						element.offsetLeft -
						scrollContainerRef.current.offsetWidth / 2 +
						element.offsetWidth / 2,
					behavior: "smooth",
				});
			}
		}
	};

	async function handlePayment() {
		if (!user) {
			alert("Authentication required");
			return;
		}

		const value = Number(amount);
		if (!value || value <= 0) {
			alert("Enter a valid amount");
			return;
		}

		setLoading(true);
		setStatus("processing");

		try {
			const res = await fetch("/api/wallet/topup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: value,
					currency: selectedCurrency,
				}),
			});

			const data = await res.json();
			if (!res.ok || !data.authorization_url || !data.reference) {
				throw new Error(
					data.error || data.message || "Unable to initialize payment",
				);
			}

			setReference(data.reference);
			window.location.href = data.authorization_url;
		} catch (error: any) {
			alert(error.message || "Payment initialization failed");
			setStatus("idle");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (!reference) return;

		const channel = supabase
			.channel(`paystack-wallet-${reference}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "wallet_transactions",
					filter: `reference=eq.${reference}`,
				},
				(payload) => {
					const transaction = payload.new as { status?: string };
					if (transaction.status === "success") {
						setStatus("success");
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [reference]);

	return (
		<main className="min-h-screen bg-black text-white flex flex-col">
			<BackButton />

			<section className="flex-1 flex items-center justify-center px-4 sm:px-6">
				<div className="w-full max-w-md border border-white/10 rounded-3xl p-6 sm:p-8 text-center bg-zinc-950/60 backdrop-blur-xl mt-20 relative">
					<h1 className="text-2xl font-black tracking-tight">
						Global Funding Vault
					</h1>
					<p className="text-zinc-500 mt-1.5 text-xs sm:text-sm">
						Swipe to select currency. Values auto-convert to your primary
						**USD** ledger profile balance.
					</p>

					{status === "success" ? (
						<div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-2xl">
							Deposit confirmed successfully 🎉
						</div>
					) : (
						<>
							{/* 🎯 HORIZONTAL SWIPE CONTAINER: Complete Fluid Momentum Selection Bar */}
							<div className="relative mt-6 w-full group">
								{/* Visual fade masks indicating horizontal scroll limits to user */}
								<div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none z-10 opacity-60" />
								<div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none z-10 opacity-60" />

								<div
									ref={scrollContainerRef}
									className="flex flex-row gap-2 overflow-x-auto pb-3 pt-1 px-6 scrollbar-none snap-x snap-mandatory touch-pan-x"
									style={{
										scrollbarWidth: "none",
										WebkitOverflowScrolling: "touch",
									}}
								>
									{GLOBAL_SUPPORTED_CURRENCIES.map((cur, idx) => {
										const isSelected = selectedCurrency === cur.code;
										return (
											<button
												key={cur.code}
												type="button"
												onClick={() => handleCurrencySelect(cur.code, idx)}
												className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 snap-center select-none ${
													isSelected
														? "bg-white text-black border-white scale-105 shadow-xl"
														: "bg-white/[0.02] text-zinc-400 border-white/5 hover:border-white/20 hover:text-white"
												}`}
											>
												<span className="text-sm leading-none">{cur.flag}</span>
												<span className="font-mono">{cur.code}</span>
											</button>
										);
									})}
								</div>
							</div>

							{/* DYNAMIC VALUE CONTAINER TERMINAL */}
							<div className="relative mt-6 w-full">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-black text-base font-mono">
									{selectedCurrency}
								</span>
								<input
									type="number"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder="0.00"
									className="w-full pl-20 pr-4 py-4 rounded-xl bg-black border border-white/10 text-left text-lg outline-none font-mono text-white focus:border-white/30 transition-all"
								/>
							</div>

							<button
								onClick={handlePayment}
								disabled={loading || status === "processing"}
								className="mt-6 w-full bg-white text-black py-4 rounded-xl font-black transition-all hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-40 tracking-wider text-sm shadow-xl"
							>
								{loading ? "Initializing Gateways..." : "Top Up Wallet"}
							</button>
						</>
					)}

					<p className="text-zinc-600 text-[10px] mt-4 font-mono">
						Automated Cross-Border Routing Layer Active
					</p>
				</div>
			</section>
		</main>
	);
}
