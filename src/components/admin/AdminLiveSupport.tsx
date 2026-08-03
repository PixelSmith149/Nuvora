"use client";

import { useUser } from "@/lib/useAuth"; // ← adjust path
import { createClient } from "@/lib/supabase/client";
import {
  Clock,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

type SessionStatus = "waiting" | "active" | "closed" | "expired";

interface LiveSession {
  id: string;
  user_id: string | null;
  user_email: string | null;
  status: SessionStatus;
  first_message: string | null;
  agent_id: string | null;
  agent_name: string | null;
  created_at: string;
  expires_at: string;
  closed_at: string | null;
  closed_by: string | null;
}

interface LiveMessage {
  id: string;
  session_id: string;
  sender_id: string | null;
  sender_role: "user" | "agent" | "system";
  content: string;
  created_at: string;
}

export function AdminLiveSupport() {
  const { user, loading: authLoading } = useUser();
  const supabase = createClient();

  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    const { data } = await supabase
      .from("support_live_sessions")
      .select("*")
      .in("status", ["waiting", "active"])
      .order("created_at", { ascending: true });

    if (data) setSessions(data as LiveSession[]);
    setLoadingSessions(false);
  }, [supabase]);

  useEffect(() => {
    loadSessions();

    const channel = supabase
      .channel("admin-live-sessions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_live_sessions" },
        () => loadSessions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadSessions, supabase]);

  const joinSession = async (session: LiveSession) => {
    if (!user) return;

    const { error } = await supabase
      .from("support_live_sessions")
      .update({
        status: "active",
        agent_id: user.id,
        agent_name: user.email?.split("@")[0] || "Agent",
      })
      .eq("id", session.id)
      .eq("status", "waiting");

    if (error) {
      console.error(error);
      return;
    }

    await supabase.from("support_live_messages").insert({
      session_id: session.id,
      sender_id: null,
      sender_role: "system",
      content: `Agent ${user.email?.split("@")[0] || "Support"} has joined the chat.`,
    });

    setActiveSessionId(session.id);
  };

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from("support_live_messages")
        .select("*")
        .eq("session_id", activeSessionId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data as LiveMessage[]);
    };

    load();

    const channel = supabase
      .channel(`admin-chat-${activeSessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_live_messages",
          filter: `session_id=eq.${activeSessionId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === (payload.new as any).id);
            if (exists) return prev;
            return [...prev, payload.new as LiveMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSessionId, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendReply = async () => {
    if (!input.trim() || !activeSessionId || !user || isSending) return;

    setIsSending(true);
    try {
      await supabase.from("support_live_messages").insert({
        session_id: activeSessionId,
        sender_id: user.id,
        sender_role: "agent",
        content: input.trim(),
      });
      setInput("");
    } finally {
      setIsSending(false);
    }
  };

  const closeSession = async () => {
    if (!activeSessionId) return;

    await supabase
      .from("support_live_sessions")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
        closed_by: "agent",
      })
      .eq("id", activeSessionId);

    await supabase.from("support_live_messages").insert({
      session_id: activeSessionId,
      sender_id: null,
      sender_role: "system",
      content: "Chat closed by agent.",
    });

    setActiveSessionId(null);
    loadSessions();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-12 text-zinc-400">
        Please log in as an admin/support agent.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="h-7 w-7 text-emerald-400" />
              Live Support Desk
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Temporary 5-minute chats • Waiting & Active sessions
            </p>
          </div>
          <button
            onClick={loadSessions}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          {/* Queue */}
          <div className="bg-zinc-950/60 border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Queue ({sessions.length})
            </div>

            {loadingSessions ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500">
                No active or waiting chats
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[70vh] overflow-y-auto">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (s.status === "waiting") joinSession(s);
                      else setActiveSessionId(s.id);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${
                      activeSessionId === s.id ? "bg-emerald-500/10" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="h-4 w-4 text-zinc-500 shrink-0" />
                        <span className="text-sm font-medium text-white truncate">
                          {s.user_email || "Anonymous"}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          s.status === "waiting"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{s.first_message}</p>
                    <p className="text-[10px] text-zinc-600 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(s.created_at).toLocaleTimeString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat panel */}
          <div className="bg-zinc-950/60 border border-white/5 rounded-2xl flex flex-col min-h-[500px]">
            {!activeSession ? (
              <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
                Select a session from the queue to start helping
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white">{activeSession.user_email}</p>
                    <p className="text-xs text-zinc-500">Status: {activeSession.status}</p>
                  </div>
                  <button
                    onClick={closeSession}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Close Chat
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_role === "agent" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                          msg.sender_role === "agent"
                            ? "bg-sky-500/20 text-sky-50 border border-sky-500/20"
                            : msg.sender_role === "system"
                              ? "bg-zinc-800/80 text-zinc-400 text-xs italic"
                              : "bg-zinc-800 text-zinc-100"
                        }`}
                      >
                        {msg.sender_role === "user" && (
                          <p className="text-[10px] font-bold text-emerald-400 mb-0.5">User</p>
                        )}
                        {msg.content}
                        <p className="text-[10px] text-zinc-500 mt-1 text-right">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {activeSession.status === "active" && (
                  <div className="p-3 border-t border-white/5">
                    <div className="flex gap-2">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Reply to user…"
                        rows={2}
                        className="flex-1 bg-black border-white/10 text-white rounded-xl resize-none text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendReply();
                          }
                        }}
                      />
                      <button
                        onClick={sendReply}
                        disabled={!input.trim() || isSending}
                        className="self-end h-11 w-11 rounded-xl bg-sky-500 hover:bg-sky-400 text-black flex items-center justify-center disabled:opacity-40"
                      >
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}