'use client';

import React, { useEffect } from 'react';
import { useAuthStore, useThemeStore } from '../lib/store';
import Navbar from '../components/Navbar';
import '../styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loadFromStorage } = useAuthStore();
  const { initTheme } = useThemeStore();

  // Load user session details immediately on app load
  useEffect(() => {
    loadFromStorage();
    initTheme();
  }, [loadFromStorage, initTheme]);

  return (
    <html lang="en">
      <head>
        <title>SmartBazaar.AI - AI-Assisted P2P Local Marketplace</title>
        <meta name="description" content="Trade second-hand goods easily with AI-powered auto descriptions, smart price checks, and advanced fraud detection." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-card border-t border-border py-6 mt-12 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 text-center text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            &copy; {new Date().getFullYear()} SmartBazaar.AI. All rights reserved. Built as an AI-Native Internship P2P MVP.
          </div>
        </footer>
      </body>
    </html>
  );
}
