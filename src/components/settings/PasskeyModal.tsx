'use client';

import { useState } from 'react';
import { X, Loader2, Fingerprint } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';

interface PasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasskeyAdded: (passkey: {
    id: string;
    name: string;
    device: string;
    createdAt: string;
    lastUsed: string;
  }) => void;
}

export function PasskeyModal({
  isOpen,
  onClose,
  onPasskeyAdded,
}: PasskeyModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = async () => {
    const cleanName = name.trim().slice(0, 64);

    if (!cleanName) {
      setError('Please enter a device name.');
      return;
    }

    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      setError('WebAuthn / passkeys are not supported on this browser or device.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1) Options — session is read from cookies on the server
      const resOptions = await fetch('/api/auth/passkey/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const options = await resOptions.json();
      if (!resOptions.ok || options.error) {
        throw new Error(options.error || 'Failed to initialize passkey setup.');
      }

      // 2) Browser / OS biometric prompt
      const credential = await startRegistration({ optionsJSON: options });

      // 3) Verify + store
      const resVerify = await fetch('/api/auth/passkey/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential,
          deviceName: cleanName,
        }),
      });

      const verifyData = await resVerify.json();
      if (!resVerify.ok || verifyData.error) {
        throw new Error(verifyData.error || 'Failed to verify passkey.');
      }

      const userAgent = navigator.userAgent;
      const deviceLabel = userAgent.includes('Mac')
        ? 'Mac'
        : userAgent.includes('Windows')
          ? 'Windows'
          : userAgent.includes('Android') || userAgent.includes('iPhone')
            ? 'Mobile'
            : 'Other Device';

      const now = new Date().toISOString();

      onPasskeyAdded({
        id: verifyData.passkeyId || credential.id,
        name: cleanName,
        device: deviceLabel,
        createdAt: now,
        lastUsed: now,
      });

      setName('');
      onClose();
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.message?.includes('cancelled')) {
        setError('Passkey creation was cancelled or timed out.');
      } else if (err.name === 'InvalidStateError') {
        setError('This passkey or device is already registered.');
      } else {
        setError(err.message || 'Failed to complete passkey setup.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    if (loading) return;
    setError(null);
    setName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleModalClose();
      }}
    >
      <div
        className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Fingerprint className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add Passkey</h3>
              <p className="text-sm text-zinc-500">Biometric security for this account</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 p-2.5 border border-red-500/20 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Device Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 64))}
              placeholder="e.g. Work MacBook Pro"
              disabled={loading}
              maxLength={64}
              className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/30 text-sm disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Fingerprint className="h-4 w-4" />
                  Create Passkey
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleModalClose}
              disabled={loading}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors text-sm disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-zinc-500 text-center">
            Your passkey is stored in this device&apos;s secure hardware (Touch ID / Face ID / Windows Hello).
          </p>
        </div>
      </div>
    </div>
  );
}