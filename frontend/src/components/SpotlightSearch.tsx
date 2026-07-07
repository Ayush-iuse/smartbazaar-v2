'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, Sparkles } from 'lucide-react';
import api from '../lib/api';
import { Listing } from './ListingCard';

interface SpotlightSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SpotlightSearch({ isOpen, onClose }: SpotlightSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Listing[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sb_recent_searches');
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Ctrl+K / Cmd+K globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // Or trigger open.
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Instant query searching
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (listingId: number) => {
    saveRecentSearch(query);
    onClose();
    router.push(`/listing/${listingId}`);
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
  };

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const next = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
    setRecentSearches(next);
    localStorage.setItem('sb_recent_searches', JSON.stringify(next));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
      onClose();
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 dark:bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      {/* Click outside backdrop container */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-bazaar-ivory dark:bg-bazaar-charcoal border-2 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(250,248,245,0.85)] overflow-hidden flex flex-col"
      >
        {/* Input Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center border-b-2 border-foreground p-4 bg-card">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search anything... e.g. 'cycle', 'camera'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          />
          <button type="button" onClick={onClose} className="p-1 hover:bg-muted/20 border border-transparent hover:border-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* Results Container */}
        <div className="max-h-[350px] overflow-y-auto p-4 space-y-6">
          {loading ? (
            <div className="text-center py-6 text-xs text-muted-foreground uppercase font-mono tracking-widest">Searching...</div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-[9px] font-black uppercase text-bazaar-terracotta tracking-wider">Matching Bazaar Listings</h4>
              <div className="space-y-1">
                {results.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleSelectResult(r.id)}
                    className="p-3 border border-foreground/10 hover:border-foreground bg-card cursor-pointer flex justify-between items-center transition-all duration-200"
                  >
                    <div>
                      <span className="text-xs font-bold block">{r.title}</span>
                      <span className="text-[9px] text-muted-foreground font-mono">{r.category} • {r.location}</span>
                    </div>
                    <span className="text-xs font-black font-mono">₹{r.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : query.trim() ? (
            <div className="text-center py-6 text-xs text-muted-foreground uppercase font-bold">No exact match found in current listings.</div>
          ) : (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Recent Searches</h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleRecentClick(term)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-foreground/20 hover:border-foreground text-[10px] font-mono bg-card"
                      >
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div className="space-y-2">
                <h4 className="text-[9px] font-black uppercase text-bazaar-terracotta tracking-wider">Suggested Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { onClose(); router.push('/search?type=rent'); }}
                    className="p-3 border border-foreground/15 hover:border-foreground bg-card text-left text-xs font-black uppercase"
                  >
                    Explore Active Rentals
                  </button>
                  <button
                    type="button"
                    onClick={() => { onClose(); router.push('/copilot'); }}
                    className="p-3 border border-foreground/15 hover:border-foreground bg-card text-left text-xs font-black uppercase flex items-center justify-between"
                  >
                    <span>Talk to AI Concierge</span>
                    <Sparkles className="w-3.5 h-3.5 text-bazaar-terracotta" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
