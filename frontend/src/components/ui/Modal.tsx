'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useReducedMotion } from '@/lib/motion';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'modal' | 'drawer-left' | 'drawer-right' | 'bottom-sheet';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  variant = 'modal' 
}) => {
  const reduced = useReducedMotion();

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Layout wrapper classes depending on the variant type
  const containerClasses = {
    modal: 'fixed inset-0 z-50 flex items-center justify-center p-4',
    'drawer-left': 'fixed inset-y-0 left-0 z-50 flex flex-col w-full max-w-md h-full',
    'drawer-right': 'fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-md h-full',
    'bottom-sheet': 'fixed inset-x-0 bottom-0 z-50 flex flex-col w-full max-h-[80vh] rounded-t-[2.5rem]',
  };

  const cardClasses = {
    modal: 'bg-card text-card-foreground border border-border/80 rounded-[2rem] w-full max-w-lg shadow-2xl relative overflow-hidden z-10 flex flex-col max-h-[90vh]',
    'drawer-left': 'bg-card text-card-foreground border-r border-border/80 w-full h-full shadow-2xl relative overflow-hidden z-10 flex flex-col',
    'drawer-right': 'bg-card text-card-foreground border-l border-border/80 w-full h-full shadow-2xl relative overflow-hidden z-10 flex flex-col',
    'bottom-sheet': 'bg-card text-card-foreground border-t border-border/80 w-full h-full shadow-2xl relative overflow-hidden z-10 flex flex-col rounded-t-[2.5rem]',
  };

  // Motion animation presets mapping
  const contentAnimation = {
    modal: {
      hidden: { opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : 8 },
      visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 25 } },
    },
    'drawer-left': {
      hidden: { x: '-100%', opacity: reduced ? 0 : 1 },
      visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } },
    },
    'drawer-right': {
      hidden: { x: '100%', opacity: reduced ? 0 : 1 },
      visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } },
    },
    'bottom-sheet': {
      hidden: { y: '100%', opacity: reduced ? 0 : 1 },
      visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={containerClasses[variant]}>
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-0"
          />

          {/* Modal/Drawer Container */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={contentAnimation[variant] as any}
            className={cardClasses[variant]}
          >
            {/* Top Drag Indicator for Bottom Sheet */}
            {variant === 'bottom-sheet' && (
              <div className="w-12 h-1 bg-border/60 rounded-full mx-auto mt-3 shrink-0" />
            )}

            {/* Header */}
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between shrink-0">
              {title ? (
                <h3 className="text-xs font-bold tracking-tight text-foreground uppercase tracking-wider">{title}</h3>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Scroll area */}
            <div className="p-6 overflow-y-auto text-xs leading-relaxed flex-1">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-border/40 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
