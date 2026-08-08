// src/components/steps/BiometricStep.tsx

'use client';

import React, { useEffect, useState } from 'react';
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
  MoveLeft,
  MoveRight,
  ScanFace,
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

  // Sync device detection
  useEffect(() => {
    if (!deviceLoading) {
      onUpdate({ isDesktop: deviceIsDesktop });
      setIsDesktop(deviceIsDesktop);
    }
  }, [deviceIsDesktop, deviceLoading, onUpdate, setIsDesktop]);

  // Auto-start live stream on mobile
  useEffect(() => {
    if (!isDesktop && state.recordingState === 'idle' && !state.videoBlob) {
      const timer = setTimeout(() => {
        initiateFaceVerificationStream();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isDesktop, state.recordingState, state.videoBlob, initiateFaceVerificationStream]);

  // Sync blob / error to parent
  useEffect(() => {
    if (state.videoBlob || state.error) {
      onUpdate({ videoBlob: state.videoBlob, error: state.error });
    }
  }, [state.videoBlob, state.error, onUpdate]);

  // Cleanup on unmount
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

  // Helper to render challenge icon
  const renderChallengeIcon = () => {
    const challenge = (state as any).challenge as string;
    if (challenge === 'look_left') return <MoveLeft className="h-5 w-5 text-emerald-400" />;
    if (challenge === 'look_right') return <MoveRight className="h-5 w-5 text-emerald-400" />;
    return <ScanFace className="h-5 w-5 text-emerald-400" />;
  };

  // ────────────────────────────────────────────────
  // Loading
  // ────────────────────────────────────────────────
  if (deviceLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <span className="font-mono text-xs text-zinc-400">
          Analyzing Hardware Capability...
        </span>
      </div>
    );
  }

  // ────────────────────────────────────────────────
  // Desktop → Mobile Handoff
  // ────────────────────────────────────────────────
  if (isDesktop) {
    const targetUrl = `${mountedOrigin || ''}/m/${username}/onboarding?step=biometric&mobile=true`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=10b981&bgcolor=09090b&data=${encodeURIComponent(
      targetUrl
    )}`;

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
            Biometric verification performs best on high-resolution mobile camera
            sensors with hardware depth detection.
          </p>
        </div>

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

  // ────────────────────────────────────────────────
  // Live Camera + Liveness Flow
  // ────────────────────────────────────────────────
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="select-none space-y-4"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Liveness Verification</span>
        </div>
        <h3 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          Biometric Identity Verification
        </h3>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-zinc-400 sm:text-sm">
          Complete the live face challenges and hold still for 15 seconds. Camera
          permission is required.
        </p>
      </motion.div>

      {/* Error Banner – Retry only */}
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
          <button
            onClick={retry}
            className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400 hover:text-red-300 shrink-0"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </motion.div>
      )}

      {/* Camera Viewport */}
      <motion.div
        variants={scaleIn}
        className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
      >
        <canvas ref={canvasRef} className="hidden" />

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

        {/* Face guides */}
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

        {/* IDLE / COMPLETED */}
        <AnimatePresence>
          {(state.recordingState === 'idle' || state.recordingState === 'done') && (
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
                    Live liveness challenges passed and video secured.
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
                    <span className="block text-xs font-bold text-zinc-200">
                      Start Biometric Scan
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Camera permission required
                    </span>
                  </div>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* INITIALIZING */}
        <AnimatePresence>
          {state.recordingState === 'initializing' && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 bg-zinc-950/85 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
              <p className="text-xs font-bold text-zinc-200">
                Requesting Camera Permission...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DETECTING + CHALLENGES */}
        <AnimatePresence>
          {state.recordingState === 'detecting' && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 bg-zinc-950/75 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center gap-2">
                {renderChallengeIcon()}
                <p className="text-sm font-bold text-white text-center max-w-[240px]">
                  {(state as any).challengeInstruction || 'Position your face in the center'}
                </p>
              </div>

              <div
                className={`rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${
                  state.faceDetected
                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-zinc-900 text-zinc-500'
                }`}
              >
                {state.faceDetected ? '✓ Motion Confirmed' : 'Waiting for movement...'}
              </div>

              {/* Simple challenge progress dots */}
              <div className="flex items-center gap-1.5 mt-1">
                {['center', 'look_left', 'look_right', 'look_center_final'].map((step, idx) => {
                  const current = (state as any).challenge;
                  const order = ['center', 'look_left', 'look_right', 'look_center_final'];
                  const currentIdx = order.indexOf(current);
                  const isActive = idx === currentIdx;
                  const isDone = idx < currentIdx;

                  return (
                    <div
                      key={step}
                      className={`h-1.5 rounded-full transition-all ${
                        isDone
                          ? 'w-4 bg-emerald-400'
                          : isActive
                          ? 'w-6 bg-emerald-400'
                          : 'w-2 bg-zinc-700'
                      }`}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RECORDING HUD */}
        {state.recordingState === 'recording' && (
          <motion.div
            className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/85 px-3.5 py-2.5 backdrop-blur-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-white">
                LIVENESS SCAN
              </span>
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

      {/* Security Footer */}
      <motion.p
        variants={fadeInUp}
        className="flex items-center justify-center gap-1 text-[10px] text-zinc-500"
      >
        <Lock className="h-3 w-3 text-emerald-400" />
        Zero Unencrypted Video Retention — AES-256 Vector Encryption
      </motion.p>
    </motion.div>
  );
}