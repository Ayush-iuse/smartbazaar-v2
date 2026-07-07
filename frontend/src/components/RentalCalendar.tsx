import React, { useState } from 'react';
import { Calendar, Clock, Sparkles, AlertCircle, Plus, Trash2, CalendarDays } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface RentalCalendarProps {
  listingId: number;
  basePrice: number;
}

export default function RentalCalendar({ listingId, basePrice }: RentalCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  
  // Local state for calendar dates overrides
  const [calendarDays, setCalendarDays] = useState<Record<string, { status: string; price?: number }>>({
    "2026-07-10": { status: "Booked" },
    "2026-07-11": { status: "Booked" },
    "2026-07-12": { status: "Maintenance" },
    "2026-07-15": { status: "Seasonal Override", price: 1800 }
  });

  const [dateStatus, setDateStatus] = useState('Available');
  const [customPrice, setCustomPrice] = useState('');
  
  // Bulk block inputs
  const [bulkStart, setBulkStart] = useState('');
  const [bulkEnd, setBulkEnd] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate days grid
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayIndex }, (_, i) => null);

  const gridCells = [...paddingArray, ...daysArray];

  const handleDayClick = (day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    setSelectedDateStr(dateStr);
    
    const existing = calendarDays[dateStr];
    setDateStatus(existing?.status || 'Available');
    setCustomPrice(existing?.price ? String(existing.price) : '');
  };

  const handleSaveDaySettings = () => {
    if (!selectedDateStr) return;
    setCalendarDays((prev) => {
      const copy = { ...prev };
      if (dateStatus === 'Available' && !customPrice) {
        delete copy[selectedDateStr];
      } else {
        copy[selectedDateStr] = {
          status: dateStatus,
          price: customPrice ? parseFloat(customPrice) : undefined
        };
      }
      return copy;
    });
    setSelectedDateStr(null);
  };

  const handleBulkBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkStart || !bulkEnd) return;
    
    const start = new Date(bulkStart);
    const end = new Date(bulkEnd);
    
    const newBlocks: Record<string, { status: string }> = {};
    let temp = new Date(start);
    while (temp <= end) {
      const y = temp.getFullYear();
      const m = String(temp.getMonth() + 1).padStart(2, '0');
      const d = String(temp.getDate()).padStart(2, '0');
      newBlocks[`${y}-${m}-${d}`] = { status: "Blocked" };
      temp.setDate(temp.getDate() + 1);
    }
    
    setCalendarDays((prev) => ({ ...prev, ...newBlocks }));
    setBulkStart('');
    setBulkEnd('');
  };

  const handleRecurringBlockWeekends = () => {
    const newBlocks: Record<string, { status: string }> = {};
    // Block all Saturdays and Sundays in current month
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      if (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
        const formattedMonth = String(month + 1).padStart(2, '0');
        const formattedDay = String(d).padStart(2, '0');
        newBlocks[`${year}-${formattedMonth}-${formattedDay}`] = { status: "Blocked" };
      }
    }
    setCalendarDays((prev) => ({ ...prev, ...newBlocks }));
  };

  const getDayDetails = (day: number | null) => {
    if (!day) return null;
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    return { dateStr, details: calendarDays[dateStr] };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Calendar Grid View (Left 2 Columns) */}
      <Card className="lg:col-span-2 p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-tight text-foreground">
              {monthNames[month]} {year}
            </h3>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="text-xs h-8"
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="text-xs h-8"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-[8px] font-black uppercase tracking-wider text-muted-foreground pb-2">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded" /> Available</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500/10 border border-rose-500/30 rounded" /> Booked</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-500/10 border border-slate-500/30 rounded" /> Blocked</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500/10 border border-amber-500/30 rounded" /> Maintenance</span>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
            <div key={dayName} className="text-muted-foreground py-1 font-black">{dayName}</div>
          ))}
          {gridCells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="py-3 bg-muted/5 rounded-xl border border-transparent" />;
            const details = getDayDetails(day);
            const status = details?.details?.status || 'Available';
            const price = details?.details?.price;

            let cellClass = 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
            if (status === 'Booked') cellClass = 'bg-rose-500/10 border-rose-500/25 text-rose-500';
            if (status === 'Blocked') cellClass = 'bg-slate-500/10 border-slate-500/25 text-muted-foreground';
            if (status === 'Maintenance') cellClass = 'bg-amber-500/10 border-amber-500/25 text-amber-500';
            if (status === 'Seasonal Override') cellClass = 'bg-purple-500/10 border-purple-500/25 text-purple-500';

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-between min-h-[50px] transition-all hover:scale-105 duration-200 ${cellClass}`}
              >
                <span className="font-mono text-xs font-black">{day}</span>
                <span className="text-[8px] font-mono opacity-85">
                  ₹{price || basePrice}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Side Controllers Panel (Right 1 Column) */}
      <div className="space-y-4">
        
        {/* Selected Day details config */}
        {selectedDateStr && (
          <Card className="p-5 space-y-3.5 border-primary/30">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Day: {selectedDateStr}</span>
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">Date Status</label>
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
                  <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">Custom Rate (INR)</label>
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
                <Button size="sm" className="flex-1 text-[10px] h-8 font-black uppercase tracking-wider" onClick={handleSaveDaySettings}>
                  Save
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-[10px] h-8" onClick={() => setSelectedDateStr(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Bulk blockers config */}
        <Card className="p-5 space-y-4">
          <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/20 pb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Bulk Manage Dates</span>
          </h4>

          <form onSubmit={handleBulkBlock} className="space-y-3">
            <div>
              <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">Start Date</label>
              <input
                type="date"
                required
                value={bulkStart}
                onChange={(e) => setBulkStart(e.target.value)}
                className="w-full px-3 py-1.5 border border-border/40 bg-muted/20 rounded-xl text-[10px] outline-none text-foreground"
              />
            </div>
            <div>
              <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1">End Date</label>
              <input
                type="date"
                required
                value={bulkEnd}
                onChange={(e) => setBulkEnd(e.target.value)}
                className="w-full px-3 py-1.5 border border-border/40 bg-muted/20 rounded-xl text-[10px] outline-none text-foreground"
              />
            </div>
            <Button type="submit" className="w-full text-[9px] font-black uppercase tracking-wider h-8.5">
              Bulk Block Range
            </Button>
          </form>

          <button
            onClick={handleRecurringBlockWeekends}
            className="w-full border border-border hover:bg-muted text-foreground font-black py-2 rounded-xl text-[9px] uppercase tracking-wider transition-colors mt-2"
          >
            Block All Weekends
          </button>
        </Card>

      </div>
    </div>
  );
}
