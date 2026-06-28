'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../lib/store';
import LoadingSpinner from '../../components/LoadingSpinner';
import BuyerDashboard from '../../components/BuyerDashboard';
import SellerDashboard from '../../components/SellerDashboard';
import { UserCheck, ShoppingBag, LayoutDashboard } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');

  // Protected route check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Sync tab choice with URL query parameter or localStorage
  useEffect(() => {
    const urlTab = searchParams?.get('tab');
    if (urlTab === 'buyer' || urlTab === 'seller') {
      setActiveTab(urlTab);
    } else {
      const storedTab = localStorage.getItem('sb_active_dashboard_tab');
      if (storedTab === 'buyer' || storedTab === 'seller') {
        setActiveTab(storedTab);
      }
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'buyer' | 'seller') => {
    setActiveTab(tab);
    localStorage.setItem('sb_active_dashboard_tab', tab);
    router.replace(`/dashboard?tab=${tab}`);
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="py-20 bg-background text-foreground transition-colors duration-200 min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 bg-background text-foreground min-h-screen transition-colors duration-200">
      
      {/* Dashboard Top Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            <span>Dashboard Workspace</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your buyer offers, chats, wishlist, and seller listings in one workspace
          </p>
        </div>
      </div>

      {/* Tab Selector buttons */}
      <div className="flex bg-card border border-border p-1 rounded-2xl w-full sm:w-fit transition-colors">
        <button
          onClick={() => handleTabChange('buyer')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 font-extrabold text-sm rounded-xl transition-all duration-200 ${
            activeTab === 'buyer'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Buyer Workspace</span>
        </button>
        <button
          onClick={() => handleTabChange('seller')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 font-extrabold text-sm rounded-xl transition-all duration-200 ${
            activeTab === 'seller'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Seller Workspace</span>
        </button>
      </div>

      {/* Dynamic Workspace render */}
      <div className="mt-4 transition-opacity duration-300">
        {activeTab === 'buyer' ? <BuyerDashboard /> : <SellerDashboard />}
      </div>
      
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="py-20 bg-background min-h-screen flex items-center justify-center text-foreground">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
