'use client';

import Link from "next/link";
import { useState } from 'react';
import { User, Download, Trash2, ChevronRight, Loader2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';


export function AccountManagementSettings() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = async () => {
    setExporting(true);
    setError(null);

    try {
      const response = await fetch('/api/account/export', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export data');
      }

      const data = await response.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prime-booster-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err: any) {
      setError(err.message || 'Failed to export data');
      setTimeout(() => setError(null), 3000);
    } finally {
      setExporting(false);
    }
  };

  return (
  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/80 via-zinc-950/90 to-black p-7 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">

    {/* Ambient Glow */}
    <div className="pointer-events-none absolute inset-0">

      <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-cyan-400/5 blur-3xl" />

      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />

      <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

    </div>

    <div className="relative">

      {/* Header */}
      <div className="mb-6 flex items-center gap-4">

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            border
            border-red-500/20
            bg-gradient-to-br
            from-red-500/15
            to-orange-500/10
            shadow-[0_0_25px_rgba(239,68,68,0.12)]
          "
        >
          <User className="h-6 w-6 text-red-300" />
        </div>

        <div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Account Management
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Manage exports, sessions and account access.
          </p>

        </div>

      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-xl">
          {error}
        </div>
      )}

      <div className="space-y-4">

        {/* Export */}

        <button
          type="button"
          onClick={exportData}
          disabled={exporting}
          className="
            group
            relative
            flex
            w-full
            items-center
            justify-between
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
            hover:border-emerald-500/20
            hover:shadow-[0_15px_40px_rgba(16,185,129,0.10)]
            disabled:opacity-50
          "
        >

          <div className="absolute inset-0">

            <div className="absolute -top-8 right-0 h-28 w-28 rounded-full bg-emerald-500/5 blur-3xl transition-all duration-500 group-hover:bg-emerald-500/15" />

            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-cyan-400/5 blur-2xl transition-all duration-500 group-hover:bg-cyan-400/10" />

          </div>

          <div className="relative flex items-center gap-4">

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                border
                border-emerald-500/10
                bg-gradient-to-br
                from-emerald-500/10
                to-cyan-400/5
                shadow-[0_0_18px_rgba(16,185,129,0.12)]
                transition-all
                duration-300
                group-hover:border-emerald-500/20
              "
            >
              <Download className="h-5 w-5 text-emerald-300" />
            </div>

            <div className="text-left">

              <p className="font-semibold text-white">
                Export Data
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Download your account information (GDPR)
              </p>

            </div>

          </div>

          <div className="relative">

            {exporting ? (
              <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-zinc-500 transition-all group-hover:translate-x-1 group-hover:text-emerald-300" />
            )}

          </div>

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

        </button>

        {/* Logout */}

        <Link
          href="/auth/logout"
          className="
            group
            relative
            flex
            w-full
            items-center
            justify-between
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
            hover:border-red-500/25
            hover:shadow-[0_15px_40px_rgba(239,68,68,0.10)]
          "
        >

          <div className="absolute inset-0">

            <div className="absolute -top-8 right-0 h-28 w-28 rounded-full bg-red-500/5 blur-3xl transition-all duration-500 group-hover:bg-red-500/15" />

          </div>

          <div className="relative flex items-center gap-4">

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                border
                border-red-500/10
                bg-gradient-to-br
                from-red-500/10
                to-orange-500/5
                shadow-[0_0_18px_rgba(239,68,68,0.10)]
                transition-all
                duration-300
                group-hover:border-red-500/20
              "
            >
              <LogOut className="h-5 w-5 text-red-300" />
            </div>

            <div>

              <p className="font-semibold text-white">
                Logout
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                End your current authenticated session.
              </p>

            </div>

          </div>

          <ChevronRight className="relative h-5 w-5 text-zinc-500 transition-all group-hover:translate-x-1 group-hover:text-red-300" />

          <div className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-400/20 to-red-500/20" />

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

        </Link>

      </div>

    </div>

  </div>
 );
}