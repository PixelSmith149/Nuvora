'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { OnboardingModal } from '@/components/market/OnboardingModal';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function OnboardingPage() {
  const params = useParams();
  const username = (params?.username as string) || '';

  const {
    loading,
    user,
    state,
    biometricState,
    currentStep,
    canProceed,
    goToNext,
    goToPrev,
    updateState,
    updateBiometricState,
    handleComplete,
    resetError,
  } = useOnboarding(username);

  if (loading || !username) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-xs font-medium text-zinc-500">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <OnboardingModal
        username={username}
        user={user}
        state={state}
        biometricState={biometricState}
        currentStep={currentStep}
        canProceed={canProceed}
        onNext={goToNext}
        onPrev={goToPrev}
        updateState={updateState}
        updateBiometricState={updateBiometricState}
        onComplete={handleComplete}
        onResetError={resetError}
      />
    </main>
  );
}