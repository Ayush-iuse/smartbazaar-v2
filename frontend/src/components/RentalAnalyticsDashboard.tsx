import React from 'react';
import { BarChart3, TrendingUp, ShieldAlert, Cpu, Wrench, Warehouse, Users, Percent } from 'lucide-react';
import { Card } from './ui/Card';

interface FleetItem {
  id: number;
  serialNumber: string;
  status: 'Available' | 'Rented' | 'Maintenance';
  warehouse: string;
  assignedEmployee: string;
}

interface RentalAnalyticsDashboardProps {
  todayRevenue: number;
  monthlyRevenue: number;
  occupancyRate: number;
  fleet: FleetItem[];
}

export default function RentalAnalyticsDashboard({
  todayRevenue,
  monthlyRevenue,
  occupancyRate,
  fleet
}: RentalAnalyticsDashboardProps) {
  return (
    <div className="space-y-6 select-none">
      
      {/* Top BI Header */}
      <div className="flex justify-between items-center border-b border-border/20 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-primary">
            <BarChart3 className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-tight text-foreground">
              Rental Business Command Center
            </h2>
          </div>
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
            Real-time Fleet Performance and Revenue Intelligence
          </p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Revenue Card */}
        <Card className="p-5 space-y-4 border border-border/40 bg-card">
          <h3 className="text-[8px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span>Earnings Statement</span>
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] text-muted-foreground font-bold">Today:</span>
              <span className="text-sm font-mono font-black text-foreground">₹{todayRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-end border-t border-border/10 pt-2">
              <span className="text-[10px] text-muted-foreground font-bold">Monthly Earned:</span>
              <span className="text-sm font-mono font-black text-foreground">₹{monthlyRevenue.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Occupancy Card */}
        <Card className="p-5 space-y-4 border border-border/40 bg-card">
          <h3 className="text-[8px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Percent className="w-3.5 h-3.5 text-primary" />
            <span>Fleet Occupancy rate</span>
          </h3>
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground font-bold">Current Rate:</span>
              <span className="text-sm font-mono font-black text-primary">{occupancyRate}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-muted/30 h-2 rounded-full overflow-hidden border border-border/20">
              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${occupancyRate}%` }} />
            </div>
          </div>
        </Card>

        {/* AI Business Insights */}
        <Card className="p-5 space-y-4 border border-border/40 bg-card">
          <h3 className="text-[8px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Fleet Insights</span>
          </h3>
          <div className="space-y-2.5 text-[9px] font-bold text-foreground leading-relaxed">
            <div className="flex items-start gap-2 bg-primary/5 border border-primary/15 p-2 rounded-xl">
              <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
              <p>Weekend demand forecasts are up 15%. Consider adjusting rental price overrides on upcoming holidays.</p>
            </div>
            <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/15 p-2 rounded-xl">
              <Wrench className="w-4 h-4 text-amber-500 shrink-0" />
              <p>2 assets require routine maintenance checkups before dispatching next bookings scheduled tomorrow.</p>
            </div>
          </div>
        </Card>

      </div>

      {/* Fleet Inventory Management */}
      <Card className="p-5 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-foreground flex items-center gap-2 border-b border-border/20 pb-2">
          <Warehouse className="w-4.5 h-4.5 text-primary" />
          <span>Fleet Stock Ledger</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-[10px] font-bold text-left border-collapse">
            <thead>
              <tr className="border-b border-border/30 text-muted-foreground text-[8px] uppercase tracking-wider">
                <th className="py-2.5">Serial Number</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">Warehouse Location</th>
                <th className="py-2.5">Assigned Courier</th>
              </tr>
            </thead>
            <tbody>
              {fleet.map((item) => {
                let badgeClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                if (item.status === 'Rented') badgeClass = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
                if (item.status === 'Maintenance') badgeClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';

                return (
                  <tr key={item.id} className="border-b border-border/10 hover:bg-muted/5 transition-colors">
                    <td className="py-3 font-mono text-foreground">{item.serialNumber}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded border text-[8px] uppercase tracking-wider font-black ${badgeClass}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">{item.warehouse}</td>
                    <td className="py-3 text-muted-foreground flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-muted-foreground/60" />
                      <span>{item.assignedEmployee}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
