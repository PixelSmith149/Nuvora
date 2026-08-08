// components/referral/ReferralDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Copy, Check, Users, Loader2, Link2, Wallet, Share2, Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function ReferralDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [customCode, setCustomCode] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);


  // ─── Get user ──────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // ─── Periodically check for completions ──────────────────────────
  useEffect(() => {
    if (!user) return;

    const checkCompletions = async () => {
      try {
        const res = await fetch('/api/referral/check-completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.processed > 0) {
            loadData();
          }
        }
      } catch (error) {
        console.debug('Referral check failed:', error);
      }
    };

    const interval = setInterval(checkCompletions, 30000);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkCompletions();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Safe extraction helper for referral code regardless of API structure
  const extractCode = (data: any): string => {
    if (!data) return '';
    if (typeof data.referralCode === 'string') return data.referralCode;
    if (typeof data.code === 'string') return data.code;
    if (data.referralCode?.code) return data.referralCode.code;
    if (data.referral_code) return data.referral_code;
    if (data.data?.code) return data.data.code;
    return '';
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const codeRes = await fetch('/api/referral/generate-code');
      if (codeRes.ok) {
        const codeData = await codeRes.json();
        const extracted = extractCode(codeData);
        if (extracted) setReferralCode(extracted);
      }

      const statsRes = await fetch('/api/referral/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      const listRes = await fetch('/api/referral/list');
      if (listRes.ok) {
        const listData = await listRes.json();
        setReferrals(listData.referrals || []);
      }
    } catch (err: any) {
      console.error('Failed to load referral data:', err);
      setError('Failed to load referral data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/referral/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customCode: customCode.trim() || undefined }),
      });

      const data = await res.json();

     if (!res.ok) {
  throw new Error(data.error || 'Failed to generate code');
}

      const newCode = extractCode(data);

      if (!newCode) {
        throw new Error('Server returned an invalid referral code format.');
      }

      setReferralCode(newCode);
      setSuccess(`✅ Referral code "${newCode}" generated successfully!`);
      setCustomCode('');
      toast.success('Referral code generated successfully!');
      loadData();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = () => {
  const fullLink = `https://nu-vora.app/signup?ref=${referralCode}`;
  navigator.clipboard.writeText(fullLink);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
  toast.success('Referral link copied to clipboard!');
};

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
      completed: { label: 'Completed', className: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
      rewarded: { label: 'Rewarded', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
      expired: { label: 'Expired', className: 'bg-red-500/15 text-red-400 border-red-500/25' },
    };
    return badges[status] || badges.pending;
  };

  if (loading && !stats && referrals.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
      <p className="text-sm text-zinc-500">Loading your referral dashboard...</p>
    </div>
  );
}

  const referralBalance = stats?.referral_balance ?? stats?.available_balance ?? 0;
  const totalReferrals = stats?.total_referrals || 0;
  const successfulReferrals = referrals.filter(
  (r) => r.status === 'rewarded' || r.status === 'completed'
).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 px-1">
      {/* ─── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Refer & Earn
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            Share your link and earn rewards when friends join
          </p>
        </div>
      </div>

      {/* ─── Messages ────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <p className="text-sm text-emerald-400">{success}</p>
        </div>
      )}

      {/* ─── Metrics Grid (Mobile-first) ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Balance - Highlighted */}
        <div className="col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-emerald-400/90">Referral Balance</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            ${Number(referralBalance).toFixed(2)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Referral balance is been added to your wallet balance</p>
        </div>

        {/* Total Referrals */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-white/5">
              <Users className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-xs font-medium text-zinc-400">Total Referrals</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {totalReferrals}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {successfulReferrals} successful
          </p>
        </div>

        {/* Successful count (visible on larger screens or as third card) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-white/5">
              <Share2 className="w-4 h-4 text-zinc-400" />
            </div>
            <span className="text-xs font-medium text-zinc-400">Successful</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {successfulReferrals}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Rewarded referrals</p>
        </div>
      </div>

      {/* ─── Share Card (Primary Action) ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-zinc-900/50">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-xl bg-emerald-500/15">
              <Link2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Your Referral Link</h2>
              <p className="text-xs text-zinc-500">Share this link with friends</p>
            </div>
          </div>

          {referralCode ? (
            <div className="space-y-4">
              {/* Link + Copy */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-black/40 border border-white/8 overflow-hidden">
                  <code className="text-sm font-mono text-emerald-400 truncate flex-1">
                    https://nu-vora.app/signup?ref={referralCode}
                  </code>
                </div>
                <button
                  onClick={copyLink}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-900/20"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              {/* Code badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Your code:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-sm font-medium text-white">
                  {referralCode}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="Choose a custom code (e.g. MYCODE)"
                  className="flex-1 px-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                />
                <button
                  onClick={generateCode}
                  disabled={generating}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Generate Code'
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-500">
                4–20 characters • letters and numbers only
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Referrals List ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/8 bg-zinc-900/40 overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-white">Your Referrals</h2>
          </div>
          {referrals.length > 0 && (
            <span className="text-xs text-zinc-500">
              Showing {Math.min(referrals.length, 10)} of {referrals.length}
            </span>
          )}
        </div>

        {referrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-300 mb-1">No referrals yet</p>
            <p className="text-xs text-zinc-500 max-w-xs">
              Share your referral link above to start earning rewards when friends join.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {referrals.slice(0, 10).map((ref) => {
              const statusBadge = getStatusBadge(ref.status);
              const reward = ref.reward_amount ?? ref.bonus_amount ?? 0;
              return (
                <div
                  key={ref.id}
                  className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-white/10">
                      {ref.referee?.avatar_url ? (
                        <img 
                          src={ref.referee.avatar_url} 
                          alt={ref.referee.display_name || 'User'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-zinc-300">
                          {ref.referee?.display_name?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {ref.referee?.display_name || 'Unknown User'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-500">
                          {new Date(ref.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {reward > 0 && (
                    <span className="text-sm font-semibold text-emerald-400 shrink-0">
                      +${Number(reward).toFixed(2)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}