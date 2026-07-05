'use client';

import React from 'react';
import { Settings as SettingsIcon, AlertTriangle, Shield, Eye, Volume2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6 bg-background text-foreground min-h-screen">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <span>User Settings Control</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Configure your personal preferences, notifications, and security options.</p>
      </div>

      {/* Offline Alert Banner */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">Offline Mock Mode Active</h4>
          <p className="text-[10px] text-amber-700 dark:text-amber-500 mt-0.5 leading-relaxed">
            Backend is currently unavailable. Displaying local settings placeholder configurations. Changes made will not be persisted.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Nav (Mock) */}
        <div className="flex flex-col gap-1.5 md:col-span-1">
          <button className="flex items-center gap-2.5 px-4 py-3 bg-muted font-bold text-xs text-primary rounded-xl text-left">
            <Shield className="w-4 h-4" />
            <span>Profile & Security</span>
          </button>
          <button className="flex items-center gap-2.5 px-4 py-3 hover:bg-muted/50 text-muted-foreground font-bold text-xs rounded-xl text-left transition-colors">
            <Eye className="w-4 h-4" />
            <span>Privacy Preferences</span>
          </button>
          <button className="flex items-center gap-2.5 px-4 py-3 hover:bg-muted/50 text-muted-foreground font-bold text-xs rounded-xl text-left transition-colors">
            <Volume2 className="w-4 h-4" />
            <span>Alerts & Notifications</span>
          </button>
        </div>

        {/* Content Panel (Mock) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold pb-2 border-b border-border">Account Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</label>
                <div className="p-2.5 bg-muted/50 border border-border rounded-xl text-xs text-muted-foreground mt-1">
                  demo@smartbazaar.ai
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Display Name</label>
                <div className="p-2.5 bg-muted/50 border border-border rounded-xl text-xs text-muted-foreground mt-1">
                  Demo Seller & Buyer
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold pb-2 border-b border-border">System Configurations</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold">Auto-Apply AI Suggestions</h4>
                  <p className="text-[10px] text-muted-foreground">AI pricing adjustments apply automatically without confirmation.</p>
                </div>
                <div className="w-9 h-5 bg-muted border border-border rounded-full p-0.5 cursor-not-allowed">
                  <div className="w-4 h-4 bg-slate-400 rounded-full" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold">Strict Fraud Check Mode</h4>
                  <p className="text-[10px] text-muted-foreground">Block incoming offers from sellers with safety scores below 70.</p>
                </div>
                <div className="w-9 h-5 bg-primary/20 border border-primary/30 rounded-full p-0.5 cursor-not-allowed flex justify-end">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
