import React, { useState } from 'react';
import { Shield, FileText, CheckSquare, FileWarning, HelpCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface ContractViewerProps {
  contractId: string;
  itemTitle: string;
  buyerName: string;
  sellerName: string;
  depositAmount: number;
  startDate: string;
  endDate: string;
  onSignComplete?: () => void;
}

export default function ContractViewer({
  contractId,
  itemTitle,
  buyerName,
  sellerName,
  depositAmount,
  startDate,
  endDate,
  onSignComplete
}: ContractViewerProps) {
  const [signatureName, setSignatureName] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  
  // Policy checkboxes state
  const [agreedToDamage, setAgreedToDamage] = useState(false);
  const [agreedToLateReturn, setAgreedToLateReturn] = useState(false);
  const [agreedToCancellation, setAgreedToCancellation] = useState(false);

  const handleSignatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName || !agreedToDamage || !agreedToLateReturn || !agreedToCancellation) return;
    setIsSigned(true);
    if (onSignComplete) {
      onSignComplete();
    }
  };

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
        <p>This Rental Agreement ("Agreement") is executed on <strong>July 7, 2026</strong> between <strong>{sellerName}</strong> ("Lessor") and <strong>{buyerName}</strong> ("Lessee").</p>
        
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
          <FileWarning className="w-3.5 h-3.5 text-primary" /> Terms & Conditions
        </h4>
        <p>1. <strong>Damage Policy</strong>: Any physical marks, cracks, missing parts, or mechanical malfunction occurring during the lease period will result in repair fee deductions from the held security deposit. If repair exceeds deposit value, lessee agrees to pay additional balances.</p>
        <p>2. <strong>Late Return Policy</strong>: Lessee must return the asset on the scheduled end date. A late return fee multiplier of 2x the standard hourly rate is automatically calculated for delays exceeding the 1-hour grace margin.</p>
        <p>3. <strong>Cancellation Policy</strong>: Full refund of security deposits is guaranteed if cancelled 24 hours prior to pickup. Cancellations within 24 hours incur a 1-day rental penalty charge.</p>
      </div>

      {/* Policy Consent checklist */}
      <div className="space-y-2 text-[10px]">
        <label className="flex items-center gap-2 text-foreground font-bold cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={agreedToDamage} 
            onChange={(e) => setAgreedToDamage(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
          />
          <span>I accept the Damage Policy and authorize security deposit deductions for asset damage.</span>
        </label>
        <label className="flex items-center gap-2 text-foreground font-bold cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={agreedToLateReturn} 
            onChange={(e) => setAgreedToLateReturn(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
          />
          <span>I agree to the Late Return penalty fees multiplier if the item is returned late.</span>
        </label>
        <label className="flex items-center gap-2 text-foreground font-bold cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={agreedToCancellation} 
            onChange={(e) => setAgreedToCancellation(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
          />
          <span>I consent to the 24-hour Cancellation Policy rules and surcharge limits.</span>
        </label>
      </div>

      {/* Signature Box */}
      {!isSigned ? (
        <form onSubmit={handleSignatureSubmit} className="space-y-3.5 border-t border-border/20 pt-4">
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
                className="w-full pl-9 pr-3 py-2 border border-border/40 bg-muted/20 rounded-xl text-[10px] text-foreground font-bold outline-none"
              />
              <FileText className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full text-[10px] font-black uppercase tracking-wider py-2.5"
            disabled={!signatureName || !agreedToDamage || !agreedToLateReturn || !agreedToCancellation}
          >
            Agree and Electronic Sign Contract
          </Button>
        </form>
      ) : (
        <div className="border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-[10px] font-bold">
            <h4 className="text-foreground">Contract Electronically Signed</h4>
            <p className="text-muted-foreground font-mono text-[8px] mt-0.5">Signed By: {signatureName} | timestamp: {new Date().toLocaleString()}</p>
          </div>
        </div>
      )}

    </Card>
  );
}
