'use client';

import React, { useEffect, useRef } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  locale?: string;
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1.5,
  className = '',
  locale = 'en-US',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const rawMotionValue = useMotionValue(0);

  // Smooth physics-based spring easing for production-grade finish
  const springValue = useSpring(rawMotionValue, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000,
  });

  // Dynamic formatting with Intl.NumberFormat
  const formattedDisplay = useTransform(springValue, (latest) => {
    const formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(latest);

    return `${prefix}${formattedNumber}${suffix}`;
  });

  useEffect(() => {
    if (isInView) {
      rawMotionValue.set(value);
    }
  }, [isInView, value, rawMotionValue]);

  // Formatted fallback for accessibility screen readers
  const finalFormattedValue = `${prefix}${new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)}${suffix}`;

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      aria-label={finalFormattedValue}
      className={`inline-block tabular-nums tracking-tight ${className}`}
    >
      <motion.span>{formattedDisplay}</motion.span>
    </motion.span>
  );
}