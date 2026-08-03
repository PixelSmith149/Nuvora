"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuditStream } from "@/lib/market/useAuditStream";
import { LiveLogs } from "./socio/LiveLogs";
import { Phase2FA } from "./socio/Phase2FA";
import { PhaseCredentials } from "./socio/PhaseCredentials";
import { PhaseVerified } from "./socio/PhaseVerified";

interface SocioConfirmationPanelProps {
  userId: string;
  auditId: string;
  onSuccess: () => void;
}

export function SocioConfirmationPanel({
  userId,
  auditId,
  onSuccess,
}: SocioConfirmationPanelProps) {
  const { audit, setAudit, loading, logs, showToast } = useAuditStream(auditId);

  // ─── Phase 1: No audit yet → Credentials form ───────────────
  if (!audit) {
    return (
      <div className="w-full space-y-4">
        <PhaseCredentials
          userId={userId}
          auditId={auditId}
          onStarted={(data) => setAudit(data)}
          showToast={showToast}
        />
        <LiveLogs logs={logs || []} status={null} />
      </div>
    );
  }

  // ─── Main monitoring view ───────────────────────────────────
  return (
    <div className="w-full space-y-4">
      <div className="w-full bg-zinc-950/80 border border-white/5 rounded-2xl p-6 space-y-5">
        {/* Loading states */}
        {["PENDING", "AUTHENTICATING", "SCRAPING_DATA"].includes(audit.status) && (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
            <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
            <p className="text-xs font-bold text-zinc-200 uppercase tracking-widest">
              {audit.status === "PENDING" && "Initializing Worker..."}
              {audit.status === "AUTHENTICATING" && "Authenticating..."}
              {audit.status === "SCRAPING_DATA" && "Scraping Profile Data..."}
            </p>
            <p className="text-[11px] text-zinc-500 max-w-xs">
              {audit.status === "PENDING" && "Allocating secure sandbox worker..."}
              {audit.status === "AUTHENTICATING" &&
                "Stealth browser is logging into the platform..."}
              {audit.status === "SCRAPING_DATA" &&
                "Extracting followers, bio and verification status..."}
            </p>
          </div>
        )}

        {/* 2FA */}
        {(audit.status === "NEEDS_VERIFICATION_CODE" ||
          audit.status === "NEEDS_2FA") && (
          <Phase2FA auditId={auditId} showToast={showToast} />
        )}

        {/* Failed */}
        {audit.status.startsWith("FAILED") && (
          <div className="bg-rose-500/[0.03] border border-rose-500/20 p-4 rounded-xl text-xs text-rose-400 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert className="h-4 w-4" /> Verification Failed
            </div>
            <p className="text-[11px] text-zinc-500">
              {audit.error_message || "The worker encountered a terminal error."}
            </p>
            <Button
              onClick={() => setAudit(null)}
              className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 text-[10px] font-bold h-7 px-3 rounded-lg mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Success → Publish */}
        {audit.status === "VERIFIED" && (
          <PhaseVerified
            audit={audit}
            userId={userId}
            auditId={auditId}
            onSuccess={onSuccess}
            showToast={showToast}
          />
        )}
      </div>

      <LiveLogs logs={logs || []} status={audit.status} />
    </div>
  );
}