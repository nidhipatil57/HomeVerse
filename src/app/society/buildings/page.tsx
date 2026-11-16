"use client";

import { useState, useEffect, useMemo } from "react";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";

export default function SecretaryBuildingsPage() {
  const { flats, users, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      flats: state.flats || [],
      users: state.users || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initializeDb();
    setMounted(true);
  }, [initializeDb]);

  const buildingStats = useMemo(() => {
    const wings = [
      { wing: "A", name: "Tower A (A Wing)", floors: 3, guard: "Raj Singh (Morning Shift)" },
      { wing: "B", name: "Tower B (B Wing)", floors: 3, guard: "Raj Singh (Evening Shift)" },
      { wing: "C", name: "Tower C (C Wing)", floors: 3, guard: "Raj Singh (Night Shift)" },
    ];

    return wings.map(({ wing, name, floors, guard }) => {
      const wingFlats = flats.filter(f => 
        (f.wing && f.wing.toUpperCase() === wing) ||
        (f.building && f.building.toUpperCase().includes(wing))
      );

      const wingResidents = users.filter(u => 
        (u.role === "resident" || (u.role === "secretary" && u.unit)) &&
        u.status !== "pending" &&
        (
          (u.building && u.building.toUpperCase().includes(wing)) ||
          (u.unit && u.unit.toUpperCase().startsWith(wing))
        )
      );

      // Determine occupied flats
      const occupiedFlatsCount = wingFlats.filter(f => {
        if (f.status === "occupied") return true;
        const fNum = (f.flatNumber || "").replace(/\D/g, "");
        return wingResidents.some(r => (r.unit || "").replace(/\D/g, "") === fNum);
      }).length;

      const totalFlats = wingFlats.length > 0 ? wingFlats.length : (wing === "C" ? 5 : 6);
      const occupied = Math.min(totalFlats, Math.max(occupiedFlatsCount, wingResidents.length));
      const vacant = Math.max(0, totalFlats - occupied);

      return {
        wing,
        name,
        floors,
        totalFlats,
        occupied,
        vacant,
        securityGuard: guard,
        healthStatus: "Excellent",
        residents: wingResidents
      };
    });
  }, [flats, users]);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">Buildings Database</h1>
        <p className="text-muted-foreground mt-1">
          Monitor society towers, wings, occupancy levels, and assigned gatekeepers
        </p>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildingStats.map((block) => (
          <Card key={block.wing} className="border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3 border-b border-secondary/15 bg-secondary/5">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-bold flex items-center gap-1.5"><Building2 className="w-5 h-5 text-primary" /> {block.name}</CardTitle>
                <Badge variant="outline" className="text-[9px] font-bold uppercase py-0.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                  {block.healthStatus}
                </Badge>
              </div>
              <CardDescription className="text-[10px] text-muted-foreground mt-1">
                Structural Safety Check: Verified 2026
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Total Floors</span>
                <span className="font-bold text-foreground">{block.floors} Floors</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Flats Count</span>
                <span className="font-bold text-foreground">{block.totalFlats} Flats</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Occupancy Ratio</span>
                <span className="font-bold text-emerald-600">{block.occupied} Occupied ({block.vacant} vacant)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Assigned Security Guard</span>
                <span className="font-bold text-foreground">{block.securityGuard}</span>
              </div>
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">Residents in {block.wing} Wing ({block.residents.length}):</span>
                <div className="flex flex-wrap gap-1">
                  {block.residents.map(r => (
                    <span key={r.id} className="text-[10px] px-2 py-0.5 rounded bg-secondary/50 text-foreground border border-border/40">
                      {block.wing}-{r.unit?.replace(/^[A-Za-z\s-]+/, '') || r.unit} ({r.name.split(' ')[0]})
                    </span>
                  ))}
                  {block.residents.length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic">No residents assigned yet</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
