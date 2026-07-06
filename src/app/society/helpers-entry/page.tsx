"use client";

import { useState, useEffect } from "react";
import { Wrench, Shield, Users, Check, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecurityHelpersEntryPage() {
  const { user, initialize } = useAuth();
  const {
    users, complaints, updateComplaintStatus, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      users: state.users || [],
      complaints: state.complaints || [],
      updateComplaintStatus: state.updateComplaintStatus,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  // Domestic workers (mock registered helpers)
  const domesticWorkers = [
    { id: "dw-1", name: "Kamla Bai", category: "Maid", assignedUnits: ["A-301", "B-102"], phone: "+91 91000 20001", status: "expected" },
    { id: "dw-2", name: "Shankar Kumar", category: "Cook", assignedUnits: ["A-301", "C-504"], phone: "+91 91000 20002", status: "inside" },
    { id: "dw-3", name: "Pooja Sharma", category: "Deep Cleaning", assignedUnits: ["B-404"], phone: "+91 91000 20003", status: "expected" },
  ];
  const [activeWorkers, setActiveWorkers] = useState<Record<string, string>>({
    "dw-2": new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Cook is inside
  });

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  // Service Plumbers / Electricians (assigned complaints)
  const assignedServiceWorkers = complaints.filter(
    (c) => c.portal === "society" && (c.status === "assigned" || c.status === "in-progress") && c.assignedTo
  );

  const handleWorkerGateAction = (workerId: string, name: string, assignedFlats: string[]) => {
    const isInside = activeWorkers[workerId];
    if (isInside) {
      const updated = { ...activeWorkers };
      delete updated[workerId];
      setActiveWorkers(updated);

      // Notify residents
      assignedFlats.forEach((flat) => {
        const resident = users.find(u => u.unit === flat);
        if (resident) {
          useCommunityStore.getState().sendNotification(
            resident.id,
            "Helper Left Society 🚪",
            `Your domestic helper ${name} has checked out of Gate 1.`,
            "info"
          );
        }
      });
      alert(`${name} marked Checked Out.`);
    } else {
      setActiveWorkers(prev => ({
        ...prev,
        [workerId]: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      // Notify residents
      assignedFlats.forEach((flat) => {
        const resident = users.find(u => u.unit === flat);
        if (resident) {
          useCommunityStore.getState().sendNotification(
            resident.id,
            "Helper Checked In 🏢",
            `Your domestic helper ${name} has checked into the main gate.`,
            "success"
          );
        }
      });
      alert(`${name} marked Checked In.`);
    }
  };

  const handleServiceGateAction = (complaintId: string, workerName: string, residentId: string, isEntering: boolean) => {
    if (isEntering) {
      updateComplaintStatus(complaintId, "in-progress", {
        by: workerName,
        note: "Worker verified at gate and entered society."
      });
      useCommunityStore.getState().sendNotification(
        residentId,
        "Worker Entered Society 🛠️",
        `Assigned worker ${workerName} has entered the gate and is on the way.`,
        "success"
      );
      alert(`${workerName} checked in.`);
    } else {
      updateComplaintStatus(complaintId, "resolved", {
        by: workerName,
        note: "Worker exited gate. Service ticket marked resolved."
      });
      useCommunityStore.getState().sendNotification(
        residentId,
        "Service Completed & Exited",
        `Assigned worker ${workerName} has checked out at the gate. Service ticket marked resolved.`,
        "success"
      );
      alert(`${workerName} checked out and ticket resolved.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Helpers & Trades Entry 🛠️
        </h1>
        <p className="text-muted-foreground mt-1">
          Verify and log daily domestic maids, cooks, and dispatched plumbers or technicians at gate entry
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Domestic Helpers */}
        <Card className="lg:col-span-6 border-border/50 flex flex-col h-[500px] overflow-hidden">
          <CardHeader className="border-b border-border/20 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Users className="w-4.5 h-4.5 text-primary" /> Registered Domestic Helpers
            </CardTitle>
            <CardDescription>Click to log check-in / check-out</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {domesticWorkers.map((dw) => {
              const isInside = activeWorkers[dw.id];
              return (
                <div key={dw.id} className="p-3.5 rounded-xl border border-border/50 bg-secondary/15 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold">{dw.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{dw.category} • Flats: {dw.assignedUnits.join(", ")}</p>
                    {isInside && <p className="text-[9px] text-green-500 font-semibold mt-0.5">Entered at {isInside}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant={isInside ? "outline" : "default"}
                    onClick={() => handleWorkerGateAction(dw.id, dw.name, dw.assignedUnits)}
                    className={`rounded-xl h-8 text-[10px] font-semibold flex items-center gap-1 shrink-0 ${
                      isInside ? "border-red-500/20 text-red-500 hover:bg-red-500/10" : "gradient-primary text-white border-0 shadow-sm"
                    }`}
                  >
                    {isInside ? "Mark Out" : "Mark Entry"}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right: Service Plumbers / Electricians */}
        <Card className="lg:col-span-6 border-border/50 flex flex-col h-[500px] overflow-hidden">
          <CardHeader className="border-b border-border/20 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Wrench className="w-4.5 h-4.5 text-primary" /> Active Service Technicians Dispatched
            </CardTitle>
            <CardDescription>Verification and exit logging for complaint tickets</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {assignedServiceWorkers.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No service technicians dispatched or active today.
              </div>
            ) : (
              assignedServiceWorkers.map((ticket) => {
                const isInside = ticket.status === "in-progress";
                return (
                  <div key={ticket.id} className="p-3.5 rounded-xl border border-border/50 bg-secondary/15 flex flex-col gap-2.5 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">Technician: {ticket.assignedTo}</h4>
                        <p className="text-[10px] text-muted-foreground">{ticket.category} Ticket for Flat {ticket.unit}</p>
                      </div>
                      <Badge className={isInside ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"}>
                        {isInside ? "Inside Premises" : "Assigned"}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      {!isInside ? (
                        <Button
                          size="sm"
                          onClick={() => handleServiceGateAction(ticket.id, ticket.assignedTo || "Ramesh", ticket.raisedBy || "user-resident-1", true)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-8 border-0 text-[10px] font-semibold"
                        >
                          Log Check In
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleServiceGateAction(ticket.id, ticket.assignedTo || "Ramesh", ticket.raisedBy || "user-resident-1", false)}
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-8 border-0 text-[10px] font-semibold"
                        >
                          Log Completion & Check Out
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
