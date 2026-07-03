"use client";

import { motion } from "motion/react";
import {
  UtensilsCrossed, WashingMachine, MessageSquareWarning,
  Package, Calendar, Users, Clock, Bed, Bot, Star, ArrowRight, ClipboardCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { weeklyMenu } from "@/data/mock-mess-menu";
import Link from "next/link";

const todayMenu = weeklyMenu[2]; // Wednesday

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed,
  WashingMachine,
  MessageSquareWarning,
  Package,
};

export function HostelStudentDashboard({ student }: { student: any }) {
  const { complaints, laundrySlots, parcels, leaveRequests } = useCommunityStore(
    useShallow((state) => ({
      complaints: state.complaints,
      laundrySlots: state.laundrySlots,
      parcels: state.parcels,
      leaveRequests: state.leaveRequests,
    }))
  );

  // Dynamic calculations
  const myComplaints = complaints.filter(c => c.raisedBy === student?.id || (c.portal === "hostel" && c.unit === student?.unit));
  const openComplaintsCount = myComplaints.filter(c => c.status !== "resolved" && c.status !== "closed").length;

  const bookedLaundryCount = laundrySlots.filter(s => s.bookedBy === student?.id && s.status === "booked").length;

  const myParcels = parcels.filter(p => p.recipientId === student?.id && p.status === "received");
  const pendingParcelsCount = myParcels.length;

  const studentStats = [
    { label: "Today's Menu", value: "4 Meals", change: 0, trend: "stable" as const, icon: "UtensilsCrossed", color: "#f59e0b" },
    { label: "Laundry Bookings", value: bookedLaundryCount, change: 0, trend: "stable" as const, icon: "WashingMachine", color: "#3b82f6" },
    { label: "Open Complaints", value: openComplaintsCount, change: -5, trend: "down" as const, icon: "MessageSquareWarning", color: "#ef4444" },
    { label: "Parcels to Collect", value: pendingParcelsCount, change: 3, trend: "up" as const, icon: "Package", color: "#f97316" },
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
        {studentStats.map((stat) => {
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
              {laundrySlots.slice(0, 4).map((slotItem) => (
                <div key={slotItem.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      slotItem.status === "available" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <span className="text-muted-foreground truncate max-w-[150px]">{slotItem.machineName}</span>
                  </div>
                  <span className={`text-xs font-medium ${
                    slotItem.status === "available" ? "text-green-500" : "text-red-500"
                  }`}>
                    {slotItem.status === "available" ? "Available" : "Booked"}
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
        </div>
      </div>
    </div>
  );
}
