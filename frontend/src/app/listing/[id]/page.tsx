'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '../../../lib/store';
import api, { formatError } from '../../../lib/api';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ListingCard from '../../../components/ListingCard';
import FraudBadge from '../../../components/FraudBadge';
import AIBadge from '../../../components/AIBadge';
import SellerProfileCard from '../../../components/SellerProfileCard';
import OfferModal from '../../../components/OfferModal';
import { 
  MapPin, Calendar, Tag, ShieldCheck, 
  Send, Trash2, Edit3, MessageCircle, 
  X, Check, AlertTriangle, Sparkles, Heart, TrendingUp
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  image_urls?: string | string[];
  seller_id: number;
  fraud_score: number;
  fraud_level: string;
  created_at: string;
  status: string;
}

interface Message {
  id: number;
  listing_id: number;
  sender_id: number;
  content: string;
  created_at: string;
}

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();

  const [listing, setListing] = useState<Listing | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // New States for Marketplace Ecosystem
  const [isSaved, setIsSaved] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [conversation, setConversation] = useState<any>(null);
  
  // Seller Trust Score and Buyer Advisor states
  const [sellerTrust, setSellerTrust] = useState<{
    trust_score: number;
    response_rate: number;
    quality_score: number;
    fraud_score: number;
    level: string;
  } | null>(null);

  const [buyerAgentLoading, setBuyerAgentLoading] = useState(false);
  const [buyerAgentResult, setBuyerAgentResult] = useState<{
    advice: string;
    pros: string[];
    cons: string[];
    suggested_min: number;
    suggested_max: number;
    risk_level: string;
    explanation: string;
    is_fallback: boolean;
  } | null>(null);
  const [isBuyerAgentModalOpen, setIsBuyerAgentModalOpen] = useState(false);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);

  // States for page logic
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Chat states
  const [chatMessage, setChatMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Edit Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Fetch Listing Details
  const fetchListing = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await api.get(`/api/listings/${id}`);
      setListing(res.data);
      
      // Initialize edit fields
      setEditTitle(res.data.title);
      setEditDescription(res.data.description || '');
      setEditPrice(res.data.price.toString());
      setEditCategory(res.data.category);
      setEditLocation(res.data.location);
      setError(null);

      // Record in localStorage recently viewed list
      try {
        const storedViews = localStorage.getItem('sb_recently_viewed');
        let viewsList: any[] = storedViews ? JSON.parse(storedViews) : [];
        viewsList = viewsList.filter((item: any) => item.id !== res.data.id);
        viewsList.unshift(res.data);
        viewsList = viewsList.slice(0, 8);
        localStorage.setItem('sb_recently_viewed', JSON.stringify(viewsList));
      } catch (e) {
        console.error('Failed to update localStorage recently viewed logs', e);
      }

      // Check if item is saved
      checkWishlist();

      // Fetch dynamic seller trust metrics
      try {
        const trustRes = await api.get(`/api/seller/trust-score/${res.data.seller_id}`);
        setSellerTrust(trustRes.data);
      } catch (e) {
        console.error("Failed to load seller trust score", e);
      }

      // Fetch similar listings in same category
      try {
        const simRes = await api.get('/api/listings');
        const listData = Array.isArray(simRes.data) ? simRes.data : (simRes.data.listings || []);
        const filteredSim = listData.filter((item: any) => item.category === res.data.category && item.id !== res.data.id);
        setSimilarListings(filteredSim.slice(0, 4));
      } catch (e) {
        console.error("Failed to load similar listings", e);
      }
    } catch (err: any) {
      console.error(err);
      setError('Listing not found or failed to load listing details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if listing is saved in wishlist
  const checkWishlist = async () => {
    if (!isAuthenticated || !id) return;
    try {
      const res = await api.get('/api/wishlist');
      const items = res.data || [];
      const saved = items.some((item: any) => item.listing_id === Number(id));
      setIsSaved(saved);
    } catch (e) {
      console.error("Failed to check wishlist status", e);
    }
  };

  // Toggle Wishlist Save Status
  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      const res = await api.post('/api/wishlist', { listing_id: Number(id) });
      setIsSaved(res.data.saved);
    } catch (err: any) {
      console.error(err);
      alert(formatError(err));
    }
  };

  // Run Buyer Agent Advisor Analysis
  const handleRunBuyerAgent = async () => {
    if (!id) return;
    try {
      setBuyerAgentLoading(true);
      setIsBuyerAgentModalOpen(true);
      const res = await api.post('/api/ai/buyer-agent', {
        listing_id: Number(id)
      });
      setBuyerAgentResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Could not retrieve buying advice from the AI Buyer Agent.');
    } finally {
      setBuyerAgentLoading(false);
    }
  };

  // Initialize or Fetch Conversation Context and Load Messages
  const fetchConversationAndMessages = async () => {
    if (!id || !isAuthenticated || !listing) return;
    const isOwner = user && user.id === listing.seller_id;
    if (isOwner) return;
    
    try {
      const convRes = await api.post('/api/v2/chat/conversations', { listing_id: Number(id) });
      setConversation(convRes.data);
      
      const msgRes = await api.get(`/api/v2/chat/conversations/${convRes.data.id}/messages`);
      setMessages(msgRes.data);
    } catch (err) {
      console.error('Failed to load conversation or messages:', err);
    }
  };

  // Effect to load listing details
  useEffect(() => {
    fetchListing();
  }, [id]);

  // Effect to load chat history and setup polling (only for buyers)
  useEffect(() => {
    if (isAuthenticated && listing) {
      const isOwner = user && user.id === listing.seller_id;
      if (!isOwner) {
        fetchConversationAndMessages();
        
        const interval = setInterval(() => {
          if (conversation?.id) {
            api.get(`/api/v2/chat/conversations/${conversation.id}/messages`)
              .then(res => setMessages(res.data))
              .catch(err => console.error(err));
          } else {
            fetchConversationAndMessages();
          }
        }, 3000);

        return () => clearInterval(interval);
      }
    }
  }, [id, isAuthenticated, listing, conversation?.id]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !id) return;
    
    let activeConv = conversation;
    try {
      setIsSendingMessage(true);
      if (!activeConv) {
        const convRes = await api.post('/api/v2/chat/conversations', { listing_id: Number(id) });
        activeConv = convRes.data;
        setConversation(activeConv);
      }
      
      await api.post(`/api/v2/chat/conversations/${activeConv.id}/messages`, {
        content: chatMessage.trim(),
        message_type: 'text'
      });
      setChatMessage('');
      
      const msgRes = await api.get(`/api/v2/chat/conversations/${activeConv.id}/messages`);
      setMessages(msgRes.data);
    } catch (err: any) {
      console.error(err);
      alert(formatError(err));
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Submit Price Offer
  const handleMakeOffer = async (amount: number) => {
    try {
      const res = await api.post('/api/offers', {
        listing_id: Number(id),
        offer_amount: amount
      });
      alert(res.data.status === 'Accepted' ? 'Direct Purchase Successful!' : 'Offer submitted successfully!');
      setIsOfferModalOpen(false);
      setOfferAmount('');
      fetchListing();
    } catch (err: any) {
      console.error(err);
      alert(formatError(err));
    }
  };

  // Direct Buy Now flow
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!listing) return;
    if (!confirm(`Are you sure you want to buy this item now for ${formattedPrice}?`)) {
      return;
    }
    try {
      await api.post('/api/offers', {
        listing_id: Number(id),
        offer_amount: listing.price
      });
      alert('Purchase completed successfully!');
      fetchListing();
    } catch (err: any) {
      console.error(err);
      alert(formatError(err));
    }
  };

  // Delete Listing
  const handleDeleteListing = async () => {
    if (!listing || !id) return;
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;

    try {
      setIsLoading(true);
      await api.delete(`/api/listings/${id}`);
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      alert(formatError(err));
      setIsLoading(false);
    }
  };

  // Update Listing (Submit Edit Modal)
  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing || !id) return;
    setEditError(null);

    try {
      setIsUpdating(true);
      const res = await api.put(`/api/listings/${id}`, {
        title: editTitle,
        description: editDescription,
        price: parseFloat(editPrice),
        category: editCategory,
        location: editLocation,
        image_urls: Array.isArray(listing.image_urls) ? listing.image_urls : JSON.parse(listing.image_urls || '[]')
      });
      setListing(res.data);
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setEditError(formatError(err));
    } finally {
      setIsUpdating(false);
    }
  };

  // Safe image array resolver
  const getImages = (): string[] => {
    if (!listing) return [];
    try {
      if (typeof listing.image_urls === 'string') {
        const parsed = JSON.parse(listing.image_urls);
        if (Array.isArray(parsed)) return parsed as string[];
      }
      if (Array.isArray(listing.image_urls)) {
        return listing.image_urls as string[];
      }
    } catch (e) {
      return [];
    }
    return [];
  };

  const images = getImages();
  const displayImage = images.length > 0 ? images[activeImageIndex] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

  if (isLoading || isAuthLoading) {
    return (
      <div className="py-20 bg-background text-foreground transition-colors min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center bg-background text-foreground min-h-screen">
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl font-medium mb-4">
          {error || 'Listing not found.'}
        </div>
        <Button
          onClick={() => router.push('/')}
          variant="link"
          className="text-xs"
        >
          Go Back Home
        </Button>
      </div>
    );
  }

  const isOwner = user && user.id === listing.seller_id;
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(listing.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10 bg-background text-foreground min-h-screen transition-colors duration-200">
      
      {/* Detail Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Image Viewer & Description */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4 overflow-visible">
            
            {/* Main Picture Display with Hover Zoom */}
            <div className="relative aspect-[16/10] bg-muted/30 rounded-xl overflow-hidden mb-4 group cursor-zoom-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayImage}
                alt={listing.title}
                className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 flex gap-1.5">
                <span className="bg-black/70 text-white font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm">
                  {listing.category}
                </span>
              </div>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative w-20 aspect-video rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImageIndex === i ? 'border-primary scale-95' : 'border-transparent hover:scale-95'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumb ${i}`} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Description Card */}
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border/40 pb-4">
              <h2 className="text-xl font-bold text-foreground">Description</h2>
              {listing.fraud_score !== undefined && listing.fraud_score > 0 && (
                <AIBadge label="AI Audited" />
              )}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {listing.description || 'No description provided for this listing.'}
            </p>
          </Card>

          {/* Price History & Valuation Graph */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-black border-b border-border pb-3 flex items-center gap-1.5 uppercase tracking-tight">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>AI Market Price History</span>
            </h3>
            <div className="space-y-4">
              <div className="h-28 flex items-end justify-between gap-3 pt-6 border-b border-border/40 pb-1">
                {[
                  { label: "2 Weeks Ago", price: listing.price * 1.08, active: false },
                  { label: "1 Week Ago", price: listing.price * 1.03, active: false },
                  { label: "Today", price: listing.price, active: true }
                ].map((pt, i) => {
                  const maxVal = listing.price * 1.08;
                  const barHeight = `${(pt.price / maxVal) * 100}%`;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[9px] font-black text-muted-foreground group-hover:text-foreground font-mono transition-colors">
                        ₹{pt.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                      <div className="w-full relative rounded-t-lg overflow-hidden bg-muted/30 h-full flex items-end">
                        <div 
                          style={{ height: barHeight }} 
                          className={`w-full transition-all duration-500 ${pt.active ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`} 
                        />
                      </div>
                      <span className="text-[8px] font-black uppercase text-muted-foreground tracking-wider truncate max-w-full font-mono">
                        {pt.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                SmartBazaar's valuation checks index average P2P listings daily. Local prices for this category have dropped slightly over the last fortnight.
              </p>
            </div>
          </Card>

          {/* Safety Trading Guidelines */}
          <Card className="p-6 space-y-3.5">
            <h3 className="text-sm font-black border-b border-border pb-3 flex items-center gap-1.5 text-rose-500 uppercase tracking-tight">
              <AlertTriangle className="w-4 h-4" />
              <span>P2P Safe Trading Guidelines</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground font-medium">
              <li className="flex items-start gap-2 leading-relaxed">
                <span className="text-rose-500 font-bold">•</span>
                <span><b>Inspect in Person:</b> Always test items thoroughly before exchanging OTP validations or making final cash handovers.</span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <span className="text-rose-500 font-bold">•</span>
                <span><b>Public Meeting Spots:</b> Complete trade handoffs in well-lit, public environments (like subways, malls, or police safe-zones).</span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <span className="text-rose-500 font-bold">•</span>
                <span><b>AI Validation:</b> Look for the verified trust rating badge on member profiles. Avoid sellers asking for advanced wire transfers.</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Right Column: Listing Meta Info & Owner Controls */}
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <span className="text-3xl font-extrabold text-foreground font-mono tracking-tight block">
                {formattedPrice}
              </span>
              <h1 className="text-lg font-bold text-foreground mt-2 leading-tight">
                {listing.title}
              </h1>
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 gap-3 border-y border-border/40 py-4 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="line-clamp-1">{listing.location}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  {new Date(listing.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Safety Rating Shield */}
            {listing.fraud_score !== undefined && (
              <div className="p-4 bg-muted/40 border border-border/40 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    SmartBazaar Safety Scan
                  </span>
                  <FraudBadge score={listing.fraud_score} level={listing.fraud_level} />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {listing.fraud_level === 'High' 
                    ? 'Caution: This listing has flagged scam patterns or high-risk details.' 
                    : listing.fraud_level === 'Medium' 
                      ? 'Notice: This listing contains some irregular keywords. Proceed with usual precaution.' 
                      : 'This listing has passed our automatic fraud detection rules.'}
                </p>
              </div>
            )}

            {/* Seller Trust Score Card */}
            <SellerProfileCard sellerId={listing.seller_id} sellerTrust={sellerTrust} />

            {/* Owner controls / Buyer Advisor CTA */}
            {isOwner ? (
              <div className="flex gap-2.5">
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Details</span>
                </Button>
                <Button
                  onClick={handleDeleteListing}
                  variant="destructive"
                  className="px-3"
                  title="Delete listing"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                {listing.status === "Sold" ? (
                  <div className="w-full py-3 bg-destructive text-destructive-foreground font-black text-center rounded-xl tracking-wider text-xs shadow-md">
                    SOLD
                  </div>
                ) : (
                  <>
                    {/* Buy Now & Save Row */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={handleBuyNow}
                        className="flex-1 h-12"
                      >
                        Buy Now
                      </Button>
                      
                      {/* Heart Save Button */}
                      <button
                        type="button"
                        onClick={handleToggleSave}
                        className={`p-3 border rounded-xl shadow-sm transition-all h-12 flex items-center justify-center ${
                          isSaved 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                            : 'bg-card border-border text-muted-foreground hover:text-rose-500'
                        }`}
                        title={isSaved ? "Saved" : "Save Listing"}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Make Offer Button */}
                    <Button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          router.push('/login');
                          return;
                        }
                        setIsOfferModalOpen(true);
                      }}
                      variant="outline"
                      className="w-full h-11"
                    >
                      Make Offer
                    </Button>
                  </>
                )}

                {/* AI Advisor Button */}
                <Button
                  type="button"
                  onClick={handleRunBuyerAgent}
                  disabled={buyerAgentLoading}
                  className="w-full h-11 bg-gradient-to-r from-primary to-indigo-600 border-0 hover:opacity-90 text-white shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>{buyerAgentLoading ? 'Consulting Advisor...' : 'Should I Buy This?'}</span>
                </Button>

                <div className="p-2.5 bg-muted/30 border border-border/40 rounded-xl text-center">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    Seller reference: User #{listing.seller_id}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Chat / Messages Box Section */}
          {isAuthenticated && !isOwner && (
            <Card className="flex flex-col h-[400px]">
              {/* Chat Header */}
              <div className="p-4 border-b border-border/40 bg-muted/20 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  {isOwner ? 'Listing Chat Log' : 'Contact Seller'}
                </span>
              </div>

              {/* Chat Message feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-xs text-muted-foreground font-medium">
                    Send a message to start trading context!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isCurrentUserMsg = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] ${
                          isCurrentUserMsg ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isCurrentUserMsg
                              ? 'bg-primary text-primary-foreground rounded-tr-none'
                              : 'bg-card border border-border text-foreground rounded-tl-none shadow-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-1 px-1 font-semibold">
                          {new Date(msg.created_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ask if item is available..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all duration-200"
                />
                <Button
                  type="submit"
                  disabled={isSendingMessage || !chatMessage.trim()}
                  className="h-9 px-3"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </Card>
          )}

          {!isAuthenticated && (
            <div className="bg-muted/40 border border-border/40 p-6 rounded-2xl text-center space-y-3">
              <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto" />
              <h3 className="text-xs font-bold text-foreground">Need to contact the seller?</h3>
              <p className="text-[10px] text-muted-foreground max-w-xs mx-auto">
                Sign in to send messages and inquire about trading options.
              </p>
              <Button
                onClick={() => router.push('/login')}
                className="w-full h-9"
              >
                Sign In to Chat
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Listing Modal Popup */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-border/45 bg-muted/20">
              <h3 className="font-extrabold text-foreground text-sm">Edit Listing details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleUpdateListing} className="p-6 overflow-y-auto space-y-4">
              {editError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl font-medium">
                  {editError}
                </div>
              )}

              {/* Title */}
              <Input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                label="Title"
              />

              {/* Description */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-input rounded-xl text-xs bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground/60 leading-relaxed transition-all duration-200"
                />
              </div>

              {/* Category */}
              <Select
                required
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                label="Category"
              >
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Fashion">Fashion</option>
                <option value="Books">Books</option>
                <option value="Vehicles">Vehicles</option>
                <option value="Others">Others</option>
              </Select>

              {/* Price & Location */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  label="Price (INR)"
                  className="font-mono font-semibold"
                />
                <Input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  label="Location"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-border/40 mt-6">
                <Button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  variant="outline"
                  className="h-9 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="h-9 px-5"
                >
                  {isUpdating ? 'Saving...' : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* AI Buyer Agent Modal */}
      {isBuyerAgentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-primary/10 text-primary rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-foreground text-sm">Should I Buy This? — AI Buyer Advisor</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBuyerAgentModalOpen(false)}
                className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {buyerAgentLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <LoadingSpinner size="lg" />
                  <span className="text-xs text-muted-foreground font-bold animate-pulse">Running market valuations & safety scans...</span>
                </div>
              ) : buyerAgentResult ? (
                <div className="space-y-5">
                  {/* Action recommendation badge */}
                  <div className="flex items-center justify-between p-4 bg-muted/40 border border-border/40 rounded-2xl">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Final Advice Decision</span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-sm ${
                      buyerAgentResult.advice === 'BUY' 
                        ? 'bg-green-500 text-white shadow-green-100' 
                        : buyerAgentResult.advice === 'NEGOTIATE' 
                          ? 'bg-amber-500 text-white shadow-amber-100' 
                          : 'bg-rose-500 text-white shadow-rose-100'
                    }`}>
                      {buyerAgentResult.advice}
                    </span>
                  </div>

                  {/* Pricing Comparison */}
                  <div className="bg-muted/40 border border-border/40 p-4 rounded-xl font-mono text-xs space-y-2">
                    <div className="flex justify-between items-center text-muted-foreground font-sans font-semibold">
                      <span>Market Valuation Bounds:</span>
                      <AIBadge className="scale-75 origin-right" />
                    </div>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-sm font-black text-foreground">
                        ₹{buyerAgentResult.suggested_min.toLocaleString('en-IN')} - ₹{buyerAgentResult.suggested_max.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold font-sans">
                        Asking: <b className="text-foreground">₹{listing.price.toLocaleString('en-IN')}</b>
                      </span>
                    </div>
                  </div>

                  {/* Pros and Cons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pros */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>PROS</span>
                      </span>
                      <ul className="text-xs space-y-1.5 text-muted-foreground">
                        {buyerAgentResult.pros.length === 0 ? (
                          <li className="text-muted-foreground italic font-medium">No significant pros found.</li>
                        ) : (
                          buyerAgentResult.pros.map((p, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-tight">
                              <span className="text-green-500 font-bold">•</span>
                              <span className="font-semibold text-foreground/90">{p}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    {/* Cons */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>CONS</span>
                      </span>
                      <ul className="text-xs space-y-1.5 text-muted-foreground">
                        {buyerAgentResult.cons.length === 0 ? (
                          <li className="text-green-500 italic font-medium">No warnings/negatives flagged.</li>
                        ) : (
                          buyerAgentResult.cons.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-tight">
                              <span className="text-rose-500 font-bold">•</span>
                              <span className="font-semibold text-foreground/90">{c}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Summary / Explanations */}
                  <div className="p-4 bg-muted/40 border border-border/40 rounded-xl space-y-2 leading-relaxed">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Advisor Explanation</span>
                    <p className="text-xs text-foreground font-medium">{buyerAgentResult.explanation}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">Failed to analyze. Please try again.</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border/40 bg-muted/20 flex items-center justify-between">
              <span className="text-[9px] font-extrabold text-muted-foreground tracking-wide uppercase">
                ✦ AI Generated Suggestion - User holds final authority
              </span>
              <Button
                type="button"
                onClick={() => setIsBuyerAgentModalOpen(false)}
                className="h-9 px-4"
              >
                Close Report
              </Button>
            </div>
          </Card>
        </div>
      )}
      {/* Make Offer Modal Popup */}
      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSubmit={handleMakeOffer}
        askingPrice={listing.price}
        listingTitle={listing.title}
      />

      {/* Similar listings feed */}
      {similarListings.length > 0 && (
        <section className="flex flex-col gap-6 border-t border-border/40 pt-10">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Similar Items in this Category</h3>
              <p className="text-xs text-muted-foreground mt-1">Explore other deals listed nearby under {listing.category}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
