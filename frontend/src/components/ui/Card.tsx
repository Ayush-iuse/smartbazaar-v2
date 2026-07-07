'use client';

import React, { forwardRef, useState } from 'react';
import { useReducedMotion } from '@/lib/motion';

export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', style, onMouseMove, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const reduced = useReducedMotion();
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setCoords({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      if (onMouseMove) onMouseMove(e);
    };

    return (
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={(e) => {
          setIsHovered(true);
          if (onMouseEnter) onMouseEnter(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          if (onMouseLeave) onMouseLeave(e);
        }}
        style={{
          ...style,
          '--mouse-x': `${coords.x}px`,
          '--mouse-y': `${coords.y}px`,
        } as React.CSSProperties}
        className={`bg-card text-foreground border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.95)] dark:shadow-[4px_4px_0px_0px_rgba(250,248,245,0.85)] overflow-hidden transition-all duration-200 relative ${className}`}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 border-b border-border/40 flex flex-col gap-1.5 ${className}`} {...props} />
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = ({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-sm font-bold tracking-tight text-foreground ${className}`} {...props} />
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = ({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-[11px] text-muted-foreground font-medium ${className}`} {...props} />
);
CardDescription.displayName = 'CardDescription';

export const CardContent = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 ${className}`} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 border-t border-border/40 flex items-center justify-between ${className}`} {...props} />
);
CardFooter.displayName = 'CardFooter';
