import React, { useState } from 'react';
import { Calendar, Shield, BadgePercent, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  dailyRate: number;
  securityDeposit: number;
  deliveryFee?: number;
  cleaningFee?: number;
}

export default function BookingModal({
  isOpen,
  onClose,
  itemTitle,
  dailyRate,
  securityDeposit,
  deliveryFee = 150,
  cleaningFee = 200
}: BookingModalProps) {
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  if (!isOpen) return null;

  // Live calculations
  let days = 0;
  if (startDateStr && endDateStr) {
    const s = new Date(startDateStr);
    const e = new Date(endDateStr);
    days = Math.max(0, Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24)));
  }

  const insuranceFee = insuranceSelected ? 100 * days : 0;
  const rentalCost = dailyRate * days;
  const tax = Math.round(rentalCost * 0.18);
  const grandTotal = rentalCost + securityDeposit + deliveryFee + cleaningFee + insuranceFee + tax - discountAmount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'RENTAL20') {
      setDiscountAmount(300);
    } else {
      setDiscountAmount(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4">
      <Card className="w-full max-w-md p-6 space-y-6 relative overflow-hidden border border-border/40">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-border/20 pb-4">
          <div className="space-y-0.5">
            <h3 className="text-xs font-black uppercase tracking-tight text-foreground">Book Rental Reservation</h3>
            <p className="text-[9px] text-muted-foreground font-mono">{itemTitle}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs font-black uppercase tracking-wider">
            Close
          </button>
        </div>

        {/* Date Selections */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">Start Date</label>
            <input
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="w-full px-3 py-1.5 border border-border/40 bg-muted/20 rounded-xl text-[10px] outline-none text-foreground"
            />
          </div>
          <div>
            <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">End Date</label>
            <input
              type="date"
              value={endDateStr}
              onChange={(e) => setEndDateStr(e.target.value)}
              className="w-full px-3 py-1.5 border border-border/40 bg-muted/20 rounded-xl text-[10px] outline-none text-foreground"
            />
          </div>
        </div>

        {/* Insurance Selection */}
        <label className="flex items-center justify-between cursor-pointer border border-border/40 hover:border-primary/20 bg-muted/5 p-3 rounded-2xl text-[10px] font-bold">
          <div className="flex items-start gap-2">
            <Shield className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-foreground block">Add Damage Protection Plan</span>
              <span className="text-muted-foreground text-[8px] font-medium block">Covers up to 100% of damage repair costs.</span>
            </div>
          </div>
          <input 
            type="checkbox"
            checked={insuranceSelected}
            onChange={(e) => setInsuranceSelected(e.target.checked)}
            className="w-4.5 h-4.5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
          />
        </label>

        {/* Coupon Code */}
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <input
            type="text"
            placeholder="PROMO CODE (e.g. RENTAL20)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-border/40 bg-muted/20 rounded-xl text-[10px] uppercase outline-none text-foreground font-mono"
          />
          <Button type="submit" size="sm" className="text-[9px] font-black uppercase tracking-wider h-8">
            Apply
          </Button>
        </form>

        {/* Live Calculation Table */}
        <div className="space-y-2 text-[10px] font-bold">
          <h4 className="text-[8px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/10 pb-1">Cost Summary</h4>
          
          <div className="space-y-1.5 font-medium">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily Rental Cost ({days} days):</span>
              <span className="text-foreground font-mono">₹{rentalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cleaning Fee:</span>
              <span className="text-foreground font-mono">₹{cleaningFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Surcharge:</span>
              <span className="text-foreground font-mono">₹{deliveryFee.toLocaleString()}</span>
            </div>
            {insuranceSelected && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protection Insurance:</span>
                <span className="text-foreground font-mono">₹{insuranceFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxes (18% GST):</span>
              <span className="text-foreground font-mono">₹{tax.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Promo Discount:</span>
                <span className="font-mono">-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border/20 pt-2 text-primary font-bold">
              <span>Security Deposit (Refundable):</span>
              <span className="font-mono">₹{securityDeposit.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-border/20 pt-3 text-xs font-black text-foreground">
            <span>Grand Total Due:</span>
            <span className="font-mono text-sm">₹{Math.max(0, grandTotal).toLocaleString()}</span>
          </div>
        </div>

        {/* Submit */}
        <Button className="w-full text-[10px] font-black uppercase tracking-wider py-2.5" disabled={days <= 0}>
          Confirm Booking Request
        </Button>

      </Card>
    </div>
  );
}
