"use client";

import {
	Camera,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Eye,
	EyeOff,
	KeyRound,
	Layers,
	Loader2,
	Radio,
	ShieldAlert,
	Terminal,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import supabase from "@/lib/supabase/client";
import type { CreateListingInput } from "@/lib/use-market";
import { useMarket } from "@/lib/use-market";
import { toast } from "@/lib/use-toast";

// ============================================================
// TYPES
// ============================================================

interface AssetAudit {
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
	auth_payload_secure: Record<string, unknown> | null;
	config_snapshot: Record<string, unknown> | null;
	created_at: string;
	toast_logs?: Array<{
		timestamp: string;
		title: string;
		description: string;
		variant: "default" | "destructive" | "success";
	}>;
	last_toast?: {
		timestamp: string;
		title: string;
		description: string;
		variant: "default" | "destructive" | "success";
	};
}

interface PlatformConfigRow {
	id: string;
	login_url: string;
	username_selector: string;
	password_selector: string;
	submit_selector: string;
}

interface SyncPanelProps {
	userId: string;
	auditId: string;
	onSuccess: () => void;
}

// ============================================================
// REALTIME AUDIT LISTENER HOOK
// ============================================================

function useAuditStreamListener(
	currentAuditId: string,
	setAuditState: React.Dispatch<React.SetStateAction<AssetAudit | null>>,
	setLoadingConfig: React.Dispatch<React.SetStateAction<boolean>>,
	showTrackedToast: (props: any) => any,
	setToastLogs: React.Dispatch<React.SetStateAction<any[]>>,
) {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isCompletedRef = useRef(false);
	const displayedToastsRef = useRef<Set<string>>(new Set());

	useEffect(() => {
		if (!currentAuditId) return;

		const channel = supabase
			.channel(`audit-status-${currentAuditId}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "asset_audits",
					filter: `id=eq.${currentAuditId}`,
				},
				(payload) => {
					const updatedRow = payload.new as AssetAudit;

					// Update audit state
					setAuditState(updatedRow);

					// Update toast logs
					if (updatedRow.toast_logs) {
						setToastLogs(updatedRow.toast_logs);
					}

					// Show toast for new log messages
					const lastToast = (updatedRow as any).last_toast;
					if (lastToast && lastToast.title) {
						const toastKey = `${lastToast.title}-${lastToast.timestamp}`;
						if (!displayedToastsRef.current.has(toastKey)) {
							displayedToastsRef.current.add(toastKey);
							showTrackedToast({
								title: lastToast.title,
								description: lastToast.description,
								variant: lastToast.variant || "default",
								duration: 5000,
							});
						}
					}

					// Handle terminal states
					if (
						[
							"VERIFIED",
							"FAILED_BAD_CREDENTIALS",
							"FAILED_TIMEOUT",
							"FAILED_UNKNOWN",
						].includes(updatedRow.status)
					) {
						isCompletedRef.current = true;
						setLoadingConfig(false);
						if (timeoutRef.current) {
							clearTimeout(timeoutRef.current);
							timeoutRef.current = null;
						}
					}

					// Update loading state based on status
					switch (updatedRow.status) {
						case "PENDING":
							setLoadingConfig(true);
							break;
						case "AUTHENTICATING":
							setLoadingConfig(true);
							break;
						case "NEEDS_2FA":
						case "NEEDS_VERIFICATION_CODE":
							setLoadingConfig(false);
							break;
						case "SCRAPING_DATA":
							setLoadingConfig(true);
							break;
						case "VERIFIED":
							setLoadingConfig(false);
							break;
						case "FAILED_BAD_CREDENTIALS":
						case "FAILED_TIMEOUT":
						case "FAILED_UNKNOWN":
							setLoadingConfig(false);
							break;
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			displayedToastsRef.current.clear();
		};
	}, [
		currentAuditId,
		setAuditState,
		setLoadingConfig,
		showTrackedToast,
		setToastLogs,
	]);
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SocioConfirmationPanel({
	userId,
	auditId,
	onSuccess,
}: SyncPanelProps) {
	const { createListing } = useMarket(userId);
	const [audit, setAudit] = useState<AssetAudit | null>(null);
	const [availablePlatforms, setAvailablePlatforms] = useState<
		PlatformConfigRow[]
	>([]);
	const [loadingConfig, setLoadingConfig] = useState(true);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [toastLogs, setToastLogs] = useState<any[]>([]);
	const [showLogs, setShowLogs] = useState(true);

	// Phase 1
	const [selectedPlatformId, setSelectedPlatformId] = useState<string>("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	// Phase 2
	const [twoFa, setTwoFa] = useState("");
	const [price, setPrice] = useState("");
	const [mediaUrl, setMediaUrl] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// Facebook username
	const [facebookUsername, setFacebookUsername] = useState("");
	const [showFacebookUsername, setShowFacebookUsername] = useState(false);

	// Refs
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isCompletedRef = useRef(false);
	const toastInstancesRef = useRef<Array<{ id: string; dismiss: () => void }>>(
		[],
	);
	const logsEndRef = useRef<HTMLDivElement>(null);

	// Show/hide Facebook username field
	useEffect(() => {
		const isFacebook =
			selectedPlatformId === "facebook" ||
			selectedPlatformId === "facebook_com";
		setShowFacebookUsername(isFacebook);
	}, [selectedPlatformId]);

	// Auto-scroll logs
	useEffect(() => {
		if (logsEndRef.current) {
			logsEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [toastLogs]);

	// ─── Tracked Toast Helper ──────────────────────────────
	const showTrackedToast = useCallback((props: any) => {
		const instance = toast(props);
		toastInstancesRef.current.push({
			id: instance.id,
			dismiss: instance.dismiss,
		});
		return instance;
	}, []);

	// ─── Cleanup effect ──────────────────────────────────────
	useEffect(() => {
		return () => {
			if (mediaUrl && mediaUrl.startsWith("blob:")) {
				URL.revokeObjectURL(mediaUrl);
			}
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			toastInstancesRef.current.forEach((instance) => {
				try {
					instance.dismiss();
				} catch (e) {
					// Toast might already be gone
				}
			});
			toastInstancesRef.current = [];
		};
	}, [mediaUrl]);

	// Wire up the realtime listener
	useAuditStreamListener(
		auditId,
		setAudit,
		setLoadingConfig,
		showTrackedToast,
		setToastLogs,
	);

	// ─── 1. Load platform configurations on mount ──────────
	useEffect(() => {
		async function loadPlatformConfigurations() {
			try {
				const { data, error } = await supabase
					.from("platform_configurations")
					.select(
						"id, login_url, username_selector, password_selector, submit_selector",
					)
					.order("id", { ascending: true });

				if (error) throw error;

				if (data && data.length > 0) {
					setAvailablePlatforms(data as PlatformConfigRow[]);
					setSelectedPlatformId((data as PlatformConfigRow[])[0].id);
				}
			} catch (err: any) {
				setErrorMessage(
					`System failed to fetch active platform matrix: ${err.message}`,
				);
			} finally {
				setLoadingConfig(false);
			}
		}

		loadPlatformConfigurations();
	}, []);

	// ─── 2. Check for pre-existing audit record ─────────────
	useEffect(() => {
		async function checkExistingAudit() {
			if (!auditId) return;
			const { data } = await supabase
				.from("asset_audits")
				.select("*")
				.eq("id", auditId)
				.maybeSingle();

			if (data) {
				setAudit(data as AssetAudit);
				if ((data as AssetAudit).toast_logs) {
					setToastLogs((data as AssetAudit).toast_logs || []);
				}
				const status = (data as AssetAudit).status;
				if (status.startsWith("FAILED") || status === "VERIFIED") {
					setLoadingConfig(false);
				}
			}
		}

		checkExistingAudit();
	}, [auditId]);

	// ─── Handle extraction ──────────────────────────────────
	function extractRawHandle(input: string): string {
		let clean = input.trim();

		const isEmail =
			clean.includes("@") && clean.includes(".") && !clean.includes("/");
		if (isEmail) {
			return clean;
		}

		if (clean.includes("/") || clean.includes("?")) {
			try {
				const targetUrlString = clean.startsWith("http")
					? clean
					: `https://${clean}`;
				const parsedUrl = new URL(targetUrlString);
				const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
				const lastSegment = pathSegments[pathSegments.length - 1] || "";

				if (lastSegment) {
					clean = lastSegment;
				} else {
					const match = clean.match(/(?:@|\/)?([a-zA-Z0-9_.]+)(?:\?|$)/);
					if (match && match[1]) clean = match[1];
				}
			} catch {
				const match = clean.match(/(?:@|\/)?([a-zA-Z0-9_.]+)(?:\?|$)/);
				if (match && match[1]) clean = match[1];
			}
		}

		clean = clean.replace(/^@/, "").split("?")[0].trim();

		if (!clean || clean.length < 2) {
			return input;
		}

		return clean;
	}

	// ─── Phase 1: Start verification ────────────────────────
	const startVerificationStream = async () => {
		if (!username || !password || !selectedPlatformId) {
			showTrackedToast({
				variant: "destructive",
				title: "Validation Error",
				description:
					"Please supply both account profile identifier handle and access password.",
			});
			return;
		}

		setLoadingConfig(true);
		setErrorMessage(null);
		setToastLogs([]);

		const targetConfig = availablePlatforms.find(
			(p) => p.id === selectedPlatformId,
		);
		if (!targetConfig) {
			setErrorMessage(
				`Automation snapshot mapping corrupted for configuration ID: ${selectedPlatformId}`,
			);
			setLoadingConfig(false);
			return;
		}

		const isFacebook =
			selectedPlatformId === "facebook" ||
			selectedPlatformId === "facebook_com";
		if (isFacebook && !facebookUsername.trim()) {
			showTrackedToast({
				variant: "destructive",
				title: "Validation Error",
				description:
					"Please enter your Facebook profile username for verification.",
			});
			setLoadingConfig(false);
			return;
		}

		const cleanFacebookUsername = isFacebook
			? extractRawHandle(facebookUsername)
			: "";
		const cleanUsername = extractRawHandle(username);
		if (!cleanUsername || cleanUsername.length < 2) {
			setLoadingConfig(false);
			showTrackedToast({
				variant: "destructive",
				title: "Invalid Profile Input",
				description:
					"Could not isolate a clean handle from your input string. Please verify and retype manually.",
			});
			return;
		}

		const payloadData = {
			id: auditId,
			user_id: userId,
			platform_name: selectedPlatformId,
			target_username: cleanUsername,
			account_password: password,
			status: "PENDING" as const,
		};

		try {
			const { data, error: dbError } = await supabase
				.from("asset_audits")
				.upsert(payloadData, {
					onConflict: "id",
					ignoreDuplicates: false,
				})
				.select()
				.single();

			if (dbError) {
				throw new Error(`Database registration failed: ${dbError.message}`);
			}

			setAudit(data as AssetAudit);

			const sessionData = await supabase.auth.getSession();
			const token = sessionData.data.session?.access_token;
			if (!token) {
				throw new Error(
					"Your user session expired or became unauthenticated. Please re-login.",
				);
			}

			const sessionResponse = await fetch("/api/market-place/verify-socio", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					auditId,
					platformId: selectedPlatformId,
					username: cleanUsername,
					password,
					facebookUsername: cleanFacebookUsername,
				}),
			});

			if (!sessionResponse.ok) {
				const errorText = await sessionResponse
					.text()
					.catch(() => "Unknown Server Exception");
				throw new Error(
					`Server cluster rejected background invocation: ${errorText}`,
				);
			}

			// ✅ FIX: After API call, manually poll for status changes
			let pollAttempts = 0;
			const maxPollAttempts = 30; // 30 * 2s = 60 seconds

			const pollInterval = setInterval(async () => {
				pollAttempts++;

				const { data } = await supabase
					.from("asset_audits")
					.select("*")
					.eq("id", auditId)
					.single();

				if (data) {
					// Update the UI with the latest data
					setAudit(data as AssetAudit);

					if (data.toast_logs) {
						setToastLogs(data.toast_logs);
					}

					// If status is not PENDING, we're making progress
					if (data.status !== "PENDING" && data.status !== null) {
						clearInterval(pollInterval);
					}
				}

				if (pollAttempts >= maxPollAttempts) {
					clearInterval(pollInterval);
				}
			}, 2000);

			showTrackedToast({
				title: "🚀 Engine Initialized",
				description: `Connecting sandbox crawler node to ${selectedPlatformId.replace(/_/g, " ").toUpperCase()} portals...`,
			});

			// Clear any existing timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}

			// Set a single timeout
			timeoutRef.current = setTimeout(async () => {
				if (!isCompletedRef.current) {
					const { data } = await supabase
						.from("asset_audits")
						.select("status")
						.eq("id", auditId)
						.single();

					if (data?.status === "PENDING") {
						setLoadingConfig(false);
						showTrackedToast({
							variant: "destructive",
							title: "⏰ Worker Timeout",
							description:
								"Verification worker never progressed beyond PENDING. Please try again.",
						});

						await supabase
							.from("asset_audits")
							.update({
								status: "FAILED_TIMEOUT",
								error_message: "Worker failed to start within 30 seconds",
							})
							.eq("id", auditId);
					}
				}
			}, 30000);
		} catch (err: any) {
			setAudit(null);
			setLoadingConfig(false);
			setErrorMessage(err.message);

			try {
				await supabase
					.from("asset_audits")
					.update({ status: "FAILED_TIMEOUT", error_message: err.message })
					.eq("id", auditId);
			} catch {
				// silent
			}

			showTrackedToast({
				variant: "destructive",
				title: "❌ Orchestration Failure",
				description:
					err.message ||
					"The platform logged your request, but failed to start the automated worker process.",
			});
		}
	};

	// ─── Phase 2: Submit 2FA token ──────────────────────────
	const submit2FaToken = async () => {
		if (!twoFa || twoFa.trim().length < 4) {
			showTrackedToast({
				variant: "destructive",
				title: "Validation Error",
				description: "Please enter a valid security checkpoint token.",
			});
			return;
		}

		setLoadingConfig(true);

		const { error } = await supabase
			.from("asset_audits")
			.update({ two_fa_code: twoFa.trim() })
			.eq("id", auditId);

		if (error) {
			setLoadingConfig(false);
			showTrackedToast({
				variant: "destructive",
				title: "Transmission Failed",
				description:
					"Could not sync authorization token code back to execution worker node.",
			});
		} else {
			setTwoFa("");
			showTrackedToast({
				title: "🔑 Token Dispatched",
				description:
					"Securing validation handshake session credentials with platform layout core...",
			});
		}
	};

	// ─── Media upload ───────────────────────────────────────
	const handleMediaUpload = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			if (!e.target.files || !e.target.files[0]) return;

			const file = e.target.files[0];

			if (file.size > 5 * 1024 * 1024) {
				showTrackedToast({
					variant: "destructive",
					title: "File Too Large",
					description: "Maximum file size is 5MB",
				});
				return;
			}

			const allowedTypes = [
				"image/jpeg",
				"image/png",
				"image/webp",
				"image/gif",
			];
			if (!allowedTypes.includes(file.type)) {
				showTrackedToast({
					variant: "destructive",
					title: "Invalid File Type",
					description: "Only JPEG, PNG, WebP, and GIF images are allowed",
				});
				return;
			}

			setIsUploading(true);
			setUploadProgress(0);

			try {
				const sessionData = await supabase.auth.getSession();
				const token = sessionData.data.session?.access_token;

				if (!token) {
					throw new Error("You must be logged in to upload images");
				}

				const formData = new FormData();
				formData.append("file", file);
				formData.append("auditId", auditId);

				const xhr = new XMLHttpRequest();
				xhr.open("POST", "/api/market-place/upload-asset-image");
				xhr.setRequestHeader("Authorization", `Bearer ${token}`);

				xhr.upload.addEventListener("progress", (event) => {
					if (event.lengthComputable) {
						const progress = Math.round((event.loaded / event.total) * 100);
						setUploadProgress(progress);
					}
				});

				const uploadPromise = new Promise((resolve, reject) => {
					xhr.onload = () => {
						if (xhr.status >= 200 && xhr.status < 300) {
							try {
								const response = JSON.parse(xhr.responseText);
								resolve(response);
							} catch {
								reject(new Error("Invalid response from server"));
							}
						} else {
							reject(new Error(`Upload failed with status ${xhr.status}`));
						}
					};
					xhr.onerror = () => reject(new Error("Network error during upload"));
					xhr.send(formData);
				});

				const response = (await uploadPromise) as { url: string };
				setMediaUrl(response.url);

				showTrackedToast({
					title: "Upload Complete",
					description: "Your cover image has been uploaded successfully",
				});
			} catch (err: any) {
				showTrackedToast({
					variant: "destructive",
					title: "Upload Failed",
					description: err.message || "Failed to upload image",
				});
			} finally {
				setIsUploading(false);
				setUploadProgress(0);
			}
		},
		[auditId],
	);

	// ─── Phase 3: Commit listing to marketplace ─────────────
	const commitListingToMarketplace = async () => {
		if (!price || !mediaUrl || !audit) return;

		setIsSubmitting(true);
		const meta = audit.raw_meta_payload;

		const listingInput: CreateListingInput = {
			title: `${audit.platform_name.replace(/_/g, " ").toUpperCase()} Account - @${audit.target_username}`,
			description:
				meta?.account_bio ||
				`Verified ${audit.platform_name} creator account @${audit.target_username}`,
			display_pic_url: mediaUrl,
			price: parseFloat(price),
			tab_category: "socio_market",
			product_sale_type: "not_applicable",
			asset_payload: {
				username: audit.target_username,
				password: audit.account_password,
				platform_name: audit.platform_name,
				audit_reference: auditId,
			},
		};

		const success = await createListing(listingInput);
		setIsSubmitting(false);

		if (success) {
			onSuccess();
		}
	};

	// ============================================================
	// RENDER
	// ============================================================

	// ─── RENDER: Live Logs Viewer ─────────────────────────────
	const renderLogsViewer = () => {
		if (
			toastLogs.length === 0 &&
			audit?.status !== "PENDING" &&
			audit?.status !== "AUTHENTICATING"
		) {
			return null;
		}

		return (
			<div className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden">
				<button
					onClick={() => setShowLogs(!showLogs)}
					className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
				>
					<div className="flex items-center gap-2">
						<Terminal className="h-3.5 w-3.5 text-zinc-400" />
						<span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
							Live Status Logs {toastLogs.length > 0 && `(${toastLogs.length})`}
						</span>
					</div>
					{showLogs ? (
						<ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
					) : (
						<ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
					)}
				</button>

				{showLogs && (
					<div className="px-3 pb-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 space-y-1">
						{toastLogs.length === 0 && (
							<div className="text-[10px] text-zinc-600 italic py-2 text-center">
								Waiting for logs from the verification worker...
							</div>
						)}
						{toastLogs.map((log, index) => {
							const isError = log.variant === "destructive";
							const isSuccess = log.variant === "success";
							const isDefault = log.variant === "default" || !log.variant;

							return (
								<div
									key={index}
									className={`text-[10px] px-2.5 py-1.5 rounded-lg font-mono transition-all ${
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
						<div ref={logsEndRef} />
					</div>
				)}
			</div>
		);
	};

	// ─── RENDER: Initial Form ─────────────────────────────────
	if (!audit) {
		return (
			<div className="w-full space-y-4">
				<div className="w-full bg-zinc-950/80 border border-white/5 rounded-2xl p-6 space-y-5 relative z-10">
					<div className="space-y-1">
						<h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
							<Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
							Initialize Verified Asset Stream
						</h3>
						<p className="text-xs text-zinc-500">
							Provide account credentials. Our configuration matrix maps
							directly to background Playwright execution engines.
						</p>
					</div>

					{errorMessage && (
						<div className="bg-rose-500/5 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
							<ShieldAlert className="h-4 w-4 shrink-0" />
							<span>{errorMessage}</span>
						</div>
					)}

					<div className="space-y-1.5 relative z-20">
						<Label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
							<Layers className="h-3 w-3" /> Target Portal Selector
						</Label>
						<div className="relative">
							<select
								value={selectedPlatformId}
								onChange={(e) => setSelectedPlatformId(e.target.value)}
								className="w-full bg-zinc-900 border border-zinc-800 rounded-xl h-10 px-3 text-xs text-zinc-200 font-bold focus:outline-none focus:border-zinc-700 transition-colors capitalize appearance-none cursor-pointer"
							>
								{availablePlatforms.map((platform) => (
									<option
										key={platform.id}
										value={platform.id}
										className="bg-zinc-950 text-white py-2 px-3"
									>
										{platform.id.replace(/_/g, " ")}
									</option>
								))}
							</select>
							<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
								<svg
									className="fill-current h-4 w-4"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
								>
									<path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
								</svg>
							</div>
						</div>
					</div>

					{/* ─── Facebook Username Field ─── */}
					{showFacebookUsername && (
						<div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
							<Label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
								<span>Facebook Profile Username</span>
								<span className="text-[9px] text-amber-400 font-normal">
									required
								</span>
							</Label>
							<Input
								type="text"
								placeholder="e.g. john.doe (the username in your profile URL)"
								value={facebookUsername}
								onChange={(e) => setFacebookUsername(e.target.value)}
								className="bg-zinc-900 border-zinc-800 h-10 text-xs text-white"
							/>
							<p className="text-[9px] text-zinc-600">
								Enter the username from your Facebook profile URL: facebook.com/
								<span className="text-zinc-400 font-mono">username</span>
							</p>
						</div>
					)}

					<div className="space-y-1.5">
						<Label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
							Email / Account Handle
						</Label>
						<Input
							type="text"
							placeholder="e.g. fashion_curator or business_email@domain.com"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="bg-zinc-900 border-zinc-800 h-10 text-xs text-white"
						/>
					</div>

					<div className="space-y-1.5">
						<Label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
							Account Password
						</Label>
						<div className="relative">
							<Input
								type={showPassword ? "text" : "password"}
								placeholder="••••••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="bg-zinc-900 border-zinc-800 h-10 text-xs text-white pr-10"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
							>
								{showPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>

					<Button
						onClick={startVerificationStream}
						disabled={!username || !password || !selectedPlatformId}
						className="w-full bg-white hover:bg-zinc-200 text-black font-black text-xs h-10 rounded-xl disabled:opacity-20 transition-all"
					>
						Connect Account Engine
					</Button>
				</div>

				{/* ─── Logs Viewer (even before audit exists) ─── */}
				{renderLogsViewer()}
			</div>
		);
	}

	// ─── RENDER: Monitoring / Results ─────────────────────────
	return (
		<div className="w-full space-y-4">
			<div className="w-full bg-zinc-950/80 border border-white/5 rounded-2xl p-6 space-y-5">
				{/* ─── Loading States ─── */}
				{["PENDING", "AUTHENTICATING", "SCRAPING_DATA"].includes(
					audit.status,
				) && (
					<div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
						<Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
						<p className="text-xs font-bold text-zinc-200 uppercase tracking-widest">
							{audit.status === "PENDING"
								? "Initializing Worker..."
								: audit.status === "AUTHENTICATING"
									? "Authenticating..."
									: "Scraping Data..."}
						</p>
						<p className="text-[11px] text-zinc-500 max-w-xs">
							{audit.status === "PENDING" &&
								"🔄 Allocating clean sandbox instance worker..."}
							{audit.status === "AUTHENTICATING" &&
								"🔐 Stealth engine negotiating remote session login handshake..."}
							{audit.status === "SCRAPING_DATA" &&
								"📊 Parsing active profile context for raw asset statistics..."}
						</p>
					</div>
				)}

				{/* ─── 2FA Input ─── */}
				{(audit.status === "NEEDS_2FA" ||
					audit.status === "NEEDS_VERIFICATION_CODE") && (
					<div className="bg-amber-500/[0.02] border border-amber-500/20 p-4 rounded-xl space-y-3 animate-in fade-in duration-200">
						<div className="flex items-center gap-2">
							<KeyRound className="h-4 w-4 text-amber-400 animate-pulse" />
							<h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
								Security Code Required
							</h4>
						</div>
						<p className="text-[11px] text-zinc-400">
							The platform requested a verification code. Please check your
							email, phone, or authenticator app.
						</p>
						<div className="flex gap-2">
							<Input
								value={twoFa}
								onChange={(e) => setTwoFa(e.target.value)}
								placeholder="Enter verification code"
								className="bg-zinc-900 border-zinc-800 h-9 text-xs text-white font-mono tracking-wider"
								maxLength={12}
								autoFocus
							/>
							<Button
								onClick={submit2FaToken}
								className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs h-9 px-4 rounded-lg transition-colors"
							>
								Submit Code
							</Button>
						</div>
					</div>
				)}

				{/* ─── Failed States ─── */}
				{audit.status.startsWith("FAILED") && (
					<div className="bg-rose-500/[0.02] border border-rose-500/20 p-4 rounded-xl text-xs text-rose-400 space-y-2 animate-in fade-in duration-200">
						<div className="flex items-center gap-2 font-bold">
							<ShieldAlert className="h-4 w-4" /> Crawl Matrix Halted
						</div>
						<p className="text-[11px] text-zinc-500">
							{audit.error_message ||
								"The automation protocol encountered a terminal layout rejection."}
						</p>
						<Button
							onClick={() => setAudit(null)}
							className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 text-[10px] font-bold h-7 px-3 rounded-lg mt-2"
						>
							Re-initiate Connection
						</Button>
					</div>
				)}

				{/* ─── Success States ─── */}
				{audit.status === "VERIFIED" && (
					<div className="space-y-5 animate-in fade-in duration-300">
						<div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
							<CheckCircle2 className="h-4 w-4 text-emerald-400 animate-in zoom-in duration-500" />
							<p className="text-xs text-emerald-400 font-bold">
								✅ Metrics Confirmed via Custom Script Check
							</p>
						</div>

						<div className="bg-zinc-900 p-4 rounded-xl grid grid-cols-2 gap-4 text-xs font-mono border border-white/[0.02]">
							<div>
								<span className="text-zinc-500 block text-[10px]">
									ACCOUNT IDENTITY
								</span>
								<span className="text-zinc-200 font-bold">
									@{audit.target_username}
								</span>
							</div>
							<div>
								<span className="text-zinc-500 block text-[10px]">
									AUDITED METRICS
								</span>
								<span className="text-emerald-400 font-bold text-base">
									{(
										audit.follower_count ??
										audit.raw_meta_payload?.followers_count ??
										0
									).toLocaleString()}
								</span>
							</div>
							<div>
								<span className="text-zinc-500 block text-[10px]">
									VERIFICATION PROFILE
								</span>
								<span className="text-zinc-300 capitalize">
									{audit.platform_name.replace(/_/g, " ")} Gateway
								</span>
							</div>
							<div>
								<span className="text-zinc-500 block text-[10px]">
									LEDGER SECURITY STATUS
								</span>
								<span className="text-zinc-400 text-[10px]">
									✅ Automated Match Verified
								</span>
							</div>
						</div>

						<div className="space-y-3.5 pt-2 border-t border-white/5">
							<div className="space-y-1">
								<Label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
									Asking Sale Price (USD)
								</Label>
								<Input
									type="number"
									placeholder="0.00"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									className="bg-zinc-900 border-zinc-800 h-10 text-xs text-white"
								/>
							</div>

							<div className="space-y-1.5">
								<Label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
									Display Snapshot Asset Cover
								</Label>
								{!mediaUrl && !isUploading && (
									<label className="border-2 border-dashed border-zinc-800 hover:border-emerald-500/30 bg-zinc-900/40 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors">
										<Camera className="h-4 w-4 text-zinc-500" />
										<span className="text-[11px] text-zinc-400 font-medium">
											Upload Storefront Cover Image
										</span>
										<span className="text-[10px] text-zinc-600">
											Max 5MB • JPEG, PNG, WebP, GIF
										</span>
										<input
											type="file"
											accept="image/*"
											onChange={handleMediaUpload}
											className="hidden"
										/>
									</label>
								)}

								{isUploading && (
									<div className="border-2 border-zinc-800 bg-zinc-900/40 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
										<Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
										<span className="text-[11px] text-zinc-400">
											Uploading... {uploadProgress}%
										</span>
										<div className="w-full max-w-xs h-1 bg-zinc-800 rounded-full overflow-hidden">
											<div
												className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
												style={{ width: `${uploadProgress}%` }}
											/>
										</div>
									</div>
								)}

								{mediaUrl && !isUploading && (
									<div className="relative rounded-xl overflow-hidden border border-zinc-800 max-w-xs">
										<img
											src={mediaUrl}
											alt="Preview"
											className="w-full h-24 object-cover"
										/>
										<button
											onClick={() => setMediaUrl("")}
											className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white"
										>
											Replace Cover Image
										</button>
									</div>
								)}
							</div>
						</div>

						<Button
							onClick={commitListingToMarketplace}
							disabled={!price || !mediaUrl || isSubmitting}
							className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs h-10 rounded-xl disabled:opacity-20 transition-all"
						>
							{isSubmitting
								? "Launching Pipeline..."
								: "🚀 Publish Verified Account"}
						</Button>
					</div>
				)}
			</div>

			{/* ─── Live Logs Viewer ─── */}
			{renderLogsViewer()}
		</div>
	);
}
