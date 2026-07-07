import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', error, label, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          type={type}
          className={`flex h-10 w-full rounded-none border-2 border-foreground bg-background px-4 py-3 text-xs placeholder:text-muted-foreground/60 outline-none focus:border-bazaar-terracotta disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
            error ? 'border-destructive focus:border-destructive' : ''
          } ${className}`}
          {...props}
        />
        <AnimatePresence>
          {error && (
            <motion.span
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="text-[10px] font-bold text-destructive overflow-hidden"
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';
