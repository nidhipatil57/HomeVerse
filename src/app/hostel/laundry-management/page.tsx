"use client";

import { useState, useEffect } from "react";
import { WashingMachine, RefreshCw, Clock, CheckCircle2, AlertTriangle, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function WardenLaundryManagementPage() {
  const { user, initialize } = useAuth();
  const { laundrySlots, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      laundrySlots: state.laundrySlots || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [machineHealths, setMachineHealths] = useState<Record<string, number>>({
    M1: 95, M2: 82, M3: 90, M4: 45
  });

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const initialMachines = [
    { id: "M1", name: "Washing Machine #1 (Block A)", floor: 1, type: "Washer" },
    { id: "M2", name: "Washing Machine #2 (Block B)", floor: 2, type: "Washer" },
    { id: "M3", name: "Dryer #1 (Block A)", floor: 1, type: "Dryer" },
    { id: "M4", name: "Dryer #2 (Block B)", floor: 4, type: "Dryer" }
  ];

  const machines = initialMachines.map(m => ({
    ...m,
    health: machineHealths[m.id] || 90
  }));

  const slotsList = [
    "09:00 - 10:00 AM",
    "10:00 - 11:00 AM",
    "11:00 - 12:00 PM",
    "02:00 - 03:00 PM",
    "03:00 - 04:00 PM"
  ];

  const todayStr = new Date().toISOString().split("T")[0];
  const bookedSlots = laundrySlots.filter(s => s.status === "booked" && s.date === todayStr);

  const toggleMachineMaintenance = (id: string) => {
    const current = machineHealths[id] || 90;
    const newHealth = current > 50 ? 30 : 95; // Toggle
    setMachineHealths({
      ...machineHealths,
      [id]: newHealth
    });
    alert(`Machine ${id} status updated.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            <WashingMachine className="w-8 h-8 text-primary" /> Machinery & Laundry Command Deck
          </h1>
          <p className="text-muted-foreground mt-1">Audit active washer reservations, toggle machinery out-of-order flags, and review timetables</p>
        </div>
      </div>

      {/* Grid of machines */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {machines.map((mac) => {
          const isBroken = mac.health < 50;
          return (
            <Card key={mac.id} className="border-border/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 border-b">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-muted-foreground font-mono">{mac.id} • {mac.type}</span>
                  <Badge variant={isBroken ? "destructive" : "default"} className="text-[8px] py-0">
                    {isBroken ? "Out of Order" : "Active"}
                  </Badge>
                </div>
                <CardTitle className="text-xs font-bold pt-1.5 leading-snug line-clamp-1">{mac.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-3.5 space-y-4 text-xs">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground">Mechanical Health</span>
                  <span className={`font-bold ${isBroken ? "text-red-500" : "text-green-500"}`}>{mac.health}%</span>
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground">Floor Station</span>
                  <span className="font-semibold">{mac.floor}th Floor Lobby</span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleMachineMaintenance(mac.id)}
                  className={`w-full rounded-lg h-8 text-[9px] font-bold ${
                    isBroken ? "border-green-500/20 text-green-500 hover:bg-green-500/10" : "border-red-500/20 text-red-500 hover:bg-red-500/10"
                  }`}
                >
                  {isBroken ? "Mark Online" : "Flag Maintenance Out of Order"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
