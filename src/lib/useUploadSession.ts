// hooks/useUploadSession.ts

"use client";

import { useCallback, useEffect, useState } from "react";
import supabase from "@/lib/supabase/client";

interface UploadSession {
	id: string;
	user_id: string;
	platform_name: string;
	title: string;
	description: string;
	price: string;
	category: string;
	asset_type: string;
	cover_image_url: string | null;
	asset_path: string | null;
	progress: number;
	current_step:
		| "idle"
		| "uploading_cover"
		| "uploading_asset"
		| "creating_listing"
		| "complete"
		| "error";
	error_message: string | null;
	created_at: string;
	updated_at: string;
}

export function useUploadSession(userId: string | null, sessionId?: string) {
	const [session, setSession] = useState<UploadSession | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// ─── Load or create session ────────────────────────────────
	const loadSession = useCallback(async () => {
		if (!userId) {
			setLoading(false);
			return;
		}

		try {
			let existingSession: UploadSession | null = null;

			// 1. Check if we have a session ID from localStorage
			const savedSessionId =
				sessionId || localStorage.getItem("upload_session_id");

			if (savedSessionId) {
				const { data, error: fetchError } = await supabase
					.from("upload_sessions")
					.select("*")
					.eq("id", savedSessionId)
					.eq("user_id", userId)
					.maybeSingle();

				if (!fetchError && data) {
					existingSession = data as UploadSession;
					// Update localStorage with the session ID
					localStorage.setItem("upload_session_id", data.id);
				}
			}

			// 2. If no active session, create one
			if (!existingSession) {
				const { data: newSession, error: createError } = await supabase
					.from("upload_sessions")
					.insert({
						user_id: userId,
						platform_name: "",
						title: "",
						description: "",
						price: "",
						category: "",
						asset_type: "",
						cover_image_url: null,
						asset_path: null,
						progress: 0,
						current_step: "idle",
					})
					.select()
					.single();

				if (createError) throw createError;
				existingSession = newSession as UploadSession;
				localStorage.setItem("upload_session_id", existingSession.id);
			}

			setSession(existingSession);
		} catch (err: any) {
			console.error("Session load error:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [userId, sessionId]);

	// ─── Update session ─────────────────────────────────────────
	const updateSession = useCallback(
		async (updates: Partial<UploadSession>) => {
			if (!session) return;

			try {
				const { data, error: updateError } = await supabase
					.from("upload_sessions")
					.update({
						...updates,
						updated_at: new Date().toISOString(),
					})
					.eq("id", session.id)
					.select()
					.single();

				if (updateError) throw updateError;
				setSession(data as UploadSession);
				return data as UploadSession;
			} catch (err: any) {
				console.error("Session update error:", err);
				setError(err.message);
				return null;
			}
		},
		[session],
	);

	// ─── Clear session ──────────────────────────────────────────
	const clearSession = useCallback(async () => {
		if (session) {
			await supabase.from("upload_sessions").delete().eq("id", session.id);
		}
		localStorage.removeItem("upload_session_id");
		setSession(null);
	}, [session]);

	useEffect(() => {
		loadSession();
	}, [loadSession]);

	return {
		session,
		loading,
		error,
		updateSession,
		clearSession,
		loadSession,
	};
}
