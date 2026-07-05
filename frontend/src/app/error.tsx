'use client';

import React, { useEffect } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Next.js App Router boundary error caught:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-background text-foreground transition-colors duration-200">
      <div className="max-w-md p-8 bg-card border border-border rounded-3xl shadow-xl flex flex-col items-center gap-6">
        <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black tracking-tight">Something went wrong!</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An unexpected error occurred while rendering this page. You can try resetting the page view or contact support if the issue persists.
          </p>
          {error.message && (
            <div className="p-3 bg-muted rounded-xl text-[10px] text-muted-foreground font-mono text-left break-all max-h-32 overflow-y-auto mt-2">
              Error details: {error.message}
            </div>
          )}
        </div>
        <div className="flex gap-4 w-full">
          <Button onClick={() => window.location.href = '/'} variant="outline" className="flex-1 rounded-2xl">
            Go Home
          </Button>
          <Button onClick={() => reset()} className="flex-1 rounded-2xl gap-1.5 bg-primary text-white hover:bg-primary/90">
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
