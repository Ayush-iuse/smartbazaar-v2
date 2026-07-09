'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Shield, FileText, CheckSquare, FileWarning, Loader2,
  CheckCircle2, AlertCircle, PenLine
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import api, { formatError } from '../lib/api';

interface ContractViewerProps {
  bookingId: number;
  itemTitle: string;
  buyerName: string;
  sellerName: string;
  depositAmount: number;
  startDate: string;
  endDate: string;
  onSignComplete?: () => void;
}

// ── Terms text generator ─────────────────────────────────────────────────────
function buildTermsText(
  itemTitle: string,
  buyerName: string,
  sellerName: string,
  depositAmount: number,
  startDate: string,
  endDate: string
): string {
  return `RENTAL AGREEMENT — SmartBazaar Platform
Asset: ${itemTitle}
Lessor: ${sellerName} | Lessee: ${buyerName}
Duration: ${startDate} to ${endDate}
Security Deposit: ₹${depositAmount.toLocaleString()}

1. DAMAGE POLICY: Any physical marks, cracks, missing parts, or mechanical malfunction during the lease period results in repair fee deductions from the security deposit.
2. LATE RETURN POLICY: A 2x hourly rate penalty applies for delays beyond the 1-hour grace margin.
3. CANCELLATION POLICY: Full refund if cancelled 24+ hours before pickup. Within 24 hours incurs a 1-day penalty.`;
}

// ── Motion Variants ──────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const checkVariants: Variants = {
  hidden: { opacity: 0, x: -14, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
};

const signatureBoxVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 22, delay: 0.35 },
  },
};

const successPopVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 380, damping: 16 },
  },
};

// ── Component ────────────────────────────────────────────────────────────────

