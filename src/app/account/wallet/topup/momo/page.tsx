"use client";

import { useEffect, useRef, useState } from "react";
import BackButton from "@/components/BackButton";
import supabase from "@/lib/supabase/client";
import { useUser } from "@/lib/useAuth";

type MoMoNetwork = { label: string; value: string };
type MoMoCountry = {
	code: string;
	currency: string;
	flag: string;
	name: string;
	networks: MoMoNetwork[];
};

const MOMO_COUNTRIES: MoMoCountry[] = [
	{
		code: "GH",
		currency: "GHS",
		flag: "🇬🇭",
		name: "Ghana",
		networks: [
			{ label: "MTN", value: "mtn" },
			{ label: "Telecel", value: "telecel" },
			{ label: "AT Money", value: "at" },
		],
	},
	{
		code: "KE",
		currency: "KES",
		flag: "🇰🇪",
		name: "Kenya",
		networks: [{ label: "Safaricom M-Pesa", value: "mpesa" }],
	},
	{
		code: "CI",
		currency: "XOF",
		flag: "🇨🇮",
		name: "Côte d'Ivoire",
		networks: [
			{ label: "MTN MoMo", value: "mtn" },
			{ label: "Orange Money", value: "orange" },
			{ label: "Moov Money", value: "moov" },
		],
	},
	{
		code: "CM",
		currency: "XAF",
		flag: "🇨🇲",
		name: "Cameroon",
		networks: [
			{ label: "MTN MoMo", value: "mtn" },
			{ label: "Orange Money", value: "orange" },
		],
	},
];

export default function MomoPage() {
	const { user } = useUser();
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const [amount, setAmount] = useState("");
	const [activeCountryIdx, setActiveCountryIdx] = useState(0);
	const [network, setNetwork] = useState(MOMO_COUNTRIES[0].networks[0].value);
	const [phone, setPhone] = useState("");

	const [loading, setLoading] = useState(false);
	const [activeReference, setActiveReference] = useState<string | null>(null);
	const [status, setStatus] = useState<
		"idle" | "awaiting_input" | "processing" | "prompt_sent" | "confirmed"
	>("idle");

	const currentCountry = MOMO_COUNTRIES[activeCountryIdx];

	useEffect(() => {
		if (user) setStatus("awaiting_input");
	}, [user]);

	// Sync network choice whenever country changes
	useEffect(() => {
		setNetwork(MOMO_COUNTRIES[activeCountryIdx].networks[0].value);
	}, [activeCountryIdx]);

	const handleCountrySelect = (index: number) => {
		setActiveCountryIdx(index);
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

	async function generateMomoInvoice() {
		if (!user) {
			alert("Authentication required");
			return;
		}
		if (!amount || !phone) {
			alert("Please complete all payment details.");
			return;
		}

		setLoading(true);
		setStatus("processing");

		try {
			// 🎯 FIXED URL PATH TO THE CORRECT API FOLDER
			const res = await fetch("/api/wallet/topup/momo", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: Number(amount),
					phone,
					network, // Paystack direct network token
					currency: currentCountry.currency,
				}),
			});

			const data = await res.json();
			if (!res.ok || !data.reference) {
				throw new Error(data.message || "Unable to initialize MoMo payment");
			}

			setActiveReference(data.reference);
			setStatus("prompt_sent");
		} catch (error: any) {
			alert(error.message || "Failed to start mobile money payment.");
			setStatus("awaiting_input");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (status !== "prompt_sent" || !activeReference) return;

		const channel = supabase
			.channel(`wallet-momo-${activeReference}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "wallet_transactions",
					filter: `reference=eq.${activeReference}`,
				},
				(payload) => {
					const transaction = payload.new as { status?: string };
					if (transaction.status === "success") {
						setStatus("confirmed");
						setActiveReference(null);
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [status, activeReference]);

	return (
		<main className="min-h-screen bg-black text-white flex flex-col">
			<BackButton />

			<section className="flex-1 mx-auto w-full max-w-xl px-6 pt-36 pb-20 flex flex-col justify-center">
				<div className="text-center mb-6">
					<h1 className="text-4xl font-black tracking-tight">Network Topup</h1>
					<p className="text-sm text-white/50 mt-2">
						Direct mobile network payment ecosystem powered by Paystack.
					</p>
				</div>

				{status !== "awaiting_input" && status !== "idle" && (
					<div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/5 text-sm transition-all">
						{status === "processing" &&
							"⏳ Requesting digital voucher signature..."}
						{status === "prompt_sent" && (
							<div className="space-y-2">
								<p className="text-yellow-400 animate-pulse">
									📲 Network push terminal notification sent.
								</p>
								<p className="text-xs text-white/40">
									Approve the payment prompt directly on your mobile device
									screen. Your global wallet converts this to USD upon
									confirmation.
								</p>
							</div>
						)}
						{status === "confirmed" &&
							"✅ Network ledger validation successful. USD credited."}
					</div>
				)}

				{status === "confirmed" ? (
					<button
						onClick={() => {
							setAmount("");
							setPhone("");
							setStatus("awaiting_input");
						}}
						className="w-full py-4 rounded-xl bg-white text-black font-bold tracking-wide"
					>
						Create New Deposit
					</button>
				) : (
					<div className="space-y-4">
						{/* 🎯 HORIZONTAL CAROUSEL SWIPER FOR GLOBAL REGIONS */}
						<div className="relative w-full">
							<div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black to-transparent pointer-events-none z-10 opacity-50" />
							<div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black to-transparent pointer-events-none z-10 opacity-50" />

							<div
								ref={scrollContainerRef}
								className="flex flex-row gap-2 overflow-x-auto pb-2 px-4 scrollbar-none snap-x touch-pan-x"
								style={{ scrollbarWidth: "none" }}
							>
								{MOMO_COUNTRIES.map((country, idx) => (
									<button
										key={country.code}
										type="button"
										onClick={() => handleCountrySelect(idx)}
										className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 snap-center ${
											activeCountryIdx === idx
												? "bg-white text-black border-white scale-105"
												: "bg-white/[0.02] text-zinc-400 border-white/5 hover:border-white/20"
										}`}
									>
										<span>{country.flag}</span>
										<span className="font-mono">{country.currency}</span>
									</button>
								))}
							</div>
						</div>

						{/* Input Forms Layer */}
						<div className="flex gap-2">
							<div className="relative flex-1">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">
									{currentCountry.currency}
								</span>
								<input
									type="number"
									disabled={status === "prompt_sent"}
									placeholder="0.00"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl outline-none font-mono text-base"
								/>
							</div>

							<select
								disabled={status === "prompt_sent"}
								value={network}
								onChange={(e) => setNetwork(e.target.value)}
								className="w-36 bg-black border border-white/10 rounded-xl p-4 text-sm font-bold focus:border-white/30 outline-none cursor-pointer"
							>
								{currentCountry.networks.map((net) => (
									<option key={net.value} value={net.value}>
										{net.label}
									</option>
								))}
							</select>
						</div>

						<input
							type="tel"
							disabled={status === "prompt_sent"}
							placeholder="e.g., +233 / +254 / +225 number"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none text-base font-mono"
						/>

						<button
							onClick={generateMomoInvoice}
							disabled={loading || status === "prompt_sent"}
							className="w-full py-4 rounded-xl font-black transition bg-white text-black disabled:opacity-40 tracking-wider text-sm shadow-xl"
						>
							{loading
								? "Constructing Channel..."
								: "Authorize Network Deposit"}
						</button>
					</div>
				)}
			</section>
		</main>
	);
}
