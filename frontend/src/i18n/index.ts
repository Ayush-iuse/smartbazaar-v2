'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import React from 'react';

// Supported locales
export type Locale =
  | 'en' | 'hi' | 'mr' | 'gu' | 'ta' | 'te' | 'kn' | 'ml' | 'pa' | 'bn';

export const SUPPORTED_LOCALES: Array<{ code: Locale; name: string; nativeName: string }> = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
];

const LOCALE_STORAGE_KEY = 'sb_lang';

// Cache for loaded translation files
const translationCache: Partial<Record<Locale, Record<string, any>>> = {};

async function loadTranslations(locale: Locale): Promise<Record<string, any>> {
  if (translationCache[locale]) {
    return translationCache[locale]!;
  }
  try {
    const module = await import(`./${locale}.json`);
    translationCache[locale] = module.default || module;
    return translationCache[locale]!;
  } catch {
    // Fallback to English if locale file not found
    if (locale !== 'en') {
      return loadTranslations('en');
    }
    return {};
  }
}

/**
 * Resolve a dot-notated key from a nested object.
 * e.g. get(obj, 'nav.marketplace') → obj.nav.marketplace
 */
function get(obj: Record<string, any>, path: string): string | undefined {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object') return acc[key];
    return undefined;
  }, obj as any);
}

/**
 * Replace {{variable}} placeholders in a translation string.
 */
function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`;
  });
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  isLoaded: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
  isLoaded: false,
});

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load locale on mount from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    const initial: Locale =
      stored && SUPPORTED_LOCALES.some((l) => l.code === stored) ? stored : 'en';
    setLocaleState(initial);
  }, []);

  // Load translations whenever locale changes
  useEffect(() => {
    setIsLoaded(false);
    loadTranslations(locale).then((data) => {
      setTranslations(data);
      setIsLoaded(true);
    });
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    setLocaleState(newLocale);
    // Sync to backend user profile (fire and forget)
    const token = typeof window !== 'undefined' ? localStorage.getItem('sb_auth_token') : null;
    if (token) {
      fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ preferred_language: newLocale }),
      }).catch(() => {/* best effort */});
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const value = get(translations, key);
      if (typeof value === 'string') return interpolate(value, vars);
      return key; // Fallback: show key if translation not found
    },
    [translations]
  );

  return React.createElement(I18nContext.Provider, { value: { locale, setLocale, t, isLoaded } }, children);
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useTranslation() {
  return useContext(I18nContext);
}
