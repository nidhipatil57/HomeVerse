"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  WashingMachine, Clock, CheckCircle2, AlertTriangle, CalendarPlus, X, HelpCircle,
  Check, Play, Key, Settings, RefreshCw, BarChart3, Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function LaundryPage() {
  const { user, initialize } = useAuth();
  const { laundrySlots, bookLaundrySlot, cancelLaundrySlot, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      laundrySlots: state.laundrySlots || [],
      bookLaundrySlot: state.bookLaundrySlot,
      cancelLaundrySlot: state.cancelLaundrySlot,
      initializeDb: state.initializeDb,
    }))
  );
  
  const [mounted, setMounted] = useState(false);

  // Booking dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState("M1");
  const [selectedSlot, setSelectedSlot] = useState("09:00 - 10:00 AM");
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Warden local state for machine status overrides
  const [machineHealths, setMachineHealths] = useState<Record<string, number>>({
    M1: 95, M2: 82, M3: 90, M4: 45
  });

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWarden = user?.role === "warden";

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

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess(false);

    const matchMachine = machines.find(m => m.id === selectedMachineId);
    if (matchMachine && matchMachine.health < 50) {
      setBookingError("This machine is marked out of order by the warden.");
      return;
    }

    const success = bookLaundrySlot(
      selectedMachineId,
      selectedSlot,
      todayStr,
      user?.id || "student-user-1",
      user?.name || "Aarav Mehta"
    );

    if (success) {
      setBookingSuccess(true);
      setTimeout(() => {
        setDialogOpen(false);
        setBookingSuccess(false);
      }, 1200);
    } else {
      setBookingError("This timeslot has already been reserved.");
    }
  };

  const toggleMachineMaintenance = (id: string) => {
    const current = machineHealths[id] || 90;
    const newHealth = current > 50 ? 30 : 95; // Toggle between bad and good
    setMachineHealths({
      ...machineHealths,
      [id]: newHealth
    });
    alert(`Machine ${id} status updated.`);
  };

  // Stats calculation
  const totalSlotsCount = machines.length * slotsList.length;
  const bookedSlots = laundrySlots.filter(s => s.status === "booked" && s.date === todayStr);
  const bookedSlotsCount = bookedSlots.length;
  const availableSlotsCount = totalSlotsCount - bookedSlotsCount;

  // --- WARDEN MANAGEMENT VIEW ---
  if (isWarden) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
              <WashingMachine className="w-8 h-8 text-primary" /> Machinery & Laundry Command Deck
            </h1>
            <p className="text-muted-foreground mt-1">Audit active washer reservations, toggle machinery out-of-order flags, and review timetables</p>
          </div>
          <Button variant="outline" className="rounded-xl text-xs h-10">
            <RefreshCw className="w-4.5 h-4.5 mr-1.5" /> Re-sync Timetables
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Bookings Today", value: bookedSlotsCount, color: "#3b82f6", icon: Clock },
            { label: "Available Laundry Slots", value: availableSlotsCount, color: "#22c55e", icon: CheckCircle2 },
            { label: "Machinery Out of Order", value: machines.filter(m => m.health < 50).length, color: "#ef4444", icon: AlertTriangle },
            { label: "Total Machines Monitored", value: machines.length, color: "#8b5cf6", icon: Settings },
          ].map((s) => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold font-[family-name:var(--font-heading)]">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Machine Controls */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-bold">Machinery Status Registry</CardTitle>
                <CardDescription>Manually toggle machine state and trigger maintenance overrides</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {machines.map((machine) => {
                  const isMaintenance = machine.health < 50;
                  return (
                    <div key={machine.id} className="p-3.5 rounded-xl border border-border/50 bg-secondary/5 flex items-center justify-between text-xs gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{machine.name}</span>
                          <Badge variant="outline" className={isMaintenance ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"}>
                            Health: {machine.health}%
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-0.5">Floor: {machine.floor} • Type: {machine.type}</p>
                      </div>
                      <Button
                        onClick={() => toggleMachineMaintenance(machine.id)}
                        size="sm"
                        variant={isMaintenance ? "default" : "outline"}
                        className={`rounded-lg text-[10px] h-8 px-2.5 ${isMaintenance ? "bg-green-600 hover:bg-green-700 text-white border-0" : "border-red-500/20 text-red-500 hover:bg-red-500/5"}`}
                      >
                        {isMaintenance ? "Resolve Maintenance" : "Flag Defect"}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Active Bookings ledger */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-bold">Student Reservations Ledger</CardTitle>
                <CardDescription>Timetable listings of all bookings registered for today</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {bookedSlots.map((slot) => {
                    const matchMachine = machines.find(m => m.id === slot.machineId);
                    return (
                      <div key={slot.id} className="p-3 rounded-xl border border-border/50 bg-secondary/5 flex items-center justify-between text-xs gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">{slot.bookedByName}</span>
                            <span className="text-[10px] text-muted-foreground">· Slot: {slot.slot}</span>
                          </div>
                          <p className="text-muted-foreground mt-0.5">
                            Machine: {matchMachine?.name || slot.machineId} ({slot.date})
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            cancelLaundrySlot(slot.machineId, slot.slot, slot.date);
                            alert("Booking cancelled.");
                          }}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500 rounded-lg shrink-0"
                          title="Revoke Booking Slot"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                  {bookedSlots.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      No active bookings recorded today.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // --- STUDENT VIEW (Timetable and Bookings) ---
  const myBookings = laundrySlots.filter(s => s.bookedBy === user?.id && s.status === "booked" && s.date === todayStr);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Laundry Scheduling 👕</h1>
          <p className="text-muted-foreground mt-1">Book washing machines or dryers and monitor real-time availability</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                <CalendarPlus className="w-4 h-4 mr-2" /> Book Laundry Slot
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)]">Reserve Machine Slot</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBookingSubmit} className="space-y-4 mt-2">
              {bookingError && (
                <div className="p-3 text-xs font-semibold bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                  {bookingError}
                </div>
              )}
              {bookingSuccess && (
                <div className="p-3 text-xs font-semibold bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Booking reserved successfully!
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Machine</label>
                <select
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-input bg-card text-xs"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.type}) {m.health < 50 ? "[OUT OF ORDER]" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Time Slot</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-input bg-card text-xs"
                >
                  {slotsList.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full rounded-xl gradient-primary text-white border-0 h-11 font-semibold text-xs mt-2">
                Confirm Reservation
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Available Slots Today", value: availableSlotsCount, color: "#22c55e" },
          { label: "My Booked Slots", value: myBookings.length, color: "#3b82f6" },
          { label: "Under Maintenance", value: machines.filter(m => m.health < 50).length, color: "#ef4444" },
          { label: "Total Machinery", value: machines.length, color: "#8b5cf6" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Machinery timetable grid */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold">Real-time Machinery Timetable</CardTitle>
          <CardDescription>Other students' booking details are hidden to respect privacy.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {machines.map((machine) => {
              const isMaintenance = machine.health < 50;
              return (
                <div key={machine.id} className="p-4 rounded-xl border border-border/50 bg-secondary/10 space-y-3">
                  <div className="flex justify-between items-center border-b border-border/20 pb-2">
                    <div className="flex items-center gap-2">
                      <WashingMachine className={`w-5 h-5 ${isMaintenance ? "text-red-500 animate-pulse" : "text-emerald-500"}`} />
                      <span className="font-bold text-sm text-foreground">{machine.name}</span>
                    </div>
                    {isMaintenance ? (
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20" variant="outline">
                        Out of Order
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline">
                        Active Health: {machine.health}%
                      </Badge>
                    )}
                  </div>

                  {/* Hourly slots */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
                    {slotsList.map((slot) => {
                      const record = laundrySlots.find(
                        (s) => s.machineId === machine.id && s.slot === slot && s.date === todayStr
                      );
                      const isBooked = record && record.status === "booked";
                      const isMine = isBooked && record?.bookedBy === user?.id;

                      let variantStr = "outline";
                      let colorClass = "text-muted-foreground hover:bg-secondary";
                      let label = "Available";

                      if (isMaintenance) {
                        label = "Out of Order";
                        colorClass = "bg-secondary text-muted-foreground/30 border-dashed cursor-not-allowed";
                      } else if (isMine) {
                        label = "My Booking";
                        colorClass = "bg-green-500/10 text-green-500 border-green-500/20";
                      } else if (isBooked) {
                        label = "Reserved";
                        colorClass = "bg-red-500/[0.03] text-red-500/40 border-red-500/10 cursor-not-allowed";
                      }

                      return (
                        <div key={slot} className={`p-2.5 rounded-lg border text-center transition-all flex flex-col justify-between gap-1.5 ${colorClass}`}>
                          <span className="font-semibold block text-[10px]">{slot}</span>
                          <span className="text-[9px] uppercase tracking-wider block font-bold leading-none">{label}</span>
                          
                          {isMine && (
                            <Button
                              onClick={() => {
                                cancelLaundrySlot(machine.id, slot, todayStr);
                                alert("Reservation cancelled successfully.");
                              }}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-full text-[9px] hover:bg-red-500/15 hover:text-red-500 mt-1 font-bold"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
