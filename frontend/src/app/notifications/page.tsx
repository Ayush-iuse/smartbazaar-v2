'use client';

import React from 'react';
import { Bell, AlertTriangle, CheckCircle, MessageCircle, Tag } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export default function NotificationsPage() {
  const mockNotifications = [
    {
      id: 1,
      title: "New Offer Received",
      description: "Rajesh Kumar offered ₹7,500 on your 'Yamaha FG800 Acoustic Guitar'",
      icon: <Tag className="w-4 h-4 text-primary" />,
      time: "2 hours ago"
    },
    {
      id: 2,
      title: "Trust Badge Earned",
      description: "Your government ID verification has been approved. You now display 'Government ID Badge'",
      icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      time: "1 day ago"
    },
    {
      id: 3,
      title: "New Message",
      description: "Sameer Verma sent you a message: 'Is the office chair still available?'",
      icon: <MessageCircle className="w-4 h-4 text-blue-500" />,
      time: "2 days ago"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6 bg-background text-foreground min-h-screen">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />
          <span>My Alerts & Notifications</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Stay updated with trade bids, chats, and account safety reviews.</p>
      </div>

      {/* Offline Alert Banner */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400">Offline Mock Mode Active</h4>
          <p className="text-[10px] text-amber-700 dark:text-amber-500 mt-0.5 leading-relaxed">
            Backend is currently unavailable. Displaying local notifications from cached offline memory.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {mockNotifications.map((notif) => (
          <Card key={notif.id} className="p-4 flex items-start gap-4 shadow-sm">
            <div className="p-2.5 bg-muted rounded-xl mt-0.5 shrink-0">
              {notif.icon}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-baseline gap-2">
                <h3 className="text-xs font-bold text-foreground">{notif.title}</h3>
                <span className="text-[9px] text-muted-foreground font-mono">{notif.time}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">{notif.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
