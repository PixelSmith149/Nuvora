"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, LifeBuoy, ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import { LiveChat } from "@/components/support/LiveChat";

function LiveChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialComplaint = searchParams.get("msg") || undefined;

  return (
    <div className="min-h-[100dvh] w-full bg-black text-white flex flex-col">
      {/* Top Persistent Navigation Section */}
      <header className="shrink-0 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/support")}
              className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900 hover:bg-zinc-800 px-3 py-2 rounded-xl border border-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Support</span>
            </button>
            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
              <LifeBuoy className="h-4 w-4 text-emerald-400" />
              <span>Real-time Technical Assistance</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Encrypted Session</span>
          </div>
        </div>
      </header>

      {/* Main Full-Page Workspace Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-2 sm:p-6 flex flex-col min-h-0">
        <div className="flex-1 w-full h-full min-h-[550px]">
          <LiveChat
            initialComplaint={initialComplaint}
            onClose={() => router.push("/support")}
          />
        </div>
      </main>
    </div>
  );
}

export default function DedicatedLiveChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-xs text-zinc-400">Loading Support Workspace...</div>
        </div>
      }
    >
      <LiveChatContent />
    </Suspense>
  );
}