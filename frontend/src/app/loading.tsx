import React from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LoadingPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background text-foreground transition-colors duration-200">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse font-mono">
          Loading smartbazaar.ai...
        </span>
      </div>
    </div>
  );
}
