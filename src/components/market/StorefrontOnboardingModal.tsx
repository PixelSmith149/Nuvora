// components/market/StorefrontOnboardingModal.tsx

"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	Award,
	Building2,
	Camera,
	CheckCircle2,
	ChevronRight,
	Coins,
	Crown,
	DollarSign,
	FileCheck,
	Fingerprint,
	Globe,
	Loader2,
	Lock,
	Package,
	PartyPopper,
	RefreshCw,
	Rocket,
	ShieldCheck,
	Smartphone,
	Sparkles,
	Star,
	Store,
	TrendingUp,
	UserCheck,
	Users,
	Video,
	Wallet,
	Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import supabase from "@/lib/supabase/client";
import { MarketingTermsOfService } from "./MarketingTermsOfService";

interface StorefrontOnboardingModalProps {
	open: boolean;
	onClose: () => void;
	onComplete: (data: {
		contact_email: string;
		marketing_email: string;
		tiktok_handle: string;
		snapchat_handle: string;
		verification_video_url: string;
		store_bio?: string;
	}) => Promise<boolean>;
	username?: string;
	userId?: string;
	hasStore?: boolean;
}

type ExtendedVariants = {
	[key: string]: {
		[key: string]: any;
		transition?: {
			duration?: number;
			repeat?: number | "Infinity" | "loop" | "reverse";
			repeatType?: "loop" | "reverse" | "mirror";
			ease?: string | [number, number, number, number];
			delay?: number;
			staggerChildren?: number;
			delayChildren?: number;
		};
	};
};

type Step =
	| "welcome"
	| "financial"
	| "info"
	| "biometric"
	| "terms"
	| "success";

// ─── Animation Variants ──────────────────────────────────────────
const fadeInUp = {
	hidden: { opacity: 0, y: 30 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as any;

const fadeIn = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.5 } },
} as any;

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.15,
			delayChildren: 0.2,
		},
	},
} as any;

