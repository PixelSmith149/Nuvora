"use client";

import { useUser } from "@/lib/useAuth"; 
import { createClient } from "@/lib/supabase/client";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  Send,
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

interface LiveChatProps {
  onClose: () => void;
  initialComplaint?: string;
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function LiveChat({ onClose, initialComplaint }: LiveChatProps) {
  const { user, loading: authLoading } = useUser();
  const supabase = createClient();

  const [session, setSession] = useState<LiveSession | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [input, setInput] = useState(initialComplaint || "");
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(FIVE_MINUTES_MS);
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Create session + first message
  const createSession = useCallback(
    async (firstMessage: string) => {
      if (!user) {
        setError("You must be logged in to start a live chat.");
        return;
      }

      setIsCreating(true);
      setError(null);

      try {
        // Close any previous open sessions for this user
        await supabase
          .from("support_live_sessions")
          .update({
            status: "closed",
            closed_at: new Date().toISOString(),
            closed_by: "system",
          })
          .eq("user_id", user.id)
          .in("status", ["waiting", "active"]);

        const expiresAt = new Date(Date.now() + FIVE_MINUTES_MS).toISOString();

        const { data: newSession, error: sessionError } = await supabase
          .from("support_live_sessions")
          .insert({
            user_id: user.id,
            user_email: user.email,
            status: "waiting",
            first_message: firstMessage,
            expires_at: expiresAt,
          })
          .select()
          .single();

        if (sessionError) throw sessionError;

        // First user message
        const { error: msgError } = await supabase
          .from("support_live_messages")
          .insert({
            session_id: newSession.id,
            sender_id: user.id,
            sender_role: "user",
            content: firstMessage,
          });

        if (msgError) throw msgError;

        // System welcome
        await supabase.from("support_live_messages").insert({
          session_id: newSession.id,
          sender_id: null,
          sender_role: "system",
          content:
            "Your request has been received. An agent will join within 5 minutes. Please stay on this page.",
        });

        setSession(newSession as LiveSession);
        setHasSentFirstMessage(true);
        setInput("");
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to start live chat. Please try again.");
      } finally {
        setIsCreating(false);
      }
    },
    [user, supabase]
  );

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !session || isSending) return;
    if (session.status === "closed" || session.status === "expired") return;

    // First message path
    if (!hasSentFirstMessage) {
      await createSession(input.trim());
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.from("support_live_messages").insert({
        session_id: session.id,
        sender_id: user?.id ?? null,
        sender_role: "user",
        content: input.trim(),
      });

      if (error) throw error;
      setInput("");
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Close session
  const closeSession = async (by: "user" | "agent" = "user") => {
    if (!session) {
      onClose();
      return;
    }

    try {
      await supabase
        .from("support_live_sessions")
        .update({
          status: "closed",
          closed_at: new Date().toISOString(),
          closed_by: by,
        })
        .eq("id", session.id);

      await supabase.from("support_live_messages").insert({
        session_id: session.id,
        sender_id: null,
        sender_role: "system",
        content: `Chat closed by ${by}.`,
      });
    } catch (err) {
      console.error(err);
    } finally {
      onClose();
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`live-chat-${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_live_messages",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === (payload.new as any).id);
              if (exists) return prev;
              return [...prev, payload.new as LiveMessage];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_live_sessions",
          filter: `id=eq.${session.id}`,
        },
        (payload) => {
          setSession(payload.new as LiveSession);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id, supabase]);

  // Load messages
  useEffect(() => {
    if (!session?.id) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from("support_live_messages")
        .select("*")
        .eq("session_id", session.id)
        .order("created_at", { ascending: true });

      if (data) setMessages(data as LiveMessage[]);
    };

    loadMessages();
  }, [session?.id, supabase]);

  // Countdown
  useEffect(() => {
    if (!session || session.status !== "waiting") return;

    const interval = setInterval(() => {
      const remaining = new Date(session.expires_at).getTime() - Date.now();
      setTimeLeft(Math.max(0, remaining));

      if (remaining <= 0) {
        supabase
          .from("support_live_sessions")
          .update({
            status: "expired",
            closed_at: new Date().toISOString(),
            closed_by: "system",
          })
          .eq("id", session.id)
          .then(() => {
            setSession((prev) =>
              prev ? { ...prev, status: "expired" } : null
            );
          });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 space-y-4 text-center">
        <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
        <p className="text-sm text-zinc-300">
          Please log in to start a live chat with support.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-sm"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[min(520px,80vh)] bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-sm font-bold text-white">Live Support</p>
            <p className="text-[11px] text-zinc-500">
              {session?.status === "waiting" && "Waiting for agent…"}
              {session?.status === "active" &&
                `Connected with ${session.agent_name || "Agent"}`}
              {session?.status === "closed" && "Chat closed"}
              {session?.status === "expired" && "Session expired"}
              {!session && "Start a temporary chat"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session?.status === "waiting" && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(timeLeft)}
            </div>
          )}
          <button
            onClick={() => closeSession("user")}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Close chat"
          >
            <X className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!session && (
          <div className="text-center py-8 space-y-3">
            <MessageCircle className="h-10 w-10 text-emerald-400/60 mx-auto" />
            <p className="text-sm text-zinc-300 font-medium">
              Temporary Live Chat
            </p>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Describe your issue below. An agent has 5 minutes to join. You can
              close the chat at any time.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                msg.sender_role === "user"
                  ? "bg-emerald-500/20 text-emerald-50 border border-emerald-500/20"
                  : msg.sender_role === "system"
                    ? "bg-zinc-800/80 text-zinc-400 text-xs italic border border-white/5"
                    : "bg-zinc-800 text-zinc-100 border border-white/5"
              }`}
            >
              {msg.sender_role === "agent" && (
                <p className="text-[10px] font-bold text-sky-400 mb-0.5">
                  Agent
                </p>
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

        {session?.status === "expired" && (
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm text-zinc-300">No agent joined in time.</p>
            <p className="text-xs text-zinc-500 mt-1">
              Please create a support ticket or try again later.
            </p>
          </div>
        )}

        {session?.status === "closed" && (
          <div className="text-center py-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-zinc-300">Chat has been closed.</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Input */}
      {(!session ||
        session.status === "waiting" ||
        session.status === "active") && (
        <div className="p-3 border-t border-white/5 bg-zinc-900/40">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                hasSentFirstMessage
                  ? "Type your message…"
                  : "Describe your issue / complaint (required to start)…"
              }
              rows={2}
              className="flex-1 bg-black border-white/10 text-white rounded-xl resize-none text-sm min-h-[44px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isCreating || isSending}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isCreating || isSending}
              className="self-end h-11 w-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center disabled:opacity-40 transition-colors"
            >
              {isCreating || isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          {!hasSentFirstMessage && (
            <p className="text-[10px] text-zinc-500 mt-1.5">
              Your first message is required to open the temporary session.
            </p>
          )}
        </div>
      )}
    </div>
  );
}