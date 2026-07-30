'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePasskeyVerification } from '@/hooks/usePasskeyVerification';
import { BiometricChallengeModal } from '@/components/auth/BiometricChallengeModal'; // adjust path

export default function PasskeyChallengePage() {
  const router = useRouter();
  const { verifyPasskey, verifying, error, setError } = usePasskeyVerification();

  const handleVerify = useCallback(async () => {
  setError(null);
  const ok = await verifyPasskey();
  if (ok) {
    router.replace('/account');
    router.refresh();
  }
}, [verifyPasskey, setError, router]);

  return (
    <div className="min-h-screen bg-zinc-950">
      <BiometricChallengeModal
        isOpen={true}
        onVerify={handleVerify}
        loading={verifying}
        error={error}
        title="App Locked"
        description="Verify your biometrics to return to your workspace."
        allowCancel={false}
      />
    </div>
  );
}