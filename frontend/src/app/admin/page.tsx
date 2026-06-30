'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Tag, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  ShieldAlert, 
  UserCheck, 
  FileText, 
  RotateCcw, 
  Download, 
  Upload, 
  AlertTriangle,
  Lock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data States
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Bulk Actions State
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('resolve');

  // Edit Settings State
  const [editingSetting, setEditingSetting] = useState({ key: '', value: '', description: '' });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user?.is_admin) {
        router.push('/');
      } else {
        fetchTab(activeTab);
      }
    }
  }, [isAuthenticated, user, authLoading, activeTab]);

  const fetchTab = async (tab: string) => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'overview') {
        const res = await api.get('/api/admin/overview');
        setOverview(res.data);
      } else if (tab === 'users') {
        const res = await api.get('/api/admin/users');
        setUsers(res.data);
      } else if (tab === 'listings') {
        const res = await api.get('/api/admin/listings');
        setListings(res.data);
      } else if (tab === 'moderation') {
        const res = await api.get('/api/admin/reports');
        setReports(res.data);
      } else if (tab === 'verifications') {
        const res = await api.get('/api/admin/verifications');
        setVerifications(res.data);
      } else if (tab === 'settings') {
        const res = await api.get('/api/admin/settings');
        setSettings(res.data);
      } else if (tab === 'audit') {
        const res = await api.get('/api/admin/audit-logs');
        setAuditLogs(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  // --- Admin Actions ---
  const handleSuspendUser = async (id: number) => {
    try {
      await api.post(`/api/admin/users/${id}/suspend`);
      setUsers(users.map(u => u.id === id ? { ...u, is_suspended: true } : u));
    } catch (err) {
      alert('Failed to suspend user');
    }
  };

  const handleRestoreUser = async (id: number) => {
    try {
      await api.post(`/api/admin/users/${id}/restore`);
      setUsers(users.map(u => u.id === id ? { ...u, is_suspended: false } : u));
    } catch (err) {
      alert('Failed to restore user');
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/api/admin/listings/${id}`);
      setListings(listings.filter(l => l.id !== id));
    } catch (err) {
      alert('Failed to delete listing');
    }
  };

  const handleToggleFeatureListing = async (id: number, current: boolean) => {
    try {
      await api.post(`/api/admin/listings/${id}/feature`, { is_featured: !current });
      setListings(listings.map(l => l.id === id ? { ...l, is_featured: !current } : l));
    } catch (err) {
      alert('Failed to update feature status');
    }
  };

  const handleApproveVerification = async (id: number) => {
    try {
      await api.post(`/api/admin/verifications/${id}/approve`);
      setVerifications(verifications.map(v => v.id === id ? { ...v, status: 'Approved' } : v));
    } catch (err) {
      alert('Failed to approve verification');
    }
  };

  const handleRejectVerification = async (id: number) => {
    try {
      await api.post(`/api/admin/verifications/${id}/reject`);
      setVerifications(verifications.map(v => v.id === id ? { ...v, status: 'Rejected' } : v));
    } catch (err) {
      alert('Failed to reject verification');
    }
  };

  const handleBulkModeration = async () => {
    if (selectedReports.length === 0) return;
    try {
      await api.post('/api/admin/reports/bulk-action', {
        report_ids: selectedReports,
        action: bulkAction
      });
      fetchTab('moderation');
      setSelectedReports([]);
    } catch (err) {
      alert('Bulk action failed');
    }
  };

  const handleToggleReportSelection = (id: number) => {
    setSelectedReports(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSaveSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/api/admin/settings', editingSetting);
      setEditingSetting({ key: '', value: '', description: '' });
      fetchTab('settings');
    } catch (err) {
      alert('Failed to save setting');
    }
  };

  // --- Backup & Recovery ---
  const handleExportBackup = async () => {
    try {
      const res = await api.post('/api/admin/backup/export');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `smartbazaar_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Export backup failed');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.post('/api/admin/backup/restore', json);
        alert('Database restored successfully!');
        fetchTab(activeTab);
      } catch (err) {
        alert('Restore failed. Check file format.');
      }
    };
    reader.readAsText(file);
  };

  if (authLoading || !user?.is_admin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Lock className="text-primary w-8 h-8" />
            Admin Control Center
          </h1>
          <p className="text-muted-foreground mt-1">Configure parameters, moderate users, evaluate analytics, and maintain system state.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExportBackup} className="flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export Backup
          </Button>
          <label className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground px-3 py-1.5 cursor-pointer gap-1.5">
            <Upload className="w-4 h-4" /> Import Backup
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 border-b border-border mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'listings', label: 'Listings', icon: Tag },
          { id: 'moderation', label: 'Moderation Queue', icon: ShieldAlert },
          { id: 'verifications', label: 'Verifications', icon: UserCheck },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'audit', label: 'Audit Logs', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-[2px] ${
              activeTab === tab.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 mb-6 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      ) : (
        <div>
          {/* --- OVERVIEW TAB --- */}
          {activeTab === 'overview' && overview && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Users / DAU</p>
                    <h3 className="text-2xl font-bold mt-1">{overview.active_users} / {overview.dau}</h3>
                  </div>
                </Card>
                <Card className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Listings Created</p>
                    <h3 className="text-2xl font-bold mt-1">{overview.listings_created}</h3>
                  </div>
                </Card>
                <Card className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Messages Exchanged</p>
                    <h3 className="text-2xl font-bold mt-1">{overview.messages_sent}</h3>
                  </div>
                </Card>
                <Card className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Commission Revenue</p>
                    <h3 className="text-2xl font-bold mt-1">₹{overview.revenue_estimate.toFixed(2)}</h3>
                  </div>
                </Card>
              </div>

              {/* Trust Score Distribution Graph (Pure CSS / SVGs) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Seller Trust Level Distribution</h3>
                  <div className="flex items-end justify-around h-64 pt-6 border-b border-l border-border px-4">
                    {Object.entries(overview.trust_distribution).map(([level, count]: [string, any]) => {
                      const maxVal = Math.max(...Object.values(overview.trust_distribution) as number[], 1);
                      const heightPct = (count / maxVal) * 80; // Scale to max 80% height
                      
                      return (
                        <div key={level} className="flex flex-col items-center w-12 group">
                          <span className="text-xs font-semibold text-primary mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
                          <div 
                            style={{ height: `${Math.max(heightPct, 8)}%` }} 
                            className="w-full bg-primary/20 hover:bg-primary rounded-t-md transition-all duration-500 cursor-pointer"
                          />
                          <span className="text-xs text-muted-foreground font-medium mt-2 rotate-45 md:rotate-0 origin-top-left">{level}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Marketplace Health & Conversions</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Offer Conversion Rate</span>
                          <span className="font-bold">{overview.offer_conversion_rate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                          <div style={{ width: `${overview.offer_conversion_rate}%` }} className="bg-green-500 h-full rounded-full transition-all duration-500" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Suspended Users Ratio</span>
                          <span className="font-bold">{(overview.suspended_users / (overview.active_users + overview.suspended_users || 1) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                          <div style={{ width: `${(overview.suspended_users / (overview.active_users + overview.suspended_users || 1) * 100)}%` }} className="bg-destructive h-full rounded-full transition-all duration-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/40 p-4 rounded-xl mt-6 border border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      💡 **Conversion Strategy Tip:** High trust distribution in Elite & Verified tiers correlates with a higher offer conversion rate. Promote credentials verifications to optimize conversions.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* --- USERS TAB --- */}
          {activeTab === 'users' && (
            <Card className="overflow-hidden border border-border animate-in fade-in duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Registration Date</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-accent/30 transition-colors">
                        <td className="p-4 font-medium text-foreground">{u.full_name || 'N/A'}</td>
                        <td className="p-4 text-muted-foreground">{u.email}</td>
                        <td className="p-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <Badge variant={u.is_admin ? 'primary' : 'outline'}>
                            {u.is_admin ? 'Admin' : 'User'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${u.is_suspended ? 'text-destructive' : 'text-green-500'}`}>
                            {u.is_suspended ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            {u.is_suspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {u.is_admin ? (
                            <span className="text-xs text-muted-foreground">Admin Protected</span>
                          ) : (
                            <Button 
                              variant={u.is_suspended ? 'outline' : 'destructive'} 
                              size="sm"
                              onClick={() => u.is_suspended ? handleRestoreUser(u.id) : handleSuspendUser(u.id)}
                            >
                              {u.is_suspended ? 'Restore' : 'Suspend'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* --- LISTINGS TAB --- */}
          {activeTab === 'listings' && (
            <Card className="overflow-hidden border border-border animate-in fade-in duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
                      <th className="p-4">Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Featured</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {listings.map(l => (
                      <tr key={l.id} className="hover:bg-accent/30 transition-colors">
                        <td className="p-4 font-medium text-foreground">{l.title}</td>
                        <td className="p-4 text-muted-foreground">{l.category}</td>
                        <td className="p-4 text-muted-foreground">{l.location}</td>
                        <td className="p-4 font-bold">₹{l.price}</td>
                        <td className="p-4">
                          <Badge variant={l.status === 'Active' ? 'outline' : 'primary'}>
                            {l.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <input 
                            type="checkbox" 
                            checked={l.is_featured} 
                            onChange={() => handleToggleFeatureListing(l.id, l.is_featured)}
                            className="rounded border-input text-primary focus:ring-ring h-4 w-4"
                          />
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/listing/${l.id}`)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteListing(l.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* --- MODERATION QUEUE TAB --- */}
          {activeTab === 'moderation' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Card className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={selectedReports.length === reports.length && reports.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReports(reports.map(r => r.id));
                      } else {
                        setSelectedReports([]);
                      }
                    }}
                    className="rounded border-input text-primary focus:ring-ring h-4 w-4"
                  />
                  <span className="text-sm font-semibold">{selectedReports.length} selected</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select 
                    value={bulkAction} 
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="resolve">Resolve Reports</option>
                    <option value="dismiss">Dismiss Reports</option>
                    <option value="suspend_users">Suspend Reported Users</option>
                    <option value="delete_listings">Delete Reported Listings</option>
                  </select>
                  <Button variant="primary" size="sm" onClick={handleBulkModeration} disabled={selectedReports.length === 0}>
                    Apply Action
                  </Button>
                </div>
              </Card>

              {reports.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/10">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-muted-foreground font-semibold">Moderation Queue is clear!</p>
                </div>
              ) : (
                <Card className="overflow-hidden border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
                          <th className="p-4 w-10"></th>
                          <th className="p-4">Reporter</th>
                          <th className="p-4">Reported User / Listing</th>
                          <th className="p-4">Reason</th>
                          <th className="p-4">Details</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {reports.map(r => (
                          <tr key={r.id} className="hover:bg-accent/30 transition-colors">
                            <td className="p-4">
                              <input 
                                type="checkbox" 
                                checked={selectedReports.includes(r.id)} 
                                onChange={() => handleToggleReportSelection(r.id)}
                                className="rounded border-input text-primary focus:ring-ring h-4 w-4"
                              />
                            </td>
                            <td className="p-4 font-medium text-foreground">{r.reporter_name}</td>
                            <td className="p-4">
                              {r.reported_listing_id ? (
                                <div className="text-primary hover:underline cursor-pointer" onClick={() => router.push(`/listing/${r.reported_listing_id}`)}>
                                  Listing: {r.reported_listing_title}
                                </div>
                              ) : r.reported_user_id ? (
                                <div>User: {r.reported_user_name}</div>
                              ) : (
                                <span className="text-muted-foreground">General Report</span>
                              )}
                            </td>
                            <td className="p-4 text-foreground font-medium">{r.reason}</td>
                            <td className="p-4 text-muted-foreground truncate max-w-xs">{r.details || 'N/A'}</td>
                            <td className="p-4">
                              <Badge variant={r.status === 'pending' ? 'outline' : 'primary'}>
                                {r.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* --- VERIFICATIONS TAB --- */}
          {activeTab === 'verifications' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {verifications.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/10">
                  <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-semibold">No seller verification requests submitted.</p>
                </div>
              ) : (
                <Card className="overflow-hidden border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
                          <th className="p-4">Username</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Verification Type</th>
                          <th className="p-4">Document</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {verifications.map(v => (
                          <tr key={v.id} className="hover:bg-accent/30 transition-colors">
                            <td className="p-4 font-medium text-foreground">{v.username}</td>
                            <td className="p-4 text-muted-foreground">{v.email}</td>
                            <td className="p-4 font-semibold text-primary">{v.verification_type}</td>
                            <td className="p-4">
                              {v.document_path ? (
                                <a 
                                  href={
                                    v.document_path.startsWith('http')
                                      ? v.document_path
                                      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${v.document_path.startsWith('/') ? '' : '/'}${v.document_path}`
                                  }

                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                                >
                                  <FileText className="w-4 h-4" /> View Document
                                </a>
                              ) : (
                                <span className="text-muted-foreground">No Document</span>
                              )}
                            </td>
                            <td className="p-4">
                              <Badge variant={v.status === 'Approved' ? 'primary' : v.status === 'Rejected' ? 'danger' : 'outline'}>
                                {v.status}
                              </Badge>
                            </td>
                            <td className="p-4 text-right">
                              {v.status === 'Pending' ? (
                                <div className="flex justify-end gap-1.5">
                                  <Button variant="outline" size="sm" onClick={() => handleApproveVerification(v.id)} className="bg-green-500/10 hover:bg-green-500 hover:text-white border-green-500/20 text-green-500">
                                    Approve
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleRejectVerification(v.id)}>
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Processed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* --- SETTINGS TAB --- */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <Card className="p-6 lg:col-span-2">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-1.5"><Settings className="w-5 h-5 text-primary" /> Active Platform Configurations</h3>
                <div className="space-y-4">
                  {settings.map(s => (
                    <div key={s.key} className="flex justify-between items-start border-b border-border pb-4 last:border-b-0 last:pb-0">
                      <div>
                        <h4 className="font-semibold text-foreground">{s.key}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.description || 'No description provided.'}</p>
                        <code className="text-xs bg-muted px-2 py-0.5 rounded text-primary mt-2 inline-block font-mono">{s.value}</code>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setEditingSetting({ key: s.key, value: s.value, description: s.description || '' })}>
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 self-start">
                <h3 className="text-lg font-bold mb-4">{editingSetting.key ? 'Update Setting' : 'Create Setting'}</h3>
                <form onSubmit={handleSaveSetting} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Configuration Key</label>
                    <Input 
                      value={editingSetting.key} 
                      onChange={(e) => setEditingSetting({ ...editingSetting, key: e.target.value })}
                      disabled={!!editingSetting.key}
                      placeholder="e.g. commission_rate"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Value</label>
                    <Input 
                      value={editingSetting.value} 
                      onChange={(e) => setEditingSetting({ ...editingSetting, value: e.target.value })}
                      placeholder="e.g. 0.05"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Description (Optional)</label>
                    <Input 
                      value={editingSetting.description} 
                      onChange={(e) => setEditingSetting({ ...editingSetting, description: e.target.value })}
                      placeholder="e.g. Platform transaction commission multiplier"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" className="w-full">
                      Save Config
                    </Button>
                    {editingSetting.key && (
                      <Button type="button" variant="outline" onClick={() => setEditingSetting({ key: '', value: '', description: '' })}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* --- AUDIT LOGS TAB --- */}
          {activeTab === 'audit' && (
            <Card className="overflow-hidden border border-border animate-in fade-in duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold">
                      <th className="p-4">User</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Entity</th>
                      <th className="p-4">IP Address</th>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-accent/30 transition-colors">
                        <td className="p-4 font-medium text-foreground">{log.user_name}</td>
                        <td className="p-4 font-semibold text-primary">{log.action}</td>
                        <td className="p-4 text-muted-foreground">
                          {log.entity_type ? `${log.entity_type} (#${log.entity_id || 'N/A'})` : 'N/A'}
                        </td>
                        <td className="p-4 text-muted-foreground font-mono">{log.ip_address || 'N/A'}</td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-4 text-muted-foreground font-mono text-xs max-w-xs truncate" title={log.details}>
                          {log.details || '{}'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
