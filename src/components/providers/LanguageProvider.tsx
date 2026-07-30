'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useSettings } from '@/hooks/useSettings';
import { useEffect } from 'react';

// Using `@/messages` points directly to `C:\nu-vora\messages`
import en from '@/../messages/en.json';
import es from '@/../messages/es.json';
import fr from '@/../messages/fr.json';
import de from '@/../messages/de.json';
import pt from '@/../messages/pt.json';
import ar from '@/../messages/ar.json';
import zh from '@/../messages/zh.json';
import ja from '@/../messages/ja.json';
import ru from '@/../messages/ru.json';

const dictionaries: Record<string, any> = { en, es, fr, de, pt, ar, zh, ja, ru };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  
  // Normalize language code to lowercase (e.g. 'fr' or 'FR')
  const lang = (settings?.language || 'en').toLowerCase();
  
  // Fallback to English if key doesn't exist
  const messages = dictionaries[lang] || dictionaries.en;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  return (
    <NextIntlClientProvider locale={lang} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
