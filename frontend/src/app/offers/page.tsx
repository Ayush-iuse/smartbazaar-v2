'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import LoadingSpinner from '../../components/LoadingSpinner';
import { AlertCircle, Tag, Check, X, Send, Inbox } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function OffersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  
  const [sentOffers, setSentOffers] = useState<any[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'received' | 'sent'>('received');

  // Protected route check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const fetchOffers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get('/api/offers');
      const data = res.data || [];
      
      setSentOffers(data.filter((o: any) => o.buyer_id === user.id));
      setReceivedOffers(data.filter((o: any) => o.seller_id === user.id));
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch offers. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOffers();
    }
  }, [user]);

  const handleUpdateStatus = async (id: number, status: 'Accepted' | 'Rejected') => {
    try {
      await api.patch(`/api/offers/${id}`, { status });
      alert(`Offer ${status.toLowerCase()} successfully.`);
      fetchOffers();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to update offer status.');
    }
  };

  const handleWithdraw = async (id: number) => {
    if (!confirm('Are you sure you want to withdraw this offer?')) return;
    try {
      await api.delete(`/api/offers/${id}`);
      alert('Offer withdrawn successfully.');
      fetchOffers();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to withdraw offer.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isAuthLoading || loading) {
    return (
      <div className="py-20 bg-background text-foreground min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-6 bg-background text-foreground min-h-screen transition-colors duration-200">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Offers Manager
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review and negotiate active trading prices for listings
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-card border border-border p-1 rounded-2xl w-fit">
        <button
          onClick={() => setTab('received')}
          className={`flex items-center gap-2 px-5 py-2 font-extrabold text-xs rounded-xl transition-all ${
            tab === 'received'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Offers Received ({receivedOffers.length})</span>
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`flex items-center gap-2 px-5 py-2 font-extrabold text-xs rounded-xl transition-all ${
            tab === 'sent'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Offers Sent ({sentOffers.length})</span>
        </button>
      </div>

      {/* Offers List */}
      <Card className="p-6">
        {tab === 'received' ? (
          receivedOffers.length === 0 ? (
            <p className="text-xs text-muted-foreground py-10 text-center">No inbound offers received from buyers.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {receivedOffers.map((o) => (
                <div key={o.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div>
                    <h3 
                      onClick={() => router.push(`/listing/${o.listing_id}`)}
                      className="text-sm font-black text-foreground cursor-pointer hover:underline"
                    >
                      {o.listing_title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-1 font-semibold">
                      From: <b className="text-foreground">{o.buyer_name}</b> | Offer amount: <span className="font-mono text-foreground font-extrabold">{formatPrice(o.offer_amount)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {o.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'Accepted')}
                          className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          title="Accept Offer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'Rejected')}
                          className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
                          title="Reject Offer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <Badge variant={o.status === 'Accepted' ? 'success' : 'secondary'}>
                        {o.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          sentOffers.length === 0 ? (
            <p className="text-xs text-muted-foreground py-10 text-center">You haven't made any offers yet.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {sentOffers.map((o) => (
                <div key={o.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div>
                    <h3 
                      onClick={() => router.push(`/listing/${o.listing_id}`)}
                      className="text-sm font-black text-foreground cursor-pointer hover:underline"
                    >
                      {o.listing_title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-1 font-semibold">
                      To: <b className="text-foreground">{o.seller_name}</b> | Offer amount: <span className="font-mono text-foreground font-extrabold">{formatPrice(o.offer_amount)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={o.status === 'Accepted' ? 'success' : o.status === 'Rejected' ? 'danger' : 'warning'}>
                      {o.status}
                    </Badge>
                    {o.status === 'Pending' && (
                      <Button
                        onClick={() => handleWithdraw(o.id)}
                        variant="destructive"
                        size="sm"
                        className="h-7 text-[10px] px-2.5"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </Card>
    </div>
  );
}
