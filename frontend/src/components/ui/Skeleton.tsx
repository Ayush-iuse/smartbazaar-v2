'use client';

import React from 'react';
import { useReducedMotion } from '@/lib/motion';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const reduced = useReducedMotion();

  const variantClasses = {
    text: 'h-3 w-4/5 rounded-md mb-2',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'rounded-[2rem] border border-border/40 p-6 flex flex-col gap-4',
  };

  const animationClass = reduced ? '' : 'animate-pulse bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 bg-[length:400%_100%] animate-shimmer';

  const customStyle = {
    width,
    height,
    ...style,
  };

  if (variant === 'card') {
    return (
      <div
        className={`glass text-foreground rounded-[2rem] overflow-hidden border border-border/30 relative p-5 flex flex-col gap-4 ${className}`}
        style={customStyle}
        {...props}
      >
        {/* Thumbnail Aspect area */}
        <div className={`w-full aspect-video rounded-2xl bg-muted/20 ${animationClass}`} />
        <div className="space-y-2 flex-1 pt-2">
          {/* Price */}
          <div className={`h-5 w-1/3 rounded-md bg-muted/20 ${animationClass}`} />
          {/* Title */}
          <div className={`h-4 w-4/5 rounded-md bg-muted/20 ${animationClass}`} />
          {/* Desc */}
          <div className={`h-3 w-full rounded-md bg-muted/20 ${animationClass}`} />
          <div className={`h-3 w-2/3 rounded-md bg-muted/20 ${animationClass}`} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-muted/30 ${variantClasses[variant]} ${animationClass} ${className}`}
      style={customStyle}
      {...props}
    />
  );
}
