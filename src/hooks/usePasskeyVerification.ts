'use client';

import { useState, useCallback } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';

export function usePasskeyVerification() {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyPasskey = useCallback(async (): Promise<boolean> => {
    setVerifying(true);
    setError(null);

    try {
      if (typeof window === 'undefined' || !window.PublicKeyCredential) {
        throw new Error('Passkeys are not supported on this browser or device.');
      }

      const resOptions = await fetch('/api/auth/passkey/auth-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const options = await resOptions.json();
      if (!resOptions.ok || options.error) {
        throw new Error(options.error || 'Failed to start passkey verification.');
      }

      const credential = await startAuthentication({ optionsJSON: options });

      const resVerify = await fetch('/api/auth/passkey/auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const data = await resVerify.json();
      if (!resVerify.ok || data.error) {
        throw new Error(data.error || 'Passkey verification failed.');
      }

      return true;
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.message?.includes('cancelled')) {
        setError('Verification cancelled or timed out.');
      } else {
        setError(err?.message || 'Passkey verification failed.');
      }
      return false;
    } finally {
      setVerifying(false);
    }
  }, []);

  return { verifyPasskey, verifying, error, setError };
}