"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Clock, Activity, Power, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/store/useAuth";

export default function WorkerAvailabilityPage() {
  const { user, initialize } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [activeHours, setActiveHours] = useState("09:00 AM - 05:00 PM");

  useEffect(() => {
    initialize();
    setMounted(true);
  }, [initialize]);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Work Availability ⏰
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure your daily work shifts, toggle duty status, and view pending dispatch timings
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Toggle Status Card */}
        <Card className="md:col-span-5 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold">Duty Status</CardTitle>
            <CardDescription>Toggle your gate/dispatch availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              isOnline ? "bg-green-500/10 text-green-500 animate-pulse" : "bg-muted text-muted-foreground"
            }`}>
              <Power className="w-10 h-10" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-sm">{isOnline ? "Active & Dispatchable" : "Offline / Off Duty"}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">
                {isOnline ? "You will receive real-time complaints and dispatch orders." : "No new job dispatches will be sent to your terminal."}
              </p>
            </div>

            <Button
              onClick={() => {
                setIsOnline(!isOnline);
                alert(`Duty status updated to: ${!isOnline ? "Active" : "Offline"}`);
              }}
              className={`w-full rounded-xl h-10 font-semibold text-xs border-0 shadow-sm ${
                isOnline ? "bg-red-600 hover:bg-red-700 text-white" : "gradient-primary text-white"
              }`}
            >
              {isOnline ? "Go Offline" : "Go Online & Start Shift"}
            </Button>
          </CardContent>
        </Card>

        {/* Schedule & Shifts Info */}
        <Card className="md:col-span-7 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Shift Schedule Configuration
            </CardTitle>
            <CardDescription>Roster shifts configured by Committee Secretary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border bg-secondary/10 flex justify-between items-center">
              <div>
                <span className="font-bold block">Regular Shift Hours</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Monday to Saturday</span>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">{activeHours}</Badge>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-foreground">Weekly Duty Guidelines</h4>
              <ul className="list-disc pl-4 space-y-1.5 text-muted-foreground text-[10px]">
                <li>Always mark checklist entries when checking out at the main gates.</li>
                <li>Emergency tasks override regular scheduled tea breaks.</li>
                <li>Ensure battery levels for dispatch handhelds remain above 40%.</li>
                <li>Late-night emergency callouts accrue double-time credits in your performance scorecard.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
