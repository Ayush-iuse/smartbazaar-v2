'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../lib/store';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return <>{children}</>;
}
