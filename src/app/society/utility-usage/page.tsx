"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Droplets, Zap, CreditCard, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/store/useAuth";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import dynamic from "next/dynamic";

const UtilityTrendsLineChart = dynamic(() => import("@/components/charts/UtilityTrendsLineChart"), {
  ssr: false,
  loading: () => <div className="h-[280px] flex items-center justify-center bg-secondary/10 animate-pulse rounded-xl" />
});

export default function UtilityUsagePage() {
  const { user, initialize } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    setMounted(true);
  }, [initialize]);

  if (!mounted) return null;

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
