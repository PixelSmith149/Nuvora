"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import supabase from "@/lib/supabase/client";
import { toast } from "@/lib/use-toast";

export interface AssetAudit {
  id: string;
  user_id: string | null;
  platform_name: string;
  target_username: string;
  account_password: string | null;
  status: string;
  two_fa_code: string | null;
  error_message: string | null;
  follower_count: number | null;
  raw_meta_payload: {
    followers_count?: number;
    following_count?: number;
    likes_count?: number;
    account_bio?: string;
    is_verified?: boolean;
    verified_at?: string;
  } | null;
  screenshot_url?: string | null;
  created_at: string;
  last_toast?: {
    timestamp: string;
    title: string;
    description: string;
    variant: "default" | "destructive" | "success";
  } | null;
  toast_logs?: Array<{
    timestamp: string;
    title: string;
    description: string;
    variant: "default" | "destructive" | "success";
  }>;
}

export function useAuditStream(auditId: string) {
  const [audit, setAudit] = useState<AssetAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AssetAudit["toast_logs"]>([]);
  const displayedToasts = useRef<Set<string>>(new Set());
  const isCompleted = useRef(false);

  const showToast = useCallback(
    (props: {
      title: string;
      description: string;
      variant?: "default" | "destructive" | "success";
    }) => {
      const key = `${props.title}-${props.description}`;
      if (displayedToasts.current.has(key)) return;
      displayedToasts.current.add(key);
      toast({
        title: props.title,
        description: props.description,
        variant: props.variant || "default",
        duration: 5000,
      });
    },
    []
  );

  // Initial load
  useEffect(() => {
    if (!auditId) return;

    async function load() {
      const { data } = await supabase
        .from("asset_audits")
        .select("*")
        .eq("id", auditId)
        .maybeSingle();

      if (data) {
        setAudit(data as AssetAudit);
        if (data.toast_logs) setLogs(data.toast_logs);
        if (
          data.status?.startsWith("FAILED") ||
          data.status === "VERIFIED"
        ) {
          setLoading(false);
          isCompleted.current = true;
        }
      }
      setLoading(false);
    }

    load();
  }, [auditId]);

  // Realtime listener
  useEffect(() => {
    if (!auditId) return;

    const channel = supabase
      .channel(`audit-${auditId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "asset_audits",
          filter: `id=eq.${auditId}`,
        },
        (payload) => {
          const row = payload.new as AssetAudit;
          setAudit(row);

          if (row.toast_logs) {
            setLogs(row.toast_logs);
          }

          // Show last_toast if new
          if (row.last_toast?.title) {
            const key = `${row.last_toast.title}-${row.last_toast.timestamp}`;
            if (!displayedToasts.current.has(key)) {
              displayedToasts.current.add(key);
              showToast({
                title: row.last_toast.title,
                description: row.last_toast.description,
                variant: row.last_toast.variant,
              });
            }
          }

          // Terminal states
          if (
            ["VERIFIED", "FAILED_BAD_CREDENTIALS", "FAILED_TIMEOUT", "FAILED_UNKNOWN"].includes(
              row.status
            )
          ) {
            isCompleted.current = true;
            setLoading(false);
          }

          // Loading based on status
          if (
            ["PENDING", "AUTHENTICATING", "SCRAPING_DATA"].includes(row.status)
          ) {
            setLoading(true);
          } else if (
            ["NEEDS_VERIFICATION_CODE", "NEEDS_2FA", "VERIFIED"].includes(
              row.status
            ) ||
            row.status.startsWith("FAILED")
          ) {
            setLoading(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auditId, showToast]);

  return {
    audit,
    setAudit,
    loading,
    setLoading,
    logs,
    showToast,
    isCompleted: isCompleted.current,
  };
}