'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import {
  Sparkles, Shield, Layers, Search, Calendar,
  ArrowRight, Package, Cpu, Car, Sofa, Gamepad2,
  Camera, Shirt, TrendingUp, MapPin, Star, Filter, X
} from 'lucide-react';
import api from '../../lib/api';
import ListingCard, { Listing } from '../../components/ListingCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const RENTAL_CATEGORIES = [
  { name: 'Electronics', icon: <Cpu className="w-5 h-5" />, color: 'text-blue-500' },
  { name: 'Vehicles', icon: <Car className="w-5 h-5" />, color: 'text-amber-500' },
  { name: 'Furniture', icon: <Sofa className="w-5 h-5" />, color: 'text-emerald-500' },
  { name: 'Gaming', icon: <Gamepad2 className="w-5 h-5" />, color: 'text-violet-500' },
  { name: 'Photography', icon: <Camera className="w-5 h-5" />, color: 'text-rose-500' },
  { name: 'Fashion', icon: <Shirt className="w-5 h-5" />, color: 'text-orange-500' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Find Your Rental', desc: 'Browse local rental listings with real-time availability calendars and verified host profiles.' },
  { step: '02', title: 'Book & Secure', desc: 'Place a booking request. Security deposit is held in smart escrow until return is confirmed.' },
  { step: '03', title: 'Rent & Return', desc: 'Collect, use, and return with our digital checklist. Deposit released automatically on clean return.' },
];

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } }
};

