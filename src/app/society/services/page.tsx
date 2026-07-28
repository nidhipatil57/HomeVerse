"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar, Clock, User, CheckCircle2, XCircle, Wrench, AlertCircle,
  Play, ShieldCheck, Phone, Clipboard, ArrowRight, Search, Check, Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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

  // Secretary review states
  const [reviewingBooking, setReviewingBooking] = useState<any | null>(null);
  const [adminRemarks, setAdminRemarks] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  const isSecretary = user?.role === "secretary";
  const isManager = user?.role === "manager";

  // Filter bookings based on search & filter status
  const filteredBookings = useMemo(() => {
    return serviceBookings.filter((b) => {
      // 1. Role boundary filtering
      if (isSecretary) {
        // Secretary reviews all bookings
        if (selectedStatusFilter !== "All" && b.status !== selectedStatusFilter) return false;
      } else if (isManager) {
        // Manager only sees bookings forwarded to them or downstream
        const allowedStatuses = [
          "Forwarded to Manager",
          "Scheduled",
          "In Progress",
          "Completed",
          "Cancelled"
        ];
        if (!allowedStatuses.includes(b.status)) return false;
        if (selectedStatusFilter !== "All" && b.status !== selectedStatusFilter) return false;
      } else {
        return false;
      }

      // Search Query
      const query = searchTerm.toLowerCase();
      const residentName = b.resident?.name?.toLowerCase() || "";
      const workerName = b.worker?.name?.toLowerCase() || "";
      const category = b.category?.toLowerCase() || "";
      const unit = b.address?.toLowerCase() || "";

      return residentName.includes(query) || workerName.includes(query) || category.includes(query) || unit.includes(query);
    });
  }, [serviceBookings, searchTerm, selectedStatusFilter, isSecretary, isManager]);

  // Derived status tab categories based on role
  const statusTabs = useMemo(() => {
    if (isSecretary) {
      return ["All", "Pending", "Forwarded to Manager", "Scheduled", "In Progress", "Completed", "Cancelled", "Rejected by Secretary"];
    }
    return ["All", "Forwarded to Manager", "Scheduled", "In Progress", "Completed", "Cancelled"];
  }, [isSecretary]);

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

  const openSecretaryReview = (booking: any) => {
    setReviewingBooking(booking);
    setAdminRemarks("");
  };

  const handleSecretaryAction = async (status: "Forwarded to Manager" | "Rejected by Secretary") => {
    if (!reviewingBooking) return;
    setReviewLoading(true);
    try {
      await updateBookingStatus(reviewingBooking.id, status, {
        adminNotes: adminRemarks,
        forwardedToManager: status === "Forwarded to Manager"
      });
      alert(`Service booking request has been successfully resolved to: ${status}`);
      setReviewingBooking(null);
      setAdminRemarks("");
    } catch (e: any) {
      alert("Failed to update service request: " + e.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "Forwarded to Manager":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      case "Scheduled":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "In Progress":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20 animate-pulse";
      case "Completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "Rejected by Secretary":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            Service Requests Operations 💼
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSecretary 
              ? "Review, approve, and escalate resident local help bookings to the Operations Manager." 
              : "Coordinate, schedule, and track community services bookings escalated by the Secretary."}
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs shrink-0">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search residents, workers, categories..."
            className="pl-9 h-10 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Tab Filter Controls */}
      <div className="flex border border-border/40 rounded-2xl p-1 bg-secondary/15 gap-1 overflow-x-auto max-w-full">
        {statusTabs.map((tab) => (
          <Button
            key={tab}
            variant={selectedStatusFilter === tab ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedStatusFilter(tab)}
            className={`h-8 rounded-xl text-[10px] font-bold transition-all px-3 shrink-0 ${
              selectedStatusFilter === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </Button>
        ))}
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
                <div className="space-y-2 text-left">
                  {bk.notes && (
                    <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/30 text-[11px]">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider text-[8px] block mb-0.5">Resident Notes</span>
                      <p className="text-foreground/80 font-medium">{bk.notes}</p>
                    </div>
                  )}
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
                  {isSecretary && bk.status === "Pending" && (
                    <Button
                      size="sm"
                      onClick={() => openSecretaryReview(bk)}
                      className="text-[10px] h-8 rounded-lg gradient-primary text-white border-0 font-bold px-4"
                    >
                      Review Booking Request
                    </Button>
                  )}

                  {isManager && bk.status === "Forwarded to Manager" && (
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

                  {isManager && bk.status === "Scheduled" && (
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

                  {isManager && bk.status === "In Progress" && (
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

      {/* Secretary Review Modal */}
      <Dialog open={!!reviewingBooking} onOpenChange={(open) => !open && setReviewingBooking(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">Review Resident Booking Request</DialogTitle>
            <DialogDescription>
              Escalate this service request booking to the Operations Manager or decline it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2 text-xs">
            {reviewingBooking && (
              <div className="p-3 bg-secondary/35 rounded-xl border text-left space-y-1">
                <div className="font-bold text-foreground">Requested Service: {reviewingBooking.category}</div>
                <div className="text-muted-foreground">Requested Slot: {reviewingBooking.bookingDate} at {reviewingBooking.bookingTime}</div>
                <div className="text-muted-foreground">Flat: {reviewingBooking.address} • Resident: {reviewingBooking.resident?.name}</div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1 text-left">Administrative Remarks / Notes</label>
              <Textarea
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Remarks for manager escalation or rejection reason..."
                className="rounded-xl min-h-[70px]"
              />
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2 pt-2 border-t mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setReviewingBooking(null)} 
                className="rounded-xl h-10 text-xs px-4"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                disabled={reviewLoading} 
                onClick={() => handleSecretaryAction("Rejected by Secretary")} 
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 text-xs font-bold px-4 border-0"
              >
                Reject Request
              </Button>
              <Button 
                type="button" 
                disabled={reviewLoading} 
                onClick={() => handleSecretaryAction("Forwarded to Manager")} 
                className="gradient-primary text-white border-0 rounded-xl h-10 text-xs font-bold px-5"
              >
                Approve & Escalate
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Visit Modal */}
      <Dialog open={!!schedulingBooking} onOpenChange={(open) => !open && setSchedulingBooking(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card text-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">Schedule Technician Visit</DialogTitle>
            <DialogDescription>
              Log scheduled technician ETA and operational notes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleSubmit} className="space-y-4 mt-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1 text-left">Expected Arrival Date/Time</label>
              <Input
                value={expectedArrival}
                onChange={(e) => setExpectedArrival(e.target.value)}
                placeholder="e.g. 26-07-2026 at 10:00 AM"
                className="rounded-xl h-10"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1 text-left">Operational Dispatch Notes</label>
              <Input
                value={operationalNotes}
                onChange={(e) => setOperationalNotes(e.target.value)}
                placeholder="e.g., Electrician Ramesh dispatched. Placed call to vendor."
                className="rounded-xl h-10"
              />
            </div>

            <DialogFooter className="pt-2 border-t mt-4">
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
