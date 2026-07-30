'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  drift: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'rectangle';
  duration: number;
  delay: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

interface ConfettiParticlesProps {
  count?: number;
  duration?: number;
  colors?: string[];
  className?: string;
  onComplete?: () => void;
}

const DEFAULT_COLORS = [
  '#10b981', // Emerald 500
  '#34d399', // Emerald 400
  '#059669', // Emerald 600
  '#06b6d4', // Cyan 500
  '#3b82f6', // Blue 500
  '#8b5cf6', // Purple 500
  '#f59e0b', // Amber 500
];

export function ConfettiParticles({
  count = 40,
  duration = 3.5,
  colors = DEFAULT_COLORS,
  className = '',
  onComplete,
}: ConfettiParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Prevent SSR hydration mismatch by generating random telemetry client-side only
    if (shouldReduceMotion) return;

    const shapes: ('circle' | 'square' | 'rectangle')[] = [
      'circle',
      'square',
      'rectangle',
    ];

    const generatedParticles: Particle[] = Array.from({ length: count }).map(
      (_, i) => {
        const size = Math.floor(Math.random() * 6) + 6; // 6px to 12px
        return {
          id: i,
          x: Math.random() * 100, // percentage horizontal placement
          drift: (Math.random() - 0.5) * 180, // horizontal sway px
          size,
          color: colors[i % colors.length],
          shape: shapes[i % shapes.length],
          duration: duration + (Math.random() - 0.5) * 1.5,
          delay: Math.random() * 0.4,
          rotateX: Math.random() * 720,
          rotateY: Math.random() * 720,
          rotateZ: Math.random() * 360,
        };
      }
    );

    setParticles(generatedParticles);

    // Auto cleanup trigger
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, (duration + 1) * 1000);

    return () => clearTimeout(timer);
  }, [count, duration, colors, shouldReduceMotion, onComplete]);

  if (shouldReduceMotion || particles.length === 0) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-50 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {particles.map((p) => {
        const isRectangle = p.shape === 'rectangle';
        const isCircle = p.shape === 'circle';

        return (
          <motion.div
            key={p.id}
            className="absolute top-0 shadow-sm"
            style={{
              left: `${p.x}%`,
              backgroundColor: p.color,
              width: isRectangle ? `${p.size * 0.5}px` : `${p.size}px`,
              height: isRectangle ? `${p.size * 1.8}px` : `${p.size}px`,
              borderRadius: isCircle ? '9999px' : '2px',
            }}
            initial={{
              y: '-20px',
              x: 0,
              rotateX: 0,
              rotateY: 0,
              rotateZ: 0,
              opacity: 1,
            }}
            animate={{
              y: '105vh',
              x: p.drift,
              rotateX: p.rotateX,
              rotateY: p.rotateY,
              rotateZ: p.rotateZ,
              opacity: [1, 1, 0.9, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.25, 0.46, 0.45, 0.94], // Custom easeOutQuad gravity momentum
            }}
          />
        );
      })}
    </div>
  );
}