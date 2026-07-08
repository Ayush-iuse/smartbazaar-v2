'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Heart, ShoppingBag, Tag } from 'lucide-react';
import api from '../lib/api';

export interface Listing {
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
  allow_sale?: boolean;
  allow_rental?: boolean;
  rental_price_per_day?: number | null;
  status?: string;
}

interface ListingCardProps {
  listing: Listing;
  showSafety?: boolean;
}

export default function ListingCard({ listing, showSafety = true }: ListingCardProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Safe parsing of image_urls
  let images: string[] = [];
  try {
    if (listing.image_urls) {
      if (typeof listing.image_urls === 'string') {
        images = JSON.parse(listing.image_urls);
      } else if (Array.isArray(listing.image_urls)) {
        images = listing.image_urls;
      }
    }
  } catch (e) {
    images = [];
  }

  const displayImage =
    images.length > 0 && images[0]
      ? images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60';

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(listing.price);

  const formattedDate = new Date(listing.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await api.post('/api/wishlist', { listing_id: listing.id });
      setIsSaved(!isSaved);
    } catch {
      setIsSaved(!isSaved);
    } finally {
      setIsSaving(false);
    }
  };

  // Determine listing type badge
  const allowSale = listing.allow_sale !== false; // default true if not set
  const allowRental = listing.allow_rental === true;
  const isHybrid = allowSale && allowRental;

  const listingTypeBadge = isHybrid
    ? { label: 'BUY & RENT', color: 'bg-purple-600 text-white' }
    : allowRental
    ? { label: 'FOR RENT', color: 'bg-blue-600 text-white' }
    : { label: 'FOR SALE', color: 'bg-emerald-600 text-white' };

  const isSold = listing.status === 'Sold';

  return (
    <Link href={`/listing/${listing.id}`} className="group block h-full">
      <div className="bg-card text-foreground border-2 border-foreground hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(250,248,245,0.85)] transition-all duration-200 flex flex-col h-full relative">

        {/* Card Thumbnail */}
        <div className="relative aspect-video w-full bg-muted border-b-2 border-foreground overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage}
            alt={listing.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-out"
          />

          {/* Sold overlay */}
          {isSold && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="font-black text-white text-sm tracking-widest border-2 border-white px-4 py-1">SOLD</span>
            </div>
          )}

          {/* Top badges row */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <span className="bg-foreground text-background font-mono font-black text-[7px] uppercase tracking-wider px-2 py-1">
              {listing.category}
            </span>
            <span className={`font-mono font-black text-[7px] uppercase tracking-wider px-2 py-1 ${listingTypeBadge.color}`}>
              {listingTypeBadge.label}
            </span>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
              isSaved
                ? 'bg-rose-500 border-rose-500 text-white'
                : 'bg-white/80 border-white/60 text-slate-500 opacity-0 group-hover:opacity-100'
            }`}
            title={isSaved ? 'Saved' : 'Save'}
          >
            <Heart className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div className="space-y-2">

            {/* Price row */}
            <div className="flex justify-between items-start gap-2">
              <div className="flex flex-col gap-0.5">
                {allowSale && (
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-emerald-600" />
                    <span className="text-sm font-black text-foreground font-mono tracking-tight">
                      {formattedPrice}
                    </span>
                  </div>
                )}
                {allowRental && listing.rental_price_per_day && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-500 font-mono">
                      ₹{listing.rental_price_per_day.toLocaleString('en-IN')}/day
                    </span>
                  </div>
                )}
              </div>

              {showSafety && listing.fraud_score !== undefined && (
                <span className={`font-mono text-[7px] font-black border px-1.5 py-0.5 shrink-0 ${
                  listing.fraud_level === 'High'
                    ? 'border-red-400/40 text-red-500'
                    : listing.fraud_level === 'Medium'
                    ? 'border-yellow-400/40 text-yellow-600'
                    : 'border-emerald-400/40 text-emerald-600'
                }`}>
                  {listing.fraud_level === 'High' ? '⚠ FLAGGED' : listing.fraud_level === 'Medium' ? '⚠ REVIEW' : '✓ SAFE'}
                </span>
              )}
            </div>

            {/* Title */}
            <h4 className="text-xs font-black text-foreground line-clamp-1 group-hover:text-bazaar-terracotta transition-colors uppercase tracking-tight">
              {listing.title}
            </h4>

            {/* Description */}
            <p className="text-[9px] text-muted-foreground line-clamp-2 leading-relaxed font-medium">
              {listing.description}
            </p>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between border-t border-foreground/10 pt-3 text-[8px] text-muted-foreground font-black uppercase tracking-wider font-mono">
            <div className="flex items-center gap-1 max-w-[65%]">
              <MapPin className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
              <span className="truncate">{listing.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
