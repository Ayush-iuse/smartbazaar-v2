'use client';

import React, { useEffect, useRef } from 'react';
import { useAuthStore, useOfflineStore } from '../lib/store';

const HEALTH_CHECK_URL = '/api/health';
const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 3000;
const POLL_INTERVAL_MS = 60000; // Re-check every 60 seconds

async function checkBackendHealth(): Promise<boolean> {
  try {
    const baseURL =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:8000'
        : '';

    const res = await fetch(`${baseURL}${HEALTH_CHECK_URL}`, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function checkWithRetry(): Promise<boolean> {
  for (let attempt = 1; attempt <= RETRY_COUNT; attempt++) {
    const healthy = await checkBackendHealth();
    if (healthy) return true;
    if (attempt < RETRY_COUNT) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
  return false;
}

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { loadFromStorage } = useAuthStore();
  const { isOffline, setIsOffline } = useOfflineStore();
  const isOfflineRef = useRef(isOffline);

  useEffect(() => {
    isOfflineRef.current = isOffline;
  }, [isOffline]);

  useEffect(() => {
    // Load auth from localStorage on mount
    loadFromStorage();

    // Initial health check with retries
    checkWithRetry().then((healthy) => {
      setIsOffline(!healthy);
      if (!healthy) {
        console.warn('[SessionProvider] Backend is unreachable after retries. Enabling demo mode.');
      } else {
        console.info('[SessionProvider] Backend is healthy. Real mode active.');
      }
    });

    // Periodic health check to auto-recover
    const intervalId = setInterval(async () => {
      const healthy = await checkBackendHealth();
      if (healthy && isOfflineRef.current) {
        // Backend recovered — exit demo mode
        setIsOffline(false);
        console.info('[SessionProvider] Backend recovered. Exiting demo mode.');
      } else if (!healthy && !isOfflineRef.current) {
        // Backend went down — enter demo mode (with retries would be ideal but keep polling simple)
        setIsOffline(true);
        console.warn('[SessionProvider] Backend became unreachable. Enabling demo mode.');
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
