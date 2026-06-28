import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIBadgeProps {
  label?: string;
  className?: string;
}

export default function AIBadge({ label = 'AI Suggested', className = '' }: AIBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 border border-brand-200 glass animate-pulse-subtle ${className}`}
      title="This info was generated or suggested by SmartBazaar's AI system."
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
}
