// components/settings/NotificationSettings.tsx
'use client';

import { useState } from 'react';
import { Bell, Mail, Loader2 } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export function NotificationSettings() {
  const { settings, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
   const [error, setError] = useState<string | null>(null);

  const handleToggle = async (key: 'emailNotifications' | 'pushNotifications') => {
  setSaving(true);
  setSuccess(null);
  setError(null);

  const updates = { [key]: !settings[key] };
  const result = await updateSettings(updates);

  if (result?.success) {
    setSuccess('Preferences updated');
    setTimeout(() => setSuccess(null), 3000);
  } else {
    setError(result?.error || 'Failed to update preferences');
    setTimeout(() => setError(null), 3000);
  }

  setSaving(false);
};

  return (
  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/80 via-zinc-950/90 to-black p-7 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">

    {/* Ambient Background */}
    <div className="pointer-events-none absolute inset-0">

      <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-cyan-400/5 blur-3xl" />

      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />

      <div className="absolute left-10 right-10 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

    </div>

    <div className="relative">

      {/* Header */}
      <div className="mb-7 flex items-center gap-4">

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            border
            border-amber-500/20
            bg-gradient-to-br
            from-amber-500/15
            to-orange-500/10
            shadow-[0_0_25px_rgba(245,158,11,0.15)]
          "
        >
          <Bell className="h-6 w-6 text-amber-300" />
        </div>

        <div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Notifications
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Control how Prime Booster keeps you informed.
          </p>

        </div>

      </div>

      {success && (
        <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 backdrop-blur-xl">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-xl">
          {error}
        </div>
      )}

      <div className="space-y-5">

        {/* Email */}

        <div
          className="
            group
            relative
            overflow-hidden
            rounded-2xl
            border
            border-white/5
            bg-gradient-to-b
            from-zinc-900/90
            to-black/90
            p-5
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:border-amber-500/20
            hover:shadow-[0_15px_40px_rgba(245,158,11,0.10)]
          "
        >

          <div className="absolute inset-0">

            <div className="absolute -top-8 right-0 h-28 w-28 rounded-full bg-amber-500/5 blur-3xl transition-all duration-500 group-hover:bg-amber-500/15" />

          </div>

          <div className="relative flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-sky-500/15
                  bg-gradient-to-br
                  from-sky-500/10
                  to-cyan-400/5
                  shadow-[0_0_18px_rgba(56,189,248,0.12)]
                "
              >
                <Mail className="h-5 w-5 text-sky-300" />
              </div>

              <div>

                <p className="font-semibold text-white">
                  Email Notifications
                </p>

                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  Security alerts, product updates and account activity.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-4">

              <span
                className={`text-xs font-medium ${
                  settings.emailNotifications
                    ? "text-emerald-400"
                    : "text-zinc-500"
                }`}
              >
                {settings.emailNotifications ? "Enabled" : "Disabled"}
              </span>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleToggle("emailNotifications")}
                className={`
                  relative
                  h-7
                  w-14
                  rounded-full
                  transition-all
                  duration-300
                  disabled:opacity-50
                  ${
                    settings.emailNotifications
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                      : "border border-zinc-700 bg-zinc-800"
                  }
                `}
              >
                <span
                  className={`
                    absolute
                    top-1
                    h-5
                    w-5
                    rounded-full
                    bg-white
                    shadow-lg
                    transition-all
                    duration-300
                    ${
                      settings.emailNotifications
                        ? "left-8"
                        : "left-1"
                    }
                  `}
                />
              </button>

            </div>

          </div>

          <div className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-cyan-400/20 to-sky-500/20" />

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

        {/* Push */}

        <div
          className="
            group
            relative
            overflow-hidden
            rounded-2xl
            border
            border-white/5
            bg-gradient-to-b
            from-zinc-900/90
            to-black/90
            p-5
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:border-amber-500/20
            hover:shadow-[0_15px_40px_rgba(245,158,11,0.10)]
          "
        >

          <div className="absolute inset-0">

            <div className="absolute -top-8 right-0 h-28 w-28 rounded-full bg-cyan-500/5 blur-3xl transition-all duration-500 group-hover:bg-cyan-400/15" />

          </div>

          <div className="relative flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-amber-500/15
                  bg-gradient-to-br
                  from-amber-500/10
                  to-orange-500/5
                  shadow-[0_0_18px_rgba(245,158,11,0.12)]
                "
              >
                <Bell className="h-5 w-5 text-amber-300" />
              </div>

              <div>

                <p className="font-semibold text-white">
                  Push Notifications
                </p>

                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  Live browser alerts for orders, activity and important events.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-4">

              <span
                className={`text-xs font-medium ${
                  settings.pushNotifications
                    ? "text-emerald-400"
                    : "text-zinc-500"
                }`}
              >
                {settings.pushNotifications ? "Enabled" : "Disabled"}
              </span>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleToggle("pushNotifications")}
                className={`
                  relative
                  h-7
                  w-14
                  rounded-full
                  transition-all
                  duration-300
                  disabled:opacity-50
                  ${
                    settings.pushNotifications
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                      : "border border-zinc-700 bg-zinc-800"
                  }
                `}
              >
                <span
                  className={`
                    absolute
                    top-1
                    h-5
                    w-5
                    rounded-full
                    bg-white
                    shadow-lg
                    transition-all
                    duration-300
                    ${
                      settings.pushNotifications
                        ? "left-8"
                        : "left-1"
                    }
                  `}
                />
              </button>

            </div>

          </div>

          <div className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-400/20 to-amber-500/20" />

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

      </div>

      {saving && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          Saving your notification preferences...
        </div>
      )}

    </div>

  </div>
);
}