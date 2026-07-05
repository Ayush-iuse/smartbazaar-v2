'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { useOfflineStore } from '../lib/store';
import ListingCard, { Listing } from '../components/ListingCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { 
  Sparkles, ShieldCheck, BadgePercent, ChevronRight, 
  ArrowRight, Users, TrendingUp, Landmark, ShieldAlert, Bot, Search
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', count: '1,420 Items' },
  { name: 'Furniture', icon: '🛋️', count: '890 Items' },
  { name: 'Fashion', icon: '👕', count: '2,150 Items' },
  { name: 'Books', icon: '📚', count: '640 Items' },
  { name: 'Vehicles', icon: '🚗', count: '310 Items' },
  { name: 'Others', icon: '📦', count: '1,120 Items' }
];

const STATS = [
  { label: 'Total Listings Traded', value: '45K+', icon: <TrendingUp className="w-5 h-5 text-primary" /> },
  { label: 'Safety Rating Index', value: '99.8%', icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> },
  { label: 'Active Trade Buyers', value: '120K+', icon: <Users className="w-5 h-5 text-blue-500" /> },
  { label: 'Simulated OTPs Issued', value: '150K+', icon: <Landmark className="w-5 h-5 text-amber-500" /> }
];

const TESTIMONIALS = [
  {
    quote: "The AI description suggestion is a lifesaver. I listed my office chair and sold it in 2 days. The pricing advisor average was spot on!",
    author: "Sameer Verma",
    role: "Casual Seller, Pune",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    quote: "I was hesitant to buy electronics on peer-to-peer sites, but seeing the seller's trust score and verified badges gave me the confidence to buy.",
    author: "Divya Sharma",
    role: "Value Buyer, Mumbai",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  }
];

