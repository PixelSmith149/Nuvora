// app/account/settings/page.tsx
'use client';

import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { LanguageSettings } from '@/components/settings/LanguageSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { AccountManagementSettings } from '@/components/settings/AccountManagementSettings';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your account preferences and security</p>
        </div>

        {/* ─── Settings Cards ──────────────────────────────────────────── */}
        <div className="space-y-6">
          <AppearanceSettings />
          <LanguageSettings />
          <SecuritySettings />
          <NotificationSettings />
          <AccountManagementSettings />
        </div>

        {/* ─── Footer ───────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-zinc-600 mt-8">
          <p>Settings are saved automatically</p>
        </div>
      </div>
    </div>
  );
}