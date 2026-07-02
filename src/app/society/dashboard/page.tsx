"use client";

import { motion } from "motion/react";
import {
  MessageSquareWarning, IndianRupee, Calendar, Users, Package,
  Megaphone, Droplets, Zap, Heart, TrendingUp, TrendingDown,
  ArrowRight, Plus, UserCheck, CreditCard, CalendarPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import {
  societyDashboardStats,
  recentActivity,
  announcements,
  utilityData,
  expenseBreakdown,
} from "@/data/mock-dashboard";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart,
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

export default function SocietyDashboard() {
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
              Good Morning, Nidhi 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening at Harmony Heights today.
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

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Utility Consumption Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
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
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
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
        </motion.div>
      </div>

      {/* Activity & Announcements */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:col-span-3"
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                  View All <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentActivity.slice(0, 6).map((activity, index) => {
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
        </motion.div>

        {/* Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/50">
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
        </motion.div>
      </div>
    </div>
  );
}
