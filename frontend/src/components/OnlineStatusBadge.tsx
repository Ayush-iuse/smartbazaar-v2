import React from 'react';

interface OnlineStatusBadgeProps {
  isOnline: boolean;
  className?: string;
}

export default function OnlineStatusBadge({ isOnline, className = '' }: OnlineStatusBadgeProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {isOnline ? (
        <>
          <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </>
      ) : (
        <span className="inline-flex rounded-full h-2.5 w-2.5 bg-slate-350 dark:bg-slate-600"></span>
      )}
    </div>
  );
}
