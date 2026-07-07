'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAuthStore } from '../lib/store';
import api from '../lib/api';
import {
  ShoppingBag, PlusCircle, LogOut, LayoutDashboard,
  Sun, Moon, Laptop, Heart, MessageSquare, Tag, Bot, Search,
  Bell, ShieldAlert, Settings, ChevronDown, Menu, X,
  Store, ShoppingCart, Home, TrendingUp, Sparkles, BarChart3,
  Package, Users
} from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { Dropdown, DropdownItem } from './ui/Dropdown';
import SpotlightSearch from './SpotlightSearch';

interface NavLink {
  href: string;
  label: string;
  children?: { href: string; label: string; icon: React.ReactNode; desc: string }[];
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, loadFromStorage } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [notifCount, setNotifCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks: NavLink[] = [
    {
      href: '/',
      label: 'Marketplace',
      children: [
        { href: '/', label: 'Buy', icon: <ShoppingCart className="w-4 h-4" />, desc: 'Browse listings to buy' },
        { href: '/create-listing', label: 'Sell', icon: <Store className="w-4 h-4" />, desc: 'Create a listing to sell' },
        { href: '/rent', label: 'Rent', icon: <Package className="w-4 h-4" />, desc: 'Rent from local hosts' },
      ]
    },
    { href: '/analytics', label: 'Analytics' },
    { href: '/copilot', label: 'AI Copilot' },
  ];

  const fetchNotifCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/api/notifications?limit=50');
      const data = Array.isArray(res.data) ? res.data : (res.data?.notifications || []);
      const unread = data.filter((n: any) => !n.is_read).length;
      setNotifCount(unread);
    } catch {
      // silently fail — notification badge is non-critical
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setMounted(true);
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (mounted) fetchNotifCount();
    // Poll every 30s
    const interval = setInterval(fetchNotifCount, 30000);
    return () => clearInterval(interval);
  }, [mounted, fetchNotifCount]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Spotlight search keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const profileItems: DropdownItem[] = [
    ...(mounted && user?.is_admin ? [{
      id: 'admin',
      label: 'Admin Control Center',
      onClick: () => router.push('/admin'),
      icon: <ShieldAlert className="w-3.5 h-3.5 text-primary" />
    }] : []),
    {
      id: 'profile',
      label: 'My Profile',
      onClick: () => router.push('/profile'),
      icon: <Users className="w-3.5 h-3.5" />
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      onClick: () => router.push('/dashboard'),
      icon: <LayoutDashboard className="w-3.5 h-3.5" />
    },
    {
      id: 'seller',
      label: 'Seller Center',
      onClick: () => router.push('/seller'),
      icon: <Store className="w-3.5 h-3.5" />
    },
    {
      id: 'settings',
      label: 'Settings',
      onClick: () => router.push('/settings'),
      icon: <Settings className="w-3.5 h-3.5" />
    },
    {
      id: 'logout',
      label: 'Log Out',
      onClick: handleLogout,
      icon: <LogOut className="w-3.5 h-3.5 text-rose-500" />,
      className: 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20'
    }
  ];

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Main Navbar */}
      <motion.header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-card/95 backdrop-blur-xl border-b border-border shadow-sm'
            : 'bg-card border-b border-border'
        }`}
        initial={false}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">

            {/* LEFT: Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <motion.div
                whileHover={{ scale: 1.06, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
                className="p-1.5 bg-primary text-primary-foreground"
              >
                <ShoppingBag className="w-4 h-4" />
              </motion.div>
              <span className="text-base font-black tracking-tight text-foreground leading-none">
                Smart<span className="text-primary">Bazaar</span>
              </span>
            </Link>

            {/* CENTER-LEFT: Nav Links (desktop) */}
            <nav ref={dropdownRef} className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActiveLink(link.href);
                const hasChildren = !!link.children;
                return (
                  <div key={link.href} className="relative">
                    {hasChildren ? (
                      <button
                        onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                        className={`flex items-center gap-1 px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors duration-150 ${
                          active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {link.label}
                        <motion.div
                          animate={{ rotate: openDropdown === link.label ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </motion.div>
                        {active && (
                          <motion.span
                            layoutId="navActiveIndicator"
                            className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        className={`relative flex items-center px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors duration-150 ${
                          active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {link.label}
                        {active && (
                          <motion.span
                            layoutId="navActiveIndicator"
                            className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                      </Link>
                    )}

                    {/* Dropdown panel */}
                    <AnimatePresence>
                      {hasChildren && openDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="absolute top-full left-0 mt-1 w-52 bg-card border border-border shadow-lg z-50"
                        >
                          {link.children!.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setOpenDropdown(null)}
                              className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors border-b border-border/30 last:border-0 group"
                            >
                              <span className="mt-0.5 text-primary">{child.icon}</span>
                              <div>
                                <div className="text-[11px] font-black uppercase tracking-wider text-foreground group-hover:text-primary transition-colors">{child.label}</div>
                                <div className="text-[9px] text-muted-foreground mt-0.5">{child.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* CENTER: Search trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 flex-1 max-w-xs px-3 py-1.5 border border-border bg-muted/20 hover:border-foreground/40 hover:bg-muted/40 transition-all duration-150 text-left"
              title="Search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-[11px] text-muted-foreground flex-1 truncate">Search listings...</span>
              <kbd className="hidden sm:flex items-center gap-0.5 text-[9px] font-mono text-muted-foreground/60 bg-muted px-1.5 py-0.5 shrink-0">
                Ctrl K
              </kbd>
            </button>

            {/* RIGHT: Actions */}
            <nav className="flex items-center gap-1 shrink-0">

              {/* Theme */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleTheme}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                title="Toggle theme"
              >
                {!mounted ? <Sun className="w-4 h-4" /> :
                  theme === 'light' ? <Sun className="w-4 h-4" /> :
                  theme === 'dark' ? <Moon className="w-4 h-4" /> :
                  <Laptop className="w-4 h-4" />}
              </motion.button>

              {mounted && isAuthenticated ? (
                <>
                  {/* Messages */}
                  <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                    <Link href="/messages" className="p-2 block text-muted-foreground hover:text-primary transition-colors" title="Messages">
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                  </motion.div>

                  {/* Wishlist */}
                  <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                    <Link href="/wishlist" className="p-2 block text-muted-foreground hover:text-primary transition-colors" title="Wishlist">
                      <Heart className="w-4 h-4" />
                    </Link>
                  </motion.div>

                  {/* Notifications with real count badge */}
                  <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                    <Link href="/notifications" className="p-2 block text-muted-foreground hover:text-primary transition-colors relative" title="Notifications">
                      <Bell className="w-4 h-4" />
                      {notifCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-primary text-primary-foreground text-[8px] font-black flex items-center justify-center rounded-full px-0.5"
                        >
                          {notifCount > 9 ? '9+' : notifCount}
                        </motion.span>
                      )}
                    </Link>
                  </motion.div>

                  {/* AI Copilot */}
                  <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                    <Link href="/copilot" className="p-2 block text-muted-foreground hover:text-primary transition-colors" title="AI Copilot">
                      <Bot className="w-4 h-4 text-primary animate-pulse-subtle" />
                    </Link>
                  </motion.div>

                  {/* Create Listing CTA */}
                  <Link
                    href="/create-listing"
                    className="hidden sm:flex items-center gap-1.5 px-3 h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] uppercase tracking-wider transition-all duration-150 shadow-[1px_1px_0px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-px hover:translate-y-px"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>List Item</span>
                  </Link>

                  {/* Profile dropdown */}
                  <Dropdown
                    align="right"
                    trigger={
                      <div className="hover:opacity-90 transition-opacity ml-1">
                        <Avatar name={user?.full_name} size="sm" />
                      </div>
                    }
                    items={profileItems}
                  />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:flex items-center gap-1.5 px-3 h-8 border border-border text-foreground hover:border-primary hover:text-primary font-bold text-[10px] uppercase tracking-wider transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3 h-8 bg-foreground text-background hover:opacity-90 font-bold text-[10px] uppercase tracking-wider transition-all"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Sell</span>
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden ml-1 p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="lg:hidden border-t border-border bg-card overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">

                {/* Search on mobile */}
                <button
                  onClick={() => { setIsSearchOpen(true); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 border border-border text-muted-foreground text-xs"
                >
                  <Search className="w-4 h-4" />
                  <span>Search listings...</span>
                </button>

                <div className="pt-2 space-y-0.5">
                  <Link href="/" className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-muted/30 transition-colors">
                    <ShoppingCart className="w-4 h-4 text-primary" /> Buy
                  </Link>
                  <Link href="/create-listing" className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-muted/30 transition-colors">
                    <Store className="w-4 h-4 text-primary" /> Sell
                  </Link>
                  <Link href="/rent" className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-muted/30 transition-colors">
                    <Package className="w-4 h-4 text-primary" /> Rent
                  </Link>
                  <Link href="/analytics" className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-muted/30 transition-colors">
                    <BarChart3 className="w-4 h-4 text-primary" /> Analytics
                  </Link>
                  <Link href="/copilot" className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-muted/30 transition-colors">
                    <Bot className="w-4 h-4 text-primary" /> AI Copilot
                  </Link>
                </div>

                {mounted && isAuthenticated ? (
                  <div className="pt-2 border-t border-border space-y-0.5">
                    <Link href="/notifications" className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-muted/30 transition-colors">
                      <Bell className="w-4 h-4" /> Notifications {notifCount > 0 && <span className="ml-auto text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 font-black">{notifCount}</span>}
                    </Link>
                    <Link href="/messages" className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-muted/30 transition-colors">
                      <MessageSquare className="w-4 h-4" /> Messages
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-muted/30 transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-border">
                    <Link href="/login" className="flex items-center justify-center gap-2 px-3 py-3 bg-foreground text-background font-black text-xs uppercase tracking-wider">
                      Sign In / Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spotlight Search Overlay */}
      <SpotlightSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
