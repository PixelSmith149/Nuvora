// components/settings/AppearanceSettings.tsx
'use client';

import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useSettings } from '@/hooks/useSettings';

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { updateSettings } = useSettings();

  const handleThemeChange = async (newTheme: 'dark' | 'light' | 'system') => {
    setTheme(newTheme);
    await updateSettings({ theme: newTheme });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <Moon className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Appearance</h2>
          <p className="text-sm text-zinc-500">Customize how the platform looks</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleThemeChange('dark')}
          className={`p-4 rounded-xl border-2 transition-all text-center ${
            theme === 'dark'
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <Moon className="h-6 w-6 mx-auto mb-2 text-white" />
          <p className="text-sm font-medium text-white">Dark</p>
        </button>
        <button
          onClick={() => handleThemeChange('light')}
          className={`p-4 rounded-xl border-2 transition-all text-center ${
            theme === 'light'
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <Sun className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
          <p className="text-sm font-medium text-white">Light</p>
        </button>
        <button
          onClick={() => handleThemeChange('system')}
          className={`p-4 rounded-xl border-2 transition-all text-center ${
            theme === 'system'
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <Laptop className="h-6 w-6 mx-auto mb-2 text-zinc-400" />
          <p className="text-sm font-medium text-white">System</p>
        </button>
      </div>
    </div>
  );
}