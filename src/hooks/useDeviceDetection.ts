'use client';

import { useState, useEffect, useCallback } from 'react';

/** Standard Desktop Viewport Breakpoint (e.g., 1024px) */
const DESKTOP_BREAKPOINT_PX = 1024;

export function useDeviceDetection() {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkIsDesktop = useCallback((): boolean => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }

    const userAgent = (navigator.userAgent || navigator.vendor || '').toLowerCase();

    // 1. Mobile & Tablet Regex Check
    const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    );

    // 2. Modern iPadOS Detection Guard
    // iPadOS 13+ spoof userAgent as MacIntel, but support multi-touch points
    const isIPadOS = 
      navigator.platform === 'MacIntel' && 
      navigator.maxTouchPoints > 1;

    if (isMobileUA || isIPadOS) {
      return false;
    }

    // 3. Fallback Viewport Dimension Check
    // Ensures small windows / emulators are treated as mobile/tablet contexts
    const isLargeViewport = window.innerWidth >= DESKTOP_BREAKPOINT_PX;

    return isLargeViewport;
  }, []);

  useEffect(() => {
    // Perform initial detection on mount
    setIsDesktop(checkIsDesktop());
    setIsLoading(false);

    // Dynamic viewport listener (handles resize & DevTools device mode toggling)
    const handleResize = () => {
      setIsDesktop(checkIsDesktop());
    };

    window.addEventListener('resize', handleResize);
    
    // Media query listener for precision breakpoint tracking
    const mediaQuery = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`);
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsDesktop(!e.matches ? false : checkIsDesktop());
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, [checkIsDesktop]);

  return { isDesktop, isLoading };
}