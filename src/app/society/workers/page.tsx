"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Wrench, Search, Power, ShieldCheck, CheckCircle2, XCircle, Trash2,
  Sliders, Star, Users, ClipboardCheck, BarChart3, AlertTriangle, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecretaryWorkersPage() {
  const { user, initialize } = useAuth();
  const {
    users,
    workerProfiles,
    verifyWorker,
    fetchWorkerStats,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      users: state.users || [],
      workerProfiles: state.workerProfiles || [],
      verifyWorker: state.verifyWorker,
      fetchWorkerStats: state.fetchWorkerStats,
      initializeDb: state.initializeDb
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [workerSearch, setWorkerSearch] = useState("");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    initialize();
    initializeDb();
    
    // Fetch stats
    fetchWorkerStats()
      .then(data => setStats(data))
      .catch(() => {});

    setMounted(true);
  }, [initialize, initializeDb, fetchWorkerStats]);

  // Sync stats when database gets seeded / bookings change
  const reloadStats = () => {
    fetchWorkerStats()
      .then(data => setStats(data))
      .catch(() => {});
  };

  // Approved workers list
  const approvedWorkers = useMemo(() => {
    return users.filter(u =>
      u.role === "worker" &&
      u.status === "approved" &&
      (u.name.toLowerCase().includes(workerSearch.toLowerCase()) ||
       (u.workerCategory && u.workerCategory.toLowerCase().includes(workerSearch.toLowerCase())))
    );
  }, [users, workerSearch]);

  // Pending worker registrations
  const pendingWorkers = useMemo(() => {
    return users.filter(u =>
      u.role === "worker" &&
      u.status === "pending"
    );
  }, [users]);

  if (!mounted) return null;

  const handleVerifyToggle = async (workerId: string, type: "society" | "police", currentValue: boolean) => {
    try {
      await verifyWorker(workerId, {
        [type === "society" ? "isSocietyVerified" : "isPoliceVerified"]: !currentValue
      });
      alert("Worker verification status updated!");
      reloadStats();
    } catch (e) {
      alert("Failed to update verification status.");
    }
  };

  const handleApprove = async (workerId: string) => {
    try {
      await verifyWorker(workerId, { approve: true });
      alert("Worker registration approved!");
      reloadStats();
    } catch (e) {
      alert("Failed to approve worker.");
    }
  };

  const handleRemoveWorker = async (workerId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove worker ${name} from the complex directory?`)) return;

    try {
      await verifyWorker(workerId, { remove: true });
      alert("Worker removed successfully.");
      reloadStats();
    } catch (e) {
      alert("Failed to remove worker.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Community Workers Console 🛠️
        </h1>
        <p className="text-muted-foreground mt-1">
          Review credentials, approve registrations, configure trust badges, and audit service analytics.
        </p>
      </div>

      <Tabs defaultValue="roster" className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[500px] h-12 bg-secondary/30 rounded-2xl p-1 mb-6">
          <TabsTrigger value="roster" className="rounded-xl text-xs font-bold transition-all data-[state=active]:gradient-primary data-[state=active]:text-white">
            Active Roster
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-xl text-xs font-bold transition-all data-[state=active]:gradient-primary data-[state=active]:text-white">
            Pending ({pendingWorkers.length})
          </TabsTrigger>
          <TabsTrigger value="stats" className="rounded-xl text-xs font-bold transition-all data-[state=active]:gradient-primary data-[state=active]:text-white">
            Reports & Analytics
          </TabsTrigger>
        </TabsList>

        {/* ACTIVE ROSTER TAB */}
        <TabsContent value="roster" className="space-y-6 outline-none">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
            <Input
              placeholder="Search active worker by name or category..."
              value={workerSearch}
              onChange={(e) => setWorkerSearch(e.target.value)}
              className="h-11 pl-11 text-xs rounded-xl bg-secondary/10 border-border/50"
            />
          </div>

          {/* Roster Cards List */}
          <Card className="border-border/50 bg-card rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10">
              <CardTitle className="text-base font-bold">Gated Complex Workers Roster</CardTitle>
              <CardDescription>Verify checks and moderate credentials for complex security compliance</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20">
                {approvedWorkers.map((w) => {
                  const profile = workerProfiles.find(p => p.id === w.id);
                  const isSocietyVerified = profile?.workerProfile?.isSocietyVerified || false;
                  const isPoliceVerified = profile?.workerProfile?.isPoliceVerified || false;

                  return (
                    <div key={w.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-secondary/10 transition-all text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">{w.name}</h4>
                          <Badge variant="outline" className="text-[8px] font-extrabold uppercase py-0 px-2 rounded-md bg-secondary/40 text-muted-foreground border-border/30">
                            {w.workerCategory}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          ID: <strong className="text-foreground">{w.employeeId}</strong> | Shift: {w.workingShift || "General"} | Phone: {w.phone}
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          Specializations: {w.specializations?.join(", ") || "General utility"}
                        </p>
                      </div>

                      {/* Verification Checks & Moderate Actions */}
                      <div className="flex flex-wrap items-center gap-4 pt-2 md:pt-0 w-full md:w-auto border-t md:border-0 border-border/15 justify-between">
                        {/* Trust Checkboxes */}
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isSocietyVerified}
                              onChange={() => handleVerifyToggle(w.id, "society", isSocietyVerified)}
                              className="rounded border-border/50 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                            />
                            <span>🏢 Society Check</span>
                          </label>

                          <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isPoliceVerified}
                              onChange={() => handleVerifyToggle(w.id, "police", isPoliceVerified)}
                              className="rounded border-border/50 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                            />
                            <span>👮 Police Check</span>
                          </label>
                        </div>

                        {/* Remove worker */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveWorker(w.id, w.name)}
                          className="h-8 text-[10px] font-bold border-rose-500/30 text-rose-500 hover:bg-rose-500/5 bg-background flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {approvedWorkers.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground text-xs italic">
                    No approved community workers match your query.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PENDING APPROVALS TAB */}
        <TabsContent value="pending" className="space-y-6 outline-none">
          <Card className="border-border/50 bg-card rounded-2xl overflow-hidden shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10">
              <CardTitle className="text-base font-bold">Pending Registrations ({pendingWorkers.length})</CardTitle>
              <CardDescription>Approve or deny new workers requesting to register inside your society gate network</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20">
                {pendingWorkers.map((w) => (
                  <div key={w.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-secondary/10 transition-all text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{w.name}</h4>
                        <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[8px] font-extrabold uppercase py-0.5">Pending</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Category: <strong className="text-foreground">{w.workerCategory}</strong> | Contact: {w.phone} | Email: {w.email}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto border-t md:border-0 border-border/10 pt-2 md:pt-0 justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(w.id)}
                        className="h-8 px-4 text-[10px] font-bold bg-primary hover:bg-primary/95 text-white border-0 shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveWorker(w.id, w.name)}
                        className="h-8 px-4 text-[10px] font-bold border-rose-500/30 text-rose-500 hover:bg-rose-500/5 bg-background flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingWorkers.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground text-xs italic">
                    No pending helper registrations waiting for secretary approval.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS & REPORTS TAB */}
        <TabsContent value="stats" className="space-y-6 outline-none">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border/50 rounded-2xl bg-card shadow-sm p-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase">
                <span>Active Staff</span>
                <Users className="w-4.5 h-4.5 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-foreground">{stats?.workerCount || approvedWorkers.length}</h2>
            </Card>

            <Card className="border-border/50 rounded-2xl bg-card shadow-sm p-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase">
                <span>Total Bookings</span>
                <ClipboardCheck className="w-4.5 h-4.5 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-foreground">{stats?.bookingCount || 0}</h2>
            </Card>

            <Card className="border-border/50 rounded-2xl bg-card shadow-sm p-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase">
                <span>Completed Tickets</span>
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-emerald-500">{stats?.completedCount || 0}</h2>
            </Card>

            <Card className="border-border/50 rounded-2xl bg-card shadow-sm p-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase">
                <span>Active Queue</span>
                <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-amber-500">{stats?.pendingCount || 0}</h2>
            </Card>
          </div>

          {/* Recent Reviews Audit */}
          <Card className="border-border/50 bg-card rounded-2xl shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10">
              <CardTitle className="text-base font-bold">Citizen Reviews Moderation Feed</CardTitle>
              <CardDescription>Audit citizen reviews to ensure comments comply with complex community guidelines</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20">
                {stats?.recentReviews?.map((rv: any) => (
                  <div key={rv.id} className="p-5 flex justify-between items-start gap-4 hover:bg-secondary/10 transition-all text-xs">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground">{rv.resident?.name || "Resident"}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="font-semibold text-primary">{rv.worker?.name} ({rv.worker?.workerCategory})</span>
                        <div className="flex gap-0.5 shrink-0 ml-2">
                          {[...Array(rv.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-[11px] italic bg-secondary/10 p-3 rounded-xl border-l-2 border-primary">
                        "{rv.reviewText || "No comment."}"
                      </p>
                      <span className="text-[9px] text-muted-foreground block pt-0.5">Logged: {new Date(rv.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {(!stats?.recentReviews || stats.recentReviews.length === 0) && (
                  <div className="text-center py-16 text-muted-foreground text-xs italic">
                    No recent service reviews logged in complex feed.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
