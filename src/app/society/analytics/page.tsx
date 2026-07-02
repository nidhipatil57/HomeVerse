"use client";

import { motion } from "motion/react";
import { BarChart3, TrendingUp, Droplets, Zap, Users, MessageSquareWarning, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { utilityData, complaintsByCategory } from "@/data/mock-dashboard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, LineChart, Line } from "recharts";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Community Analytics 📊</h1>
        <p className="text-muted-foreground mt-1">AI-powered insights into your community&apos;s health</p>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Resident Satisfaction", value: "92%", color: "#22c55e", icon: Users },
          { label: "Complaint Resolution", value: "87%", color: "#3b82f6", icon: MessageSquareWarning },
          { label: "Energy Efficiency", value: "A+", color: "#eab308", icon: Zap },
          { label: "AI Health Score", value: "94/100", color: "#8b5cf6", icon: Bot },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeInUp}>
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-semibold">Utility Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={utilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="electricity" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} name="Electricity (kWh)" />
                <Line type="monotone" dataKey="water" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} name="Water (KL)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-semibold">Complaints by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={complaintsByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={80} />
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold font-[family-name:var(--font-heading)]">AI Insights</h3>
              <p className="text-xs text-muted-foreground">Generated based on your community data</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              "Water usage has decreased by 5% this month — likely due to tank cleaning awareness.",
              "Plumbing complaints are trending up in Tower B. Consider a preventive maintenance check.",
              "Maintenance collection rate is at 95%. Send reminders to 12 pending households.",
              "Evening electricity usage peaks at 7-9 PM. Consider staggered common area lighting.",
              "Community engagement is up 15% since the events committee started weekly activities.",
              "Average complaint resolution time has improved from 3.2 to 2.1 days this quarter."
            ].map((insight, i) => (
              <div key={i} className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
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
