import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-background text-foreground transition-colors duration-200">
      <div className="max-w-md p-8 bg-card border border-border rounded-3xl shadow-xl flex flex-col items-center gap-6">
        <div className="p-4 bg-primary/10 text-primary rounded-full">
          <Search className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black tracking-tight">404 - Page Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>
        <Link href="/" className="w-full">
          <Button className="w-full rounded-2xl bg-primary text-white hover:bg-primary/90">
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
