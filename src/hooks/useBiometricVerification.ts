'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { BiometricState } from '@/types';
import { VIDEO_RECORDING_DURATION } from '@/utils/constants';
import { OnboardingService } from '@/services/onboardingService';

type ChallengePhase =
  | 'none'
  | 'center'
  | 'look_left'
  | 'look_right'
  | 'look_center_final'
  | 'passed';

interface ExtendedBiometricState extends BiometricState {
  challenge: ChallengePhase;
  challengeInstruction: string | null;
}

const initialBiometricState: ExtendedBiometricState = {
  isDesktop: false,
  recordingState: 'idle',
  recordingTime: 0,
  faceDetected: false,
  videoBlob: null,
  error: null,
  challenge: 'none',
  challengeInstruction: null,
};

export function useBiometricVerification(
  userId: string,
  onComplete: (videoUrl: string) => Promise<void>
) {
  const [state, setState] = useState<ExtendedBiometricState>(initialBiometricState);
  const [isDesktop, setIsDesktop] = useState(false);

  // DOM & Media Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Timers & Guards
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const isAbortedRef = useRef(false);

  // Challenge tracking
  const challengeHitsRef = useRef(0);
  const consecutiveLostRef = useRef(0);
  const previousFrameRef = useRef<Uint8ClampedArray | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const updateState = useCallback((updates: Partial<ExtendedBiometricState>) => {
    if (!isMounted.current) return;
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const stopCameraChannels = useCallback(() => {
    isAbortedRef.current = true;

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    previousFrameRef.current = null;
    challengeHitsRef.current = 0;
    consecutiveLostRef.current = 0;
  }, []);

  const cleanup = useCallback(() => {
    stopCameraChannels();
    setState(initialBiometricState);
  }, [stopCameraChannels]);

  // ────────────────────────────────────────────────
  // Pure JS Liveness Engine (no third-party models)
  // ────────────────────────────────────────────────
  const analyzeFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    // Higher resolution for better zone analysis
    const W = 160;
    const H = 160;
    canvas.width = W;
    canvas.height = H;

    ctx.drawImage(video, 0, 0, W, H);
    const imageData = ctx.getImageData(0, 0, W, H);
    const data = imageData.data;

    const prev = previousFrameRef.current;
    previousFrameRef.current = new Uint8ClampedArray(data);

    if (!prev) return null;

    // Zone definitions (left / center / right)
    const leftEnd = Math.floor(W * 0.32);
    const rightStart = Math.floor(W * 0.68);

    let leftMotion = 0;
    let centerMotion = 0;
    let rightMotion = 0;
    let totalMotion = 0;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = (y * W + x) * 4;
        const diff =
          Math.abs(data[idx] - prev[idx]) +
          Math.abs(data[idx + 1] - prev[idx + 1]) +
          Math.abs(data[idx + 2] - prev[idx + 2]);

        if (diff > 45) {
          totalMotion++;
          if (x < leftEnd) leftMotion++;
          else if (x > rightStart) rightMotion++;
          else centerMotion++;
        }
      }
    }

    return { leftMotion, centerMotion, rightMotion, totalMotion };
  }, []);

  const executeHDVideoRecordingLoop = useCallback(() => {
    if (!streamRef.current || isAbortedRef.current) return;

    isAbortedRef.current = false;
    updateState({
      recordingState: 'recording',
      recordingTime: 0,
      challenge: 'passed',
      challengeInstruction: 'Hold still and look at the camera',
      faceDetected: true,
    });

    const chunks: Blob[] = [];
    const preferred = 'video/webm;codecs=vp9,opus';
    const mimeType = MediaRecorder.isTypeSupported(preferred)
      ? preferred
      : 'video/webm';

    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      if (isAbortedRef.current || !isMounted.current) return;

      const completeBlob = new Blob(chunks, { type: mimeType });

      // Stronger validation
      if (completeBlob.size < 25_000) {
        updateState({
          error: 'Recording too short or invalid. Please complete the full liveness check.',
          recordingState: 'idle',
          challenge: 'none',
          challengeInstruction: null,
        });
        return;
      }

      updateState({ videoBlob: completeBlob, recordingState: 'done' });

      try {
        const videoUrl = await OnboardingService.uploadVerificationVideo(userId, completeBlob);
        if (!isMounted.current) return;
        await onComplete(videoUrl);
      } catch (error) {
        updateState({
          error: error instanceof Error ? error.message : 'Video upload failed. Please try again.',
          recordingState: 'idle',
          challenge: 'none',
          challengeInstruction: null,
        });
      } finally {
        stopCameraChannels();
      }
    };

    mediaRecorder.start(200);

    // Continuous presence monitor + countdown
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      if (!isMounted.current || isAbortedRef.current) return;

      // Keep checking that a face-like presence remains during recording
      const analysis = analyzeFrame();
      if (analysis) {
        if (analysis.centerMotion < 40 && analysis.totalMotion < 80) {
          consecutiveLostRef.current += 1;
          if (consecutiveLostRef.current >= 8) {
            // Face lost for ~2 seconds → fail
            updateState({
              error: 'Face lost during verification. Please stay in frame and try again.',
              recordingState: 'idle',
              challenge: 'none',
              challengeInstruction: null,
            });
            stopCameraChannels();
            return;
          }
        } else {
          consecutiveLostRef.current = 0;
        }
      }

      setState((prev) => {
        if (prev.recordingTime >= VIDEO_RECORDING_DURATION) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
          return { ...prev, recordingTime: VIDEO_RECORDING_DURATION };
        }
        return { ...prev, recordingTime: prev.recordingTime + 1 };
      });
    }, 1000);
  }, [userId, onComplete, updateState, stopCameraChannels, analyzeFrame]);

  const advanceChallenge = useCallback(
    (next: ChallengePhase, instruction: string) => {
      challengeHitsRef.current = 0;
      updateState({
        challenge: next,
        challengeInstruction: instruction,
        faceDetected: true,
      });
    },
    [updateState]
  );

  const initializeLivenessEngine = useCallback(() => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

    challengeHitsRef.current = 0;
    consecutiveLostRef.current = 0;
    previousFrameRef.current = null;

    updateState({
      recordingState: 'detecting',
      challenge: 'center',
      challengeInstruction: 'Position your face in the center of the frame',
      faceDetected: false,
    });

    detectionIntervalRef.current = setInterval(() => {
      if (!isMounted.current || isAbortedRef.current) return;

      const analysis = analyzeFrame();
      if (!analysis) return;

      const { leftMotion, centerMotion, rightMotion, totalMotion } = analysis;

      // Too little or too chaotic motion → reject
      if (totalMotion < 30 || totalMotion > 4200) {
        challengeHitsRef.current = Math.max(0, challengeHitsRef.current - 1);
        updateState({ faceDetected: false });
        return;
      }

      const currentChallenge = (state.challenge || 'center') as ChallengePhase;

      // We read latest challenge from a ref-like pattern via functional update when needed
      setState((prev) => {
        const phase = prev.challenge;

        let requiredHits = 5; // ~1.25s of good signals
        let success = false;

        if (phase === 'center' || phase === 'none') {
          // Require strong center activity
          success = centerMotion > 90 && centerMotion > leftMotion * 1.3 && centerMotion > rightMotion * 1.3;
          requiredHits = 6;
        } else if (phase === 'look_left') {
          success = leftMotion > 110 && leftMotion > centerMotion * 1.15 && leftMotion > rightMotion * 1.6;
        } else if (phase === 'look_right') {
          success = rightMotion > 110 && rightMotion > centerMotion * 1.15 && rightMotion > leftMotion * 1.6;
        } else if (phase === 'look_center_final') {
          success = centerMotion > 100 && centerMotion > leftMotion * 1.25 && centerMotion > rightMotion * 1.25;
          requiredHits = 5;
        }

        if (success) {
          challengeHitsRef.current += 1;
        } else {
          challengeHitsRef.current = Math.max(0, challengeHitsRef.current - 1);
        }

        const hits = challengeHitsRef.current;

        if (hits >= requiredHits) {
          // Advance to next stage
          if (phase === 'center' || phase === 'none') {
            setTimeout(() => advanceChallenge('look_left', 'Slowly turn your head to the LEFT'), 200);
          } else if (phase === 'look_left') {
            setTimeout(() => advanceChallenge('look_right', 'Now slowly turn your head to the RIGHT'), 200);
          } else if (phase === 'look_right') {
            setTimeout(
              () => advanceChallenge('look_center_final', 'Return to center and look straight at the camera'),
              200
            );
          } else if (phase === 'look_center_final') {
            // All challenges passed → begin formal recording
            if (detectionIntervalRef.current) {
              clearInterval(detectionIntervalRef.current);
              detectionIntervalRef.current = null;
            }
            setTimeout(() => executeHDVideoRecordingLoop(), 300);
          }
        }

        return {
          ...prev,
          faceDetected: hits > 1 || success,
        };
      });
    }, 250);
  }, [analyzeFrame, advanceChallenge, executeHDVideoRecordingLoop, state.challenge]);

  const initiateFaceVerificationStream = useCallback(async () => {
    updateState({
      error: null,
      recordingState: 'initializing',
      videoBlob: null,
      challenge: 'none',
      challengeInstruction: null,
      faceDetected: false,
      recordingTime: 0,
    });
    isAbortedRef.current = false;

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          'Camera access is not supported in this browser or requires a secure HTTPS connection.'
        );
      }

      // Wait for video element to be mounted
      if (!videoRef.current) {
        await new Promise<void>((resolve, reject) => {
          let attempts = 0;
          const check = () => {
            if (!isMounted.current) return reject(new Error('Component unmounted'));
            if (videoRef.current) return resolve();
            if (attempts++ > 50) return reject(new Error('Camera UI failed to load.'));
            setTimeout(check, 100);
          };
          check();
        });
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 },
        },
        audio: false, // Audio not required for pure visual liveness
      });

      if (!isMounted.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve) => {
          if (!videoRef.current) return resolve();
          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              ?.play()
              .then(() => resolve())
              .catch(() => resolve());
          };
        });

        initializeLivenessEngine();
      }
    } catch (error) {
      console.error('[Biometric] Camera error:', error);
      updateState({
        error:
          error instanceof Error
            ? error.message
            : 'Camera access was denied. Please allow camera permission and try again.',
        recordingState: 'idle',
        challenge: 'none',
        challengeInstruction: null,
      });
      stopCameraChannels();
    }
  }, [updateState, initializeLivenessEngine, stopCameraChannels]);

  const retry = useCallback(() => {
    cleanup();
    setTimeout(() => {
      if (isMounted.current) initiateFaceVerificationStream();
    }, 350);
  }, [cleanup, initiateFaceVerificationStream]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    state,
    isDesktop,
    setIsDesktop,
    videoRef,
    canvasRef,
    initiateFaceVerificationStream,
    retry,
    cleanup,
  };
}