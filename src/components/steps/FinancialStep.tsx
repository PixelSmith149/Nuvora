'use client';

import { motion } from 'framer-motion';
import { Globe2, ShieldCheck, DollarSign, Wallet, ArrowRightLeft } from 'lucide-react';
import { ThreeDCard } from '../shared/ThreeDCard';
import { AnimatedCounter } from '../shared/AnimatedCounter';
import { PLATFORM_FEE_PERCENTAGE } from '@/utils/constants';
import { fadeInUp, staggerContainer, scaleIn } from '@/utils/animations';

export function FinancialStep() {
  // Defensive numerical fallback to prevent NaN rendering in edge cases
  const feePercentage = typeof PLATFORM_FEE_PERCENTAGE === 'number' ? PLATFORM_FEE_PERCENTAGE : 5;
  const merchantPayoutPercentage = Math.max(0, 100 - feePercentage);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5 select-none"
    >
      {/* --- STEP HEADER --- */}
      <motion.div variants={fadeInUp} className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold backdrop-blur-md">
          <DollarSign className="w-3.5 h-3.5" />
          <span>Settlement Engine</span>
        </div>
        <h3 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          Protocol Financial Terms
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Transparent fee structures, automated escrow clearing, and instant multi-currency settlement.
        </p>
      </motion.div>

      {/* --- FINANCIAL BREAKDOWN LEDGER CARD --- */}
      <motion.div variants={staggerContainer} className="space-y-3">
        <motion.div
          variants={scaleIn}
          className="p-4 bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-black border border-emerald-500/20 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-xl"
        >
          {/* Ambient Top Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          <div className="space-y-3">
            {/* Merchant Split */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-200">Your Net Payout</span>
              </div>
              <span className="text-base font-bold font-mono text-emerald-400 tracking-tight">
                <AnimatedCounter value={merchantPayoutPercentage} suffix="%" />
              </span>
            </div>

            {/* Protocol Fee */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-zinc-400">Platform Maintenance Fee</span>
              </div>
              <span className="text-sm font-semibold font-mono text-zinc-300 tracking-tight">
                <AnimatedCounter value={feePercentage} suffix="%" />
              </span>
            </div>

            {/* Micro Guaranty Label */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500 font-medium">
              <span>Zero Listing Subscriptions</span>
              <span className="text-emerald-500/80">• Zero Hidden Charges</span>
              <span>Escrow Protected</span>
            </div>
          </div>
        </motion.div>

        {/* --- CURRENCY FLEXIBILITY CARD --- */}
        <ThreeDCard
          className="p-4 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-black border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl relative overflow-hidden"
          glowColor="sky"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
              <Globe2 className="h-5 w-5" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-100 tracking-wide uppercase">
                  Global Currency Settlement
                </h4>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Automated FX
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>
                    <strong className="text-zinc-200 font-medium">Base Benchmark:</strong> All store assets listed in <span className="font-mono text-cyan-300">USD ($)</span> for standardized global pricing.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>
                    <strong className="text-zinc-200 font-medium">Multi-Currency Payouts:</strong> Withdraw in local fiat or preferred cryptocurrency rails seamlessly.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ThreeDCard>

        {/* --- ESCROW TRUST BADGE --- */}
        <motion.div
          variants={fadeInUp}
          className="p-3.5 bg-gradient-to-r from-amber-500/10 via-zinc-900/60 to-zinc-900/40 border border-amber-500/20 rounded-2xl backdrop-blur-md"
        >
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h5 className="text-xs font-bold text-amber-300">
                Automated Escrow Protocol
              </h5>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Buyer funds remain safely locked in platform escrow and are automatically disbursed to your merchant wallet upon order confirmation.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}