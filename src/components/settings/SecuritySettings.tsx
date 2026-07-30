'use client';

import { useState, useEffect } from 'react';
import { Shield, Fingerprint, Lock, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PasskeyModal } from './PasskeyModal';

interface Passkey {
  id: string;
  name: string;
  device: string;
  createdAt: string;
  lastUsed: string;
}

// Instantiate client outside render cycle to avoid recreation on every render
const supabase = createClient();

export function SecuritySettings() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Password inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [manualSecret, setManualSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);

  // ─── Load User Data, Passkeys & 2FA Status ─────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function loadSecurityData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (isMounted) {
          setUserId(user.id);
          setUserEmail(user.email || null);
        }

        // Fetch passkeys
        const { data, error: passkeyError } = await supabase
          .from('passkeys')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (passkeyError) throw passkeyError;

        if (data && isMounted) {
          setPasskeys(
            data.map((p: any) => ({
              id: p.id,
              name: p.device_name || 'Unknown Device',
              device: p.device_name || 'Unknown',
              createdAt: p.created_at,
              lastUsed: p.last_used || p.created_at,
            }))
          );
        }

        // Fetch 2FA status
        const settingsRes = await fetch('/api/account/settings');
        const settingsData = await settingsRes.json();

        if (settingsRes.ok && settingsData?.settings && isMounted) {
          setTwoFactorEnabled(settingsData.settings.twoFactorEnabled || false);
        }
      } catch (err: any) {
        console.error('Failed to load security settings:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSecurityData();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Start 2FA Setup ───────────────────────────────────────────────────
  const start2FASetup = async () => {
    setIsSettingUp2FA(true);
    setError(null);

    try {
      const res = await fetch('/api/account/2fa/setup', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to start setup');

      setQrCodeDataUrl(data.qrCodeDataUrl);
      setManualSecret(data.secret);
      setShow2FASetup(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSettingUp2FA(false);
    }
  };

  // ─── Verify & Enable / Disable ─────────────────────────────────────────
  const verifyAndToggle2FA = async (action: 'enable' | 'disable') => {
    if (!verifyCode || verifyCode.length < 6) {
      setError('Please enter the 6-digit code from your authenticator app');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/account/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyCode, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setTwoFactorEnabled(data.twoFactorEnabled);
      setSuccess(data.message);
      setTimeout(() => setSuccess(null), 3000);

      // Reset setup UI
      setShow2FASetup(false);
      setQrCodeDataUrl(null);
      setManualSecret(null);
      setVerifyCode('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Change Password (With Re-Authentication) ──────────────────────────
  const changePassword = async () => {
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (userEmail) {
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: currentPassword,
        });

        if (reauthError) {
          throw new Error('Current password is incorrect');
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess('Password updated successfully');
      setTimeout(() => setSuccess(null), 3000);

      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Remove Passkey ────────────────────────────────────────────────────
  const removePasskey = async (passkeyId: string) => {
    if (!confirm('Are you sure you want to remove this passkey?')) return;
    if (!userId) return;

    try {
      const { error: deleteError } = await supabase
        .from('passkeys')
        .delete()
        .eq('id', passkeyId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      setPasskeys((prev) => prev.filter((p) => p.id !== passkeyId));
      setSuccess('Passkey removed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove passkey');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Shield className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Security</h2>
          <p className="text-sm text-zinc-500">Manage your account security</p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg mb-3 border border-red-500/20">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-emerald-400 bg-emerald-500/10 p-3 rounded-lg mb-3 border border-emerald-500/20">
          {success}
        </div>
      )}

      {/* ─── Passkeys ────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-medium text-white">Passkeys</span>
            <span className="text-xs text-zinc-500">({passkeys.length})</span>
          </div>
          <button
            onClick={() => {
              if (!userId) {
                setError('Session not ready. Refresh and try again.');
                return;
              }
              setShowPasskeyModal(true);
            }}
            className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium"
          >
            Add Passkey
          </button>
        </div>

        {passkeys.length === 0 ? (
          <p className="text-sm text-zinc-500">No passkeys added yet</p>
        ) : (
          <div className="space-y-2">
            {passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5"
              >
                <div>
                  <p className="text-sm font-medium text-white">{passkey.name}</p>
                  <p className="text-xs text-zinc-500">
                    Added {new Date(passkey.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => removePasskey(passkey.id)}
                  aria-label="Remove passkey"
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Two-Factor Authentication ──────────────────────────────── */}
      <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
            <p className="text-xs text-zinc-500">
              {twoFactorEnabled
                ? 'Authenticator app is required on login'
                : 'Add an extra layer of security with an authenticator app'}
            </p>
          </div>

          {twoFactorEnabled ? (
            <button
              onClick={() => {
                setShow2FASetup(true);
                setQrCodeDataUrl(null);
                setManualSecret(null);
              }}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors disabled:opacity-50"
            >
              Disable
            </button>
          ) : (
            <button
              onClick={start2FASetup}
              disabled={isSettingUp2FA || isSaving}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSettingUp2FA && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Enable
            </button>
          )}
        </div>

        {/* Setup / Disable Panel */}
        {show2FASetup && (
          <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
            {!twoFactorEnabled && qrCodeDataUrl && (
              <>
                <p className="text-sm text-zinc-300">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
                </p>
                <div className="flex justify-center">
                  <img
                    src={qrCodeDataUrl}
                    alt="2FA QR Code"
                    className="rounded-lg border border-white/10"
                  />
                </div>
                {manualSecret && (
                  <div className="text-center">
                    <p className="text-xs text-zinc-500 mb-1">Or enter this key manually:</p>
                    <code className="text-sm text-emerald-400 bg-black/50 px-3 py-1.5 rounded-lg select-all">
                      {manualSecret}
                    </code>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                {twoFactorEnabled
                  ? 'Enter a code from your authenticator app to disable'
                  : 'Enter the 6-digit code to confirm'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/30 text-sm tracking-widest text-center text-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  verifyAndToggle2FA(twoFactorEnabled ? 'disable' : 'enable')
                }
                disabled={isSaving || verifyCode.length < 6}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
              <button
                onClick={() => {
                  setShow2FASetup(false);
                  setQrCodeDataUrl(null);
                  setManualSecret(null);
                  setVerifyCode('');
                  setError(null);
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Change Password ─────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => {
            setShowChangePassword(!showChangePassword);
            setError(null);
          }}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <Lock className="h-4 w-4" />
          Change Password
        </button>

        {showChangePassword && (
          <div className="mt-3 space-y-3 p-4 rounded-xl bg-black/30 border border-white/5">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/30 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 8 characters)"
                  className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/30 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full p-2.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/30 text-sm"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={changePassword}
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Update Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowChangePassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError(null);
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Passkey Modal ───────────────────────────────────────────── */}
      <PasskeyModal
        isOpen={showPasskeyModal}
        onClose={() => setShowPasskeyModal(false)}
        onPasskeyAdded={(passkey) => {
          setPasskeys((prev) => [passkey, ...prev]);
        }}
      />
    </div>
  );
}