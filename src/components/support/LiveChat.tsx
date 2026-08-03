"use client";

import { useUser } from "@/lib/useAuth";
import { createClient } from "@/lib/supabase/client";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Paperclip,
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
  attachment_url?: string | null;
  created_at: string;
}

interface LiveChatProps {
  onClose: () => void;
  initialComplaint?: string;
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function LiveChat({ onClose, initialComplaint }: LiveChatProps) {
  const { user, loading: authLoading } = useUser();
  const supabase = createClient();

  const [session, setSession] = useState<LiveSession | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [input, setInput] = useState(initialComplaint || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [isInitializing, setIsInitializing] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(FIVE_MINUTES_MS);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<LiveSession | null>(null);

  // Synchronize mutable ref to protect async realtime functions from stale closures
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ─── File Handling & Upload ─────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError("Unsupported file type. Please upload JPEG, PNG, WEBP, or GIF.");
      return;
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadAttachment = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `chat-attachments/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("support-attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("support-attachments").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err: any) {
      console.error("Attachment upload error:", err);
      setError("Failed to upload screenshot attachment.");
      return null;
    }
  };

  // ─── Fetch Existing Session on Mount ──────────────────────────────

  useEffect(() => {
    let isMounted = true;

    const checkActiveSession = async () => {
      if (!user) {
        setIsInitializing(false);
        return;
      }

      try {
        const { data, error: sessionErr } = await supabase
          .from("support_live_sessions")
          .select("*")
          .eq("user_id", user.id)
          .in("status", ["waiting", "active"])
          .order("created_at", { ascending: false })
          .maybeSingle();

        if (sessionErr) throw sessionErr;

        if (data && isMounted) {
          setSession(data as LiveSession);
        }
      } catch (err: any) {
        console.error("Session check error:", err);
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    if (!authLoading) {
      checkActiveSession();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, supabase]);

  // ─── Create Session ─────────────────────────────────────────────

  const createSession = useCallback(
    async (firstMessageText: string, attachmentUrl: string | null) => {
      if (!user) {
        setError("You must be logged in to start a live chat.");
        return;
      }

      setIsCreating(true);
      setError(null);

      try {
        // Clean up previous stale waiting/active sessions
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
            first_message: firstMessageText,
            expires_at: expiresAt,
          })
          .select()
          .single();

        if (sessionError) throw sessionError;

        // Insert first user message
        const { error: msgError } = await supabase
          .from("support_live_messages")
          .insert({
            session_id: newSession.id,
            sender_id: user.id,
            sender_role: "user",
            content: firstMessageText,
            attachment_url: attachmentUrl,
          });

        if (msgError) throw msgError;

        // System greeting
        await supabase.from("support_live_messages").insert({
          session_id: newSession.id,
          sender_id: null,
          sender_role: "system",
          content:
            "Your request has been received. An agent will join within 5 minutes. Please stay on this page.",
        });

        setSession(newSession as LiveSession);
        setInput("");
        removeSelectedFile();
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to start live chat. Please try again.");
      } finally {
        setIsCreating(false);
      }
    },
    [user, supabase]
  );

  // ─── Send Message ───────────────────────────────────────────────

  const sendMessage = async () => {
    const textContent = input.trim();
    if ((!textContent && !selectedFile) || isSending || isCreating) return;

    if (sessionRef.current?.status === "closed" || sessionRef.current?.status === "expired") {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      let attachmentUrl: string | null = null;
      if (selectedFile) {
        attachmentUrl = await uploadAttachment(selectedFile);
        if (selectedFile && !attachmentUrl) {
          setIsSending(false);
          return;
        }
      }

      // If session does not exist, initialize new session flow
      if (!sessionRef.current) {
        await createSession(textContent || "Attached screenshot", attachmentUrl);
        return;
      }

      // Existing session message flow
      const { error: sendError } = await supabase.from("support_live_messages").insert({
        session_id: sessionRef.current.id,
        sender_id: user?.id ?? null,
        sender_role: "user",
        content: textContent,
        attachment_url: attachmentUrl,
      });

      if (sendError) throw sendError;

      setInput("");
      removeSelectedFile();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  // ─── Close Session ─────────────────────────────────────────────

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

  // ─── Realtime Subscriptions & Load Messages ────────────────────

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

    const channel = supabase
      .channel(`live-chat-${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_live_messages",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === (payload.new as any).id);
            if (exists) return prev;
            return [...prev, payload.new as LiveMessage];
          });
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

  // ─── Expiration Countdown Timer ────────────────────────────────

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
            setSession((prev) => (prev ? { ...prev, status: "expired" } : null));
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

  // ─── Conditional Layout Renders ────────────────────────────────

  if (authLoading || isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mb-2" />
        <p className="text-xs text-zinc-400">Loading Live Chat...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 space-y-4 text-center my-auto">
        <AlertCircle className="h-12 w-12 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Authentication Required</h3>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto">
          Please log in to start a live support conversation with our team.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full min-h-[500px] bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-zinc-900/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <MessageCircle className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Live Support</p>
            <p className="text-xs text-zinc-400">
              {session?.status === "waiting" && "Waiting for an agent…"}
              {session?.status === "active" && `Connected with ${session.agent_name || "Agent"}`}
              {session?.status === "closed" && "Chat closed"}
              {session?.status === "expired" && "Session expired"}
              {!session && "Start a temporary live session"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {session?.status === "waiting" && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 font-mono">
              <Clock className="h-3.5 w-3.5 animate-pulse" />
              {formatTime(timeLeft)}
            </div>
          )}
          <button
            onClick={() => closeSession("user")}
            className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {!session && (
          <div className="text-center py-12 space-y-3">
            <div className="p-4 rounded-full bg-emerald-500/10 w-fit mx-auto border border-emerald-500/20">
              <MessageCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-base font-bold text-white">Need real-time assistance?</p>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Describe your issue or attach a screenshot below to start. An available support agent will join your session shortly.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm space-y-2 ${
                msg.sender_role === "user"
                  ? "bg-emerald-500/20 text-emerald-50 border border-emerald-500/20 rounded-br-sm"
                  : msg.sender_role === "system"
                    ? "bg-zinc-900 text-zinc-400 text-xs italic border border-white/5 mx-auto max-w-full text-center"
                    : "bg-zinc-900 text-zinc-100 border border-white/5 rounded-bl-sm"
              }`}
            >
              {msg.sender_role === "agent" && (
                <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  Support Agent
                </p>
              )}

              {msg.attachment_url && (
                <div className="rounded-xl overflow-hidden border border-white/10 max-w-xs bg-black/40">
                  <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={msg.attachment_url}
                      alt="Attachment screenshot"
                      className="w-full h-auto max-h-60 object-cover hover:opacity-90 transition-opacity"
                    />
                  </a>
                </div>
              )}

              {msg.content && <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}

              <p className="text-[10px] text-zinc-500 text-right font-mono">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {session?.status === "expired" && (
          <div className="text-center py-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <AlertCircle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">No agent joined in time</p>
            <p className="text-xs text-zinc-400 mt-1">
              Our agents are currently busy. Please create a ticket or try again.
            </p>
          </div>
        )}

        {session?.status === "closed" && (
          <div className="text-center py-6 p-4 rounded-xl border border-white/10 bg-zinc-900/50">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">Chat session ended</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-xs text-red-400 flex items-center justify-between shrink-0">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-zinc-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Input Area */}
      {(!session || session.status === "waiting" || session.status === "active") && (
        <div className="p-4 border-t border-white/5 bg-zinc-900/50 space-y-3 shrink-0">
          {/* File Attachment Chip */}
          {filePreview && (
            <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl p-2 w-fit">
              <ImageIcon className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-zinc-300 truncate max-w-[180px]">
                {selectedFile?.name}
              </span>
              <button
                onClick={removeSelectedFile}
                className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCreating || isSending}
              className="p-3 rounded-xl bg-black border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
              title="Attach Screenshot"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                session ? "Type your message..." : "Describe your issue to start..."
              }
              rows={1}
              className="flex-1 bg-black border-white/10 text-white rounded-xl resize-none text-sm min-h-[44px] max-h-32 py-2.5"
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
              disabled={(!input.trim() && !selectedFile) || isCreating || isSending}
              className="h-11 w-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center disabled:opacity-40 transition-colors shrink-0 font-bold"
            >
              {isCreating || isSending ? (
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
}