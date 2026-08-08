"use client";

import { ArrowLeft, ChevronDown, ChevronUp, Store, Settings,   Wallet,
  ArrowUpRight, Gift,  Pencil } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProfileHeader from "@/components/account/ProfileHeader";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import QuickAccessShortcuts from "@/components/account/QuickAccessShortcuts";
import { createClient } from "@/lib/supabase/client";
import HomeButton from "@/components/HomeButton";
import { useTranslations } from "next-intl";

export default function AccountPage() {
  const t = useTranslations("Account");
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
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

          {/* Wallet Card */}
<div
  className="
    group
    relative
    isolate
    overflow-hidden
    rounded-[22px]
    border
    border-emerald-400/[0.14]
    bg-[#090c0b]
    p-5
    shadow-[0_12px_35px_rgba(0,0,0,0.22)]
    transition-all
    duration-300
    hover:-translate-y-[2px]
    hover:border-emerald-400/[0.24]
    hover:shadow-[0_18px_45px_rgba(0,0,0,0.32)]
  "
>
  {/* Ambient wallet glow */}
  <div
    className="
      pointer-events-none
      absolute
      -right-16
      -top-16
      h-40
      w-40
      rounded-full
      bg-emerald-500/[0.09]
      blur-[55px]
      transition-all
      duration-500
      group-hover:scale-125
      group-hover:bg-emerald-500/[0.14]
    "
  />

  {/* Secondary glow */}
  <div
    className="
      pointer-events-none
      absolute
      -bottom-20
      -left-10
      h-32
      w-32
      rounded-full
      bg-cyan-400/[0.035]
      blur-[45px]
    "
  />

  {/* Top reflection */}
  <div
    className="
      pointer-events-none
      absolute
      inset-x-6
      top-0
      h-px
      bg-gradient-to-r
      from-transparent
      via-emerald-300/30
      to-transparent
    "
  />

  <div className="relative">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-emerald-400/[0.14]
            bg-emerald-400/[0.06]
            text-emerald-300
          "
        >
          <Wallet className="h-[17px] w-[17px]" strokeWidth={1.7} />
        </div>

        <span
          className="
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.13em]
            text-zinc-500
          "
        >
          {t("wallet.title")}
        </span>
      </div>

      {/* Status indicator */}
      <div
        className="
          flex
          items-center
          gap-1.5
          rounded-full
          border
          border-emerald-400/[0.12]
          bg-emerald-400/[0.045]
          px-2.5
          py-1
        "
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

        <span className="text-[10px] font-medium text-emerald-300/80">
          Available
        </span>
      </div>
    </div>

    {/* Balance */}
    <div className="mt-7">
      <p className="text-[11px] font-medium text-zinc-600">
        Available balance
      </p>

      {loadingBalance ? (
        <div className="mt-2 h-11 w-36 animate-pulse rounded-lg bg-zinc-800/70" />
      ) : (
        <div className="mt-1 flex items-baseline">
          <span className="mr-1.5 text-lg font-medium text-emerald-400/70">
            $
          </span>

          <p
            className="
              text-[38px]
              font-bold
              leading-none
              tracking-[-0.045em]
              text-zinc-100
            "
          >
            {walletBalance.toFixed(2)}
          </p>
        </div>
      )}
    </div>

    {/* Action */}
    <Link
      href="/account/wallet"
      className="
        mt-7
        flex
        w-full
        items-center
        justify-between
        rounded-[14px]
        border
        border-white/[0.08]
        bg-white/[0.035]
        px-4
        py-3.5
        text-sm
        font-medium
        text-zinc-300
        backdrop-blur
        transition-all
        duration-300

        hover:border-emerald-400/[0.20]
        hover:bg-emerald-400/[0.07]
        hover:text-white

        active:scale-[0.985]
      "
    >
      <span>{t("wallet.button")}</span>

      <span
        className="
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          bg-white/[0.05]
          text-zinc-500
          transition-all
          duration-300
          group-hover:translate-x-0.5
          group-hover:bg-emerald-400/[0.10]
          group-hover:text-emerald-300
        "
      >
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  </div>

  {/* Bottom financial accent */}
  <div
    className="
      absolute
      bottom-0
      left-1/2
      h-[2px]
      w-[45%]
      -translate-x-1/2
      rounded-full
      bg-gradient-to-r
      from-transparent
      via-emerald-400/60
      to-transparent
      opacity-70
      transition-all
      duration-500
      group-hover:w-[70%]
      group-hover:opacity-100
    "
  />
</div>

          {/* Profile Entry */}
<Link
  href="/account/profile"
  className="
    group
    relative
    isolate
    block
    overflow-hidden
    rounded-[22px]
    border
    border-white/[0.08]
    bg-[#0a0c0f]
    p-5
    shadow-[0_12px_35px_rgba(0,0,0,0.20)]
    transition-all
    duration-300
    hover:-translate-y-[2px]
    hover:border-white/[0.14]
    hover:bg-[#0c0f12]
    hover:shadow-[0_18px_45px_rgba(0,0,0,0.30)]
    active:translate-y-0
    active:scale-[0.99]
  "
>
  {/* Ambient identity glow */}
  <div
    className="
      pointer-events-none
      absolute
      -right-16
      -top-16
      h-40
      w-40
      rounded-full
      bg-violet-500/[0.055]
      blur-[55px]
      transition-all
      duration-500
      group-hover:scale-125
      group-hover:bg-violet-500/[0.09]
    "
  />

  {/* Secondary light */}
  <div
    className="
      pointer-events-none
      absolute
      -bottom-20
      -left-10
      h-32
      w-32
      rounded-full
      bg-blue-400/[0.035]
      blur-[45px]
    "
  />

  {/* Top reflection */}
  <div
    className="
      pointer-events-none
      absolute
      inset-x-6
      top-0
      h-px
      bg-gradient-to-r
      from-transparent
      via-white/[0.16]
      to-transparent
    "
  />

  <div className="relative">
    {/* Header */}
    <div className="flex items-start justify-between">
      <div>
        <p
          className="
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.13em]
            text-zinc-500
          "
        >
          {t("profile.title")}
        </p>

        <p
          className="
            mt-2
            max-w-[270px]
            text-sm
            leading-6
            text-zinc-400
          "
        >
          {t("profile.description")}
        </p>
      </div>

      {/* Edit indicator */}
      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-white/[0.08]
          bg-white/[0.035]
          text-zinc-500
          transition-all
          duration-300
          group-hover:border-violet-400/[0.20]
          group-hover:bg-violet-400/[0.07]
          group-hover:text-violet-300
        "
      >
        <Pencil
          className="h-[16px] w-[16px]"
          strokeWidth={1.7}
        />
      </div>
    </div>

    {/* Action */}
    <div
      className="
        mt-6
        flex
        w-full
        items-center
        justify-between
        rounded-[14px]
        border
        border-white/[0.07]
        bg-white/[0.025]
        px-4
        py-3.5
        transition-all
        duration-300
        group-hover:border-violet-400/[0.16]
        group-hover:bg-violet-400/[0.055]
      "
    >
      <span
        className="
          text-sm
          font-medium
          text-zinc-300
          transition-colors
          duration-300
          group-hover:text-white
        "
      >
        {t("profile.button")}
      </span>

      <span
        className="
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          bg-white/[0.045]
          text-zinc-600
          transition-all
          duration-300
          group-hover:translate-x-0.5
          group-hover:bg-violet-400/[0.10]
          group-hover:text-violet-300
        "
      >
        <ArrowUpRight
          className="h-3.5 w-3.5"
          strokeWidth={1.8}
        />
      </span>
    </div>
  </div>

  {/* Bottom accent */}
  <div
    className="
      absolute
      bottom-0
      left-1/2
      h-[2px]
      w-[32%]
      -translate-x-1/2
      rounded-full
      bg-gradient-to-r
      from-transparent
      via-violet-400/50
      to-transparent
      opacity-60
      transition-all
      duration-500
      group-hover:w-[65%]
      group-hover:opacity-100
    "
  />
</Link>

          {/* Settings Entry */}
<Link
  href="/account/settings"
  className="
    group
    relative
    isolate
    block
    overflow-hidden
    rounded-[22px]
    border
    border-indigo-400/[0.12]
    bg-[#0a0c0f]
    p-5
    shadow-[0_12px_35px_rgba(0,0,0,0.20)]
    transition-all
    duration-300
    hover:-translate-y-[2px]
    hover:border-indigo-400/[0.22]
    hover:bg-[#0c0f12]
    hover:shadow-[0_18px_45px_rgba(0,0,0,0.30)]
    active:translate-y-0
    active:scale-[0.99]
  "
>
  {/* Ambient configuration glow */}
  <div
    className="
      pointer-events-none
      absolute
      -right-16
      -top-16
      h-40
      w-40
      rounded-full
      bg-indigo-500/[0.055]
      blur-[55px]
      transition-all
      duration-500
      group-hover:scale-125
      group-hover:bg-indigo-500/[0.09]
    "
  />

  {/* Top reflection */}
  <div
    className="
      pointer-events-none
      absolute
      inset-x-6
      top-0
      h-px
      bg-gradient-to-r
      from-transparent
      via-indigo-300/20
      to-transparent
    "
  />

  <div className="relative">
    <div className="flex items-start justify-between">
      <div className="flex gap-3.5">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-indigo-400/[0.14]
            bg-indigo-400/[0.055]
            text-indigo-300
            transition-all
            duration-300
            group-hover:border-indigo-400/[0.25]
            group-hover:bg-indigo-400/[0.09]
          "
        >
          <Settings
            className="h-[17px] w-[17px]"
            strokeWidth={1.7}
          />
        </div>

        <div>
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.13em]
              text-zinc-500
            "
          >
            {t("settingsCard.title")}
          </p>

          <p
            className="
              mt-2
              max-w-[270px]
              text-sm
              leading-6
              text-zinc-400
            "
          >
            {t("settingsCard.description")}
          </p>
        </div>
      </div>

      <ArrowUpRight
        className="
          h-4
          w-4
          shrink-0
          text-zinc-600
          transition-all
          duration-300
          group-hover:-translate-y-0.5
          group-hover:translate-x-0.5
          group-hover:text-indigo-300
        "
        strokeWidth={1.8}
      />
    </div>

    <div
      className="
        mt-6
        flex
        items-center
        justify-between
        rounded-[14px]
        border
        border-white/[0.07]
        bg-white/[0.025]
        px-4
        py-3.5
        transition-all
        duration-300
        group-hover:border-indigo-400/[0.16]
        group-hover:bg-indigo-400/[0.045]
      "
    >
      <span
        className="
          text-sm
          font-medium
          text-zinc-300
          transition-colors
          duration-300
          group-hover:text-white
        "
      >
        {t("settingsCard.button")}
      </span>

      <span className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">
        Configure
      </span>
    </div>
  </div>

  {/* Bottom accent */}
  <div
    className="
      absolute
      bottom-0
      left-1/2
      h-[2px]
      w-[30%]
      -translate-x-1/2
      rounded-full
      bg-gradient-to-r
      from-transparent
      via-indigo-400/50
      to-transparent
      opacity-60
      transition-all
      duration-500
      group-hover:w-[65%]
      group-hover:opacity-100
    "
  />
</Link>
          
          {/* Referrals */}
<Link
  href="/account/referrals"
  className="
    group
    relative
    isolate
    block
    overflow-hidden
    rounded-[22px]
    border
    border-emerald-400/[0.16]
    bg-[#090d0b]
    p-5
    shadow-[0_12px_35px_rgba(0,0,0,0.22)]
    transition-all
    duration-300
    hover:-translate-y-[2px]
    hover:border-emerald-400/[0.28]
    hover:shadow-[0_20px_45px_rgba(16,185,129,0.10)]
    active:translate-y-0
    active:scale-[0.99]
  "
>
  {/* Reward glow */}
  <div
    className="
      pointer-events-none
      absolute
      -right-16
      -top-16
      h-44
      w-44
      rounded-full
      bg-emerald-500/[0.08]
      blur-[55px]
      transition-all
      duration-500
      group-hover:scale-125
      group-hover:bg-emerald-500/[0.14]
    "
  />

  {/* Secondary gold-ish warmth */}
  <div
    className="
      pointer-events-none
      absolute
      -bottom-16
      -left-10
      h-28
      w-28
      rounded-full
      bg-amber-400/[0.025]
      blur-[45px]
    "
  />

  {/* Top reflection */}
  <div
    className="
      pointer-events-none
      absolute
      inset-x-6
      top-0
      h-px
      bg-gradient-to-r
      from-transparent
      via-emerald-300/25
      to-transparent
    "
  />

  <div className="relative">
    <div className="flex items-start justify-between">
      <div className="flex gap-3.5">
        {/* Gift icon */}
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-[14px]
            border
            border-emerald-400/[0.18]
            bg-emerald-400/[0.07]
            text-emerald-300
            shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
            transition-all
            duration-300
            group-hover:scale-[1.04]
            group-hover:border-emerald-400/[0.30]
            group-hover:bg-emerald-400/[0.10]
          "
        >
          <Gift
            className="h-[18px] w-[18px]"
            strokeWidth={1.7}
          />
        </div>

        <div>
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.13em]
              text-emerald-300/70
            "
          >
            Referral Program
          </p>

          <p
            className="
              mt-1.5
              text-base
              font-semibold
              tracking-[-0.02em]
              text-zinc-100
            "
          >
            Refer & Earn
          </p>

          <p
            className="
              mt-1.5
              max-w-[250px]
              text-xs
              leading-5
              text-zinc-500
            "
          >
            Invite friends and earn rewards.
          </p>
        </div>
      </div>

      {/* Arrow */}
      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          border-white/[0.07]
          bg-white/[0.025]
          text-zinc-600
          transition-all
          duration-300
          group-hover:translate-x-0.5
          group-hover:-translate-y-0.5
          group-hover:border-emerald-400/[0.18]
          group-hover:bg-emerald-400/[0.07]
          group-hover:text-emerald-300
        "
      >
        <ArrowUpRight
          className="h-4 w-4"
          strokeWidth={1.8}
        />
      </div>
    </div>

    {/* CTA */}
    <div
      className="
        relative
        mt-6
        flex
        items-center
        justify-between
        overflow-hidden
        rounded-[14px]
        border
        border-emerald-400/[0.12]
        bg-emerald-400/[0.045]
        px-4
        py-3.5
        transition-all
        duration-300
        group-hover:border-emerald-400/[0.22]
        group-hover:bg-emerald-400/[0.07]
      "
    >
      {/* Interaction shimmer */}
      <span
        className="
          pointer-events-none
          absolute
          inset-y-0
          -left-[100%]
          w-1/2
          skew-x-[-20deg]
          bg-gradient-to-r
          from-transparent
          via-white/[0.10]
          to-transparent
          transition-transform
          duration-700
          group-hover:translate-x-[400%]
        "
      />

      <span
        className="
          relative
          text-sm
          font-semibold
          text-emerald-100
        "
      >
        Start earning
      </span>

      <span
        className="
          relative
          text-[10px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-emerald-400/60
        "
      >
        Invite
      </span>
    </div>
  </div>

  {/* Reward accent */}
  <div
    className="
      absolute
      bottom-0
      left-1/2
      h-[2px]
      w-[45%]
      -translate-x-1/2
      rounded-full
      bg-gradient-to-r
      from-transparent
      via-emerald-400/70
      to-transparent
      opacity-70
      transition-all
      duration-500
      group-hover:w-[75%]
      group-hover:opacity-100
    "
  />
</Link>

        <Link
  href="/account/my-store-front"
  className="
    group
    relative
    flex
    w-full
    items-center
    justify-between
    overflow-hidden
    rounded-[22px]
    border
    border-cyan-400/[0.14]
    bg-[#090c0f]
    px-5
    py-4
    transition-all
    duration-300
    hover:-translate-y-[2px]
    hover:border-cyan-400/[0.25]
    hover:bg-[#0c1013]
    active:scale-[0.99]
  "
>
  {/* Ambient storefront glow */}
  <div
    className="
      pointer-events-none
      absolute
      -right-12
      -top-16
      h-36
      w-36
      rounded-full
      bg-cyan-400/[0.07]
      blur-[50px]
      transition-all
      duration-500
      group-hover:scale-125
      group-hover:bg-cyan-400/[0.12]
    "
  />

  <div className="relative flex items-center gap-3.5">
    <div
      className="
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-[14px]
        border
        border-cyan-400/[0.16]
        bg-cyan-400/[0.06]
        text-cyan-300
        transition-all
        duration-300
        group-hover:border-cyan-400/[0.28]
        group-hover:bg-cyan-400/[0.10]
      "
    >
      <Store className="h-[18px] w-[18px]" strokeWidth={1.7} />
    </div>

    <div>
      <p className="text-sm font-semibold text-zinc-100">
        {t("storefront.title")}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        {t("storefront.description")}
      </p>
    </div>
  </div>

  <ArrowUpRight
    className="
      relative
      h-4
      w-4
      text-zinc-600
      transition-all
      duration-300
      group-hover:-translate-y-0.5
      group-hover:translate-x-0.5
      group-hover:text-cyan-300
    "
  />

  {/* Bottom accent */}
  <div
    className="
      absolute
      bottom-0
      left-1/2
      h-[2px]
      w-[30%]
      -translate-x-1/2
      rounded-full
      bg-gradient-to-r
      from-transparent
      via-cyan-400/60
      to-transparent
      opacity-60
      transition-all
      duration-500
      group-hover:w-[65%]
      group-hover:opacity-100
    "
  />
</Link>

        </div>
      </section>
    </main>
  );
}