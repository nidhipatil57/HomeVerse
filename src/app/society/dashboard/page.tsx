"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquareWarning, IndianRupee, Calendar, Users, Package,
  Megaphone, Droplets, Zap, Heart, TrendingUp, TrendingDown,
  ArrowRight, Plus, UserCheck, CreditCard, CalendarPlus,
  Briefcase, Clock, Star, Wrench, AlertTriangle, MapPin,
  Play, CheckCircle2, XCircle, Camera, Check, ChevronRight, Bot,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { useAuth } from "@/lib/store/useAuth";
import {
  societyDashboardStats,
  recentActivity,
  announcements,
  utilityData,
  expenseBreakdown,
} from "@/data/mock-dashboard";
import Link from "next/link";
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer,
  Tooltip as RechartsTooltip, PieChart, Pie, Cell
} from "recharts";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquareWarning, IndianRupee, Calendar, Users, Package,
  Megaphone, Droplets, Zap, Heart,
};

const quickActions = [
  { label: "Raise Complaint", icon: Plus, href: "/society/complaints", color: "from-amber-500 to-orange-500" },
  { label: "Approve Visitor", icon: UserCheck, href: "/society/visitors", color: "from-blue-500 to-cyan-500" },
  { label: "Pay Maintenance", icon: CreditCard, href: "/society/maintenance", color: "from-green-500 to-emerald-500" },
  { label: "Book Facility", icon: CalendarPlus, href: "/society/community", color: "from-purple-500 to-violet-500" },
];

export default function SocietyDashboardPage() {
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
  if (user?.role === "worker") {
    return <SocietyWorkerDashboard worker={user} />;
  }

  return <SocietyResidentDashboard resident={user} />;
}

