import React from 'react';
import { ShieldCheck, Store, Users, Share2, Award, Briefcase, PlusCircle, Bookmark } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface StoreItem {
  id: number;
  name: string;
  category: string;
  followers: number;
}

interface BusinessDashboardProps {
  businessName: string;
  gstNumber: string;
  stores: StoreItem[];
}

export default function BusinessDashboard({
  businessName,
  gstNumber,
  stores
}: BusinessDashboardProps) {
  const employees = [
    { name: "Ayush Patel", role: "Owner", branch: "Main Office" },
    { name: "Rahul Verma", role: "Manager", branch: "West Warehouse" },
    { name: "Neha Joshi", role: "Warehouse Operator", branch: "East Logistics Hub" }
  ];

  return (
    <div className="space-y-6 select-none">
      
      {/* Business Account Banner */}
      <Card className="p-6 relative overflow-hidden border border-border/40 bg-card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-tight text-foreground">{businessName}</h2>
              <span className="flex items-center gap-0.5 text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Brand</span>
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground font-mono">GSTIN: {gstNumber}</p>
          </div>
          <Button size="sm" className="text-[9px] font-black uppercase tracking-wider h-8">
            <PlusCircle className="w-3.5 h-3.5 mr-1" />
            <span>Create New Store</span>
          </Button>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Multi-Store Section (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Store className="w-4.5 h-4.5 text-primary" />
            <span>Registered Storefronts</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((store) => (
              <Card key={store.id} className="p-5 space-y-4 border border-border/40 hover:border-primary/20 hover:scale-[1.01] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black uppercase tracking-tight text-foreground">{store.name}</h4>
                    <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider block">{store.category}</span>
                  </div>
                  <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                    Active
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-border/10 pt-3 text-[10px] font-bold">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{store.followers.toLocaleString()} followers</span>
                  </div>
                  <button className="text-primary flex items-center gap-0.5 hover:underline uppercase text-[8px] font-black tracking-wider">
                    <Share2 className="w-3 h-3" />
                    <span>Share</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Employee Management Table */}
          <Card className="p-5 space-y-4">
            <h4 className="text-[9px] font-black uppercase tracking-wider text-foreground flex items-center gap-2 border-b border-border/20 pb-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span>Team & Access Control</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] font-bold text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/20 text-muted-foreground text-[8px] uppercase tracking-wider">
                    <th className="py-2">Employee Name</th>
                    <th className="py-2">Workspace Role</th>
                    <th className="py-2">Assigned Branch</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, idx) => (
                    <tr key={idx} className="border-b border-border/10">
                      <td className="py-2.5 text-foreground">{emp.name}</td>
                      <td className="py-2.5 text-primary uppercase text-[8px] font-black">{emp.role}</td>
                      <td className="py-2.5 text-muted-foreground">{emp.branch}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Section: Loyalty & Social Feed */}
        <div className="space-y-4">
          
          {/* Loyalty Panel */}
          <Card className="p-5 space-y-4 border border-border/40 bg-card">
            <h3 className="text-[9px] font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" />
              <span>Loyalty & VIP Program</span>
            </h3>
            <div className="space-y-3 text-[10px] font-bold text-foreground">
              <div className="flex justify-between items-center bg-primary/5 p-3 rounded-2xl border border-primary/10">
                <span className="text-muted-foreground">Reward Points Balance:</span>
                <span className="font-mono text-primary font-black">2,450 pts</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-muted-foreground">
                  <span>Loyalty Level Progression</span>
                  <span>Platinum Elite</span>
                </div>
                <div className="w-full bg-muted/30 h-1.5 rounded-full overflow-hidden border border-border/10">
                  <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: '80%' }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Social Collections Card */}
          <Card className="p-5 space-y-4 border border-border/40 bg-card">
            <h3 className="text-[9px] font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-primary" />
              <span>Shared Collections Feed</span>
            </h3>
            <div className="space-y-3 text-[9px] font-bold text-foreground">
              <div className="border border-border/20 p-3 rounded-2xl space-y-2 hover:bg-muted/5 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Dream House Setup</span>
                  <span className="text-[8px] text-muted-foreground">8 items</span>
                </div>
                <p className="text-[8px] text-muted-foreground font-medium">A curated selection of modern electronics and smart property assets.</p>
              </div>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}
