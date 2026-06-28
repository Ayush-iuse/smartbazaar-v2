import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  askingPrice: number;
  listingTitle: string;
}

export default function OfferModal({ isOpen, onClose, onSubmit, askingPrice, listingTitle }: OfferModalProps) {
  const [offerAmount, setOfferAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(offerAmount);
    if (!offerAmount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive offer amount.');
      return;
    }
    onSubmit(amount);
  };

  const formattedAskingPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(askingPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-200">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Make an Offer</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <h4 className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 truncate" title={listingTitle}>
              For: {listingTitle}
            </h4>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Your Offer Amount (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-450 dark:text-slate-500 font-extrabold font-mono">₹</span>
              <input
                type="number"
                required
                placeholder="Enter price..."
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 focus:outline-none focus:border-brand-500 text-slate-700 dark:text-slate-200 font-mono font-semibold"
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
              Asking Price: <b className="text-slate-700 dark:text-slate-300">{formattedAskingPrice}</b>
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-250 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-brand-100 dark:hover:shadow-transparent transition-all"
            >
              Submit Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
