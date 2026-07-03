"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  Users, Bed, MessageSquareWarning, UtensilsCrossed, WashingMachine, Shield, Package, FileCheck, ClipboardCheck, AlertTriangle, Key, Check, X, Clock, Plus, Bot, TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import Link from "next/link";
import dynamic from "next/dynamic";

const HostelMessCrowdChart = dynamic(() => import("@/components/charts/HostelMessCrowdChart"), {
  ssr: false,
  loading: () => <div className="h-[250px] flex items-center justify-center bg-secondary/10 animate-pulse rounded-xl" />
});

const HostelComplaintsLineChart = dynamic(() => import("@/components/charts/HostelComplaintsLineChart"), {
  ssr: false,
  loading: () => <div className="h-[250px] flex items-center justify-center bg-secondary/10 animate-pulse rounded-xl" />
});

export function HostelWardenDashboard({ warden }: { warden: any }) {
  const { leaveRequests, approveRejectLeave, complaints, laundrySlots, visitors, parcels } = useCommunityStore(
    useShallow((state) => ({
      leaveRequests: state.leaveRequests,
      approveRejectLeave: state.approveRejectLeave,
      complaints: state.complaints,
      laundrySlots: state.laundrySlots,
      visitors: state.visitors,
      parcels: state.parcels,
    }))
  );

  const handleApproveLeave = (id: string) => {
    approveRejectLeave(id, "approved");
  };

  const handleRejectLeave = (id: string) => {
    approveRejectLeave(id, "rejected");
  };

  const activeLeaves = leaveRequests.filter(l => l.status === "pending");
  const pendingLeavesCount = activeLeaves.length;

  const totalStudents = 340; // Hardcoded total size
  const occupiedRooms = 165;
  const vacantRooms = 15;

  const pendingComplaintsCount = complaints.filter(
    (c) => c.portal === "hostel" && c.status !== "resolved" && c.status !== "closed"
  ).length;

  const bookedLaundrySlotsCount = laundrySlots.filter(s => s.status === "booked").length;
  const totalLaundryCapacity = laundrySlots.length || 1;
  const laundryLoadPercentage = Math.round((bookedLaundrySlotsCount / totalLaundryCapacity) * 100);

  const visitorsTodayCount = visitors.filter(
    (v) => v.portal === "hostel" && (v.status === "checked-in" || v.status === "expected")
  ).length;

  const pendingParcelsCount = parcels.filter(p => p.portal === "hostel" && p.status === "received").length;

  const wardenStats = [
    { label: "Total Students Registered", value: totalStudents, icon: Users, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Rooms Occupancy Rate", value: `${occupiedRooms} / ${occupiedRooms + vacantRooms}`, icon: Bed, color: "text-blue-500 bg-blue-500/10" },
    { label: "Hostel Open Complaints", value: pendingComplaintsCount, icon: MessageSquareWarning, color: "text-red-500 bg-red-500/10" },
    { label: "Mess Attendance (Breakfast)", value: "290 Checked In", icon: UtensilsCrossed, color: "text-amber-500 bg-amber-500/10" },
    { label: "Active Laundry Load", value: `${laundryLoadPercentage}% Capacity`, icon: WashingMachine, color: "text-purple-500 bg-purple-500/10" },
    { label: "Expected Visitors Logs", value: visitorsTodayCount, icon: Shield, color: "text-cyan-500 bg-cyan-500/10" },
    { label: "Parcels in Locker Room", value: `${pendingParcelsCount} Awaiting`, icon: Package, color: "text-orange-500 bg-orange-500/10" },
    { label: "Leave Requests Pending", value: pendingLeavesCount, icon: FileCheck, color: "text-pink-500 bg-pink-500/10" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/30 pb-5"
      >
        <div>
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-widest">
            Hostel Command Center • Block Oversight: {warden?.assignedBlock || "Block A & B"}
          </span>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] mt-1 flex items-center gap-2">
            Warden Dashboard
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-sans font-medium">
              Employee ID: {warden?.employeeId || "WDN-1082"}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, Warden <span className="font-semibold text-foreground">{warden?.name || "Dr. Pillai"}</span>. Manage operations and student requests.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-amber-500/15 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <ClipboardCheck className="w-3.5 h-3.5" />
            {pendingLeavesCount} Pending Leave Request{pendingLeavesCount !== 1 ? "s" : ""}
          </Badge>
          <Badge className="bg-red-500/15 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
            No Critical Incidents
          </Badge>
        </div>
      </motion.div>

      {/* Grid of Command Center Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {wardenStats.map((stat, i) => (
          <Card key={i} className="border-border/50 hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold font-[family-name:var(--font-heading)] truncate">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground truncate">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leave Approval Widget & Room Allocation */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Leave Requests Approvals */}
        <Card className="lg:col-span-7 border-border/50">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-500" />
              Leave & Outing Requests Queue
            </CardTitle>
            <CardDescription>Review and approve student outstation/leave requests</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {activeLeaves.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                  <Check className="w-8 h-8 text-green-500 bg-green-500/10 rounded-full p-1.5" />
                  No pending leave requests in queue.
                </div>
              ) : (
                activeLeaves.map((req) => (
                  <motion.div
                    key={req.id}
                    layout
                    exit={{ opacity: 0, x: -10 }}
                    className="p-4 rounded-2xl border border-border/50 bg-secondary/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{req.studentName}</span>
                        <Badge variant="outline" className="text-[9px]">Room: {req.room}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Outing Period: {req.fromDate} to {req.toDate}
                      </p>
                      <p className="text-xs text-muted-foreground italic leading-normal mt-1 bg-card p-2 rounded-lg border border-border/40">
                        &quot;{req.reason}&quot;
                      </p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto self-end md:self-center shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleApproveLeave(req.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 h-9 border-0"
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRejectLeave(req.id)}
                        variant="outline"
                        className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-lg px-3 py-1.5 h-9"
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Room Vacancy Allocation Block */}
        <Card className="lg:col-span-5 border-border/50 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-500" />
              Room Allocation & Vacancies
            </CardTitle>
            <CardDescription>Beds distribution details by Block</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 flex-1">
            {[
              { block: "Block A (Warden Block)", occupied: 56, capacity: 60, progress: 93, color: "bg-emerald-500" },
              { block: "Block B (Junior Block)", occupied: 78, capacity: 80, progress: 97, color: "bg-blue-500" },
              { block: "Block C (PG Wing)", occupied: 31, capacity: 40, progress: 77, color: "bg-purple-500" }
            ].map((b, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground">{b.block}</span>
                  <span className="text-muted-foreground">{b.occupied} / {b.capacity} Beds ({b.progress}%)</span>
                </div>
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full ${b.color}`} style={{ width: `${b.progress}%` }} />
                </div>
              </div>
            ))}

            <div className="p-3.5 rounded-2xl bg-secondary/30 text-xs border border-border/30 mt-4">
              <span className="font-semibold text-foreground">Vacancy Status:</span>
              <p className="text-muted-foreground">Block C PG Wing has 9 empty beds available for room transfer requests.</p>
            </div>
          </CardContent>
          <CardContent className="pt-0 pb-6">
            <Link href="/hostel/rooms">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 border-0">
                <Plus className="w-4 h-4 mr-2" /> Allocate New Room / Transfer
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* AI Warden Predictive Insights Panel */}
      <Card className="border-border/50 bg-gradient-to-r from-emerald-500/10 via-background to-secondary/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 shadow-inner">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <h3 className="font-extrabold text-base text-foreground flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
                  AI Operations & Resource Insights
                  <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-mono font-semibold">PREDICTIVE</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Machine learning forecasts based on historical hostel schedules and resource data.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-2">
                {[
                  { title: "Mess Demand Forecast", desc: "Predicted dinner attendance today is 315. Prepare additional dal/rice portions to prevent 15kg potential food waste.", color: "border-amber-500/20 bg-amber-500/[0.02]" },
                  { title: "Laundry Peak Alert", desc: "Sunday 2 PM - 6 PM represents peak wash queue (average waiting 45 mins). Suggest sending notice to use weekday slots.", color: "border-blue-500/20 bg-blue-500/[0.02]" },
                  { title: "Maintenance Alert", desc: "Washing Machine #2 in Block B shows motor heat fluctuations. Predicts failure in 3 days. Service ticket recommended.", color: "border-red-500/20 bg-red-500/[0.02]" }
                ].map((insight, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border text-xs leading-relaxed flex flex-col gap-1 bg-background/50 ${insight.color}`}>
                    <span className="font-bold text-foreground">{insight.title}</span>
                    <span className="text-muted-foreground text-[11px]">{insight.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hostel Occupancy & Analytics Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Mess Attendance Trends (Weekly)
            </CardTitle>
            <CardDescription>Average student attendance per meal type</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <HostelMessCrowdChart />
          </CardContent>
        </Card>

        {/* Complaints Analytics */}
        <Card className="border-border/50">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-red-500" />
              Monthly Complaint Resolution Trends
            </CardTitle>
            <CardDescription>Open vs Resolved complaints over last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <HostelComplaintsLineChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
