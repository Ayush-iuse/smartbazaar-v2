'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function CopilotOrb({ isThinking = false }: { isThinking?: boolean }) {
  return (
    <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
      {/* Dynamic Background Blur Glows */}
      <motion.div
        animate={{
          scale: isThinking ? [1, 1.2, 1] : [1, 1.1, 1],
          opacity: isThinking ? [0.6, 0.9, 0.6] : [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: isThinking ? 1.5 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 rounded-full blur-2xl filter"
      />

      {/* Rotating Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: isThinking ? 4 : 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-32 h-32 rounded-full border border-dashed border-white/20"
      />

      {/* Pulsing Solid Inner Orb */}
      <motion.div
        animate={{
          scale: isThinking ? [0.9, 1.05, 0.9] : [0.95, 1, 0.95],
          boxShadow: isThinking
            ? "0 0 40px rgba(139, 92, 246, 0.6)"
            : "0 0 25px rgba(139, 92, 246, 0.3)",
        }}
        transition={{
          duration: isThinking ? 1 : 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center overflow-hidden border border-white/20"
      >
        {/* Soft Noise texture inside orb */}
        <div className="absolute inset-0 bg-noise pointer-events-none" />
        
        {/* Shiny highlights */}
        <div className="absolute top-1 left-2 w-16 h-8 bg-white/20 rounded-full blur-sm rotate-[-15deg]" />
      </motion.div>
    </div>
  );
}
