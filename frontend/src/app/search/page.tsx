'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../lib/api';
import ListingCard, { Listing } from '../../components/ListingCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { Search, MapPin, Grid, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

const CATEGORIES = ['Electronics', 'Furniture', 'Fashion', 'Books', 'Vehicles', 'Others'];

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search input states
  const [queryInput, setQueryInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

  // Results states
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync inputs with URL params on mount/change
  useEffect(() => {
    setQueryInput(searchParams.get('query') || '');
    setCategoryInput(searchParams.get('category') || '');
    setLocationInput(searchParams.get('location') || '');
    
    // Execute API search based on URL params
    const executeSearchRequest = async () => {
      try {
        setIsLoading(true);
        const q = searchParams.get('query') || '';
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
        setError('Failed to fetch search results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    executeSearchRequest();
  }, [searchParams]);

  // Handle Form Submission
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (queryInput) params.set('query', queryInput);
    if (categoryInput) params.set('category', categoryInput);
    if (locationInput) params.set('location', locationInput);
    router.push(`/search?${params.toString()}`);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setQueryInput('');
    setCategoryInput('');
    setLocationInput('');
    router.push('/search');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-8 bg-background text-foreground min-h-screen transition-colors duration-200">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              <span>Search Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-4">
            {/* Keyword Search */}
            <Input
              type="text"
              placeholder="Product name, brand..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              label="Keywords"
            />

            {/* Category */}
            <Select
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              label="Category"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            {/* Location */}
            <Input
              type="text"
              placeholder="City, locality..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              label="Location"
            />

            {/* Apply Button */}
            <Button
              type="submit"
              className="w-full text-xs font-bold py-2.5 h-10 uppercase tracking-wider shadow-sm"
            >
              Apply Filters
            </Button>
          </form>
        </Card>
      </aside>

      {/* Search Results Feed */}
      <section className="flex-1 flex flex-col gap-6">
        <div className="border-b border-border/40 pb-4">
          <h2 className="text-xl font-bold text-foreground">
            Search Results
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">
            {isLoading ? 'Searching...' : `${listings.length} item(s) match your filters`}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium rounded-xl">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            title="No matching listings"
            description="We couldn't find any listings matching your current filter criteria. Try clearing some filters."
            actionText="Clear all filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {listings.map((item) => (
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
