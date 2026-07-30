'use client';

import { useEffect, useRef } from 'react';
import { Fingerprint, Loader2, ShieldCheck } from 'lucide-react';

interface BiometricChallengeModalProps {
  isOpen: boolean;
  onVerify: () => void;
  loading: boolean;
  error: string | null;
  title?: string;
  description?: string;
  allowCancel?: boolean;
  onCancel?: () => void;
  /** Auto-start WebAuthn when modal opens (default true) */
  autoStart?: boolean;
}

export function BiometricChallengeModal({
  isOpen,
  onVerify,
  loading,
  error,
  title = 'Biometric Security Check',
  description = 'Verify with Touch ID, Face ID, or Windows Hello to continue.',
  allowCancel = false,
  onCancel,
  autoStart = true,
}: BiometricChallengeModalProps) {
  const hasAutoStarted = useRef(false);

  // Auto-trigger platform authenticator as soon as lock appears
  useEffect(() => {
    if (!isOpen) {
      hasAutoStarted.current = false;
      return;
    }

    if (!autoStart || hasAutoStarted.current || loading) return;

    hasAutoStarted.current = true;

    // Short delay so the modal paints first, then OS sheet opens
    const t = setTimeout(() => {
      onVerify();
    }, 150);

    return () => clearTimeout(t);
  }, [isOpen, autoStart, loading, onVerify]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-zinc-950 p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
          <Fingerprint
            className={`h-8 w-8 text-emerald-400 ${loading ? 'animate-pulse' : ''}`}
          />
        </div>

        <div className="space-y-1">
          <h3 className="flex items-center justify-center gap-2 text-xl font-bold text-white">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            {title}
          </h3>
          <p className="text-xs text-zinc-400">
            {loading
              ? 'Waiting for Face ID, Touch ID, or Windows Hello…'
              : description}
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {/* Fallback only — primary path is auto-start */}
          <button
            type="button"
            onClick={onVerify}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950 transition-all hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning biometrics…
              </>
            ) : (
              <>
                <Fingerprint className="h-4 w-4" />
                {error ? 'Try again' : 'Unlock with Passkey'}
              </>
            )}
          </button>

          {allowCancel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full rounded-xl bg-zinc-900 py-2.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}