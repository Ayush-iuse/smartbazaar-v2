import React, { useState } from 'react';
import { ClipboardCheck, Camera, Wrench, ShieldAlert, Sparkles } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface ReturnTrackerProps {
  bookingId: number;
  itemTitle: string;
  depositAmount: number;
  onSubmitReturnReport?: (damageCost: number, notes: string) => void;
}

export default function ReturnTracker({
  bookingId,
  itemTitle,
  depositAmount,
  onSubmitReturnReport
}: ReturnTrackerProps) {
  const [batteryMatch, setBatteryMatch] = useState(true);
  const [physicalDamage, setPhysicalDamage] = useState(false);
  const [missingAccessories, setMissingAccessories] = useState(false);
  const [cleanedStatus, setCleanedStatus] = useState(true);
  
  const [damageNotes, setDamageNotes] = useState('');
  const [damageCostInput, setDamageCostInput] = useState('0');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    const parsedCost = parseFloat(damageCostInput) || 0;
    if (onSubmitReturnReport) {
      onSubmitReturnReport(parsedCost, damageNotes);
    }
  };

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

      {/* Asset Meta Info */}
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

      {/* Checklist Form */}
      {!isSubmitted ? (
        <form onSubmit={handleSubmitReport} className="space-y-4">
          
          <div className="space-y-3.5 text-[10px]">
            <h4 className="text-[8px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-1">Inspection Parameters</h4>
            
            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="text-foreground font-bold">Battery & Power check conforms to pickup levels</span>
              <input 
                type="checkbox" 
                checked={batteryMatch} 
                onChange={(e) => setBatteryMatch(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="text-foreground font-bold">Physical shell and chassis damage detected</span>
              <input 
                type="checkbox" 
                checked={physicalDamage} 
                onChange={(e) => setPhysicalDamage(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="text-foreground font-bold">Missing attachments or accessories packages</span>
              <input 
                type="checkbox" 
                checked={missingAccessories} 
                onChange={(e) => setMissingAccessories(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="text-foreground font-bold">Asset cleaned and free of debris</span>
              <input 
                type="checkbox" 
                checked={cleanedStatus} 
                onChange={(e) => setCleanedStatus(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
              />
            </label>
          </div>

          {/* Photo uploads placeholder */}
          <div className="border border-dashed border-border/40 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:bg-muted/15 transition-colors">
            <Camera className="w-5 h-5 text-muted-foreground" />
            <span className="text-[9px] font-black uppercase tracking-wider text-foreground">Upload Return Inspection Photos</span>
            <span className="text-[8px] text-muted-foreground">Select up to 5 photos showing condition comparison</span>
          </div>

          {/* Damage & Deductions Inputs */}
          <div className="space-y-3.5 border-t border-border/20 pt-4">
            <h4 className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">Estimate Damage Deductions</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">Deduction Charge (INR)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={damageCostInput}
                  onChange={(e) => setDamageCostInput(e.target.value)}
                  className="w-full px-3 py-1.5 border border-border/40 bg-muted/20 rounded-xl text-[10px] font-mono outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">Inspector Status</label>
                <span className="inline-block mt-2 text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Inspecting
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">Condition Notes</label>
              <textarea
                placeholder="E.g. Minor scratches on side panels, all packaging attachments returned."
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                className="w-full px-3 py-2 border border-border/40 bg-muted/20 rounded-xl text-[10px] font-bold outline-none text-foreground min-h-[50px] resize-none"
              />
            </div>

            <Button type="submit" className="w-full text-[10px] font-black uppercase tracking-wider py-2.5">
              Submit Return Audit & Release Deposit
            </Button>
          </div>

        </form>
      ) : (
        <div className="border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-bold">
              <h4 className="text-foreground">Return Inspection Audit Completed</h4>
              <p className="text-muted-foreground font-mono text-[8px] mt-0.5">Approved at: {new Date().toLocaleString()}</p>
            </div>
          </div>
          
          <div className="text-[10px] font-bold border-t border-emerald-500/10 pt-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original Deposit Held:</span>
              <span className="text-foreground font-mono">₹{depositAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Damage Deductions Applied:</span>
              <span className="text-rose-500 font-mono">-₹{parseFloat(damageCostInput).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-emerald-500/10 pt-1.5 text-emerald-600 dark:text-emerald-400">
              <span>Final Settled Refund:</span>
              <span className="font-mono font-black">₹{(depositAmount - (parseFloat(damageCostInput) || 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

    </Card>
  );
}
