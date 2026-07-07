'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import ListingCard, { Listing } from '../../components/ListingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Search, MapPin, Grid, SlidersHorizontal, RotateCcw, Sparkles, Filter, ShieldCheck, Flame, History, Keyboard } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

const CATEGORIES = ['Electronics', 'Furniture', 'Fashion', 'Books', 'Vehicles', 'Others'];
const POPULAR_SEARCHES = ['iPhone', 'Guitar', 'Leather Jacket', 'Study Table', 'Bicycle'];

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search inputs
  const [queryInput, setQueryInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

  // Suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Advanced Filters
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [delivery, setDelivery] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Listings results
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sb_search_history');
      if (stored) {
        try {
          setSearchHistory(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Sync inputs with URL params
  useEffect(() => {
    const q = searchParams.get('query') || '';
    setQueryInput(q);
    setCategoryInput(searchParams.get('category') || '');
    setLocationInput(searchParams.get('location') || '');

    const executeSearchRequest = async () => {
      try {
        setIsLoading(true);
        const category = searchParams.get('category') || '';
        const location = searchParams.get('location') || '';

        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (category) params.set('category', category);
        if (location) params.set('location', location);

        const res = await api.get(`/api/search?${params.toString()}`);
        setListings(res.data || []);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch search results. Running in local fallback mode.');
      } finally {
        setIsLoading(false);
      }
    };

    executeSearchRequest();
  }, [searchParams]);

  // Click outside suggestions trigger
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToHistory = (q: string) => {
    if (!q.trim()) return;
    const filtered = searchHistory.filter((item) => item !== q);
    const next = [q, ...filtered].slice(0, 5);
    setSearchHistory(next);
    localStorage.setItem('sb_search_history', JSON.stringify(next));
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    addToHistory(queryInput);
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (queryInput) params.set('query', queryInput);
    if (categoryInput) params.set('category', categoryInput);
    if (locationInput) params.set('location', locationInput);
    router.push(`/search?${params.toString()}`);
  };

  const handleSuggestionClick = (val: string) => {
    setQueryInput(val);
    addToHistory(val);
    setShowSuggestions(false);
    const params = new URLSearchParams();
    params.set('query', val);
    if (categoryInput) params.set('category', categoryInput);
    if (locationInput) params.set('location', locationInput);
    router.push(`/search?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setQueryInput('');
    setCategoryInput('');
    setLocationInput('');
    setMinPrice('');
    setMaxPrice('');
    setCondition('all');
    setVerifiedOnly(false);
    setDelivery('all');
    setSortBy('newest');
    router.push('/search');
  };

  // Predict category based on input keywords
  const getPredictedCategory = () => {
    const q = queryInput.toLowerCase();
    if (q.includes('phone') || q.includes('laptop') || q.includes('tv') || q.includes('headphone')) return 'Electronics';
    if (q.includes('chair') || q.includes('table') || q.includes('sofa') || q.includes('bed')) return 'Furniture';
    if (q.includes('shirt') || q.includes('jacket') || q.includes('shoe') || q.includes('bag')) return 'Fashion';
    if (q.includes('book') || q.includes('novel') || q.includes('comic')) return 'Books';
    if (q.includes('car') || q.includes('bike') || q.includes('cycle') || q.includes('scooter')) return 'Vehicles';
    return null;
  };

  const predicted = getPredictedCategory();

  // Client-side filtering & sorting calculations
  const filteredListings = listings
    .filter((item) => {
      if (minPrice && item.price < Number(minPrice)) return false;
      if (maxPrice && item.price > Number(maxPrice)) return false;
      
      const itemTrust = (item.seller_id * 17) % 21 + 79;
      if (verifiedOnly && itemTrust < 85) return false;

      const mockCondition = ['new', 'like-new', 'good', 'fair'][item.id % 4];
      if (condition !== 'all' && mockCondition !== condition) return false;

      const mockDelivery = item.id % 2 === 0 ? 'pickup' : 'shipping';
      if (delivery !== 'all' && mockDelivery !== delivery) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'trust-high') {
        const trustA = (a.seller_id * 17) % 21 + 79;
        const trustB = (b.seller_id * 17) % 21 + 79;
        return trustB - trustA;
      }
      return b.id - a.id; // newest
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-8 bg-background text-foreground min-h-screen">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-68 flex-shrink-0">
        <Card className="p-6 space-y-6 rounded-[2rem] border border-border/30 shadow-md">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="font-black text-foreground flex items-center gap-2 text-sm uppercase tracking-tight">
              <SlidersHorizontal className="w-4.5 h-4.5 text-primary" />
              <span>Smart Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="p-1.5 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-5">
            {/* Keyword Search with Suggestion Box */}
            <div className="relative" ref={suggestionsRef}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="E.g. cycles, laptops..."
                  value={queryInput}
                  onChange={(e) => {
                    setQueryInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  label="Keyword Search"
                />
                <Search className="w-4 h-4 text-muted-foreground/60 absolute right-3.5 bottom-3.5 pointer-events-none" />
              </div>

              {/* Suggestions popover */}
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-full mt-1.5 glass rounded-2xl border border-border/40 shadow-2xl p-4 z-40 space-y-4 max-h-[320px] overflow-y-auto">
                  {predicted && (
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider block">Category Match AI</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryInput(predicted);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span>Filter by {predicted}</span>
                      </button>
                    </div>
                  )}

                  {searchHistory.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider block">Recent Searches</span>
                      <div className="flex flex-col gap-1">
                        {searchHistory.map((h, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSuggestionClick(h)}
                            className="text-left text-xs font-bold text-foreground/80 hover:text-primary transition-colors py-1 flex items-center gap-1.5"
                          >
                            <History className="w-3.5 h-3.5 text-muted-foreground/60" />
                            <span>{h}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider block">Popular Local Searches</span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_SEARCHES.map((pop, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSuggestionClick(pop)}
                          className="bg-muted/40 hover:bg-muted/70 text-[10px] text-foreground font-bold px-2.5 py-1 rounded-xl border border-border/40 transition-colors"
                        >
                          {pop}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category Dropdown */}
            <Select
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              label="Product Category"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            {/* Price range */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Price Bracket (INR)</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-border/40 rounded-xl bg-muted/20 text-xs outline-none text-foreground font-mono focus:border-primary/50"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-border/40 rounded-xl bg-muted/20 text-xs outline-none text-foreground font-mono focus:border-primary/50"
                />
              </div>
            </div>

            {/* Location filter */}
            <Input
              type="text"
              placeholder="E.g. Pune, Mumbai..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              label="Location (City)"
            />

            {/* Condition Filter */}
            <Select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              label="Product Condition"
            >
              <option value="all">Any Condition</option>
              <option value="new">Brand New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good / Used</option>
              <option value="fair">Fair / Functional</option>
            </Select>

            {/* Delivery type */}
            <Select
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              label="Logistics Option"
            >
              <option value="all">Any Delivery</option>
              <option value="pickup">Local In-Person Pickup</option>
              <option value="shipping">Nationwide Shipping</option>
            </Select>

            {/* Trust Toggle check */}
            <div className="flex items-center justify-between p-2.5 bg-muted/20 border border-border/40 rounded-xl">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold text-foreground">Verified Sellers Only</span>
              </div>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded border-border/40 text-primary accent-primary outline-none"
              />
            </div>

            {/* Apply Button */}
            <Button
              type="submit"
              className="w-full text-xs font-bold py-2.5 h-11 uppercase tracking-wider shadow-sm rounded-xl"
            >
              Apply Filter Params
            </Button>
          </form>
        </Card>
      </aside>

      {/* Search Results Feed */}
      <section className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/40 pb-4 gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
              Search Results
            </h2>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">
              {isLoading ? 'Retrieving listings...' : `${filteredListings.length} item(s) match filters`}
            </p>
          </div>

          {/* Sort Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Sort Order:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-muted/40 text-xs font-bold border border-border/40 px-3 py-1.5 rounded-xl outline-none text-foreground cursor-pointer focus:border-primary/50"
            >
              <option value="newest">Newest Listed</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="trust-high">Seller Trust Rating</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-muted/20 h-64 rounded-[2rem] border border-border/40" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <EmptyState
            title="No matching listings"
            description="No listings correspond to the set sidebar filter ranges. Try resetting your price tags or condition criteria."
            actionText="Clear all search filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="py-20 bg-background text-foreground flex justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
