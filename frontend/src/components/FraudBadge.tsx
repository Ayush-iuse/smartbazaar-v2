import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface FraudBadgeProps {
  score: number;
  level: string;
  className?: string;
}

export default function FraudBadge({ score, level, className = '' }: FraudBadgeProps) {
  const normLevel = (level || 'Low').toLowerCase();

  let colors = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = ShieldCheck;
  let label = 'Safe';

  if (normLevel === 'medium') {
    colors = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = AlertTriangle;
    label = 'Moderate Risk';
  } else if (normLevel === 'high') {
    colors = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = ShieldAlert;
    label = 'High Risk';
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colors} ${className}`}
      title={`Fraud scan score: ${score.toFixed(1)}/100`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label} ({score.toFixed(0)}%)</span>
    </div>
  );
}
