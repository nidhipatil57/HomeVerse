"use client";

import { useState, useEffect, useMemo } from "react";
import { Wrench, Shield, Users, Check, Clock, LogIn, LogOut, Search, MapPin, BadgeCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import type { Helper, HelperAttendance } from "@/types";

export default function SecurityHelpersEntryPage() {
  const { user } = useAuth();
  const {
    helpers, attendance, checkInHelper, checkOutHelper, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      helpers: state.helpers || [],
      attendance: state.attendance || [],
      checkInHelper: state.checkInHelper,
      checkOutHelper: state.checkOutHelper,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGate, setSelectedGate] = useState("Main Gate");

  // Gate actions state
  const [showGateModal, setShowGateModal] = useState(false);
  const [gateAction, setGateAction] = useState<"check-in" | "check-out">("check-in");
  const [selectedHelper, setSelectedHelper] = useState<Helper | null>(null);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string>("");

  useEffect(() => {
    initializeDb();
    setMounted(true);
  }, [initializeDb]);

  // Merge default helpers with Firestore data so it's always populated for testing
  const allHelpers = useMemo(() => {
    // Standard seeded helpers
    const defaultMaids: Helper[] = [
      {
        id: "user-worker-8",
        name: "Sunita Patil",
        category: "Cooking + Cleaning",
        phone: "+91 87654 32118",
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        expectedArrival: "08:30 AM",
        expectedExit: "11:30 AM",
        assignedFlats: ["A-204", "A-302", "C-201"],
        assignedResidents: ["Sara Shah", "Rahul Mehta", "Priya Desai"],
        residentIds: ["user-resident-1", "user-resident-6", "user-resident-9"],
        joinedAt: new Date().toISOString(),
        portal: "society"
      },
      {
        id: "dw-1",
        name: "Kamla Bai",
        category: "Maid",
        phone: "+91 91000 20001",
        workingDays: ["Monday", "Wednesday", "Friday"],
        expectedArrival: "09:00 AM",
        expectedExit: "12:00 PM",
        assignedFlats: ["A-301", "B-102"],
        assignedResidents: ["Nidhi Rao", "Karan Johar"],
        residentIds: ["user-resident-3", "user-resident-2"],
        joinedAt: new Date().toISOString(),
        portal: "society"
      },
      {
        id: "dw-2",
        name: "Shankar Kumar",
        category: "Cook",
        phone: "+91 91000 20002",
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        expectedArrival: "07:30 AM",
        expectedExit: "10:30 AM",
        assignedFlats: ["A-301", "C-504"],
        assignedResidents: ["Nidhi Rao", "Vikram Sen"],
        residentIds: ["user-resident-3", "user-resident-10"],
        joinedAt: new Date().toISOString(),
        portal: "society"
      }
    ];

    const merged = [...helpers];
    defaultMaids.forEach(dm => {
      if (!merged.some(h => h.id === dm.id)) {
        merged.push(dm);
      }
    });

    return merged;
  }, [helpers]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Filter lists based on search
  const filteredHelpers = useMemo(() => {
    return allHelpers.filter(h =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.phone.includes(searchQuery) ||
      h.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.assignedFlats.some(f => f.includes(searchQuery))
    );
  }, [allHelpers, searchQuery]);

  const currentlyInside = useMemo(() => {
    return attendance.filter(a => a.date === todayStr && !a.checkOutTime);
  }, [attendance, todayStr]);

  if (!mounted || !user) return null;

  const triggerCheckIn = (helper: Helper) => {
    setSelectedHelper(helper);
    setGateAction("check-in");
    setShowGateModal(true);
  };

  const triggerCheckOut = (attId: string, helperName: string) => {
    setSelectedAttendanceId(attId);
    setSelectedHelper({ name: helperName } as any);
    setGateAction("check-out");
    setShowGateModal(true);
  };

  const executeGateAction = async (gate: string) => {
    if (gateAction === "check-in") {
      if (selectedHelper) {
        await checkInHelper(selectedHelper.id, selectedHelper.name, selectedHelper.category, gate, selectedHelper.assignedFlats);
      }
    } else {
      await checkOutHelper(selectedAttendanceId, gate);
    }
    setShowGateModal(false);
    alert(`${gateAction === "check-in" ? "Entry" : "Exit"} registered at ${gate}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-500" /> Daily Helper Attendance
        </h1>
        <p className="text-muted-foreground mt-1">
          Security Gate verification console for daily helpers, maids, cooks, and cleaning workers.
        </p>
      </div>

      {/* Verification Hub */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Registered roster search */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold">Registered Domestic Helpers</CardTitle>
                <CardDescription>Verify schedule and log gate entry/exit logs</CardDescription>
              </div>
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search by Flat, Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              {filteredHelpers.length === 0 ? (
                <p className="text-center py-12 text-xs text-muted-foreground">No helpers found matching query.</p>
              ) : (
                filteredHelpers.map((h) => {
                  const todayLog = attendance.find(a => a.workerId === h.id && a.date === todayStr);
                  const isInside = !!(todayLog && !todayLog.checkOutTime);
                  const isCheckedOut = !!(todayLog && todayLog.checkOutTime);

                  return (
                    <div key={h.id} className="p-4 border border-border/60 bg-secondary/15 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs transition-all hover:border-primary/20">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-foreground text-sm">{h.name}</span>
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold">{h.category}</Badge>
                          {isInside && <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[9px] animate-pulse">Inside Society</Badge>}
                          {isCheckedOut && <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px]">Checked Out</Badge>}
                        </div>
                        <p className="text-muted-foreground">
                          Flats: <span className="font-bold text-foreground">{h.assignedFlats.join(", ")}</span> • Shift: {h.expectedArrival} – {h.expectedExit}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Phone: {h.phone}</p>
                      </div>

                      <div className="flex gap-2">
                        {!isInside ? (
                          <Button
                            onClick={() => triggerCheckIn(h)}
                            disabled={isCheckedOut}
                            className="bg-green-600 hover:bg-green-700 text-white border-0 h-9 px-4 rounded-xl text-xs font-semibold"
                          >
                            <LogIn className="w-3.5 h-3.5 mr-1" /> Log Entry
                          </Button>
                        ) : (
                          <Button
                            onClick={() => triggerCheckOut(todayLog.id, h.name)}
                            className="bg-amber-600 hover:bg-amber-700 text-white border-0 h-9 px-4 rounded-xl text-xs font-semibold"
                          >
                            <LogOut className="w-3.5 h-3.5 mr-1" /> Log Exit
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

        {/* Right Column: Live Status inside society */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-border/50 bg-card flex flex-col h-[500px] overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Users className="w-4.5 h-4.5 text-green-500" /> Active Inside Complex ({currentlyInside.length})</CardTitle>
              <CardDescription className="text-[10px]">Domestic workers currently inside the residential flats</CardDescription>
            </CardHeader>
            <CardContent className="p-3 flex-1 overflow-y-auto space-y-2.5">
              {currentlyInside.length === 0 ? (
                <p className="text-center py-20 text-[11px] text-muted-foreground italic">No helpers registered inside right now.</p>
              ) : (
                currentlyInside.map((att) => (
                  <div key={att.id} className="p-3 border border-border/40 bg-secondary/5 rounded-xl flex justify-between items-center text-[11px]">
                    <div>
                      <p className="font-bold text-foreground">{att.workerName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{att.workerCategory} • Flats: {att.assignedFlats.join(", ")}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] mb-1 font-bold">{att.entryGate}</Badge>
                      <p className="text-[9px] text-muted-foreground font-semibold">Entry: {new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* GATE VERIFICATION SELECTION DIALOG */}
      <Dialog open={showGateModal} onOpenChange={setShowGateModal}>
        <DialogContent className="sm:max-w-xs rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)] text-sm">Verify Gate Selection</DialogTitle>
            <CardDescription className="text-[10px] mt-1">Select the gate where {selectedHelper?.name} is passing</CardDescription>
          </DialogHeader>
          <div className="grid gap-2 mt-3">
            {["Main Gate", "Tower A Gate", "Tower B Gate", "North Gate", "South Gate"].map((gate) => (
              <Button
                key={gate}
                onClick={() => executeGateAction(gate)}
                className="h-10 text-xs bg-secondary/20 hover:bg-secondary/40 text-foreground border border-border/40 rounded-xl font-bold"
              >
                {gate}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
