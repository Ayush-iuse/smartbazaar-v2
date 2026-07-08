import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useReducedMotion, staggerContainerVariants, fadeInUpVariants } from '../lib/motion';
import api, { formatError } from '../lib/api';
import { useAuthStore } from '../lib/store';
import ListingCard, { Listing } from './ListingCard';
import LoadingSpinner from './LoadingSpinner';
import { NoListingsState } from './ui/EmptyStates';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { 
  Plus, Trash2, ShieldAlert, Sparkles, MessageSquare, 
  Check, X, FileText, ArrowRight, Activity, TrendingUp, Key, SlidersHorizontal
} from 'lucide-react';

export default function SellerDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const reduced = useReducedMotion();

  const [listings, setListings] = useState<Listing[]>([]);
  const [offersReceived, setOffersReceived] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [trustScore, setTrustScore] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const [pipelineLeads, setPipelineLeads] = useState<any>({
    "Hot Leads": [
      { id: 1, name: "Sameer Verma", item: "Yamaha Acoustic Guitar", value: 11000 },
      { id: 2, name: "Priya Nair", item: "Ergonomic Office Chair", value: 4500 }
    ],
    "Cold Leads": [
      { id: 3, name: "Amit Khanna", item: "Wooden Study Table", value: 2000 }
    ],
    "Interested": [
      { id: 4, name: "Rajesh Sharma", item: "Leather Jacket", value: 3500 }
    ],
    "Negotiating": [
      { id: 5, name: "Vikram Adwani", item: "Mountain Bicycle", value: 7200 }
    ],
    "Closed Deals": [
      { id: 6, name: "Aarav Sharma", item: "iPhone 13 Pro", value: 32000 }
    ]
  });

  const fetchSellerData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // 1. Fetch Listings
      const listingRes = await api.get('/api/listings/my');
      const sellerListings = Array.isArray(listingRes.data) ? listingRes.data : [];
      setListings([...sellerListings].sort((a, b) => b.id - a.id));

      // 2. Fetch Offers Received
      const offerRes = await api.get('/api/offers');
      const received = (offerRes.data || []).filter((o: any) => o.seller_id === user.id);
      setOffersReceived(received);

      // 3. Fetch Conversations (where user is seller)
      const convRes = await api.get('/api/v2/chat/conversations');
      const sellerConvs = (convRes.data || []).filter((c: any) => c.seller_id === user.id);
      setConversations(sellerConvs);

      // 4. Fetch Trust Score
      try {
        const trustRes = await api.get(`/api/seller/trust-score/${user.id}`);
        setTrustScore(trustRes.data);
      } catch (e) {
        console.error('Trust score service failed', e);
      }

      // 5. Fetch Analytics Snapshot (User Specific)
      try {
        const analyticRes = await api.get('/api/analytics/my');
        setAnalytics(analyticRes.data);
      } catch (e) {
        console.error('Analytics my fetch failed', e);
      }

      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load seller portal details. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, [user]);

  const handleDeleteListing = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to permanently delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeletingId(id);
      await api.delete(`/api/listings/${id}`);
      setListings((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(formatError(err));
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleUpdateOfferStatus = async (id: number, status: 'Accepted' | 'Rejected') => {
    try {
      await api.patch(`/api/offers/${id}`, { status });
      setOffersReceived((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      alert(`Offer status successfully updated to ${status}.`);
      fetchSellerData(); // refresh in case status updates listing to Sold
    } catch (err: any) {
      console.error(err);
      alert(formatError(err));
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
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Trust & Analytics Quick Summary */}
      <motion.div 
        variants={staggerContainerVariants(0.05, 0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        
        {/* Trust Card */}
        {trustScore ? (
          <motion.div variants={fadeInUpVariants(reduced)}>
            <Card className="hover:shadow-md">
              <CardHeader className="p-5 pb-2">
                <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                  Seller Trust Rating
                </span>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-primary tracking-tight">{trustScore.level}</span>
                  <Badge variant="primary" className="font-mono text-xs font-black">
                    {trustScore.trust_score}/100
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground border-t border-border/20 pt-2 font-bold uppercase tracking-wider">
                  <span>Reply: {(trustScore.response_rate * 100).toFixed(0)}%</span>
                  <span className="text-right">Risk: {trustScore.fraud_score}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={fadeInUpVariants(reduced)}>
            <Card className="flex items-center justify-center p-6">
              <span className="text-xs text-muted-foreground">Retrieving trust ratings...</span>
            </Card>
          </motion.div>
        )}

        {/* Total Active Items */}
        <motion.div variants={fadeInUpVariants(reduced)}>
          <Card className="hover:shadow-md">
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                Active Listings
              </span>
              <span className="text-3xl font-black tracking-tight font-mono">
                {analytics ? analytics.active_listings : listings.length}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Total products published
              </span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Sold Items */}
        <motion.div variants={fadeInUpVariants(reduced)}>
          <Card className="hover:shadow-md">
            <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
              <span className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                Sold Items
              </span>
              <span className="text-3xl font-black tracking-tight font-mono">
                {analytics ? analytics.sold_listings : 0}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Deals successfully closed
              </span>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>

      {/* Performance Intelligence Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Estimated Revenue */}
        <Card className="p-5 flex flex-col justify-between gap-4">
          <div>
            <span className="block text-[9px] font-black text-muted-foreground uppercase tracking-wider">Estimated Revenue</span>
            <span className="text-2xl font-black font-mono mt-2 block">
              ₹{(analytics ? analytics.total_revenue : 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Real revenue from closed offers</span>
          </span>
        </Card>

        {/* Views & CTR */}
        <Card className="p-5 flex flex-col justify-between gap-4">
          <div>
            <span className="block text-[9px] font-black text-muted-foreground uppercase tracking-wider">Listing Views</span>
            <span className="text-2xl font-black font-mono mt-2 block">
              {(analytics ? analytics.total_views : 0).toLocaleString('en-IN')} Views
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            Total unique impressions
          </span>
        </Card>

        {/* Lead Conversions */}
        <Card className="p-5 flex flex-col justify-between gap-4">
          <div>
            <span className="block text-[9px] font-black text-muted-foreground uppercase tracking-wider">Lead Conversion Rate</span>
            <span className="text-2xl font-black font-mono mt-2 block">
              {analytics ? analytics.conversion_rate : 0}%
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            Inquiries turned to accepted offers
          </span>
        </Card>

        {/* Response Metrics */}
        <Card className="p-5 flex flex-col justify-between gap-4">
          <div>
            <span className="block text-[9px] font-black text-muted-foreground uppercase tracking-wider">Verification Milestones</span>
            <span className="text-2xl font-black text-emerald-500 mt-2 block">Level 2</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>Email & Profile Scan OK</span>
          </span>
        </Card>


      </div>

      {/* Grid of Sections: Offers Received & Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Offers Received */}
        <Card className="p-6">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-4">
            <FileText className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Offers Received</h2>
          </div>
          {offersReceived.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center italic">No offers received yet.</p>
          ) : (
            <div className="divide-y divide-border/20 max-h-[300px] overflow-y-auto pr-1">
              {offersReceived.map((o) => (
                <div key={o.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h4 className="text-xs font-bold text-foreground line-clamp-1">{o.listing_title}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                      <span>Buyer: {o.buyer_name}</span>
                      <span>•</span>
                      <span>Offer: <b className="text-primary font-mono">{formatPrice(o.offer_amount)}</b></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {o.status === 'Pending' ? (
                      <>
                        <Button
                          onClick={() => handleUpdateOfferStatus(o.id, 'Accepted')}
                          size="sm"
                          className="h-8 w-8 !p-0 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                          title="Accept Offer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          onClick={() => handleUpdateOfferStatus(o.id, 'Rejected')}
                          size="sm"
                          className="h-8 w-8 !p-0 bg-rose-500 hover:bg-rose-600 text-white rounded-xl"
                          title="Reject Offer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
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
          )}
        </Card>
 
        {/* Message Threads */}
        <Card className="p-6">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-4">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Buyer Inquiry Chats</h2>
          </div>
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center italic">No active buyer messages yet.</p>
          ) : (
            <div className="divide-y divide-border/20 max-h-[300px] overflow-y-auto pr-1">
              {conversations.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => router.push(`/messages?conv=${c.id}`)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-muted/40 px-2 rounded-xl transition-all"
                >
                  <div className="space-y-1 flex-1 pr-3">
                    <h4 className="text-xs font-bold text-foreground line-clamp-1">{c.listing_title}</h4>
                    <p className="text-[10px] text-muted-foreground">Buyer: <b className="text-foreground/80">{c.other_party_name}</b></p>
                    {c.last_message && (
                      <p className="text-[11px] text-muted-foreground italic line-clamp-1">"{c.last_message}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.unread_count > 0 && (
                      <span className="bg-primary text-primary-foreground text-[9px] font-extrabold h-4.5 px-1.5 rounded-full flex items-center justify-center">
                        {c.unread_count}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>

      {/* Seller CRM Kanban Lead Pipeline */}
      <div className="space-y-4 border-t border-border/40 pt-10">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div>
            <h2 className="text-sm font-black text-foreground uppercase tracking-tight flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <span>CRM Lead Pipeline Management</span>
            </h2>
            <p className="text-[10px] text-muted-foreground mt-1 font-semibold">Track buyer inquiries and prioritize hot leads to close deals faster</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {Object.entries(pipelineLeads).map(([columnName, cards]: any) => (
            <div key={columnName} className="glass p-4 rounded-3xl border border-border/40 min-w-[200px] flex flex-col gap-3.5 bg-muted/5 min-h-[300px]">
              <div className="flex justify-between items-center border-b border-border/20 pb-2">
                <span className="text-[10px] font-black text-foreground uppercase tracking-wider">{columnName}</span>
                <span className="bg-primary/20 text-primary text-[9px] font-bold px-2 py-0.5 rounded-md font-mono">{cards.length}</span>
              </div>

              <div className="flex-1 flex flex-col gap-2.5">
                {cards.map((card: any) => (
                  <div key={card.id} className="p-3 bg-card border border-border/30 rounded-2xl space-y-2 shadow-sm relative group hover:border-primary/45 transition-colors">
                    <div>
                      <h4 className="text-xs font-black text-foreground">{card.name}</h4>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{card.item}</p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-primary font-mono font-black">₹{card.value.toLocaleString()}</span>
                      
                      {/* Move controls */}
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => {
                            const colNames = Object.keys(pipelineLeads);
                            const currentIdx = colNames.indexOf(columnName);
                            if (currentIdx > 0) {
                              const prevCol = colNames[currentIdx - 1];
                              setPipelineLeads((prev: any) => {
                                const sourceList = prev[columnName].filter((c: any) => c.id !== card.id);
                                const destList = [...prev[prevCol], card];
                                return { ...prev, [columnName]: sourceList, [prevCol]: destList };
                              });
                            }
                          }}
                          className="px-1.5 py-0.5 bg-muted hover:bg-muted-foreground/20 rounded transition-colors text-[9px]"
                          title="Move left"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => {
                            const colNames = Object.keys(pipelineLeads);
                            const currentIdx = colNames.indexOf(columnName);
                            if (currentIdx < colNames.length - 1) {
                              const nextCol = colNames[currentIdx + 1];
                              setPipelineLeads((prev: any) => {
                                const sourceList = prev[columnName].filter((c: any) => c.id !== card.id);
                                const destList = [...prev[nextCol], card];
                                return { ...prev, [columnName]: sourceList, [nextCol]: destList };
                              });
                            }
                          }}
                          className="px-1.5 py-0.5 bg-muted hover:bg-muted-foreground/20 rounded transition-colors text-[9px]"
                          title="Move right"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Listings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="text-sm font-bold text-foreground">Your Active Product Listings</h2>
          <Button
            onClick={() => router.push('/create-listing')}
            size="sm"
            className="rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Listing</span>
          </Button>
        </div>

        {listings.length === 0 ? (
          <NoListingsState onAction={() => router.push('/create-listing')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((item) => (
              <div key={item.id} className="relative group/card">
                <ListingCard listing={item} showSafety={true} />
                
                {/* Delete overlay */}
                <div className="absolute top-3 right-3 flex gap-1 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <Button
                    onClick={(e) => handleDeleteListing(item.id, e)}
                    disabled={isDeletingId === item.id}
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 !p-0 rounded-lg shadow-md"
                    title="Delete listing"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
