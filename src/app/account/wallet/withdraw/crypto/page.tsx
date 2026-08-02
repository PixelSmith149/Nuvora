"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";

type CryptoAsset = {
  id: string;
  name: string;
  symbol: string;
  network: string;
  heleketCurrency: string;
  heleketNetwork?: string;
  coingeckoId: string;
  warning: string;
  decimals: number;
};

const ASSETS: CryptoAsset[] = [
  {
    id: "BTC",
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin Mainnet",
    heleketCurrency: "BTC",
    coingeckoId: "bitcoin",
    warning: "Only send BTC on the Bitcoin network. Wrong network = permanent loss.",
    decimals: 8,
  },
  {
    id: "USDT-TRC20",
    name: "Tether (TRC20)",
    symbol: "USDT",
    network: "TRON",
    heleketCurrency: "USDT",
    heleketNetwork: "TRON",
    coingeckoId: "tether",
    warning: "Send ONLY USDT via TRON (TRC20). Wrong network causes permanent loss.",
    decimals: 6,
  },
  {
    id: "USDT-ERC20",
    name: "Tether (ERC20)",
    symbol: "USDT",
    network: "Ethereum",
    heleketCurrency: "USDT",
    heleketNetwork: "ETH",
    coingeckoId: "tether",
    warning: "Send ONLY USDT via Ethereum (ERC20). High gas fees possible.",
    decimals: 6,
  },
  {
    id: "LTC",
    name: "Litecoin",
    symbol: "LTC",
    network: "Litecoin",
    heleketCurrency: "LTC",
    coingeckoId: "litecoin",
    warning: "Only send LTC on the Litecoin network.",
    decimals: 8,
  },
];

export default function CryptoWithdrawPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<CryptoAsset | null>(null);
  const [usdAmount, setUsdAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [address, setAddress] = useState("");
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Live rate
  useEffect(() => {
    if (!selected) {
      setRate(null);
      return;
    }

    const fetchRate = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${selected.coingeckoId}&vs_currencies=usd`,
        );
        const data = await res.json();
        const price = data[selected.coingeckoId]?.usd;
        if (price) setRate(price);
      } catch {
        // fallbacks
        if (selected.symbol === "BTC") setRate(102000);
        else if (selected.symbol === "USDT") setRate(1);
        else if (selected.symbol === "LTC") setRate(95);
      }
    };

    fetchRate();
    const id = setInterval(fetchRate, 30000);
    return () => clearInterval(id);
  }, [selected]);

  const handleUsdChange = useCallback(
    (val: string) => {
      setUsdAmount(val);
      if (!rate || !val || isNaN(Number(val))) {
        setCryptoAmount("");
        return;
      }
      setCryptoAmount((Number(val) / rate).toFixed(selected?.decimals ?? 6));
    },
    [rate, selected],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !usdAmount || !address || !cryptoAmount) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/withdraw/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usdAmount: Number(usdAmount),
          cryptoAmount: Number(cryptoAmount),
          asset: selected.id,
          currency: selected.heleketCurrency,
          network: selected.heleketNetwork || undefined,
          address: address.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Withdrawal failed");

      alert("Crypto withdrawal submitted successfully. Funds are being processed.");
      router.push("/account/wallet");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Withdrawal failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-orange-500/30">
      <BackButton />

      <section className="mx-auto max-w-xl px-6 pt-32 pb-20">
        <h1 className="text-3xl font-black uppercase text-center tracking-tight mb-8">
          ⚡ Crypto Withdrawal
        </h1>

        {/* Asset selection */}
        {!selected && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400 font-medium mb-2">
              Select asset & network:
            </p>
            {ASSETS.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelected(asset)}
                className="w-full bg-zinc-950 border border-white/10 p-5 rounded-2xl hover:border-white/30 text-left transition-all flex justify-between items-center"
              >
                <div>
                  <h3 className="font-black text-lg">
                    {asset.name} ({asset.symbol})
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">{asset.network}</p>
                </div>
                <span className="text-zinc-600">➔</span>
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        {selected && (
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-950 border border-white/10 p-6 rounded-2xl space-y-5"
          >
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setUsdAmount("");
                setCryptoAmount("");
                setAddress("");
              }}
              className="text-xs text-zinc-500 hover:text-white"
            >
              ← Change Asset
            </button>

            <div className="border-l-2 border-orange-500 bg-orange-500/5 p-4 rounded-r-xl">
              <span className="text-[10px] font-bold tracking-wider uppercase text-orange-500 block">
                Network Warning
              </span>
              <p className="text-xs text-zinc-400 mt-1">{selected.warning}</p>
            </div>

            {/* USD amount */}
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                Amount to withdraw (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-600">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  value={usdAmount}
                  onChange={(e) => handleUsdChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black border border-white/10 rounded-xl py-3.5 pl-9 pr-4 font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
              {rate && (
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  1 {selected.symbol} ≈ ${rate.toLocaleString()} · You receive ≈{" "}
                  <span className="text-white font-mono">{cryptoAmount || "0"}</span>{" "}
                  {selected.symbol}
                </p>
              )}
            </div>

            {/* Destination address */}
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                Destination {selected.symbol} Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={`Paste ${selected.symbol} address`}
                className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 font-mono text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={
                submitting ||
                !usdAmount ||
                !address ||
                !cryptoAmount ||
                Number(usdAmount) <= 0
              }
              className="w-full bg-orange-500 text-black font-black py-4 rounded-xl uppercase text-sm tracking-wide hover:bg-orange-600 transition-colors disabled:bg-zinc-800 disabled:text-zinc-600"
            >
              {submitting
                ? "Processing Withdrawal..."
                : `Withdraw ${cryptoAmount || "0"} ${selected.symbol}`}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}