export default function ContractViewer({
  bookingId,
  itemTitle,
  buyerName,
  sellerName,
  depositAmount,
  startDate,
  endDate,
  onSignComplete,
}: ContractViewerProps) {
  const [signatureName, setSignatureName] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(null);

  const [agreedToDamage, setAgreedToDamage] = useState(false);
  const [agreedToLateReturn, setAgreedToLateReturn] = useState(false);
  const [agreedToCancellation, setAgreedToCancellation] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch existing contract on mount ──────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;
    const fetchContract = async () => {
      try {
        const res = await api.get(`/api/bookings/contracts/${bookingId}`);
        if (res.data?.signature_status) {
          setIsSigned(true);
          setSignedAt(res.data.signed_at || null);
        }
      } catch {
        // 404 = no contract yet, that's fine
      } finally {
        setIsLoading(false);
      }
    };
    fetchContract();
  }, [bookingId]);

  // ── Sign handler ──────────────────────────────────────────────────────────
  const handleSignatureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName || !agreedToDamage || !agreedToLateReturn || !agreedToCancellation) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const terms = buildTermsText(itemTitle, buyerName, sellerName, depositAmount, startDate, endDate);
      await api.post('/api/bookings/contracts', {
        booking_id: bookingId,
        terms_text: terms,
      });
      setIsSigned(true);
      setSignedAt(new Date().toISOString());
      if (onSignComplete) onSignComplete();
    } catch (err: any) {
      setError(formatError(err) || 'Failed to sign contract. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-xl mx-auto p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </Card>
    );
  }

  const contractId = `SB-${bookingId}-${new Date().getFullYear()}`;

  return (
    <Card className="max-w-xl mx-auto p-6 space-y-6 border border-border/40 bg-card select-none">

      {/* Header */}
      <div className="flex justify-between items-center border-b border-border/20 pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-tight text-foreground">Digital Rental Agreement</h3>
        </div>
        <span className="font-mono text-[9px] font-bold text-muted-foreground bg-muted py-0.5 px-2 rounded-lg">
          ID: {contractId}
        </span>
      </div>

      {/* Contract Details Viewport */}
      <div className="text-[10px] space-y-3.5 leading-relaxed text-foreground font-medium max-h-[160px] overflow-y-auto pr-2 border-b border-border/20 pb-4 custom-scrollbar">
        <p>This Rental Agreement is executed between <strong>{sellerName}</strong> ("Lessor") and <strong>{buyerName}</strong> ("Lessee").</p>

        <div className="bg-muted/15 border border-border/25 p-3 rounded-2xl space-y-2">
          <div className="flex justify-between border-b border-border/10 pb-1">
            <span className="text-muted-foreground font-bold">Rented Asset:</span>
            <span className="text-foreground font-black">{itemTitle}</span>
          </div>
          <div className="flex justify-between border-b border-border/10 pb-1">
            <span className="text-muted-foreground font-bold">Rental Duration:</span>
            <span className="text-foreground font-bold font-mono">{startDate} to {endDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-bold">Security Deposit Held:</span>
            <span className="text-primary font-black font-mono">₹{depositAmount.toLocaleString()}</span>
          </div>
        </div>

        <h4 className="text-[9px] font-black uppercase tracking-wider text-foreground flex items-center gap-1">
          <FileWarning className="w-3.5 h-3.5 text-primary" /> Terms &amp; Conditions
        </h4>
        <p>1. <strong>Damage Policy</strong>: Any physical marks, cracks, missing parts, or mechanical malfunction occurring during the lease period will result in repair fee deductions from the held security deposit.</p>
        <p>2. <strong>Late Return Policy</strong>: Lessee must return the asset on the scheduled end date. A late return fee multiplier of 2x the standard hourly rate is automatically calculated for delays exceeding the 1-hour grace margin.</p>
        <p>3. <strong>Cancellation Policy</strong>: Full refund of security deposits is guaranteed if cancelled 24 hours prior to pickup. Cancellations within 24 hours incur a 1-day rental penalty charge.</p>
      </div>

      {/* Policy Consent checklist */}
      <AnimatePresence mode="wait">
        {!isSigned ? (
          <motion.div
            key="consent"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2 text-[10px]"
          >
            {[
              {
                label: 'I accept the Damage Policy and authorize security deposit deductions for asset damage.',
                checked: agreedToDamage,
                onChange: setAgreedToDamage,
              },
              {
                label: 'I agree to the Late Return penalty fees multiplier if the item is returned late.',
                checked: agreedToLateReturn,
                onChange: setAgreedToLateReturn,
              },
              {
                label: 'I consent to the 24-hour Cancellation Policy rules and surcharge limits.',
                checked: agreedToCancellation,
                onChange: setAgreedToCancellation,
              },
            ].map((item, i) => (
              <motion.label
                key={i}
                variants={checkVariants}
                className="flex items-center gap-2 text-foreground font-bold cursor-pointer select-none group"
              >
                <motion.div whileTap={{ scale: 0.85 }}>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.onChange(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                  />
                </motion.div>
                <span className="group-hover:text-foreground/80 transition-colors">{item.label}</span>
              </motion.label>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Signature Box or Success */}
      <AnimatePresence mode="wait">
        {!isSigned ? (
          <motion.form
            key="signature-form"
            variants={signatureBoxVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSignatureSubmit}
            className="space-y-3.5 border-t border-border/20 pt-4"
          >
            <div>
              <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                Lessee Electronic Signature (Type Full Name)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="E.g. Ayush Gupta"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-border/40 bg-muted/20 rounded-xl text-[10px] text-foreground font-bold outline-none focus:border-primary/50 transition-colors italic"
                />
                <PenLine className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              </div>
            </div>

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
              <Button
                type="submit"
                className="w-full text-[10px] font-black uppercase tracking-wider py-2.5"
                disabled={!signatureName || !agreedToDamage || !agreedToLateReturn || !agreedToCancellation || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing...
                  </span>
                ) : (
                  'Agree and Electronic Sign Contract'
                )}
              </Button>
            </motion.div>
          </motion.form>
        ) : (
          <motion.div
            key="signed-state"
            variants={successPopVariants}
            initial="hidden"
            animate="visible"
            className="border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-2xl flex items-center gap-3"
          >
            <motion.div
              initial={{ rotate: -30, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.1 }}
              className="p-2 bg-emerald-500/10 rounded-full text-emerald-500 shrink-0"
            >
              <CheckCircle2 className="w-5 h-5" />
            </motion.div>
            <div className="text-[10px] font-bold">
              <h4 className="text-foreground">Contract Electronically Signed ✓</h4>
              <p className="text-muted-foreground font-mono text-[8px] mt-0.5">
                {signedAt
                  ? `Signed at: ${new Date(signedAt).toLocaleString()}`
                  : 'Signature recorded'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </Card>
  );
}
