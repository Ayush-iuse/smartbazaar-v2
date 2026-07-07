'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const reduced = useReducedMotion();
    
    const baseStyle = 'inline-flex items-center justify-center font-bold tracking-tight rounded-none transition-all duration-150 outline-none disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden active:translate-x-[1px] active:translate-y-[1px] active:shadow-none border-2 border-foreground';
    
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/95 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(250,248,245,0.85)]',
      secondary: 'bg-card text-foreground hover:bg-muted/10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(250,248,245,0.85)]',
      outline: 'bg-transparent hover:bg-muted/5 text-foreground',
      ghost: 'bg-transparent hover:bg-muted/5 text-foreground border-transparent',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
      link: 'bg-transparent text-primary hover:underline underline-offset-4 !p-0 !rounded-none border-transparent'
    };

    const sizes = {
      sm: 'h-8 px-3 text-[11px] gap-1.5',
      md: 'h-10 px-5 py-2.5 text-xs gap-2',
      lg: 'h-12 px-6 text-sm gap-2.5'
    };

    return (
      <motion.button
        ref={ref as any}
        disabled={disabled || isLoading}
        whileHover={reduced ? {} : { scale: 1.03, y: -1.5 }}
        whileTap={reduced ? {} : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 350, damping: 18 }}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...(props as any)}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
