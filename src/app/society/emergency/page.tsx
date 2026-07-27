"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle, Flame, ShieldAlert, Clock, User, Phone, CheckCircle2, Play, Wrench, Search, MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";

export default function EmergencyRequestsPage() {
  const { user, initialize } = useAuth();
  const { complaints, users, actionComplaintManager, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      complaints: state.complaints || [],
      users: state.users || [],
      actionComplaintManager: state.actionComplaintManager,
      initializeDb: state.initializeDb
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [etaInputs, setEtaInputs] = useState<Record<string, string>>({});
  const [opsNotes, setOpsNotes] = useState<Record<string, string>>({});
  const [assigneeId, setAssigneeId] = useState<Record<string, string>>({});

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  const availableWorkers = useMemo(() => {
    return users.filter(u => u.role === "worker");
  }, [users]);

  // Filter complaints to show only emergency/critical items that are active (not completed/resolved)
  const activeEmergencies = useMemo(() => {
    return complaints.filter((c) => {
      const isUrgent = c.emergency === true || c.priority === "emergency" || c.priority === "critical";
      const isActive = !["Completed", "Resolved", "Rejected", "closed"].includes(c.status);
      return isUrgent && isActive;
    });
  }, [complaints]);

  if (!mounted) return null;

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    try {
      await actionComplaintManager(id, {
        status: nextStatus,
        operationalNotes: `Manager triggered emergency update: ${nextStatus}.`
      });
      alert(`Emergency status updated to ${nextStatus}!`);
    } catch (e: any) {
      alert("Failed to update: " + e.message);
    }
  };

  const handleSaveDetails = async (id: string) => {
    const eta = etaInputs[id] || "";
    const notes = opsNotes[id] || "";
    const workerId = assigneeId[id] || "";
    const worker = availableWorkers.find(w => w.id === workerId);

    try {
      await actionComplaintManager(id, {
        assignedTo: worker ? worker.name : undefined,
        assignedToId: workerId || undefined,
        expectedArrival: eta || undefined,
        operationalNotes: notes || undefined
      });
      alert("Emergency coordination details saved successfully.");
      // Clear inputs
      setEtaInputs(prev => ({ ...prev, [id]: "" }));
      setOpsNotes(prev => ({ ...prev, [id]: "" }));
      setAssigneeId(prev => ({ ...prev, [id]: "" }));
    } catch (e: any) {
      alert("Failed to save details: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-600 to-amber-600 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 animate-bounce text-yellow-300" />
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight font-[family-name:var(--font-heading)]">
              Critical Emergency Dashboard 🚨
            </h1>
          </div>
          <p className="text-white/90 text-sm font-medium">
            Active fire, gas leaks, major power failures, lift issues, or severe leaks. Resolving these is priority #1.
          </p>
        </div>
        <Badge className="bg-white/20 text-white border-0 py-1.5 px-3 rounded-full text-xs font-bold shrink-0 animate-pulse">
          ⚠️ {activeEmergencies.length} Critical Alert{activeEmergencies.length !== 1 && "s"} Active
        </Badge>
      </div>

      {/* Roster list of emergencies */}
      <div className="grid grid-cols-1 gap-6">
        {activeEmergencies.length === 0 ? (
          <Card className="border-border/50 py-16 text-center text-muted-foreground rounded-2xl bg-secondary/5">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3 opacity-80" />
            No active emergencies logged. High-level security parameters are green!
          </Card>
        ) : (
          activeEmergencies.map((em) => (
            <Card key={em.id} className="border border-red-500/30 shadow-red-500/5 bg-card rounded-2xl overflow-hidden shadow-lg animate-pulse-slow">
              <CardHeader className="pb-3 border-b border-red-500/10 bg-red-500/5 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-red-500 text-white border-0 py-0.5 px-2.5 rounded-full text-[9px] font-extrabold uppercase animate-pulse">
                      {em.category}
                    </Badge>
                    <span className="font-mono text-[10px] text-muted-foreground font-bold">ID: {em.id}</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground font-[family-name:var(--font-heading)]">{em.title}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" /> Flat {em.unit}, {em.building} · Logged {new Date(em.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] py-1 px-3 border-red-500/30 text-red-500 font-extrabold uppercase shrink-0">
                  {em.status}
                </Badge>
              </CardHeader>
              
              <CardContent className="p-5 space-y-5 text-xs">
                {/* Description block */}
                <div className="space-y-1.5">
                  <span className="font-bold text-red-500 uppercase tracking-wider text-[9px] block">Emergency Statement</span>
                  <p className="p-3.5 bg-red-500/5 rounded-xl border border-red-500/10 text-foreground text-sm font-semibold">
                    {em.description}
                  </p>
                </div>

                {/* Operations logs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/15 rounded-xl border border-border/40 space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Coordinator details</span>
                    <p className="font-semibold">Technician: <span className="text-foreground">{em.assignedTo || "Not assigned yet"}</span></p>
                    <p className="font-semibold">Expected ETA: <span className="text-foreground">{em.expectedArrival || "Coordinating dispatch"}</span></p>
                  </div>
                  <div className="p-3 bg-secondary/15 rounded-xl border border-border/40 space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Manager operational notes</span>
                    <p className="italic text-foreground/80 font-medium">"{em.operationalNotes || "No notes logged"}"</p>
                  </div>
                </div>

                {/* Active coordination form */}
                <div className="p-4 bg-secondary/10 border border-border/40 rounded-xl space-y-4">
                  <span className="font-bold text-foreground text-xs block">Coordinate Emergency Dispatch</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] text-muted-foreground block mb-1">Assign Emergency Technician</label>
                      <select
                        value={assigneeId[em.id] || ""}
                        onChange={(e) => setAssigneeId(prev => ({ ...prev, [em.id]: e.target.value }))}
                        className="w-full h-8 px-2 rounded-lg border border-border bg-card text-[10px]"
                      >
                        <option value="">Select Worker</option>
                        {availableWorkers.map(w => (
                          <option key={w.id} value={w.id}>{w.name} ({w.workerCategory || "Utility"})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] text-muted-foreground block mb-1">Emergency ETA</label>
                      <Input
                        placeholder="e.g. Within 15 minutes"
                        value={etaInputs[em.id] || ""}
                        onChange={(e) => setEtaInputs(prev => ({ ...prev, [em.id]: e.target.value }))}
                        className="h-8 text-[10px]"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] text-muted-foreground block mb-1">Operational Dispatch Notes</label>
                      <Input
                        placeholder="e.g. Fire services contacted. Main power tripped."
                        value={opsNotes[em.id] || ""}
                        onChange={(e) => setOpsNotes(prev => ({ ...prev, [em.id]: e.target.value }))}
                        className="h-8 text-[10px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-2 pt-2 border-t border-border/30">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(em.id, "Work In Progress")}
                        className="h-8 text-[9px] border-amber-500/20 text-amber-600 hover:bg-amber-500/5 font-semibold"
                      >
                        <Play className="w-3.5 h-3.5 mr-1" /> Start Repair
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(em.id, "Completed")}
                        className="h-8 text-[9px] bg-green-600 hover:bg-green-700 text-white font-semibold border-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolve Emergency
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSaveDetails(em.id)}
                      className="h-8 text-[9px] gradient-primary text-white border-0 font-bold px-4"
                    >
                      Save Dispatch Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
