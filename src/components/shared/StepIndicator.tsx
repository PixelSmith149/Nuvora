'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Step } from '@/types';
import { STEP_CONFIG } from '@/utils/constants';

interface StepIndicatorProps {
  currentStep: Step;
  onStepClick?: (step: Step) => void;
  allowBackNavigation?: boolean;
  className?: string;
}

// Static memoized steps array to avoid re-allocations on render
const STEPS = Object.keys(STEP_CONFIG) as Step[];

export function StepIndicator({
  currentStep,
  onStepClick,
  allowBackNavigation = true,
  className = '',
}: StepIndicatorProps) {
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <nav
      aria-label="Onboarding Progress"
      className={`w-full select-none ${className}`}
    >
      <ol role="list" className="flex items-center justify-between w-full gap-1.5 sm:gap-2">
        {STEPS.map((step, index) => {
          const config = STEP_CONFIG[step];
          const Icon = config.icon;
          const isCurrent = step === currentStep;
          const isCompleted = index < currentIndex;
          const isUpcoming = index > currentIndex;

          const isClickable = allowBackNavigation && isCompleted && onStepClick;

          return (
            <li
              key={step}
              className="flex-1 flex items-center gap-1.5 sm:gap-2 last:flex-none"
            >
              {/* STEP BADGE / PILL */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step)}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${config.label} - Step ${index + 1} of ${STEPS.length}${
                  isCompleted ? ' (Completed)' : isCurrent ? ' (Current)' : ''
                }`}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  isClickable
                    ? 'cursor-pointer hover:bg-emerald-500/30 hover:border-emerald-500/50'
                    : 'cursor-default'
                } ${
                  isCurrent
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : isCompleted
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                    : 'bg-zinc-900/60 text-zinc-500 border border-white/5'
                }`}
              >
                {/* ICON / CHECKMARK CONTAINER */}
                <div className="relative flex items-center justify-center shrink-0">
                  {isCompleted ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        isCurrent ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'
                      }`}
                    />
                  )}
                </div>

                {/* LABEL */}
                <span
                  className={`hidden sm:inline-block font-mono text-[10px] font-bold ${
                    isCurrent
                      ? 'text-white'
                      : isCompleted
                      ? 'text-emerald-300/80'
                      : 'text-zinc-500'
                  }`}
                >
                  {config.label}
                </span>

                {/* ACTIVE STEP PULSE GLOW BACKGROUND */}
                {isCurrent && (
                  <motion.div
                    layoutId="activeStepGlow"
                    className="absolute inset-0 rounded-full bg-emerald-500/10 -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>

              {/* CONNECTING CONNECTOR LINE */}
              {index < STEPS.length - 1 && (
                <div
                  className="flex-1 h-[2px] bg-zinc-800/80 rounded-full overflow-hidden relative min-w-[12px]"
                  aria-hidden="true"
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    initial={{ width: '0%' }}
                    animate={{
                      width: index < currentIndex ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}