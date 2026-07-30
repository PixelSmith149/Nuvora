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
    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Bell className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Notifications</h2>
          <p className="text-sm text-zinc-500">Manage how you receive updates</p>
        </div>
      </div>

      {success && (
        <div className="text-sm text-emerald-400 bg-emerald-500/10 p-2 rounded-lg mb-3">{success}</div>
      )}

      <div className="space-y-3">
        <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 cursor-pointer">
          <div>
            <p className="text-sm font-medium text-white">Email Notifications</p>
            <p className="text-xs text-zinc-500">Receive updates via email</p>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
              disabled={saving}
              className="w-5 h-5 rounded border-white/20 bg-black text-emerald-500 focus:ring-emerald-500/20 disabled:opacity-50"
            />
          </div>
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 cursor-pointer">
          <div>
            <p className="text-sm font-medium text-white">Push Notifications</p>
            <p className="text-xs text-zinc-500">Browser push notifications</p>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
              disabled={saving}
              className="w-5 h-5 rounded border-white/20 bg-black text-emerald-500 focus:ring-emerald-500/20 disabled:opacity-50"
            />
          </div>
        </label>
      </div>

      {saving && (
        <div className="flex items-center gap-2 mt-3 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}