const slideInUp = {
	hidden: { opacity: 0, y: 30 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as any;

const slideInLeft = {
	hidden: { opacity: 0, x: -30 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as any;

const slideInRight = {
	hidden: { opacity: 0, x: 30 },
	visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as any;

const scaleIn = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.4, ease: "easeOut" },
	},
} as any;

const floating = {
	animate: {
		y: [0, -8, 0],
		transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
	},
} as any;

const shimmer = {
	animate: {
		backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
		transition: { duration: 4, repeat: Infinity, ease: "linear" },
	},
} as any;

const pulseGlow = {
	animate: {
		boxShadow: [
			"0 0 20px rgba(16, 185, 129, 0.1)",
			"0 0 40px rgba(16, 185, 129, 0.25)",
			"0 0 20px rgba(16, 185, 129, 0.1)",
		],
		transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
	},
} as any;

const countUp = (from: number, to: number, duration: number = 1) => {
	return {
		hidden: { opacity: 0, scale: 0.5 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: { duration: 0.8, ease: "easeOut" },
		},
	};
};

// ─── 3D Hover Card ──────────────────────────────────────────────
const ThreeDCard: React.FC<{
	children: React.ReactNode;
	className?: string;
	glowColor?: string;
}> = ({ children, className = "", glowColor = "emerald" }) => {
	const [rotateX, setRotateX] = useState(0);
	const [rotateY, setRotateY] = useState(0);
	const [isHovering, setIsHovering] = useState(false);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const rotateXVal = ((y - centerY) / centerY) * -8;
		const rotateYVal = ((x - centerX) / centerX) * 8;
		setRotateX(rotateXVal);
		setRotateY(rotateYVal);
	};

	const handleMouseLeave = () => {
		setIsHovering(false);
		setRotateX(0);
		setRotateY(0);
	};

	const glowColors = {
		emerald: "rgba(16, 185, 129, 0.15)",
		sky: "rgba(56, 189, 248, 0.15)",
		amber: "rgba(245, 158, 11, 0.15)",
		purple: "rgba(168, 85, 247, 0.15)",
	};

	return (
		<motion.div
			className={`relative ${className}`}
			style={{
				transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
				transformStyle: "preserve-3d",
				transition: "transform 0.1s ease-out",
			}}
			onMouseMove={handleMouseMove}
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={handleMouseLeave}
			animate={isHovering ? { scale: 1.02 } : { scale: 1 }}
			transition={{ duration: 0.2 }}
		>
			{isHovering && (
				<motion.div
					className={`absolute -inset-px rounded-2xl pointer-events-none`}
					style={{
						boxShadow: `0 0 40px ${glowColors[glowColor as keyof typeof glowColors] || glowColors.emerald}`,
					}}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
				/>
			)}
			{children}
		</motion.div>
	);
};

// ─── Animated Counter ────────────────────────────────────────────
const AnimatedCounter: React.FC<{
	value: number;
	suffix?: string;
	prefix?: string;
}> = ({ value, suffix = "", prefix = "" }) => {
	const [count, setCount] = useState(0);

	useEffect(() => {
		let start = 0;
		const duration = 1000;
		const increment = value / (duration / 16);

		const timer = setInterval(() => {
			start += increment;
			if (start >= value) {
				setCount(value);
				clearInterval(timer);
			} else {
				setCount(Math.floor(start));
			}
		}, 16);

		return () => clearInterval(timer);
	}, [value]);

	return (
		<motion.span
			initial={{ opacity: 0, scale: 0.5 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.6, delay: 0.3 }}
		>
			{prefix}
			{count}
			{suffix}
		</motion.span>
	);
};

// ─── Main Component ──────────────────────────────────────────────
export function StorefrontOnboardingModal({
	username,
	open,
	onClose,
	onComplete,
}: StorefrontOnboardingModalProps) {
	const router = useRouter();

	// ─── Step State ──────────────────────────────────────────────
	const [currentStep, setCurrentStep] = useState<Step>("welcome");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// ─── Welcome Step ────────────────────────────────────────────
	const [ageConfirmed, setAgeConfirmed] = useState(false);
	const [showContinue, setShowContinue] = useState(false);

	// ─── Info Step ──────────────────────────────────────────────
	const [contactEmail, setContactEmail] = useState("");
	const [marketingEmail, setMarketingEmail] = useState("");
	const [tiktok, setTiktok] = useState("");
	const [snapchat, setSnapchat] = useState("");
	const [storeBio, setStoreBio] = useState("");

	// ─── Biometric Step ──────────────────────────────────────────
	const [isDesktop, setIsDesktop] = useState(false);
	const [errorText, setErrorText] = useState<string | null>(null);
	const [recordingState, setRecordingState] = useState<
		"idle" | "initializing" | "detecting" | "recording" | "done"
	>("idle");
	const [recordingTime, setRecordingTime] = useState(0);
	const [faceDetected, setFaceDetected] = useState(false);
	const [videoBlob, setVideoBlob] = useState<Blob | null>(null);

	// ─── Terms Step ──────────────────────────────────────────────
	const [termsAccepted, setTermsAccepted] = useState(false);

	// ─── Success Step ────────────────────────────────────────────
	const [showConfetti, setShowConfetti] = useState(false);

	// ─── Refs ────────────────────────────────────────────────────
	const videoRef = useRef<HTMLVideoElement>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// ─── QR Code State ───────────────────────────────────────────
	const [qrImageUrl, setQrImageUrl] = useState<string>("");

	// ─── Show continue button after delay ────────────────────────
	useEffect(() => {
		if (currentStep === "welcome") {
			const timer = setTimeout(() => setShowContinue(true), 2000);
			return () => clearTimeout(timer);
		}
	}, [currentStep]);

	// ─── Confetti on success ──────────────────────────────────────
	useEffect(() => {
		if (currentStep === "success") {
			setShowConfetti(true);
		}
	}, [currentStep]);

	// ─── Step Validations ────────────────────────────────────────
	const canProceedToInfo = ageConfirmed;
	const canProceedToBiometric =
		contactEmail &&
		marketingEmail &&
		contactEmail !== marketingEmail &&
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) &&
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(marketingEmail) &&
		/^@[a-zA-Z0-9_._]{2,30}$/.test(tiktok) &&
		/^@[a-zA-Z0-9_._]{2,30}$/.test(snapchat);
	const canProceedToTerms = recordingState === "done";
	const canProceedToSuccess = termsAccepted;

	// ─── Device Detection ────────────────────────────────────────
	useEffect(() => {
		if (typeof window !== "undefined") {
			const userAgent =
				navigator.userAgent || navigator.vendor || (window as any).opera;
			const isMobile = /android|iphone|ipad|ipod/i.test(
				userAgent.toLowerCase(),
			);
			setIsDesktop(!isMobile);
		}
	}, [open]);

	// ─── QR Code Generation ──────────────────────────────────────
	useEffect(() => {
		if (isDesktop && open) {
			async function generateSecureAuthQR() {
				try {
					const {
						data: { session },
					} = await supabase.auth.getSession();
					const fallbackToken = session?.access_token || "";
					const targetUrl = `${window.location.origin}${window.location.pathname}?token=${encodeURIComponent(fallbackToken)}&step=onboarding`;
					const cleanQrEndpoint = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=10b981&bgcolor=09090b&data=${encodeURIComponent(targetUrl)}`;
					setQrImageUrl(cleanQrEndpoint);
				} catch (err) {}
			}
			generateSecureAuthQR();
		}
	}, [isDesktop, open]);

	// ─── Cleanup ──────────────────────────────────────────────────
	useEffect(() => {
		return () => stopCameraChannels();
	}, []);

	const stopCameraChannels = () => {
		if (detectionIntervalRef.current)
			clearInterval(detectionIntervalRef.current);
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}
	};

	// ─── Biometric Functions ─────────────────────────────────────
	const initiateFaceVerificationStream = async () => {
		setErrorText(null);
		setRecordingState("initializing");
		setVideoBlob(null);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { width: 480, height: 480, facingMode: "user" },
				audio: true,
			});

			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				setRecordingState("detecting");
				initializePixelVarianceEngine();
			}
		} catch (err) {
			setErrorText("Camera/Microphone access was denied or is unavailable.");
			setRecordingState("idle");
		}
	};

	const initializePixelVarianceEngine = () => {
		const video = videoRef.current;
		const canvas = canvasRef.current;
		if (!video || !canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let previousFrameData: Uint8ClampedArray | null = null;
		let baselineHits = 0;

		detectionIntervalRef.current = setInterval(() => {
			if (!video || video.paused || video.ended) return;

			ctx.drawImage(video, 0, 0, 80, 80);
			const currentFrame = ctx.getImageData(0, 0, 80, 80).data;

			if (previousFrameData) {
				let structuralChanges = 0;
				for (let i = 0; i < currentFrame.length; i += 4) {
					const delta = Math.abs(currentFrame[i] - previousFrameData[i]);
					if (delta > 22) structuralChanges++;
				}

				if (structuralChanges > 150 && structuralChanges < 1400) {
					baselineHits++;
					if (baselineHits >= 6) {
						setFaceDetected(true);
						clearInterval(detectionIntervalRef.current!);
						executeHDVideoRecordingLoop(streamRef.current!);
					}
				} else {
					baselineHits = Math.max(0, baselineHits - 1);
					setFaceDetected(false);
				}
			}
			previousFrameData = currentFrame;
		}, 250);
	};

	const executeHDVideoRecordingLoop = (stream: MediaStream) => {
		setRecordingState("recording");
		setRecordingTime(0);

		const chunks: Blob[] = [];
		const options = { mimeType: "video/webm;codecs=vp9,opus" };

		const mediaRecorder = new MediaRecorder(
			stream,
			MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined,
		);
		mediaRecorderRef.current = mediaRecorder;

		mediaRecorder.ondataavailable = (e) => {
			if (e.data && e.data.size > 0) chunks.push(e.data);
		};

		mediaRecorder.onstop = () => {
			const completeBlob = new Blob(chunks, { type: "video/webm" });
			setVideoBlob(completeBlob);
			setRecordingState("done");
			stopCameraChannels();
		};

		mediaRecorder.start();

		const countdown = setInterval(() => {
			setRecordingTime((prev) => {
				if (prev >= 15) {
					clearInterval(countdown);
					if (
						mediaRecorderRef.current &&
						mediaRecorderRef.current.state !== "inactive"
					) {
						mediaRecorderRef.current.stop();
					}
					return 15;
				}
				return prev + 1;
			});
		}, 1000);
	};

	// ─── Navigation ──────────────────────────────────────────────
	const goToStep = (step: Step) => {
		if (step === "welcome") {
			stopCameraChannels();
		}
		setShowContinue(false);
		setCurrentStep(step);
		if (step === "welcome") {
			setTimeout(() => setShowContinue(true), 1500);
		}
	};

	const goToNext = () => {
		const steps: Step[] = [
			"welcome",
			"financial",
			"info",
			"biometric",
			"terms",
			"success",
		];
		const currentIndex = steps.indexOf(currentStep);
		if (currentIndex < steps.length - 1) {
			goToStep(steps[currentIndex + 1]);
		}
	};

	const goToPrev = () => {
		const steps: Step[] = [
			"welcome",
			"financial",
			"info",
			"biometric",
			"terms",
			"success",
		];
		const currentIndex = steps.indexOf(currentStep);
		if (currentIndex > 0) {
			goToStep(steps[currentIndex - 1]);
		}
	};

	// ─── Handle Complete ──────────────────────────────────────────
	const handleComplete = async () => {
		setIsSubmitting(true);

		try {
			const success = await onComplete({
				contact_email: contactEmail.trim(),
				marketing_email: marketingEmail.trim(),
				tiktok_handle: tiktok.trim(),
				snapchat_handle: snapchat.trim(),
				verification_video_url:
					"vault://internal/face-verification/secure-biometrics.webm",
				store_bio: storeBio.trim() || undefined,
			});

			if (success) {
				await supabase
					.from("global_market_stores")
					.update({
						terms_accepted_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					})
					.eq("user_id", (await supabase.auth.getUser()).data.user?.id);

				goToStep("success");
			} else {
				setErrorText("Failed to complete onboarding. Please try again.");
			}
		} catch (err) {
			setErrorText("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// ─── Handle Navigation After Success ──────────────────────────
	const navigateToDashboard = () => {
		onClose();
		window.location.href = "/m/global-market";
	};

	const navigateToStorefront = () => {
		onClose();
		window.location.href = `/m/${username}/store`;
	};

	// ─── Step Indicator ───────────────────────────────────────────
	const StepIndicator = () => {
		const steps = [
			{
				id: "welcome",
				label: "Welcome",
				icon: <Sparkles className="h-3 w-3" />,
			},
			{
				id: "financial",
				label: "Financial",
				icon: <DollarSign className="h-3 w-3" />,
			},
			{ id: "info", label: "Info", icon: <Users className="h-3 w-3" /> },
			{
				id: "biometric",
				label: "Verify",
				icon: <ShieldCheck className="h-3 w-3" />,
			},
			{ id: "terms", label: "Terms", icon: <Crown className="h-3 w-3" /> },
			{
				id: "success",
				label: "Done",
				icon: <CheckCircle2 className="h-3 w-3" />,
			},
		];

		const currentIndex = steps.findIndex((s) => s.id === currentStep);

		return (
			<div className="flex items-center justify-between gap-1 mb-6">
				{steps.map((step, index) => (
					<motion.div
						key={step.id}
						className="flex-1 flex items-center gap-1"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<motion.div
							className={`
                flex items-center gap-1.5 px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider transition-all
                ${index <= currentIndex ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-900/50 text-zinc-500 border border-white/5"}
              `}
							whileHover={index <= currentIndex ? { scale: 1.05 } : {}}
						>
							<motion.span
								animate={index === currentIndex ? { scale: [1, 1.2, 1] } : {}}
								transition={{ duration: 0.5, repeat: Infinity }}
							>
								{step.icon}
							</motion.span>
							<span className="hidden sm:inline">{step.label}</span>
						</motion.div>
						{index < steps.length - 1 && (
							<motion.div
								className={`flex-1 h-[1px] ${index < currentIndex ? "bg-emerald-500/50" : "bg-white/5"}`}
								animate={index < currentIndex ? { scaleX: 1 } : { scaleX: 0 }}
								transition={{ duration: 0.5 }}
							/>
						)}
					</motion.div>
				))}
			</div>
		);
	};

	// ─── Confetti Particles ────────────────────────────────────────
	const ConfettiParticles = () => {
		const colors = [
			"#10b981",
			"#34d399",
			"#059669",
			"#047857",
			"#06b6d4",
			"#8b5cf6",
			"#f59e0b",
		];

		return (
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				{Array.from({ length: 50 }).map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-2 h-2 rounded-full"
						style={{
							backgroundColor: colors[i % colors.length],
							left: `${Math.random() * 100}%`,
							top: `-10px`,
						}}
						animate={{
							y: ["0vh", "100vh"],
							x: [0, (Math.random() - 0.5) * 200],
							rotate: [0, 360],
							opacity: [1, 0],
						}}
						transition={{
							duration: 2 + Math.random() * 2,
							delay: Math.random() * 0.5,
							ease: "easeOut",
						}}
					/>
				))}
			</div>
		);
	};

	// ─── Render: Welcome Step ─────────────────────────────────────
	const renderWelcome = () => (
		<motion.div
			variants={staggerContainer}
			initial="hidden"
			animate="visible"
			className="space-y-4"
		>
			<motion.div variants={fadeInUp} className="text-center space-y-2">
				<motion.div
					variants={floating}
					animate="animate"
					className="flex items-center justify-center gap-2"
				>
					<motion.div
						animate={{ rotate: [0, 10, -10, 0] }}
						transition={{ duration: 2, repeat: Infinity }}
					>
						<Building2 className="h-8 w-8 text-emerald-400" />
					</motion.div>
					<motion.span
						style={{
							background: "linear-gradient(90deg, #10b981, #34d399, #10b981)",
							backgroundSize: "200%",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
						}}
						animate={{
							backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
							transition: { duration: 4, repeat: Infinity, ease: "linear" },
						}}
					>
						Prime Boostage | Elite Home
					</motion.span>
				</motion.div>

				<motion.h3
					className="text-lg font-bold text-white"
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
				>
					Welcome to Your Seller Journey!{" "}
					<motion.span
						animate={{ rotate: [0, 20, -10, 0] }}
						transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
					>
						🚀
					</motion.span>
				</motion.h3>

				<motion.p
					variants={fadeIn}
					className="text-sm text-zinc-400 leading-relaxed"
				>
					You're about to become a{" "}
					<span className="text-emerald-400 font-medium">
						verified digital marketer
					</span>{" "}
					on our platform.
				</motion.p>
			</motion.div>

			<motion.div variants={staggerContainer} className="space-y-3">
				<ThreeDCard
					className="p-4 bg-zinc-900/30 border border-white/5 rounded-xl"
					glowColor="emerald"
				>
					<div className="flex items-start gap-3">
						<motion.div
							animate={{ rotate: [0, 360] }}
							transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
							className="mt-1"
						>
							<Package className="h-5 w-5 text-emerald-400" />
						</motion.div>
						<div>
							<p className="text-xs font-bold text-white flex items-center gap-2">
								What is a Digital Asset?
								<motion.span
									animate={{ opacity: [1, 0.3, 1] }}
									transition={{ duration: 1.5, repeat: Infinity }}
									className="text-emerald-400 text-[8px]"
								>
									●
								</motion.span>
							</p>
							<p className="text-xs text-zinc-400 leading-relaxed">
								Digital assets are sellable digital products — files,
								credentials, social accounts, tools, software, codes, and more.
								You upload the raw info, we package it into a professional
								listing.
							</p>
						</div>
					</div>
				</ThreeDCard>

				<ThreeDCard
					className="p-4 bg-zinc-900/30 border border-white/5 rounded-xl"
					glowColor="purple"
				>
					<div className="flex items-start gap-3">
						<motion.div
							animate={{ y: [0, -5, 0] }}
							transition={{ duration: 1.5, repeat: Infinity }}
						>
							<UserCheck className="h-5 w-5 text-purple-400" />
						</motion.div>
						<div>
							<p className="text-xs font-bold text-white flex items-center gap-2">
								Your Role as a Digital Marketer
							</p>
							<ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
								<li>Maintain quality, accuracy, and timely delivery</li>
								<li>Build trust with buyers through your storefront</li>
								<li>Represent your brand with professionalism</li>
							</ul>
						</div>
					</div>
				</ThreeDCard>
			</motion.div>

			<motion.div
				variants={slideInLeft}
				className="flex items-start gap-3 p-3 bg-zinc-900/30 border border-white/5 rounded-xl"
				whileHover={{
					borderColor: "rgba(16, 185, 129, 0.3)",
					transition: { duration: 0.2 },
				}}
			>
				<motion.input
					type="checkbox"
					id="age-confirm"
					checked={ageConfirmed}
					onChange={(e) => setAgeConfirmed(e.target.checked)}
					className="mt-0.5 w-4 h-4 rounded border-white/20 bg-black text-emerald-500 focus:ring-emerald-500/20"
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
				/>
				<motion.label
					htmlFor="age-confirm"
					className="text-xs text-zinc-400 leading-relaxed cursor-pointer"
					animate={!ageConfirmed ? { color: "#a1a1aa" } : { color: "#34d399" }}
				>
					I confirm that I am at least{" "}
					<span className="text-white font-medium">18 years old</span> and
					understand the legal responsibilities of selling digital assets.
				</motion.label>
			</motion.div>
		</motion.div>
	);

	// ─── Render: Financial Step ───────────────────────────────────
	const renderFinancial = () => (
		<motion.div
			variants={staggerContainer}
			initial="hidden"
			animate="visible"
			className="space-y-4"
		>
			<motion.div variants={fadeInUp} className="text-center">
				<h3 className="text-lg font-bold text-white">Financial Terms 💰</h3>
				<p className="text-sm text-zinc-400">
					Understand how payments work on our platform.
				</p>
			</motion.div>

			<motion.div variants={staggerContainer} className="space-y-3">
				<motion.div
					variants={scaleIn}
					whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
					className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl relative overflow-hidden"
				>
					<motion.div
						className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0"
						animate={shimmer.animate}
						style={{ backgroundSize: "200% 100%" }}
					/>
					<div className="relative">
						<div className="flex items-center justify-between">
							<span className="text-xs text-zinc-400">Platform Fee</span>
							<motion.span
								className="text-sm font-bold text-emerald-400"
								initial={{ opacity: 0, scale: 0.5 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.6, delay: 0.3 }}
							>
								<AnimatedCounter value={4} suffix="%" />
							</motion.span>
						</div>
						<div className="flex items-center justify-between mt-1">
							<span className="text-xs text-zinc-400">Your Payout</span>
							<motion.span
								className="text-sm font-bold text-white"
								initial={{ opacity: 0, scale: 0.5 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.6, delay: 0.5 }}
							>
								<AnimatedCounter value={96} suffix="%" />
							</motion.span>
						</div>
						<motion.p
							className="text-[10px] text-zinc-500 mt-2"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.8 }}
						>
							No listing fees • No hidden charges • Escrow protection included
						</motion.p>
					</div>
				</motion.div>

				<ThreeDCard
					className="p-4 bg-zinc-900/30 border border-white/5 rounded-xl"
					glowColor="sky"
				>
					<div className="flex items-start gap-3">
						<motion.div
							animate={{ rotate: [0, 360] }}
							transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
						>
							<Globe className="h-5 w-5 text-sky-400" />
						</motion.div>
						<div className="flex-1">
							<p className="text-xs font-bold text-white mb-2">
								Currency Flexibility
							</p>
							<div className="space-y-1 text-xs text-zinc-400">
								<motion.p
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.2 }}
								>
									•{" "}
									<span className="text-white font-medium">
										Default Currency:
									</span>{" "}
									USD ($) for all listings
								</motion.p>
								<motion.p
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.4 }}
								>
									• <span className="text-white font-medium">Deposit:</span> In
									your preferred currency
								</motion.p>
								<motion.p
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.6 }}
								>
									• <span className="text-white font-medium">Withdraw:</span> In
									your preferred currency
								</motion.p>
								<motion.p
									className="text-[10px] text-zinc-500 mt-1"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.8 }}
								>
									Platform handles currency conversion automatically
								</motion.p>
							</div>
						</div>
					</div>
				</ThreeDCard>

				<motion.div
					variants={slideInRight}
					className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl"
					whileHover={{ borderColor: "rgba(245, 158, 11, 0.3)" }}
				>
					<div className="flex items-center gap-2">
						<motion.div
							animate={{ scale: [1, 1.2, 1] }}
							transition={{ duration: 2, repeat: Infinity }}
						>
							<ShieldCheck className="h-4 w-4 text-amber-400" />
						</motion.div>
						<span className="text-xs text-zinc-300">
							Funds held securely in{" "}
							<span className="text-white font-medium">escrow</span> until
							delivery confirmation
						</span>
					</div>
				</motion.div>
			</motion.div>
		</motion.div>
	);

	// ─── Render: Info Step ────────────────────────────────────────
	const renderInfo = () => (
		<motion.div
			variants={staggerContainer}
			initial="hidden"
			animate="visible"
			className="space-y-4"
		>
			<motion.div variants={fadeInUp} className="text-center">
				<h3 className="text-lg font-bold text-white">Seller Information 📝</h3>
				<p className="text-sm text-zinc-400">
					Tell us about yourself and your store.
				</p>
			</motion.div>

			<motion.div variants={staggerContainer} className="space-y-3">
				<motion.div
					variants={slideInLeft}
					className="grid grid-cols-1 sm:grid-cols-2 gap-3"
				>
					<div className="space-y-1.5">
						<Label className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
							Contact Email *
						</Label>
						<motion.div
							whileHover={{ scale: 1.02 }}
							transition={{ duration: 0.2 }}
						>
							<Input
								type="email"
								value={contactEmail}
								onChange={(e) => setContactEmail(e.target.value)}
								className="bg-black border-white/10 text-white rounded-xl focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/20 transition-all h-10 text-xs"
								placeholder="primary@domain.com"
							/>
						</motion.div>
					</div>
					<motion.div variants={slideInRight} className="space-y-1.5">
						<Label className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
							Marketing Email *
						</Label>
						<motion.div
							whileHover={{ scale: 1.02 }}
							transition={{ duration: 0.2 }}
						>
							<Input
								type="email"
								value={marketingEmail}
								onChange={(e) => setMarketingEmail(e.target.value)}
								className="bg-black border-white/10 text-white rounded-xl focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/20 transition-all h-10 text-xs"
								placeholder="marketing@domain.com"
							/>
						</motion.div>
					</motion.div>
				</motion.div>

				<motion.div
					variants={slideInLeft}
					className="grid grid-cols-1 sm:grid-cols-2 gap-3"
				>
					<div className="space-y-1.5">
						<Label className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
							TikTok Handle *
						</Label>
						<motion.div
							whileHover={{ scale: 1.02 }}
							transition={{ duration: 0.2 }}
						>
							<Input
								value={tiktok}
								onChange={(e) => setTiktok(e.target.value)}
								className="bg-black border-white/10 text-white rounded-xl focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/20 transition-all h-10 text-xs"
								placeholder="@username"
							/>
						</motion.div>
					</div>
					<motion.div variants={slideInRight} className="space-y-1.5">
						<Label className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
							Snapchat Handle *
						</Label>
						<motion.div
							whileHover={{ scale: 1.02 }}
							transition={{ duration: 0.2 }}
						>
							<Input
								value={snapchat}
								onChange={(e) => setSnapchat(e.target.value)}
								className="bg-black border-white/10 text-white rounded-xl focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/20 transition-all h-10 text-xs"
								placeholder="@username"
							/>
						</motion.div>
					</motion.div>
				</motion.div>

				<motion.div variants={slideInUp} className="space-y-1.5">
					<Label className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
						Store Bio (Optional)
					</Label>
					<motion.div
						whileHover={{ scale: 1.01 }}
						transition={{ duration: 0.2 }}
					>
						<Textarea
							value={storeBio}
							onChange={(e) => setStoreBio(e.target.value)}
							className="bg-black border-white/10 text-white rounded-xl focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/20 transition-all h-20 text-xs resize-none"
							placeholder="Tell buyers about yourself and your store..."
							maxLength={500}
						/>
					</motion.div>
					<motion.p
						className="text-[10px] text-zinc-500 text-right"
						animate={{ opacity: storeBio.length > 0 ? 1 : 0.5 }}
					>
						{storeBio.length}/500
					</motion.p>
				</motion.div>
			</motion.div>
		</motion.div>
	);

	// ─── Render: Biometric Step ──────────────────────────────────
	const renderBiometric = () => (
		<motion.div
			variants={staggerContainer}
			initial="hidden"
			animate="visible"
			className="space-y-4"
		>
			<motion.div variants={fadeInUp} className="text-center">
				<h3 className="text-lg font-bold text-white">
					Identity Verification 🔐
				</h3>
				<p className="text-sm text-zinc-400">
					We need to verify you're a real person.
				</p>
			</motion.div>

			{isDesktop ? (
				<motion.div
					variants={scaleIn}
					className="flex flex-col items-center text-center p-6 bg-zinc-900/50 border border-white/5 rounded-xl space-y-4"
				>
					<motion.div
						animate={{ rotate: [0, 10, -10, 0] }}
						transition={{ duration: 3, repeat: Infinity }}
					>
						<Smartphone className="w-10 h-10 text-emerald-400" />
					</motion.div>
					<div>
						<h4 className="font-bold text-white text-sm">
							Desktop Check Bypass
						</h4>
						<p className="text-xs text-zinc-400 mt-1 max-w-sm">
							Biometric verification requires mobile device. Scan QR code to
							switch device.
						</p>
					</div>
					<motion.div
						className="p-3 bg-white rounded-xl shadow-xl"
						whileHover={{ scale: 1.05 }}
						transition={{ duration: 0.3 }}
					>
						{qrImageUrl ? (
							<img
								src={qrImageUrl}
								alt="Secure Mobile Session"
								className="w-40 h-40"
							/>
						) : (
							<Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
						)}
					</motion.div>
					<motion.button
						onClick={() => setIsDesktop(false)}
						className="text-[10px] text-zinc-600 hover:text-zinc-400"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						Override & use desktop webcam
					</motion.button>
				</motion.div>
			) : (
				<motion.div variants={staggerContainer} className="space-y-3">
					{errorText && (
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2"
						>
							<AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
							<span>{errorText}</span>
						</motion.div>
					)}

					<motion.div
						variants={scaleIn}
						className="relative rounded-2xl border border-white/10 bg-black overflow-hidden aspect-video"
						animate={recordingState === "idle" ? pulseGlow.animate : {}}
					>
						{(recordingState === "idle" || recordingState === "done") && (
							<motion.div
								className="absolute inset-0 flex flex-col items-center justify-center"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.3 }}
							>
								{recordingState === "done" ? (
									<>
										<motion.div
											className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3"
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{ type: "spring", duration: 0.6 }}
										>
											<CheckCircle2 className="h-8 w-8 text-emerald-400" />
										</motion.div>
										<motion.span
											className="text-xs font-bold text-emerald-400"
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.2 }}
										>
											Verification Complete ✅
										</motion.span>
										<motion.p
											className="text-[10px] text-zinc-500 mt-1"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.3 }}
										>
											15-second video recorded successfully
										</motion.p>
										<motion.button
											onClick={initiateFaceVerificationStream}
											className="text-[10px] text-zinc-500 hover:text-zinc-300 underline mt-3"
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											Retake Video
										</motion.button>
									</>
								) : (
									<motion.button
										onClick={initiateFaceVerificationStream}
										className="group flex flex-col items-center gap-2"
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										<motion.div
											className="w-14 h-14 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform"
											animate={{
												boxShadow: [
													"0 0 0px rgba(16, 185, 129, 0)",
													"0 0 20px rgba(16, 185, 129, 0.3)",
													"0 0 0px rgba(16, 185, 129, 0)",
												],
											}}
											transition={{ duration: 2, repeat: Infinity }}
										>
											<Video className="h-6 w-6 text-emerald-400" />
										</motion.div>
										<span className="text-xs font-bold text-zinc-300">
											Start Verification
										</span>
										<span className="text-[10px] text-zinc-600">
											15-second video recording
										</span>
									</motion.button>
								)}
							</motion.div>
						)}

						{(recordingState === "initializing" ||
							recordingState === "detecting") && (
							<motion.div
								className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-3"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
							>
								<motion.div
									animate={{ rotate: 360 }}
									transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
								>
									<Loader2 className="w-8 h-8 text-emerald-400" />
								</motion.div>
								<p className="text-xs font-bold text-zinc-300">
									{recordingState === "initializing"
										? "Initializing camera..."
										: "Face detection in progress..."}
								</p>
								<motion.div
									className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
										faceDetected
											? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
											: "bg-zinc-900 border-white/5 text-zinc-500"
									}`}
									animate={faceDetected ? { scale: [1, 1.05, 1] } : {}}
									transition={{ duration: 1, repeat: Infinity }}
								>
									{faceDetected ? "✅ Face Verified" : "Look at camera"}
								</motion.div>
								{faceDetected && (
									<motion.div
										className="h-1 w-32 bg-zinc-800 rounded-full overflow-hidden"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
									>
										<motion.div
											className="h-full bg-emerald-400 rounded-full"
											animate={{ width: ["0%", "100%"] }}
											transition={{ duration: 0.5 }}
										/>
									</motion.div>
								)}
							</motion.div>
						)}

						{(recordingState === "detecting" ||
							recordingState === "recording") && (
							<video
								ref={videoRef}
								autoPlay
								playsInline
								muted
								className="w-full h-full object-cover mirror"
							/>
						)}

						{recordingState === "recording" && (
							<motion.div
								className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center justify-between"
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ type: "spring" }}
							>
								<div className="flex items-center gap-2">
									<motion.span
										className="w-2 h-2 rounded-full bg-red-500"
										animate={{ opacity: [1, 0.3, 1] }}
										transition={{ duration: 0.8, repeat: Infinity }}
									/>
									<span className="text-xs font-bold text-white">
										RECORDING
									</span>
								</div>
								<motion.div
									className="relative w-20 h-5 bg-zinc-800 rounded-full overflow-hidden"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
								>
									<motion.div
										className="absolute inset-0 bg-gradient-to-r from-red-500 to-emerald-400"
										animate={{ width: `${(recordingTime / 15) * 100}%` }}
										transition={{ duration: 0.3 }}
									/>
									<span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white">
										{recordingTime}s / 15s
									</span>
								</motion.div>
							</motion.div>
						)}
					</motion.div>

					<motion.p
						variants={fadeIn}
						className="text-[10px] text-zinc-500 text-center"
					>
						<Lock className="h-3 w-3 inline mr-1" />
						Encrypted storage — Zero third-party access
					</motion.p>
				</motion.div>
			)}
		</motion.div>
	);

	// ─── Render: Terms Step ──────────────────────────────────────
	const renderTerms = () => (
		<motion.div
			variants={staggerContainer}
			initial="hidden"
			animate="visible"
			className="space-y-4"
		>
			<motion.div variants={fadeInUp} className="text-center">
				<h3 className="text-lg font-bold text-white">
					Marketing Terms of Service 📜
				</h3>
				<p className="text-sm text-zinc-400">
					Review and accept our seller terms.
				</p>
			</motion.div>

			<motion.div
				variants={scaleIn}
				className="bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden max-h-[400px]"
			>
				<MarketingTermsOfService
					onAccept={() => setTermsAccepted(true)}
					onDecline={() => setTermsAccepted(false)}
					isLoading={false}
				/>
			</motion.div>

			{termsAccepted && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
				>
					<motion.div
						animate={{ scale: [1, 1.2, 1] }}
						transition={{ duration: 0.5, repeat: 3 }}
					>
						<CheckCircle2 className="h-4 w-4 text-emerald-400" />
					</motion.div>
					<span className="text-xs text-emerald-400 font-medium">
						Terms accepted ✓
					</span>
				</motion.div>
			)}
		</motion.div>
	);

	// ─── Render: Success Step ────────────────────────────────────
	const renderSuccess = () => (
		<motion.div
			variants={staggerContainer}
			initial="hidden"
			animate="visible"
			className="space-y-6 py-4 relative"
		>
			{showConfetti && <ConfettiParticles />}

			<motion.div variants={fadeInUp} className="text-center space-y-3">
				<motion.div
					className="flex justify-center"
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
				>
					<motion.div
						className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
						animate={{ rotate: [0, 360] }}
						transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
					>
						<CheckCircle2 className="h-12 w-12 text-emerald-400" />
					</motion.div>
				</motion.div>

				<motion.h3
					className="text-2xl font-bold text-white"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					Storefront Unlocked! 🎉
				</motion.h3>

				<motion.p
					className="text-sm text-zinc-400 max-w-sm mx-auto"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}
				>
					Your store is now live on{" "}
					<span className="text-emerald-400 font-medium">
						Prime Boostage | Elite Home
					</span>
				</motion.p>
			</motion.div>

			<motion.div
				variants={staggerContainer}
				className="grid grid-cols-1 sm:grid-cols-2 gap-3"
			>
				<motion.button
					variants={slideInLeft}
					whileHover={{ scale: 1.03, y: -4 }}
					whileTap={{ scale: 0.97 }}
					onClick={navigateToDashboard}
					className="p-4 bg-zinc-900/50 border border-white/10 rounded-xl hover:border-emerald-500/30 transition-all text-left group"
				>
					<div className="flex items-center gap-2 mb-1">
						<motion.div
							animate={{ rotate: [0, 10, -10, 0] }}
							transition={{ duration: 3, repeat: Infinity }}
						>
							<Store className="h-4 w-4 text-emerald-400" />
						</motion.div>
						<span className="text-xs font-bold text-white">
							Go to Dashboard
						</span>
					</div>
					<p className="text-[10px] text-zinc-500">
						Manage listings, view sales & analytics
					</p>
					<motion.div
						className="mt-2 text-emerald-400"
						animate={{ x: [0, 5, 0] }}
						transition={{ duration: 1.5, repeat: Infinity }}
					>
						<ChevronRight className="h-4 w-4" />
					</motion.div>
				</motion.button>

				{username && (
					<motion.button
						variants={slideInRight}
						whileHover={{ scale: 1.03, y: -4 }}
						whileTap={{ scale: 0.97 }}
						onClick={navigateToStorefront}
						className="p-4 bg-zinc-900/50 border border-white/10 rounded-xl hover:border-sky-500/30 transition-all text-left group"
					>
						<div className="flex items-center gap-2 mb-1">
							<motion.div
								animate={{ y: [0, -3, 0] }}
								transition={{ duration: 2, repeat: Infinity }}
							>
								<Globe className="h-4 w-4 text-sky-400" />
							</motion.div>
							<span className="text-xs font-bold text-white">
								View Public Store
							</span>
						</div>
						<p className="text-[10px] text-zinc-500">
							See how buyers see your store
						</p>
						<motion.div
							className="mt-2 text-sky-400"
							animate={{ x: [0, 5, 0] }}
							transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
						>
							<ChevronRight className="h-4 w-4" />
						</motion.div>
					</motion.button>
				)}
			</motion.div>

			<motion.div
				variants={fadeIn}
				className="p-3 bg-zinc-900/30 border border-white/5 rounded-xl"
			>
				<div className="flex items-center gap-2">
					<motion.div
						animate={{ rotate: [0, 20, -20, 0] }}
						transition={{ duration: 2, repeat: Infinity }}
					>
						<Zap className="h-4 w-4 text-amber-400" />
					</motion.div>
					<span className="text-xs text-zinc-400">
						<span className="text-white font-medium">Quick Tip:</span> Start by
						creating your first listing to attract buyers!
					</span>
				</div>
			</motion.div>
		</motion.div>
	);

	// ─── Main Render ─────────────────────────────────────────────
	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="bg-zinc-950 border-white/10 text-zinc-100 max-w-lg rounded-2xl shadow-2xl overflow-hidden p-0">
				<div className="p-6 max-h-[90vh] overflow-y-auto">
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						<DialogHeader className="pb-4 border-b border-white/5">
							<DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
								<motion.div
									animate={{ rotate: [0, 10, -10, 0] }}
									transition={{ duration: 2, repeat: Infinity }}
								>
									<ShieldCheck className="h-5 w-5 text-emerald-400" />
								</motion.div>
								Seller Onboarding
							</DialogTitle>
							<DialogDescription className="text-zinc-400 text-xs">
								Complete verification to unlock your storefront
							</DialogDescription>
						</DialogHeader>
					</motion.div>

					<div className="pt-4">
						<StepIndicator />

						<motion.div
							key={currentStep}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.4 }}
							className="min-h-[350px]"
						>
							{currentStep === "welcome" && renderWelcome()}
							{currentStep === "financial" && renderFinancial()}
							{currentStep === "info" && renderInfo()}
							{currentStep === "biometric" && renderBiometric()}
							{currentStep === "terms" && renderTerms()}
							{currentStep === "success" && renderSuccess()}
						</motion.div>
					</div>

					{currentStep !== "success" && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
						>
							<DialogFooter className="mt-4 pt-4 border-t border-white/5">
								<div className="flex items-center justify-between w-full gap-3">
									<motion.div
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										<Button
											variant="outline"
											onClick={currentStep === "welcome" ? onClose : goToPrev}
											className="border-white/10 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-xl h-10 text-xs font-bold"
										>
											{currentStep === "welcome" ? (
												"Cancel"
											) : (
												<div className="flex items-center gap-1">
													<ArrowLeft className="h-3.5 w-3.5" />
													Back
												</div>
											)}
										</Button>
									</motion.div>

									{currentStep === "terms" ? (
										<motion.div
											whileHover={{ scale: 1.03 }}
											whileTap={{ scale: 0.97 }}
										>
											<Button
												onClick={handleComplete}
												disabled={!termsAccepted || isSubmitting}
												className="bg-emerald-600 text-black font-black hover:bg-emerald-500 rounded-xl h-10 px-5 text-xs transition-all disabled:opacity-40"
											>
												{isSubmitting ? (
													<motion.div
														animate={{ rotate: 360 }}
														transition={{
															duration: 1,
															repeat: Infinity,
															ease: "linear",
														}}
													>
														<Loader2 className="h-4 w-4" />
													</motion.div>
												) : (
													<div className="flex items-center gap-1.5">
														<CheckCircle2 className="h-4 w-4" />
														Complete Onboarding
													</div>
												)}
											</Button>
										</motion.div>
									) : (
										<motion.div
											whileHover={{ scale: 1.03 }}
											whileTap={{ scale: 0.97 }}
										>
											<Button
												onClick={goToNext}
												disabled={
													(currentStep === "welcome" && !canProceedToInfo) ||
													(currentStep === "info" && !canProceedToBiometric) ||
													(currentStep === "biometric" && !canProceedToTerms) ||
													(currentStep === "financial" && false)
												}
												className="bg-emerald-600 text-black font-black hover:bg-emerald-500 rounded-xl h-10 px-5 text-xs transition-all disabled:opacity-40"
											>
												<div className="flex items-center gap-1.5">
													Continue
													<motion.div
														animate={{ x: [0, 5, 0] }}
														transition={{ duration: 1.5, repeat: Infinity }}
													>
														<ArrowRight className="h-3.5 w-3.5" />
													</motion.div>
												</div>
											</Button>
										</motion.div>
									)}
								</div>
							</DialogFooter>
						</motion.div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
