"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import WalletPanel from "@/components/account/WalletPanel";
import Link from "next/link";
import { FiChevronLeft, FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";
import { useUser } from "@/lib/useAuth"; // Ensure path matches your auth hook

function WalletContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading } = useUser();
    
    const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Redirect unauthenticated users safely on client side
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login?redirect=/account/wallet");
        }
    }, [user, loading, router]);

    useEffect(() => {
        const status = searchParams.get("status");
        const message = searchParams.get("message");
        const reference = searchParams.get("reference");

        if (status === "success") {
            setBanner({
                type: "success",
                message: reference
                    ? `Payment verified successfully! Reference: ${reference}`
                    : "Your wallet balance was updated successfully.",
            });
            router.replace("/account/wallet", { scroll: false });
        } else if (status === "error") {
            setBanner({
                type: "error",
                message: message ? decodeURIComponent(message) : "Payment process failed or was canceled.",
            });
            router.replace("/account/wallet", { scroll: false });
        }
    }, [searchParams, router]);

    if (loading || !user) {
        return (
            <main className="min-h-screen bg-black text-white px-6 py-8 flex items-center justify-center">
                <p className="text-zinc-500 font-mono text-sm animate-pulse">
                    Verifying session...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white px-6 py-8">
            <section className="mx-auto w-full max-w-5xl space-y-8">
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <Link
                            href="/account"
                            className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                        >
                            <FiChevronLeft className="h-3.5 w-3.5" />
                            Back to Account
                        </Link>

                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-white">
                                Secure Wallet
                            </h1>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="ml-2 whitespace-nowrap text-xs font-medium text-emerald-400">
                            Wallet Active
                        </span>
                    </div>
                </div>

                {banner && (
                    <div
                        className={`flex items-center justify-between p-4 rounded-xl border text-sm transition-all ${
                            banner.type === "success"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            {banner.type === "success" ? (
                                <FiCheckCircle className="text-lg flex-shrink-0" />
                            ) : (
                                <FiAlertCircle className="text-lg flex-shrink-0" />
                            )}
                            <span>{banner.message}</span>
                        </div>
                        <button
                            onClick={() => setBanner(null)}
                            className="p-1 text-zinc-400 hover:text-white transition-colors"
                            aria-label="Close notification"
                        >
                            <FiX />
                        </button>
                    </div>
                )}

                <WalletPanel />
            </section>
        </main>
    );
}

export default function WalletPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white px-6 py-8">Loading wallet details...</div>}>
            <WalletContent />
        </Suspense>
    );
}