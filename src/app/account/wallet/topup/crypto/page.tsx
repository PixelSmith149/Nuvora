"use client";

import { useState } from "react";
import BackButton from "@/components/BackButton";

export default function CryptoPage() {
  const CRYPTO_ENABLED = false;

  const [usdAmount, setUsdAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<{
    checkoutUrl: string;
    reference: string;
  } | null>(null);

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usdAmount || Number(usdAmount) <= 0) return;

    setLoading(true);
    try {
      const response = await fetch("/api/wallet/topup/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usdAmount: Number(usdAmount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Invoice creation failed");
      }

      setInvoice({
        checkoutUrl: data.checkoutUrl,
        reference: data.reference,
      });
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to create crypto invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-orange-500/30">
      <BackButton />

      <section className="mx-auto max-w-xl px-6 pt-32 pb-20">
        <h1 className="text-3xl font-black uppercase text-center tracking-tight mb-8">
          ⚡ Web3 Deposit Terminal
        </h1>

        <h2 className="text-2xl font-bold text-center text-zinc-400 mb-8">
          Coming Soon...
        </h2>

        {/* Hidden until crypto is ready */}
        {CRYPTO_ENABLED && (
          <>
            {/* SCREEN 1: Amount entry */}
            {!invoice && (
              <form
                onSubmit={handleGenerateInvoice}
                className="bg-zinc-950 border border-white/10 p-6 rounded-2xl"
              >
                <div className="border-l-2 border-orange-500 bg-orange-500/5 p-4 rounded-r-xl mb-6">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-orange-500 block">
                    Security Network Parameters
                  </span>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    You will select the cryptocurrency and network on the secure
                    Heleket payment page. Only send the exact amount shown.
                  </p>
                </div>

                <div className="mb-6">
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
                      min="1"
                      required
                      value={usdAmount}
                      onChange={(e) => setUsdAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-black border border-white/10 rounded-xl py-3.5 pl-9 pr-4 font-bold focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !usdAmount || Number(usdAmount) <= 0}
                  className="w-full bg-white text-black font-black py-4 rounded-xl uppercase text-sm tracking-wide transition-all active:scale-[0.99] disabled:bg-zinc-800 disabled:text-zinc-600"
                >
                  {loading
                    ? "Constructing Secure Invoice..."
                    : "Generate Crypto Invoice ⚡"}
                </button>
              </form>
            )}

            {/* SCREEN 2: Redirect to Heleket payment page */}
            {invoice && (
              <div className="bg-zinc-950 border border-white/10 p-6 rounded-2xl text-center animate-in fade-in zoom-in-95 duration-200">
                <h3 className="font-black text-xl mb-2">
                  Invoice Ready
                </h3>

                <p className="text-sm text-zinc-400 mb-6">
                  You will be redirected to the secure Heleket payment page where
                  you can choose Bitcoin, USDT (TRC20 / ERC20 / etc.), Litecoin
                  and more.
                </p>

                <a
                  href={invoice.checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-orange-500 text-black font-black py-4 rounded-xl uppercase text-sm tracking-wide mb-4 hover:bg-orange-600 transition-colors shadow-xl shadow-orange-500/10"
                >
                  Open Payment Page & Pay 📱
                </a>

                <p className="text-[11px] text-zinc-500">
                  Reference:{" "}
                  <span className="text-zinc-400 font-mono">
                    {invoice.reference}
                  </span>
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}