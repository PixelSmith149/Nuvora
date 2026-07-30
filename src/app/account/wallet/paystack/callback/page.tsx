"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";

type Status = "checking" | "success" | "pending" | "failed";

function PaystackCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("reference") || searchParams.get("trxref") || "";

  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("Confirming your payment…");
  const [amount, setAmount] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setMessage("Missing payment reference.");
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 8;

    async function verify() {
      try {
        const res = await fetch("/api/wallet/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });

        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setStatus("failed");
          setMessage(data.error || "Could not verify payment.");
          return;
        }

        if (data.status === "success") {
          setStatus("success");
          setMessage("Deposit confirmed. Your wallet has been updated.");
          if (data.amount != null) {
            setAmount(
              typeof data.amount === "number"
                ? data.amount.toFixed(2)
                : String(data.amount),
            );
          }
          // Optional auto-redirect
          setTimeout(() => router.replace("/account/wallet"), 2500);
          return;
        }

        if (data.status === "pending") {
          attempts += 1;
          if (attempts < maxAttempts) {
            setStatus("pending");
            setMessage("Payment is still processing. Checking again…");
            setTimeout(verify, 2000);
            return;
          }
          setStatus("pending");
          setMessage(
            "Payment is processing. It will appear in your wallet shortly.",
          );
          return;
        }

        setStatus("failed");
        setMessage(data.message || "Payment was not successful.");
      } catch {
        if (cancelled) return;
        setStatus("failed");
        setMessage("Network error while verifying payment.");
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [reference, router]);

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
          <p className="mt-3 font-mono text-emerald-400 text-sm">
            Credited ≈ USD {amount}
          </p>
        )}

        {reference && (
          <p className="mt-4 text-[10px] text-zinc-600 font-mono break-all">
            Ref: {reference}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-2">
          <Link
            href="/account/wallet"
            className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200 transition"
          >
            Go to wallet
          </Link>
          {status === "failed" && (
            <Link
              href="/account/wallet/paystack"
              className="w-full rounded-xl border border-white/10 py-3 text-sm text-zinc-300 hover:bg-white/5 transition"
            >
              Try again
            </Link>
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
        <main className="min-h-screen bg-black flex items-center justify-center text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </main>
      }
    >
      <PaystackCallbackContent />
    </Suspense>
  );
}