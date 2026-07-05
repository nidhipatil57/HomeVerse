"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileCheck, Clock, Check, X, Search, ShieldCheck, Plus, Calendar, Users, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function WardenLeavesPage() {
  const { user, initialize } = useAuth();
  const { leaveRequests, submitLeaveRequest, approveRejectLeave, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      leaveRequests: state.leaveRequests || [],
      submitLeaveRequest: state.submitLeaveRequest,
      approveRejectLeave: state.approveRejectLeave,
      initializeDb: state.initializeDb,
    }))
  );
  
  const [mounted, setMounted] = useState(false);

  // Form State for Student
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [parentContact, setParentContact] = useState("");

  // Search filter (Warden only)
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWarden = user?.role === "warden";

  // Filter leaves based on role
  const filteredLeaves = useMemo(() => {
    return leaveRequests.filter((l) => {
      if (!isWarden) {
        return l.studentId === user?.id;
      }
      // Warden see search query results
      const matchesSearch = l.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.reason.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [leaveRequests, isWarden, user, searchQuery]);

  const pendingLeaves = filteredLeaves.filter((l) => l.status === "pending");
  const historyLeaves = filteredLeaves.filter((l) => l.status !== "pending");

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !fromDate || !toDate || !parentContact) return;

    submitLeaveRequest({
      studentId: user?.id || "student-user",
      studentName: user?.name || "Aarav Mehta",
      room: `${user?.unit || "204"} (${user?.building || "Block B"})`,
      parentContact,
      reason,
      fromDate,
      toDate
    });

    setReason("");
    setFromDate("");
    setToDate("");
    setParentContact("");
    setDialogOpen(false);
    alert("Leave request submitted to warden for review!");
  };

  // --- WARDEN LEAVE CONTROL CENTER ---
  if (isWarden) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
              <FileCheck className="w-8 h-8 text-emerald-500" /> Student Leave Approvals
            </h1>
            <p className="text-muted-foreground mt-1">Review curfew check-ins, outstation requests, and parent emergency alerts</p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            {pendingLeaves.length} Pending Passes
          </Badge>
        </div>

        {/* Warden search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, room, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl h-11 text-xs"
          />
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          {/* Pending & History Outings */}
          <div className="md:col-span-8 space-y-5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Approval Queue</h3>
            
            <AnimatePresence mode="popLayout">
              {pendingLeaves.length === 0 ? (
                <div className="p-10 rounded-2xl border border-dashed border-border/60 text-center text-muted-foreground text-xs flex flex-col items-center justify-center gap-2">
                  <ShieldCheck className="w-8 h-8 text-green-500 bg-green-500/10 rounded-full p-1.5" />
                  No pending leaves to audit. All students accounted for.
                </div>
              ) : (
                pendingLeaves.map((req) => (
                  <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="p-4 rounded-xl border border-border/50 bg-secondary/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-sm">{req.studentName}</span>
                        <Badge variant="outline" className="text-[10px]">{req.room}</Badge>
                        <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] uppercase">
                          Parent: {req.parentContact}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-500" /> Outing: {req.fromDate} to {req.toDate}
                      </p>
                      <p className="text-muted-foreground italic leading-normal mt-1 bg-card p-3 rounded-xl border border-border/50">
                        &quot;{req.reason}&quot;
                      </p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto shrink-0 self-end sm:self-center">
                      <Button
                        size="sm"
                        onClick={() => {
                          approveRejectLeave(req.id, "approved");
                          alert(`Approved leave request for ${req.studentName}.`);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg h-9 border-0 px-3"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          approveRejectLeave(req.id, "rejected");
                          alert(`Rejected leave request for ${req.studentName}.`);
                        }}
                        variant="outline"
                        className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/5 rounded-lg h-9 px-3"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pt-3">Processed Roster History</h3>
            <div className="space-y-2">
              {historyLeaves.map((req) => (
                <Card key={req.id} className="border-border/50 opacity-80">
                  <CardContent className="p-4 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-foreground">{req.studentName}</span>
                      <p className="text-muted-foreground mt-0.5">Room: {req.room} • Outing: {req.fromDate} to {req.toDate}</p>
                    </div>
                    <Badge className={req.status === "approved" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"}>
                      {req.status.toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
              {historyLeaves.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground border rounded-xl">No historical records logged.</div>
              )}
            </div>
          </div>

          {/* Right Rules Card */}
          <div className="md:col-span-4 space-y-4 h-fit">
            <Card className="border-border/50 p-6 space-y-4">
              <h3 className="text-base font-bold font-[family-name:var(--font-heading)]">Curfew Protocols</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Approved outings will automatically sync with Gate security logs. If a student does not check back before 09:30 PM, they will flag as overdue.
              </p>
            </Card>

            <Card className="border-border/50 p-6 space-y-3">
              <h3 className="text-base font-bold font-[family-name:var(--font-heading)] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-500" /> Outstation Stats
              </h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Away Tonight:</span>
                  <span className="font-bold">{historyLeaves.filter(h => h.status === "approved").length} Students</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // --- STUDENT LEAVE PASS VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">My Outstation Leaves 📝</h1>
          <p className="text-muted-foreground mt-1">Submit leave passes for out-of-campus visits and curfew extensions</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                <Plus className="w-4 h-4 mr-2" /> Request Leave Pass
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)]">Apply for Outing Pass</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateLeave} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Departure Date</label>
                  <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Return Date</label>
                  <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Parent Contact Mobile</label>
                <Input placeholder="+91 99999 00000" value={parentContact} onChange={(e) => setParentContact(e.target.value)} className="h-10 text-xs rounded-xl" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Reason for Leave</label>
                <Textarea placeholder="e.g. Traveling home for weekend..." value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[80px] text-xs rounded-xl" required />
              </div>
              <Button type="submit" className="w-full h-11 gradient-primary text-white border-0 rounded-xl font-semibold text-xs mt-2">
                Submit Pass Request
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-4">
          <h2 className="text-base font-bold font-[family-name:var(--font-heading)]">My Leaves History</h2>
          <div className="space-y-3">
            {filteredLeaves.map((req) => (
              <Card key={req.id} className="border-border/50 hover:shadow-sm">
                <CardContent className="p-4 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">Outing Cycle: {req.fromDate} to {req.toDate}</span>
                      <Badge className={
                        req.status === "pending" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                        req.status === "approved" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                        "bg-red-500/10 text-red-500 border border-red-500/20"
                      }>
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground italic mt-1.5">&quot;{req.reason}&quot;</p>
                  </div>
                  {req.status === "approved" && (
                    <div className="text-center p-2 border border-dashed rounded-lg shrink-0">
                      <span className="text-[8px] text-muted-foreground leading-none block">Gate Code</span>
                      <span className="font-mono font-bold text-primary mt-0.5 text-xs">{req.id.slice(0, 5).toUpperCase()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {filteredLeaves.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-xs border rounded-xl">
                No leave requests filed yet.
              </div>
            )}
          </div>
        </div>

        <Card className="md:col-span-4 border-border/50 p-6 space-y-4 h-fit">
          <h3 className="text-base font-bold font-[family-name:var(--font-heading)]">Campus Outing Protocol</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please submit your outing pass at least 12 hours prior to departure. Present your Gate Code at the guard desk upon exit.
          </p>
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 text-[10px] text-muted-foreground rounded-xl flex items-start gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>Outing passes are strictly monitored. Curfew check back deadline is 09:30 PM.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
