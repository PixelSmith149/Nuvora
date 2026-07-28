// providers/AppSessionProvider.tsx

"use client";

import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { RealtimeService } from "@/lib/services/realtime.service";
import supabase from "@/lib/supabase/client";

// ============================================================
// TYPES
// ============================================================

interface AppSessionContextType {
	userId: string | null;
	profile: any | null;
	storeData: any | null;
	isLoading: boolean;
	refresh: () => Promise<void>;
	// Form persistence
	saveFormState: (key: string, data: any) => void;
	getFormState: (key: string) => any;
	clearFormState: (key: string) => void;
	// Upload session
	uploadSession: any | null;
	saveUploadProgress: (data: any) => void;
	clearUploadSession: () => void;
}

// ============================================================
// CONTEXT
// ============================================================

const AppSessionContext = createContext<AppSessionContextType | undefined>(
	undefined,
);

export function useAppSession() {
	const context = useContext(AppSessionContext);
	if (!context) {
		throw new Error("useAppSession must be used within AppSessionProvider");
	}
	return context;
}

// ============================================================
// PROVIDER
// ============================================================

export function AppSessionProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [userId, setUserId] = useState<string | null>(null);
	const [profile, setProfile] = useState<any | null>(null);
	const [storeData, setStoreData] = useState<any | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// ─── Session sync ──────────────────────────────────────────
	useEffect(() => {
		let active = true;

		async function syncSession() {
			try {
				const { data: session } = await supabase.auth.getSession();
				if (session.session?.user && active) {
					const uid = session.session.user.id;
					setUserId(uid);

					// Fetch profile
					const { data: p } = await supabase
						.from("profiles")
						.select("*")
						.eq("id", uid)
						.maybeSingle();
					if (p && active) setProfile(p);

					// Fetch store data
					const { data: s } = await supabase
						.from("global_market_stores")
						.select("*")
						.eq("user_id", uid)
						.maybeSingle();
					if (s && active) setStoreData(s);
				}
			} catch (err) {
			} finally {
				if (active) setIsLoading(false);
			}
		}

		syncSession();

		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				if (session?.user && active) {
					setUserId(session.user.id);
					supabase
						.from("profiles")
						.select("*")
						.eq("id", session.user.id)
						.maybeSingle()
						.then(({ data: p }) => {
							if (p && active) setProfile(p);
						});
					supabase
						.from("global_market_stores")
						.select("*")
						.eq("user_id", session.user.id)
						.maybeSingle()
						.then(({ data: s }) => {
							if (s && active) setStoreData(s);
						});
				} else {
					if (active) {
						setUserId(null);
						setProfile(null);
						setStoreData(null);
					}
				}
			},
		);

		return () => {
			active = false;
			authListener.subscription.unsubscribe();
		};
	}, []);

	// ─── Form persistence (localStorage) ──────────────────────
	const saveFormState = useCallback((key: string, data: any) => {
		try {
			localStorage.setItem(`form_${key}`, JSON.stringify(data));
		} catch (e) {}
	}, []);

	const getFormState = useCallback((key: string) => {
		try {
			const data = localStorage.getItem(`form_${key}`);
			return data ? JSON.parse(data) : null;
		} catch (e) {
			return null;
		}
	}, []);

	const clearFormState = useCallback((key: string) => {
		localStorage.removeItem(`form_${key}`);
	}, []);

	// ─── Upload session (IndexedDB for larger data) ──────────
	const [uploadSession, setUploadSession] = useState<any | null>(null);

	const saveUploadProgress = useCallback(async (data: any) => {
		try {
			// Save to localStorage for simplicity
			localStorage.setItem("upload_session", JSON.stringify(data));
			setUploadSession(data);
		} catch (e) {}
	}, []);

	const clearUploadSession = useCallback(() => {
		localStorage.removeItem("upload_session");
		setUploadSession(null);
	}, []);

	// ─── Load upload session on mount ──────────────────────────
	useEffect(() => {
		try {
			const saved = localStorage.getItem("upload_session");
			if (saved) {
				const data = JSON.parse(saved);
				setUploadSession(data);
				// Show a toast to inform user
				if (data.progress > 0 && data.progress < 100) {
					// Toast will be shown by the component
				}
			}
		} catch (e) {}
	}, []);

	// ─── Refresh function ──────────────────────────────────────
	const refresh = useCallback(async () => {
		setIsLoading(true);
		try {
			const { data: session } = await supabase.auth.getSession();
			if (session.session?.user) {
				const uid = session.session.user.id;
				const { data: p } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", uid)
					.maybeSingle();
				if (p) setProfile(p);
				const { data: s } = await supabase
					.from("global_market_stores")
					.select("*")
					.eq("user_id", uid)
					.maybeSingle();
				if (s) setStoreData(s);
			}
		} catch (err) {
		} finally {
			setIsLoading(false);
		}
	}, []);

	return (
		<AppSessionContext.Provider
			value={{
				userId,
				profile,
				storeData,
				isLoading,
				refresh,
				saveFormState,
				getFormState,
				clearFormState,
				uploadSession,
				saveUploadProgress,
				clearUploadSession,
			}}
		>
			{children}
		</AppSessionContext.Provider>
	);
}
