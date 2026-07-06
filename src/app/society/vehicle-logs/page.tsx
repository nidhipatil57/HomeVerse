"use client";

import { useState, useEffect } from "react";
import { Car, Clock, Search, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecurityVehicleLogsPage() {
  const { user, initialize } = useAuth();
  const {
    vehicleLogs, logVehicleEntry, logVehicleExit, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      vehicleLogs: state.vehicleLogs || [],
      logVehicleEntry: state.logVehicleEntry,
      logVehicleExit: state.logVehicleExit,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  // Form State
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerType, setOwnerType] = useState<"resident" | "visitor">("visitor");
  const [unit, setUnit] = useState("");
  const [building, setBuilding] = useState("Tower A");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber || !ownerName) return;

    logVehicleEntry({
      vehicleNumber: vehicleNumber.toUpperCase(),
      ownerName,
      ownerType,
      unit: unit || "N/A",
      building
    });

    setVehicleNumber("");
    setOwnerName("");
    setUnit("");
    alert("Vehicle entry logged successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Vehicle Logs 🚗
        </h1>
        <p className="text-muted-foreground mt-1">
          Record society vehicle arrivals, log license plate entry records, and checkout departing cars
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <Card className="lg:col-span-5 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold">Log Vehicle Entry</CardTitle>
            <CardDescription>Enter arriving license plates & credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddVehicleSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">License Plate Number</label>
                <Input placeholder="e.g. MH 12 AB 1234" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} className="h-9 rounded-lg text-xs" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Driver/Owner Name</label>
                  <Input placeholder="Driver Name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="h-9 rounded-lg text-xs" required />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Owner Category</label>
                  <select value={ownerType} onChange={(e) => setOwnerType(e.target.value as any)} className="w-full h-9 px-3.5 border rounded-lg text-xs bg-card">
                    <option value="visitor">Visitor / Delivery</option>
                    <option value="resident">Resident Member</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Visiting Unit/Flat</label>
                  <Input placeholder="e.g. A-301" value={unit} onChange={(e) => setUnit(e.target.value)} className="h-9 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Tower Block</label>
                  <select value={building} onChange={(e) => setBuilding(e.target.value)} className="w-full h-9 px-3.5 border rounded-lg text-xs bg-card">
                    <option>Tower A</option>
                    <option>Tower B</option>
                    <option>Tower C</option>
                    <option>Commercial Wing</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full h-9 rounded-lg gradient-primary text-white border-0 text-xs font-semibold shadow-sm">
                Log Entry & Lift Barrier
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Active Logs list */}
        <Card className="lg:col-span-7 border-border/50 flex flex-col h-[500px] overflow-hidden">
          <CardHeader className="border-b border-border/20 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-primary" /> Active Gated Parking Vehicles ({vehicleLogs.filter(v => v.status === "inside").length})
            </CardTitle>
            <CardDescription>Vehicles logged inside complex gates currently</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {vehicleLogs.filter(v => v.status === "inside").length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No active outside vehicles currently logged inside.
              </div>
            ) : (
              vehicleLogs.filter(v => v.status === "inside").map((v) => (
                <div key={v.id} className="p-3.5 rounded-xl border border-border/50 bg-secondary/15 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold font-mono tracking-wide text-foreground">{v.vehicleNumber}</h4>
                    <p className="text-[10px] text-muted-foreground">Driver: {v.ownerName} ({v.ownerType}) • Flat: {v.unit}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">In: {new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      logVehicleExit(v.id);
                      alert("Vehicle marked Checked Out.");
                    }}
                    className="border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl h-8 text-[10px] font-semibold"
                  >
                    Log Exit
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
