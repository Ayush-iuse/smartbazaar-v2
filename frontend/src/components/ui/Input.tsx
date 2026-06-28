import React, { forwardRef } from 'react';

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
          className={`flex h-10 w-full rounded-xl border border-input bg-background px-4 py-3 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
            error ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-[10px] font-bold text-destructive">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
