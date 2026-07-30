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
    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
          <User className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Account Management</h2>
          <p className="text-sm text-zinc-500">Manage your account data</p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded-lg mb-3">{error}</div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={exportData}
          disabled={exporting}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 hover:border-white/15 transition-all disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 text-blue-400" />
            <div className="text-left">
              <p className="text-sm font-medium text-white">Export Data</p>
              <p className="text-xs text-zinc-500">Download all your data (GDPR)</p>
            </div>
          </div>
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-zinc-500" />
          )}
        </button>

       <Link
  href="/auth/logout"
  className="group flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-zinc-200 transition-all duration-200 hover:border-red-500/30 hover:bg-zinc-800/80 hover:text-red-400"
>
  <div className="flex items-center gap-3">
    <div className="rounded-lg bg-zinc-800 p-2 group-hover:bg-red-500/10">
      <LogOut className="h-4 w-4" />
    </div>
    <span className="font-medium">Logout</span>
  </div>

  <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-red-400" />
</Link>
      </div>
    </div>
  );
}