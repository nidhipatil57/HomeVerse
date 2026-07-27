"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar, Clock, User, CheckCircle2, XCircle, Wrench, AlertCircle,
  Play, ShieldCheck, Phone, Clipboard, ArrowRight, Search, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";

export default function ManagerServicesPage() {
  const { user, initialize } = useAuth();
  const {
    serviceBookings,
    users,
    scheduleBooking,
    completeBooking,
    updateBookingStatus,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      serviceBookings: state.serviceBookings || [],
      users: state.users || [],
      scheduleBooking: state.scheduleBooking,
      completeBooking: state.completeBooking,
      updateBookingStatus: state.updateBookingStatus,
      initializeDb: state.initializeDb
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("All");

  // Booking scheduling states
  const [schedulingBooking, setSchedulingBooking] = useState<any | null>(null);
  const [expectedArrival, setExpectedArrival] = useState("");
  const [operationalNotes, setOperationalNotes] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Filter available workers for assignment
  const availableWorkers = useMemo(() => {
    return users.filter(u => u.role === "worker");
  }, [users]);

  // Filter bookings based on search & filter status
  const filteredBookings = useMemo(() => {
    return serviceBookings.filter((b) => {
      // For Manager: only show bookings approved/forwarded by the Secretary
      const allowedStatuses = [
        "Forwarded to Manager",
        "Scheduled",
        "In Progress",
        "Completed",
        "Cancelled"
      ];
      if (!allowedStatuses.includes(b.status)) return false;

      // Status Filter
      if (selectedStatusFilter !== "All" && b.status !== selectedStatusFilter) return false;

      // Search Query
      const query = searchTerm.toLowerCase();
      const residentName = b.resident?.name?.toLowerCase() || "";
      const workerName = b.worker?.name?.toLowerCase() || "";
      const category = b.category?.toLowerCase() || "";
      const unit = b.address?.toLowerCase() || "";

      return residentName.includes(query) || workerName.includes(query) || category.includes(query) || unit.includes(query);
    });
  }, [serviceBookings, searchTerm, selectedStatusFilter]);

  if (!mounted) return null;

  const handleOpenScheduleModal = (booking: any) => {
    setSchedulingBooking(booking);
    setExpectedArrival(booking.bookingDate + " at " + booking.bookingTime);
    setOperationalNotes("");
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingBooking) return;

    try {
      // Call scheduleBooking store action
      await scheduleBooking(schedulingBooking.id, `Visit scheduled: Expected arrival is ${expectedArrival}. Note: ${operationalNotes}`);
      setSchedulingBooking(null);
      alert("Service visit scheduled successfully!");
    } catch (e: any) {
      alert("Failed to schedule booking: " + e.message);
    }
  };

  const handleStartService = async (id: string) => {
    try {
      await updateBookingStatus(id, "In Progress");
      alert("Service commenced! Status updated to 'In Progress'.");
    } catch (e: any) {
      alert("Failed to start service: " + e.message);
    }
  };

  const handleCompleteService = async (id: string) => {
    try {
      await completeBooking(id, "Completed service visit. Roster closed.");
      alert("Service request completed successfully!");
    } catch (e: any) {
      alert("Failed to complete service: " + e.message);
    }
  };

  const handleCancelService = async (id: string) => {
    if (confirm("Are you sure you want to cancel this service request booking?")) {
      try {
        await updateBookingStatus(id, "Cancelled");
        alert("Service request cancelled.");
      } catch (e: any) {
        alert("Failed to cancel service: " + e.message);
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Forwarded to Manager":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "Scheduled":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "In Progress":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20 animate-pulse";
      case "Completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)]">Service Requests Console 💼</h1>
        <p className="text-muted-foreground mt-1">
          Coordinate, schedule, and track community services bookings escalated by the Secretary.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-secondary/10 p-4 rounded-2xl border border-border/40">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by Flat, resident or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background h-10 text-xs rounded-xl"
          />
        </div>

        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          {["All", "Forwarded to Manager", "Scheduled", "In Progress", "Completed", "Cancelled"].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={selectedStatusFilter === status ? "default" : "outline"}
              onClick={() => setSelectedStatusFilter(status)}
              className="text-[10px] h-8 rounded-xl font-bold"
            >
              {status === "Forwarded to Manager" ? "Forwarded" : status}
            </Button>
          ))}
        </div>
      </div>

      {/* Bookings Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBookings.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground border border-dashed border-border rounded-3xl bg-secondary/5">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/60 mb-3" />
            No service requests match the active filter criteria.
          </div>
        ) : (
          filteredBookings.map((bk) => (
            <Card key={bk.id} className="glass-card hover:shadow-md transition-shadow rounded-2xl border-border/50">
              <CardHeader className="pb-3 border-b border-border/30 bg-secondary/10 p-4 rounded-t-2xl flex flex-row justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Flat {bk.address}</span>
                  <span className="font-bold text-foreground text-sm block">{bk.resident?.name || "Resident"}</span>
                </div>
                <Badge variant="outline" className={`text-[8px] font-extrabold uppercase py-0.5 px-2 rounded-full border ${getStatusBadgeClass(bk.status)}`}>
                  {bk.status}
                </Badge>
              </CardHeader>
              
              <CardContent className="p-4 space-y-4 text-xs">
                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4 border-b border-border/30 pb-3">
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase font-bold">Service Category</span>
                    <span className="font-semibold text-foreground text-xs flex items-center gap-1 mt-0.5">
                      <Wrench className="w-3.5 h-3.5 text-primary" /> {bk.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase font-bold">Requested Slot</span>
                    <span className="font-semibold text-foreground text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {bk.bookingDate} at {bk.bookingTime}
                    </span>
                  </div>
                </div>

                {/* Assigned worker info */}
                <div className="grid grid-cols-2 gap-4 border-b border-border/30 pb-3">
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase font-bold">Assigned Worker</span>
                    <span className="font-semibold text-foreground text-xs flex items-center gap-1 mt-0.5">
                      <User className="w-3.5 h-3.5 text-primary" /> {bk.worker?.name || "Offline Coordinated"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase font-bold">Expected Arrival</span>
                    <span className="font-semibold text-foreground text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-primary" /> {bk.expectedArrival || bk.bookingTime || "Pending Schedule"}
                    </span>
                  </div>
                </div>

                {/* Notes logs */}
                <div className="space-y-2">
                  {bk.adminNotes && (
                    <div className="p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-[11px]">
                      <span className="font-bold text-indigo-500 uppercase tracking-wider text-[8px] block mb-0.5">Secretary Notes</span>
                      <p className="text-foreground/80 font-medium">{bk.adminNotes}</p>
                    </div>
                  )}
                  {bk.operationalNotes && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[11px]">
                      <span className="font-bold text-emerald-600 uppercase tracking-wider text-[8px] block mb-0.5">Manager Coordination Notes</span>
                      <p className="text-foreground/80 font-medium">{bk.operationalNotes}</p>
                    </div>
                  )}
                </div>

                {/* Actions Panel */}
                <div className="flex gap-2 justify-end pt-2">
                  {bk.status === "Forwarded to Manager" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelService(bk.id)}
                        className="text-[10px] h-8 rounded-lg border-red-500/20 text-red-500 hover:bg-red-500/5"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOpenScheduleModal(bk)}
                        className="text-[10px] h-8 rounded-lg gradient-primary text-white border-0"
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1" /> Schedule Visit
                      </Button>
                    </>
                  )}

                  {bk.status === "Scheduled" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelService(bk.id)}
                        className="text-[10px] h-8 rounded-lg border-red-500/20 text-red-500 hover:bg-red-500/5"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStartService(bk.id)}
                        className="text-[10px] h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-0"
                      >
                        <Play className="w-3.5 h-3.5 mr-1" /> Commenced Work
                      </Button>
                    </>
                  )}

                  {bk.status === "In Progress" && (
                    <Button
                      size="sm"
                      onClick={() => handleCompleteService(bk.id)}
                      className="text-[10px] h-8 rounded-lg bg-green-600 hover:bg-green-700 text-white border-0 w-full"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Service Completed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Schedule Visit Modal */}
      <Dialog open={!!schedulingBooking} onOpenChange={(open) => !open && setSchedulingBooking(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">Schedule Technician Visit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleScheduleSubmit} className="space-y-4 mt-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Expected Arrival Date/Time</label>
              <Input
                value={expectedArrival}
                onChange={(e) => setExpectedArrival(e.target.value)}
                placeholder="e.g. 26-07-2026 at 10:00 AM"
                className="rounded-xl h-10"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Operational Dispatch Notes</label>
              <Input
                value={operationalNotes}
                onChange={(e) => setOperationalNotes(e.target.value)}
                placeholder="e.g., Electrician Ramesh dispatched. Placed call to vendor."
                className="rounded-xl h-10"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSchedulingBooking(null)} className="rounded-xl h-10">
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary text-white border-0 rounded-xl h-10 font-bold px-5">
                Save & Schedule Visit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
