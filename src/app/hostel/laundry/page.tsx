"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WashingMachine, Clock, CheckCircle2, AlertTriangle, CalendarPlus, X, HelpCircle, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function LaundryPage() {
  const { user, initialize } = useAuth();
  const { laundrySlots, bookLaundrySlot, cancelLaundrySlot, initializeDb } = useCommunityStore();
  const [mounted, setMounted] = useState(false);

  // Booking dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState("M1");
  const [selectedSlot, setSelectedSlot] = useState("09:00 - 10:00 AM");
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWarden = user?.role === "warden";

  const machines = [
    { id: "M1", name: "Washing Machine #1 (Block A)", floor: 1, type: "Washer", health: 95 },
    { id: "M2", name: "Washing Machine #2 (Block B)", floor: 2, type: "Washer", health: 82 },
    { id: "M3", name: "Dryer #1 (Block A)", floor: 1, type: "Dryer", health: 90 },
    { id: "M4", name: "Dryer #2 (Block B)", floor: 4, type: "Dryer", health: 45 } // damaged/maintenance
  ];

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

    if (selectedMachineId === "M4") {
      setBookingError("This machine is currently under maintenance.");
      return;
    }

    const success = bookLaundrySlot(
      selectedMachineId,
      selectedSlot,
      todayStr,
      user?.id || "user-student-1",
      user?.name || "Aarav Mehta"
    );

    if (success) {
      setBookingSuccess(true);
      setTimeout(() => {
        setDialogOpen(false);
        setBookingSuccess(false);
      }, 1500);
    } else {
      setBookingError("This time slot is already reserved by another student.");
    }
  };

  const getSlotStatus = (machineId: string, slot: string) => {
    const record = laundrySlots.find(
      (s) => s.machineId === machineId && s.slot === slot && s.date === todayStr
    );
    return record;
  };

  // Stats calculation
  const totalSlotsCount = laundrySlots.length;
  const bookedSlotsCount = laundrySlots.filter(s => s.status === "booked").length;
  const availableSlotsCount = totalSlotsCount - bookedSlotsCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Laundry Scheduling 👕</h1>
          <p className="text-muted-foreground mt-1">Book washing machines or dryers, monitor real-time usage, and prevent curfew delays.</p>
        </div>
        
        {!isWarden && (
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
                    className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                  >
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Time Slot</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                  >
                    {slotsList.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full rounded-xl gradient-primary text-white border-0 h-11">
                  Confirm Reservation
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Available Slots Today", value: availableSlotsCount, color: "#22c55e" },
          { label: "Booked Slots Today", value: bookedSlotsCount, color: "#ef4444" },
          { label: "Under Maintenance", value: machines.filter(m => m.health < 50).length, color: "#f59e0b" },
          { label: "Total Machines", value: machines.length, color: "#8b5cf6" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold font-[family-name:var(--font-heading)]" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking Schedules grid */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold">Real-time Machinery Timetable</CardTitle>
          <CardDescription>Privacy protected. Other student bookings show as &quot;Unavailable&quot;.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {machines.map((machine) => {
              const isMaintenance = machine.health < 50;
              return (
                <div key={machine.id} className="p-4 rounded-2xl border border-border/50 bg-secondary/10 space-y-3">
                  <div className="flex justify-between items-center border-b border-border/20 pb-2">
                    <div className="flex items-center gap-2">
                      <WashingMachine className={`w-5 h-5 ${isMaintenance ? "text-red-500 animate-pulse" : "text-emerald-500"}`} />
                      <span className="font-bold text-sm text-foreground">{machine.name}</span>
                    </div>
                    <Badge variant="outline" className={isMaintenance ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"}>
                      {isMaintenance ? "Maintenance Alerts" : `Health: ${machine.health}%`}
                    </Badge>
                  </div>

                  {isMaintenance ? (
                    <div className="text-xs text-red-500 py-2 font-semibold">
                      Out of Service. Thermal regulator failure. Placed on order.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-1">
                      {slotsList.map((slot) => {
                        const booking = getSlotStatus(machine.id, slot);
                        const isBooked = booking?.status === "booked";
                        const isMine = booking?.bookedBy === user?.id;
                        
                        return (
                          <div
                            key={slot}
                            className={`p-2.5 rounded-xl border text-center text-xs flex flex-col justify-between min-h-[70px] ${
                              isMine ? "border-green-500/50 bg-green-500/5 text-green-500" :
                              isBooked ? "border-border bg-secondary/40 text-muted-foreground opacity-60" :
                              "border-border bg-card hover:border-primary/20 hover:bg-secondary/20 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!isBooked && !isWarden) {
                                setSelectedMachineId(machine.id);
                                setSelectedSlot(slot);
                                setDialogOpen(true);
                              }
                            }}
                          >
                            <span className="font-mono text-[9px] block text-muted-foreground leading-none">{slot}</span>
                            <div className="mt-1">
                              {isMine ? (
                                <span className="font-bold block text-[10px]">My Slot</span>
                              ) : isBooked ? (
                                <span className="text-[10px] block text-red-500">Unavailable</span>
                              ) : (
                                <span className="text-[10px] block text-green-600 font-medium">Free</span>
                              )}
                            </div>
                            {isMine && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelLaundrySlot(machine.id, slot, todayStr);
                                }}
                                className="text-[9px] text-red-500 hover:underline mt-1 font-semibold block leading-none"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
