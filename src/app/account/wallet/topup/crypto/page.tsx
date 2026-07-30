"use client";

import { useCallback, useEffect, useState } from "react";
import BackButton from "@/components/BackButton";
import supabase from "@/lib/supabase/client";

interface CryptoAsset {
	id: string;
	name: string;
	symbol: string;
	network: string;
	warning: string;
	iconColor: string;
	coingeckoId: string;
	trustWalletCoinId: number; // Trust Wallet coin register protocol values
}

const SUPPORTED_ASSETS: CryptoAsset[] = [
	{
		id: "BTC-OnChain",
		name: "Bitcoin",
		symbol: "BTC",
		network: "Bitcoin Mainnet",
		warning: "Requires on-chain validation confirmation.",
		iconColor: "text-orange-500",
		coingeckoId: "bitcoin",
		trustWalletCoinId: 0,
	},
	{
		id: "BTC-LightningNetwork",
		name: "Bitcoin Lightning",
		symbol: "BTC",
		network: "Lightning Network",
		warning: "Instant, low-fee settlement layer.",
		iconColor: "text-yellow-400",
		coingeckoId: "bitcoin",
		trustWalletCoinId: 0,
	},
	{
		id: "USDT-TRC20",
		name: "Tether (TRC20)",
		symbol: "USDT",
		network: "TRON Network",
		warning: "Send ONLY USDT via TRON. Wrong network causes asset loss.",
		iconColor: "text-emerald-500",
		coingeckoId: "tether",
		trustWalletCoinId: 195,
	},
	{
		id: "LTC-OnChain",
		name: "Litecoin",
		symbol: "LTC",
		network: "Litecoin Network",
		warning: "Fast block processing execution.",
		iconColor: "text-blue-400",
		coingeckoId: "litecoin",
		trustWalletCoinId: 2,
	},
];