export default function RentPage() {
  const router = useRouter();
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [trendingListings, setTrendingListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchRentals = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all listings and filter rental ones client-side
      const allRes = await api.get('/api/listings?page=1&size=50');
      const allData = Array.isArray(allRes.data)
        ? allRes.data
        : (allRes.data?.listings || []);

      // Filter to only rental listings
      const rentalData = allData.filter((l: any) => l.allow_rental === true);
      setFeaturedListings(rentalData.slice(0, 6));
      setAllListings(rentalData);

      // Trending
      try {
        const trendRes = await api.get('/api/recommendations/trending');
        const trendData = Array.isArray(trendRes.data)
          ? trendRes.data
          : (trendRes.data?.listings || []);
        setTrendingListings(trendData.slice(0, 4));
      } catch {
        // non-critical
      }
    } catch (err) {
      console.error('Failed to fetch rental listings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRentals(); }, [fetchRentals]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ type: 'rent' });
    if (searchQuery.trim()) params.set('query', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    router.push(`/search?${params.toString()}`);
  };

  // Client-side filter for the grid (fast UX)
  const filteredListings = allListings.filter(l => {
    const matchSearch = !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = !selectedCategory || l.category === selectedCategory;
    const matchMin = !minPrice || l.price >= parseFloat(minPrice);
    const matchMax = !maxPrice || l.price <= parseFloat(maxPrice);
    return matchSearch && matchCat && matchMin && matchMax;
  });

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-bazaar-terracotta text-bazaar-terracotta text-[9px] font-black uppercase tracking-widest bg-bazaar-terracotta/5">
              <Sparkles className="w-3 h-3" />
              <span>The Rental Street Market</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-foreground leading-[0.92]">
              Own Nothing.<br />
              <span className="text-bazaar-terracotta">Rent Everything.</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl font-medium leading-relaxed">
              Rent electronics, vehicles, furniture, cameras & more from verified local hosts.
              Secure digital agreements. Escrow deposits. Return checklists.
            </p>

            {/* Hero Search */}
            <form onSubmit={handleSearch} className="flex border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,248,245,0.85)] max-w-2xl">
              <div className="flex-grow flex items-center px-4 gap-2">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search rentals — cameras, bikes, projectors..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full py-3.5 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
              <button type="submit" className="bg-foreground text-background font-black text-[10px] uppercase tracking-wider px-6 hover:bg-foreground/90 transition-colors shrink-0">
                Search
              </button>
            </form>

            <div className="flex gap-3 flex-wrap">
              <Link href="/create-listing" className="flex items-center gap-2 px-5 py-2.5 border-2 border-foreground bg-card font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(250,248,245,0.85)] hover:bg-muted/20 transition-all">
                List an Asset
              </Link>
            </div>
          </div>

          {/* Rental Protection Panel */}
          <div className="lg:col-span-5 border-2 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,248,245,0.85)] space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest border-b border-foreground/10 pb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-bazaar-terracotta" />
              Rental Protection Protocol
            </h3>
            <ul className="space-y-3">
              {[
                'Security deposits held in smart escrow until clean return',
                'Verified host identities & AI fraud detection on listings',
                'Automated digital contracts protect both parties',
                'Interactive return checklists with photo proof',
                'Instant refund triggers on confirmed item return',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[10px] text-muted-foreground font-medium">
                  <span className="w-4 h-4 bg-bazaar-terracotta/10 border border-bazaar-terracotta text-bazaar-terracotta text-[8px] font-black flex items-center justify-center shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-bazaar-terracotta" />
              Browse by Category
            </h2>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-3 sm:grid-cols-6 gap-3"
          >
            {RENTAL_CATEGORIES.map((cat) => (
              <motion.div key={cat.name} variants={fadeUp}>
                <button
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat.name ? '' : cat.name);
                  }}
                  className={`w-full border-2 p-4 flex flex-col items-center gap-2 text-center transition-all duration-150 ${
                    selectedCategory === cat.name
                      ? 'border-foreground bg-foreground text-background shadow-none translate-x-px translate-y-px'
                      : 'border-border bg-card hover:border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] dark:hover:shadow-[2px_2px_0px_0px_rgba(250,248,245,0.85)]'
                  }`}
                >
                  <span className={selectedCategory === cat.name ? 'text-background' : cat.color}>
                    {cat.icon}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider leading-tight">{cat.name}</span>
                </button>
              </motion.div>
            ))}
          </motion.div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory('')}
              className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-wider"
            >
              <X className="w-3 h-3" /> Clear filter
            </button>
          )}
        </div>
      </section>

      {/* ── FEATURED RENTALS ── */}
      {featuredListings.length > 0 && (
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <Star className="w-4 h-4 text-bazaar-terracotta" />
                Featured Rentals
              </h2>
              <Link href="/search?type=rent" className="text-[10px] font-black text-bazaar-terracotta hover:underline uppercase tracking-wider flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              {featuredListings.map((listing) => (
                <motion.div key={listing.id} variants={fadeUp}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── TRENDING RENTALS ── */}
      {trendingListings.length > 0 && (
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-bazaar-terracotta" />
                Trending Rentals
              </h2>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
            >
              {trendingListings.map((listing) => (
                <motion.div key={listing.id} variants={fadeUp}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── ALL RENTALS GRID + FILTERS ── */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <h2 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <Package className="w-4 h-4 text-bazaar-terracotta" />
              All Rentals
              {filteredListings.length > 0 && (
                <span className="text-[10px] font-mono text-muted-foreground ml-1">({filteredListings.length})</span>
              )}
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                showFilters
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border hover:border-foreground'
              }`}
            >
              <Filter className="w-3 h-3" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-2 border-foreground bg-card p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,248,245,0.85)]"
            >
              <div>
                <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Min Daily Rate (₹)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 border border-border bg-muted/10 text-xs outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div>
                <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Max Daily Rate (₹)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 border border-border bg-muted/10 text-xs outline-none focus:border-foreground transition-colors"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => { setMinPrice(''); setMaxPrice(''); setSelectedCategory(''); }}
                  className="w-full px-3 py-2 border border-border text-[10px] font-black uppercase tracking-wider hover:border-foreground transition-colors"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border">
              <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                No rental listings found
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1 mb-4">
                {selectedCategory || searchQuery ? 'Try adjusting your filters' : 'Be the first to list a rental'}
              </p>
              <Link href="/create-listing" className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background font-black text-[10px] uppercase tracking-wider">
                List a Rental
              </Link>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            >
              {filteredListings.map((listing) => (
                <motion.div key={listing.id} variants={fadeUp}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-t border-border bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-sm font-black uppercase tracking-tight text-center mb-10">
            How Rentals Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,248,245,0.85)]">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.step}
                className={`p-8 bg-card space-y-4 ${i < HOW_IT_WORKS.length - 1 ? 'border-b md:border-b-0 md:border-r border-foreground' : ''}`}
              >
                <div className="text-4xl font-black font-mono text-bazaar-terracotta/20">{step.step}</div>
                <h3 className="text-sm font-black uppercase tracking-tight">{step.title}</h3>
                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
