import React from 'react';
import { ShieldCheck, FileText, QrCode, ArrowDownToLine, Receipt } from 'lucide-react';
import { Card } from './ui/Card';

interface InvoiceCardProps {
  invoiceNumber: string;
  buyerName: string;
  sellerName: string;
  itemTitle: string;
  startDate: string;
  endDate: string;
  rentalCost: number;
  securityDeposit: number;
  cleaningFee: number;
  deliveryFee: number;
  insuranceFee: number;
  tax: number;
}

export default function InvoiceCard({
  invoiceNumber,
  buyerName,
  sellerName,
  itemTitle,
  startDate,
  endDate,
  rentalCost,
  securityDeposit,
  cleaningFee,
  deliveryFee,
  insuranceFee,
  tax
}: InvoiceCardProps) {
  const subtotal = rentalCost + cleaningFee + deliveryFee + insuranceFee + tax;
  const grandTotal = subtotal + securityDeposit;

  return (
    <Card className="max-w-xl mx-auto p-6 space-y-6 border border-border/40 bg-card shadow-lg select-none relative overflow-hidden">
      
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10" />

      {/* Header */}
      <div className="flex justify-between items-start border-b border-border/30 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-primary">
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Invoice Statement</span>
          </div>
          <h2 className="text-xs font-mono font-bold text-muted-foreground">#{invoiceNumber}</h2>
        </div>
        <button 
          onClick={() => window.print()}
          className="p-2 border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all duration-200"
          title="Print Invoice"
        >
          <ArrowDownToLine className="w-4 h-4" />
        </button>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-4 text-[10px] font-bold">
        <div className="space-y-1">
          <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground block">Rented By (Buyer)</span>
          <span className="text-foreground">{buyerName}</span>
        </div>
        <div className="space-y-1">
          <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground block">Owned By (Seller)</span>
          <span className="text-foreground">{sellerName}</span>
        </div>
      </div>

      {/* Item Summary */}
      <div className="p-3.5 bg-muted/20 border border-border/35 rounded-2xl space-y-1.5 text-[10px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground font-medium">Item Details:</span>
          <span className="text-foreground font-black">{itemTitle}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-medium">Rental Period:</span>
          <span className="text-foreground font-mono font-bold">{startDate} to {endDate}</span>
        </div>
      </div>

      {/* Financial Breakdown Table */}
      <div className="space-y-2.5 text-[10px]">
        <h3 className="text-[8px] font-black uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-1">Price Breakdown</h3>
        
        <div className="space-y-2 font-medium">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rental Duration Charges:</span>
            <span className="text-foreground font-mono">₹{rentalCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cleaning Fee:</span>
            <span className="text-foreground font-mono">₹{cleaningFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Surcharges:</span>
            <span className="text-foreground font-mono">₹{deliveryFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Insurance Protection Plan:</span>
            <span className="text-foreground font-mono">₹{insuranceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GST & Service Taxes:</span>
            <span className="text-foreground font-mono">₹{tax.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between border-t border-border/20 pt-2.5">
            <span className="text-muted-foreground font-bold">Subtotal:</span>
            <span className="text-foreground font-mono font-black">₹{subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between border-t border-border/20 pt-2.5 text-primary">
            <span className="font-bold">Security Deposit (Refundable):</span>
            <span className="font-mono font-black">₹{securityDeposit.toLocaleString()}</span>
          </div>
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-center border-t-2 border-dashed border-border/40 pt-3.5 mt-2">
          <span className="text-xs font-black uppercase tracking-wider text-foreground">Grand Total:</span>
          <span className="text-sm font-mono font-black text-foreground">₹{grandTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center border-t border-border/20 pt-4 text-[8px] text-muted-foreground font-bold uppercase tracking-wider">
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secured Deposit Hold Guarantee</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-80" title="Invoice Validation QR">
          <QrCode className="w-4 h-4" />
          <span>Receipt Verified</span>
        </div>
      </div>

    </Card>
  );
}
