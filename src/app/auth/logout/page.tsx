'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, LogOut } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'signing-out' | 'done' | 'error'>('signing-out');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function signOutFully() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );

        // 1. End Supabase session
        const { error: signOutError } = await supabase.auth.signOut();

        if (signOutError) {
          throw signOutError;
        }

        // 2. Clear app-lock cookie (server)
        try {
          await fetch('/api/auth/app-lock', { method: 'DELETE' });
        } catch {
          // non-blocking
        }

        // 3. Clear client-readable leftovers
        try {
          document.cookie = 'passkey_unlocked=; path=/; max-age=0';
          sessionStorage.removeItem('nu_vora_app_locked');
        } catch {
          // ignore
        }

        if (cancelled) return;

        setStatus('done');

        // 4. Hard navigation so proxy/middleware sees no session
        router.replace('/login');
        router.refresh();
      } catch (err: any) {
        if (cancelled) return;
        console.error('[logout]', err);
        setError(err?.message || 'Failed to sign out');
        setStatus('error');
      }
    }

    void signOutFully();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10">
          {status === 'signing-out' ? (
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          ) : status === 'error' ? (
            <LogOut className="h-6 w-6 text-red-400" />
          ) : (
            <LogOut className="h-6 w-6 text-emerald-400" />
          )}
        </div>

        <h1 className="text-xl font-bold text-white">
          {status === 'signing-out' && 'Signing you out…'}
          {status === 'done' && 'Signed out'}
          {status === 'error' && 'Sign out failed'}
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          {status === 'signing-out' && 'Clearing your session securely.'}
          {status === 'done' && 'Redirecting to login.'}
          {status === 'error' && (error || 'Something went wrong.')}
        </p>

        {status === 'error' && (
          <button
            type="button"
            onClick={() => {
              setStatus('signing-out');
              setError(null);
              window.location.href = '/logout';
            }}
            className="mt-6 w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 py-2.5 text-sm font-medium text-white transition-colors"
          >
            Try again
          </button>
        )}

        {status === 'error' && (
          <button
            type="button"
            onClick={() => {
              window.location.href = '/login';
            }}
            className="mt-3 w-full py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Go to login
          </button>
        )}
      </div>
    </div>
  );
}