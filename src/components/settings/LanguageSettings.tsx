'use client';

import { Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSettings } from '@/hooks/useSettings';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ru', label: 'Русский' },
];

export function LanguageSettings() {
  const t = useTranslations('Settings');
  const { settings, updateSettings } = useSettings();

  const handleLanguageChange = async (lang: string) => {
    await updateSettings({ language: lang });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Globe className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{t('languageTitle')}</h2>
          <p className="text-sm text-zinc-500">{t('languageSubtitle')}</p>
        </div>
      </div>

      <select
        value={settings?.language || 'en'}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white focus:border-blue-500/30 focus:outline-none transition-colors"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-zinc-900 text-white">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}