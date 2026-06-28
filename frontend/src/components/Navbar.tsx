'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useThemeStore } from '../lib/store';
import { 
  ShoppingBag, PlusCircle, LogOut, LayoutDashboard, 
  Sun, Moon, Laptop, BarChart3, Heart, MessageSquare, Tag, Bot, Search, Bell, ShieldAlert
} from 'lucide-react';
import { Avatar } from './ui/Avatar';
import { Dropdown, DropdownItem } from './ui/Dropdown';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loadFromStorage } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    loadFromStorage();
  }, [loadFromStorage]);

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Profile Dropdown items definition
  const profileItems: DropdownItem[] = [
    ...(mounted && user?.is_admin ? [
      {
        id: 'admin',
        label: 'Admin Control Center',
        onClick: () => router.push('/admin'),
        icon: <ShieldAlert className="w-3.5 h-3.5 text-primary" />
      }
    ] : []),
    {
      id: 'profile',
      label: 'My Account Profile',
      onClick: () => router.push('/profile'),
      icon: <span className="w-3.5 h-3.5 block bg-slate-400 rounded-full" />
    },
    {
      id: 'dashboard',
      label: 'Seller Dashboard',
      onClick: () => router.push('/seller'),
      icon: <LayoutDashboard className="w-3.5 h-3.5" />
    },
    {
      id: 'logout',
      label: 'Log Out Account',
      onClick: handleLogout,
      icon: <LogOut className="w-3.5 h-3.5 text-rose-500" />,
      className: 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20'
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-all duration-200">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="p-2 bg-primary rounded-2xl text-primary-foreground group-hover:scale-105 transition-transform shadow-md shadow-primary/10">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-foreground">
            SmartBazaar<span className="text-primary">.AI</span>
          </span>
        </Link>

        {/* Center: Global Search Input */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="hidden md:flex items-center relative max-w-md w-full flex-grow mx-4"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Type your search query (e.g. cycles in Pune)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-11 pr-4 py-2 border border-input rounded-2xl text-xs bg-muted/30 focus:bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </form>

        {/* Right: Actions */}
        <nav className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Theme Selector */}
          <button
            onClick={toggleTheme}
            className="p-2 text-muted-foreground hover:text-primary rounded-xl hover:bg-muted/80 transition-colors"
            title={`Toggle theme: ${theme}`}
          >
            {theme === 'light' && <Sun className="w-4.5 h-4.5" />}
            {theme === 'dark' && <Moon className="w-4.5 h-4.5" />}
            {theme === 'system' && <Laptop className="w-4.5 h-4.5" />}
          </button>

          {/* Analytics Overview */}
          <Link
            href="/analytics"
            className="p-2 text-muted-foreground hover:text-primary rounded-xl hover:bg-muted/80 transition-colors"
            title="Market Analytics"
          >
            <BarChart3 className="w-4.5 h-4.5" />
          </Link>

          {mounted && isAuthenticated ? (
            <>
              {/* Messages Inbox */}
              <Link
                href="/messages"
                className="p-2 text-muted-foreground hover:text-primary rounded-xl hover:bg-muted/80 transition-colors relative"
                title="Conversations Inbox"
              >
                <MessageSquare className="w-4.5 h-4.5" />
              </Link>

              {/* Wishlist Hearts */}
              <Link
                href="/wishlist"
                className="p-2 text-muted-foreground hover:text-primary rounded-xl hover:bg-muted/80 transition-colors"
                title="My Saved Wishlist"
              >
                <Heart className="w-4.5 h-4.5" />
              </Link>

              {/* Negotiating Offers */}
              <Link
                href="/offers"
                className="p-2 text-muted-foreground hover:text-primary rounded-xl hover:bg-muted/80 transition-colors"
                title="Negotiation Offers"
              >
                <Tag className="w-4.5 h-4.5" />
              </Link>

              {/* AI Copilot Advisor */}
              <Link
                href="/copilot"
                className="p-2 text-muted-foreground hover:text-primary rounded-xl hover:bg-muted/80 transition-colors relative"
                title="AI Marketplace Copilot"
              >
                <Bot className="w-4.5 h-4.5 text-primary animate-pulse-subtle" />
              </Link>

              {/* Quick Sell CTA */}
              <Link
                href="/create-listing"
                className="hidden sm:flex items-center gap-1.5 px-4 h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl text-[10px] shadow-sm hover:shadow-md transition-all duration-300 hover:scale-102"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>SELL ITEM</span>
              </Link>

              {/* Notification Alerts (mock) */}
              <button 
                className="p-2 text-muted-foreground hover:text-primary rounded-xl hover:bg-muted/80 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </button>

              {/* Profile dropdown */}
              <Dropdown
                align="right"
                trigger={
                  <div className="hover:opacity-90 transition-opacity">
                    <Avatar name={user?.full_name} size="sm" />
                  </div>
                }
                items={profileItems}
              />
            </>
          ) : (
            <>
              {/* Sell CTA (Anoymous -> redirects to login) */}
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-4 h-9 border border-primary text-primary hover:bg-primary/5 font-bold rounded-2xl text-[10px] transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>SELL</span>
              </Link>

              {/* Log In Button */}
              <Link
                href="/login"
                className="px-4 h-9 bg-foreground text-background font-bold text-xs rounded-2xl hover:opacity-95 transition-all flex items-center justify-center border border-transparent shadow-sm"
              >
                Sign In
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
