"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Search, Clock, LogIn, LogOut, QrCode, Phone, Building2, Shield, UserX, Check
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
  const { visitors, submitVisitorRequest, checkInVisitor, checkOutVisitor, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      visitors: state.visitors,
      submitVisitorRequest: state.submitVisitorRequest,
      checkInVisitor: state.checkInVisitor,
      checkOutVisitor: state.checkOutVisitor,
      initializeDb: state.initializeDb,
    }))
  );
  const [mounted, setMounted] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("Personal Visit");
  const [expectedAt, setExpectedAt] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter State
  const [search, setSearch] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWorker = user?.role === "worker";

  // Filter visitors: residents only see guests visiting their flat
  const filteredVisitors = visitors.filter((v) => {
    if (v.portal !== "society") return false;
    if (!isWorker) {
      if (v.visitingUnit !== user?.unit) return false;
    }
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.visitingResident.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: filteredVisitors.length,
    checkedIn: filteredVisitors.filter((v) => v.status === "checked-in").length,
    expected: filteredVisitors.filter((v) => v.status === "expected").length,
    checkedOut: filteredVisitors.filter((v) => v.status === "checked-out").length,
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">
            Visitor Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Pre-approve and audit guests entering Tower Flats
          </p>
        </div>
        
        {!isWorker && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4 mr-2" /> Pre-Approve Visitor
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)]">Pre-Approve Visitor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePreApprove} className="space-y-4 mt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Visitor Name</label>
                  <Input placeholder="Enter visitor's full name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl h-11" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone Number</label>
                  <Input placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl h-11" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Purpose of Visit</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                  >
                    <option value="Personal Visit">Personal Visit</option>
                    <option value="Delivery - Amazon/Zomato">Food / Parcel Delivery</option>
                    <option value="Maintenance Service">Maintenance / Utility Service</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Expected Time</label>
                  <Input type="datetime-local" value={expectedAt} onChange={(e) => setExpectedAt(e.target.value)} className="rounded-xl h-11" required />
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-center">
                  <QrCode className="w-16 h-16 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    A secure pass QR code will be generated for the guest after registration.
                  </p>
                </div>
                <Button type="submit" className="w-full rounded-xl gradient-primary text-white border-0 h-11">
                  Generate Pass & Notify Security
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Today", value: stats.total, color: "#8b5cf6", icon: Shield },
          { label: "Checked In", value: stats.checkedIn, color: "#22c55e", icon: LogIn },
          { label: "Expected", value: stats.expected, color: "#3b82f6", icon: Clock },
          { label: "Checked Out", value: stats.checkedOut, color: "#64748b", icon: LogOut },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Actions */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search visitors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl h-11"
        />
      </div>

      {/* Visitor List */}
      <div className="space-y-3">
        {filteredVisitors.map((visitor) => {
          const config = statusConfig[visitor.status as keyof typeof statusConfig] || statusConfig.expected;
          const StatusIcon = config.icon;
          return (
            <Card key={visitor.id} className="border-border/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 shrink-0">
                      <AvatarFallback className="text-sm font-semibold bg-secondary">
                        {visitor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-bold text-foreground truncate">{visitor.name}</h3>
                        <Badge className={config.color} variant="outline">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                        <Badge className="bg-secondary text-foreground text-[9px] border-0">QR Pass: {visitor.id}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 font-semibold">
                          <Building2 className="w-3.5 h-3.5" />
                          Flat {visitor.visitingUnit} · {visitor.visitingResident}
                        </span>
                        <span>·</span>
                        <span>Purpose: {visitor.purpose}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Simulated Check In / Check Out buttons for easy testing */}
                    {visitor.status === "expected" && (
                      <Button
                        size="sm"
                        onClick={() => checkInVisitor(visitor.id)}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg h-8 px-2.5 border-0 text-xs flex items-center gap-1"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Check In
                      </Button>
                    )}
                    {visitor.status === "checked-in" && (
                      <Button
                        size="sm"
                        onClick={() => checkOutVisitor(visitor.id)}
                        className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg h-8 px-2.5 border-0 text-xs flex items-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Check Out
                      </Button>
                    )}

                    <div className="text-right ml-2">
                      {visitor.checkInTime && (
                        <p className="text-[10px] text-muted-foreground block">
                          Entered: {new Date(visitor.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                      {visitor.checkOutTime && (
                        <p className="text-[10px] text-muted-foreground block">
                          Left: {new Date(visitor.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                      {visitor.expectedAt && !visitor.checkInTime && (
                        <p className="text-[10px] text-blue-500 font-semibold block">
                          Expected: {new Date(visitor.expectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredVisitors.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm border rounded-2xl">No visitor logs found.</div>
        )}
      </div>
    </div>
  );
}
