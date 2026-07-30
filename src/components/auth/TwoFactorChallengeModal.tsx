"use client";

import { useState } from "react";
import { Loader2, Shield, CheckCircle2, XCircle } from "lucide-react";

interface TwoFactorChallengeModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorChallengeModal({
  isOpen,
  onSuccess,
  onCancel,
}: TwoFactorChallengeModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    // Abort after 12 seconds so the user gets a clear timeout message
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch("/api/account/2fa/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        // Clearer messages based on status
        if (res.status === 400) {
          throw new Error(data.error || "Incorrect code. Please try again.");
        }
        if (res.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(data.error || "Verification failed. Please try again.");
      }

      // Show success state briefly before redirecting
      setSuccess(true);
      setCode("");

      setTimeout(() => {
        onSuccess();
      }, 900);
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === "AbortError") {
        setError("Request timed out. Check your connection and try again.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }

      setCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!loading && !success ? onCancel : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            {success ? (
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            ) : (
              <Shield className="h-7 w-7 text-emerald-400" />
            )}
          </div>

          <h2 className="text-xl font-bold text-white">
            {success ? "Verified" : "Two-Factor Authentication"}
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            {success
              ? "Redirecting you to your account..."
              : "Enter the 6-digit code from your authenticator app"}
          </p>
        </div>

        {/* Success toast-style banner */}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Code verified successfully
          </div>
        )}

        {/* Error toast-style banner */}
        {error && !success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ""));
                  if (error) setError(null);
                }}
                placeholder="000000"
                autoFocus
                disabled={loading}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-3.5 text-center text-2xl tracking-[0.4em] text-white outline-none transition focus:border-emerald-500 placeholder:tracking-normal disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Verifying..." : "Verify"}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-300 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}