// ==========================================
// 1. SOCIETY RESIDENT DASHBOARD
// ==========================================
function SocietyResidentDashboard({ resident }: { resident: any }) {
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
              Good Morning, {resident?.name || "Nidhi"} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening at {resident?.societyName || "Harmony Heights"} today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              All Systems Normal
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {quickActions.map((action) => (
          <motion.div key={action.label} variants={fadeInUp}>
            <Link href={action.href}>
              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {action.label}
                  </span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {societyDashboardStats.map((stat) => {
          const Icon = iconMap[stat.icon] || Heart;
          return (
            <motion.div key={stat.label} variants={fadeInUp}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-border/50 overflow-hidden relative group">
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500"
                  style={{ background: `linear-gradient(135deg, ${stat.color}, transparent)` }}
                />
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
                    {stat.change !== undefined && stat.change !== 0 && (
                      <div className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                        stat.trend === "up"
                          ? stat.label.includes("Dues") || stat.label.includes("Electricity")
                            ? "text-red-600 bg-red-500/10"
                            : "text-green-600 bg-green-500/10"
                          : stat.label.includes("Complaints")
                            ? "text-green-600 bg-green-500/10"
                            : "text-red-600 bg-red-500/10"
                      }`}>
                        {stat.trend === "up" ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(stat.change)}%
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
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* AI Resident Assistant Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="border-border/50 overflow-hidden bg-gradient-to-r from-primary/10 via-background to-secondary/15 relative">
          <div className="absolute right-0 top-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
                <Bot className="w-6 h-6 animate-bounce" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
                  Ask HomeVerse AI Assistant
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-mono font-semibold animate-pulse">AI Agent</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Instantly query water usage, verify parcel pickup OTPs, check pending maintenance bills or trace plumber complaint timelines.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[
                    "What is my maintenance bill?",
                    "Where is my parcel?",
                    "What is my complaint status?",
                    "Show water usage"
                  ].map((q) => (
                    <Link key={q} href="/society/ai-assistant">
                      <button className="text-[11px] px-2.5 py-1.5 rounded-lg border border-border/50 bg-background/80 hover:bg-primary/5 hover:text-primary transition-all text-left">
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

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Utility Consumption Chart */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Utility Consumption</CardTitle>
              <Badge variant="outline" className="text-xs">Last 7 months</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={utilityData}>
                <defs>
                  <linearGradient id="electricityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="electricity" stroke="#eab308" fill="url(#electricityGrad)" strokeWidth={2} name="Electricity (kWh)" />
                <Area type="monotone" dataKey="water" stroke="#0ea5e9" fill="url(#waterGrad)" strokeWidth={2} name="Water (KL)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Expense Breakdown</CardTitle>
              <Badge variant="outline" className="text-xs">This Month</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5">
                {expenseBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Announcements */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Activity */}
        <Card className="border-border/50 lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentActivity.slice(0, 6).map((activity) => {
              const Icon = iconMap[activity.icon] || Heart;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${activity.color}15` }}
                  >
                    <span style={{ color: activity.color }}>
                      <Icon className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {activity.timestamp}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Announcements</CardTitle>
              <Badge variant="outline" className="text-xs">{announcements.length} new</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-3 rounded-xl border border-border/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold">{ann.title}</h4>
                  <Badge
                    className={`text-[10px] shrink-0 ${
                      ann.priority === "urgent"
                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                        : ann.priority === "important"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }`}
                  >
                    {ann.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {ann.content}
                </p>
                <div className="flex items-center gap-2">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-[8px] gradient-primary text-white">
                      {ann.author.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] text-muted-foreground">{ann.author}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==========================================
// 2. SOCIETY WORKER DASHBOARD
// ==========================================
interface WorkerJob {
  id: string;
  title: string;
  category: string;
  flat: string;
  building: string;
  priority: "critical" | "high" | "medium" | "low";
  remarks: string;
  eta: string;
  status: "assigned" | "in-progress" | "completed" | "rejected";
  aiSuggestions: string[];
  beforePhoto: string | null;
  afterPhoto: string | null;
  comments?: string;
  rejectionReason?: string;
}

function SocietyWorkerDashboard({ worker }: { worker: any }) {
  // Local Jobs state for interactivity
  const [jobs, setJobs] = useState<WorkerJob[]>([
    {
      id: "job-1",
      title: "Kitchen Tap Leaking Continuously",
      category: "Plumbing",
      flat: "A-301",
      building: "Tower A",
      priority: "high",
      remarks: "Water is dripping from the hot water faucet line. Flooded cabinet under kitchen counter. Need quick repair.",
      eta: "30 mins",
      status: "assigned",
      aiSuggestions: ["PPR Pipe (1/2\")", "Teflon Thread Seal Tape", "Adjustable Spanner", "Silicone Sealant"],
      beforePhoto: null,
      afterPhoto: null,
    },
    {
      id: "job-2",
      title: "Living Room Fan Regulator Sparking",
      category: "Electrical",
      flat: "B-402",
      building: "Tower B",
      priority: "critical",
      remarks: "Visible electrical sparks observed when changing speed. Power tripped once in master bedroom as well.",
      eta: "15 mins",
      status: "assigned",
      aiSuggestions: ["Insulated Tester Screwdriver", "PVC Electrical Tape", "5-Speed Switch Regulator", "Wire Stripper"],
      beforePhoto: null,
      afterPhoto: null,
    },
    {
      id: "job-3",
      title: "Elevator B-2 Making Clunking Noise",
      category: "Lift / Elevator",
      flat: "Common Lift",
      building: "Tower B",
      priority: "critical",
      remarks: "Vibrations and metallic friction noises reported between 4th and 5th floors. Safety brake check required.",
      eta: "45 mins",
      status: "in-progress",
      aiSuggestions: ["T-Wrench Keys", "Industrial Grease/Lubricant", "Volt Meter", "Safety Harness"],
      beforePhoto: "/images/lift-panel-before.jpg",
      afterPhoto: null,
    },
    {
      id: "job-4",
      title: "Master Bedroom Socket Loose Connection",
      category: "Electrical",
      flat: "C-105",
      building: "Tower C",
      priority: "medium",
      remarks: "Outlet is loose from the wall box. Laptop charger sparks when inserting.",
      eta: "60 mins",
      status: "completed",
      aiSuggestions: ["Anchor Wall Plugs", "Tester", "16A Replacement Socket", "Insulated Plier"],
      beforePhoto: "/images/socket-before.jpg",
      afterPhoto: "/images/socket-after.jpg",
      comments: "Re-anchored wall switch box, replaced loose terminals with fresh copper wire wrapping.",
    }
  ]);

  const [activeJobId, setActiveJobId] = useState<string>("job-1");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [completeComment, setCompleteComment] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const activeJob = jobs.find(j => j.id === activeJobId) || jobs[0];

  const updateJobStatus = (id: string, status: WorkerJob["status"], extra: Partial<WorkerJob> = {}) => {
    setJobs(prev => prev.map(job => {
      if (job.id === id) {
        return { ...job, status, ...extra };
      }
      return job;
    }));
  };

  const handleStartJob = (id: string) => {
    updateJobStatus(id, "in-progress", { beforePhoto: "/images/before-upload-placeholder.jpg" });
  };

  const handleOpenReject = (id: string) => {
    setActiveJobId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const submitReject = () => {
    if (!rejectReason) return;
    updateJobStatus(activeJobId, "rejected", { rejectionReason: rejectReason });
    setShowRejectModal(false);
  };

  const handleOpenComplete = (id: string) => {
    setActiveJobId(id);
    setCompleteComment("");
    setShowCompleteModal(true);
  };

  const submitComplete = () => {
    updateJobStatus(activeJobId, "completed", {
      afterPhoto: "/images/after-upload-placeholder.jpg",
      comments: completeComment || "Job completed successfully."
    });
    setShowCompleteModal(false);
  };

  // Stats calculation
  const totalAssigned = jobs.filter(j => j.status === "assigned").length;
  const totalInProgress = jobs.filter(j => j.status === "in-progress").length;
  const totalCompleted = jobs.filter(j => j.status === "completed").length;
  const criticalJobs = jobs.filter(j => j.status !== "completed" && j.priority === "critical").length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/30 pb-5"
      >
        <div>
          <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">
            {worker?.workerCategory || "Electrician"} • Shift: {worker?.workingShift || "Morning"}
          </span>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] mt-1 flex items-center gap-2">
            Worker Dashboard
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-sans font-medium">
              Employee ID: {worker?.employeeId || "EMP-2940"}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, <span className="font-semibold text-foreground">{worker?.name || "Ramesh"}</span>. Below are your assigned jobs for today.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-red-500/15 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {criticalJobs} Critical Alert{criticalJobs !== 1 ? "s" : ""}
          </Badge>
          <Badge className="bg-green-500/15 text-green-500 border border-green-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            On Duty
          </Badge>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Assigned Jobs Today", value: totalAssigned, icon: Briefcase, color: "text-blue-500 bg-blue-500/10" },
          { label: "Active Jobs (In Progress)", value: totalInProgress, icon: Clock, color: "text-amber-500 bg-amber-500/10" },
          { label: "Completed Jobs", value: totalCompleted + 17, icon: CheckCircle2, color: "text-green-500 bg-green-500/10" },
          { label: "Performance Score", value: "4.8★ / 95%", icon: Star, color: "text-purple-500 bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Work Area */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left column: JobList */}
        <Card className="lg:col-span-5 border-border/50 flex flex-col h-[650px] overflow-hidden">
          <CardHeader className="border-b border-border/30 pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Assigned Tasks Feed
            </CardTitle>
            <CardDescription>Select a task below to review details, route mapping, and tool requirements.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setActiveJobId(job.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all relative flex flex-col gap-2 ${
                  activeJobId === job.id
                    ? "border-blue-500/50 bg-blue-500/5 shadow-md"
                    : "border-border/50 hover:bg-secondary/40"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <Badge className={`text-[10px] uppercase font-bold ${
                    job.priority === "critical" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                    job.priority === "high" ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" :
                    "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                  }`}>
                    {job.priority}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{job.eta} ETA</span>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">{job.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Unit: {job.flat} • {job.building}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-1 pt-2 border-t border-border/20">
                  <span className="text-xs font-semibold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded">
                    {job.category}
                  </span>
                  
                  <Badge className={`text-[10px] font-bold ${
                    job.status === "completed" ? "bg-green-500/15 text-green-500" :
                    job.status === "in-progress" ? "bg-amber-500/15 text-amber-500" :
                    job.status === "rejected" ? "bg-red-500/15 text-red-500" :
                    "bg-blue-500/15 text-blue-500"
                  }`}>
                    {job.status === "in-progress" ? "In Progress" : job.status}
                  </Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Right column: Task Details and AI Suggested Actions */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Detail Card */}
          <Card className="border-border/50 flex-1 flex flex-col justify-between">
            <div>
              <CardHeader className="border-b border-border/30 pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-bold text-blue-500 uppercase">{activeJob.category}</span>
                    <CardTitle className="text-xl font-bold mt-0.5">{activeJob.title}</CardTitle>
                  </div>
                  <Badge className={`text-xs px-2.5 py-1 ${
                    activeJob.status === "completed" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                    activeJob.status === "in-progress" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    activeJob.status === "rejected" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                    "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  }`}>
                    {activeJob.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-5">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 text-sm p-4 rounded-2xl bg-secondary/30 border border-border/30">
                  <div>
                    <span className="text-xs text-muted-foreground block">Building / Wing</span>
                    <span className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {activeJob.building}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Flat Number</span>
                    <span className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {activeJob.flat}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <span className="text-xs font-bold text-muted-foreground block">Resident Remark / Notes</span>
                  <p className="text-sm text-foreground leading-relaxed mt-1.5 p-3.5 rounded-2xl bg-card border border-border/50">
                    &quot;{activeJob.remarks}&quot;
                  </p>
                </div>

                {/* Photo Attachments */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground block mb-1.5">Before Job Photo</span>
                    {activeJob.beforePhoto ? (
                      <div className="h-32 rounded-xl bg-secondary/50 border border-border flex flex-col items-center justify-center relative overflow-hidden">
                        <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-[10px] text-muted-foreground font-mono">before_job_proof.jpg</span>
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5"><Check className="w-3 h-3" /></div>
                      </div>
                    ) : (
                      <div className="h-32 rounded-xl border border-dashed border-border/70 flex flex-col items-center justify-center text-muted-foreground bg-secondary/10">
                        <Camera className="w-6 h-6 mb-1 text-muted-foreground/50" />
                        <span className="text-xs">No Before Image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-muted-foreground block mb-1.5">After Job Photo</span>
                    {activeJob.afterPhoto ? (
                      <div className="h-32 rounded-xl bg-secondary/50 border border-border flex flex-col items-center justify-center relative overflow-hidden">
                        <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-[10px] text-muted-foreground font-mono">after_job_proof.jpg</span>
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5"><Check className="w-3 h-3" /></div>
                      </div>
                    ) : (
                      <div className="h-32 rounded-xl border border-dashed border-border/70 flex flex-col items-center justify-center text-muted-foreground bg-secondary/10">
                        <Camera className="w-6 h-6 mb-1 text-muted-foreground/50" />
                        <span className="text-xs">No After Image</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Worker comments / logs */}
                {activeJob.comments && (
                  <div className="p-3.5 rounded-2xl bg-green-500/5 border border-green-500/20 text-xs">
                    <span className="font-semibold text-green-500 block mb-0.5">Resolution Comment:</span>
                    {activeJob.comments}
                  </div>
                )}
                {activeJob.status === "rejected" && activeJob.rejectionReason && (
                  <div className="p-3.5 rounded-2xl bg-red-500/5 border border-red-500/20 text-xs">
                    <span className="font-semibold text-red-500 block mb-0.5">Rejection Reason:</span>
                    {activeJob.rejectionReason}
                  </div>
                )}
              </CardContent>
            </div>

            {/* Actions Footer */}
            <CardContent className="pt-2 pb-6 border-t border-border/20 flex flex-wrap gap-2.5">
              {activeJob.status === "assigned" && (
                <>
                  <Button
                    onClick={() => handleStartJob(activeJob.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 border-0"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Accept & Start Job
                  </Button>
                  <Button
                    onClick={() => handleOpenReject(activeJob.id)}
                    variant="outline"
                    className="border-red-500/20 hover:border-red-500 text-red-500 hover:bg-red-500/10 rounded-xl h-11"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Job
                  </Button>
                </>
              )}
              {activeJob.status === "in-progress" && (
                <Button
                  onClick={() => handleOpenComplete(activeJob.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 border-0 shadow-md shadow-green-500/20"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Resolved & Upload proof
                </Button>
              )}
              {activeJob.status === "completed" && (
                <Button disabled className="w-full bg-secondary/80 text-muted-foreground rounded-xl h-11">
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Task Completed Successfully
                </Button>
              )}
              {activeJob.status === "rejected" && (
                <Button disabled className="w-full bg-destructive/10 text-destructive rounded-xl h-11 border border-destructive/20">
                  <XCircle className="w-4 h-4 mr-2" />
                  Job Rejected
                </Button>
              )}
            </CardContent>
          </Card>

          {/* AI Suggestions Box */}
          <Card className="border-border/50 bg-gradient-to-r from-blue-500/10 via-background to-secondary/15 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 shadow-inner">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
                  AI Suggested Tools & Inventory
                  <Badge className="text-[8px] bg-blue-500 text-white font-mono scale-90 px-1 py-0 border-0">Copilot</Badge>
                </h4>
                <p className="text-xs text-muted-foreground">
                  AI analyzed &quot;{activeJob.title}&quot; and recommends taking the following equipment:
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {activeJob.aiSuggestions.map((tool) => (
                    <span
                      key={tool}
                      className="text-[10px] px-2 py-1 rounded-lg bg-background/80 border border-border/50 text-foreground flex items-center gap-1 shrink-0"
                    >
                      <Wrench className="w-3 h-3 text-blue-500" />
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lower Row: Optimised Route & performance */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Route sequence */}
        <Card className="lg:col-span-6 border-border/50">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Optimized Work Sequence Route
            </CardTitle>
            <CardDescription>AI calculated flat-wise walking schedule to minimize transit time</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[
              { time: "09:30 AM", unit: "C-105", building: "Tower C", job: "Socket Loose Connection", status: "done" },
              { time: "11:00 AM", unit: "Common", building: "Tower B Lift", job: "Elevator Vibration Friction", status: "active" },
              { time: "12:15 PM", unit: "A-301", building: "Tower A", job: "Kitchen Tap Leaking", status: "pending" },
              { time: "02:00 PM", unit: "B-402", building: "Tower B", job: "Fan Regulator Sparking", status: "pending" }
            ].map((route, i) => (
              <div key={i} className="flex items-center gap-4 relative">
                {/* timeline vertical line */}
                {i < 3 && <div className="absolute left-[47px] top-8 bottom-[-24px] w-[2px] bg-border/50" />}
                
                <div className="text-xs text-muted-foreground w-12 font-mono whitespace-nowrap text-right shrink-0">{route.time}</div>
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  route.status === "done" ? "bg-green-500/20 border border-green-500 text-green-500" :
                  route.status === "active" ? "bg-amber-500/20 border border-amber-500 text-amber-500 animate-pulse" :
                  "bg-secondary border border-border text-muted-foreground"
                }`}>
                  {route.status === "done" ? <Check className="w-4 h-4" /> : i + 1}
                </div>

                <div className="flex-1 min-w-0 bg-secondary/20 p-3 rounded-xl border border-border/30 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-foreground">{route.job}</h5>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Unit: {route.unit} • {route.building}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Emergency Alert list */}
        <Card className="lg:col-span-6 border-border/50">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Critical Security & Safety Tasks
            </CardTitle>
            <CardDescription>Immediate deployment required - Bypass general queue</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {[
              { id: "e-1", title: "Lift Failure - Tower B Elevator 1", desc: "Elderly resident trapped on 8th Floor. Lift technician dispatched.", time: "5 min ago", severity: "critical" },
              { id: "e-2", title: "Common Corridor Power Outage", desc: "Tower A floors 3 to 12 completely dark. Safety hazard reported.", time: "15 min ago", severity: "high" },
              { id: "e-3", title: "Basement Water Valve Burst", desc: "Tower C Parking level B2 flooding near electricity meter box.", time: "30 min ago", severity: "critical" }
            ].map((e) => (
              <div key={e.id} className="p-4 rounded-2xl border border-red-500/20 bg-red-500/[0.02] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h5 className="text-xs font-bold text-foreground">{e.title}</h5>
                    <span className="text-[9px] text-red-500 font-bold uppercase">{e.severity}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-normal">{e.desc}</p>
                  <span className="text-[9px] text-muted-foreground block mt-1.5">{e.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border shadow-2xl rounded-3xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-2">Reject Assigned Task</h3>
            <p className="text-xs text-muted-foreground mb-4">Please provide a valid reason for rejecting this service request. This will be reported to the Society Committee.</p>
            <textarea
              placeholder="e.g. Requires heavy plumbing equipment that I don't have, or I am scheduled for shift hand-off."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full h-24 p-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowRejectModal(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={submitReject} disabled={!rejectReason} className="bg-red-600 hover:bg-red-700 text-white rounded-xl border-0">Reject Task</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* COMPLETE MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border shadow-2xl rounded-3xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-2">Resolve Service Complaint</h3>
            <p className="text-xs text-muted-foreground mb-4">Submit your completion report and add any final remarks or instructions for the resident.</p>
            
            <div className="p-4 rounded-xl border border-dashed border-border/70 hover:bg-secondary/20 cursor-pointer flex items-center justify-center gap-2 mb-4 relative">
              <Camera className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Upload After Proof Image</span>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            <textarea
              placeholder="Add completion notes: what was fixed, parts replaced, or general advice for the resident..."
              value={completeComment}
              onChange={(e) => setCompleteComment(e.target.value)}
              className="w-full h-24 p-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
            />
            
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowCompleteModal(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={submitComplete} className="bg-green-600 hover:bg-green-700 text-white rounded-xl border-0">Submit Resolution</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
