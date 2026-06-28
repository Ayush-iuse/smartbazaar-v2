import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3.5 py-2 shadow-sm max-w-max">
      <div className="flex gap-1 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"></span>
      </div>
      <span className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold ml-1.5">typing...</span>
    </div>
  );
}
