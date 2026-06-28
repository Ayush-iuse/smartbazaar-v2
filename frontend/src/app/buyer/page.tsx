'use client';

import React from 'react';
import BuyerDashboard from '../../components/BuyerDashboard';

export default function BuyerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-6 bg-background text-foreground min-h-screen transition-colors duration-200">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Buyer Workspace
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your inquiries, sent offers, and saved listings.
        </p>
      </div>
      <BuyerDashboard />
    </div>
  );
}
