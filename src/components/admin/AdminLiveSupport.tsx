"use client";

import { useUser } from "@/lib/useAuth";
import { createClient } from "@/lib/supabase/client";
import {
  Clock,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  User,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

type SessionStatus = "waiting" | "active" | "closed" | "expired";

interface LiveSession {
  id: string;
  user_id: string | null;
  user_email: string | null;
  username?: string | null;
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

const MAX_OPEN_CHATS = 10;

export function AdminLiveSupport() {
  const { user, loading: authLoading } = useUser();
  const supabase = createClient();

  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [openSessionIds, setOpenSessionIds] = useState<string[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, LiveMessage[]>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [sendingMap, setSendingMap] = useState<Record<string, boolean>>({});
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const messagesEndRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ─── Load sessions ───────────────────────────────────────
  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);

    const { data } = await supabase
      .from("support_live_sessions")
      .select("*")
      .in("status", ["waiting", "active"])
      .order("created_at", { ascending: true });

    if (data) {
      // Enrich with username from profiles if possible
      const enriched = await Promise.all(
        (data as LiveSession[]).map(async (s) => {
          if (s.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", s.user_id)
              .maybeSingle();
            return { ...s, username: profile?.username || null };
          }
          return s;
        })
      );
      setSessions(enriched);
    }
    setLoadingSessions(false);
  }, [supabase]);

  // Realtime for sessions list
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

  // ─── Join a session ──────────────────────────────────────
  const joinSession = async (session: LiveSession) => {
    if (!user) return;
    if (openSessionIds.length >= MAX_OPEN_CHATS) {
      alert(`You can only have ${MAX_OPEN_CHATS} chats open at once.`);
      return;
    }

    // If already open, just focus it
    if (openSessionIds.includes(session.id)) return;

    if (session.status === "waiting") {
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
    }

    setOpenSessionIds((prev) => [...prev, session.id]);
  };

  // ─── Load + realtime messages for every open session ─────
  useEffect(() => {
    if (openSessionIds.length === 0) return;

    const channels: any[] = [];

    openSessionIds.forEach((sessionId) => {
      // Initial load
      supabase
        .from("support_live_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .then(({ data }) => {
          if (data) {
            setMessagesMap((prev) => ({
              ...prev,
              [sessionId]: data as LiveMessage[],
            }));
          }
        });

      // Realtime
      const channel = supabase
        .channel(`admin-chat-${sessionId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "support_live_messages",
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            const newMsg = payload.new as LiveMessage;
            setMessagesMap((prev) => {
              const current = prev[sessionId] || [];
              if (current.some((m) => m.id === newMsg.id)) return prev;
              return {
                ...prev,
                [sessionId]: [...current, newMsg],
              };
            });
          }
        )
        .subscribe();

      channels.push(channel);
    });

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [openSessionIds, supabase]);

  // Auto-scroll each open chat
  useEffect(() => {
    openSessionIds.forEach((id) => {
      messagesEndRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messagesMap, openSessionIds]);

  // ─── Send reply ──────────────────────────────────────────
  const sendReply = async (sessionId: string) => {
    const text = inputs[sessionId]?.trim();
    if (!text || !user || sendingMap[sessionId]) return;

    setSendingMap((prev) => ({ ...prev, [sessionId]: true }));
    try {
      await supabase.from("support_live_messages").insert({
        session_id: sessionId,
        sender_id: user.id,
        sender_role: "agent",
        content: text,
      });
      setInputs((prev) => ({ ...prev, [sessionId]: "" }));
    } finally {
      setSendingMap((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  // ─── Close session ───────────────────────────────────────
  const closeSession = async (sessionId: string) => {
    await supabase
      .from("support_live_sessions")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
        closed_by: "agent",
      })
      .eq("id", sessionId);

    await supabase.from("support_live_messages").insert({
      session_id: sessionId,
      sender_id: null,
      sender_role: "system",
      content: "Chat closed by agent.",
    });

    setOpenSessionIds((prev) => prev.filter((id) => id !== sessionId));
    setMessagesMap((prev) => {
      const next = { ...prev };
      delete next[sessionId];
      return next;
    });
    loadSessions();
  };

  // ─── Remove from open panels (without closing the session) ─
  const removeFromOpen = (sessionId: string) => {
    setOpenSessionIds((prev) => prev.filter((id) => id !== sessionId));
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

  const waitingSessions = sessions.filter((s) => s.status === "waiting");
  const activeSessions = sessions.filter((s) => s.status === "active");

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="h-7 w-7 text-emerald-400" />
              Live Support Desk
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Multi-chat • Up to {MAX_OPEN_CHATS} simultaneous conversations • 5-min temporary sessions
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

        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
          {/* ─── LEFT: Queue ─────────────────────────────── */}
          <div className="bg-zinc-950/60 border border-white/5 rounded-2xl overflow-hidden h-fit">
            <div className="px-4 py-3 border-b border-white/5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Waiting ({waitingSessions.length})
            </div>

            {loadingSessions ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
              </div>
            ) : waitingSessions.length === 0 ? (
              <div className="p-6 text-center text-sm text-zinc-500">
                No users waiting
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[40vh] overflow-y-auto">
                {waitingSessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => joinSession(s)}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-amber-400 shrink-0" />
                      <span className="text-sm font-medium text-white truncate">
                        {s.username || s.user_email || "Anonymous"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {s.first_message}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(s.created_at).toLocaleTimeString()}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Active sessions list */}
            <div className="px-4 py-3 border-t border-white/5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Active ({activeSessions.length})
            </div>
            <div className="divide-y divide-white/5 max-h-[30vh] overflow-y-auto">
              {activeSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    if (!openSessionIds.includes(s.id)) {
                      setOpenSessionIds((prev) => [...prev, s.id]);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${
                    openSessionIds.includes(s.id) ? "bg-emerald-500/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-white truncate">
                      {s.username || s.user_email || "Anonymous"}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Agent: {s.agent_name || "—"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* ─── RIGHT: Multi-chat panels ────────────────── */}
          <div className="space-y-4">
            {openSessionIds.length === 0 ? (
              <div className="bg-zinc-950/40 border border-white/5 rounded-2xl min-h-[500px] flex items-center justify-center text-zinc-500 text-sm">
                Open a waiting session from the queue to start chatting
              </div>
            ) : (
              <div
                className={`grid gap-4 ${
                  openSessionIds.length === 1
                    ? "grid-cols-1"
                    : openSessionIds.length === 2
                      ? "grid-cols-1 lg:grid-cols-2"
                      : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                }`}
              >
                {openSessionIds.map((sessionId) => {
                  const session = sessions.find((s) => s.id === sessionId);
                  if (!session) return null;

                  const messages = messagesMap[sessionId] || [];
                  const inputValue = inputs[sessionId] || "";
                  const isSending = sendingMap[sessionId] || false;
                  const isExpanded = expandedId === sessionId;

                  return (
                    <div
                      key={sessionId}
                      className={`bg-zinc-950/60 border border-white/5 rounded-2xl flex flex-col ${
                        isExpanded ? "fixed inset-4 z-50" : "min-h-[420px] max-h-[520px]"
                      }`}
                    >
                      {/* Chat header */}
                      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 shrink-0">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {session.username || session.user_email || "Anonymous"}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {session.status} • {session.agent_name || "You"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              setExpandedId(isExpanded ? null : sessionId)
                            }
                            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400"
                            title={isExpanded ? "Minimize" : "Expand"}
                          >
                            {isExpanded ? (
                              <Minimize2 className="h-3.5 w-3.5" />
                            ) : (
                              <Maximize2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => removeFromOpen(sessionId)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400"
                            title="Hide panel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => closeSession(sessionId)}
                            className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/20"
                          >
                            Close
                          </button>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.sender_role === "agent"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-sm ${
                                msg.sender_role === "agent"
                                  ? "bg-sky-500/20 text-sky-50 border border-sky-500/20"
                                  : msg.sender_role === "system"
                                    ? "bg-zinc-800/80 text-zinc-400 text-xs italic"
                                    : "bg-zinc-800 text-zinc-100"
                              }`}
                            >
                              {msg.sender_role === "user" && (
                                <p className="text-[10px] font-bold text-emerald-400 mb-0.5">
                                  User
                                </p>
                              )}
                              {msg.content}
                              <p className="text-[10px] text-zinc-500 mt-0.5 text-right">
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div
                          ref={(el) => {
                            messagesEndRefs.current[sessionId] = el;
                          }}
                        />
                      </div>

                      {/* Input */}
                      {session.status === "active" && (
                        <div className="p-2.5 border-t border-white/5 shrink-0">
                          <div className="flex gap-2">
                            <Textarea
                              value={inputValue}
                              onChange={(e) =>
                                setInputs((prev) => ({
                                  ...prev,
                                  [sessionId]: e.target.value,
                                }))
                              }
                              placeholder="Reply…"
                              rows={2}
                              className="flex-1 bg-black border-white/10 text-white rounded-xl resize-none text-sm min-h-[60px]"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  sendReply(sessionId);
                                }
                              }}
                            />
                            <button
                              onClick={() => sendReply(sessionId)}
                              disabled={!inputValue.trim() || isSending}
                              className="self-end h-10 w-10 rounded-xl bg-sky-500 hover:bg-sky-400 text-black flex items-center justify-center disabled:opacity-40"
                            >
                              {isSending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}