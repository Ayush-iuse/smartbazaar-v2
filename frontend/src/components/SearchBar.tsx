'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Grid } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Furniture', 'Fashion', 'Books', 'Vehicles', 'Others'];

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  // Sync state with URL params
  useEffect(() => {
    setQuery(searchParams.get('query') || '');
    setCategory(searchParams.get('category') || '');
    setLocation(searchParams.get('location') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full flex flex-col md:flex-row items-stretch gap-2 bg-white p-2 border border-slate-200 rounded-xl md:rounded-full shadow-sm max-w-4xl mx-auto"
    >
      {/* Search Query Input */}
      <div className="flex-1 flex items-center gap-2 px-3 border-b md:border-b-0 md:border-r border-slate-100 pb-2 md:pb-0">
        <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Find cars, mobile phones, jobs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full text-sm text-slate-750 placeholder-slate-400 bg-transparent focus:outline-none"
        />
      </div>

      {/* Category Dropdown */}
      <div className="flex-1 max-w-xs flex items-center gap-2 px-3 border-b md:border-b-0 md:border-r border-slate-100 pb-2 md:pb-0">
        <Grid className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full text-sm text-slate-700 bg-transparent focus:outline-none cursor-pointer appearance-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Location Input */}
      <div className="flex-1 max-w-xs flex items-center gap-2 px-3 pb-2 md:pb-0">
        <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full text-sm text-slate-750 placeholder-slate-400 bg-transparent focus:outline-none"
        />
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg md:rounded-full text-sm shadow-md transition-all flex items-center justify-center gap-1.5 hover:shadow-brand-200"
      >
        <Search className="w-4 h-4" />
        <span>Search</span>
      </button>
    </form>
  );
}
