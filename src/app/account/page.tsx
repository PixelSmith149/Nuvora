"use client";

import { ArrowLeft, ChevronDown, ChevronUp, Store, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProfileHeader from "@/components/account/ProfileHeader";
import { StoreFrontPanel } from "@/components/account/StoreFrontPanel";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import QuickAccessShortcuts from "@/components/account/QuickAccessShortcuts";
import { createClient } from "@/lib/supabase/client";
import HomeButton from "@/components/HomeButton";
import { useTranslations } from "next-intl";

export default function AccountPage() {
  const t = useTranslations("Account");
  const { isLoading: sessionLoading } = useAppSession();
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [isStoreVisible, setIsStoreVisible] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const storeRef = useRef<HTMLDivElement>(null);
  const borderClass = "border-white/10";
  const cardBgClass = "bg-white/[0.02]";

  // ─── Fetch username ──────────────────────────────────────────────────
  useEffect(() => {
    async function loadUsername() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();
        if (profile) {
          setUsername(profile.username);
        }
      }
    }
    loadUsername();
  }, []);

  // ─── Fetch wallet balance ────────────────────────────────────────────
  // ─── Fetch wallet balance ────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function loadBalance() {
      try {
        const res = await fetch("/api/wallet/balance");

        if (!res.ok) {
          console.error(
            "[AccountPage] ❌ Failed to fetch wallet ledger details. Status:",
            res.status,
          );
          return;
        }

        const data = await res.json();

        if (isMounted) {
          setWalletBalance(Number(data.balance ?? 0));
        }
      } catch (err) {
        console.error(
          "[AccountPage] 💥 Network fault reading balance API gateway:",
          err,
        );
      } finally {
        if (isMounted) setLoadingBalance(false);
      }
    }

    loadBalance();

    return () => {
      isMounted = false;
    };
  }, []);
  const toggleStorefront = () => {
    setIsStoreVisible((prev) => {
      const nextState = !prev;
      if (nextState) {
        setTimeout(() => {
          storeRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
      return nextState;
    });
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 pt-6 pb-24">
      <section className="mx-auto w-full max-w-5xl">
        <HomeButton />
        <header className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            {t("title")}
          </h1>
          
          {/* ─── Settings Link ──────────────────────────────────────────── */}
          <Link
            href="/account/settings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all duration-200 group"
          >
            <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-sm font-medium">{t("settings")}</span>
          </Link>
        </header>

        <div className="space-y-8">
          <ProfileHeader />

          {/* ─── Quick Access ────────────────────────────────────────────── */}
          <div
            className={`rounded-2xl border ${borderClass} ${cardBgClass} p-6 transition hover:border-white/20`}
          >
            <QuickAccessShortcuts username={username || undefined} />
          </div>

          {/* Wallet Entry */}
          <div
            className={`rounded-2xl border ${borderClass} ${cardBgClass} p-6 transition hover:border-white/20`}
          >
            <h2 className="text-xl font-bold mb-2">{t("wallet.title")}</h2>

            {loadingBalance ? (
              <div className="h-9 w-24 bg-zinc-900 animate-pulse rounded mb-5" />
            ) : (
              <p className="text-3xl font-black text-green-400 mb-5">
                ${walletBalance.toFixed(2)}
              </p>
            )}

            <Link
              href="/account/wallet"
              className="inline-flex rounded-xl bg-white text-black px-6 py-3 text-sm font-semibold transition hover:bg-zinc-200 active:scale-[0.98]"
            >
              {t("wallet.button")}
            </Link>
          </div>

          {/* Profile Entry */}
          <div
            className={`rounded-2xl border ${borderClass} ${cardBgClass} p-6 transition hover:border-white/20`}
          >
            <h2 className="text-xl font-bold mb-2">{t("profile.title")}</h2>
            <p className="text-sm text-zinc-400 mb-5">
              {t("profile.description")}
            </p>
            <Link
              href="/account/profile"
              className="inline-flex rounded-xl bg-white text-black px-6 py-3 text-sm font-semibold transition hover:bg-zinc-200 active:scale-[0.98]"
            >
              {t("profile.button")}
            </Link>
          </div>

          {/* ─── Settings Entry ──────────────────────────────────────────── */}
          <div
            className={`rounded-2xl border ${borderClass} ${cardBgClass} p-6 transition hover:border-white/20`}
          >
            <h2 className="text-xl font-bold mb-2">{t("settingsCard.title")}</h2>
            <p className="text-sm text-zinc-400 mb-5">
              {t("settingsCard.description")}
            </p>
            <Link
              href="/account/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-6 py-3 text-sm font-semibold transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <Settings className="h-4 w-4" />
              {t("settingsCard.button")}
            </Link>
          </div>

          {/* 🎯 CENTERED FULL-WIDTH INTERACTIVE ACCORDION BUTTON */}
          <div className="pt-4">
            <button
              type="button"
              onClick={toggleStorefront}
              className={`w-full flex items-center justify-center gap-3 rounded-2xl border ${borderClass} bg-zinc-950 px-6 py-5 text-base font-bold text-white transition-all duration-200 hover:bg-zinc-900 hover:border-white/20 active:scale-[0.99] group`}
            >
              <Store className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>
                {isStoreVisible
                  ? t("storefront.hide")
                  : t("storefront.show")}
              </span>
              {isStoreVisible ? (
                <ChevronUp className="w-5 h-5 text-zinc-500 ml-1" />
              ) : (
                <ChevronDown className="w-5 h-5 text-zinc-500 ml-1" />
              )}
            </button>
          </div>

          {/* 📦 FULL-PAGE OVERLAY STORE FRONT */}
          {isStoreVisible && (
            <div
              ref={storeRef}
              className="fixed inset-0 z-50 bg-black overflow-y-auto animate-in fade-in duration-300"
            >
              <div className="relative">
                <button
                  onClick={toggleStorefront}
                  className="absolute top-4 left-4 z-50 rounded-full bg-zinc-900/80 border border-white/10 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all backdrop-blur-sm"
                  aria-label={t("storefront.closeAria")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                {!sessionLoading && <StoreFrontPanel />}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}