"use client";

import { motion } from "motion/react";
import { MapPin, Navigation, Clock, Check, ChevronRight, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WorkerRoutePage() {
  const routeSteps = [
    { time: "09:30 AM", flat: "C-105", building: "Tower C", task: "Socket Loose Connection", status: "completed", desc: "Resolved in 20 mins" },
    { time: "11:00 AM", flat: "Common", building: "Tower B Lift", task: "Elevator Vibration Friction", status: "active", desc: "Current location" },
    { time: "12:15 PM", flat: "A-301", building: "Tower A", task: "Kitchen Tap Leaking", status: "pending", desc: "Estimated travel: 3 mins" },
    { time: "02:00 PM", flat: "B-402", building: "Tower B", task: "Fan Regulator Sparking", status: "pending", desc: "Estimated travel: 1 min" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">Today&apos;s Walking Route</h1>
        <p className="text-muted-foreground mt-1">AI-optimized sequence of flats to minimize walking distance and elevation shifts between towers.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <Card className="md:col-span-7 border-border/50">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-500" />
              Walking Path Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {routeSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-4 relative">
                {idx < routeSteps.length - 1 && (
                  <div className="absolute left-5 top-9 bottom-[-24px] w-[2px] bg-border/50" />
                )}
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  step.status === "completed" ? "bg-green-500/20 border border-green-500 text-green-500" :
                  step.status === "active" ? "bg-blue-500/20 border border-blue-500 text-blue-500 animate-pulse" :
                  "bg-secondary border border-border text-muted-foreground"
                }`}>
                  {step.status === "completed" ? <Check className="w-4 h-4" /> : idx + 1}
                </div>

                <div className="flex-1 bg-secondary/10 p-4 rounded-2xl border border-border/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{step.task}</span>
                      <Badge variant="outline" className="text-[10px]">{step.time}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Unit: {step.flat} • {step.building}</p>
                    <p className="text-[11px] text-muted-foreground italic mt-0.5">{step.desc}</p>
                  </div>
                  {step.status === "pending" && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1 text-xs border-0">
                      Navigate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-5 border-border/50 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-[family-name:var(--font-heading)]">Route Efficiency</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              By aligning plumber and electrical jobs according to building wings, our route optimization saved you <span className="font-semibold text-foreground">1.4 km of walking</span> and <span className="font-semibold text-foreground">12 floor elevator transitions</span> today.
            </p>
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs">
              <span className="font-bold text-blue-500 block mb-0.5">Tip:</span>
              Carry all plumbing fittings for Tower A in one go before transitioning back to the main workshop.
            </div>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 border-0 mt-6">
            Recalculate Route
          </Button>
        </Card>
      </div>
    </div>
  );
}
