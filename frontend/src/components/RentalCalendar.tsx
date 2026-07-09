'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Calendar, Clock, Sparkles, AlertCircle, CalendarDays,
  Loader2, ChevronLeft, ChevronRight, Save, X
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import api, { formatError } from '../lib/api';

interface CalendarDay {
  status: string;
  price?: number;
}

interface RentalCalendarProps {
  listingId: number;
  basePrice: number;
  readOnly?: boolean;   // Buyers see read-only; sellers can edit
}

// ── Status colors ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  Available: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  Booked: 'bg-rose-500/10 border-rose-500/25 text-rose-500',
  Blocked: 'bg-slate-500/10 border-slate-500/25 text-muted-foreground',
  Maintenance: 'bg-amber-500/10 border-amber-500/25 text-amber-500',
  'Seasonal Override': 'bg-purple-500/10 border-purple-500/25 text-purple-500',
};

// ── Motion Variants ──────────────────────────────────────────────────────────

const cellVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.012,
      type: 'spring',
      stiffness: 300,
      damping: 22,
    },
  }),
};

const monthSlideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 26 } },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.15 },
  }),
};

const panelVariants: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
  exit: { opacity: 0, x: 16, transition: { duration: 0.15 } },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Component ────────────────────────────────────────────────────────────────

