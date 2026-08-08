"use client";

import { ArrowRight, Lock, ShieldCheck, Terminal } from "lucide-react";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import { cn } from "@/lib/utils";
import { verifyAdminPasskey } from "./action";

interface AdminLoginPageProps {
  params: Promise<{ tech: string }>;
}

export default function AdminLoginPage({ params }: AdminLoginPageProps) {
  const { tech } = use(params);

  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  const SECRET_ADMIN_TOKEN =
    process.env.NEXT_PUBLIC_ADMIN_CAMOUFLAGE_TOKEN || "core-tech";

  if (tech !== SECRET_ADMIN_TOKEN) {
    return notFound();
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticating(true);
    setError(false);

    try {
      const isAuthorized = await verifyAdminPasskey(passkey);

      if (isAuthorized) {
        // Small delay so the cookie is committed
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Relative path → works on both apex and tech.nu-vora.app
        window.location.href = "/admin-dashboard";
      } else {
        setError(true);
        setAuthenticating(false);
      }
    } catch (err) {
      console.error("Auth terminal communication fault:", err);
      setError(true);
      setAuthenticating(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-zinc-200 flex flex-col items-center justify-center p-6 selection:bg-red-500/20">
      <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.015),transparent_70%)]" />

      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between border border-white/[0.06] bg-zinc-950 px-4 py-2 rounded-t-2xl border-b-0 text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-green-500/40" />
          </div>
          <span>GATEWAY_SECURE_AUTH</span>
        </div>

        <div className="border border-white/[0.06] bg-zinc-950/40 backdrop-blur-md p-8 rounded-b-2xl space-y-6 shadow-2xl relative">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/10 bg-red-500/[0.02] text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
              <ShieldCheck className="h-5 w-5 animate-pulse" />
            </div>
            <h1 className="text-sm font-black font-mono tracking-[0.2em] text-white uppercase mt-4">
              Terminal Verification
            </h1>
            <p className="text-xs text-zinc-500 font-mono">
              Server-Side Signature Validation
            </p>
          </div>

          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-red-400 transition-colors" />
                <input
                  type="password"
                  maxLength={24}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  disabled={authenticating}
                  className={cn(
                    "w-full bg-black border rounded-xl pl-12 pr-4 py-3.5 text-sm font-mono text-center tracking-[0.25em] text-white placeholder:text-zinc-700 focus:outline-none transition-all duration-300",
                    error
                      ? "border-red-500/40 focus:border-red-500"
                      : "border-white/[0.06] focus:border-white/[0.15]",
                  )}
                />
              </div>
              {error && (
                <p className="text-[11px] font-mono font-medium text-red-400 text-center">
                  Invalid token signature code sequence. Access denied.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={authenticating || passkey.length < 8}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest py-3.5 transition-all duration-300 hover:bg-zinc-200 disabled:opacity-30"
            >
              {authenticating ? "Verifying Keys..." : "Initialize Session"}
              <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between px-2 text-[10px] font-mono text-zinc-600">
          <span className="flex items-center gap-1.5">
            <Terminal className="h-3 w-3" /> HOST: SECURITY_SERVER_EDGE
          </span>
          <span>COMPLIANT</span>
        </div>
      </div>
    </main>
  );
}