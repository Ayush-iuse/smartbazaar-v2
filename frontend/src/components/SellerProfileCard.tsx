import React from 'react';
import { ShieldCheck, MessageSquare, Award, AlertTriangle } from 'lucide-react';

interface SellerTrust {
  trust_score: number;
  response_rate: number;
  quality_score: number;
  fraud_score: number;
  level: string;
}

interface SellerProfileCardProps {
  sellerId: number;
  sellerTrust: SellerTrust | null;
}

export default function SellerProfileCard({ sellerId, sellerTrust }: SellerProfileCardProps) {
  if (!sellerTrust) {
    return (
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
        <p className="text-xs text-slate-400 dark:text-slate-500">Loading seller credibility profiles...</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30';
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30';
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'Top Rated Seller':
        return 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white';
      case 'Trusted Seller':
        return 'bg-brand-500 text-white';
      case 'Verified Seller':
        return 'bg-slate-700 dark:bg-slate-600 text-white';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-5 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-100 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Seller Credibility</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Verified User #{sellerId}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getBadgeColor(sellerTrust.level)}`}>
          {sellerTrust.level}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Trust Score */}
        <div className={`p-4 rounded-xl flex flex-col justify-between gap-2 ${getScoreColor(sellerTrust.trust_score)}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">Trust Score</span>
          <span className="text-2xl font-black font-mono">{sellerTrust.trust_score}/100</span>
        </div>

        {/* Response Rate */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 rounded-xl flex flex-col justify-between gap-2 border border-slate-100 dark:border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Response Rate</span>
          <span className="text-xl font-black font-mono">{(sellerTrust.response_rate * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 grid grid-cols-2 gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Award className="w-4 h-4 text-brand-500" />
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Quality Score</p>
            <p className="font-extrabold text-slate-700 dark:text-slate-300 font-mono">{sellerTrust.quality_score}/100</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Fraud Flag Rate</p>
            <p className="font-extrabold text-slate-700 dark:text-slate-300 font-mono">{sellerTrust.fraud_score}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
