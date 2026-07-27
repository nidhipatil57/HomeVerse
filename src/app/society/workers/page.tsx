"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Wrench, Search, Power, ShieldCheck, CheckCircle2, XCircle, Trash2, Edit2, Plus,
  Sliders, Star, Users, ClipboardCheck, BarChart3, AlertTriangle, ArrowRight,
  Clock, DollarSign, Mail, Phone, Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function WorkersDirectoryPage() {
  const { user, initialize } = useAuth();
  const {
    users,
    workerProfiles,
    verifyWorker,
    addStaticWorker,
    updateStaticWorker,
    deleteStaticWorker,
    fetchWorkerStats,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      users: state.users || [],
      workerProfiles: state.workerProfiles || [],
      verifyWorker: state.verifyWorker,
      addStaticWorker: state.addStaticWorker,
      updateStaticWorker: state.updateStaticWorker,
      deleteStaticWorker: state.deleteStaticWorker,
      fetchWorkerStats: state.fetchWorkerStats,
      initializeDb: state.initializeDb
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [workerSearch, setWorkerSearch] = useState("");
  const [stats, setStats] = useState<any>(null);

  // Manager Modal states
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);
  const [workerForm, setWorkerForm] = useState({
    name: "",
    email: "",
    phone: "",
    workerCategory: "Electrician",
    experience: "3 years",
    visitCharge: "150",
    workingHoursStart: "09:00",
    workingHoursEnd: "18:00",
    isVerified: true,
    isSocietyVerified: true,
    isPoliceVerified: true,
    availability: "Available"
  });

  useEffect(() => {
    initialize();
    initializeDb();
    
    // Fetch stats
    fetchWorkerStats()
      .then(data => setStats(data))
      .catch(() => {});

    setMounted(true);
  }, [initialize, initializeDb, fetchWorkerStats]);

  const reloadStats = () => {
    fetchWorkerStats()
      .then(data => setStats(data))
      .catch(() => {});
  };

  const isManager = user?.role === "manager";
  const isSecretary = user?.role === "secretary" || user?.role === "admin";

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
      await deleteStaticWorker(workerId);
      alert("Worker removed successfully.");
      reloadStats();
    } catch (e) {
      alert("Failed to remove worker.");
    }
  };

  const handleOpenAddModal = () => {
    setEditingWorker(null);
    setWorkerForm({
      name: "",
      email: "",
      phone: "",
      workerCategory: "Electrician",
      experience: "3 years",
      visitCharge: "150",
      workingHoursStart: "09:00",
      workingHoursEnd: "18:00",
      isVerified: true,
      isSocietyVerified: true,
      isPoliceVerified: true,
      availability: "Available"
    });
    setShowWorkerModal(true);
  };

  const handleOpenEditModal = (w: any) => {
    const profile = workerProfiles.find(p => p.workerId === w.id);
    setEditingWorker(w);
    setWorkerForm({
      name: w.name || "",
      email: w.email || "",
      phone: w.phone || "",
      workerCategory: w.workerCategory || "Electrician",
      experience: w.experience || "3 years",
      visitCharge: w.visitCharge?.toString() || "150",
      workingHoursStart: "09:00",
      workingHoursEnd: "18:00",
      isVerified: profile?.workerProfile?.isVerified ?? true,
      isSocietyVerified: profile?.workerProfile?.isSocietyVerified ?? true,
      isPoliceVerified: profile?.workerProfile?.isPoliceVerified ?? true,
      availability: w.availability || "Available"
    });
    setShowWorkerModal(true);
  };

  const handleSaveWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        await updateStaticWorker(editingWorker.id, workerForm);
        alert("Worker details updated!");
      } else {
        await addStaticWorker(workerForm);
        alert("Static worker added successfully!");
      }
      setShowWorkerModal(false);
      reloadStats();
    } catch (err: any) {
      alert("Failed to save worker: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">Worker Directory 🛠️</h1>
          <p className="text-muted-foreground mt-1">
            {isManager
              ? "Maintain verified workers, configure availability, set charges, and upload verification records."
              : "Review credentials, approve registrations, and audit service stats."}
          </p>
        </div>
        {isManager && (
          <Button onClick={handleOpenAddModal} className="gradient-primary text-white border-0 rounded-xl h-10 font-semibold text-xs flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Verified Worker
          </Button>
        )}
      </div>

      <Tabs defaultValue="roster" className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[500px] h-12 bg-secondary/30 rounded-2xl p-1 mb-6">
          <TabsTrigger value="roster" className="rounded-xl text-xs font-bold transition-all data-[state=active]:gradient-primary data-[state=active]:text-white">
            Active Directory ({approvedWorkers.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-xl text-xs font-bold transition-all data-[state=active]:gradient-primary data-[state=active]:text-white">
            Pending Approval ({pendingWorkers.length})
          </TabsTrigger>
          <TabsTrigger value="stats" className="rounded-xl text-xs font-bold transition-all data-[state=active]:gradient-primary data-[state=active]:text-white">
            Roster Analytics
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
              <CardTitle className="text-base font-bold">Gated Complex Workers Directory</CardTitle>
              <CardDescription>Verified helpers and vendor staff active in complex directory</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20">
                {approvedWorkers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No approved workers found.
                  </div>
                ) : (
                  approvedWorkers.map((w) => {
                    const profile = workerProfiles.find(p => p.workerId === w.id);
                    const isSocietyVerified = profile?.isSocietyVerified || false;
                    const isPoliceVerified = profile?.isPoliceVerified || false;

                    return (
                      <div key={w.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-secondary/10 transition-all text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-foreground">{w.name}</h4>
                            <Badge variant="outline" className="text-[8px] font-extrabold uppercase py-0.5 px-2 rounded-md bg-secondary/40 text-muted-foreground border-border/30">
                              {w.workerCategory}
                            </Badge>
                            <Badge className={w.availability === "Available" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}>
                              {w.availability || "Available"}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-3">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {w.phone}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Exp: {w.experience || "3 yrs"}</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Visit: ₹{w.visitCharge || "150"}</span>
                          </p>
                          <div className="flex gap-2 pt-1.5">
                            {isSocietyVerified && <Badge className="bg-blue-500/10 text-blue-600 text-[8px] px-1.5 py-0.5">🏢 Society Checked</Badge>}
                            {isPoliceVerified && <Badge className="bg-teal-500/10 text-teal-600 text-[8px] px-1.5 py-0.5">👮 Police Verified</Badge>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-4 pt-2 md:pt-0 w-full md:w-auto border-t md:border-0 border-border/15 justify-end">
                          {/* Trust Checkboxes */}
                          {(isSecretary || isManager) && (
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
                          )}

                          <div className="flex items-center gap-1.5">
                            {isManager && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEditModal(w)}
                                className="h-8 text-[10px] text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 className="w-3 h-3 mr-1" /> Edit
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveWorker(w.id, w.name)}
                              className="h-8 text-[10px] text-red-500 hover:bg-red-500/5"
                            >
                              <Trash2 className="w-3 h-3 mr-1" /> Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PENDING APPROVAL TAB */}
        <TabsContent value="pending" className="outline-none">
          <Card className="border-border/50 bg-card rounded-2xl overflow-hidden shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">Pending Registrations</CardTitle>
              <CardDescription>Verify registration applications and add them to active roster</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20">
                {pendingWorkers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No pending helper registrations at this time.
                  </div>
                ) : (
                  pendingWorkers.map((w) => (
                    <div key={w.id} className="p-5 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-foreground">{w.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Category: <strong>{w.workerCategory}</strong> | Phone: {w.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveWorker(w.id, w.name)}
                          className="h-8 text-[10px] text-red-500"
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(w.id)}
                          className="h-8 text-[10px] gradient-primary text-white border-0"
                        >
                          Approve & Roster
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STATS & REPORTS TAB */}
        <TabsContent value="stats" className="outline-none">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-bold">Directory Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs font-semibold text-muted-foreground">
                <div className="flex justify-between border-b border-border/35 pb-2">
                  <span>Total Registered Staff</span>
                  <span className="text-foreground font-bold">{stats?.totalWorkers || approvedWorkers.length}</span>
                </div>
                <div className="flex justify-between border-b border-border/35 pb-2">
                  <span>Total Job Bookings</span>
                  <span className="text-foreground font-bold">{stats?.totalBookings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Job Invoices</span>
                  <span className="text-foreground font-bold">{stats?.completedBookings || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-bold">Recent Customer Feedback</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/20 text-xs max-h-[300px] overflow-y-auto">
                  {!stats?.recentReviews || stats.recentReviews.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground italic">
                      No rating reviews logged in the database yet.
                    </div>
                  ) : (
                    stats.recentReviews.map((r: any) => (
                      <div key={r.id} className="p-3.5 space-y-1 hover:bg-secondary/5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-foreground">Flat {r.booking?.address} • {r.booking?.resident?.name}</span>
                          <span className="text-amber-500 font-bold flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-500" /> {r.rating}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">"{r.comment || "No review written"}"</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add / Edit Worker Dialog */}
      <Dialog open={showWorkerModal} onOpenChange={setShowWorkerModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">
              {editingWorker ? "Edit Roster Details" : "Add Verified Static Worker"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveWorkerSubmit} className="space-y-4 mt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Full Name</label>
                <Input
                  value={workerForm.name}
                  onChange={(e) => setWorkerForm(prev => ({ ...prev, name: e.target.value }))}
                  className="rounded-xl h-10"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Category</label>
                <select
                  value={workerForm.workerCategory}
                  onChange={(e) => setWorkerForm(prev => ({ ...prev, workerCategory: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs"
                >
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Gardener">Gardener</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Maid">Maid</option>
                  <option value="Cook">Cook</option>
                  <option value="Carpenter">Carpenter</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Phone Number</label>
                <Input
                  value={workerForm.phone}
                  onChange={(e) => setWorkerForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                  className="rounded-xl h-10"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Email Address</label>
                <Input
                  value={workerForm.email}
                  onChange={(e) => setWorkerForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="name@complex.com"
                  className="rounded-xl h-10"
                  type="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Experience</label>
                <Input
                  value={workerForm.experience}
                  onChange={(e) => setWorkerForm(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="e.g. 5 years"
                  className="rounded-xl h-10"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Visit Charge (₹)</label>
                <Input
                  value={workerForm.visitCharge}
                  onChange={(e) => setWorkerForm(prev => ({ ...prev, visitCharge: e.target.value }))}
                  type="number"
                  className="rounded-xl h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Roster Availability</label>
                <select
                  value={workerForm.availability}
                  onChange={(e) => setWorkerForm(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs"
                >
                  <option value="Available">Available (Green)</option>
                  <option value="Busy">Busy (Red)</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <div className="flex gap-2 items-center justify-around border border-border rounded-xl px-2 h-10 mt-5">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workerForm.isSocietyVerified}
                    onChange={(e) => setWorkerForm(prev => ({ ...prev, isSocietyVerified: e.target.checked }))}
                    className="rounded border-border focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span>🏢 Society</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={workerForm.isPoliceVerified}
                    onChange={(e) => setWorkerForm(prev => ({ ...prev, isPoliceVerified: e.target.checked }))}
                    className="rounded border-border focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span>👮 Police</span>
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowWorkerModal(false)} className="rounded-xl h-10">
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary text-white border-0 rounded-xl h-10 font-bold px-5">
                Save Worker
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
