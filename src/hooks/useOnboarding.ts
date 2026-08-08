'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Step, OnboardingState, BiometricState } from '@/types';
import { STEPS } from '@/utils/constants';
import { OnboardingService } from '@/services/onboardingService';
import { saveOnboardingState, loadOnboardingState, clearOnboardingState } from '@/utils/storage';
import {
  canProceedToInfo,
  canProceedToBiometric,
  canProceedToTerms,
  canProceedToSuccess,
} from '@/utils/validations';

const initialOnboardingState: OnboardingState = {
  currentStep: 'welcome',
  ageConfirmed: false,
  contactEmail: '',
  marketingEmail: '',
  tiktok: '',
  snapchat: '',
  storeBio: '',
  termsAccepted: false,
  isSubmitting: false,
  error: null,
};

const initialBiometricState: BiometricState = {
  isDesktop: false,
  recordingState: 'idle',
  recordingTime: 0,
  faceDetected: false,
  videoBlob: null,
  error: null,
  challenge: 'none',
  challengeInstruction: null,
};

export function useOnboarding(username: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [state, setState] = useState<OnboardingState>(initialOnboardingState);
  const [biometricState, setBiometricState] = useState<BiometricState>(initialBiometricState);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const currentStep = state.currentStep;
  const currentIndex = STEPS.indexOf(currentStep);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 'welcome':
        return canProceedToInfo(state);
      case 'financial':
        return true;
      case 'info':
        return canProceedToBiometric(state);
      case 'biometric':
        return canProceedToTerms(biometricState);
      case 'terms':
        return canProceedToSuccess(state);
      default:
        return false;
    }
  }, [currentStep, state, biometricState]);

  const goToStep = useCallback((step: Step) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
      error: null,
    }));
  }, []);

  const goToNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < STEPS.length) {
      goToStep(STEPS[nextIndex]);
    }
  }, [currentIndex, goToStep]);

  const goToPrev = useCallback(() => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      goToStep(STEPS[prevIndex]);
    }
  }, [currentIndex, goToStep]);

  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const updateBiometricState = useCallback((updates: Partial<BiometricState>) => {
    setBiometricState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const checkAuth = useCallback(async () => {
    if (!username) return;

    try {
      const sanitizedUsername = encodeURIComponent(username.trim());
      const currentUser = await OnboardingService.getCurrentUser();

      if (!currentUser) {
        router.push(`/auth/login?redirect=/m/${sanitizedUsername}/onboarding`);
        return;
      }

      if (!isMounted.current) return;
      setUser(currentUser);

      const storeData = await OnboardingService.checkStoreStatus(currentUser.id);

      // Redirect verified users or users who have already submitted onboarding terms
      if (storeData?.is_verified === true || storeData?.terms_accepted_at) {
        router.push(`/m/${sanitizedUsername}/store`);
        return;
      }

      // Restore session state safely from local persistence
      const savedState = loadOnboardingState();
      if (savedState && isMounted.current) {
        setState(savedState.state);
        setBiometricState((prev) => ({
          ...prev,
          ...savedState.biometricState,
          videoBlob: null,
        }));
        goToStep(savedState.step);
      }
    } catch (error) {
      console.error('[Onboarding] Auth verification error:', error);
      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          error: 'Failed to authenticate session. Please re-login.',
        }));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [username, router, goToStep]);

  const handleComplete = useCallback(
    async (fallbackVideoUrl?: string) => {
      if (!user?.id) {
        setState((prev) => ({ ...prev, error: 'User session expired. Please refresh and re-login.' }));
        return;
      }

      if (state.isSubmitting) return;

      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      try {
        let finalVideoUrl = fallbackVideoUrl || '';

        // 1. Upload raw videoBlob to cloud storage if present
        if (biometricState.videoBlob) {
          const uploadedUrl = await OnboardingService.uploadVerificationVideo(
            user.id,
            biometricState.videoBlob
          );
          if (uploadedUrl) {
            finalVideoUrl = uploadedUrl;
          }
        }

        if (!finalVideoUrl || finalVideoUrl === 'processing') {
          throw new Error('Verification video recording is missing or invalid.');
        }

        // 2. Persist store configuration safely
        await OnboardingService.createOrUpdateStore({
          user_id: user.id,
          contact_email: state.contactEmail.trim(),
          marketing_email: state.marketingEmail.trim(),
          tiktok_handle: state.tiktok.trim(),
          snapchat_handle: state.snapchat.trim(),
          verification_video_url: finalVideoUrl,
          store_bio: state.storeBio.trim() || undefined,
          is_verified: false,
          terms_accepted_at: new Date().toISOString(),
        });

        clearOnboardingState();
        await OnboardingService.clearOnboardingProgress();

        if (isMounted.current) {
          goToStep('success');
        }
      } catch (error) {
        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            error: error instanceof Error ? error.message : 'Failed to complete onboarding. Please try again.',
            isSubmitting: false,
          }));
        }
      } finally {
        if (isMounted.current) {
          setState((prev) => ({ ...prev, isSubmitting: false }));
        }
      }
    },
    [user?.id, state, biometricState.videoBlob, goToStep]
  );

  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
    setBiometricState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && user) {
      const { videoBlob, ...safeBiometricState } = biometricState;

      saveOnboardingState({
        step: currentStep,
        state,
        biometricState: safeBiometricState as BiometricState,
        timestamp: Date.now(),
      });
    }
  }, [currentStep, state, biometricState, loading, user]);

  return {
    loading,
    user,
    state,
    biometricState,
    currentStep,
    currentIndex,
    canProceed,
    goToStep,
    goToNext,
    goToPrev,
    updateState,
    updateBiometricState,
    handleComplete,
    resetError,
  };
}