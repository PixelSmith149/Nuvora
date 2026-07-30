'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Store, Check, Info } from 'lucide-react';
import { ThreeDCard } from '../shared/ThreeDCard';
import { fadeInUp, staggerContainer } from '@/utils/animations';

interface WelcomeStepProps {
  ageConfirmed: boolean;
  onAgeConfirm: (confirmed: boolean) => void;
}

export function WelcomeStep({ ageConfirmed, onAgeConfirm }: WelcomeStepProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5 select-none"
    >
      {/* --- HERO HEADER ZONE --- */}
      <motion.div variants={fadeInUp} className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-medium backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Prime Boostage Creator Access</span>
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Initiate Merchant Verification
        </h2>

        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          Unlock your verified creator storefront, publish high-yield digital assets, and process global buyer payouts securely.
        </p>
      </motion.div>

      {/* --- FEATURE HIGHLIGHT CARDS --- */}
      <motion.div variants={staggerContainer} className="space-y-3">
        {/* Card 1: Asset Explanation */}
        <ThreeDCard
          className="p-4 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-black border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl relative overflow-hidden"
          glowColor="emerald"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Store className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-zinc-100 tracking-wide uppercase">
                  Digital Asset Infrastructure
                </h4>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Instant Delivery
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Monetize source code, API access keys, accounts, automated tools, or digital media. Our automated engine handles buyer fulfillment and escrow security.
              </p>
            </div>
          </div>
        </ThreeDCard>

        {/* Card 2: Merchant Governance */}
        <ThreeDCard
          className="p-4 bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-black border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl relative overflow-hidden"
          glowColor="purple"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-zinc-100 tracking-wide uppercase">
                Merchant Governance & Trust
              </h4>
              <ul className="text-xs text-zinc-400 space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-400" />
                  <span>Maintain high accuracy in product descriptions and deliverables.</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-400" />
                  <span>Build custom storefront reputation and buyer trust scores.</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-purple-400" />
                  <span>Enjoy fast escrow clearance and low protocol fee structures.</span>
                </li>
              </ul>
            </div>
          </div>
        </ThreeDCard>
      </motion.div>

      {/* --- CUSTOM AGE CONFIRMATION CHECKBOX --- */}
      <motion.div
        variants={fadeInUp}
        onClick={() => onAgeConfirm(!ageConfirmed)}
        className={`group flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
          ageConfirmed
            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
            : 'bg-zinc-900/40 border-white/10 hover:border-white/20'
        }`}
      >
        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
          <input
            type="checkbox"
            id="age-confirm"
            checked={ageConfirmed}
            onChange={(e) => onAgeConfirm(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 ${
              ageConfirmed
                ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/30'
                : 'border-zinc-600 bg-zinc-950/80 group-hover:border-zinc-400'
            }`}
          >
            {ageConfirmed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>

        <label
          htmlFor="age-confirm"
          className="text-xs text-zinc-300 leading-relaxed cursor-pointer select-none space-y-0.5"
        >
          <span className="block font-medium text-white">
            Legal Age & Responsibility Acknowledgment
          </span>
          <span className="block text-zinc-400 text-[11px]">
            I confirm that I am at least <strong className="text-zinc-200">18 years old</strong> and agree to comply with platform terms and digital commerce regulation standards.
          </span>
        </label>
      </motion.div>
    </motion.div>
  );
}