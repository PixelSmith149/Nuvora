'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronRight,
  Globe,
  Store,
  Zap,
} from 'lucide-react';
import { ConfettiParticles } from '../shared/ConfettiParticles';
import { fadeInUp, staggerContainer, slideInLeft, slideInRight } from '@/utils/animations';

interface SuccessStepProps {
  username: string;
  onNavigateToDashboard: () => void;
  onNavigateToStorefront: () => void;
}

export function SuccessStep({
  username,
  onNavigateToDashboard,
  onNavigateToStorefront,
}: SuccessStepProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 py-4 relative"
    >
      {showConfetti && <ConfettiParticles />}

      <motion.div variants={fadeInUp} className="text-center space-y-3">
        <motion.div
          className="flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          </motion.div>
        </motion.div>

        <motion.h3
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          Storefront Unlocked! 🎉
        </motion.h3>

        <motion.p
          className="text-sm text-zinc-400 max-w-sm mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          Your store is now live on{' '}
         <span className="flex-none whitespace-nowrap text-emerald-400 font-medium">
           NuVora | Elite Home
         </span>
        </motion.p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <motion.button
          variants={slideInLeft}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNavigateToDashboard}
          className="p-4 bg-zinc-900/50 border border-white/10 rounded-xl hover:border-emerald-500/30 transition-all text-left group"
        >
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
            >
              <Store className="h-4 w-4 text-emerald-400" />
            </motion.div>
            <span className="text-xs font-bold text-white">Go to Dashboard</span>
          </div>
          <p className="text-[10px] text-zinc-500">Manage listings, view sales & analytics</p>
          <motion.div
            className="mt-2 text-emerald-400"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        </motion.button>

        <motion.button
          variants={slideInRight}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNavigateToStorefront}
          className="p-4 bg-zinc-900/50 border border-white/10 rounded-xl hover:border-sky-500/30 transition-all text-left group"
        >
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
            >
              <Globe className="h-4 w-4 text-sky-400" />
            </motion.div>
            <span className="text-xs font-bold text-white">View Public Store</span>
          </div>
          <p className="text-[10px] text-zinc-500">See how buyers see your store</p>
          <motion.div
            className="mt-2 text-sky-400"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        </motion.button>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        className="p-3 bg-zinc-900/30 border border-white/5 rounded-xl"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 20, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
          >
            <Zap className="h-4 w-4 text-amber-400" />
          </motion.div>
          <span className="text-xs text-zinc-400">
            <span className="text-white font-medium">Quick Tip:</span> Start by
            creating your first listing to attract buyers!
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}