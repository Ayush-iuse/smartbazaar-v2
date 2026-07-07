import React from 'react';
import { Tag, CheckCircle2, XCircle, ArrowRightLeft, Clock } from 'lucide-react';
import { Badge } from './ui/Badge';

interface TimelineStep {
  id: number;
  title: string;
  description: string;
  price?: number;
  time: string;
  status: 'published' | 'offer' | 'counter' | 'accepted' | 'rejected';
}

interface NegotiationTimelineProps {
  originalPrice: number;
  currentOffer?: number;
  steps?: TimelineStep[];
}

export default function NegotiationTimeline({
  originalPrice,
  currentOffer,
  steps = [
    { id: 1, title: "Listing Created", description: "Item published on marketplace", price: 12500, time: "Yesterday, 4:00 PM", status: 'published' },
    { id: 2, title: "Initial Offer Made", description: "Buyer suggested lower price threshold", price: 10000, time: "Yesterday, 7:15 PM", status: 'rejected' },
    { id: 3, title: "Counter Offer Placed", description: "Seller proposed intermediate price split", price: 11800, time: "Today, 10:30 AM", status: 'counter' },
    { id: 4, title: "Awaiting Feedback", description: "Pending handshake agreement between parties", price: 11000, time: "Just now", status: 'offer' }
  ]
}: NegotiationTimelineProps) {
  
  const getIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <Tag className="w-4.5 h-4.5 text-primary" />;
      case 'accepted':
        return <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="w-4.5 h-4.5 text-rose-500" />;
      case 'counter':
        return <ArrowRightLeft className="w-4.5 h-4.5 text-amber-500" />;
      default:
        return <Clock className="w-4.5 h-4.5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 border-b border-border/40 pb-2.5">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-[10px] font-black uppercase tracking-wider text-foreground">Negotiation Timeline Log</span>
      </div>

      <div className="relative pl-6 space-y-5 border-l border-border/30 ml-2.5 py-1">
        {steps.map((step) => (
          <div key={step.id} className="relative text-[10px]">
            
            {/* Timeline icon node pointer */}
            <div className="absolute -left-[35px] top-0 p-1.5 bg-background border border-border/40 rounded-full flex items-center justify-center shadow-sm">
              {getIcon(step.status)}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-baseline gap-2 font-bold">
                <span className="text-foreground">{step.title}</span>
                <span className="text-[8px] text-muted-foreground font-mono font-semibold">{step.time}</span>
              </div>
              <p className="text-[9px] text-muted-foreground font-medium">{step.description}</p>
              
              {step.price && (
                <div className="flex items-baseline gap-1 font-mono font-black text-primary mt-1">
                  <span>₹{step.price.toLocaleString('en-IN')}</span>
                  <span className="text-[8px] text-muted-foreground font-sans">INR</span>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
