"use client";

import { motion } from "motion/react";
import { AlertTriangle, MapPin, PhoneCall, ShieldAlert, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WorkerEmergencyPage() {
  const emergencies = [
    { id: "e-1", title: "Lift Failure - Tower B Elevator 1", desc: "Elderly resident trapped on 8th Floor. Lift technician dispatched.", time: "5 min ago", severity: "critical", location: "Tower B Lift Area" },
    { id: "e-2", title: "Common Corridor Power Outage", desc: "Tower A floors 3 to 12 completely dark. Safety hazard reported.", time: "15 min ago", severity: "high", location: "Tower A Corridor" },
    { id: "e-3", title: "Basement Water Valve Burst", desc: "Tower C Parking level B2 flooding near electricity meter box.", time: "30 min ago", severity: "critical", location: "Tower C Basement B2" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-red-500">Critical Emergency Actions</h1>
        <p className="text-muted-foreground mt-1">Review urgent safety complaints and emergency deployments currently active in the society.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-4">
          {emergencies.map((e, idx) => (
            <Card key={idx} className="border-red-500/20 bg-red-500/[0.01] hover:bg-red-500/[0.02] transition-colors">
              <CardContent className="p-5 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block">{e.severity} Severity</span>
                      <h4 className="text-base font-bold text-foreground mt-0.5">{e.title}</h4>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{e.time}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-normal">{e.desc}</p>
                  
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Location: {e.location}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1.5 text-xs border-0">
                      Respond Immediately
                    </Button>
                    <Button size="sm" variant="outline" className="border-border text-muted-foreground rounded-lg px-3 py-1.5 text-xs">
                      Contact Safety Desk
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="md:col-span-4 border-border/50 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Safety Protocols
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you encounter a gas leakage or fire hazard, immediately trigger the master alarm switch and contact the fire marshal prior to starting operations.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-secondary/30">
                <span className="text-muted-foreground">Emergency Hotline:</span>
                <span className="font-bold flex items-center gap-1"><PhoneCall className="w-3 h-3 text-red-500" /> +91-100-2940</span>
              </div>
              <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-secondary/30">
                <span className="text-muted-foreground">Main Gate Intercom:</span>
                <span className="font-bold">#009</span>
              </div>
            </div>
          </div>
          <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 border-0 mt-6 animate-pulse">
            Broadcast Emergency Alert
          </Button>
        </Card>
      </div>
    </div>
  );
}
