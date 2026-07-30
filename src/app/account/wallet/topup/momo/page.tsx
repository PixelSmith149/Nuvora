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
      { label: "MTN MoMo", value: "mtn" },
      { label: "Telecel Cash", value: "telecel" },
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
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [activeReference, setActiveReference] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "awaiting_input" | "processing" | "requires_otp" | "prompt_sent" | "confirmed"
  >("idle");

  const currentCountry = MOMO_COUNTRIES[activeCountryIdx];

  useEffect(() => {
    if (user) setStatus("awaiting_input");
  }, [user]);

  useEffect(() => {
    setNetwork(MOMO_COUNTRIES[activeCountryIdx].networks[0].value);
  }, [activeCountryIdx]);

  const handleCountrySelect = (index: number) => {
    setActiveCountryIdx(index);
    if (scrollContainerRef.current) {
      const element = scrollContainerRef.current.children[index] as HTMLElement;
      if (element) {
        scrollContainerRef.current.scrollTo({
          left: element.offsetLeft - scrollContainerRef.current.offsetWidth / 2 + element.offsetWidth / 2,
          behavior: "smooth",
        });
      }
    }
  };

  async function generateMomoInvoice() {
    if (!user) return alert("Authentication required.");
    if (!amount || Number(amount) <= 0 || !phone.trim()) {
      return alert("Please enter a valid amount and phone number.");
    }

    setLoading(true);
    setStatus("processing");

    try {
      const res = await fetch("/api/wallet/topup/momo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          phone: phone.trim(),
          network,
          currency: currentCountry.currency,
          email: user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.reference) {
        throw new Error(data.error || "Charge initialization failed.");
      }

      await supabase.from("wallet_transactions").insert([
        {
          user_id: user.id,
          amount: Number(amount),
          currency: currentCountry.currency,
          reference: data.reference,
          type: "deposit",
          status: "pending",
          network,
          phone_number: phone.trim(),
        },
      ]);

      setActiveReference(data.reference);

      if (data.status === "send_otp") {
        setStatus("requires_otp");
      } else {
        setStatus("prompt_sent");
      }
    } catch (error: any) {
      alert(error.message || "Failed to process Mobile Money top-up.");
      setStatus("awaiting_input");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtpCode() {
    if (!otp.trim() || !activeReference) {
      return alert("Please enter the verification code sent to your phone.");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wallet/topup/momo/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otp.trim(), reference: activeReference }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "OTP verification failed.");
      }

      setStatus("prompt_sent");
    } catch (error: any) {
      alert(error.message || "Error submitting OTP.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status !== "prompt_sent" || !activeReference) return;

    const channel = supabase
      .channel(`momo-wallet-${activeReference}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wallet_transactions",
          filter: `reference=eq.${activeReference}`,
        },
        (payload) => {
          const updatedTx = payload.new as { status?: string };
          if (updatedTx?.status === "success") {
            setStatus("confirmed");
            setActiveReference(null);
          }
        }
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
            Direct mobile money payment gateway powered by Paystack.
          </p>
        </div>

        {status === "requires_otp" && (
          <div className="mb-6 p-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 space-y-4">
            <h3 className="font-bold text-yellow-400 text-sm">SMS Authorization Code Required</h3>
            <p className="text-xs text-white/70">
              Paystack sent a verification code via SMS to <span className="font-mono">{phone}</span>. Please enter it below to authorize the direct charge.
            </p>
            <input
              type="text"
              placeholder="Enter SMS OTP Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-4 bg-black border border-white/20 rounded-xl outline-none font-mono text-center text-lg tracking-widest focus:border-yellow-400"
            />
            <button
              type="button"
              onClick={submitOtpCode}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-yellow-400 text-black font-bold text-sm hover:bg-yellow-300 transition"
            >
              {loading ? "Verifying..." : "Confirm & Trigger Prompt"}
            </button>
          </div>
        )}

        {status === "prompt_sent" && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-2">
            <p className="text-emerald-400 font-bold animate-pulse text-sm">
              📲 USSD PIN Prompt Sent!
            </p>
            <p className="text-xs text-white/60">
              Check your mobile device screen and enter your Mobile Money PIN to complete authorization.
            </p>
          </div>
        )}

        {status === "confirmed" ? (
          <button
            type="button"
            onClick={() => {
              setAmount("");
              setPhone("");
              setOtp("");
              setStatus("awaiting_input");
            }}
            className="w-full py-4 rounded-xl bg-white text-black font-bold tracking-wide hover:bg-white/90 transition"
          >
            Create New Deposit
          </button>
        ) : (
          status !== "requires_otp" && (
            <div className="space-y-4">
              <div className="relative w-full">
                <div className="flex flex-row gap-2 overflow-x-auto pb-2 px-4 scrollbar-none snap-x touch-pan-x" style={{ scrollbarWidth: "none" }}>
                  {MOMO_COUNTRIES.map((country, idx) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(idx)}
                      disabled={loading || status === "prompt_sent"}
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

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">
                    {currentCountry.currency}
                  </span>
                  <input
                    type="number"
                    disabled={loading || status === "prompt_sent"}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl outline-none font-mono text-base focus:border-white/30 transition disabled:opacity-40"
                  />
                </div>

                <select
                  disabled={loading || status === "prompt_sent"}
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-40 bg-black border border-white/10 rounded-xl p-4 text-xs font-bold focus:border-white/30 outline-none cursor-pointer disabled:opacity-40"
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
                disabled={loading || status === "prompt_sent"}
                placeholder="Wallet number (e.g., 024XXXXXXX)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none text-base font-mono focus:border-white/30 transition disabled:opacity-40"
              />

              <button
                type="button"
                onClick={generateMomoInvoice}
                disabled={loading || status === "prompt_sent"}
                className="w-full py-4 rounded-xl font-black transition bg-white text-black disabled:opacity-40 tracking-wider text-sm shadow-xl hover:bg-white/90"
              >
                {loading ? "Processing..." : "Authorize Network Deposit"}
              </button>
            </div>
          )
        )}
      </section>
    </main>
  );
}