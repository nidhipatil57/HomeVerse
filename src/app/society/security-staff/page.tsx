"use client";

import { useState, useEffect } from "react";
import { Shield, Search, Activity, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SecretarySecurityStaffPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const guardsList = [
    { id: "g1", name: "Rahul Singh", employeeId: "SEC-9040", gate: "Gate 1 (Main Entrance)", shift: "Morning (06:00 AM - 02:00 PM)", status: "On Duty" },
    { id: "g2", name: "Vikram Rathore", employeeId: "SEC-9041", gate: "Gate 1 (Main Entrance)", shift: "Evening (02:00 PM - 10:00 PM)", status: "Off Duty" },
    { id: "g3", name: "Amit Shukla", employeeId: "SEC-9042", gate: "Gate 2 (Service Gate)", shift: "Night (10:00 PM - 06:00 AM)", status: "On Duty" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Security Staff 🛡️
        </h1>
        <p className="text-muted-foreground mt-1">
          Review, activate/deactivate, and manage security guard gate schedules and employee registries
        </p>
      </div>

      {/* Grid */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-semibold">Security Guard Registry</CardTitle>
          <CardDescription>Gatekeepers and working rosters</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {guardsList.map((g) => (
              <div key={g.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-secondary/20 transition-colors text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">{g.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Badge: <strong>{g.employeeId}</strong> | Station: {g.gate}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Shift: {g.shift}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={g.status === "On Duty" ? "default" : "secondary"} className="text-[9px] font-bold">
                    {g.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alert(`Shift change or duty configuration toggled for ${g.name}`)}
                    className="h-8 text-[10px] rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                  >
                    Manage Duty
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
