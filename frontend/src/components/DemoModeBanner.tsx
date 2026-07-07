'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, X } from 'lucide-react';
import { useOfflineStore } from '../lib/store';
import api from '../lib/api';

export default function DemoModeBanner() {
  const { isOffline, setIsOffline } = useOfflineStore();
  const [retrying, setRetrying] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleReconnect = useCallback(async () => {
    setRetrying(true);
    try {
      await api.get('/health');
      // Backend is back — clear offline mode
      setIsOffline(false);
      setDismissed(false);
    } catch {
      // still down — remain in offline mode
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
          <div className="bg-amber-500 text-amber-950 flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              <span>⚡ Backend unavailable — running in Demo Mode. Data shown is for demonstration only.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleReconnect}
                disabled={retrying}
                className="flex items-center gap-1 px-2 py-1 bg-amber-950 text-amber-50 hover:bg-amber-900 transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-3 h-3 ${retrying ? 'animate-spin' : ''}`} />
                {retrying ? 'Reconnecting...' : 'Reconnect'}
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 hover:bg-amber-400/40 transition-colors"
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
