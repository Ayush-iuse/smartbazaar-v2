'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/store';
import api from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { User, Mail, Calendar, Key, ListCollapse, BarChart3, LogOut } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading: isAuthLoading } = useAuthStore();

  const [totalItems, setTotalItems] = useState(0);
  const [averageValuation, setAverageValuation] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Protection Check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Fetch listing statistics for the user
  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      try {
        setIsLoadingStats(true);
        const res = await api.get('/api/listings');
        const data = Array.isArray(res.data) ? res.data : (res.data.listings || []);
        
        // Filter user items
        const userItems = data.filter((item: any) => item.seller_id === user.id);
        setTotalItems(userItems.length);

        if (userItems.length > 0) {
          const sum = userItems.reduce((acc: number, item: any) => acc + item.price, 0);
          setAverageValuation(sum / userItems.length);
        } else {
          setAverageValuation(0);
        }
      } catch (e) {
        console.error('Failed to load listing statistics:', e);
      } finally {
        setIsLoadingStats(false);
      }
    }

    if (user) {
      loadStats();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="py-20 bg-background text-foreground transition-colors min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const formattedJoinDate = user 
    ? new Date(user.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '';

  const formattedAverageValuation = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(averageValuation);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 bg-background text-foreground min-h-screen transition-colors duration-200">
      {/* Profile Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-black text-foreground tracking-tight">Account Profile</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage your personal settings and marketplace stats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* User Info Card */}
        <Card className="md:col-span-2 p-6 space-y-6">
          <h2 className="text-md font-bold text-foreground flex items-center gap-1.5 border-b border-border/40 pb-3">
            <User className="w-4 h-4 text-primary" />
            <span>Profile Details</span>
          </h2>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="font-bold text-muted-foreground uppercase tracking-wider">Full Name</span>
              <span className="font-bold text-foreground">{user?.full_name || 'N/A'}</span>
            </div>

            {/* Email */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs border-t border-border/40 pt-4">
              <span className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span>Email Address</span>
              </span>
              <span className="font-semibold text-foreground font-mono">{user?.email}</span>
            </div>

            {/* Member Since */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs border-t border-border/40 pt-4">
              <span className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Member Since</span>
              </span>
              <span className="font-semibold text-foreground">{formattedJoinDate}</span>
            </div>
            
            {/* Role / Seller Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs border-t border-border/40 pt-4">
              <span className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Key className="w-3.5 h-3.5" />
                <span>User Privilege</span>
              </span>
              <Badge variant="primary">
                Standard Seller
              </Badge>
            </div>
          </div>

          <div className="pt-6 border-t border-border/40">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="h-10 text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Account</span>
            </Button>
          </div>
        </Card>

        {/* Stats Sidebar */}
        <Card className="p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-md font-bold text-foreground flex items-center gap-1.5 border-b border-border/40 pb-3">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>Listing Stats</span>
            </h2>

            {isLoadingStats ? (
              <div className="py-6">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Active Listings
                  </span>
                  <span className="text-2xl font-black text-foreground font-mono">
                    {totalItems}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    Avg. Listed Price
                  </span>
                  <span className="text-lg font-bold text-primary font-mono">
                    {formattedAverageValuation}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={() => router.push('/dashboard')}
            variant="secondary"
            className="w-full"
          >
            <ListCollapse className="w-3.5 h-3.5" />
            <span>Manage Listings</span>
          </Button>
        </Card>
      </div>
    </div>
  );
}
