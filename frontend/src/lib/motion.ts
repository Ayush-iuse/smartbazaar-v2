'use client';

import { useEffect, useState } from 'react';
import { Variants } from 'framer-motion';

// Standardized easing curves
export const EASINGS = {
  slickDecel: [0.16, 1, 0.3, 1], // Custom cubic-bezier for linear decel
  easeOutBack: [0.34, 1.56, 0.64, 1],
  smoothEase: [0.25, 1, 0.5, 1],
};

// Reusable spring transitions
export const SPRINGS = {
  default: { type: 'spring', stiffness: 180, damping: 18, mass: 0.1 },
  bouncy: { type: 'spring', stiffness: 220, damping: 12, mass: 0.15 },
  stiff: { type: 'spring', stiffness: 350, damping: 25 },
};

// Hook to check if the user has OS-level reduced motion enabled
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return reducedMotion;
}

// Reusable variants that respect reduced motion
export const fadeInUpVariants = (reduced: boolean): Variants => ({
  hidden: {
    opacity: 0,
    y: reduced ? 0 : 20,
    filter: reduced ? 'none' : 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'none',
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 15,
    },
  },
});

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

export const staggerContainerVariants = (delayChildren = 0.05, staggerChildren = 0.08): Variants => ({
  hidden: {},
  visible: {
    transition: {
      delayChildren,
      staggerChildren,
    },
  },
});

export const cardHoverVariants = (reduced: boolean): Variants => ({
  initial: { scale: 1, y: 0 },
  hover: {
    scale: reduced ? 1 : 1.02,
    y: reduced ? 0 : -6,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  tap: { scale: 0.98 },
});

export const drawerVariants = (direction: 'left' | 'right' | 'bottom', reduced: boolean): Variants => {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.15 } },
    };
  }

  const directions = {
    left: { x: '-100%', y: 0 },
    right: { x: '100%', y: 0 },
    bottom: { x: 0, y: '100%' },
  };

  return {
    hidden: { ...directions[direction], opacity: 0 },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 26,
      },
    },
  };
};

// Modal entry/exit: scale + opacity
export const modalEntryVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 22 },
  },
  exit: { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.15 } },
};

// Toast / notification slide from right
export const toastSlideVariants: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
  exit: { opacity: 0, x: 60, transition: { duration: 0.18 } },
};

// Individual list item in a staggered list
export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
};

