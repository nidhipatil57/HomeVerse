"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileCheck, Clock, Check, X, Search, ShieldCheck, Plus, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";

export default function WardenLeavesPage() {
  const { user, initialize } = useAuth();
  const { leaveRequests, submitLeaveRequest, approveRejectLeave, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      leaveRequests: state.leaveRequests,
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

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWarden = user?.role === "warden";

  // Filter leaves
  const filteredLeaves = leaveRequests.filter((l) => {
    if (!isWarden) {
      return l.studentId === user?.id;
    }
    return true;
  });

  const pendingLeaves = filteredLeaves.filter((l) => l.status === "pending");
  const historyLeaves = filteredLeaves.filter((l) => l.status !== "pending");

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !fromDate || !toDate || !parentContact) return;

    submitLeaveRequest({
      studentId: user?.id || "user-student-1",
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
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">Leave & Outing Approvals</h1>
          <p className="text-muted-foreground mt-1">
            {isWarden ? "Audit student gate pass permissions and outstation notifications" : "Submit outstation leaves and curfew checks bypass requests"}
          </p>
        </div>

        {!isWarden && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4 mr-2" /> Request Outstation Leave
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)]">Submit Outing Pass</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateLeave} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Departure Date</label>
                    <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-10 text-xs rounded-lg animate-none" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Return Date</label>
                    <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-10 text-xs rounded-lg animate-none" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Parent Emergency Mobile</label>
                  <Input placeholder="+91 99999 XXXXX" value={parentContact} onChange={(e) => setParentContact(e.target.value)} className="h-10 text-xs rounded-lg animate-none" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Reason for Leave</label>
                  <Textarea placeholder="Describe the purpose of your trip..." value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-xl min-h-[80px]" required />
                </div>
                <Button type="submit" className="w-full rounded-xl gradient-primary text-white border-0 h-11">
                  Submit Gate Pass Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Active Outing Queue</h3>
          
          <AnimatePresence mode="popLayout">
            {pendingLeaves.length === 0 ? (
              <div className="p-10 rounded-3xl border border-dashed border-border/60 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                <ShieldCheck className="w-8 h-8 text-green-500 bg-green-500/10 rounded-full p-1.5" />
                No pending requests. All outings accounted for.
              </div>
            ) : (
              pendingLeaves.map((req) => (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="p-4 rounded-2xl border border-border/50 bg-secondary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{req.studentName}</span>
                      <Badge variant="outline" className="text-[10px]">{req.room}</Badge>
                      <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] uppercase">
                        Emergency Contact: {req.parentContact}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> Outing: {req.fromDate} to {req.toDate}
                    </p>
                    <p className="text-xs text-muted-foreground italic leading-normal mt-1 bg-card p-3 rounded-xl border border-border/50">
                      &quot;{req.reason}&quot;
                    </p>
                  </div>

                  {isWarden && (
                    <div className="flex gap-2 w-full md:w-auto shrink-0 self-end md:self-center">
                      <Button
                        size="sm"
                        onClick={() => approveRejectLeave(req.id, "approved")}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg h-9 border-0"
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => approveRejectLeave(req.id, "rejected")}
                        variant="outline"
                        className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-lg h-9"
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>

          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pt-4">History Log</h3>
          <div className="space-y-2">
            {historyLeaves.map((req) => (
              <Card key={req.id} className="border-border/50 opacity-70">
                <CardContent className="p-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-foreground">{req.studentName}</span>
                    <p className="text-muted-foreground mt-0.5">Room: {req.room} • Period: {req.fromDate} to {req.toDate}</p>
                  </div>
                  <Badge className={req.status === "approved" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}>
                    {req.status.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            ))}
            {historyLeaves.length === 0 && (
              <div className="text-center py-4 text-xs text-muted-foreground">No historical records available.</div>
            )}
          </div>
        </div>

        <Card className="md:col-span-4 border-border/50 p-6 space-y-4 h-fit">
          <h3 className="text-lg font-bold font-[family-name:var(--font-heading)]">Curfew Rules</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All outings must be approved by the warden before 06:00 PM on the date of departure. Gate security checks student QR passes at the main exit.
          </p>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs">
            <span className="font-bold text-emerald-500 block mb-0.5">Note:</span>
            Curfew timing is 09:30 PM. Late check-ins are flagged in student directory logs.
          </div>
        </Card>
      </div>
    </div>
  );
}
