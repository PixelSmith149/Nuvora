import { Step } from '@/types';
import { CheckCircle2, Crown, DollarSign, ShieldCheck, Sparkles, Users } from 'lucide-react';

export const STORAGE_KEY = 'onboarding_progress_v2';
export const STORAGE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const VIDEO_RECORDING_DURATION = 15; // in seconds
export const MAX_STORE_BIO_LENGTH = 500;

/** Platform Fee configurations */
export const PLATFORM_FEE_PERCENTAGE = 4;
export const PLATFORM_FEE_MULTIPLIER = 0.04;

export const STEPS: Step[] = ['welcome', 'financial', 'info', 'biometric', 'terms', 'success'];

export const STEP_CONFIG = {
  welcome: {
    label: 'Welcome',
    icon: Sparkles,
  },
  financial: {
    label: 'Financial',
    icon: DollarSign,
  },
  info: {
    label: 'Info',
    icon: Users,
  },
  biometric: {
    label: 'Verify',
    icon: ShieldCheck,
  },
  terms: {
    label: 'Terms',
    icon: Crown,
  },
  success: {
    label: 'Done',
    icon: CheckCircle2,
  },
} as const;