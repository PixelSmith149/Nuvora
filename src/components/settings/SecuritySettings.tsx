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
     {/* ───────────────────────── Security Header ───────────────────────── */}

<div className="relative mb-7 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/70 via-zinc-950/90 to-black/90 p-6 backdrop-blur-2xl">

  {/* Ambient Lighting */}
  <div className="pointer-events-none absolute inset-0">

    <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

    <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-cyan-400/5 blur-3xl" />

    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />

    <div className="absolute left-10 right-10 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

  </div>

  <div className="relative flex items-center justify-between">

    <div className="flex items-center gap-5">

      <div
        className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          border
          border-emerald-500/20
          bg-gradient-to-br
          from-emerald-500/15
          to-cyan-400/10
          shadow-[0_0_28px_rgba(16,185,129,0.16)]
        "
      >
        <Shield className="h-7 w-7 text-emerald-300" />
      </div>

      <div>

        <div className="flex items-center gap-3">

          <h2 className="text-2xl font-bold tracking-tight text-white">
            Security Center
          </h2>

          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Protected
          </span>

        </div>

        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
          Protect your account with passkeys, two-factor authentication,
          password management and advanced authentication controls.
        </p>

      </div>

    </div>

  </div>

</div>

{/* ───────────────────────── Status Messages ───────────────────────── */}

{error && (
  <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 to-red-500/5 px-4 py-3 backdrop-blur-xl">

    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
      <Shield className="h-5 w-5 text-red-400" />
    </div>

    <div>

      <p className="text-sm font-semibold text-red-300">
        Security Action Failed
      </p>

      <p className="mt-0.5 text-sm text-red-400/90">
        {error}
      </p>

    </div>

  </div>
)}

{success && (
  <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/5 px-4 py-3 backdrop-blur-xl">

    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
      <Shield className="h-5 w-5 text-emerald-300" />
    </div>

    <div>

      <p className="text-sm font-semibold text-emerald-300">
        Security Updated
      </p>

      <p className="mt-0.5 text-sm text-emerald-400/90">
        {success}
      </p>

    </div>

  </div>
)}

      {/* ───────────────────────── Passkey Vault ───────────────────────── */}

