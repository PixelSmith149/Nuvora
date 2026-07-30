'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePasskeyVerification } from '@/hooks/usePasskeyVerification';
import { BiometricChallengeModal } from './BiometricChallengeModal';

interface AppLockProviderProps {
  children: ReactNode;
  /** Idle timeout while tab is focused (default 2 min) */
  idleTimeoutMs?: number;
  /** Delay after tab is hidden before lock (default 0 = immediate) */
  leaveTimeoutMs?: number;
}

export function AppLockProvider({
  children,
  idleTimeoutMs = 2 * 60 * 1000,
  leaveTimeoutMs = 0, // immediate when user leaves
}: AppLockProviderProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [ready, setReady] = useState(false);
  const { verifyPasskey, verifying, error: passkeyError, setError } =
    usePasskeyVerification();

  const lockApp = useCallback(async () => {
    setIsLocked(true);
    try {
      await fetch('/api/auth/app-lock', { method: 'POST' });
    } catch {
      // still keep UI locked even if cookie call fails
    }
  }, []);

  const unlockApp = useCallback(() => {
    setIsLocked(false);
    // cookie is cleared by auth-verify on success
  }, []);

  // Restore lock state from server cookie after refresh
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch('/api/auth/app-lock/status');
        const data = await res.json();

        if (!mounted) return;

        setHasPasskey(!!data.hasPasskey);
        if (data.hasPasskey && data.locked) {
          setIsLocked(true);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Idle + leave timers
  useEffect(() => {
    if (!ready || !hasPasskey) return;

    let hiddenTimer: ReturnType<typeof setTimeout> | null = null;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const clearTimers = () => {
      if (hiddenTimer) clearTimeout(hiddenTimer);
      if (idleTimer) clearTimeout(idleTimer);
      hiddenTimer = null;
      idleTimer = null;
    };

    const armIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        void lockApp();
      }, idleTimeoutMs);
    };

    const onVisibility = () => {
      if (document.hidden) {
        // Leave app → lock immediately (or after leaveTimeoutMs)
        if (hiddenTimer) clearTimeout(hiddenTimer);
        hiddenTimer = setTimeout(() => {
          void lockApp();
        }, leaveTimeoutMs);
      } else {
        if (hiddenTimer) clearTimeout(hiddenTimer);
        if (!isLocked) armIdle();
      }
    };

    const onActivity = () => {
      if (!isLocked) armIdle();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pointerdown', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('scroll', onActivity, { passive: true });

    if (!isLocked) armIdle();

    return () => {
      clearTimers();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('scroll', onActivity);
    };
  }, [ready, hasPasskey, idleTimeoutMs, leaveTimeoutMs, isLocked, lockApp]);

  const handleUnlock = useCallback(async () => {
    setError(null);
    const ok = await verifyPasskey();
    if (ok) unlockApp();
  }, [verifyPasskey, setError, unlockApp]);

  // Clear on logout
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setIsLocked(false);
        setHasPasskey(false);
        try {
          await fetch('/api/auth/app-lock', { method: 'DELETE' });
        } catch {
          // ignore
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {children}

      <BiometricChallengeModal
        isOpen={isLocked && hasPasskey}
        onVerify={handleUnlock}
        loading={verifying}
        error={passkeyError}
        title="App Locked"
        description="Verify your biometrics to return to your workspace."
        allowCancel={false}
      />
    </>
  );
}