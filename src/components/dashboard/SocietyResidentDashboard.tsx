"use client";

import { motion } from "motion/react";
import {
  MessageSquareWarning, IndianRupee, Calendar, Users, Package,
  Megaphone, Droplets, Zap, Heart, TrendingUp, TrendingDown,
  ArrowRight, Plus, UserCheck, CreditCard, CalendarPlus,
  Bot, Building2, Trophy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import Link from "next/link";
import dynamic from "next/dynamic";

const SocietyUtilityChart = dynamic(() => import("@/components/charts/SocietyUtilityChart"), {
  ssr: false,
  loading: () => <div className="h-[260px] flex items-center justify-center bg-secondary/10 animate-pulse rounded-xl" />
});



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

export function SocietyResidentDashboard({ resident }: { resident: any }) {
  const { complaints, visitors, parcels, maintenanceBills, communityEvents, announcements, lostFoundItems, raiseEmergencyAlert } = useCommunityStore(
    useShallow((state) => ({
      complaints: state.complaints,
      visitors: state.visitors,
      parcels: state.parcels,
      maintenanceBills: state.maintenanceBills,
      communityEvents: state.communityEvents,
      announcements: state.announcements || [],
      lostFoundItems: state.lostFoundItems || [],
      raiseEmergencyAlert: state.raiseEmergencyAlert
    }))
  );

  // Dynamic calculations from central database
  const myComplaints = complaints.filter(c => c.raisedBy === resident?.id || (c.portal === "society" && c.unit === resident?.unit));
  const pendingComplaintsCount = myComplaints.filter(c => c.status !== "resolved" && c.status !== "closed").length;

  const myBills = maintenanceBills.filter(b => b.residentId === resident?.id || b.unit === resident?.unit);
  const pendingBill = myBills.find(b => b.status === "pending" || b.status === "overdue");
  const duesStr = pendingBill ? `₹${pendingBill.amount}` : "Nil";

  const myVisitors = visitors.filter(v => v.visitingUnit === resident?.unit);
  const visitorsTodayCount = myVisitors.filter(v => v.status === "checked-in" || v.status === "expected").length;

  const myParcels = parcels.filter(p => p.recipientId === resident?.id && p.status === "received");
  const pendingParcelsCount = myParcels.length;

  // Filter local events
  const rsvpsCount = communityEvents.reduce((acc, ev) => acc + (ev.rsvps?.includes(resident?.id) ? 1 : 0), 0);
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const newItemsThisWeek = lostFoundItems.filter(item => 
    item.portal === "society" && 
    item.status !== "Pending Verification" && 
    item.status !== "Rejected" &&
    new Date(item.createdAt).getTime() >= last7Days.getTime()
  ).length;

  const myActiveClaims = lostFoundItems.filter(item => 
    item.portal === "society" &&
    item.claims && 
    item.claims.some(claim => claim.residentId === resident?.id && claim.status !== "Returned" && claim.status !== "Rejected")
  ).length;

  const residentStats = [
    { label: "Pending Complaints", value: pendingComplaintsCount, change: -8, trend: "down" as const, icon: "MessageSquareWarning", color: "#f59e0b" },
    { label: "Maintenance Dues", value: duesStr, change: 5, trend: "up" as const, icon: "IndianRupee", color: "#ef4444" },
    { label: "My RSVP Events", value: rsvpsCount, change: 0, trend: "stable" as const, icon: "Calendar", color: "#8b5cf6" },
    { label: "Expected Visitors", value: visitorsTodayCount, change: 12, trend: "up" as const, icon: "Users", color: "#3b82f6" },
    { label: "Parcels Awaiting Pickup", value: pendingParcelsCount, change: -3, trend: "down" as const, icon: "Package", color: "#f97316" },
    { label: "Announcements", value: announcements.length, change: 2, trend: "up" as const, icon: "Megaphone", color: "#06b6d4" },
  ];

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
              Here&apos;s what&apos;s happening at {resident?.societyName || "Harmony Heights"} today • Flat {resident?.unit || "A-301"}.
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

      {/* Emergency Trigger SOS & Parcel release */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-8 border-red-500/20 bg-red-500/5 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest block">🚨 SECURITY SOS</span>
              <h2 className="text-base font-bold text-foreground">Need Immediate Security or Medical Assistance?</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Triggering SOS will instantly notify the Main Gate guard post with your flat location.</p>
            </div>
            <Button
              onClick={() => {
                raiseEmergencyAlert({
                  residentId: resident.id,
                  residentName: resident.name,
                  unit: resident.unit,
                  building: resident.building || "Tower A",
                  phone: resident.phone || "+91 99999 88888",
                  emergencyType: "Medical",
                  priority: "critical"
                });
                alert("Emergency SOS Alert has been broadcast to security guards at Gate 1!");
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 px-4 text-xs font-semibold shrink-0"
            >
              Trigger Emergency SOS
            </Button>
          </CardContent>
        </Card>

        {myParcels.length > 0 && (
          <Card className="md:col-span-4 border-amber-500/20 bg-amber-500/5 flex flex-col justify-center">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-500">
                <Package className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Parcel Awaiting Gate Pickup!</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Show Gate OTP: <span className="font-bold text-amber-600 font-mono text-xs">{myParcels[0].otp}</span> to release.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lost & Found Hub Widget */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50 bg-secondary/5">
          <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Lost & Found Hub</h4>
                <div className="flex gap-4 text-xs text-muted-foreground mt-0.5">
                  <span>New Items This Week: <strong className="text-foreground">{newItemsThisWeek}</strong></span>
                  <span>My Active Claims: <strong className="text-foreground">{myActiveClaims}</strong></span>
                </div>
              </div>
            </div>
            <Link href="/society/lost-found" className="shrink-0">
              <Button size="sm" className="rounded-xl gradient-primary text-white border-0 h-9 font-semibold text-xs px-4">
                View Lost & Found
              </Button>
            </Link>
          </CardContent>
        </Card>
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
        {residentStats.map((stat) => {
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
                          ? stat.label.includes("Dues")
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
      <div className="grid grid-cols-1 gap-6">
        {/* Utility Consumption Chart */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">My Flat Utility Consumption</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Electricity and water usage for Flat {resident?.unit || "A-301"}</p>
              </div>
              <Badge variant="outline" className="text-xs">Last 7 months</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <SocietyUtilityChart />
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
            {myComplaints.slice(0, 6).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors group text-sm"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5 text-orange-500">
                  <MessageSquareWarning className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    Category: {activity.category} • Status: {activity.status}
                  </p>
                </div>
                <Badge variant="outline" className="text-[9px] shrink-0">
                  {activity.id}
                </Badge>
              </div>
            ))}
            {myComplaints.length === 0 && (
              <div className="text-center py-6 text-xs text-muted-foreground">No recent activities found.</div>
            )}
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