<div className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/70 via-zinc-950/90 to-black/90 p-6 backdrop-blur-2xl">

  {/* Ambient Background */}
  <div className="pointer-events-none absolute inset-0">

    <div className="absolute -top-16 right-0 h-44 w-44 rounded-full bg-emerald-500/8 blur-3xl" />

    <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-cyan-400/5 blur-3xl" />

    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />

    <div className="absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

  </div>

  <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

    {/* Left */}

    <div className="flex items-start gap-4">

      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          border
          border-emerald-500/20
          bg-gradient-to-br
          from-emerald-500/15
          to-cyan-400/10
          shadow-[0_0_22px_rgba(16,185,129,0.14)]
        "
      >
        <Fingerprint className="h-6 w-6 text-emerald-300" />
      </div>

      <div>

        <div className="flex flex-wrap items-center gap-3">

          <h3 className="text-xl font-bold tracking-tight text-white">
            Passkey Vault
          </h3>

          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            {passkeys.length} Registered
          </span>

        </div>

        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
          Passkeys provide passwordless authentication using your device's
          biometric security or hardware security keys.
        </p>

      </div>

    </div>

    {/* Right */}

    <button
      onClick={() => {
        if (!userId) {
          setError("Session not ready. Refresh and try again.");
          return;
        }
        setShowPasskeyModal(true);
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-emerald-500/20
        bg-gradient-to-r
        from-emerald-500
        via-emerald-500
        to-cyan-500
        px-5
        py-3
        text-sm
        font-semibold
        text-white
        shadow-[0_12px_35px_rgba(16,185,129,0.25)]
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_18px_45px_rgba(16,185,129,0.35)]
        active:scale-[0.98]
      "
    >

      <span
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-transparent
          via-white/25
          to-transparent
          translate-x-[-120%]
          group-hover:translate-x-[120%]
          transition-transform
          duration-700
        "
      />

      <span className="relative flex items-center gap-2">

        <Fingerprint className="h-4 w-4" />

        Add Passkey

      </span>

    </button>

  </div>


        {passkeys.length === 0 ? (
  <div className="relative overflow-hidden rounded-3xl border border-dashed border-white/10 bg-gradient-to-b from-zinc-900/60 via-zinc-950/80 to-black/80 p-10 text-center">

    {/* Ambient */}
    <div className="pointer-events-none absolute inset-0">

      <div className="absolute -top-12 right-0 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-cyan-400/5 blur-3xl" />

    </div>

    <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 to-cyan-400/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]">

      <Fingerprint className="h-9 w-9 text-emerald-300" />

    </div>

    <h4 className="relative mt-6 text-xl font-bold text-white">
      No Passkeys Registered
    </h4>

    <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
      Add your first passkey to enable passwordless sign in using your
      fingerprint, Face ID, Windows Hello or a hardware security key.
    </p>

  </div>
) : (
  <div className="space-y-4">

    {passkeys.map((passkey) => (

      <div
        key={passkey.id}
        className="
          group
          relative
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          bg-gradient-to-b
          from-zinc-900/80
          via-zinc-950/90
          to-black
          p-5
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-emerald-500/20
          hover:shadow-[0_18px_45px_rgba(16,185,129,0.10)]
        "
      >

        {/* Ambient */}

        <div className="absolute inset-0">

          <div className="absolute -top-10 right-0 h-28 w-28 rounded-full bg-emerald-500/5 blur-3xl transition-all duration-500 group-hover:bg-emerald-500/15" />

          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-cyan-400/5 blur-2xl transition-all duration-500 group-hover:bg-cyan-400/10" />

        </div>

        <div className="relative flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border
                border-emerald-500/20
                bg-gradient-to-br
                from-emerald-500/15
                to-cyan-400/10
                shadow-[0_0_20px_rgba(16,185,129,0.15)]
              "
            >
              <Fingerprint className="h-6 w-6 text-emerald-300" />
            </div>

            <div>

              <div className="flex items-center gap-3">

                <p className="text-base font-semibold text-white">
                  {passkey.name}
                </p>

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  Active
                </span>

              </div>

              <p className="mt-2 text-sm text-zinc-500">
                Registered on{" "}
                {new Date(passkey.createdAt).toLocaleDateString()}
              </p>

            </div>

          </div>

          <button
            onClick={() => removePasskey(passkey.id)}
            aria-label="Remove passkey"
            className="
              group/remove
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              border
              border-white/5
              bg-zinc-900/70
              text-zinc-500
              transition-all
              duration-300
              hover:border-red-500/20
              hover:bg-red-500/10
              hover:text-red-400
              hover:shadow-[0_0_25px_rgba(239,68,68,0.20)]
            "
          >

            <Trash2 className="h-5 w-5 transition-transform duration-300 group-hover/remove:scale-110" />

          </button>

        </div>

        {/* Bottom Accent */}

        <div className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden">

          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-400/20 to-emerald-500/20" />

          <div
            className="
              absolute
              left-[-40%]
              top-0
              h-full
              w-[40%]
              bg-gradient-to-r
              from-transparent
              via-white/60
              to-transparent
              animate-[shine_4s_linear_infinite]
            "
          />

        </div>

      </div>

    ))}

  </div>
)}
      </div>

      {/* ─── Two-Factor Authentication ──────────────────────────────── */}
      <div className="
  group
  relative
  mb-6
  overflow-hidden
  rounded-3xl
  border
  border-white/10
  bg-gradient-to-b
  from-zinc-900/80
  via-zinc-950/90
  to-black
  p-5
  backdrop-blur-2xl
  transition-all
  duration-300
  hover:border-emerald-500/20
  hover:shadow-[0_18px_45px_rgba(16,185,129,0.08)]
