"use client";

import { useState, useEffect, useMemo } from "react";
import { Shield, Clock, Check, X, Calendar, Search, LogIn, LogOut, Plus, Users, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const statusColors: Record<string, string> = {
  expected: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "checked-in": "bg-green-500/10 text-green-600 border-green-500/20",
  "checked-out": "bg-gray-500/10 text-gray-500 border border-gray-500/20",
  denied: "bg-red-500/10 text-red-600 border-red-500/20"
};

export default function HostelVisitorsPage() {
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

  // Form State for Student
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("Parent Dropoff");
  const [expectedAt, setExpectedAt] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Search filter
  const [search, setSearch] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWarden = user?.role === "warden";

  // Filter visitors
  const filteredVisitors = visitors.filter((v) => {
    if (v.portal !== "hostel") return false;

    // Student only sees guests visiting them
    if (!isWarden) {
      return v.visitingResident === user?.name || v.visitingUnit === user?.unit;
    }

    // Warden sees all matching search query
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.visitingResident.toLowerCase().includes(search.toLowerCase()) ||
      v.visitingUnit.includes(search);
    return matchesSearch;
  });

  const handleRequestVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !phone.trim() || !expectedAt) return;

    submitVisitorRequest({
      name: guestName,
      phone,
      purpose,
      visitingUnit: user?.unit || "204",
      visitingResident: user?.name || "Aarav Mehta",
      expectedAt: new Date(expectedAt).toISOString(),
      date: expectedAt.split("T")[0],
      portal: "hostel"
    });

    setGuestName("");
    setPhone("");
    setExpectedAt("");
    setDialogOpen(false);
    alert("Visitor pre-approval registered! Pass code generated.");
  };

  const stats = {
    total: filteredVisitors.length,
    checkedIn: filteredVisitors.filter(v => v.status === "checked-in").length,
    expected: filteredVisitors.filter(v => v.status === "expected").length,
    denied: filteredVisitors.filter(v => v.status === "denied").length,
  };

  // --- WARDEN VISITORS LEDGER VIEW ---
  if (isWarden) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" /> Warden Visitor Ledger
            </h1>
            <p className="text-muted-foreground mt-1">
              Check in expected parents/guests, log departures, and audit gated security logs
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Logs Today", value: stats.total, color: "#8b5cf6", icon: Users },
            { label: "Active Inside Hostel", value: stats.checkedIn, color: "#22c55e", icon: LogIn },
            { label: "Expected Arrivals", value: stats.expected, color: "#3b82f6", icon: Clock },
            { label: "Denials / Flags", value: stats.denied, color: "#ef4444", icon: Ban },
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, guest name, room number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl h-11 text-xs"
          />
        </div>

        {/* Visitor Cards */}
        <div className="grid gap-3">
          {filteredVisitors.map((v) => (
            <Card key={v.id} className="border-border/50 bg-card hover:shadow-sm">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground text-sm">{v.name}</span>
                      <span className="text-[10px] text-muted-foreground">({v.phone})</span>
                      <Badge className={statusColors[v.status] || "bg-secondary text-foreground"} variant="outline">
                        {v.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-0.5">
                      Visiting: <span className="font-semibold text-foreground">{v.visitingResident} (Room {v.visitingUnit})</span> • Purpose: {v.purpose}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Expected: {new Date(v.expectedAt || "").toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {v.status === "expected" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          checkInVisitor(v.id);
                          alert(`Checked-in guest ${v.name}`);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-9 border-0 px-3"
                      >
                        <LogIn className="w-3.5 h-3.5 mr-1" /> Check In
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          denyVisitorEntry(v.id, "Warden restriction");
                          alert(`Denied entry for guest ${v.name}`);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-9 border-0 px-3"
                      >
                        <Ban className="w-3.5 h-3.5 mr-1" /> Deny
                      </Button>
                    </>
                  )}
                  {v.status === "checked-in" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        checkOutVisitor(v.id);
                        alert(`Checked-out guest ${v.name}`);
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg h-9 border-0 px-3"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1" /> Log Checkout
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredVisitors.length === 0 && (
            <div className="text-center py-10 border border-dashed rounded-2xl text-muted-foreground">
              No visitor records logged today.
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- STUDENT VIEW (Pre-approve visitors and own logs) ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">My Visitors & Guest Passes 👥</h1>
          <p className="text-muted-foreground mt-1">Pre-approve parents or study friends for hostel entry gate check-in</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                <Plus className="w-4 h-4 mr-2" /> Pre-Register Guest
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)]">Pre-Register Guest</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRequestVisitor} className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Guest Full Name</label>
                <Input placeholder="Guest name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="h-10 text-xs rounded-xl" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Guest Mobile Number</label>
                <Input placeholder="+91 99999 00000" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 text-xs rounded-xl" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Expected Arrival Date & Time</label>
                <Input type="datetime-local" value={expectedAt} onChange={(e) => setExpectedAt(e.target.value)} className="h-10 text-xs rounded-xl" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Purpose of Visit</label>
                <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full h-10 px-3 border rounded-xl text-xs bg-card">
                  <option>Parent Visit / Drop-off</option>
                  <option>Local Guardian drop</option>
                  <option>Friend / Group Study</option>
                </select>
              </div>
              <Button type="submit" className="w-full h-10 gradient-primary text-white border-0 rounded-xl font-semibold text-xs mt-2">
                Generate Guest Pass OTP
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roster list */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)]">My Visitors Log (Room {user?.unit})</h2>
        <div className="grid gap-3">
          {filteredVisitors.map((v) => (
            <Card key={v.id} className="border-border/50 hover:shadow-sm">
              <CardContent className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground shrink-0 font-bold">
                    {v.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{v.name}</span>
                      <Badge className={statusColors[v.status] || "bg-secondary text-foreground"} variant="outline">
                        {v.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-0.5">Purpose: {v.purpose} • Mobile: {v.phone}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Expected: {new Date(v.expectedAt || "").toLocaleString()}</p>
                  </div>
                </div>

                {v.status === "expected" && (
                  <div className="p-2 border border-dashed rounded-lg text-center shrink-0">
                    <p className="text-[8px] text-muted-foreground leading-none">Retrieval OTP</p>
                    <span className="font-mono text-sm font-bold text-primary block mt-1">{v.qrCode || "4820"}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredVisitors.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-xs border rounded-xl">
              No guest passes requested yet for Room {user?.unit}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
