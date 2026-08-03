"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import { useUser } from "@/lib/useAuth";

type MoMoNetwork = { label: string; value: string };

type MoMoCountry = {
  code: string;
  currency: string;
  flag: string;
  name: string;
  networks: MoMoNetwork[];
};

type UiStatus =
  | "idle"
  | "awaiting_input"
  | "processing"
  | "requires_otp"
  | "prompt_sent"
  | "confirmed"
  | "failed";

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

const MAX_POLL_ATTEMPTS = 40;
const POLL_MS = 3000;

export default function MomoPage() {
  const router = useRouter();
  const { user } = useUser();

  const [amount, setAmount] = useState("");
  const [activeCountryIdx, setActiveCountryIdx] = useState(0);
  const [network, setNetwork] = useState(MOMO_COUNTRIES[0].networks[0].value);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeReference, setActiveReference] = useState<string | null>(null);
  const [status, setStatus] = useState<UiStatus>("idle");
  const [hint, setHint] = useState<string | null>(null);

  const pollAttemptsRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  const currentCountry = MOMO_COUNTRIES[activeCountryIdx];

  useEffect(() => {
    if (user) setStatus("awaiting_input");
  }, [user]);

  useEffect(() => {
    setNetwork(MOMO_COUNTRIES[activeCountryIdx].networks[0].value);
  }, [activeCountryIdx]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  const clearPoll = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const goToCallback = (reference: string) => {
    router.replace(
      `/account/wallet/paystack/callback?reference=${encodeURIComponent(reference)}`,
    );
  };

  async function pollPayment(reference: string) {
    if (cancelledRef.current) return;

    try {
      const res = await fetch("/api/wallet/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json().catch(() => ({}));

      if (cancelledRef.current) return;

      const next = String(data.status || "").toLowerCase();

      if (next === "success" || next === "completed") {
        clearPoll();
        setStatus("confirmed");
        setHint("Payment confirmed. Redirecting…");
        setTimeout(() => goToCallback(reference), 800);
        return;
      }

      if (next === "failed" || next === "abandoned" || next === "reversed") {
        clearPoll();
        setStatus("failed");
        setHint(data.message || data.error || "Payment failed or was cancelled.");
        setActiveReference(null);
        return;
      }

      // pending / ongoing / processing / unknown → keep polling
      pollAttemptsRef.current += 1;

      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        clearPoll();
        setHint(
          "Still processing. If you approved the prompt, open the wallet in a moment or use the callback link.",
        );
        // Send user to callback page so it can keep verifying
        goToCallback(reference);
        return;
      }

      setStatus("prompt_sent");
      setHint("Waiting for Mobile Money approval…");
      pollTimerRef.current = setTimeout(() => pollPayment(reference), POLL_MS);
    } catch {
      if (cancelledRef.current) return;

      pollAttemptsRef.current += 1;
      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        clearPoll();
        setHint("Network issue while checking payment. Opening confirmation page…");
        goToCallback(reference);
        return;
      }

      pollTimerRef.current = setTimeout(() => pollPayment(reference), POLL_MS);
    }
  }

  function startPolling(reference: string) {
    clearPoll();
    cancelledRef.current = false;
    pollAttemptsRef.current = 0;
    setActiveReference(reference);
    setStatus("prompt_sent");
    setHint("Check your phone and approve the MoMo prompt.");
    void pollPayment(reference);
  }

  async function generateMomoInvoice() {
    if (!user) {
      alert("Authentication required.");
      return;
    }
    if (!amount || Number(amount) <= 0 || !phone.trim()) {
      alert("Please enter a valid amount and phone number.");
      return;
    }

    clearPoll();
    setLoading(true);
    setStatus("processing");
    setHint(null);
    setOtp("");

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

      // Do NOT insert wallet_transactions from the client.
      // Server route must create the pending row.

      if (data.status === "send_otp") {
        setActiveReference(data.reference);
        setStatus("requires_otp");
        setHint(data.displayText || "Enter the OTP sent to your phone.");
      } else {
        // pay_offline | pending | success | etc.
        if (String(data.status).toLowerCase() === "success") {
          setStatus("confirmed");
          setActiveReference(data.reference);
          setTimeout(() => goToCallback(data.reference), 800);
        } else {
          startPolling(data.reference);
        }
      }
    } catch (error: any) {
      setStatus("failed");
      setHint(error?.message || "Failed to process Mobile Money top-up.");
      alert(error?.message || "Failed to process Mobile Money top-up.");
    } finally {
      setLoading(false);
    }
  }

  async function submitOtpCode() {
    if (!otp.trim() || !activeReference) {
      alert("Please enter the verification code sent to your phone.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/wallet/topup/momo/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: otp.trim(),
          reference: activeReference,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "OTP verification failed.");
      }

      // After OTP, Paystack sends USSD / prompt — start polling
      startPolling(activeReference);
    } catch (error: any) {
      alert(error?.message || "Error submitting OTP.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    clearPoll();
    setAmount("");
    setPhone("");
    setOtp("");
    setActiveReference(null);
    setHint(null);
    setStatus("awaiting_input");
    pollAttemptsRef.current = 0;
  }

  const formLocked =
    loading || status === "prompt_sent" || status === "processing";

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

        {hint && status !== "confirmed" && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs text-zinc-300">
            {hint}
          </div>
        )}

        {/* OTP step */}
        {status === "requires_otp" && (
          <div className="mb-6 space-y-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6">
            <h3 className="text-sm font-bold text-yellow-400">
              SMS Authorization Code Required
            </h3>
            <p className="text-xs text-white/70">
              Paystack sent a verification code via SMS to{" "}
              <span className="font-mono">{phone}</span>. Enter it below to
              authorize the charge.
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter SMS OTP Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-black p-4 text-center font-mono text-lg tracking-widest outline-none focus:border-yellow-400"
            />
            <button
              type="button"
              onClick={submitOtpCode}
              disabled={loading}
              className="w-full rounded-xl bg-yellow-400 py-3.5 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Confirm & Trigger Prompt"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="w-full py-2 text-xs text-zinc-500 hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Waiting for phone approval */}
        {status === "prompt_sent" && (
          <div className="mb-6 space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
            <p className="animate-pulse text-sm font-bold text-emerald-400">
              📲 Approve on your phone
            </p>
            <p className="text-xs text-white/60">
              Enter your Mobile Money PIN on the device prompt. We&apos;re
              checking payment status automatically.
            </p>
            {activeReference && (
              <p className="break-all font-mono text-[10px] text-zinc-500">
                Ref: {activeReference}
              </p>
            )}
            <button
              type="button"
              onClick={() =>
                activeReference && goToCallback(activeReference)
              }
              className="text-xs text-zinc-400 underline hover:text-white"
            >
              Open confirmation page
            </button>
          </div>
        )}

        {/* Confirmed */}
        {status === "confirmed" ? (
          <div className="space-y-4 text-center">
            <p className="text-sm font-bold text-emerald-400">
              Deposit confirmed
            </p>
            <button
              type="button"
              onClick={() =>
                activeReference
                  ? goToCallback(activeReference)
                  : router.push("/account/wallet")
              }
              className="w-full rounded-xl bg-white py-4 font-bold tracking-wide text-black transition hover:bg-white/90"
            >
              Continue to wallet
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="w-full py-2 text-xs text-zinc-500 hover:text-white"
            >
              New deposit
            </button>
          </div>
        ) : (
          status !== "requires_otp" &&
          status !== "prompt_sent" && (
            <div className="space-y-4">
              {/* Country / currency */}
              <div className="relative w-full">
                <div
                  className="flex flex-row gap-2 overflow-x-auto px-1 pb-2 snap-x touch-pan-x"
                  style={{ scrollbarWidth: "none" }}
                >
                  {MOMO_COUNTRIES.map((country, idx) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => setActiveCountryIdx(idx)}
                      disabled={formLocked}
                      className={`flex shrink-0 snap-center items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
                        activeCountryIdx === idx
                          ? "scale-105 border-white bg-white text-black"
                          : "border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/20"
                      } disabled:opacity-40`}
                    >
                      <span>{country.flag}</span>
                      <span className="font-mono">{country.currency}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount + network */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-500">
                    {currentCountry.currency}
                  </span>
                  <input
                    type="number"
                    disabled={formLocked}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-14 pr-4 font-mono text-base outline-none transition focus:border-white/30 disabled:opacity-40"
                  />
                </div>
                <select
                  disabled={formLocked}
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-40 cursor-pointer rounded-xl border border-white/10 bg-black p-4 text-xs font-bold outline-none focus:border-white/30 disabled:opacity-40"
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
                disabled={formLocked}
                placeholder="Wallet number (e.g. 024XXXXXXX)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-base outline-none transition focus:border-white/30 disabled:opacity-40"
              />

              {status === "failed" && (
                <p className="text-center text-xs text-red-400">
                  {hint || "Something went wrong. Try again."}
                </p>
              )}

              <button
                type="button"
                onClick={generateMomoInvoice}
                disabled={formLocked || !user}
                className="w-full rounded-xl bg-white py-4 text-sm font-black tracking-wider text-black shadow-xl transition hover:bg-white/90 disabled:opacity-40"
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