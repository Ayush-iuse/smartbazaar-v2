'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  ClipboardCheck, Camera, Wrench, ShieldAlert, Sparkles,
  Loader2, AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import api, { formatError } from '../lib/api';

interface ReturnTrackerProps {
  bookingId: number;
  itemTitle: string;
  depositAmount: number;
  onSubmitReturnReport?: (damageCost: number, notes: string) => void;
}

// ── Motion Variants ──────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const checkRowVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 240, damping: 22 },
  },
};

const settlementVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.1, type: 'spring', stiffness: 220, damping: 20 },
  }),
};

const successBannerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 22 },
  },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function ReturnTracker({
  bookingId,
  itemTitle,
  depositAmount,
  onSubmitReturnReport,
}: ReturnTrackerProps) {
  const [batteryMatch, setBatteryMatch] = useState(true);
  const [physicalDamage, setPhysicalDamage] = useState(false);
  const [missingAccessories, setMissingAccessories] = useState(false);
  const [cleanedStatus, setCleanedStatus] = useState(true);

  const [damageNotes, setDamageNotes] = useState('');
  const [damageCostInput, setDamageCostInput] = useState('0');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalRefund, setFinalRefund] = useState<number | null>(null);

  const damageCostNum = parseFloat(damageCostInput) || 0;

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.post('/api/bookings/inspection', {
        booking_id: bookingId,
        damage_cost: damageCostNum,
        inspection_notes: damageNotes,
      });
      const refund = depositAmount - damageCostNum;
      setFinalRefund(Math.max(0, refund));
      setIsSubmitted(true);
      if (onSubmitReturnReport) onSubmitReturnReport(damageCostNum, damageNotes);
    } catch (err: any) {
      setError(formatError(err) || 'Failed to submit inspection report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkItems = [
    {
      label: 'Battery & Power check conforms to pickup levels',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
      checked: batteryMatch,
      onChange: setBatteryMatch,
    },
    {
      label: 'Physical shell and chassis damage detected',
      icon: <Wrench className="w-3.5 h-3.5 text-rose-500" />,
      checked: physicalDamage,
      onChange: setPhysicalDamage,
      isWarning: true,
    },
    {
      label: 'Missing attachments or accessories packages',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />,
      checked: missingAccessories,
      onChange: setMissingAccessories,
      isWarning: true,
    },
    {
      label: 'Asset cleaned and free of debris',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
      checked: cleanedStatus,
      onChange: setCleanedStatus,
    },
  ];

  return (
    <Card className="max-w-xl mx-auto p-6 space-y-6 border border-border/40 bg-card select-none">

      {/* Header */}
      <div className="flex justify-between items-center border-b border-border/20 pb-4">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-tight text-foreground">Returns Inspection Checklist</h3>
        </div>
        <span className="font-mono text-[9px] font-bold text-muted-foreground bg-muted py-0.5 px-2 rounded-lg">
          Booking: #{bookingId}
        </span>
      </div>

      {/* Asset Meta */}
      <div className="p-3.5 bg-muted/20 border border-border/25 rounded-2xl space-y-1.5 text-[10px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground font-medium">Checking Item:</span>
          <span className="text-foreground font-black">{itemTitle}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-medium">Total Held Security Deposit:</span>
          <span className="text-primary font-mono font-black">₹{depositAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Form or Success */}
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form
            key="form"
            onSubmit={handleSubmitReport}
            className="space-y-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Checklist */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3.5 text-[10px]"
            >
              <h4 className="text-[8px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-1">
                Inspection Parameters
              </h4>

              {checkItems.map((item, i) => (
                <motion.label
                  key={i}
                  variants={checkRowVariants}
                  className={`flex items-center justify-between cursor-pointer select-none px-3 py-2.5 rounded-xl border transition-colors ${
                    item.isWarning && item.checked
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : 'border-border/20 hover:border-border/40 hover:bg-muted/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className={`text-foreground font-bold ${item.isWarning && item.checked ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                      {item.label}
                    </span>
                  </div>
                  <motion.div whileTap={{ scale: 0.82 }}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => item.onChange(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                    />
                  </motion.div>
                </motion.label>
              ))}
            </motion.div>

            {/* Photo upload placeholder */}
            <motion.div
              whileHover={{ scale: 1.01, borderColor: 'hsl(var(--primary) / 0.3)' }}
              className="border border-dashed border-border/40 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:bg-muted/15 transition-colors"
            >
              <Camera className="w-5 h-5 text-muted-foreground" />
              <span className="text-[9px] font-black uppercase tracking-wider text-foreground">
                Upload Return Inspection Photos
              </span>
              <span className="text-[8px] text-muted-foreground">Select up to 5 photos showing condition comparison</span>
            </motion.div>

            {/* Damage & Deductions */}
            <div className="space-y-3.5 border-t border-border/20 pt-4">
              <h4 className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">
                Estimate Damage Deductions
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                    Deduction Charge (INR)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    max={depositAmount}
                    value={damageCostInput}
                    onChange={(e) => setDamageCostInput(e.target.value)}
                    className="w-full px-3 py-1.5 border border-border/40 bg-muted/20 rounded-xl text-[10px] font-mono outline-none text-foreground focus:border-primary/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                    Inspector Status
                  </label>
                  <span className="inline-block mt-2 text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Inspecting
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                  Condition Notes
                </label>
                <textarea
                  placeholder="E.g. Minor scratches on side panels, all packaging attachments returned."
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-border/40 bg-muted/20 rounded-xl text-[10px] font-bold outline-none text-foreground min-h-[50px] resize-none focus:border-primary/40 transition-colors"
                />
              </div>

              {/* Live Deposit Preview */}
              <AnimatePresence>
                {damageCostNum > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-muted/15 border border-border/25 rounded-xl p-3 text-[10px] font-bold space-y-1"
                  >
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deposit held:</span>
                      <span className="font-mono text-foreground">₹{depositAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-rose-500">
                      <span>Damage deduction:</span>
                      <span className="font-mono">-₹{damageCostNum.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/10 pt-1 text-emerald-600 dark:text-emerald-400">
                      <span>Estimated refund:</span>
                      <span className="font-mono font-black">
                        ₹{Math.max(0, depositAmount - damageCostNum).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-xl text-[10px] text-destructive font-bold"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full text-[10px] font-black uppercase tracking-wider py-2.5" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting Audit...
                    </span>
                  ) : (
                    'Submit Return Audit & Release Deposit'
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            variants={successBannerVariants}
            initial="hidden"
            animate="visible"
            className="border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-2xl space-y-3"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.3, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 15, delay: 0.1 }}
                className="p-2 bg-emerald-500/10 rounded-full text-emerald-500 shrink-0"
              >
                <ClipboardCheck className="w-5 h-5" />
              </motion.div>
              <div className="text-[10px] font-bold">
                <h4 className="text-foreground">Return Inspection Audit Completed</h4>
                <p className="text-muted-foreground font-mono text-[8px] mt-0.5">
                  Approved at: {new Date().toLocaleString()}
                </p>
              </div>
            </div>

            <div className="text-[10px] font-bold border-t border-emerald-500/10 pt-3 space-y-1.5">
              {[
                { label: 'Original Deposit Held:', value: `₹${depositAmount.toLocaleString()}`, i: 0 },
                { label: 'Damage Deductions Applied:', value: `-₹${damageCostNum.toLocaleString()}`, color: 'text-rose-500', i: 1 },
                {
                  label: 'Final Settled Refund:',
                  value: `₹${(finalRefund ?? 0).toLocaleString()}`,
                  color: 'text-emerald-600 dark:text-emerald-400 font-black',
                  border: true,
                  i: 2
                },
              ].map((row) => (
                <motion.div
                  key={row.label}
                  custom={row.i}
                  variants={settlementVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex justify-between ${row.border ? 'border-t border-emerald-500/10 pt-1.5' : ''} ${row.color || ''}`}
                >
                  <span className={row.color ? '' : 'text-muted-foreground'}>{row.label}</span>
                  <span className="font-mono">{row.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </Card>
  );
}
