'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lock,
  Smartphone,
  Video,
  ShieldCheck,
  RefreshCw,
  UploadCloud,
} from 'lucide-react';
import { BiometricState } from '@/types';
import { useBiometricVerification } from '@/hooks/useBiometricVerification';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { fadeInUp, staggerContainer, scaleIn } from '@/utils/animations';

interface BiometricStepProps {
  username: string;
  userId: string;
  biometricState: BiometricState;
  onUpdate: (updates: Partial<BiometricState>) => void;
  onComplete: (videoUrl: string) => Promise<void>;
  onError: () => void;
}

export function BiometricStep({
  username,
  userId,
  biometricState,
  onUpdate,
  onComplete,
  onError,
}: BiometricStepProps) {
  const { isDesktop: deviceIsDesktop, isLoading: deviceLoading } = useDeviceDetection();
  const [mountedOrigin, setMountedOrigin] = useState<string>('');
  const [useFallbackUpload, setUseFallbackUpload] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    state,
    isDesktop,
    setIsDesktop,
    videoRef,
    canvasRef,
    initiateFaceVerificationStream,
    retry,
    cleanup,
  } = useBiometricVerification(userId, onComplete);

  // Defer origin capture for SSR safety
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMountedOrigin(window.location.origin);
    }
  }, []);

  // Sync device detection safely
  useEffect(() => {
    if (!deviceLoading) {
      onUpdate({ isDesktop: deviceIsDesktop });
      setIsDesktop(deviceIsDesktop);
    }
  }, [deviceIsDesktop, deviceLoading, onUpdate, setIsDesktop]);

  // Handle auto-stream initialization for mobile devices
  useEffect(() => {
    if (!isDesktop && !useFallbackUpload && state.recordingState === 'idle' && !state.videoBlob) {
      const timer = setTimeout(() => {
        initiateFaceVerificationStream();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isDesktop, useFallbackUpload, state.recordingState, state.videoBlob, initiateFaceVerificationStream]);

  // Sync local biometric recording updates with parent state hook
  useEffect(() => {
    if (state.videoBlob) {
      onUpdate({ videoBlob: state.videoBlob, error: state.error });
    }
  }, [state.videoBlob, state.error, onUpdate]);

  // Ensure camera streams shut down when component unmounts
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleDesktopOverride = () => {
    setIsDesktop(false);
    onUpdate({ isDesktop: false });
    setTimeout(() => {
      initiateFaceVerificationStream();
    }, 300);
  };

  const handleManualVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate({ videoBlob: file, error: null });
    }
  };

  // Device Detection Loader State
  if (deviceLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <span className="font-mono text-xs text-zinc-400">Analyzing Hardware Capability...</span>
      </div>
    );
  }

  // Desktop Mobile Handoff Screen
  if (isDesktop) {
    const targetUrl = `${mountedOrigin || ''}/m/${username}/onboarding?step=biometric&mobile=true`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=10b981&bgcolor=09090b&data=${encodeURIComponent(targetUrl)}`;

    return (
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col items-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-black p-6 text-center space-y-5 shadow-2xl backdrop-blur-xl"
      >
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400">
          <Smartphone className="h-8 w-8" />
        </div>

        <div className="space-y-1">
          <h4 className="text-base font-extrabold text-white sm:text-lg">
            Mobile Camera Preferred
          </h4>
          <p className="max-w-sm text-xs leading-relaxed text-zinc-400">
            Biometric verification performs best on high-resolution mobile camera sensors with hardware depth detection.
          </p>
        </div>

        {/* QR CODE CONTAINER */}
        <div className="relative rounded-2xl border border-emerald-500/30 bg-zinc-950 p-3 shadow-2xl">
          <img
            src={qrImageUrl}
            alt="Secure Mobile Session Link"
            className="h-40 w-40 rounded-lg"
          />
        </div>

        <button
          onClick={handleDesktopOverride}
          className="text-xs text-zinc-500 transition-colors underline underline-offset-4 hover:text-zinc-300"
        >
          Bypass mobile handoff & use desktop webcam
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="select-none space-y-4"
    >
      {/* --- STEP HEADER --- */}
      <motion.div variants={fadeInUp} className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Liveness Verification</span>
        </div>
        <h3 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          Biometric Identity Verification
        </h3>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-zinc-400 sm:text-sm">
          Perform a brief 15-second facial audit to verify identity and unlock merchant privileges.
        </p>
      </motion.div>

      {/* ERROR BANNER WITH FALLBACK TOGGLE */}
      {state.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300 backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span className="leading-snug">{state.error}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={retry}
              className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs font-bold text-red-400 hover:text-red-300"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
            <button
              onClick={() => setUseFallbackUpload(true)}
              className="rounded-lg border border-white/10 bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300 hover:bg-zinc-700"
            >
              Upload Instead
            </button>
          </div>
        </motion.div>
      )}

      {/* --- CAMERA / FALLBACK VIEWPORT HUD --- */}
      <motion.div
        variants={scaleIn}
        className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
      >
        <canvas ref={canvasRef} className="hidden" width="80" height="80" />

        {/* Hidden Fallback Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          capture="user"
          className="hidden"
          onChange={handleManualVideoUpload}
        />

        {useFallbackUpload ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
            <UploadCloud className="h-10 w-10 text-emerald-400" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-white">Record or Select Video File</p>
              <p className="text-xs text-zinc-400 max-w-xs">
                Camera access restricted? Record a brief 10-15 second video clip showing your face clearly.
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-black transition-all hover:bg-emerald-500"
            >
              Choose Video File
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover scale-x-[-1] transition-opacity duration-300 ${
                state.recordingState === 'detecting' || state.recordingState === 'recording'
                  ? 'opacity-100'
                  : 'absolute inset-0 opacity-0'
              }`}
            />

            {(state.recordingState === 'detecting' || state.recordingState === 'recording') && (
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
                <div className="flex justify-between">
                  <div className="h-4 w-4 rounded-tl border-l-2 border-t-2 border-emerald-400/80" />
                  <div className="h-4 w-4 rounded-tr border-r-2 border-t-2 border-emerald-400/80" />
                </div>
                <div className="pointer-events-none absolute inset-0 m-auto h-56 w-44 rounded-[50%] border-2 border-dashed border-emerald-500/40" />
                <div className="flex justify-between">
                  <div className="h-4 w-4 rounded-bl border-b-2 border-l-2 border-emerald-400/80" />
                  <div className="h-4 w-4 rounded-br border-b-2 border-r-2 border-emerald-400/80" />
                </div>
              </div>
            )}
          </>
        )}

        {/* STATE: IDLE OR COMPLETED */}
        <AnimatePresence>
          {!useFallbackUpload && (state.recordingState === 'idle' || state.recordingState === 'done') && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {state.recordingState === 'done' || biometricState.videoBlob ? (
                <div className="text-center space-y-2">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h5 className="text-sm font-bold text-emerald-400">
                    Biometric Verification Complete
                  </h5>
                  <p className="text-[11px] text-zinc-400">
                    Facial liveness telemetry cryptographically signed and stored.
                  </p>
                  <button
                    onClick={() => {
                      cleanup();
                      setTimeout(() => initiateFaceVerificationStream(), 300);
                    }}
                    className="mx-auto block pt-2 text-xs text-zinc-500 underline hover:text-zinc-300"
                  >
                    Re-record Verification Stream
                  </button>
                </div>
              ) : (
                <button
                  onClick={initiateFaceVerificationStream}
                  className="group flex flex-col items-center gap-3"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-zinc-900 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all group-hover:scale-105">
                    <Video className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <span className="block text-xs font-bold text-zinc-200">Start Biometric Scan</span>
                    <span className="text-[10px] text-zinc-500">Requires camera permissions</span>
                  </div>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATE: INITIALIZING OR DETECTING */}
        <AnimatePresence>
          {!useFallbackUpload && (state.recordingState === 'initializing' || state.recordingState === 'detecting') && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 bg-zinc-950/80 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
              <p className="text-xs font-bold text-zinc-200">
                {state.recordingState === 'initializing'
                  ? 'Accessing Camera Hardware...'
                  : 'Calibrating Facial Vectors...'}
              </p>
              <div
                className={`rounded-full border px-3 py-0.5 font-mono text-[10px] font-bold uppercase ${
                  state.faceDetected
                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-zinc-900 text-zinc-500'
                }`}
              >
                {state.faceDetected ? '✓ Subject Detected' : 'Position Face In Center'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATE: RECORDING BOTTOM BAR HUD */}
        {!useFallbackUpload && state.recordingState === 'recording' && (
          <motion.div
            className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/85 px-3.5 py-2.5 backdrop-blur-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-white">LIVENESS SCAN</span>
            </div>

            <div className="relative h-4 w-28 overflow-hidden rounded-full border border-white/10 bg-zinc-900">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${(state.recordingTime / 15) * 100}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-black text-white">
                {state.recordingTime}s / 15s
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* --- FOOTER SECURITY NOTE --- */}
      <motion.p variants={fadeInUp} className="flex items-center justify-center gap-1 text-[10px] text-zinc-500">
        <Lock className="h-3 w-3 text-emerald-400" />
        Zero Unencrypted Video Retention — AES-256 Vector Encryption
      </motion.p>
    </motion.div>
  );
}