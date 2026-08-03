// components/market/SellerMessagingPanel.tsx

"use client";

import {
	ArrowLeft,
	Check,
	CheckCheck,
	Image as ImageIcon,
	Loader2,
	Lock,
	MessageSquare,
	MoreVertical,
	Package,
	Phone,
	Send,
	User,
	Video,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import BackButton from "@/components/BackButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import supabase from "@/lib/supabase/client";
import { useMarket } from "@/lib/use-market";

// ============================================================
// TYPES
// ============================================================

interface ChatMessage {
	id: string;
	conversation_id: string;
	sender_id: string;
	receiver_id: string;
	content: string;
	image_url: string | null;
	asset_url: string | null;
	asset_name: string | null;
	is_read: boolean;
	created_at: string;
	is_sent_by_me: boolean;
	sender_name?: string;
	sender_avatar?: string;
}

interface Conversation {
	id: string;
	user_id: string;
	display_name: string;
	username: string;
	avatar_url: string | null;
	last_message: string;
	last_message_time: string;
	unread_count: number;
}

interface SellerMessagingPanelProps {
	userId: string;
	initialConversationId?: string;
	authenticatedUserId: string;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SellerMessagingPanel({
	userId,
	initialConversationId,
	authenticatedUserId,
}: SellerMessagingPanelProps) {
	const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
	const { refresh } = useMarket(userId);
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [activeConversation, setActiveConversation] =
		useState<Conversation | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [inputText, setInputText] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSending, setIsSending] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [showMobileList, setShowMobileList] = useState(true);
	const [isMobile, setIsMobile] = useState(false);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const subscriptionRef = useRef<any>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	const [error, setError] = useState<string | null>(null);

	// ─── 🔐 AUTHORIZATION CHECK ────────────────────────────────
	useEffect(() => {
		if (authenticatedUserId && userId) {
			setIsAuthorized(authenticatedUserId === userId);
		} else {
			setIsAuthorized(false);
		}
	}, [authenticatedUserId, userId]);

	// ─── Detect mobile ────────────────────────────────────────────
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
			if (window.innerWidth >= 768) {
				setShowMobileList(true);
			}
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		if (isAuthorized === true) {
			loadConversations();
		}
	}, [userId, isAuthorized]);

	// ─── Load messages when conversation changes ──────────────
	useEffect(() => {
		if (!activeConversation || isAuthorized !== true) return;

		loadMessages(activeConversation.id);
		subscribeToMessages(activeConversation.id);
		markAllAsRead(activeConversation.id);

		if (isMobile) {
			setShowMobileList(false);
		}

		return () => {
			if (subscriptionRef.current) {
				supabase.removeChannel(subscriptionRef.current);
				subscriptionRef.current = null;
			}
		};
	}, [activeConversation, isMobile, isAuthorized]);

	// ─── Auto-scroll ──────────────────────────────────────────────
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const getMessageTitle = (receiverName: string, content: string) => {
		if (content.length > 50) {
			return `Message from ${receiverName}`;
		}
		return content;
	};

	// SellerMessagingPanel.tsx - Updated loadConversations
	const loadConversations = async () => {
		if (!userId) return;
		setIsLoading(true);

		try {
			// ─── Step 1: Get all messages ──────────────────────────
			const { data: messagesData, error } = await supabase
				.from("market_inbox_messages")
				.select("*")
				.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error loading messages:", error);
				throw error;
			}

			// ─── Step 2: Build conversation map ────────────────────
			const convMap = new Map<string, Conversation>();

			// Process existing messages
			if (messagesData && messagesData.length > 0) {
				for (const msg of messagesData) {
					const otherUserId =
						msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
					const convId = otherUserId;

					if (convMap.has(convId)) continue;

					const { data: profile, error: profileError } = await supabase
						.from("profiles")
						.select("id, display_name, username, avatar_url")
						.eq("id", otherUserId)
						.single();

					if (profileError || !profile) continue;

					const { count: unreadCount } = await supabase
						.from("market_inbox_messages")
						.select("id", { count: "exact", head: true })
						.eq("sender_id", otherUserId)
						.eq("receiver_id", userId)
						.eq("is_read", false);

					convMap.set(convId, {
						id: convId,
						user_id: profile.id,
						display_name: profile.display_name || profile.username || "User",
						username: profile.username || "user",
						avatar_url: profile.avatar_url,
						last_message: msg.body || msg.content || "📎 Attachment",
						last_message_time: msg.created_at,
						unread_count: unreadCount || 0,
					});
				}
			}

			if (initialConversationId && !convMap.has(initialConversationId)) {
				

				const { data: profile, error: profileError } = await supabase
					.from("profiles")
					.select("id, display_name, username, avatar_url")
					.eq("id", initialConversationId)
					.single();

				if (profile) {
					

					convMap.set(initialConversationId, {
						id: initialConversationId,
						user_id: profile.id,
						display_name: profile.display_name || profile.username || "User",
						username: profile.username || "user",
						avatar_url: profile.avatar_url,
						last_message: "No messages yet. Say hello! 👋",
						last_message_time: new Date().toISOString(),
						unread_count: 0,
					});
				} else {
					console.warn("⚠️ Could not find profile for:", initialConversationId);
				}
			}

			setConversations(Array.from(convMap.values()));

			// ─── ✅ Auto-select the initial conversation ──────────────
			if (initialConversationId) {
				const conv = convMap.get(initialConversationId);
				if (conv) {
					// console.log("✅ Setting active conversation:", conv.display_name);
					setActiveConversation(conv);
					if (isMobile) setShowMobileList(false);
				} else {
					console.warn(
						"⚠️ Could not find conversation for:",
						initialConversationId,
					);
					// If we can't find the conversation, try to use the first one
					if (convMap.size > 0) {
						const firstConv = Array.from(convMap.values())[0];
						setActiveConversation(firstConv);
					}
				}
			}
		} catch (err) {
			console.error("Failed to load conversations:", err);
		} finally {
			setIsLoading(false);
		}
	};
	// ─── Load messages ──────────────────────────────────────────
	const loadMessages = async (conversationId: string) => {
		try {
			// ✅ FIX: Load messages between the two users
			const { data, error } = await supabase
				.from("market_inbox_messages")
				.select("*")
				.or(
					`and(sender_id.eq.${userId},receiver_id.eq.${conversationId}),and(sender_id.eq.${conversationId},receiver_id.eq.${userId})`,
				)
				.order("created_at", { ascending: true });

			if (error) throw error;

			const enriched: ChatMessage[] = await Promise.all(
				(data || []).map(async (msg: any) => {
					const isSentByMe = msg.sender_id === userId;
					let senderName = isSentByMe ? "You" : "Unknown";
					let senderAvatar: string | undefined;

					if (!isSentByMe) {
						const { data: profile } = await supabase
							.from("profiles")
							.select("display_name, username, avatar_url")
							.eq("id", msg.sender_id)
							.single();
						if (profile) {
							senderName = profile.display_name || profile.username || "User";
							senderAvatar = profile.avatar_url || undefined;
						}
					}

					return {
						id: msg.id,
						conversation_id: msg.conversation_id || conversationId,
						sender_id: msg.sender_id,
						receiver_id: msg.receiver_id,
						content: msg.body || "", // ✅ Map body to content for display
						image_url: msg.image_url || null,
						asset_url: msg.asset_url || null,
						asset_name: msg.asset_name || null,
						is_read: msg.is_read || false,
						created_at: msg.created_at,
						is_sent_by_me: isSentByMe,
						sender_name: senderName,
						sender_avatar: senderAvatar,
					};
				}),
			);

			setMessages(enriched);
		} catch (err) {
			console.error("Failed to load messages:", err);
		}
	};

	// ─── Subscribe to messages ──────────────────────────────────
	const subscribeToMessages = (conversationId: string) => {
		if (subscriptionRef.current) {
			supabase.removeChannel(subscriptionRef.current);
		}

		const channel = supabase
			.channel(`chat-${conversationId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "market_inbox_messages",
					filter: `sender_id=eq.${conversationId}`, // ✅ FIX: Only listen for messages from the other user
				},
				async (payload) => {
					const newMsg = payload.new as any;

					// ✅ FIX: Only add if it's not from us
					if (newMsg.sender_id !== userId) {
						const { data: profile } = await supabase
							.from("profiles")
							.select("display_name, username, avatar_url")
							.eq("id", newMsg.sender_id)
							.single();

						const newMessage: ChatMessage = {
							id: newMsg.id,
							conversation_id: newMsg.conversation_id || conversationId,
							sender_id: newMsg.sender_id,
							receiver_id: newMsg.receiver_id,
							content: newMsg.body || newMsg.content || "",
							image_url: newMsg.image_url || null,
							asset_url: newMsg.asset_url || null,
							asset_name: newMsg.asset_name || null,
							is_read: newMsg.is_read || false,
							created_at: newMsg.created_at,
							is_sent_by_me: false,
							sender_name: profile?.display_name || profile?.username || "User",
							sender_avatar: profile?.avatar_url || undefined,
						};

						setMessages((prev) => [...prev, newMessage]);
						markMessageRead(newMsg.id);
					}
				},
			)
			.subscribe();

		subscriptionRef.current = channel;
	};

	// ─── Mark all messages as read ─────────────────────────────
	const markAllAsRead = async (conversationId: string) => {
		try {
			// ✅ FIX: Only update if the column exists, otherwise skip
			const { error } = await supabase
				.from("market_inbox_messages")
				.update({ is_read: true })
				.eq("receiver_id", userId)
				.eq("sender_id", conversationId)
				.eq("is_read", false);

			if (error && !error.message.includes("read_at")) {
				console.error("Error marking messages as read:", error);
			}

			setConversations((prev) =>
				prev.map((conv) =>
					conv.id === conversationId ? { ...conv, unread_count: 0 } : conv,
				),
			);
		} catch (err) {
			console.error("Failed to mark messages as read:", err);
		}
	};

	// ─── Mark single message as read ──────────────────────────
	const markMessageRead = async (messageId: string) => {
		try {
			await supabase
				.from("market_inbox_messages")
				.update({ is_read: true })
				.eq("id", messageId);
		} catch (err) {
			console.error("Failed to mark message as read:", err);
		}
	};

	// ─── Send message ──────────────────────────────────────────
	const sendMessage = async (
		content: string,
		imageUrl?: string,
		assetUrl?: string,
		assetName?: string,
	) => {
		if (!content.trim() && !imageUrl && !assetUrl) return;
		if (!activeConversation || !userId) return;

		setIsSending(true);

		try {
			const messageData = {
				user_id: userId, // ✅ REQUIRED - current user's ID
				sender_id: userId,
				receiver_id: activeConversation.user_id,
				title: getMessageTitle(activeConversation.display_name, content.trim()),
				body: content.trim() || "📎 Attachment",
				is_read: false,
				created_at: new Date().toISOString(),
				conversation_id: activeConversation.id, // ✅ Add this for grouping
				...(imageUrl && { image_url: imageUrl }),
				...(assetUrl && {
					asset_url: assetUrl,
					asset_name: assetName || "Shared Asset",
				}),
			};


			const { data, error } = await supabase
				.from("market_inbox_messages")
				.insert(messageData)
				.select()
				.single();

			if (error) {
				console.error("❌ Supabase insert error:", error);
				throw new Error(`Failed to send message: ${error.message}`);
			}

			// ─── Create new message object ──────────────────────────
			const newMsg: ChatMessage = {
				id: data.id,
				conversation_id: data.conversation_id || activeConversation.id,
				sender_id: data.sender_id,
				receiver_id: data.receiver_id,
				content: data.body || "",
				image_url: data.image_url || null,
				asset_url: data.asset_url || null,
				asset_name: data.asset_name || null,
				is_read: data.is_read || false,
				created_at: data.created_at,
				is_sent_by_me: true,
				sender_name: "You",
				sender_avatar: undefined,
			};

			setMessages((prev) => [...prev, newMsg]);
			setInputText("");

			// ─── Update conversation list ────────────────────────────
			setConversations((prev) =>
				prev.map((conv) =>
					conv.id === activeConversation.id
						? {
								...conv,
								last_message: content.trim() || "📎 Attachment",
								last_message_time: new Date().toISOString(),
							}
						: conv,
				),
			);

			await refresh();
		} catch (err) {
			console.error("Failed to send message:", err);
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to send message. Please try again.";
			setError(errorMessage);
			setTimeout(() => setError(null), 5000);
		} finally {
			setIsSending(false);
		}
	};
	// ─── Upload image ──────────────────────────────────────────
	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			alert("Image must be less than 5MB");
			return;
		}

		const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
		if (!allowedTypes.includes(file.type)) {
			alert("Only JPEG, PNG, WebP, and GIF are allowed");
			return;
		}

		setIsUploading(true);
		setUploadProgress(0);

		try {
			const session = await supabase.auth.getSession();
			const token = session.data.session?.access_token;

			if (!token) throw new Error("Not authenticated");

			const ticketRes = await fetch("/api/market-place/upload-ticket", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					fileName: file.name,
					fileType: file.type,
					isPublicBucket: true,
				}),
			});

			if (!ticketRes.ok) {
				const err = await ticketRes.json();
				throw new Error(err.error || "Failed to get upload URL");
			}

			const ticket = await ticketRes.json();

			const xhr = new XMLHttpRequest();
			xhr.upload.addEventListener("progress", (event) => {
				if (event.lengthComputable) {
					setUploadProgress(Math.round((event.loaded / event.total) * 100));
				}
			});

			await new Promise<void>((resolve, reject) => {
				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) resolve();
					else reject(new Error(`Upload failed: ${xhr.status}`));
				};
				xhr.onerror = () => reject(new Error("Network error"));
				xhr.open("PUT", ticket.uploadUrl);
				xhr.setRequestHeader("Content-Type", file.type);
				xhr.send(file);
			});

			const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/marketplace-public/${ticket.storagePath}`;
			await sendMessage("📷 Photo", publicUrl);
		} catch (err) {
			console.error("Upload failed:", err);
			alert("Failed to upload image");
		} finally {
			setIsUploading(false);
			setUploadProgress(0);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	// ─── Format time ────────────────────────────────────────────
	const formatTime = (date: string) => {
		const d = new Date(date);
		const now = new Date();
		const diff = now.getTime() - d.getTime();

		if (diff < 60000) return "Just now";
		if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
		if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
		if (diff < 172800000) return "Yesterday";
		return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	const formatTimeDetailed = (date: string) => {
		return new Date(date).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// ─── 🔐 UNAUTHORIZED STATE ──────────────────────────────────
	if (!isAuthorized) {
		return (
			<div className="flex flex-col items-center justify-center h-[600px] bg-black rounded-2xl border border-white/5">
				<div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
					<Lock className="h-10 w-10 text-red-400" />
				</div>
				<h3 className="text-lg font-bold text-white">Access Denied</h3>
				<p className="text-sm text-zinc-400 mt-1 max-w-sm text-center">
					You don't have permission to view these messages.
				</p>
				<Button
					variant="ghost"
					className="mt-4 text-zinc-400 hover:text-white"
					onClick={() => (window.location.href = "/")}
				>
					Go Home
				</Button>
			</div>
		);
	}

	// ─── Loading State ──────────────────────────────────────────
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[600px] bg-black">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
					<p className="text-xs text-zinc-500">Loading messages...</p>
				</div>
			</div>
		);
	}

	// ─── No Conversations ──────────────────────────────────────
	if (conversations.length === 0 && !initialConversationId) {
		return (
			<div className="flex flex-col items-center justify-center h-[600px] bg-black text-center">
				<div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-4">
					<MessageSquare className="h-10 w-10 text-zinc-600" />
				</div>
				<h3 className="text-lg font-bold text-white">No Conversations</h3>
				<p className="text-sm text-zinc-400 mt-1 max-w-sm">
					Messages from buyers will appear here when they contact you about your
					listings.
				</p>
			</div>
		);
	}

	// If conversations is empty but we have initialConversationId, show loading or a message
	if (conversations.length === 0 && initialConversationId) {
		return (
			<div className="flex flex-col items-center justify-center h-[600px] bg-black text-center">
				<Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
				<p className="text-sm text-zinc-400">Loading conversation...</p>
			</div>
		);
	}

	// ─── Active Chat View ──────────────────────────────────────
	if (activeConversation) {
		return (
			<div className="flex h-full bg-black rounded-2xl overflow-hidden border border-white/5">
				{(!isMobile || showMobileList) && (
					<div
						className={`${isMobile ? "w-full" : "w-80"} flex-shrink-0 border-r border-white/5 bg-zinc-950/40 flex flex-col h-screen`}
					>
						{/* Header with Back Button + Title */}
						<div className="p-3 border-b border-white/5 bg-zinc-950/80 flex items-center gap-3">
							<BackButton />

							<div className="flex items-center gap-2 flex-1 min-w-0">
								<MessageSquare className="h-4 w-4 text-emerald-400 flex-shrink-0" />
								<h2 className="text-sm font-bold text-white truncate">
									Messages
								</h2>
							</div>

							<p className="text-[10px] text-zinc-500 whitespace-nowrap">
								{conversations.length} conv
							</p>
						</div>

						<div className="flex-1 overflow-y-auto">
							{conversations.map((conv) => (
								<div
									key={conv.id}
									role="button"
									tabIndex={0}
									onClick={() => {
										setActiveConversation(conv);
										if (isMobile) setShowMobileList(false);
									}}
									className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-all hover:bg-white/5 ${
										activeConversation?.id === conv.id ? "bg-white/5" : ""
									}`}
								>
									<Avatar className="w-10 h-10 rounded-full flex-shrink-0">
										{conv.avatar_url ? (
											<AvatarImage src={conv.avatar_url} />
										) : (
											<AvatarFallback className="bg-zinc-800 text-zinc-400 text-sm">
												{conv.display_name?.[0] || "U"}
											</AvatarFallback>
										)}
									</Avatar>

									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between">
											<p className="text-sm font-medium text-white truncate">
												{conv.display_name}
											</p>
											<span className="text-[10px] text-zinc-500 flex-shrink-0">
												{formatTime(conv.last_message_time)}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<p className="text-xs text-zinc-400 truncate flex-1">
												{conv.last_message}
											</p>
											{conv.unread_count > 0 && (
												<Badge className="bg-emerald-500 text-white text-[9px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center">
													{conv.unread_count}
												</Badge>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
				{(!isMobile || !showMobileList) && (
					<div className="flex-1 flex flex-col min-w-0">
						<div className="flex items-center gap-2 p-3 border-b border-white/5 bg-zinc-950/80 shrink-0">
							{isMobile && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowMobileList(true)}
									className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
								>
									<ArrowLeft className="h-4 w-4" />
								</Button>
							)}

							<Avatar className="w-9 h-9 rounded-full flex-shrink-0">
								{activeConversation.avatar_url ? (
									<AvatarImage src={activeConversation.avatar_url} />
								) : (
									<AvatarFallback className="bg-zinc-800 text-zinc-400 text-sm">
										{activeConversation.display_name?.[0] || "U"}
									</AvatarFallback>
								)}
							</Avatar>

							<div className="flex-1 min-w-0">
								<p className="text-sm font-bold text-white truncate">
									{activeConversation.display_name}
								</p>
								<p className="text-[10px] text-zinc-500">
									@{activeConversation.username}
								</p>
							</div>

							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
							>
								<Phone className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
							>
								<Video className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</div>

						<div
							ref={chatContainerRef}
							className="flex-1 overflow-y-auto p-4 space-y-2 bg-black/30"
						>
							{messages.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-full text-zinc-500">
									<div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-3">
										<MessageSquare className="h-8 w-8 text-zinc-700" />
									</div>
									<p className="text-sm font-medium">No messages yet</p>
									<p className="text-xs mt-1">
										Say hello to {activeConversation.display_name}
									</p>
								</div>
							) : (
								messages.map((msg, index) => {
									const showAvatar =
										!msg.is_sent_by_me &&
										(index === 0 ||
											messages[index - 1]?.sender_id !== msg.sender_id);

									return (
										<div
											key={msg.id}
											className={`flex ${msg.is_sent_by_me ? "justify-end" : "justify-start"} ${
												showAvatar ? "mt-2" : "mt-0.5"
											}`}
										>
											<div
												className={`flex gap-2 ${msg.is_sent_by_me ? "flex-row-reverse" : "flex-row"}`}
											>
												{!msg.is_sent_by_me && (
													<Avatar className="w-8 h-8 rounded-full flex-shrink-0 mt-1">
														{msg.sender_avatar ? (
															<AvatarImage src={msg.sender_avatar} />
														) : (
															<AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">
																{msg.sender_name?.[0] || "U"}
															</AvatarFallback>
														)}
													</Avatar>
												)}

												<div
													className={`max-w-[75%] ${msg.is_sent_by_me ? "items-end" : "items-start"} flex flex-col`}
												>
													{!msg.is_sent_by_me && showAvatar && (
														<p className="text-[10px] text-zinc-500 mb-0.5 px-1">
															{msg.sender_name}
														</p>
													)}

													<div
														className={`rounded-2xl px-4 py-2.5 ${
															msg.is_sent_by_me
																? "bg-emerald-500 text-black"
																: "bg-zinc-900 text-white border border-white/5"
														}`}
													>
														{msg.image_url && (
															<img
																src={msg.image_url}
																alt="Shared"
																className="rounded-lg max-w-[200px] mb-1.5"
															/>
														)}

														{msg.asset_url && (
															<div className="flex items-center gap-2 p-2 rounded-lg bg-white/10 mb-1.5">
																<Package className="h-4 w-4" />
																<span className="text-xs font-medium truncate">
																	{msg.asset_name || "Shared Asset"}
																</span>
																<a
																	href={msg.asset_url}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-[10px] text-emerald-400 hover:underline"
																>
																	View
																</a>
															</div>
														)}

														{msg.content && (
															<p className="text-sm whitespace-pre-wrap break-words">
																{msg.content}
															</p>
														)}
													</div>

													<div className="flex items-center gap-1 mt-0.5 px-1">
														<span className="text-[9px] text-zinc-500">
															{formatTimeDetailed(msg.created_at)}
														</span>
														{msg.is_sent_by_me &&
															(msg.is_read ? (
																<CheckCheck className="h-3 w-3 text-emerald-400" />
															) : (
																<Check className="h-3 w-3 text-zinc-500" />
															))}
													</div>
												</div>
											</div>
										</div>
									);
								})
							)}
							<div ref={messagesEndRef} />
						</div>

						<div className="p-3 border-t border-white/5 bg-zinc-950/80 shrink-0">
							<div className="flex items-center gap-2">
								<input
									type="file"
									ref={fileInputRef}
									accept="image/*"
									onChange={handleImageUpload}
									className="hidden"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => fileInputRef.current?.click()}
									disabled={isUploading}
									className="h-9 w-9 p-0 text-zinc-400 hover:text-white rounded-xl flex-shrink-0"
								>
									{isUploading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<ImageIcon className="h-4 w-4" />
									)}
								</Button>

								{isUploading && uploadProgress > 0 && (
									<div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
										<div
											className="h-full bg-emerald-400 transition-all duration-300"
											style={{ width: `${uploadProgress}%` }}
										/>
									</div>
								)}

								<Input
									value={inputText}
									onChange={(e) => setInputText(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											sendMessage(inputText);
										}
									}}
									placeholder="Type a message..."
									className="flex-1 bg-zinc-900 border-zinc-800 text-white text-sm rounded-xl h-9"
									disabled={isUploading}
								/>

								<Button
									type="button"
									onClick={() => sendMessage(inputText)}
									disabled={!inputText.trim() || isSending || isUploading}
									className="h-9 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl flex-shrink-0"
								>
									{isSending ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Send className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}

	// ─── Default: Conversation List ────────────────────────────
	return (
		<div className="h-[600px] bg-black rounded-2xl border border-white/5 overflow-hidden">
			<div className="p-3 border-b border-white/5 bg-zinc-950/80">
				<h2 className="text-sm font-bold text-white flex items-center gap-2">
					<MessageSquare className="h-4 w-4 text-emerald-400" />
					Messages
				</h2>
				<p className="text-[10px] text-zinc-500">
					{conversations.length} conversations
				</p>
			</div>

			<div className="overflow-y-auto h-[calc(100%-56px)]">
				{conversations.map((conv) => (
					<div
						key={conv.id}
						role="button"
						tabIndex={0}
						onClick={() => setActiveConversation(conv)}
						className="flex items-center gap-3 px-3 py-3 cursor-pointer transition-all hover:bg-white/5"
					>
						<Avatar className="w-10 h-10 rounded-full flex-shrink-0">
							{conv.avatar_url ? (
								<AvatarImage src={conv.avatar_url} />
							) : (
								<AvatarFallback className="bg-zinc-800 text-zinc-400 text-sm">
									{conv.display_name?.[0] || "U"}
								</AvatarFallback>
							)}
						</Avatar>

						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium text-white truncate">
									{conv.display_name}
								</p>
								<span className="text-[10px] text-zinc-500 flex-shrink-0">
									{formatTime(conv.last_message_time)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<p className="text-xs text-zinc-400 truncate flex-1">
									{conv.last_message}
								</p>
								{conv.unread_count > 0 && (
									<Badge className="bg-emerald-500 text-white text-[9px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center">
										{conv.unread_count}
									</Badge>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