export default function HomePage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [trending, setTrending] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchVal, setSearchVal] = useState('');

  const { isOffline } = useOfflineStore();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // Load latest listings
        const resListings = await api.get('/api/listings');
        const listData = Array.isArray(resListings.data) ? resListings.data : (resListings.data.listings || []);
        const sorted = [...listData].sort((a, b) => b.id - a.id);
        setListings(sorted.slice(0, 8));

        // Load trending
        try {
          const resTrending = await api.get('/api/recommendations/trending');
          const trendData = Array.isArray(resTrending.data) ? resTrending.data : (resTrending.data.listings || []);
          setTrending(trendData.slice(0, 4));
        } catch (e) {
          console.error("Trending fetch error:", e);
        }

        setError(null);
      } catch (err: any) {
        console.error('Failed to load home page listings:', err);
        setError('Backend is currently unavailable.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const handleCategoryClick = (catName: string) => {
    router.push(`/search?category=${encodeURIComponent(catName)}`);
  };

  return (
    <div className="flex flex-col gap-20 pb-20 bg-background text-foreground transition-colors duration-200">
      
      {isOffline && (
        <div className="w-full bg-amber-500 text-slate-950 font-black text-center py-2.5 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 px-4 shadow-sm z-30">
          <ShieldAlert className="w-4 h-4" />
          <span>Backend is currently unavailable. Running in Offline Mock Sandbox Mode.</span>
        </div>
      )}
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-16 border-b border-border bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        
        {/* Soft Background blur blobs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center gap-6">
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-black text-[9px] uppercase tracking-widest rounded-full"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>SmartBazaar AI V2 Engine</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight max-w-4xl leading-[1.1] text-foreground"
          >
            Buy & Sell Locally, <br />
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Refined by Intelligence
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed"
          >
            Experience a secure P2P marketplace. Leverage AI to auto-write listing details, estimate fair prices against category averages, check seller trust badges, and run safety audits.
          </motion.p>

          {/* Search bar CTA */}
          <motion.form 
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-2xl flex items-center relative gap-2 mt-4 px-2"
          >
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items by location, price, or description (e.g. cycle under 4000 in Mumbai)..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-12 pl-12 pr-4 border border-border bg-card rounded-2xl text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 shadow-sm text-foreground placeholder:text-muted-foreground"
            />
            <Button type="submit" className="shrink-0 h-12 rounded-2xl px-6">
              Search
            </Button>
          </motion.form>

        </div>
      </section>

      {/* 2. CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-xs font-black text-primary uppercase tracking-widest">Discover Items</h2>
          <h3 className="text-xl font-bold tracking-tight text-foreground">Browse Popular Categories</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              whileHover={{ scale: 1.03 }}
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="bg-card border border-border/80 hover:border-primary/50 p-6 rounded-2xl text-center shadow-sm cursor-pointer transition-all duration-300 flex flex-col items-center gap-3"
            >
              <span className="text-3xl select-none">{cat.icon}</span>
              <div>
                <h4 className="text-xs font-bold text-foreground">{cat.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{cat.count}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. AI COPILOT SHOWCASE WIDGET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 lg:p-12 space-y-6 flex flex-col justify-center">
            <Badge variant="primary" className="bg-primary/20 text-primary border-primary/30 w-fit">
              AI Marketplace Assistant
            </Badge>
            <h3 className="text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Negotiate and Search in Natural Language
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open the AI Copilot chat window and write prompts like you're talking to a broker. Ask to compare guitar models, verify if a buyer's trust score is authentic, or check if a listing triggers spam alerts.
            </p>
            <Link href="/copilot">
              <Button variant="primary" className="w-fit gap-1.5 h-11 px-6 rounded-xl bg-primary text-white border-none hover:bg-primary/90">
                <span>Try AI Copilot Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Interactive Chat Mockup */}
          <div className="bg-slate-950 p-6 border-l border-slate-800 flex flex-col justify-between gap-4 min-h-[300px]">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Bot className="w-5 h-5 text-primary" />
              <span className="text-xs font-bold font-mono">Copilot Session #1</span>
            </div>
            
            <div className="space-y-3 flex-grow overflow-hidden flex flex-col justify-end">
              <div className="flex justify-end">
                <div className="bg-primary px-3.5 py-2.5 rounded-2xl rounded-br-none text-[11px] font-medium max-w-[80%]">
                  Is listing #1 overpriced?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-2xl rounded-bl-none text-[11px] text-slate-300 leading-relaxed max-w-[85%]">
                  Listing #1 (**Yamaha Guitar**) is priced at ₹8,000. The average category price is **₹7,200**. It is priced slightly high (+11%). We suggest offering around ₹7,000.
                </div>
              </div>
            </div>

            <div className="flex gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2 items-center text-[10px] text-slate-500">
              <span className="flex-1 pl-2">Type your marketplace inquiry...</span>
              <Button size="sm" className="h-8 rounded-lg">Send</Button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATISTICS COUNTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-card border border-border/80 p-6 rounded-2xl shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                {stat.icon}
              </div>
              <p className="text-3xl font-black text-foreground tracking-tight font-mono">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TRUST & SAFETY SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <Badge variant="success" className="w-fit">
            Trade Safely
          </Badge>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Advanced Verification & Risk Assessment
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            SmartBazaar's built-in Safety Platform computes dynamic trust scores for buyers and provides multiple verification badges for sellers (Email, Phone, and Government ID verifications). High-risk listings are automatically flagged to ensure trades remain fraud-free.
          </p>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-emerald-500/10 rounded-full text-emerald-500">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Government ID Badges</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Sellers upload verifications reviewed in secure queues before earning ID badges.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-rose-500/10 rounded-full text-rose-500">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Anti-Spam Keyword Filters</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Automatic interceptors block listings requesting Western Union or wire deposits.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Mock Card */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-md space-y-4">
          <h4 className="text-xs font-bold text-foreground pb-2 border-b border-border">Seller Trust Review</h4>
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full" />
              <div>
                <p className="font-bold">Rahul Deshmukh</p>
                <p className="text-[10px] text-muted-foreground">Joined June 2026</p>
              </div>
            </div>
            <Badge variant="success">Trusted Seller</Badge>
          </div>
          <div className="p-4 bg-muted/40 rounded-xl space-y-2">
            <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
              <span>RELIABILITY SCORE</span>
              <span className="text-emerald-500 font-black">94 / 100</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[94%]" />
            </div>
            <p className="text-[9px] text-muted-foreground leading-normal mt-2">
              • Email Verified • OTP Validated • 24 Completed trades • 98% Response rate
            </p>
          </div>
        </div>
      </section>

      {/* 6. TRENDING VALUED PICKS */}
      {trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-border pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Trending Valued Picks</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">High listing health and popular deals locally</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trending.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}

      {/* 7. LATEST RECOMMENDATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-6">
        <div className="flex justify-between items-end border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Latest Recommendations</h2>
            <p className="text-xs text-muted-foreground mt-1">Discover freshly posted items trading in your neighborhood</p>
          </div>
          <Link
            href="/search"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>See all listings</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 text-rose-600 text-xs text-center font-bold">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-muted h-64 rounded-2xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-10 bg-card rounded-2xl border border-border">
            <p className="text-xs text-muted-foreground">No listings available. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </section>

      {/* 8. TESTIMONIALS CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8">
        <div className="text-center space-y-1.5">
          <h2 className="text-xs font-black text-primary uppercase tracking-widest">Success Stories</h2>
          <h3 className="text-xl font-bold tracking-tight text-foreground">What Buyers & Sellers Say</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          {TESTIMONIALS.map((item, idx) => (
            <Card key={idx} className="bg-card border border-border/80 shadow-sm p-6 space-y-4">
              <CardContent className="p-0 space-y-4">
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "{item.quote}"
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-border/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.avatar} alt={item.author} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{item.author}</h4>
                    <p className="text-[10px] text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}
