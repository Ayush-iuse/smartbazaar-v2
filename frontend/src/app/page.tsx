'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '../lib/api';
import ListingCard, { Listing } from '../components/ListingCard';
import MarketplacePlanet from '../components/MarketplacePlanet';
import { useTranslation } from '../i18n';
import {
  Sparkles, ShieldCheck, ArrowRight,
  TrendingUp, Bot, Search, ShoppingBag,
  Star, Award, Compass, Package
} from 'lucide-react';


export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [rentalListings, setRentalListings] = useState<Listing[]>([]);
  const [trending, setTrending] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'trending'>('buy');
  const [isLoading, setIsLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLogs, setAiChatLogs] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    { sender: 'bot', text: 'Namaste! Welcome to SmartBazaar. Describe what you are looking to buy or rent today.' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ name: string; count: string; code: string }>>([]);

  useEffect(() => {
    const CATEGORY_EMOJI: Record<string, string> = {
      Electronics: '💻', Vehicles: '🚗', Furniture: '🛋️',
      Gaming: '🎮', Photography: '📷', Fashion: '👕',
      Books: '📚', Sports: '⚽', Home: '🏠', Appliances: '🔌',
      Jewelry: '💍', Music: '🎸', Tools: '🔧', Other: '📦'
    };

    async function loadData() {
      try {
        setIsLoading(true);

        // Load latest buy listings
        const resListings = await api.get('/api/listings?page=1&size=20');
        const listData = Array.isArray(resListings.data) ? resListings.data : (resListings.data.listings || []);
        const sorted = [...listData].sort((a: Listing, b: Listing) => b.id - a.id);
        setListings(sorted.slice(0, 8));

        // Load rental listings (filter client-side from all listings)
        const rentalData = listData.filter((l: Listing) => (l as any).allow_rental === true);
        setRentalListings(rentalData.slice(0, 8));

        // Load trending
        try {
          const resTrending = await api.get('/api/recommendations/trending');
          const trendData = Array.isArray(resTrending.data) ? resTrending.data : (resTrending.data.listings || []);
          setTrending(trendData.slice(0, 8));
        } catch (e) {
          console.error('Trending fetch error:', e);
        }

        // Load real category counts from analytics
        try {
          const resAnalytics = await api.get('/api/analytics/overview');
          const cats = resAnalytics.data?.categories || [];
          const dynamicCategories = cats
            .sort((a: any, b: any) => b.count - a.count)
            .slice(0, 6)
            .map((c: any) => ({
              name: c.category,
              count: `${c.count.toLocaleString('en-IN')} items`,
              code: CATEGORY_EMOJI[c.category] || '📦'
            }));
          if (dynamicCategories.length > 0) {
            setCategories(dynamicCategories);
          }
        } catch (e) {
          console.error('Analytics fetch error:', e);
        }
      } catch (err) {
        console.error('Failed to load home page listings:', err);
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

  const handleAiChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    const userMsg = aiChatInput;
    setAiChatLogs(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiChatInput('');
    setAiLoading(true);

    try {
      const res = await api.post('/api/ai/copilot', {
        title: userMsg,
        description: '',
        price: 0,
        category: 'General',
        location: 'Mumbai',
        condition: 'New',
        image_count: 0
      });
      const reply = res.data?.recommendations?.[0] || "I checked the marketplace pulse. Let me know if you want to filter listings by price or search details!";
      setAiChatLogs(prev => [...prev, { sender: 'bot', text: reply }]);
    } catch (err) {
      setAiChatLogs(prev => [...prev, { sender: 'bot', text: 'I am checking active listings database, let me redirect you to search.' }]);
      setTimeout(() => {
        router.push(`/search?query=${encodeURIComponent(userMsg)}`);
      }, 1500);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      {/* Subtle paper grain texture representation */}
      <div className="absolute inset-0 bg-noise pointer-events-none opacity-[0.015] dark:opacity-[0.035]" />
      


      {/* Hero: Editorial Grid & Interactive 3D Planet */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 w-full flex-grow">
        
        {/* Asymmetric Header Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-foreground/10 pb-12 items-stretch">
          
          {/* Big Editorial Block */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8 py-4">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-bazaar-terracotta/10 border border-bazaar-terracotta text-bazaar-terracotta text-[9px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                <span>The P2P Digital Bazaar</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-foreground leading-[0.95]">
                {t('home.hero.title')}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground max-w-lg font-medium leading-relaxed">
                {t('home.hero.subtitle')}
              </p>
            </div>

            {/* Flat Search Box (Spotlight Style trigger) */}
            <form onSubmit={handleSearchSubmit} className="flex border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,248,245,0.85)] max-w-xl">
              <div className="flex-grow flex items-center px-4">
                <Search className="w-4 h-4 text-muted-foreground mr-2" />
                <input
                  type="text"
                  placeholder={t('home.hero.searchPlaceholder')}
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full py-3.5 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
              <button type="submit" className="bg-foreground text-background font-black text-xs uppercase px-6 hover:bg-foreground/90 transition-colors">
                {t('home.hero.searchButton')}
              </button>
            </form>
          </div>

          {/* Interactive 3D WebGL Globe Block */}
          <div className="lg:col-span-5 relative border-2 border-foreground bg-card p-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,248,245,0.85)] min-h-[300px] overflow-hidden">
            <MarketplacePlanet />
            <div className="relative z-10 space-y-1">
              <span className="text-[8px] font-black uppercase tracking-wider text-bazaar-terracotta">Live Marketplace Pulse</span>
              <h3 className="text-sm font-black uppercase">Active Nodes</h3>
            </div>
            <p className="relative z-10 text-[9px] text-muted-foreground font-mono">
              Real-time activity logs. Listings across Delhi, Mumbai, Pune, and Bangalore mapping dynamic trade connections.
            </p>
          </div>

        </section>

        {/* Magazine Style Grid Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Box 1: Interactive Categories Grid */}
          <div className="border-2 border-foreground p-6 bg-card space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,248,245,0.85)]">
            <div className="flex justify-between items-center border-b border-foreground/10 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-bazaar-terracotta" />
                <span>{t('home.categories')}</span>
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => router.push(`/search?category=${encodeURIComponent(cat.name)}`)}
                  className="border border-foreground/15 p-4 bg-muted/10 cursor-pointer hover:border-foreground transition-all duration-200"
                >
                  <div className="text-xl mb-2">{cat.code}</div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-foreground">{cat.name}</h4>
                  <span className="text-[8px] text-muted-foreground font-bold uppercase mt-1 block">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: Real-time AI Concierge Workspace */}
          <div className="border-2 border-foreground p-6 bg-card space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,248,245,0.85)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-foreground/10 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-bazaar-terracotta" />
                  <span>AI Concierge</span>
                </h3>
                <span className="text-[8px] font-mono uppercase bg-bazaar-forest/10 text-bazaar-forest px-2 py-0.5 border border-bazaar-forest/20">Active</span>
              </div>
              
              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                {aiChatLogs.map((log, index) => (
                  <div key={index} className={`p-2.5 text-[10px] leading-relaxed border ${log.sender === 'user' ? 'bg-muted/30 border-foreground/10 text-right ml-8' : 'bg-bazaar-terracotta/5 border-bazaar-terracotta/20 text-left mr-8'}`}>
                    <p className="font-bold text-[8px] uppercase text-muted-foreground mb-1">
                      {log.sender === 'user' ? 'You' : 'Bazaar Assistant'}
                    </p>
                    <p>{log.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleAiChatSubmit} className="flex border border-foreground mt-4">
              <input
                type="text"
                placeholder="Ask e.g. Rent DSLR in Delhi"
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                disabled={aiLoading}
                className="flex-grow px-3 py-2 text-xs bg-transparent outline-none text-foreground"
              />
              <button type="submit" disabled={aiLoading} className="bg-foreground text-background px-4 text-[10px] font-black uppercase">
                {aiLoading ? '...' : 'Ask'}
              </button>
            </form>
          </div>

          {/* Box 3: Live Pulse / Trust Statistics */}
          <div className="border-2 border-foreground p-6 bg-card space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,248,245,0.85)] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-foreground/10 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-bazaar-terracotta" />
                  <span>Trust Infrastructure</span>
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground mb-1">
                    <span>Safety Index Rating</span>
                    <span className="text-bazaar-forest">99.8% Passed</span>
                  </div>
                  <div className="w-full bg-muted/40 h-1.5 border border-foreground/10">
                    <div className="bg-bazaar-forest h-full" style={{ width: '99.8%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] font-black uppercase text-muted-foreground mb-1">
                    <span>Identity Verified Traders</span>
                    <span className="text-foreground">84K+ Members</span>
                  </div>
                  <div className="w-full bg-muted/40 h-1.5 border border-foreground/10">
                    <div className="bg-bazaar-terracotta h-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-foreground/10 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground block font-bold">ESCROW SAFETY</span>
                <span className="text-xs font-black uppercase">Instant Hold Release</span>
              </div>
              <ShieldCheck className="w-7 h-7 text-bazaar-forest" />
            </div>
          </div>

        </section>

        {/* Live Deals & Aggregated Listings Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-bazaar-terracotta" />
                <span>{t('home.featuredListings')}</span>
              </h2>
              <p className="text-[10px] text-muted-foreground mt-1">Direct from local hosts and verified business hubs</p>
            </div>
            
            {/* Buy / Rent / Trending tabs */}
            <div className="flex border border-foreground text-[9px] font-black uppercase bg-card">
              {(['buy', 'rent', 'trending'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 border-r last:border-r-0 border-foreground transition-colors ${activeTab === tab ? 'bg-foreground text-background' : 'hover:bg-muted/20'}`}
                >
                  {t(`home.tabs.${tab}`)}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border border-foreground/10 h-72 animate-pulse bg-muted/10" />
              ))}
            </div>
          ) : activeTab === 'buy' && listings.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-foreground/10">
              <p className="text-xs text-muted-foreground uppercase font-bold">No listings yet.</p>
              <Link href="/create-listing" className="text-xs text-bazaar-terracotta font-black hover:underline mt-2 inline-block uppercase tracking-wider">Publish First Listing</Link>
            </div>
          ) : activeTab === 'rent' && rentalListings.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-foreground/10">
              <p className="text-xs text-muted-foreground uppercase font-bold">No rental listings yet.</p>
              <Link href="/rent" className="text-xs text-bazaar-terracotta font-black hover:underline mt-2 inline-block uppercase tracking-wider">View Rental Marketplace</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {(activeTab === 'buy' ? listings : activeTab === 'rent' ? rentalListings : trending).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
