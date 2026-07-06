"use client";

import { useState, useEffect } from "react";
import { Building2, ShieldAlert, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SecretaryBuildingsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const complexBlocks = [
    { name: "Tower A (A Wing)", floors: 12, totalFlats: 48, occupied: 44, vacant: 4, securityGuard: "Rahul (Morning Shift)", healthStatus: "Excellent" },
    { name: "Tower B (B Wing)", floors: 12, totalFlats: 48, occupied: 41, vacant: 7, securityGuard: "Vikram (Evening Shift)", healthStatus: "Repairs Pending" },
    { name: "Tower C (C Wing)", floors: 15, totalFlats: 60, occupied: 52, vacant: 8, securityGuard: "Amit (Night Shift)", healthStatus: "Excellent" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Buildings Database 🏢
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor society towers, wings, structural safety indices, and assigned gatekeepers
        </p>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {complexBlocks.map((block, i) => (
          <Card key={i} className="border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3 border-b border-secondary/15 bg-secondary/5">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <Building2 className="w-5 h-5 text-primary" /> {block.name}
                </CardTitle>
                <Badge variant={block.healthStatus === "Excellent" ? "outline" : "destructive"} className="text-[8px] font-bold uppercase py-0.5">
                  {block.healthStatus}
                </Badge>
              </div>
              <CardDescription className="text-[10px] text-muted-foreground mt-1">
                Structural Safety Check: Verified 2026
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Total Floors / Height</span>
                <span className="font-bold text-foreground">{block.floors} Floors</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Flats Count</span>
                <span className="font-bold text-foreground">{block.totalFlats} Flats</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Occupancy Ratio</span>
                <span className="font-bold text-green-500">{block.occupied} Occupied ({block.vacant} vacant)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Assigned Security Guard</span>
                <span className="font-bold text-foreground">{block.securityGuard}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
