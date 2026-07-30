'use client';

import React, { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'emerald' | 'sky' | 'amber' | 'purple' | 'rose';
  intensity?: number;
  enableSpotlight?: boolean;
}

const GLOW_CONFIG = {
  emerald: {
    color: 'rgba(16, 185, 129, 0.2)',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  sky: {
    color: 'rgba(56, 189, 248, 0.2)',
    border: 'rgba(56, 189, 248, 0.3)',
  },
  amber: {
    color: 'rgba(245, 158, 11, 0.2)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  purple: {
    color: 'rgba(168, 85, 247, 0.2)',
    border: 'rgba(168, 85, 247, 0.3)',
  },
  rose: {
    color: 'rgba(244, 63, 94, 0.2)',
    border: 'rgba(244, 63, 94, 0.3)',
  },
};

export function ThreeDCard({
  children,
  className = '',
  glowColor = 'emerald',
  intensity = 10,
  enableSpotlight = true,
}: ThreeDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse coordinate motion values (0 to 1 normalized)
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Smooth physical spring animations for zero-lag tilt
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  // Map normalized mouse positions to 3D rotation degrees
  const rotateX = useTransform(
    mouseYSpring,
    [0, 1],
    [intensity, -intensity]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [0, 1],
    [-intensity, intensity]
  );

  // Dynamic cursor radial spotlight coordinates
  const spotlightX = useTransform(mouseXSpring, [0, 1], ['0%', '100%']);
  const spotlightY = useTransform(mouseYSpring, [0, 1], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || shouldReduceMotion) return;
    const rect = cardRef.current.getBoundingClientRect();

    const normalizedX = (e.clientX - rect.left) / rect.width;
    const normalizedY = (e.clientY - rect.top) / rect.height;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  const config = GLOW_CONFIG[glowColor];

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-2xl transition-shadow duration-300 ${className}`}
    >
      {/* DYNAMIC RADIAL SPOTLIGHT OVERLAY */}
      {enableSpotlight && (
        <motion.div
          className="absolute -inset-px rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 overflow-hidden"
          style={{
            background: useTransform(
              [spotlightX, spotlightY],
              ([sx, sy]) =>
                `radial-gradient(600px circle at ${sx} ${sy}, ${config.color}, transparent 80%)`
            ),
            border: `1px solid ${config.border}`,
          }}
        />
      )}

      {/* CARD CONTENT INNER WRAPPER WITH PRESERVE-3D DEPTH */}
      <div className="relative z-20 h-full w-full rounded-2xl">
        {children}
      </div>
    </motion.div>
  );
}