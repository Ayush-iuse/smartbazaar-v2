import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Heart, GitCompare, Share2, MessageCircle, ShieldCheck } from 'lucide-react';
import api from '../lib/api';
import { Badge } from './ui/Badge';

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

  // Fallback high-quality placeholder image
  const displayImage = images.length > 0 && images[0]
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
    } catch (err) {
      console.error("Failed to toggle wishlist item:", err);
      // Fallback toggling for mock/offline compatibility
      setIsSaved(!isSaved);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Redirect directly to copilot dashboard with compare prompt
    router.push(`/copilot?query=Compare+listing+%23${listing.id}`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/listing/${listing.id}`;
      navigator.clipboard.writeText(url);
      alert('Listing link copied to clipboard!');
    }
  };

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Redirect to messages page with listing query parameter
    router.push(`/messages?listing_id=${listing.id}`);
  };

  return (
    <Link href={`/listing/${listing.id}`} className="group block h-full">
      <div className="bg-card text-card-foreground border border-border/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1 relative">
        
        {/* Card Thumbnail */}
        <div className="relative aspect-video w-full bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayImage}
            alt={listing.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          
          {/* Floating Category Tag */}
          <div className="absolute top-3 left-3">
            <span className="bg-slate-905/70 dark:bg-slate-950/70 text-slate-100 font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-xl backdrop-blur-md">
              {listing.category}
            </span>
          </div>

          {/* Quick Actions Hover Overlay */}
          <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            
            {/* Save Item */}
            <button
              onClick={handleSave}
              className={`p-2.5 rounded-full backdrop-blur-md border border-white/20 transition-all hover:scale-110 cursor-pointer ${
                isSaved 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-white/80 hover:bg-white text-slate-900'
              }`}
              title="Save to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            {/* Compare Item */}
            <button
              onClick={handleCompare}
              className="p-2.5 bg-white/80 hover:bg-white text-slate-900 rounded-full backdrop-blur-md border border-white/20 transition-all hover:scale-110 cursor-pointer"
              title="Compare Listing"
            >
              <GitCompare className="w-4 h-4" />
            </button>

            {/* Share link */}
            <button
              onClick={handleShare}
              className="p-2.5 bg-white/80 hover:bg-white text-slate-900 rounded-full backdrop-blur-md border border-white/20 transition-all hover:scale-110 cursor-pointer"
              title="Share Listing"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Contact Seller */}
            <button
              onClick={handleContact}
              className="p-2.5 bg-white/80 hover:bg-white text-slate-900 rounded-full backdrop-blur-md border border-white/20 transition-all hover:scale-110 cursor-pointer"
              title="Message Seller"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 flex flex-col flex-1 justify-between gap-4">
          <div className="space-y-2">
            
            {/* Price & Safety badges */}
            <div className="flex justify-between items-center gap-2">
              <span className="text-lg font-black text-foreground font-mono tracking-tight">
                {formattedPrice}
              </span>
              
              {showSafety && listing.fraud_score !== undefined && (
                <div className="flex gap-1.5 items-center">
                  {listing.fraud_level === 'Low' ? (
                    <Badge variant="success" className="gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>Verified</span>
                    </Badge>
                  ) : listing.fraud_level === 'Medium' ? (
                    <Badge variant="warning">Moderate</Badge>
                  ) : (
                    <Badge variant="danger">High Risk</Badge>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {listing.title}
            </h4>

            {/* Description */}
            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
              {listing.description}
            </p>

          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between border-t border-border/40 pt-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
              <span className="truncate max-w-[120px]">{listing.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>

        </div>

      </div>
    </Link>
  );
}
