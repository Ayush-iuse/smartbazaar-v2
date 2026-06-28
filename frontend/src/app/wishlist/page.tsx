'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import ListingCard, { Listing } from '../../components/ListingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Heart, AlertTriangle } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyStates';

export default function WishlistPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Protected route check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get('/api/wishlist');
      setWishlist(res.data || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load wishlist items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  if (isAuthLoading || loading) {
    return (
      <div className="py-20 bg-background text-foreground min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-6 bg-background text-foreground min-h-screen transition-colors duration-200">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <span>My Saved Wishlist</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review saved products listings you are interested in buying.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span>{error}</span>
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="py-10">
          <EmptyState
            icon={<Heart className="w-8 h-8 text-rose-500 fill-rose-500" />}
            title="Your Wishlist is Empty"
            description="Browse active products listings and tap the heart icon on their details pages to save them here."
            actionText="Start Exploring"
            onAction={() => router.push('/')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const mockListing: Listing = {
              id: item.listing_id,
              title: item.listing_title,
              description: 'Saved Item',
              price: item.listing_price,
              category: 'Wishlist',
              location: 'SmartBazaar',
              image_urls: item.listing_image ? JSON.stringify([item.listing_image]) : '[]',
              seller_id: 0,
              fraud_score: 0,
              fraud_level: 'Low',
              created_at: item.created_at
            };
            return <ListingCard key={item.id} listing={mockListing} showSafety={false} />;
          })}
        </div>
      )}
    </div>
  );
}
