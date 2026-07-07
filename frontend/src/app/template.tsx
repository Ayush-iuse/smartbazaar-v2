'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/lib/motion';

export default function Template({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={
          reducedMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 12, filter: 'blur(4px)' }
        }
        animate={{ opacity: 1, y: 0, filter: 'none' }}
        exit={
          reducedMotion
            ? { opacity: 0 }
            : { opacity: 0, y: -12, filter: 'blur(4px)' }
        }
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 24,
        }}
        className="w-full min-h-screen flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
