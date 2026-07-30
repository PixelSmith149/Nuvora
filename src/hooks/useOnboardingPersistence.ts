'use client';

import { useEffect, useRef, useCallback } from 'react';
import { OnboardingState, BiometricState, Step } from '@/types';
import { saveOnboardingState, loadOnboardingState, clearOnboardingState } from '@/utils/storage';

interface UseOnboardingPersistenceProps {
  step: Step;
  state: OnboardingState;
  biometricState: BiometricState;
  isComplete: boolean;
  userId?: string;
  isAuthLoading?: boolean; // Added guard to prevent premature clearing on boot
}

export function useOnboardingPersistence({
  step,
  state,
  biometricState,
  isComplete,
  userId,
  isAuthLoading = false,
}: UseOnboardingPersistenceProps) {
  const previousStateRef = useRef<string>('');

  // Safe loader that verifies ownership by userId
  const loadSavedStateForUser = useCallback(() => {
    if (!userId) return null;
    const saved = loadOnboardingState();
    if (saved && (saved as any).userId === userId) {
      return saved;
    }
    return null;
  }, [userId]);

  useEffect(() => {
    // 1. Guard: Never wipe storage while authentication is actively resolving
    if (isAuthLoading) return;

    // 2. Clear state if onboarding is completed
    if (isComplete) {
      clearOnboardingState();
      previousStateRef.current = '';
      return;
    }

    // 3. Do not auto-save if user is unauthenticated
    if (!userId) return;

    // 4. Strip non-serializable objects (like Blob) before comparison and serialization
    const { videoBlob, ...cleanBiometricState } = biometricState;

    const payloadToSerialize = {
      step,
      state,
      biometricState: cleanBiometricState as BiometricState,
      userId, // Anchor state to specific user ID
    };

    try {
      const currentStateString = JSON.stringify(payloadToSerialize);

      if (currentStateString !== previousStateRef.current) {
        saveOnboardingState({
          step,
          state,
          biometricState: cleanBiometricState as BiometricState,
          timestamp: Date.now(),
          ...( { userId } as any ), // Namespace tag
        });
        previousStateRef.current = currentStateString;
      }
    } catch (error) {
      console.error('[Persistence] Failed to serialize onboarding state:', error);
    }
  }, [step, state, biometricState, isComplete, userId, isAuthLoading]);

  return {
    loadSavedState: loadSavedStateForUser,
    clearSavedState: clearOnboardingState,
  };
}