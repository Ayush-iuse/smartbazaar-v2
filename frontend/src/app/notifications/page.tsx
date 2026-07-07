'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, CheckCircle2, MessageSquare, Tag, TrendingDown,
  Clock, ShieldAlert, Sparkles, Trash2, Archive, RefreshCw,
  ShoppingBag, Star, AlertTriangle, Package
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

function getNotifIcon(type: string) {
  switch (type) {
    case 'offer_received': return <Tag className="w-4 h-4 text-primary" />;
    case 'offer_accepted': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 'offer_rejected': return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    case 'price_reduced': return <TrendingDown className="w-4 h-4 text-amber-500" />;
    case 'listing_sold': return <ShoppingBag className="w-4 h-4 text-slate-500" />;
    case 'new_message': return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case 'review': return <Star className="w-4 h-4 text-yellow-500" />;
    case 'booking': return <Package className="w-4 h-4 text-violet-500" />;
    case 'verification': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    case 'crm': return <ShieldAlert className="w-4 h-4 text-rose-500" />;
    default: return <Bell className="w-4 h-4 text-primary" />;
  }
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/notifications');
      const data = Array.isArray(res.data)
        ? res.data
        : (res.data?.notifications || []);
      setNotifications(data);
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
      setError('Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading) fetchNotifications();
    // Poll every 30s for real-time updates
    const interval = setInterval(() => {
      if (!isAuthLoading && isAuthenticated) fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthLoading, isAuthenticated, fetchNotifications]);

  const handleMarkRead = async (id: number) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch {
      // Best-effort — update locally regardless
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
    } catch {
      // Best-effort
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/notifications/${id}`);
    } catch {
      // Best-effort
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const displayed = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">

      {/* Page Header */}
      <div className="border-b border-border pb-6 mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 uppercase">
            <Bell className="w-6 h-6 text-primary" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-black bg-primary text-primary-foreground px-2 py-0.5">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Real-time updates from your marketplace activity
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchNotifications}
            className="p-2 border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 border border-border text-[10px] font-black uppercase tracking-wider hover:border-primary hover:text-primary transition-colors"
            >
              <CheckCircle2 className="w-3 h-3" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-0 border border-border w-fit mb-6">
        {(['all', 'unread'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-colors ${
              filter === tab
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            {tab === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-16 border-2 border-dashed border-border">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-foreground">{error}</p>
          <button
            onClick={fetchNotifications}
            className="mt-4 px-4 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-wider"
          >
            Retry
          </button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border">
          <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm font-black uppercase tracking-wider text-muted-foreground">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Notifications will appear here as you use the marketplace
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25, ease: 'easeOut' }}
            >
              <div
                className={`flex items-start gap-4 p-4 border transition-all duration-150 group cursor-pointer ${
                  notif.is_read
                    ? 'border-border bg-card hover:border-foreground/20'
                    : 'border-primary/30 bg-primary/[0.03] hover:border-primary/60'
                }`}
                onClick={() => !notif.is_read && handleMarkRead(notif.id)}
              >
                {/* Unread dot */}
                <div className="relative mt-0.5 shrink-0">
                  <div className="p-2 bg-muted">
                    {getNotifIcon(notif.type)}
                  </div>
                  {!notif.is_read && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className={`text-xs font-black truncate ${notif.is_read ? 'text-foreground' : 'text-foreground'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[9px] text-muted-foreground font-mono shrink-0">
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed font-medium line-clamp-2">
                    {notif.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {!notif.is_read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                      className="p-1.5 text-muted-foreground hover:text-emerald-500 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                    className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
