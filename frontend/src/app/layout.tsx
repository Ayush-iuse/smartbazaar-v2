import React from 'react';
import Navbar from '../components/Navbar';
import DemoModeBanner from '../components/DemoModeBanner';
import { ThemeProvider } from '../components/ThemeProvider';
import SessionProvider from '../components/SessionProvider';
import { I18nProvider } from '../i18n';
import '../styles/globals.css';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'SmartBazaar.AI - AI-Assisted P2P Local Marketplace',
  description: 'Trade second-hand goods easily with AI-powered auto descriptions, smart price checks, and advanced fraud detection.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200 antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <SessionProvider>
              <Navbar />
              <DemoModeBanner />
              <main className="flex-grow">
                {children}
              </main>
              <footer className="bg-card border-t border-border py-6 mt-12 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 text-center text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  &copy; {new Date().getFullYear()} SmartBazaar.AI. All rights reserved. Built as an AI-Native Internship P2P MVP.
                </div>
              </footer>
            </SessionProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
