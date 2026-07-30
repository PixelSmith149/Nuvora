'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepIndicator } from '@/components/shared/StepIndicator';
import { WelcomeStep } from '../steps/WelcomeStep';
import { FinancialStep } from '../steps/FinancialStep';
import { InfoStep } from '../steps/InfoStep';
import { BiometricStep } from '../steps/BiometricStep';
import { TermsStep } from '../steps/TermsStep';
import { SuccessStep } from '../steps/SuccessStep';
import { Step, OnboardingState, BiometricState } from '@/types';
import { OnboardingService } from '@/services/onboardingService'; // Ensure this import path matches your project layout

interface OnboardingModalProps {
  username: string;
  user: any;
  state: OnboardingState;
  biometricState: BiometricState;
  currentStep: Step;
  canProceed: () => boolean;
  onNext: () => void;
  onPrev: () => void;
  updateState: (updates: Partial<OnboardingState>) => void;
  updateBiometricState: (updates: Partial<BiometricState>) => void;
  onComplete: (videoUrl: string) => Promise<void>;
  onResetError: () => void;
}

export function OnboardingModal({
  username,
  user,
  state,
  biometricState,
  currentStep,
  canProceed,
  onNext,
  onPrev,
  updateState,
  updateBiometricState,
  onComplete,
  onResetError,
}: OnboardingModalProps) {
  const router = useRouter();

  const isLastStep = currentStep === 'success';
  const isTermsStep = currentStep === 'terms';
  const isWelcomeStep = currentStep === 'welcome';

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomeStep
            ageConfirmed={state.ageConfirmed}
            onAgeConfirm={(confirmed) => updateState({ ageConfirmed: confirmed })}
          />
        );
      case 'financial':
        return <FinancialStep />;
      case 'info':
        return (
          <InfoStep
            contactEmail={state.contactEmail}
            marketingEmail={state.marketingEmail}
            tiktok={state.tiktok}
            snapchat={state.snapchat}
            storeBio={state.storeBio}
            onUpdate={updateState}
          />
        );
      case 'biometric':
        return (
          <BiometricStep
            username={username}
            userId={user?.id}
            biometricState={biometricState}
            onUpdate={updateBiometricState}
            onComplete={onComplete}
            onError={onResetError}
          />
        );
      case 'terms':
        return (
          <TermsStep
            termsAccepted={state.termsAccepted}
            onTermsAccept={(accepted) => updateState({ termsAccepted: accepted })}
          />
        );
      case 'success':
        return (
          <SuccessStep
            username={username}
            onNavigateToDashboard={() => router.push('/m/global-market')}
            onNavigateToStorefront={() => router.push(`/m/${username}/store`)}
          />
        );
      default:
        return null;
    }
  };

  const handleFinalSubmit = async () => {
  if (!state.termsAccepted || state.isSubmitting) return;

  try {
    updateState({ isSubmitting: true });

    let publicVideoUrl = 'verified';

    if (biometricState.videoBlob && user?.id) {
      // 1. Detect actual MIME type from the recording blob
      const rawType = biometricState.videoBlob.type || 'video/webm';
      
      // Extract the base container (e.g., 'video/webm' or 'video/mp4' without codec parameters)
      const baseType = rawType.split(';')[0].toLowerCase();

      // 2. Map extension based on real content
      let extension = 'webm';
      if (baseType.includes('mp4') || baseType.includes('quicktime')) {
        extension = 'mp4';
      } else if (baseType.includes('ogg')) {
        extension = 'ogv';
      }

      // 3. Construct File keeping the original MIME type intact
      const fileName = `verification_${user.id}_${Date.now()}.${extension}`;
      const file = new File([biometricState.videoBlob], fileName, {
        type: baseType || 'video/webm',
      });

      // 4. Upload to Supabase
      publicVideoUrl = await OnboardingService.uploadVerificationVideo(user.id, file);
    }

    await onComplete(publicVideoUrl);
  } catch (error) {
    console.error('Failed to upload verification video or finish onboarding:', error);
    onResetError();
  } finally {
    updateState({ isSubmitting: false });
  }
};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-[700px] rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl overflow-hidden"
      >
        <div className="flex max-h-[90vh] flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="flex-shrink-0 border-b border-white/5 p-6 pb-4">
            <div id="onboarding-modal-title" className="flex items-center gap-2 text-base font-bold text-white">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Seller Onboarding
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Complete verification to unlock your storefront
            </p>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 pb-4">
            <StepIndicator currentStep={currentStep} />
            <div className="mt-6 min-h-[320px]">{renderStep()}</div>
          </div>

          {/* Modal Controls */}
          {!isLastStep && (
            <div className="flex-shrink-0 border-t border-white/5 p-6 pt-4">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="outline"
                  onClick={isWelcomeStep ? () => router.push(`/m/${username}/account`) : onPrev}
                  disabled={state.isSubmitting}
                  className="h-10 w-full rounded-xl border-white/10 bg-transparent text-xs font-bold text-zinc-400 hover:bg-zinc-900 hover:text-white sm:w-auto"
                >
                  {isWelcomeStep ? (
                    'Cancel'
                  ) : (
                    <div className="flex items-center gap-1">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back
                    </div>
                  )}
                </Button>

                {isTermsStep ? (
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={!state.termsAccepted || state.isSubmitting}
                    className="h-10 w-full rounded-xl bg-emerald-600 px-5 text-xs font-black text-black transition-all hover:bg-emerald-500 disabled:opacity-40 sm:w-auto"
                  >
                    {state.isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading & Verifying...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        Complete Onboarding
                      </div>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={onNext}
                    disabled={!canProceed() || state.isSubmitting}
                    className="h-10 w-full rounded-xl bg-emerald-600 px-5 text-xs font-black text-black transition-all hover:bg-emerald-500 disabled:opacity-40 sm:w-auto"
                  >
                    <div className="flex items-center gap-1.5">
                      Continue
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}