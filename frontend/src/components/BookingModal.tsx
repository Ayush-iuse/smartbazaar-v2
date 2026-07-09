'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Calendar, Shield, BadgePercent, AlertCircle, Sparkles,
  CheckCircle2, Loader2, X
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import api, { formatError } from '../lib/api';
import { useAuthStore } from '../lib/store';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: number;
  itemTitle: string;
  dailyRate: number;
  securityDeposit: number;
  deliveryFee?: number;
  cleaningFee?: number;
  onBookingCreated?: (bookingId: number) => void;
}

// ── Motion Variants ──────────────────────────────────────────────────────────

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.93, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26, mass: 0.9 },
  },
  exit: {
    opacity: 0,
    scale: 0.93,
    y: 24,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

const feeRowVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  }),
};

const successVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 18 },
  },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function BookingModal({
  isOpen,
  onClose,
  listingId,
  itemTitle,
  dailyRate,
  securityDeposit,
  deliveryFee = 150,
  cleaningFee = 200,
  onBookingCreated,
}: BookingModalProps) {
  const { isAuthenticated } = useAuthStore();
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<number | null>(null);

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

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      setError('Please log in to make a booking.');
      return;
    }
    if (days <= 0) {
      setError('Please select valid start and end dates.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await api.post('/api/bookings', {
        listing_id: listingId,
        start_date: new Date(startDateStr).toISOString(),
        end_date: new Date(endDateStr).toISOString(),
      });
      const newBookingId: number = res.data.id;
      setBookingSuccess(newBookingId);
      if (onBookingCreated) onBookingCreated(newBookingId);
    } catch (err: any) {
      setError(formatError(err) || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setBookingSuccess(null);
    setError(null);
    setStartDateStr('');
    setEndDateStr('');
    setDiscountAmount(0);
    setCouponCode('');
    onClose();
  };

  const feeRows = [
    { label: `Daily Rental Cost (${days} days)`, value: `₹${rentalCost.toLocaleString()}` },
    { label: 'Cleaning Fee', value: `₹${cleaningFee.toLocaleString()}` },
    { label: 'Delivery Surcharge', value: `₹${deliveryFee.toLocaleString()}` },
    ...(insuranceSelected ? [{ label: 'Protection Insurance', value: `₹${insuranceFee.toLocaleString()}` }] : []),
    { label: 'Taxes (18% GST)', value: `₹${tax.toLocaleString()}` },
    ...(discountAmount > 0 ? [{ label: 'Promo Discount', value: `-₹${discountAmount.toLocaleString()}`, highlight: 'emerald' as const }] : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="booking-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            key="booking-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md"
          >
            <Card className="p-6 space-y-5 relative overflow-hidden border border-border/40 shadow-2xl">

              {/* Glow accent */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-start border-b border-border/20 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black uppercase tracking-tight text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Book Rental Reservation
                  </h3>
                  <p className="text-[9px] text-muted-foreground font-mono truncate max-w-[260px]">{itemTitle}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-lg hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Success State ── */}
              <AnimatePresence mode="wait">
                {bookingSuccess ? (
                  <motion.div
                    key="success"
                    variants={successVariants}
                    initial="hidden"
                    animate="visible"
                    className="py-8 flex flex-col items-center gap-4 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.3, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </motion.div>
                    <div>
                      <h4 className="text-sm font-black text-foreground">Booking Request Sent!</h4>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Booking #{bookingSuccess} is pending seller approval.
                      </p>
                    </div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-[9px] text-muted-foreground/60 font-mono"
                    >
                      You'll be notified when the seller confirms.
                    </motion.p>
                    <Button onClick={handleClose} size="sm" className="mt-2 text-[10px] font-black uppercase tracking-wider px-6">
                      Done
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div key="form" className="space-y-5" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>

                    {/* Date Selections */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={startDateStr}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setStartDateStr(e.target.value)}
                          className="w-full px-3 py-1.5 border border-border/40 bg-muted/20 rounded-xl text-[10px] outline-none text-foreground focus:border-primary/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDateStr}
                          min={startDateStr || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setEndDateStr(e.target.value)}
                          className="w-full px-3 py-1.5 border border-border/40 bg-muted/20 rounded-xl text-[10px] outline-none text-foreground focus:border-primary/50 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Duration badge */}
                    <AnimatePresence>
                      {days > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-xl"
                        >
                          <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="text-[10px] font-bold text-primary">
                            {days} day{days !== 1 ? 's' : ''} selected — Rental cost: ₹{rentalCost.toLocaleString()}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Insurance */}
                    <label className="flex items-center justify-between cursor-pointer border border-border/40 hover:border-primary/30 bg-muted/5 p-3 rounded-2xl text-[10px] font-bold transition-colors">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="text-foreground block">Add Damage Protection Plan</span>
                          <span className="text-muted-foreground text-[8px] font-medium block">
                            Covers up to 100% of damage repair costs.
                          </span>
                        </div>
                      </div>
                      <motion.div whileTap={{ scale: 0.85 }}>
                        <input
                          type="checkbox"
                          checked={insuranceSelected}
                          onChange={(e) => setInsuranceSelected(e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                        />
                      </motion.div>
                    </label>

                    {/* Coupon */}
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="PROMO CODE (e.g. RENTAL20)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-border/40 bg-muted/20 rounded-xl text-[10px] uppercase outline-none text-foreground font-mono focus:border-primary/40 transition-colors"
                      />
                      <Button type="submit" size="sm" className="text-[9px] font-black uppercase tracking-wider h-8">
                        Apply
                      </Button>
                    </form>

                    {/* Fee Rows */}
                    <div className="space-y-2 text-[10px] font-bold">
                      <h4 className="text-[8px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/10 pb-1">
                        Cost Summary
                      </h4>
                      <div className="space-y-1.5 font-medium">
                        {feeRows.map((row, i) => (
                          <motion.div
                            key={row.label}
                            custom={i}
                            variants={feeRowVariants}
                            initial="hidden"
                            animate="visible"
                            className={`flex justify-between ${row.highlight === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
                          >
                            <span className="text-muted-foreground">{row.label}:</span>
                            <span className="text-foreground font-mono">{row.value}</span>
                          </motion.div>
                        ))}

                        <div className="flex justify-between border-t border-border/20 pt-2 text-primary font-bold">
                          <span>Security Deposit (Refundable):</span>
                          <span className="font-mono">₹{securityDeposit.toLocaleString()}</span>
                        </div>
                      </div>

                      <motion.div
                        className="flex justify-between items-center border-t border-border/20 pt-3 text-xs font-black text-foreground"
                        animate={{ scale: days > 0 ? [1, 1.02, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span>Grand Total Due:</span>
                        <span className="font-mono text-sm">₹{Math.max(0, grandTotal).toLocaleString()}</span>
                      </motion.div>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-xl text-[10px] text-destructive font-bold"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleConfirmBooking}
                        className="w-full text-[10px] font-black uppercase tracking-wider py-2.5 relative overflow-hidden"
                        disabled={days <= 0 || isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending Request...
                          </span>
                        ) : (
                          'Confirm Booking Request'
                        )}
                      </Button>
                    </motion.div>

                  </motion.div>
                )}
              </AnimatePresence>

            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
