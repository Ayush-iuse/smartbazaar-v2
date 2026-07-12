'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, X } from 'lucide-react';
import { useOfflineStore } from '../lib/store';
import { useTranslation } from '../i18n';

export default function DemoModeBanner() {
  const { isOffline, setIsOffline } = useOfflineStore();
  const [retrying, setRetrying] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { t } = useTranslation();

  const handleReconnect = useCallback(async () => {
    setRetrying(true);
    try {
      const baseURL =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'http://localhost:8000'
          : '';

      const res = await fetch(`${baseURL}/api/health`, {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        setIsOffline(false);
        setDismissed(false);
      }
    } catch {
      // Still down — remain in offline/demo mode
    } finally {
      setRetrying(false);
    }
  }, [setIsOffline]);

  return (
    <AnimatePresence>
      {isOffline && !dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="bg-red-500 text-red-950 flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <WifiOff className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              <span>
                Backend Connection Error — Real-time services are offline. Verify your local backend server is running.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleReconnect}
                disabled={retrying}
                className="flex items-center gap-1 px-2 py-1 bg-red-950 text-red-50 hover:bg-red-900 transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`} />
                {retrying ? 'Reconnecting...' : t('common.retryConnection')}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 hover:bg-red-400/40 transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
