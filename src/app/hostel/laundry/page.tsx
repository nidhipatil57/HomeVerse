"use client";
import { motion } from "motion/react";
import { WashingMachine, Clock, CheckCircle2, AlertTriangle, CalendarPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const machines = [
  { id: "W1", name: "Washer 1", floor: 2, status: "available" as const, health: 95 },
  { id: "W2", name: "Washer 2", floor: 2, status: "in-use" as const, user: "Arun (Room 305)", timeLeft: 25, health: 88 },
  { id: "W3", name: "Washer 3", floor: 4, status: "available" as const, health: 92 },
  { id: "D1", name: "Dryer 1", floor: 2, status: "in-use" as const, user: "Meera (Room 201)", timeLeft: 10, health: 90 },
  { id: "D2", name: "Dryer 2", floor: 4, status: "maintenance" as const, health: 45 },
  { id: "W4", name: "Washer 4", floor: 4, status: "available" as const, health: 97 },
];

const statusConfig = {
  available: { color: "text-green-500", bg: "bg-green-500/10", label: "Available", icon: CheckCircle2 },
  "in-use": { color: "text-red-500", bg: "bg-red-500/10", label: "In Use", icon: Clock },
  maintenance: { color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Maintenance", icon: AlertTriangle },
};

export default function LaundryPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Laundry Management 👕</h1>
          <p className="text-muted-foreground mt-1">Book machines, track status, and manage your laundry</p>
        </div>
        <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25"><CalendarPlus className="w-4 h-4 mr-2" /> Book Slot</Button>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Available Now", value: machines.filter(m => m.status === "available").length, color: "#22c55e" },
          { label: "In Use", value: machines.filter(m => m.status === "in-use").length, color: "#ef4444" },
          { label: "Under Maintenance", value: machines.filter(m => m.status === "maintenance").length, color: "#f59e0b" },
          { label: "Total Machines", value: machines.length, color: "#8b5cf6" },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeInUp}>
            <Card className="border-border/50"><CardContent className="p-4 text-center">
              <p className="text-3xl font-bold font-[family-name:var(--font-heading)]" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {machines.map((machine) => {
          const config = statusConfig[machine.status];
          return (
            <motion.div key={machine.id} variants={fadeInUp}>
              <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                        <WashingMachine className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{machine.name}</h3>
                        <p className="text-xs text-muted-foreground">Floor {machine.floor}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${config.bg} ${config.color} border-0`}>{config.label}</Badge>
                  </div>
                  {"user" in machine && machine.user && (
                    <p className="text-xs text-muted-foreground mb-2">Used by: {machine.user}</p>
                  )}
                  {"timeLeft" in machine && machine.timeLeft && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Time remaining</span>
                        <span className="font-medium">{machine.timeLeft} min</span>
                      </div>
                      <Progress value={100 - (machine.timeLeft / 45) * 100} className="h-1.5" />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Machine Health</span>
                    <span className={`font-medium ${machine.health > 80 ? "text-green-500" : machine.health > 50 ? "text-yellow-500" : "text-red-500"}`}>{machine.health}%</span>
                  </div>
                  {machine.status === "available" && (
                    <Button className="w-full mt-3 rounded-xl" size="sm">Book This Machine</Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
