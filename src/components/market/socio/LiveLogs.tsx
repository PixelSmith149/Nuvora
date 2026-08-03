"use client";

import { ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LogItem {
  timestamp: string;
  title: string;
  description: string;
  variant?: "default" | "destructive" | "success";
}

interface LiveLogsProps {
  logs: LogItem[];
  status?: string | null;
}

export function LiveLogs({ logs = [], status }: LiveLogsProps) {
  const [open, setOpen] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (
    logs.length === 0 &&
    status !== "PENDING" &&
    status !== "AUTHENTICATING"
  ) {
    return null;
  }

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Live Status Logs {logs.length > 0 && `(${logs.length})`}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        )}
      </button>

      {open && (
        <div className="px-3 pb-3 max-h-48 overflow-y-auto space-y-1">
          {logs.length === 0 && (
            <div className="text-[10px] text-zinc-600 italic py-2 text-center">
              Waiting for logs from the verification worker...
            </div>
          )}

          {logs.map((log, i) => {
            const isError = log.variant === "destructive";
            const isSuccess = log.variant === "success";

            return (
              <div
                key={`${log.timestamp}-${i}`}
                className={`text-[10px] px-2.5 py-1.5 rounded-lg font-mono ${
                  isError
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/10"
                    : isSuccess
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                      : "bg-zinc-800/30 text-zinc-400 border border-white/5"
                }`}
              >
                <span className="text-[8px] text-zinc-600 mr-2">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="font-bold">{log.title}</span>
                <span className="text-zinc-500 mx-1">·</span>
                <span>{log.description}</span>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
}