">

  {/* Ambient Glow */}
  <div className="pointer-events-none absolute inset-0">

    <div className="
      absolute
      -top-12
      right-0
      h-40
      w-40
      rounded-full
      bg-emerald-500/10
      blur-3xl
      transition-all
      duration-500
      group-hover:bg-emerald-500/20
    " />

    <div className="
      absolute
      bottom-0
      left-0
      h-32
      w-32
      rounded-full
      bg-cyan-400/5
      blur-3xl
    " />

  </div>


  <div className="relative">

    {/* Header */}
    <div className="flex items-center justify-between gap-4">

      <div className="flex items-center gap-4">

        <div className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          border
          border-emerald-500/20
          bg-gradient-to-br
          from-emerald-500/15
          to-cyan-400/10
          shadow-[0_0_22px_rgba(16,185,129,0.15)]
        ">
          <Shield className="h-5 w-5 text-emerald-300" />
        </div>


        <div>

          <div className="flex items-center gap-3">

            <p className="text-base font-semibold text-white">
              Two-Factor Authentication
            </p>


            <span
              className={`
                rounded-full
                px-2.5
                py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-wider
                ${
                  twoFactorEnabled
                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border border-zinc-700 bg-zinc-800/70 text-zinc-400"
                }
              `}
            >
              {twoFactorEnabled ? "Protected" : "Disabled"}
            </span>

          </div>


          <p className="mt-1 text-xs text-zinc-500">
            {twoFactorEnabled
              ? "Authenticator verification is required during login."
              : "Add an extra security layer with an authenticator app."}
          </p>

        </div>

      </div>


      {/* Action Button */}

      {twoFactorEnabled ? (

        <button
          onClick={() => {
            setShow2FASetup(true);
            setQrCodeDataUrl(null);
            setManualSecret(null);
          }}
          disabled={isSaving}
          className="
            rounded-xl
            border
            border-red-500/20
            bg-red-500/10
            px-4
            py-2
            text-sm
            font-semibold
            text-red-300
            transition-all
            duration-300
            hover:bg-red-500/20
            hover:shadow-[0_0_25px_rgba(239,68,68,0.15)]
            disabled:opacity-50
          "
        >
          Disable
        </button>

      ) : (

        <button
          onClick={start2FASetup}
          disabled={isSettingUp2FA || isSaving}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-gradient-to-r
            from-emerald-500
            to-cyan-500
            px-5
            py-2
            text-sm
            font-semibold
            text-white
            shadow-[0_10px_25px_rgba(16,185,129,0.25)]
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:shadow-[0_15px_35px_rgba(16,185,129,0.35)]
            disabled:opacity-50
          "
        >
          {isSettingUp2FA && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          Enable

        </button>

      )}

    </div>


    {/* Setup Panel */}

    {show2FASetup && (

      <div className="
        mt-5
        space-y-5
        rounded-2xl
        border
        border-white/10
        bg-black/40
        p-5
        backdrop-blur-xl
      ">


        {!twoFactorEnabled && qrCodeDataUrl && (

          <>

            <p className="text-sm leading-relaxed text-zinc-400">
              Scan this QR code with your authenticator application
              (Google Authenticator, Authy, 1Password, etc.)
            </p>


            <div className="
              flex
              justify-center
              rounded-2xl
              border
              border-white/10
              bg-zinc-900/50
              p-5
            ">

              <img
                src={qrCodeDataUrl}
                alt="2FA QR Code"
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white
                  p-3
                  shadow-xl
                "
              />

            </div>


            {manualSecret && (

              <div className="text-center">

                <p className="mb-2 text-xs text-zinc-500">
                  Or enter this key manually
                </p>


                <code className="
                  inline-block
                  rounded-xl
                  border
                  border-emerald-500/20
                  bg-emerald-500/5
                  px-4
                  py-2
                  font-mono
                  text-sm
                  tracking-widest
                  text-emerald-300
                  select-all
                ">
                  {manualSecret}
                </code>

              </div>

            )}

          </>

        )}



        <div>

          <label className="
            mb-2
            block
            text-xs
            font-medium
            text-zinc-400
          ">
            {twoFactorEnabled
              ? "Enter your authenticator code to disable protection"
              : "Enter the 6-digit verification code"}
          </label>


          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={verifyCode}
            onChange={(e) =>
              setVerifyCode(
                e.target.value.replace(/\D/g, "")
              )
            }
            placeholder="000000"
            className="
              w-full
              rounded-2xl
              border
              border-white/10
              bg-zinc-900/80
              px-4
              py-4
              text-center
              text-2xl
              font-semibold
              tracking-[0.5em]
              text-white
              placeholder-zinc-700
              outline-none
              transition-all
              focus:border-emerald-500/40
              focus:ring-4
              focus:ring-emerald-500/10
            "
          />

        </div>



        <div className="flex gap-3">

          <button
            onClick={() =>
              verifyAndToggle2FA(
                twoFactorEnabled ? "disable" : "enable"
              )
            }
            disabled={isSaving || verifyCode.length < 6}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-emerald-500
              to-cyan-500
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-[0_10px_25px_rgba(16,185,129,0.2)]
              transition-all
              hover:shadow-[0_15px_35px_rgba(16,185,129,0.3)]
              disabled:opacity-50
            "
          >

            {isSaving && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {twoFactorEnabled
              ? "Disable 2FA"
              : "Enable 2FA"}

          </button>



          <button
            onClick={() => {
              setShow2FASetup(false);
              setQrCodeDataUrl(null);
              setManualSecret(null);
              setVerifyCode("");
              setError(null);
            }}
            className="
              rounded-xl
              border
              border-white/10
              bg-zinc-900
              px-5
              py-2.5
              text-sm
              font-medium
              text-zinc-300
              transition-all
              hover:border-white/20
              hover:bg-zinc-800
              hover:text-white
            "
          >
            Cancel
          </button>

        </div>


      </div>

    )}

  </div>

</div>
    {/* ─── Change Password ─────────────────────────────────────────── */}
<div className="
  group
  relative
  overflow-hidden
  rounded-2xl
  border
  border-white/10
  bg-gradient-to-b
  from-zinc-900/70
  via-zinc-950
  to-black
  transition-all
  duration-300
  hover:border-emerald-500/20
">

  {/* Ambient glow */}
  <div className="
    pointer-events-none
    absolute
    -right-10
    top-0
    h-32
    w-32
    rounded-full
    bg-emerald-500/10
    blur-3xl
    opacity-0
    transition-opacity
    duration-500
    group-hover:opacity-100
  " />


  <button
    onClick={() => {
      setShowChangePassword(!showChangePassword);
      setError(null);
    }}
    className="
      relative
      flex
      w-full
      items-center
      justify-between
      px-5
      py-4
      text-left
      transition-all
    "
  >

    <div className="flex items-center gap-4">

      <div className="
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-xl
        border
        border-emerald-500/20
        bg-emerald-500/10
        shadow-[0_0_20px_rgba(16,185,129,0.12)]
      ">
        <Lock className="h-5 w-5 text-emerald-300" />
      </div>


      <div>

        <p className="text-sm font-semibold text-white">
          Change Password
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          Update your account credentials securely
        </p>

      </div>

    </div>


    <div className="
      rounded-full
      border
      border-white/10
      bg-zinc-900
      px-3
      py-1
      text-xs
      text-zinc-400
      transition-all
      group-hover:border-emerald-500/20
      group-hover:text-emerald-300
    ">
      {showChangePassword ? "Close" : "Manage"}
    </div>

  </button>



  {showChangePassword && (

    <div className="
      relative
      border-t
      border-white/10
      bg-black/30
      p-5
      space-y-5
      animate-in
      fade-in
      slide-in-from-top-2
      duration-300
    ">


      {/* Current Password */}

      <div>

        <label className="
          mb-2
          block
          text-xs
          font-medium
          text-zinc-400
        ">
          Current Password
        </label>


        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          className="
            w-full
            rounded-xl
            border
            border-white/10
            bg-zinc-900/80
            px-4
            py-3
            text-sm
            text-white
            placeholder-zinc-600
            outline-none
            transition-all
            focus:border-emerald-500/40
            focus:ring-4
            focus:ring-emerald-500/10
          "
        />

      </div>



      {/* New Password */}

      <div>

        <label className="
          mb-2
          block
          text-xs
          font-medium
          text-zinc-400
        ">
          New Password
        </label>


        <div className="relative">

          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e)=>setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="
              w-full
              rounded-xl
              border
              border-white/10
              bg-zinc-900/80
              px-4
              py-3
              pr-12
              text-sm
              text-white
              placeholder-zinc-600
              outline-none
              transition-all
              focus:border-emerald-500/40
              focus:ring-4
              focus:ring-emerald-500/10
            "
          />


          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              rounded-lg
              p-1.5
              text-zinc-500
              transition-colors
              hover:bg-white/5
              hover:text-white
            "
          >
            {showPassword
              ? <EyeOff className="h-4 w-4" />
              : <Eye className="h-4 w-4" />
            }

          </button>

        </div>

      </div>



      {/* Confirm Password */}

      <div>

        <label className="
          mb-2
          block
          text-xs
          font-medium
          text-zinc-400
        ">
          Confirm New Password
        </label>


        <input
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e)=>setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="
            w-full
            rounded-xl
            border
            border-white/10
            bg-zinc-900/80
            px-4
            py-3
            text-sm
            text-white
            placeholder-zinc-600
            outline-none
            transition-all
            focus:border-emerald-500/40
            focus:ring-4
            focus:ring-emerald-500/10
          "
        />

      </div>



      {/* Actions */}

      <div className="flex gap-3 pt-2">


        <button
          onClick={changePassword}
          disabled={isSaving}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-gradient-to-r
            from-emerald-500
            to-cyan-500
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-[0_10px_25px_rgba(16,185,129,0.25)]
            transition-all
            hover:shadow-[0_15px_35px_rgba(16,185,129,0.35)]
            disabled:opacity-50
          "
        >

          {isSaving &&
            <Loader2 className="h-4 w-4 animate-spin" />
          }

          Update Password

        </button>



        <button
          type="button"
          onClick={()=>{
            setShowChangePassword(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setError(null);
          }}
          className="
            rounded-xl
            border
            border-white/10
            bg-zinc-900
            px-5
            py-2.5
            text-sm
            font-medium
            text-zinc-300
            transition-all
            hover:border-white/20
            hover:bg-zinc-800
            hover:text-white
          "
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