export default function RentalCalendar({ listingId, basePrice, readOnly = false }: RentalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [calendarDays, setCalendarDays] = useState<Record<string, CalendarDay>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [dateStatus, setDateStatus] = useState('Available');
  const [customPrice, setCustomPrice] = useState('');
  const [bulkStart, setBulkStart] = useState('');
  const [bulkEnd, setBulkEnd] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // ── Fetch availability from backend ──────────────────────────────────────
  const fetchAvailability = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/bookings/calendar/availability/${listingId}`);
      const map: Record<string, CalendarDay> = {};
      for (const row of (res.data || [])) {
        map[row.date] = {
          status: row.status,
          price: row.seasonal_price_override ?? undefined,
        };
      }
      setCalendarDays(map);
    } catch (err: any) {
      // Non-critical — calendar just shows all-available if endpoint fails
      console.warn('Calendar availability fetch failed:', formatError(err));
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  useEffect(() => { fetchAvailability(); }, [fetchAvailability]);

  // ── Grid helpers ──────────────────────────────────────────────────────────
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const gridCells = [
    ...Array.from({ length: firstDayIndex }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const toDateStr = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handleDayClick = (day: number) => {
    if (readOnly) return;
    const ds = toDateStr(day);
    setSelectedDateStr(ds);
    const existing = calendarDays[ds];
    setDateStatus(existing?.status || 'Available');
    setCustomPrice(existing?.price ? String(existing.price) : '');
  };

  // ── Save single day ───────────────────────────────────────────────────────
  const handleSaveDaySettings = async () => {
    if (!selectedDateStr) return;
    setIsSaving(true);
    setSaveMsg(null);
    setError(null);
    try {
      if (dateStatus === 'Seasonal Override' && customPrice) {
        await api.post('/api/bookings/calendar/pricing', {
          listing_id: listingId,
          date: selectedDateStr,
          price_override: parseFloat(customPrice),
        });
      } else {
        await api.post('/api/bookings/calendar/block', {
          listing_id: listingId,
          start_date: selectedDateStr,
          end_date: selectedDateStr,
          status: dateStatus,
        });
      }

      // Optimistic update
      setCalendarDays((prev) => {
        const copy = { ...prev };
        if (dateStatus === 'Available' && !customPrice) {
          delete copy[selectedDateStr];
        } else {
          copy[selectedDateStr] = {
            status: dateStatus,
            price: customPrice ? parseFloat(customPrice) : undefined,
          };
        }
        return copy;
      });
      setSaveMsg('Saved!');
      setTimeout(() => { setSaveMsg(null); setSelectedDateStr(null); }, 1200);
    } catch (err: any) {
      setError(formatError(err) || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Bulk block ─────────────────────────────────────────────────────────────
  const handleBulkBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkStart || !bulkEnd) return;
    setIsSaving(true);
    setError(null);
    try {
      await api.post('/api/bookings/calendar/block', {
        listing_id: listingId,
        start_date: bulkStart,
        end_date: bulkEnd,
        status: 'Blocked',
      });
      // Optimistic local update
      const start = new Date(bulkStart);
      const end = new Date(bulkEnd);
      const newBlocks: Record<string, CalendarDay> = {};
      let temp = new Date(start);
      while (temp <= end) {
        const key = temp.toISOString().split('T')[0];
        newBlocks[key] = { status: 'Blocked' };
        temp.setDate(temp.getDate() + 1);
      }
      setCalendarDays((prev) => ({ ...prev, ...newBlocks }));
      setBulkStart('');
      setBulkEnd('');
      setSaveMsg('Range blocked!');
      setTimeout(() => setSaveMsg(null), 1500);
    } catch (err: any) {
      setError(formatError(err) || 'Bulk block failed.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Block all weekends locally + sync ──────────────────────────────────────
  const handleRecurringBlockWeekends = async () => {
    const weekendDates: string[] = [];
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      if (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
        weekendDates.push(toDateStr(d));
      }
    }
    if (!weekendDates.length) return;
    const start = weekendDates[0];
    const end = weekendDates[weekendDates.length - 1];
    setIsSaving(true);
    setError(null);
    try {
      // Block Saturday/Sunday in the month via bulk API (backend will iterate)
      for (const ds of weekendDates) {
        await api.post('/api/bookings/calendar/block', {
          listing_id: listingId,
          start_date: ds,
          end_date: ds,
          status: 'Blocked',
        });
      }
      const newBlocks: Record<string, CalendarDay> = {};
      weekendDates.forEach((ds) => { newBlocks[ds] = { status: 'Blocked' }; });
      setCalendarDays((prev) => ({ ...prev, ...newBlocks }));
      setSaveMsg('Weekends blocked!');
      setTimeout(() => setSaveMsg(null), 1500);
    } catch (err: any) {
      setError(formatError(err) || 'Weekend block failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const navigateMonth = (delta: number) => {
    setDirection(delta);
    setCurrentDate(new Date(year, month + delta, 1));
    setSelectedDateStr(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ── Calendar Grid ── */}
      <Card className="lg:col-span-2 p-6 space-y-4">
        {/* Month header */}
        <div className="flex justify-between items-center border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <AnimatePresence mode="wait" custom={direction}>
              <motion.h3
                key={`${year}-${month}`}
                custom={direction}
                variants={monthSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-sm font-black uppercase tracking-tight text-foreground"
              >
                {MONTH_NAMES[month]} {year}
              </motion.h3>
            </AnimatePresence>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => navigateMonth(-1)} className="text-xs h-8 w-8 p-0">
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigateMonth(1)} className="text-xs h-8 w-8 p-0">
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-[8px] font-black uppercase tracking-wider text-muted-foreground pb-2">
          {Object.entries(STATUS_COLORS).slice(0, 4).map(([label, cls]) => (
            <span key={label} className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded border ${cls}`} />
              {label}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${year}-${month}`}
              custom={direction}
              variants={monthSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-7 gap-1 text-center font-bold text-[10px]"
            >
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-muted-foreground py-1 font-black text-[9px]">{d}</div>
              ))}

              {gridCells.map((day, idx) => {
                if (!day) return (
                  <div key={`e-${idx}`} className="py-3 bg-muted/5 rounded-xl border border-transparent" />
                );
                const ds = toDateStr(day);
                const info = calendarDays[ds];
                const st = info?.status || 'Available';
                const price = info?.price;
                const isSelected = selectedDateStr === ds;
                const cellClass = STATUS_COLORS[st] || STATUS_COLORS.Available;

                return (
                  <motion.button
                    key={day}
                    custom={idx}
                    variants={cellVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={readOnly ? {} : { scale: 1.08, zIndex: 10 }}
                    whileTap={readOnly ? {} : { scale: 0.94 }}
                    onClick={() => handleDayClick(day)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-between min-h-[50px] transition-colors duration-150 ${cellClass} ${
                      isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                    } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <span className="font-mono text-xs font-black">{day}</span>
                    <span className="text-[8px] font-mono opacity-85">
                      ₹{price || basePrice}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </Card>

      {/* ── Side Panel ── */}
      <div className="space-y-4">

        {/* Save message / error toast */}
        <AnimatePresence>
          {saveMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" /> {saveMsg}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-xl text-[10px] font-black text-destructive flex items-center gap-2"
            >
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Day config */}
        <AnimatePresence>
          {selectedDateStr && !readOnly && (
            <motion.div
              key="day-panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card className="p-5 space-y-3.5 border-primary/30">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Day: {selectedDateStr}</span>
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                      Date Status
                    </label>
                    <select
                      value={dateStatus}
                      onChange={(e) => setDateStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-border/40 bg-muted/20 rounded-xl text-[10px] text-foreground font-bold outline-none"
                    >
                      <option value="Available">Available</option>
                      <option value="Blocked">Blocked / Vacation</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Seasonal Override">Seasonal Rate Override</option>
                    </select>
                  </div>

                  {dateStatus === 'Seasonal Override' && (
                    <div>
                      <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                        Custom Rate (INR)
                      </label>
                      <input
                        type="number"
                        placeholder="E.g. 1800"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-border/40 bg-muted/20 rounded-xl text-[10px] text-foreground font-mono outline-none"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 text-[10px] h-8 font-black uppercase tracking-wider"
                      onClick={handleSaveDaySettings}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3 h-3 mr-1" />Save</>}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-[10px] h-8"
                      onClick={() => setSelectedDateStr(null)}
                    >
                      <X className="w-3 h-3 mr-1" />Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk blockers — seller only */}
        {!readOnly && (
          <Card className="p-5 space-y-4">
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/20 pb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Bulk Manage Dates</span>
            </h4>

            <form onSubmit={handleBulkBlock} className="space-y-3">
              <div>
                <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={bulkStart}
                  onChange={(e) => setBulkStart(e.target.value)}
                  className="w-full px-3 py-1.5 border border-border/40 bg-muted/20 rounded-xl text-[10px] outline-none text-foreground"
                />
              </div>
              <div>
                <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={bulkEnd}
                  min={bulkStart}
                  onChange={(e) => setBulkEnd(e.target.value)}
                  className="w-full px-3 py-1.5 border border-border/40 bg-muted/20 rounded-xl text-[10px] outline-none text-foreground"
                />
              </div>
              <Button
                type="submit"
                className="w-full text-[9px] font-black uppercase tracking-wider h-8"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Bulk Block Range'}
              </Button>
            </form>

            <button
              onClick={handleRecurringBlockWeekends}
              disabled={isSaving}
              className="w-full border border-border hover:bg-muted text-foreground font-black py-2 rounded-xl text-[9px] uppercase tracking-wider transition-colors mt-2 disabled:opacity-50"
            >
              Block All Weekends
            </button>
          </Card>
        )}

        {/* Read-only legend for buyers */}
        {readOnly && (
          <Card className="p-4 space-y-3 text-[10px]">
            <h4 className="font-black uppercase tracking-wider text-[8px] text-muted-foreground">Availability Legend</h4>
            {Object.entries(STATUS_COLORS).slice(0, 4).map(([label, cls]) => (
              <div key={label} className="flex items-center gap-2 font-bold">
                <span className={`w-3 h-3 rounded border ${cls} shrink-0`} />
                <span className="text-foreground">{label}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
