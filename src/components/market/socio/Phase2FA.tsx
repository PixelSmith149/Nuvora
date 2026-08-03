"use client";

import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import supabase from "@/lib/supabase/client";

interface Phase2FAProps {
  auditId: string;
  showToast: (props: any) => void;
  onSubmitted?: () => void;
}

export function Phase2FA({ auditId, showToast, onSubmitted }: Phase2FAProps) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!code || code.trim().length < 4) {
      showToast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid verification code.",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("asset_audits")
      .update({ two_fa_code: code.trim() })
      .eq("id", auditId);

    setSubmitting(false);

    if (error) {
      showToast({
        variant: "destructive",
        title: "Transmission Failed",
        description: "Could not send the code to the worker.",
      });
      return;
    }

    setCode("");
    showToast({
      title: "🔑 Code Dispatched",
      description: "Verification code sent to the worker. Waiting for confirmation...",
    });
    onSubmitted?.();
  };

  return (
    <div className="bg-amber-500/[0.03] border border-amber-500/20 p-4 rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-amber-400 animate-pulse" />
        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
          Security Code Required
        </h4>
      </div>

      <p className="text-[11px] text-zinc-400">
        The platform requested a verification code. Check your email, SMS, or authenticator app and paste it below. The worker is actively listening.
      </p>

      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter verification code"
          className="bg-zinc-900 border-zinc-800 h-9 text-xs text-white font-mono tracking-wider"
          maxLength={12}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <Button
          onClick={submit}
          disabled={submitting || code.trim().length < 4}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs h-9 px-4 rounded-lg"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Submit Code"
          )}
        </Button>
      </div>
    </div>
  );
}