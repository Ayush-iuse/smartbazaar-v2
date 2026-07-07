'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion, staggerContainerVariants, fadeInUpVariants } from '../../lib/motion';
import api from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LayoutDashboard, TrendingUp, BarChart3, Users, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

interface CategoryMetric {
  category: string;
  count: number;
  avg_price: number;
  fraud_rate: number;
}

interface LocationMetric {
  location: string;
  count: number;
}

interface DailyTrendMetric {
  date: string;
  count: number;
}

interface AnalyticsData {
  total_listings: number;
  categories: CategoryMetric[];
  locations: LocationMetric[];
  fraud_distribution: Record<string, number>;
  daily_trends: DailyTrendMetric[];
}

export default function AnalyticsPage() {
  const reduced = useReducedMotion();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [insights, setInsights] = useState<{ summary: string; is_fallback: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/analytics/overview');
      setData(res.data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('Could not retrieve marketplace analytics statistics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      setInsightsLoading(true);
      const res = await api.get('/api/analytics/insights');
      setInsights(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="py-20 bg-background text-foreground transition-colors min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center bg-background text-foreground min-h-screen">
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-2xl font-bold mb-4">
          {error || 'Failed to load analytics dashboard.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 bg-background text-foreground min-h-screen transition-colors duration-200">
      
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Marketplace Analytics</h1>
          <p className="text-xs text-muted-foreground mt-1">Real-time statistics, category metrics, and AI intelligence insights</p>
        </div>
        <Button
          onClick={() => { fetchAnalytics(); fetchInsights(); }}
          variant="secondary"
          size="sm"
        >
          Refresh Statistics
        </Button>
      </div>

      {/* AI Command Center Insights Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-slate-100 p-6 border border-slate-800 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-4xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse-subtle" />
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">AI Command Center Insights</span>
            </div>
            {insightsLoading ? (
              <div className="h-6 w-72 bg-slate-800 rounded animate-pulse" />
            ) : insights ? (
              <p className="text-xs font-bold leading-relaxed text-slate-200">
                {insights.summary}
              </p>
            ) : (
              <p className="text-xs font-bold text-slate-405 italic">AI summary unavailable. Refresh to retry.</p>
            )}
          </div>
          <Badge variant="primary" className="bg-primary/20 text-primary border-primary/20 shrink-0 self-start md:self-center font-black">
            AI ANALYSIS
          </Badge>
        </div>
      </div>

      {/* Overview Totals Row */}
      <motion.div 
        variants={staggerContainerVariants(0.04, 0.06)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5"
      >
        <motion.div variants={fadeInUpVariants(reduced)}>
          <Card className="hover:shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Items</span>
                <span className="text-2xl font-black tracking-tight font-mono">{data.total_listings}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUpVariants(reduced)}>
          <Card className="hover:shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Total Categories</span>
                <span className="text-2xl font-black tracking-tight font-mono">{data.categories.length}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUpVariants(reduced)}>
          <Card className="hover:shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Flagged Scam Ads</span>
                <span className="text-2xl font-black tracking-tight font-mono">
                  {data.fraud_distribution["High"] || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUpVariants(reduced)}>
          <Card className="hover:shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Locations</span>
                <span className="text-2xl font-black tracking-tight font-mono">{data.locations.length}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Stats Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Categories stats table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="font-black text-sm tracking-tight">Category Intelligence</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground font-black uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2 text-center">Listings</th>
                  <th className="py-3 px-2 text-right">Avg Price</th>
                  <th className="py-3 px-2 text-right">Scam Risk Rate</th>
                </tr>
              </thead>
              <tbody className="font-semibold text-foreground divide-y divide-border/20">
                {data.categories.map((c) => (
                  <tr key={c.category} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-2 font-bold">{c.category}</td>
                    <td className="py-3.5 px-2 text-center font-mono">{c.count}</td>
                    <td className="py-3.5 px-2 text-right font-mono font-bold">₹{c.avg_price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="py-3.5 px-2 text-right font-mono">
                      {c.fraud_rate >= 25 ? (
                        <Badge variant="danger">{c.fraud_rate}%</Badge>
                      ) : (
                        <Badge variant="success">{c.fraud_rate}%</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Location hotspots & general stats */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-black text-sm tracking-tight">Geographic Hotspots</h3>
            </div>
            
            <div className="space-y-3.5">
              {data.locations.map((l) => (
                <div key={l.location} className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-foreground/80 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {l.location}
                  </span>
                  <Badge variant="secondary" className="font-mono text-[9px]">
                    {l.count} ads
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Daily insertions counts graph */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">Daily Post Velocity</span>
            <div className="flex justify-between items-end h-24 pt-2 gap-1.5">
              {data.daily_trends.map((t) => (
                <div key={t.date} className="flex flex-col items-center flex-1 group relative">
                  <span className="absolute -top-7 bg-slate-900 text-slate-100 px-2 py-0.5 rounded text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow border border-slate-800">
                    {t.count} posts
                  </span>
                  <div 
                    className="w-full bg-primary hover:bg-primary/80 rounded-t-lg transition-all"
                    style={{ height: `${Math.max(t.count * 15, 6)}px` }}
                  />
                  <span className="text-[8px] font-bold text-muted-foreground mt-1.5 font-mono">
                    {t.date.split('-')[2]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
