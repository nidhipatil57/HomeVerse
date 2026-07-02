"use client";

import { motion } from "motion/react";
import {
  UtensilsCrossed, ClipboardCheck, WashingMachine, MessageSquareWarning,
  Package, Calendar, Users, IndianRupee, TrendingUp, TrendingDown,
  ArrowRight, Star, Clock, Bed,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { hostelDashboardStats } from "@/data/mock-dashboard";
import { weeklyMenu } from "@/data/mock-mess-menu";
import Link from "next/link";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed, ClipboardCheck, WashingMachine, MessageSquareWarning,
  Package, Calendar, Users, IndianRupee,
};

const todayMenu = weeklyMenu[2]; // Wednesday

export default function HostelDashboard() {
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
              Hey, Nidhi! 🎓
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s your hostel life at a glance — Vidya Bhawan Hostel.
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1.5 rounded-lg w-fit">
            <Bed className="w-3.5 h-3.5 mr-1.5" />
            Room 204 · Floor 2
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

      {/* Today's Menu + Laundry */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/50">
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
        </motion.div>

        {/* Quick Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
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
              <Button variant="outline" size="sm" className="w-full rounded-xl text-xs mt-2">
                Book a Slot
              </Button>
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
        </motion.div>
      </div>
    </div>
  );
}
