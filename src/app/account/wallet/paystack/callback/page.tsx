"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

type Status = "checking" | "success" | "pending" | "failed";

const MAX_ATTEMPTS = 20;
const POLL_MS = 2500;

function PaystackCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref") ||
    "";

  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("Confirming your payment…");
  const [amount, setAmount] = useState<string | null>(null);

  const attemptsRef = useRef(0);
  const cancelledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const verify = useCallback(async () => {
    if (cancelledRef.current) return;

    if (!reference) {
      setStatus("failed");
      setMessage("Missing payment reference.");
      return;
    }

    try {
      const res = await fetch("/api/wallet/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json().catch(() => ({}));

      if (cancelledRef.current) return;

      if (!res.ok) {
        // Retryable server errors while webhook may still run
        if (res.status >= 500 && attemptsRef.current < MAX_ATTEMPTS - 1) {
          attemptsRef.current += 1;
          setStatus("pending");
          setMessage("Still confirming with the payment provider…");
          timerRef.current = setTimeout(verify, POLL_MS);
          return;
        }

        setStatus("failed");
        setMessage(
          data.error || data.message || "Could not verify payment.",
        );
        return;
      }

      const next = String(data.status || "").toLowerCase();

      if (next === "success" || next === "completed") {
        setStatus("success");
        setMessage("Deposit confirmed. Your wallet has been updated.");

        if (data.amount != null) {
          setAmount(
            typeof data.amount === "number"
              ? data.amount.toFixed(2)
              : String(data.amount),
          );
        }

        timerRef.current = setTimeout(() => {
          router.replace(
            `/account/wallet?status=success&reference=${encodeURIComponent(reference)}`,
          );
          router.refresh();
        }, 2200);
        return;
      }

      if (next === "pending" || next === "ongoing" || next === "processing") {
        attemptsRef.current += 1;

        if (attemptsRef.current < MAX_ATTEMPTS) {
          setStatus("pending");
          setMessage("Payment is still processing. Checking again…");
          timerRef.current = setTimeout(verify, POLL_MS);
          return;
        }

        setStatus("pending");
        setMessage(
          "Payment is still processing. It will appear in your wallet shortly if approved.",
        );
        return;
      }

      // failed / abandoned / reversed / etc.
      setStatus("failed");
      setMessage(
        data.message || data.error || "Payment was not successful.",
      );
    } catch {
      if (cancelledRef.current) return;

      attemptsRef.current += 1;
      if (attemptsRef.current < MAX_ATTEMPTS) {
        setStatus("pending");
        setMessage("Network issue. Retrying verification…");
        timerRef.current = setTimeout(verify, POLL_MS);
        return;
      }

      setStatus("failed");
      setMessage("Network error while verifying payment.");
    }
  }, [reference, router]);

  useEffect(() => {
    cancelledRef.current = false;
    attemptsRef.current = 0;
    clearTimer();
    void verify();

    return () => {
      cancelledRef.current = true;
      clearTimer();
    };
  }, [verify]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 p-8 text-center backdrop-blur-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900">
          {status === "checking" || status === "pending" ? (
            <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
          ) : status === "success" ? (
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          ) : (
            <XCircle className="h-7 w-7 text-red-400" />
          )}
        </div>

        <h1 className="text-xl font-bold">
          {status === "checking" && "Verifying payment"}
          {status === "pending" && "Payment pending"}
          {status === "success" && "Payment successful"}
          {status === "failed" && "Payment issue"}
        </h1>

        <p className="mt-2 text-sm text-zinc-400">{message}</p>

        {amount && status === "success" && (
          <p className="mt-3 font-mono text-sm text-emerald-400">
            Credited ≈ USD {amount}
          </p>
        )}

        {reference && (
          <p className="mt-4 break-all font-mono text-[10px] text-zinc-600">
            Ref: {reference}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-2">
          <Link
            href="/account/wallet"
            className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
          >
            Go to wallet
          </Link>

          {status === "failed" && (
            <Link
              href="/account/wallet/topup"
              className="w-full rounded-xl border border-white/10 py-3 text-sm text-zinc-300 transition hover:bg-white/5"
            >
              Try again
            </Link>
          )}

          {status === "pending" && (
            <button
              type="button"
              onClick={() => {
                attemptsRef.current = 0;
                setStatus("checking");
                setMessage("Confirming your payment…");
                void verify();
              }}
              className="w-full rounded-xl border border-white/10 py-3 text-sm text-zinc-300 transition hover:bg-white/5"
            >
              Check again
            </button>
          )}
        </div>

        {status === "pending" && (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            Webhook may still be finalizing the credit
          </p>
        )}
      </div>
    </main>
  );
}

export default function PaystackCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </main>
      }
    >
      <PaystackCallbackContent />
    </Suspense>
  );
}