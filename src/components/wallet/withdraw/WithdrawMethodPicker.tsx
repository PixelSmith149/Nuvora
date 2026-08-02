"use client";

import { Bitcoin, CreditCard, Landmark, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import type { WithdrawDraft, WithdrawMethod } from "@/lib/wallet/types";

type Props = {
  value: WithdrawDraft;
  onNext: (draft: Partial<WithdrawDraft>) => void;
};

const METHODS: {
  id: WithdrawMethod;
  title: string;
  subtitle: string;
  icon: any;
  accent: string;
}[] = [
  {
    id: "momo",
    title: "Mobile Money",
    subtitle: "Send to phone number (MTN / Telecel auto-detected)",
    icon: Smartphone,
    accent: "from-yellow-500/20 to-orange-500/20",
  },
  {
    id: "bank",
    title: "Bank Account",
    subtitle: "Withdraw to any supported bank",
    icon: Landmark,
    accent: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "card",
    title: "Bank Card",
    subtitle: "Supported countries only",
    icon: CreditCard,
    accent: "from-purple-500/20 to-fuchsia-500/20",
  },
  {
    id: "crypto",
    title: "Crypto Wallet",
    subtitle: "BTC • USDT • LTC • More",
    icon: Bitcoin,
    accent: "from-orange-500/20 to-red-500/20",
  },
];

export default function WithdrawMethodPicker({ value, onNext }: Props) {
  const router = useRouter();

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-3xl font-black">Choose Withdrawal Method</h2>
        <p className="mt-2 text-zinc-400">
          Your wallet remains in USD. Payout is converted automatically.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {METHODS.map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => {
                if (method.id === "crypto") {
                  // Dedicated crypto flow
                  router.push("/account/wallet/withdraw/crypto");
                  return;
                }
                onNext({ method: method.id });
              }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-zinc-900"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${method.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                  <Icon size={28} className="text-white" />
                </div>
                <h3 className="mt-6 text-xl font-bold">{method.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {method.subtitle}
                </p>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                    Continue
                  </span>
                  <div className="rounded-full border border-white/10 px-3 py-1 text-xs">
                    →
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <h4 className="font-bold text-emerald-400">Security</h4>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Withdrawal details are verified automatically before funds leave your
          wallet. MoMo payouts resolve network and account name internally for
          fraud prevention.
        </p>
      </div>
    </section>
  );
}