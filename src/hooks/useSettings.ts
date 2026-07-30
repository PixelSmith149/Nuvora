'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Settings {
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'dark' | 'light' | 'system';
}

export function useSettings() {
  // 1. Singleton/Memoized Supabase client instance
  const supabase = useMemo(() => createClient(), []);

  const [settings, setSettings] = useState<Settings>({
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    theme: 'dark',
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // ─── Load settings ──────────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserId(null);
        return;
      }
      
      setUserId(user.id);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('language, email_notifications, push_notifications, theme')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        setSettings({
          language: profile.language || 'en',
          emailNotifications: profile.email_notifications !== false,
          pushNotifications: profile.push_notifications !== false,
          theme: (profile.theme as 'dark' | 'light' | 'system') || 'dark',
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ─── Update settings ───────────────────────────────────────────────
  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    if (!userId) {
      return { success: false, error: 'User is not authenticated' };
    }

    // Build pay-load dynamically so undefined properties aren't sent as NULL
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.language !== undefined) payload.language = updates.language;
    if (updates.emailNotifications !== undefined) payload.email_notifications = updates.emailNotifications;
    if (updates.pushNotifications !== undefined) payload.push_notifications = updates.pushNotifications;
    if (updates.theme !== undefined) payload.theme = updates.theme;

    // Preserve previous state for optimistic rollback if the request fails
    const previousSettings = settings;
    setSettings(prev => ({ ...prev, ...updates }));

    try {
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      // Rollback state on error
      setSettings(previousSettings);
      return { success: false, error: error?.message || 'An error occurred while saving.' };
    }
  }, [userId, supabase, settings]);

  return {
    settings,
    loading,
    updateSettings,
    refresh: loadSettings,
  };
}