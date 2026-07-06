"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Clock, LogIn, LogOut, Check, UserCheck, ShieldClose, Ban, Plus, Shield, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecurityVisitorDeskPage() {
  const { user, initialize } = useAuth();
  const {
    visitors, checkInVisitor, checkOutVisitor, denyVisitorEntry,
    submitVisitorRequest, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      visitors: state.visitors || [],
      checkInVisitor: state.checkInVisitor,
      checkOutVisitor: state.checkOutVisitor,
      denyVisitorEntry: state.denyVisitorEntry,
      submitVisitorRequest: state.submitVisitorRequest,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Walk-in form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("Personal Visit");
  const [visitingUnit, setVisitingUnit] = useState("");
  const [visitingResident, setVisitingResident] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Deny modal state
  const [denyReason, setDenyReason] = useState("");
  const [activeDenyId, setActiveDenyId] = useState("");
  const [showDenyModal, setShowDenyModal] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const pendingVisitorApprovals = visitors.filter(v => v.portal === "society" && v.status === "expected");
  const checkedInVisitors = visitors.filter(v => v.portal === "society" && v.status === "checked-in");

  const filteredExpected = pendingVisitorApprovals.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.visitingUnit.includes(searchQuery)
  );

  const handleOpenDeny = (id: string) => {
    setActiveDenyId(id);
    setDenyReason("");
    setShowDenyModal(true);
  };

  const submitDeny = () => {
    if (!denyReason) return;
    denyVisitorEntry(activeDenyId, denyReason);
    setShowDenyModal(false);
    alert("Visitor entry denied.");
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
    setPurpose("Personal Visit");
    setVisitingUnit("");
    setVisitingResident("");
    setDialogOpen(false);
    alert("Walk-in visitor checked in successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            Visitor Desk 👥
          </h1>
          <p className="text-muted-foreground mt-1">
            Audit expected pre-approvals, register walk-in guests, and log departures at the guard post
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-xl gradient-primary text-white border-0 shadow-md">
                <Plus className="w-4 h-4 mr-2" /> Register Walk-In Guest
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)]">Register Walk-In Guest</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRegisterWalkIn} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Guest Full Name</label>
                <Input placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} className="h-10 text-xs rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone Number</label>
                  <Input placeholder="e.g. 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Purpose</label>
                  <Input placeholder="e.g. Delivery, Guest" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Visiting Flat</label>
                  <Input placeholder="e.g. A-301" value={visitingUnit} onChange={(e) => setVisitingUnit(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Visiting Resident</label>
                  <Input placeholder="e.g. Nidhi Kumar" value={visitingResident} onChange={(e) => setVisitingResident(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
              </div>
              <Button type="submit" className="w-full h-10 gradient-primary text-white border-0 rounded-xl font-semibold text-xs mt-2">
                Check In Walk-In
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search pre-approved expected guests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 rounded-xl h-11 text-xs"
        />
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Expected Visitors Queue */}
        <Card className="lg:col-span-7 border-border/50 flex flex-col h-[550px] overflow-hidden">
          <CardHeader className="border-b border-border/20 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-blue-500" />
              Pre-Approved Expected Guests ({filteredExpected.length})
            </CardTitle>
            <CardDescription>Verifying resident pre-approvals and invite codes</CardDescription>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredExpected.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                <Check className="w-8 h-8 text-green-500 bg-green-500/10 rounded-full p-1.5" />
                No expected visitors queued for today.
              </div>
            ) : (
              filteredExpected.map((v) => (
                <div key={v.id} className="p-4 rounded-2xl border border-border/50 bg-secondary/15 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{v.name}</h4>
                      <span className="text-[10px] text-muted-foreground font-semibold">Phone: {v.phone}</span>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-bold">
                      Pre-Approved
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-card border border-border/30">
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Visiting Flat</span>
                      <span className="font-bold text-foreground">{v.visitingUnit} ({v.visitingResident})</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Purpose / Vehicle</span>
                      <span className="font-bold text-foreground truncate block">{v.purpose} {v.vehicleNumber && `(${v.vehicleNumber})`}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1.5">
                    <Button
                      size="sm"
                      onClick={() => {
                        checkInVisitor(v.id);
                        alert("Visitor checked in.");
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-9 border-0 text-xs font-semibold shadow-sm"
                    >
                      Check In Visitor
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDeny(v.id)}
                      className="border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl h-9 text-xs"
                    >
                      Deny Access
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right: Checked In Visitors List */}
        <Card className="lg:col-span-5 border-border/50 flex flex-col h-[550px] overflow-hidden">
          <CardHeader className="border-b border-border/20 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <LogIn className="w-4.5 h-4.5 text-green-500" />
              Active Guests Inside ({checkedInVisitors.length})
            </CardTitle>
            <CardDescription>Guests currently inside the society premises</CardDescription>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {checkedInVisitors.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No active guests inside complex currently.
              </div>
            ) : (
              checkedInVisitors.map((v) => (
                <div key={v.id} className="p-3.5 rounded-xl border border-border/50 bg-secondary/5 flex items-center justify-between text-xs hover:bg-secondary/15 transition-colors">
                  <div>
                    <h4 className="font-bold">{v.name}</h4>
                    <p className="text-[10px] text-muted-foreground">Visiting Flat {v.visitingUnit} • Purpose: {v.purpose}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Checked In: {v.expectedAt ? new Date(v.expectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      checkOutVisitor(v.id);
                      alert("Visitor checked out.");
                    }}
                    className="border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 rounded-xl h-8 text-[10px] font-semibold flex items-center gap-1 shrink-0"
                  >
                    <LogOut className="w-3 h-3" /> Log Exit
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deny Dialog */}
      <Dialog open={showDenyModal} onOpenChange={setShowDenyModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">Flag and Deny Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Reason for denial</label>
              <Input
                placeholder="e.g. Unverified entry code, Resident requested block"
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowDenyModal(false)} className="rounded-xl text-xs h-9">Cancel</Button>
              <Button onClick={submitDeny} className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs h-9">Flag Denied Entry</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
