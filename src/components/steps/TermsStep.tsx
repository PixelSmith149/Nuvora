'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileCheck2, ScrollText } from 'lucide-react';
import { MarketingTermsOfService } from '@/components/market/MarketingTermsOfService';
import { fadeInUp, staggerContainer, scaleIn } from '@/utils/animations';

interface TermsStepProps {
  termsAccepted: boolean;
  onTermsAccept: (accepted: boolean) => void;
}

export function TermsStep({ termsAccepted, onTermsAccept }: TermsStepProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5 select-none"
    >
      {/* --- STEP HEADER --- */}
      <motion.div variants={fadeInUp} className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold backdrop-blur-md">
          <ScrollText className="w-3.5 h-3.5" />
          <span>Legal Governance</span>
        </div>
        <h3 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          Protocol Merchant Agreement
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Please review the global merchant service standards, dispute rules, and seller compliance terms.
        </p>
      </motion.div>

      {/* --- TERMS CONTAINER WITH LUXURY OBSIDIAN WRAPPER --- */}
      <motion.div
        variants={scaleIn}
        className="bg-gradient-to-b from-zinc-900/90 via-zinc-900/50 to-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
      >
        {/* Subtle accent line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        <div className="p-3 sm:p-4 max-h-[380px] overflow-y-auto custom-scrollbar">
          <MarketingTermsOfService
            onAccept={() => onTermsAccept(true)}
            onDecline={() => onTermsAccept(false)}
            isLoading={false}
          />
        </div>
      </motion.div>

      {/* --- ACCEPTANCE VERIFICATION BADGE --- */}
      {termsAccepted && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-md"
        >
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
            <FileCheck2 className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">
                Merchant Terms Acknowledged
              </span>
              <span className="text-[10px] font-mono text-emerald-400/80">
                VERIFIED
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              You have formally accepted the legal and marketplace seller regulations.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}