export default function CryptoPage() {
	const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
	const [usdAmount, setUsdAmount] = useState<string>("");
	const [cryptoAmount, setCryptoAmount] = useState<string>("");
	const [assetRate, setAssetRate] = useState<number | null>(null);
	const [selectedWallet, setSelectedWallet] = useState<string>("trust"); // Set Trust Wallet as default preference
	const [loading, setLoading] = useState<boolean>(false);
	const [invoice, setInvoice] = useState<{
		pr: string;
		address?: string;
		btcPayUrl?: string;
	} | null>(null);

	useEffect(() => {
		if (!selectedAsset) {
			setAssetRate(null);
			return;
		}

		const fetchLiveExchangeRate = async () => {
			try {
				const res = await fetch(
					`https://api.coingecko.com/api/v3/simple/price?ids=${selectedAsset.coingeckoId}&vs_currencies=usd`,
				);
				const priceData = await res.json();
				const currentPrice = priceData[selectedAsset.coingeckoId]?.usd;
				if (currentPrice) {
					setAssetRate(currentPrice);
				}
			} catch (err) {
				console.error(
					"Failed fetching conversion rates, fallback to estimate pricing:",
					err,
				);
				// Decentralized safety protection fallbacks if standard API limit hits
				if (selectedAsset.symbol === "BTC") setAssetRate(102000);
				if (selectedAsset.symbol === "USDT") setAssetRate(1.0);
				if (selectedAsset.symbol === "LTC") setAssetRate(95);
			}
		};

		fetchLiveExchangeRate();
		const interval = setInterval(fetchLiveExchangeRate, 30000); // Dynamic update loop every 30 seconds
		return () => clearInterval(interval);
	}, [selectedAsset]);

	// Recalculates input parameters automatically based on shifting asset value scales
	const handleAmountChange = useCallback(
		(value: string, unitType: "USD" | "CRYPTO") => {
			if (!assetRate) return;

			if (unitType === "USD") {
				setUsdAmount(value);
				if (!value || isNaN(Number(value))) {
					setCryptoAmount("");
				} else {
					setCryptoAmount(
						(Number(value) / assetRate).toFixed(
							selectedAsset?.symbol === "USDT" ? 2 : 6,
						),
					);
				}
			} else {
				setCryptoAmount(value);
				if (!value || isNaN(Number(value))) {
					setUsdAmount("");
				} else {
					setUsdAmount((Number(value) * assetRate).toFixed(2));
				}
			}
		},
		[assetRate, selectedAsset],
	);

	const handleGenerateInvoice = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedAsset || !cryptoAmount) return;

		setLoading(true);
		try {
			const response = await fetch("/api/wallet/topup/crypto", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					asset: selectedAsset.id,
					cryptoAmount: Number(cryptoAmount),
					usdAmount: Number(usdAmount),
				}),
			});

			const data = await response.json();
			if (!response.ok)
				throw new Error(data.message || "Invoice processing fault.");

			setInvoice({
				pr: data.paymentString,
				address: data.address,
				btcPayUrl: data.checkoutUrl,
			});
		} catch (err) {
			console.error(err);
			alert(
				"Asset connection failure. Check store token settings inside BTCPay Server Greenfield panel.",
			);
		} finally {
			setLoading(false);
		}
	};

	const triggerWalletDeepLink = () => {
		if (!invoice || !selectedAsset) return;

		let targetUri = invoice.pr;

		if (selectedWallet === "trust") {
			if (selectedAsset.id === "BTC-LightningNetwork") {
				// Handoff lightning payload directly into Trust app scanner parser lines
				targetUri = `trust://on-ramp?provider=btcpay&url=${encodeURIComponent(invoice.pr)}`;
			} else {
				// Native core multi-coin structure handling for Trust Wallet App layout deep signatures
				targetUri = `trust://payment?coin=${selectedAsset.trustWalletCoinId}&address=${invoice.address}&amount=${cryptoAmount}`;
			}
		} else if (selectedAsset.id === "BTC-LightningNetwork") {
			targetUri = `lightning:${invoice.pr}`;
		}

		window.location.href = targetUri;
	};

	return (
		<main className="min-h-screen bg-black text-white selection:bg-orange-500/30">
			<BackButton />

			<section className="mx-auto max-w-xl px-6 pt-32 pb-20">
				<h1 className="text-3xl font-black uppercase text-center tracking-tight mb-8">
					⚡ Web3 Deposit Terminal
				</h1>

				{/* SCREEN 1: LIST SELECTION MATRIX */}
				{!selectedAsset && (
					<div className="space-y-4">
						<p className="text-sm text-zinc-400 font-medium mb-2">
							Select your available deposit rail:
						</p>
						{SUPPORTED_ASSETS.map((asset) => (
							<button
								key={asset.id}
							//	onClick={() => setSelectedAsset(asset)}//
								className="w-full bg-zinc-950 border border-white/10 p-5 rounded-2xl hover:border-white/30 text-left transition-all duration-200 flex justify-between items-center group"
							>
								<div>
									<h3 className="font-black text-lg flex items-center gap-2">
										<span className={asset.iconColor}>●</span> {asset.name} (
										{asset.symbol})
									</h3>
									<p className="text-xs text-zinc-500 mt-1">{asset.network}</p>
								</div>
								<span className="text-zinc-600 group-hover:text-white transition-colors">
									➔
								</span>
							</button>
						))}
					</div>
				)}

				{/* SCREEN 2: CONVERSION ACCOUNT VALUE PROMPTS */}
				{selectedAsset && !invoice && (
					<form
						onSubmit={handleGenerateInvoice}
						className="bg-zinc-950 border border-white/10 p-6 rounded-2xl animate-in fade-in zoom-in-95 duration-200"
					>
						<button
							type="button"
							onClick={() => {
								setSelectedAsset(null);
								setUsdAmount("");
								setCryptoAmount("");
							}}
							className="text-xs text-zinc-500 hover:text-white mb-4"
						>
							← Change Asset
						</button>

						<div className="border-l-2 border-orange-500 bg-orange-500/5 p-4 rounded-r-xl mb-6">
							<span className="text-[10px] font-bold tracking-wider uppercase text-orange-500 block">
								Security Network Parameters
							</span>
							<p className="text-xs text-zinc-400 mt-1 leading-relaxed">
								{selectedAsset.warning}
							</p>
						</div>

						{/* LIVE CONVERTER INPUT SYSTEM */}
						<div className="space-y-4 mb-6">
							<div>
								<div className="flex justify-between items-center mb-2">
									<label className="text-xs font-bold uppercase text-zinc-500">
										Deposit In {selectedAsset.symbol}
									</label>
									<span className="text-[10px] text-zinc-500 font-medium">
										1 {selectedAsset.symbol} ≈{" "}
										{assetRate
											? `$${assetRate.toLocaleString()}`
											: "Fetching global index..."}
									</span>
								</div>
								<input
									type="number"
									step="any"
									required
									value={cryptoAmount}
									onChange={(e) => handleAmountChange(e.target.value, "CRYPTO")}
									placeholder={`0.000000 ${selectedAsset.symbol}`}
									className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 font-bold focus:outline-none focus:border-orange-500 transition-colors"
								/>
							</div>

							<div className="flex items-center justify-center text-zinc-600 font-bold text-sm">
								↕ EQUIVALENT TO ↕
							</div>

							<div>
								<label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
									Ledger Credit Value (USD)
								</label>
								<div className="relative">
									<span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-600">
										$
									</span>
									<input
										type="number"
										step="any"
										required
										value={usdAmount}
										onChange={(e) => handleAmountChange(e.target.value, "USD")}
										placeholder="0.00"
										className="w-full bg-black border border-white/10 rounded-xl py-3.5 pl-9 pr-4 font-bold focus:outline-none focus:border-orange-500 transition-colors"
									/>
								</div>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading || !cryptoAmount || !usdAmount}
							className="w-full bg-white text-black font-black py-4 rounded-xl uppercase text-sm tracking-wide transition-all active:scale-[0.99] disabled:bg-zinc-800 disabled:text-zinc-600"
						>
							{loading
								? "Constructing Secure Invoice..."
								: `Generate ${selectedAsset.symbol} Invoice ⚡`}
						</button>
					</form>
				)}

				{/* SCREEN 3: WALLET DISPATCH LAUNCH CHANNELS */}
				{invoice && selectedAsset && (
					<div className="bg-zinc-950 border border-white/10 p-6 rounded-2xl text-center animate-in fade-in zoom-in-95 duration-200">
						<h3 className="font-black text-xl mb-2">Invoice Fully Built</h3>
						<p className="text-sm text-zinc-400 mb-6">
							Choose your confirmation gateway vendor application:
						</p>

						<div className="grid grid-cols-2 gap-4 mb-6">
							<button
								type="button"
								onClick={() => setSelectedWallet("trust")}
								className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition-colors ${selectedWallet === "trust" ? "border-blue-500 bg-blue-500/10 text-white" : "border-white/10 bg-black text-zinc-500 hover:border-white/20"}`}
							>
								🛡️ Trust Wallet
							</button>
							<button
								type="button"
								onClick={() => setSelectedWallet("default")}
								className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition-colors ${selectedWallet === "default" ? "border-orange-500 bg-orange-500/10 text-white" : "border-white/10 bg-black text-zinc-500 hover:border-white/20"}`}
							>
								🔌 Native Device App
							</button>
						</div>

						<button
							onClick={triggerWalletDeepLink}
							className="w-full bg-orange-500 text-black font-black py-4 rounded-xl uppercase text-sm tracking-wide mb-4 hover:bg-orange-600 transition-colors shadow-xl shadow-orange-500/10"
						>
							Launch App & Confirm Invoice 📱
						</button>

						<p className="text-[11px] text-zinc-500">
							Fallback Manual Link:{" "}
							<a
								href={invoice.btcPayUrl}
								target="_blank"
								rel="noreferrer"
								className="text-zinc-400 underline ml-1"
							>
								Open Alternative BTCPay Interface
							</a>
						</p>
					</div>
				)}
			</section>
		</main>
	);
}
