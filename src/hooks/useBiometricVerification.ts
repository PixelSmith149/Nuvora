'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { BiometricState } from '@/types';
import { VIDEO_RECORDING_DURATION } from '@/utils/constants';
import { OnboardingService } from '@/services/onboardingService';

const initialBiometricState: BiometricState = {
  isDesktop: false,
  recordingState: 'idle',
  recordingTime: 0,
  faceDetected: false,
  videoBlob: null,
  error: null,
};

export function useBiometricVerification(
  userId: string,
  onComplete: (videoUrl: string) => Promise<void>
) {
  const [state, setState] = useState<BiometricState>(initialBiometricState);
  const [isDesktop, setIsDesktop] = useState(false);

  // DOM & Media Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Timers & State Guards
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef<boolean>(true);
  const isAbortedRef = useRef<boolean>(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const updateState = useCallback((updates: Partial<BiometricState>) => {
    if (!isMounted.current) return; // Prevent state updates on unmounted components
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const stopCameraChannels = useCallback(() => {
    isAbortedRef.current = true; // Mark as aborted so pending uploads cancel themselves

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
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
  }, []);

  const cleanup = useCallback(() => {
    stopCameraChannels();
    setState(initialBiometricState);
  }, [stopCameraChannels]);

  const executeHDVideoRecordingLoop = useCallback(() => {
    if (!streamRef.current) return;

    // Reset abort flag for a fresh recording session
    isAbortedRef.current = false;
    updateState({ recordingState: 'recording', recordingTime: 0 });

    const chunks: Blob[] = [];
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    
    // Fallback if strict mimeType isn't supported by browser (e.g., Safari)
    const mimeType = MediaRecorder.isTypeSupported(options.mimeType) 
      ? options.mimeType 
      : 'video/webm';

    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      // Guard: If stopped via unmount/cancel, DO NOT upload the garbage blob.
      if (isAbortedRef.current || !isMounted.current) {
        return;
      }

      const completeBlob = new Blob(chunks, { type: mimeType });
      
      // Guard: Reject tiny blobs (likely failed recordings)
      if (completeBlob.size < 1000) {
        updateState({ error: 'Recording failed (file too small). Please try again.', recordingState: 'idle' });
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
          recordingState: 'idle'
        });
      } finally {
        stopCameraChannels();
      }
    };

    mediaRecorder.start(250); // Pass timeslice to ensure data is flushed continually

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.recordingTime >= VIDEO_RECORDING_DURATION) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop(); // This triggers the successful onstop upload
          }
          return { ...prev, recordingTime: VIDEO_RECORDING_DURATION };
        }
        return { ...prev, recordingTime: prev.recordingTime + 1 };
      });
    }, 1000);
  }, [userId, onComplete, updateState, stopCameraChannels]);

  const initializePixelVarianceEngine = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Performance optimization
    if (!ctx) return;

    // Clear any existing engine interval before starting a new one
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

    let previousFrameData: Uint8ClampedArray | null = null;
    let baselineHits = 0;

    detectionIntervalRef.current = setInterval(() => {
      if (!video || video.paused || video.ended || !isMounted.current) return;

      try {
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
              updateState({ faceDetected: true });
              if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
                detectionIntervalRef.current = null;
              }
              executeHDVideoRecordingLoop();
            }
          } else {
            baselineHits = Math.max(0, baselineHits - 1);
            updateState({ faceDetected: false });
          }
        }
        previousFrameData = currentFrame;
      } catch (err) {
        // Handle canvas drawing errors (e.g. video destroyed mid-draw)
        console.warn('Variance engine frame dropped:', err);
      }
    }, 250);
  }, [updateState, executeHDVideoRecordingLoop]); // Added missing dependency

  const initiateFaceVerificationStream = useCallback(async () => {
    updateState({ error: null, recordingState: 'initializing', videoBlob: null });
    isAbortedRef.current = false; // Reset abort flag

    try {
      // 1. Guard against unsupported browser environments (HTTP / IFrames)
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is not supported in this browser or requires a secure HTTPS connection.');
      }

      // 2. Safe DOM Polling: Wait for videoRef with a maximum retry limit (5 secs)
      if (!videoRef.current) {
        await new Promise<void>((resolve, reject) => {
          let attempts = 0;
          const checkVideo = () => {
            if (!isMounted.current) return reject(new Error('Component unmounted'));
            if (videoRef.current) return resolve();
            if (attempts > 50) return reject(new Error('Camera UI failed to load.'));
            attempts++;
            setTimeout(checkVideo, 100);
          };
          checkVideo();
        });
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 480,
          height: 480,
          facingMode: 'user',
          frameRate: { ideal: 30, max: 60 },
        },
        audio: true,
      });

      if (!isMounted.current) {
        // If unmounted while waiting for permissions, kill stream instantly
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(resolve).catch(resolve);
            };
          } else {
            resolve(null);
          }
        });

        updateState({ recordingState: 'detecting' });
        initializePixelVarianceEngine();
      }
    } catch (error) {
      console.error('[Biometric] Camera error:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Camera/Microphone access was denied.',
        recordingState: 'idle',
      });
      stopCameraChannels();
    }
  }, [updateState, initializePixelVarianceEngine, stopCameraChannels]);

  const retry = useCallback(() => {
    cleanup();
    setTimeout(() => {
      if (isMounted.current) initiateFaceVerificationStream();
    }, 300);
  }, [cleanup, initiateFaceVerificationStream]);

  // Handle Unmount Cleanup
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