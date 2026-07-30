import { Variants, TargetAndTransition, Transition } from 'framer-motion';

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1]
    } 
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    } 
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
      ease: [0.22, 1, 0.36, 1]
    },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    } 
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    } 
  },
};

export const slideInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    } 
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    },
  },
};

// ⭐ Fixed: Properly typed shimmer animation with correct transition
export const shimmerAnimation: TargetAndTransition = {
  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: [0.22, 1, 0.36, 1],
    repeatType: 'loop' as const,
  },
};

// ⭐ Fixed: Pulse glow animation
export const pulseGlowAnimation: TargetAndTransition = {
  boxShadow: [
    '0 0 20px rgba(16, 185, 129, 0.1)',
    '0 0 40px rgba(16, 185, 129, 0.25)',
    '0 0 20px rgba(16, 185, 129, 0.1)',
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: [0.22, 1, 0.36, 1],
    repeatType: 'loop' as const,
  },
};

// ⭐ Floating animation
export const floatingAnimation: TargetAndTransition = {
  y: [0, -8, 0],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: [0.22, 1, 0.36, 1],
    repeatType: 'loop' as const,
  },
};

// ⭐ Rotate animation
export const rotateAnimation: TargetAndTransition = {
  rotate: [0, 360],
  transition: {
    duration: 8,
    repeat: Infinity,
    ease: 'linear',
    repeatType: 'loop' as const,
  },
};

// ⭐ Pulse scale animation
export const pulseScaleAnimation: TargetAndTransition = {
  scale: [1, 1.2, 1],
  transition: {
    duration: 0.5,
    repeat: 3,
    ease: [0.22, 1, 0.36, 1],
    repeatType: 'loop' as const,
  },
};