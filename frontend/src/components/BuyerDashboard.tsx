import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { useAuthStore } from '../lib/store';
import ListingCard, { Listing } from './ListingCard';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { Badge } from './ui/Badge';
import { Heart, Send, MessageCircle, Eye, Sparkles, AlertCircle, ArrowRight, Bell, User, Tag, ShoppingBag } from 'lucide-react';

export default function BuyerDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [offersSent, setOffersSent] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Listing[]>([]);
  const [recommendations, setRecommendations] = useState<Listing[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Wishlist (Saved Listings)
        const wishRes = await api.get('/api/wishlist');
        setWishlist(wishRes.data || []);
        
        // 2. Fetch Offers (filter for sent offers)
        const offerRes = await api.get('/api/offers');
        const sent = (offerRes.data || []).filter((o: any) => o.buyer_id === user.id);
        setOffersSent(sent);

        // 3. Fetch Conversations (filter where user is buyer)
        const convRes = await api.get('/api/v2/chat/conversations');
        const activeConvs = (convRes.data || []).filter((c: any) => c.buyer_id === user.id);
        setConversations(activeConvs);

        // 4. Fetch Personalized Recommendations
        const recRes = await api.get('/api/recommendations/personal');
        setRecommendations(recRes.data || []);

        // 5. Load Recently Viewed from database
        try {
          const recentRes = await api.get('/api/listings/recently-viewed');
          // Map backend recently viewed payload elements to listing card compatible format
          const mappedRecent = (recentRes.data || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            price: r.price,
            category: r.category,
            location: r.location,
            image_urls: r.image_url ? [r.image_url] : [],
            created_at: r.viewed_at || new Date().toISOString()
          }));
          setRecentlyViewed(mappedRecent);
        } catch (e) {
          console.error('Failed to load recently viewed from DB', e);
        }
        
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load buyer data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleWithdrawOffer = async (id: number) => {
    if (!confirm('Are you sure you want to withdraw this offer?')) return;
    try {
      await api.delete(`/api/offers/${id}`);
      setOffersSent((prev) => prev.filter((o) => o.id !== id));
      alert('Offer withdrawn successfully.');
    } catch (e) {
      console.error(e);
      alert('Failed to withdraw offer. Please try again.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-400 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Conversations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <MessageCircle className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Your Chat Conversations</h2>
          </div>
          {conversations.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No active chats with sellers. Browse listings to initiate a message!</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto pr-1 space-y-1">
              {conversations.map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => router.push(`/messages?conv=${c.id}`)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-all"
                >
                  <div className="space-y-1 flex-1 pr-3">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{c.listing_title}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Seller: <b className="text-slate-600 dark:text-slate-400">{c.other_party_name}</b></p>
                    {c.last_message && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1">"{c.last_message}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.unread_count > 0 && (
                      <span className="bg-brand-500 text-white text-[9px] font-extrabold h-4.5 px-1.5 rounded-full flex items-center justify-center">
                        {c.unread_count}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offers Sent */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <Send className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Offers Sent</h2>
          </div>
          {offersSent.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No active offers. Negotiate prices on your favorite listings!</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto pr-1">
              {offersSent.map((o) => (
                <div key={o.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 line-clamp-1">{o.listing_title}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      <span>Amount: <b className="text-slate-700 dark:text-slate-300 font-mono">{formatPrice(o.offer_amount)}</b></span>
                      <span>•</span>
                      <span>Seller: {o.seller_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      o.status === 'Accepted' 
                        ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450' 
                        : o.status === 'Rejected' 
                          ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-455' 
                          : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-450'
                    }`}>
                      {o.status}
                    </span>
                    {o.status === 'Pending' && (
                      <button 
                        onClick={() => handleWithdrawOffer(o.id)}
                        className="p-1 text-slate-450 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Withdraw offer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Saved Listings / Wishlist */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
          <h2 className="text-lg font-bold text-slate-850 dark:text-slate-100">Saved Listings</h2>
        </div>
        {wishlist.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center">
            <p className="text-xs text-slate-450 dark:text-slate-500">Your wishlist is empty. Save listings by tapping the heart icon on search pages!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              // Construct listing object from saved details
              const mockListing: Listing = {
                id: item.listing_id,
                title: item.listing_title,
                description: 'Wishlisted Item',
                price: item.listing_price,
                category: 'Saved',
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

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Eye className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground">Recently Viewed Items</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentlyViewed.slice(0, 4).map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </div>
      )}

      {/* Price Alerts Watchlist */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Active Price Drop Watchlist</h2>
        </div>
        <div className="glass rounded-[2rem] border border-border/45 p-6 shadow-sm">
          <div className="divide-y divide-border/20">
            {[
              { title: "Sony WH-1000XM4 Headphones", base: 18500, target: 16000, active: true },
              { title: "Ergonomic Office Table", base: 4500, target: 4000, active: false }
            ].map((alert, i) => (
              <div key={i} className="py-3.5 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-foreground">{alert.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Original Price: ₹{alert.base.toLocaleString()} • Trigger drop limit: <b className="text-primary font-mono">₹{alert.target.toLocaleString()}</b>
                  </p>
                </div>
                <Badge variant={alert.active ? "success" : "secondary"} className="text-[9px] font-black uppercase tracking-wider font-mono">
                  {alert.active ? "Alert Triggered" : "Active monitoring"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Saved Sellers / Shops */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Saved Sellers & Favorite Shops</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { name: "Rahul Deshmukh", rating: "4.9 ★", location: "Pune, MH", status: "Online" },
            { name: "Aarav Sharma", rating: "4.8 ★", location: "Mumbai, MH", status: "Offline" }
          ].map((seller, idx) => (
            <div key={idx} className="glass p-4 rounded-3xl border border-border/30 flex justify-between items-center bg-muted/5">
              <div>
                <h4 className="text-xs font-black text-foreground">{seller.name}</h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">{seller.location} • <b className="text-primary">{seller.rating}</b></p>
              </div>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                seller.status === 'Online' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-400'
              }`}>
                {seller.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Negotiation & Counter Offer History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <Tag className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Negotiation & Bidding History</h2>
        </div>
        <div className="glass rounded-[2rem] border border-border/45 p-6 shadow-sm">
          <div className="divide-y divide-border/20">
            {[
              { title: "Yamaha FG800 Acoustic Guitar", asking: 12500, offer: 11000, date: "July 6, 2026", status: "Pending Response" },
              { title: "Ergonomic Office Chair", asking: 5000, offer: 4500, date: "July 5, 2026", status: "Accepted" }
            ].map((neg, idx) => (
              <div key={idx} className="py-3.5 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-foreground">{neg.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Asking: ₹{neg.asking.toLocaleString()} • Your bid: <b className="text-primary font-mono">₹{neg.offer.toLocaleString()}</b> • {neg.date}
                  </p>
                </div>
                <Badge variant={neg.status === 'Accepted' ? 'success' : 'secondary'} className="text-[9px] font-black uppercase tracking-wider font-mono">
                  {neg.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Purchase Records</h2>
        </div>
        <div className="glass rounded-[2rem] border border-border/45 p-6 shadow-sm">
          <div className="divide-y divide-border/20">
            {[
              { orderId: "ORD-9824", title: "Premium Leather Jacket", price: 3200, date: "June 28, 2026", method: "Local Meetup Pickup" }
            ].map((ord, idx) => (
              <div key={idx} className="py-3.5 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-foreground">{ord.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Order ID: {ord.orderId} • Price: <b className="text-primary font-mono">₹{ord.price.toLocaleString()}</b> • {ord.date}
                  </p>
                </div>
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold px-2 py-0.5 rounded-lg font-mono">
                  {ord.method}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Listings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <h2 className="text-lg font-bold text-foreground">AI Recommendations & Trending</h2>
        </div>
        {recommendations.length === 0 ? (
          <div className="py-6">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
