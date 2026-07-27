"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  BarChart3, TrendingUp, Zap, Users, MessageSquareWarning, Bot,
  Droplets, CreditCard, Clock, Lightbulb, Wallet, Star, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import dynamic from "next/dynamic";

const UtilityTrendsLineChart = dynamic(() => import("@/components/charts/UtilityTrendsLineChart"), {
  ssr: false,
  loading: () => <div className="h-[280px] flex items-center justify-center bg-secondary/10 animate-pulse rounded-xl" />
});

const ComplaintsByCategoryBarChart = dynamic(() => import("@/components/charts/ComplaintsByCategoryBarChart"), {
  ssr: false,
  loading: () => <div className="h-[280px] flex items-center justify-center bg-secondary/10 animate-pulse rounded-xl" />
});

const SocietyUtilityChart = dynamic(() => import("@/components/charts/SocietyUtilityChart"), {
  ssr: false,
  loading: () => <div className="h-[260px] flex items-center justify-center bg-secondary/10 animate-pulse rounded-xl" />
});

export default function AnalyticsPage() {
  const { user, initialize } = useAuth();
  const { maintenanceBills, complaints, flats, serviceBookings, users, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      maintenanceBills: state.maintenanceBills || [],
      complaints: state.complaints || [],
      flats: state.flats || [],
      serviceBookings: state.serviceBookings || [],
      users: state.users || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Compute stats
  const secretaryStats = useMemo(() => {
    const totalFlats = flats.length || 180;
    const occupiedFlats = flats.filter(f => f.status === "occupied").length || 165;
    const occupancyRate = Math.round((occupiedFlats / totalFlats) * 100);

    const paidBills = maintenanceBills.filter(b => b.status === "paid");
    const totalCollected = paidBills.reduce((sum, b) => sum + b.amount, 0);

    const resolvedComplaints = complaints.filter(c => c.status === "resolved" || c.status === "closed").length;
    const totalComplaints = complaints.length || 1;
    const resolutionSpeed = Math.round((resolvedComplaints / totalComplaints) * 100);

    return {
      totalCollected,
      occupancyRate,
      resolutionSpeed,
      activeComplaints: complaints.filter(c => !["resolved", "closed"].includes(c.status)).length
    };
  }, [flats, maintenanceBills, complaints]);

  if (!mounted) return null;

  const isSecretary = user?.role === "secretary";
  const isManager = user?.role === "manager";

  // Calculate worker ratings for operational analytics
  const workerRatings = useMemo(() => {
    const workerMap: Record<string, { name: string; jobs: number; totalRating: number }> = {};
    complaints.forEach(c => {
      if (c.assignedToId && c.assignedTo) {
        const name = c.assignedTo.split(" (")[0];
        if (!workerMap[c.assignedToId]) {
          workerMap[c.assignedToId] = { name, jobs: 0, totalRating: 0 };
        }
        if (c.rating) {
          workerMap[c.assignedToId].jobs += 1;
          workerMap[c.assignedToId].totalRating += c.rating;
        }
      }
    });
    return Object.keys(workerMap).map(k => ({
      name: workerMap[k].name,
      rating: workerMap[k].jobs > 0 ? Number((workerMap[k].totalRating / workerMap[k].jobs).toFixed(1)) : 5.0,
      jobs: workerMap[k].jobs
    }));
  }, [complaints]);

  // --- MANAGER VIEW ---
  if (isManager) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Operations Analytics Console 📊</h1>
          <p className="text-muted-foreground mt-1">Review operational metrics, average resolution speed, and technician performance scorecards</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Avg Resolution Speed", value: `${secretaryStats.resolutionSpeed}%`, color: "#3b82f6", icon: Clock },
            { label: "Active Tickets Pending", value: secretaryStats.activeComplaints, color: "#8b5cf6", icon: MessageSquareWarning },
            { label: "Total Active Bookings", value: serviceBookings.filter(b => b.status === "Forwarded to Manager" || b.status === "Scheduled").length, color: "#eab308", icon: Users },
            { label: "Emergency Alerts", value: complaints.filter(c => ["critical", "emergency"].includes(c.priority) && !["Completed", "Resolved", "Rejected", "closed"].includes(c.status)).length, color: "#ef4444", icon: AlertTriangle }
          ].map((s) => (
            <motion.div key={s.label} variants={fadeInUp}>
              <Card className="border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Tickets by Category</CardTitle>
              <CardDescription>Open vs Closed volume distribution across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <ComplaintsByCategoryBarChart />
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Technician Performance Scores</CardTitle>
              <CardDescription>Average review rating based on completed service requests</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20 text-xs max-h-[280px] overflow-y-auto">
                {workerRatings.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground italic">No worker ratings logged yet.</div>
                ) : (
                  workerRatings.map((w, i) => (
                    <div key={i} className="p-3 flex justify-between items-center gap-4 hover:bg-secondary/5">
                      <span className="font-bold text-foreground">{w.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{w.jobs} completed jobs</span>
                        <span className="text-amber-500 font-bold flex items-center gap-0.5"><Star className="w-3.5 h-3.5 fill-amber-500" /> {w.rating}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insight Advisory Panel */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold font-[family-name:var(--font-heading)]">AI Predictive Maintenance Insights</h3>
                <p className="text-xs text-muted-foreground">Generated dynamically based on operational data streams</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                "Average complaint resolution speed has improved by 1.1 days due to prompt plumber assignments.",
                "Elevator maintenance reports highlight consistent minor vibrations in Tower B. Recommend AC inspection.",
                "Plumbing issues have shown a recurring cluster in Tower C Lower Ground. Preventive check recommended."
              ].map((insight, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                  <TrendingUp className="w-3.5 h-3.5 text-primary mb-1.5" />
                  {insight}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- SECRETARY VIEW ---
  if (isSecretary) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Society Analytics Console 📊</h1>
          <p className="text-muted-foreground mt-1">AI-powered reports into society operations, water/energy volume index, and resolution metrics</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Gross Collections (FY)", value: `₹${secretaryStats.totalCollected.toLocaleString()}`, color: "#22c55e", icon: Wallet },
            { label: "Avg Resolution Speed", value: `${secretaryStats.resolutionSpeed}%`, color: "#3b82f6", icon: MessageSquareWarning },
            { label: "Flats Occupancy Rate", value: `${secretaryStats.occupancyRate}%`, color: "#eab308", icon: Users },
            { label: "Active Tickets Pending", value: secretaryStats.activeComplaints, color: "#8b5cf6", icon: Bot },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeInUp}>
              <Card className="border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Society utility consumption index</CardTitle>
              <CardDescription>Common areas water (KL) & power (kWh) usage</CardDescription>
            </CardHeader>
            <CardContent>
              <SocietyUtilityChart />
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Tickets by Category</CardTitle>
              <CardDescription>Open vs Closed volume distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ComplaintsByCategoryBarChart />
            </CardContent>
          </Card>
        </div>

        {/* AI Insight Advisory Panel */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold font-[family-name:var(--font-heading)]">AI Predictive Maintenance Insights</h3>
                <p className="text-xs text-muted-foreground">Generated dynamically based on society-wide data streams</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                "Average complaint resolution speed has improved by 1.1 days due to prompt plumber assignments.",
                "Elevator maintenance reports highlight consistent minor vibrations in Tower B. Recommend AC inspection.",
                "Current utility trend forecasts a 12% rise in common area electricity dues during summer months.",
                "Maintenance collection index is stable. Send automated dues notices to 12 overdue flats.",
                "Total daily water tanker requirements can be reduced by 5% if lawn sprinkler cycles are shifted to early mornings.",
                "Plumbing issues have shown a recurring cluster in Tower C Lower Ground. Preventive check recommended."
              ].map((insight, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                  <TrendingUp className="w-3.5 h-3.5 text-primary mb-1.5" />
                  {insight}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- RESIDENT VIEW (Personal utilities usage, no society metrics) ---
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">My Flat Consumption Analytics 📊</h1>
        <p className="text-muted-foreground mt-1">Review water and electricity usage metrics and conservation advisory logs for Flat {user?.unit || "A-301"}</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Water Usage (Month)", value: "12.4 KL", color: "#0ea5e9", icon: Droplets },
          { label: "My Electricity (Month)", value: "280 kWh", color: "#eab308", icon: Zap },
          { label: "Settle score rate", value: "98% Excellent", color: "#22c55e", icon: CreditCard },
          { label: "Estimated Savings", value: "₹450 Saved", color: "#8b5cf6", icon: Lightbulb },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeInUp}>
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-lg font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Line Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">My Flat utility trends</CardTitle>
          <CardDescription>Usage timeline for water and power compared against Tower average</CardDescription>
        </CardHeader>
        <CardContent>
          <UtilityTrendsLineChart />
        </CardContent>
      </Card>

      {/* Personal AI tips */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold font-[family-name:var(--font-heading)]">Personal conservation advice</h3>
              <p className="text-xs text-muted-foreground">AI tips based on your apartment usage patterns</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              "Your water consumption is 5% lower than the Tower A average. Great conservation efforts!",
              "A power spike was observed between 7:00 PM and 9:00 PM last Wednesday. Try scheduling geysers outside this period.",
              "Adjusting refrigerator temperature settings from maximum to normal could save up to 15 kWh on next month's bill.",
              "By maintaining your excellent payment record, you've saved ₹120 in late fees and accrued 45 reward points.",
              "Turning off air conditioners 15 minutes before leaving the room preserves cooling while reducing power consumption by 8%."
            ].map((insight, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-green-500/5 border border-green-500/10 text-xs text-muted-foreground">
                {insight}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
