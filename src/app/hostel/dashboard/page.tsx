"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UtensilsCrossed, ClipboardCheck, WashingMachine, MessageSquareWarning,
  Package, Calendar, Users, IndianRupee, TrendingUp, TrendingDown,
  ArrowRight, Star, Clock, Bed, Shield, AlertTriangle, FileCheck, Check, X, Bot, FileText, Key, Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { useAuth } from "@/lib/store/useAuth";
import { hostelDashboardStats } from "@/data/mock-dashboard";
import { weeklyMenu } from "@/data/mock-mess-menu";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Tooltip as RechartsTooltip, LineChart, Line, Cell, PieChart, Pie
} from "recharts";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed, ClipboardCheck, WashingMachine, MessageSquareWarning,
  Package, Calendar, Users, IndianRupee,
};

const todayMenu = weeklyMenu[2]; // Wednesday

export default function HostelDashboardPage() {
  const { user, initialize } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    setMounted(true);
  }, [initialize]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
      </div>
    );
  }

  // Swap Dashboards dynamically based on role
  if (user?.role === "warden") {
    return <HostelWardenDashboard warden={user} />;
  }

  return <HostelStudentDashboard student={user} />;
}

// ==========================================
// 1. HOSTEL STUDENT DASHBOARD
// ==========================================
function HostelStudentDashboard({ student }: { student: any }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">
              Hey, {student?.name || "Nidhi"}! 🎓
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s your hostel life at a glance — {student?.hostelName || "Vidya Bhawan Hostel"}.
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1.5 rounded-lg w-fit">
            <Bed className="w-3.5 h-3.5 mr-1.5" />
            Room {student?.unit || "204"} · Floor {student?.floor || "2"}
          </Badge>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {hostelDashboardStats.map((stat) => {
          const Icon = iconMap[stat.icon] || Users;
          return (
            <motion.div key={stat.label} variants={fadeInUp}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-border/50 overflow-hidden relative group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <span style={{ color: stat.color }}>
                        <Icon className="w-5 h-5" />
                      </span>
                    </div>
                    {stat.change !== 0 && (
                      <div className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                        stat.trend === "up" ? "text-green-600 bg-green-500/10" : stat.trend === "down" ? "text-red-600 bg-red-500/10" : "text-gray-500 bg-gray-500/10"
                      }`}>
                        {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : stat.trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
                        {stat.change !== 0 && `${Math.abs(stat.change ?? 0)}%`}
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                    {typeof stat.value === "number" ? (
                      <AnimatedCounter value={stat.value} duration={1.5} />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* AI Assistant Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="border-border/50 overflow-hidden bg-gradient-to-r from-emerald-500/10 via-background to-secondary/15 relative">
          <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 shadow-inner">
                <Bot className="w-6 h-6 animate-bounce" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
                  Ask Hostel AI Assistant
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full font-mono font-semibold animate-pulse">Helper</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ask about today&apos;s dinner menu, check washing machine slots, query unpaid fee status, or check incoming parcel OTP codes.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[
                    "What's for dinner today?",
                    "Washing Machine #2 slot status?",
                    "Do I have any pending hostel fees?",
                    "Show room inspection guidelines"
                  ].map((q) => (
                    <Link key={q} href="/hostel/ai-assistant">
                      <button className="text-[11px] px-2.5 py-1.5 rounded-lg border border-border/50 bg-background/80 hover:bg-emerald-500/5 hover:text-emerald-500 transition-all text-left">
                        {q}
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Menu + Laundry */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Menu */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-amber-500" />
                Today&apos;s Menu — {todayMenu.day}
              </CardTitle>
              <Link href="/hostel/mess">
                <Button variant="ghost" size="sm" className="text-xs">
                  View Full Menu <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {todayMenu.meals.map((meal) => (
                <div
                  key={meal.type}
                  className="p-4 rounded-xl border border-border/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold capitalize">{meal.type}</h4>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        meal.crowdLevel === "low"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : meal.crowdLevel === "moderate"
                            ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                            : meal.crowdLevel === "high"
                              ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                              : "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}
                    >
                      <Users className="w-2.5 h-2.5 mr-1" />
                      {meal.crowdLevel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {meal.time}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {meal.items.map((item) => (
                      <span
                        key={item.name}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/80 flex items-center gap-1"
                      >
                        {item.isVeg ? "🟢" : "🔴"} {item.name}
                      </span>
                    ))}
                  </div>
                  {meal.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium">{meal.rating}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className="space-y-4">
          {/* Laundry Status */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <WashingMachine className="w-4 h-4 text-blue-500" />
                Laundry Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Machine 1 (F2)", status: "available", color: "green" },
                { name: "Machine 2 (F2)", status: "in-use", color: "red", time: "25 min left" },
                { name: "Machine 3 (F4)", status: "available", color: "green" },
                { name: "Dryer 1 (F2)", status: "finishing", color: "yellow", time: "10 min" },
              ].map((machine) => (
                <div key={machine.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      machine.color === "green" ? "bg-green-500" :
                      machine.color === "red" ? "bg-red-500" : "bg-yellow-500"
                    }`} />
                    <span className="text-muted-foreground">{machine.name}</span>
                  </div>
                  <span className={`text-xs font-medium ${
                    machine.color === "green" ? "text-green-500" :
                    machine.color === "red" ? "text-red-500" : "text-yellow-500"
                  }`}>
                    {machine.status === "available" ? "Available" : machine.time}
                  </span>
                </div>
              ))}
              <Link href="/hostel/laundry">
                <Button variant="outline" size="sm" className="w-full rounded-xl text-xs mt-2">
                  Book a Slot
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Attendance */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-green-500" />
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-3">
                <div className="text-3xl font-bold text-green-500 font-[family-name:var(--font-heading)]">94%</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <Progress value={94} className="h-2 mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Present: 28 days</span>
                <span>Absent: 2 days</span>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { title: "Room Inspection", date: "July 8", type: "inspection" },
                { title: "Cultural Night", date: "July 12", type: "event" },
              ].map((event) => (
                <div key={event.title} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. HOSTEL WARDEN DASHBOARD (COMMAND CENTER)
// ==========================================
interface LeaveRequest {
  id: string;
  studentName: string;
  room: string;
  dates: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

function HostelWardenDashboard({ warden }: { warden: any }) {
  // Local state for Leave Approvals
  const [leaves, setLeaves] = useState<LeaveRequest[]>([
    { id: "L-1", studentName: "Rohan Das", room: "201-A", dates: "July 5 - July 8 (3 Days)", reason: "Going home for sister's wedding ceremony.", status: "pending" },
    { id: "L-2", studentName: "Aditya Roy", room: "105-B", dates: "July 6 - July 7 (1 Day)", reason: "Medical appointment in native town.", status: "pending" },
    { id: "L-3", studentName: "Sumit Mishra", room: "302-C", dates: "July 10 - July 15 (5 Days)", reason: "Family trip and festival leave.", status: "pending" }
  ]);

  const handleApproveLeave = (id: string) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: "approved" } : l));
  };

  const handleRejectLeave = (id: string) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: "rejected" } : l));
  };

  const pendingLeavesCount = leaves.filter(l => l.status === "pending").length;

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
        {[
          { label: "Total Students Registered", value: 340, icon: Users, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Rooms Occupancy Rate", value: "165 / 180 (91%)", icon: Bed, color: "text-blue-500 bg-blue-500/10" },
          { label: "Pending Room Complaints", value: 8, icon: MessageSquareWarning, color: "text-red-500 bg-red-500/10" },
          { label: "Mess Attendance (Breakfast)", value: "290 Checked In", icon: UtensilsCrossed, color: "text-amber-500 bg-amber-500/10" },
          { label: "Active Laundry Load", value: "42% Capacity", icon: WashingMachine, color: "text-purple-500 bg-purple-500/10" },
          { label: "Visitors Approved Today", value: 9, icon: Shield, color: "text-cyan-500 bg-cyan-500/10" },
          { label: "Parcels In Locker", value: "12 Awaiting Pickup", icon: Package, color: "text-orange-500 bg-orange-500/10" },
          { label: "Leave Requests Pending", value: pendingLeavesCount, icon: FileCheck, color: "text-pink-500 bg-pink-500/10" },
        ].map((stat, i) => (
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
              {leaves.filter(l => l.status === "pending").length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                  <Check className="w-8 h-8 text-green-500 bg-green-500/10 rounded-full p-1.5" />
                  No pending leave requests in queue.
                </div>
              ) : (
                leaves.filter(l => l.status === "pending").map((req) => (
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
                        <Clock className="w-3.5 h-3.5" /> Dates: {req.dates}
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

            <div className="p-3.5 rounded-2xl bg-secondary/30 text-xs border border-border/30 space-y-1">
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
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { name: "Mon", Breakfast: 240, Lunch: 210, Dinner: 290 },
                { name: "Tue", Breakfast: 230, Lunch: 220, Dinner: 310 },
                { name: "Wed", Breakfast: 250, Lunch: 200, Dinner: 320 },
                { name: "Thu", Breakfast: 220, Lunch: 205, Dinner: 280 },
                { name: "Fri", Breakfast: 240, Lunch: 240, Dinner: 330 },
                { name: "Sat", Breakfast: 180, Lunch: 150, Dinner: 220 },
                { name: "Sun", Breakfast: 150, Lunch: 120, Dinner: 210 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="Breakfast" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Lunch" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Dinner" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={[
                { name: "Jan", Open: 15, Resolved: 12 },
                { name: "Feb", Open: 18, Resolved: 16 },
                { name: "Mar", Open: 22, Resolved: 20 },
                { name: "Apr", Open: 14, Resolved: 15 },
                { name: "May", Open: 10, Resolved: 12 },
                { name: "Jun", Open: 8, Resolved: 9 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px" }} />
                <Line type="monotone" dataKey="Open" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Resolved" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
