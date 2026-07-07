import React from 'react';
import { Tag, Calendar, BadgePercent } from 'lucide-react';
import { Badge } from './ui/Badge';

export function RentalTypeChip({ type }: { type: 'buy' | 'rent' | 'hybrid' }) {
  const styles = {
    buy: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    rent: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    hybrid: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  };

  const labels = {
    buy: 'For Sale',
    rent: 'For Rent',
    hybrid: 'Buy + Rent'
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

export function RentalBadge() {
  return (
    <div className="absolute top-2 left-2 z-10">
      <Badge variant="secondary" className="bg-primary/95 text-primary-foreground font-black uppercase text-[8px] tracking-wider py-1 px-2 flex items-center gap-1 shadow-sm">
        <Calendar className="w-3 h-3" />
        <span>Rental</span>
      </Badge>
    </div>
  );
}

interface RentalPriceCardProps {
  dailyRate?: number;
  monthlyRate?: number;
  securityDeposit?: number;
}

export function RentalPriceCard({ dailyRate, monthlyRate, securityDeposit }: RentalPriceCardProps) {
  return (
    <div className="glass p-3.5 rounded-2xl border border-border/40 space-y-2 text-[10px] bg-muted/5 font-medium">
      {dailyRate && (
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Daily Rate:</span>
          <span className="text-foreground font-black font-mono">₹{dailyRate.toLocaleString()}/day</span>
        </div>
      )}
      {monthlyRate && (
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Monthly Rate:</span>
          <span className="text-foreground font-black font-mono">₹{monthlyRate.toLocaleString()}/mo</span>
        </div>
      )}
      {securityDeposit !== undefined && (
        <div className="flex justify-between items-center border-t border-border/25 pt-2 mt-1">
          <span className="text-muted-foreground">Security Deposit:</span>
          <span className="text-primary font-black font-mono">₹{securityDeposit.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
