import React from 'react';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`animate-pulse bg-muted/60 dark:bg-slate-800 rounded ${className}`} {...props} />
);

export const ListingSkeleton = () => (
  <div className="border border-border/80 rounded-2xl overflow-hidden p-4 space-y-3 bg-card shadow-sm flex flex-col justify-between h-[360px]">
    <Skeleton className="h-44 w-full rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-border/20">
      <Skeleton className="h-5 w-1/4" />
      <div className="flex gap-1.5">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

export const CRMPipelineSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full h-[500px]">
    {[1, 2, 3, 4].map((col) => (
      <div key={col} className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-border/40 space-y-4 flex flex-col">
        <div className="flex justify-between items-center pb-2 border-b border-border/20">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-6 rounded-full" />
        </div>
        <div className="space-y-3 flex-1 overflow-hidden">
          {[1, 2, 3].map((card) => (
            <div key={card} className="bg-card border border-border p-4 rounded-xl space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex items-center justify-between pt-2 border-t border-border/10">
                <Skeleton className="h-3.5 w-8 rounded" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const ChatThreadSkeleton = () => (
  <div className="space-y-4 flex-1 p-4 overflow-hidden">
    <div className="flex justify-start">
      <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-muted/65 space-y-2">
        <Skeleton className="h-3.5 w-[180px]" />
        <Skeleton className="h-3.5 w-[120px]" />
      </div>
    </div>
    <div className="flex justify-end">
      <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-primary/20 space-y-2">
        <Skeleton className="h-3.5 w-[140px]" />
        <Skeleton className="h-3.5 w-[80px]" />
      </div>
    </div>
    <div className="flex justify-start">
      <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-muted/65 space-y-2">
        <Skeleton className="h-3.5 w-[150px]" />
        <Skeleton className="h-3.5 w-[200px]" />
      </div>
    </div>
  </div>
);

export const AnalyticsChartSkeleton = () => (
  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 h-[350px] flex flex-col">
    <div className="flex justify-between items-center">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-7 w-20 rounded-xl" />
    </div>
    <div className="flex-grow flex items-end gap-3 pt-6">
      {[40, 70, 50, 90, 60, 30, 80, 55, 75, 45].map((height, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <Skeleton className="w-full rounded-t-lg" style={{ height: `${height}%` }} />
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
    </div>
  </div>
);
