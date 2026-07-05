"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Search, Clock, LogIn, LogOut, QrCode, Phone, Building2, Shield, UserX, Check,
  UserCheck, Ban, Camera, Car, Calendar, BarChart3, Users, FileText, Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import type { VisitorStatus, Visitor } from "@/types";

const statusConfig: Record<VisitorStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  expected: { label: "Expected", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Clock },
  "checked-in": { label: "Checked In", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: LogIn },
  "checked-out": { label: "Checked Out", color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: LogOut },
  denied: { label: "Denied", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: UserX },
};

export default function VisitorsPage() {
  const { user, initialize } = useAuth();
  const {
    visitors,
    submitVisitorRequest,
    checkInVisitor,
    checkOutVisitor,
    denyVisitorEntry,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      visitors: state.visitors || [],
      submitVisitorRequest: state.submitVisitorRequest,
      checkInVisitor: state.checkInVisitor,
      checkOutVisitor: state.checkOutVisitor,
      denyVisitorEntry: state.denyVisitorEntry,
      initializeDb: state.initializeDb,
    }))
  );
  
  const [mounted, setMounted] = useState(false);

  // Form State for Resident (Pre-Approval) / Security (Walk-In)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("Personal Visit");
  const [expectedAt, setExpectedAt] = useState("");
  const [visitingUnit, setVisitingUnit] = useState("");
  const [visitingResident, setVisitingResident] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Security Deny State
  const [denyReason, setDenyReason] = useState("");
  const [denyId, setDenyId] = useState<string | null>(null);
  const [showDenyDialog, setShowDenyDialog] = useState(false);

  // Search filter
  const [search, setSearch] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isResident = user?.role === "resident";
  const isSecurity = user?.role === "security";
  const isSecretary = user?.role === "secretary";

  // Filter visitors dynamically based on role
  const filteredVisitors = visitors.filter((v) => {
    if (v.portal !== "society") return false;

    // Residents only see guests visiting their flat
    if (isResident) {
      if (v.visitingUnit !== user?.unit) return false;
    }
    // Security and Secretary see all visitor logs

    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.visitingResident.toLowerCase().includes(search.toLowerCase()) ||
      v.visitingUnit.includes(search);
    return matchesSearch;
  });

  // Calculate visitor stats
  const stats = {
    total: filteredVisitors.length,
    checkedIn: filteredVisitors.filter(v => v.status === "checked-in").length,
    expected: filteredVisitors.filter(v => v.status === "expected").length,
    denied: filteredVisitors.filter(v => v.status === "denied").length,
  };

  const handlePreApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !expectedAt) return;

    submitVisitorRequest({
      name,
      phone,
      purpose,
      visitingUnit: user?.unit || "A-301",
      visitingResident: user?.name || "Nidhi Kumar",
      expectedAt: new Date(expectedAt).toISOString(),
      date: expectedAt.split("T")[0],
      portal: "society"
    });

    setName("");
    setPhone("");
    setPurpose("Personal Visit");
    setExpectedAt("");
    setDialogOpen(false);
    alert("Guest pre-approved! Invite QR code generated.");
  };

  const handleRegisterWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !visitingUnit || !visitingResident) return;

    submitVisitorRequest({
      name,
      phone,
      purpose,
      visitingUnit,
      visitingResident,
      expectedAt: new Date().toISOString(),
      date: new Date().toISOString().split("T")[0],
      portal: "society"
    });

    // Check-in immediately
    setTimeout(() => {
      const added = useCommunityStore.getState().visitors.find(v => v.name === name && v.phone === phone);
      if (added) checkInVisitor(added.id);
    }, 100);

    setName("");
    setPhone("");
    setVisitingUnit("");
    setVisitingResident("");
    setDialogOpen(false);
    alert("Walk-in visitor registered and checked-in.");
  };

  const triggerDenyEntry = (id: string) => {
    setDenyId(id);
    setDenyReason("");
    setShowDenyDialog(true);
  };

  const submitDeny = (e: React.FormEvent) => {
    e.preventDefault();
    if (!denyId || !denyReason) return;
    denyVisitorEntry(denyId, denyReason);
    setDenyId(null);
    setShowDenyDialog(false);
    alert("Visitor entry denied.");
  };

  // --- SECURITY GATE OPERATIONS VIEW ---
  if (isSecurity) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
              <Shield className="w-8 h-8 text-red-500" /> Gate Guard Visitor Desk
            </h1>
            <p className="text-muted-foreground mt-1">Verify expected visitor codes, process walk-ins, and manage gate traffic logs</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="rounded-xl bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-500/25">
                  <Plus className="w-4 h-4 mr-2" /> Log Walk-In Visitor
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)]">Register Walk-in Guest</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRegisterWalkIn} className="space-y-4 mt-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Visitor Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 text-xs" required />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Phone Number</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 text-xs" required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Target Flat / Unit</label>
                    <Input placeholder="e.g. A-301" value={visitingUnit} onChange={(e) => setVisitingUnit(e.target.value)} className="h-10 text-xs" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Resident Name</label>
                    <Input placeholder="e.g. Nidhi" value={visitingResident} onChange={(e) => setVisitingResident(e.target.value)} className="h-10 text-xs" required />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Purpose of Entry</label>
                  <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full h-10 px-3 border rounded-xl text-xs bg-card">
                    <option>Delivery (Courier/Food)</option>
                    <option>Domestic Help / Maid</option>
                    <option>Personal Guest</option>
                    <option>Contractor Service (Plumber/AC)</option>
                  </select>
                </div>
                <Button type="submit" className="w-full h-10 bg-red-600 hover:bg-red-700 text-white border-0 rounded-xl font-semibold text-xs mt-2">
                  Verify & Check-In Entry
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Today's Total Entries", value: stats.total, color: "#3b82f6", icon: Users },
            { label: "Active Inside Complex", value: stats.checkedIn, color: "#22c55e", icon: LogIn },
            { label: "Expected Arrivals", value: stats.expected, color: "#f59e0b", icon: Clock },
            { label: "Total Denied Access", value: stats.denied, color: "#ef4444", icon: Ban },
          ].map((s) => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Search & Live Ledger */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search visitor logs, target unit, resident name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl h-11 text-xs"
            />
          </div>

          <div className="grid gap-3">
            {filteredVisitors.map((v) => {
              const config = statusConfig[v.status] || statusConfig.expected;
              const Icon = config.icon;
              return (
                <Card key={v.id} className="border-border/50 bg-card hover:shadow-md transition-all">
                  <CardContent className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarFallback className="gradient-primary text-white font-bold text-xs">
                          {v.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-sm">{v.name}</span>
                          <span className="text-[10px] text-muted-foreground">({v.phone})</span>
                          <Badge className={config.color} variant="outline">
                            <Icon className="w-3 h-3 mr-1" /> {config.label}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          Visiting: <span className="font-semibold text-foreground">Flat {v.visitingUnit} ({v.visitingResident})</span> • Purpose: {v.purpose}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Expected: {new Date(v.expectedAt || "").toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Security Action Buttons */}
                    <div className="flex items-center gap-2">
                      {v.status === "expected" && (
                        <>
                          <Button
                            onClick={() => checkInVisitor(v.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-9 border-0 px-3"
                          >
                            <LogIn className="w-3.5 h-3.5 mr-1" /> Check In
                          </Button>
                          <Button
                            onClick={() => triggerDenyEntry(v.id)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-9 border-0 px-3"
                          >
                            <Ban className="w-3.5 h-3.5 mr-1" /> Deny Entry
                          </Button>
                        </>
                      )}
                      {v.status === "checked-in" && (
                        <Button
                          onClick={() => checkOutVisitor(v.id)}
                          size="sm"
                          variant="outline"
                          className="border-gray-500/20 hover:bg-secondary text-foreground rounded-lg h-9 px-3"
                        >
                          <LogOut className="w-3.5 h-3.5 mr-1" /> Log Checked Out
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredVisitors.length === 0 && (
              <div className="text-center py-10 border border-dashed rounded-2xl text-muted-foreground">
                No active visitors registered for today.
              </div>
            )}
          </div>
        </div>

        {/* Deny Entry Dialog */}
        <Dialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)]">Confirm Access Denial</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitDeny} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Reason for Entry Denial</label>
                <select
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  className="w-full h-11 px-3 border rounded-xl bg-card text-xs"
                  required
                >
                  <option value="">Choose Reason</option>
                  <option>Incorrect Flat Code / OTP mismatch</option>
                  <option>Uncooperative visitor behaviour</option>
                  <option>Suspicious items found in cargo check</option>
                  <option>Resident refused entry confirmation</option>
                </select>
              </div>
              <Button type="submit" className="w-full h-11 bg-red-600 hover:bg-red-700 text-white border-0 rounded-xl font-semibold text-xs">
                Log Denial Flag & Alert Admin
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- SECRETARY VIEW (Visitor Analytics & Complete Logs) ---
  if (isSecretary) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Visitor Registry Archives 🏢</h1>
            <p className="text-muted-foreground mt-1">Audit guest logs, delivery traffic densities, and access permissions</p>
          </div>
          <Button variant="outline" className="rounded-xl text-xs h-10">
            <Download className="w-4 h-4 mr-1.5" /> Export Visitor Logs
          </Button>
        </div>

        {/* Analytics Breakdown */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Average Visitors / Day</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-primary">34.2</p>
              <span className="text-[10px] text-green-500 font-semibold flex items-center gap-1 mt-1">
                +4.2% increase since last month
              </span>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Delivery Traffic Share</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-emerald-500">62%</p>
              <span className="text-[10px] text-muted-foreground mt-1 block">Amazon, Flipkart, Zomato Courier volumes</span>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Access Security Alert Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-red-500">1.8%</p>
              <span className="text-[10px] text-red-500 font-semibold mt-1 block">Gate denials and security flags</span>
            </CardContent>
          </Card>
        </div>

        {/* Master Ledger List */}
        <Card className="border-border/50">
          <CardHeader className="pb-3 border-b border-border/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold">Society Access Logs</CardTitle>
                <CardDescription>Audited timeline of gate entries</CardDescription>
              </div>
              <Input
                placeholder="Search flat number, visitor name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 h-9 text-xs rounded-lg"
              />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredVisitors.map((v) => {
                const config = statusConfig[v.status] || statusConfig.expected;
                return (
                  <div key={v.id} className="p-3 rounded-xl border border-border/50 bg-secondary/5 flex items-center justify-between text-xs gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{v.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">({v.id})</span>
                        <Badge className={config.color} variant="outline">
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-0.5">
                        Visiting Flat {v.visitingUnit} ({v.visitingResident}) • Reason: {v.purpose}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">Expected: {new Date(v.expectedAt || "").toLocaleDateString()}</p>
                      <p className="text-[10px] text-muted-foreground">Mobile: {v.phone}</p>
                    </div>
                  </div>
                );
              })}
              {filteredVisitors.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">No visitor logs found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- RESIDENT VIEW (Pre-approval guest tickets) ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">My Visitors & Guest Passes 👥</h1>
          <p className="text-muted-foreground mt-1">Pre-approve friends, couriers, or helper entry keys, and check recent visit logs</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                <Plus className="w-4 h-4 mr-2" /> Pre-Approve Guest
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)]">Create Pre-Approved Invite</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePreApprove} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Guest Name</label>
                <Input placeholder="Guest full name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl text-xs" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Guest Mobile Number</label>
                <Input placeholder="Guest mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 rounded-xl text-xs" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Expected Arrival Date & Time</label>
                <Input type="datetime-local" value={expectedAt} onChange={(e) => setExpectedAt(e.target.value)} className="h-11 rounded-xl text-xs" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Purpose of Visit</label>
                <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full h-11 px-3 border rounded-xl text-xs bg-card">
                  <option>Personal Guest / Family</option>
                  <option>Delivery Courier / Parcel</option>
                  <option>Technician / Home Maintenance</option>
                </select>
              </div>
              <Button type="submit" className="w-full h-11 gradient-primary text-white border-0 rounded-xl font-semibold text-xs mt-2">
                Generate Gate Pass OTP & QR
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "My Total Expected Guests", value: stats.expected, color: "#3b82f6" },
          { label: "Guests Currently Checked In", value: stats.checkedIn, color: "#22c55e" },
          { label: "Historical Visitor Logs", value: stats.total, color: "#8b5cf6" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1 font-[family-name:var(--font-heading)]" style={{ color: s.color }}>
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pre-approved list for unit */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)]">My Visitors Log (Flat {user?.unit || "A-301"})</h2>
        <div className="grid gap-3">
          {filteredVisitors.map((v) => {
            const config = statusConfig[v.status] || statusConfig.expected;
            const Icon = config.icon;
            return (
              <Card key={v.id} className="border-border/50 hover:shadow-sm">
                <CardContent className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground shrink-0 font-bold text-xs">
                      {v.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{v.name}</span>
                        <Badge className={config.color} variant="outline">
                          <Icon className="w-3 h-3 mr-1" /> {config.label}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-0.5">Purpose: {v.purpose} • Mobile: {v.phone}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Expected: {new Date(v.expectedAt || "").toLocaleString()}</p>
                    </div>
                  </div>

                  {v.status === "expected" && (
                    <div className="p-2 border border-dashed rounded-lg text-center shrink-0">
                      <p className="text-[8px] text-muted-foreground leading-none">Gate Code OTP</p>
                      <span className="font-mono text-sm font-bold text-primary block mt-1">{v.qrCode || "4820"}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {filteredVisitors.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm border rounded-2xl">
              No expected visitor requests logged for Flat {user?.unit}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
