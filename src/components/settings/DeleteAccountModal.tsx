'use client';

import { useState } from 'react';
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteAccountAction } from '@/app/actions/delete-account';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteAccountModal({ isOpen, onClose, onDeleted }: DeleteAccountModalProps) {
  const router = useRouter();
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirm !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await deleteAccountAction();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      if (onDeleted) {
        onDeleted();
      } else {
        router.push('/login');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
          setConfirm('');
        }
      }}
    >
      <div
        className="bg-zinc-950 border border-red-500/20 rounded-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Delete Account</h3>
              <p className="text-sm text-red-400">This action cannot be undone</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded-lg mb-4">{error}</div>
        )}

        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-sm text-zinc-400">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p>Deleting your account will permanently remove:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-500 text-xs">
                  <li>All your templates and animations</li>
                  <li>Order history and transactions</li>
                  <li>Store listings and products</li>
                  <li>Profile and personal data</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-500 block mb-1">
              Type <span className="text-red-400 font-bold">DELETE</span> to confirm
            </label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full p-3 rounded-xl bg-black/50 border border-red-500/20 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || confirm !== 'DELETE'}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Account'}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                setConfirm('');
              }}
              disabled={loading}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}