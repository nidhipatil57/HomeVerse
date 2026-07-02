"use client";

import { motion } from "motion/react";
import { BarChart3, TrendingUp, TrendingDown, RefreshCw, Droplets, Zap, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";

export default function WardenAnalyticsPage() {
  const resourceData = [
    { month: "Jan", Electricity: 4500, Water: 1200 },
    { month: "Feb", Electricity: 4200, Water: 1100 },
    { month: "Mar", Electricity: 4800, Water: 1300 },
    { month: "Apr", Electricity: 5600, Water: 1550 },
    { month: "May", Electricity: 6100, Water: 1700 },
    { month: "Jun", Electricity: 5900, Water: 1600 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">Hostel Analytics</h1>
          <p className="text-muted-foreground mt-1">Resource consumption metrics, complaint frequencies, and meal wastage reports.</p>
        </div>
        <Button size="icon" variant="outline" className="rounded-xl w-10 h-10 shrink-0">
          <RefreshCw className="w-4.5 h-4.5" />
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Water Consumption", value: "24.5 KL", change: -8, trend: "down", icon: Droplets, color: "text-blue-500 bg-blue-500/10" },
          { label: "Electricity Usage", value: "5,900 kWh", change: 12, trend: "up", icon: Zap, color: "text-amber-500 bg-amber-500/10" },
          { label: "Mess Crowd Average", value: "285 Students", change: 3, trend: "up", icon: Users, color: "text-emerald-500 bg-emerald-500/10" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-border/50">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block">{stat.label}</span>
                  <span className="text-2xl font-extrabold font-[family-name:var(--font-heading)] block">{stat.value}</span>
                  <span className={`text-xs font-semibold flex items-center gap-0.5 mt-1 ${stat.trend === "down" ? "text-green-500" : "text-red-500"}`}>
                    {stat.trend === "down" ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    {Math.abs(stat.change)}% from last month
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 border-border/50">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              Utility Consumption Analysis
            </CardTitle>
            <CardDescription>Monthly electrical (kWh) & water (KL) volume indices</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={resourceData}>
                <defs>
                  <linearGradient id="elecGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="watGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                <Legend />
                <Area type="monotone" dataKey="Electricity" stroke="#eab308" fill="url(#elecGrad)" strokeWidth={2} name="Electricity (kWh)" />
                <Area type="monotone" dataKey="Water" stroke="#3b82f6" fill="url(#watGrad)" strokeWidth={2} name="Water (KL)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-border/50 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-base font-bold">Food Wastage Analytics</CardTitle>
            <CardDescription>Mess wastage forecast & ratings</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 flex-1">
            <div className="space-y-3">
              {[
                { meal: "Breakfast", wastage: "8 kg", rating: "4.2 ★", color: "bg-emerald-500" },
                { meal: "Lunch", wastage: "14 kg", rating: "3.8 ★", color: "bg-blue-500" },
                { meal: "Dinner", wastage: "18 kg", rating: "4.5 ★", color: "bg-amber-500" }
              ].map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold">{m.meal} (Rating: {m.rating})</span>
                    <span className="text-muted-foreground">{m.wastage} wasted</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${m.color}`} style={{ width: `${(parseInt(m.wastage) / 20) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/30 text-xs border border-border/30 mt-4">
              <span className="font-semibold text-foreground">Wastage Alert:</span>
              <p className="text-muted-foreground mt-0.5">Average lunch wastage increased by 15% due to weather-induced student dining out.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
