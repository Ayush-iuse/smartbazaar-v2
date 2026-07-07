'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PackageOpen, Sparkles, Compass } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  title = 'No items found in Bazaar',
  description = 'Try adjusting your street filters, or check active AI suggestions below.',
  actionText,
  onAction,
  className = '',
}: EmptyStateProps) {
  const router = useRouter();

  const suggestions = [
    { name: 'DSLR Cameras', query: 'camera' },
    { name: 'Cycles', query: 'cycle' },
    { name: 'Laptops', query: 'laptop' }
  ];

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-card border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,248,245,0.85)] ${className}`}>
      <div className="p-3 bg-bazaar-terracotta/10 border border-bazaar-terracotta text-bazaar-terracotta mb-4">
        <PackageOpen className="w-8 h-8" />
      </div>
      <h3 className="text-sm font-black uppercase text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
      
      {actionText && onAction ? (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-black uppercase tracking-wider text-background bg-foreground hover:bg-foreground/90 border border-foreground transition-colors mb-6"
        >
          {actionText}
        </button>
      ) : null}

      {/* Suggested Quick Searches */}
      <div className="pt-4 border-t border-foreground/10 w-full max-w-xs space-y-2">
        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1">
          <Compass className="w-3 h-3 text-bazaar-copper" />
          <span>Quick Bazaar Actions</span>
        </span>
        <div className="flex justify-center gap-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => router.push(`/search?query=${s.query}`)}
              className="px-2.5 py-1 border border-foreground/20 hover:border-foreground bg-card text-[9px] font-bold uppercase transition-colors"
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
