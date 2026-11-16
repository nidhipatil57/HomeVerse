"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  CalendarPlus,
  ShieldAlert,
  Info,
  Check,
  XCircle,
  Layers,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

interface FacilityConfig {
  id: string;
  name: string;
  category: string;
  hours: string;
  description: string;
  image: string;
}

const FACILITIES: FacilityConfig[] = [
  {
    id: "badminton",
    name: "Badminton Court",
    category: "Sports",
    hours: "06:00 AM - 10:00 PM",
    description: "Indoor synthetic court with professional lighting and ventilation.",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "gym",
    name: "Gymnasium & Fitness Center",
    category: "Fitness",
    hours: "06:00 AM - 10:00 PM",
    description: "Equipped with cardio stations, free weights, and crossfit accessories.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "pool",
    name: "Swimming Pool",
    category: "Aquatics",
    hours: "06:30 AM - 09:30 PM",
    description: "Temperature-regulated half-Olympic swimming pool with shallow kids section.",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "clubhouse",
    name: "Clubhouse Lounge",
    category: "Recreation",
    hours: "08:00 AM - 11:00 PM",
    description: "Spacious community lounge for meetings, board games, and quiet work.",
    image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "partyhall",
    name: "Community Banquet & Party Hall",
    category: "Events",
    hours: "10:00 AM - 11:00 PM",
    description: "Air-conditioned celebration hall with banquet tables and sound system.",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&auto=format&fit=crop&q=80"
  }
];

const TIME_SLOTS = [
  "06:00 AM - 07:00 AM",
  "07:00 AM - 08:00 AM",
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
  "08:00 PM - 09:00 PM",
  "09:00 PM - 10:00 PM"
];

export default function FacilityBookingPage() {
  const { user, initialize } = useAuth();
  const {
    facilityBookings, facilityConfigurations, loadFacilityBookings, loadFacilityConfigurations,
    bookFacility, cancelFacilityBooking,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      facilityBookings: state.facilityBookings || [],
      facilityConfigurations: state.facilityConfigurations || [],
      loadFacilityBookings: state.loadFacilityBookings,
      loadFacilityConfigurations: state.loadFacilityConfigurations,
      bookFacility: state.bookFacility,
      cancelFacilityBooking: state.cancelFacilityBooking,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  // Today's date formatted as YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);

  const [selectedFacility, setSelectedFacility] = useState(FACILITIES[0].name);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bookingMessage, setBookingMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    void loadFacilityConfigurations().catch(() => {});
    void loadFacilityBookings().catch(() => {});
    const refreshTimer = window.setInterval(() => {
      void loadFacilityBookings().catch(() => {});
      void loadFacilityConfigurations().catch(() => {});
    }, 10000);
    setMounted(true);
    return () => window.clearInterval(refreshTimer);
  }, [initialize, initializeDb, loadFacilityBookings, loadFacilityConfigurations]);

  if (!mounted) return null;

  // Selected facility object
  const activeFacilityObj = FACILITIES.find(f => f.name === selectedFacility) || FACILITIES[0];
  const activeFacilityConfig = facilityConfigurations.find((f) => f.name === selectedFacility);
  const availableSlots = activeFacilityConfig?.timeSlots || TIME_SLOTS;
  const facilityOperational = activeFacilityConfig?.status !== "Maintenance";

  // Map of occupied slots on selected date for selected facility
  const activeBookingsForDate = facilityBookings.filter(
    b => b.facility === selectedFacility && b.date === selectedDate && b.status === "booked"
  );

  const myBookings = facilityBookings.filter(
    b => b.userId === user?.id
  );

  const handleSlotSelect = (slot: string) => {
    const existing = activeBookingsForDate.find(b => b.slot === slot);
    if (existing) {
      if (existing.userId === user?.id) {
        setBookingMessage({ type: "error", text: "You have already reserved this slot." });
      } else {
        setBookingMessage({ type: "error", text: "This slot is occupied by another resident." });
      }
      return;
    }
    setSelectedSlots((current) => current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot]);
    setBookingMessage(null);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlots.length) {
      setBookingMessage({ type: "error", text: "Please select at least one available time slot." });
      return;
    }
    if (!facilityOperational) {
      setBookingMessage({ type: "error", text: "This facility is currently unavailable." });
      return;
    }

    setIsSubmitting(true);
    setBookingMessage(null);

    try {
      const success = await bookFacility({
        facility: selectedFacility,
        date: selectedDate,
        slots: selectedSlots
      });

      if (success) {
        setBookingMessage({
          type: "success",
          text: `Booking confirmed for ${selectedFacility} on ${selectedDate} (${selectedSlots.join(", ")}).`
        });
        setSelectedSlots([]);
      } else {
        setBookingMessage({
          type: "error",
          text: "This timeslot is already reserved. Double booking prevented."
        });
      }
    } catch (err) {
      setBookingMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to confirm reservation. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      await cancelFacilityBooking(bookingId);
      setBookingMessage({
        type: "success",
        text: "Reservation cancelled. The slot has been released for other residents."
      });
    } catch (err) {
      setBookingMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to cancel booking." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Facility Booking</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Resident-to-resident self-service booking. Instant automated confirmation with conflict prevention.
        </p>
      </div>

      {/* Alert banner */}
      {bookingMessage && (
        <div
          className={`p-3.5 text-xs rounded-xl flex items-center justify-between border ${
            bookingMessage.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {bookingMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="font-medium">{bookingMessage.text}</span>
          </div>
          <button
            onClick={() => setBookingMessage(null)}
            className="text-xs hover:opacity-70 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Facility Selection Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {FACILITIES.map((facility) => {
          const isSelected = selectedFacility === facility.name;
          return (
            <button
              key={facility.id}
              type="button"
              onClick={() => {
                setSelectedFacility(facility.name);
                setSelectedSlots([]);
                setBookingMessage(null);
              }}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                  : "border-border/60 bg-card hover:border-primary/40"
              }`}
            >
              <div className="h-20 w-full rounded-xl overflow-hidden mb-2.5 bg-secondary/30 relative">
                <img
                  src={facility.image}
                  alt={facility.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-1.5 left-1.5 bg-card/90 text-foreground text-[9px] font-bold">
                  {facility.category}
                </Badge>
              </div>
              <div>
                <h4 className="font-bold text-xs text-foreground line-clamp-1">{facility.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{facilityConfigurations.find((item) => item.name === facility.name)?.hours || facility.hours}</p>
                    {facilityConfigurations.find((item) => item.name === facility.name)?.status === "Maintenance" && (
                      <p className="text-[9px] text-amber-600 mt-1">Currently unavailable</p>
                    )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Schedule & Slot Selector */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="border-border/60 bg-card">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Available Slots · {selectedFacility}</CardTitle>
                  <CardDescription className="text-xs">
                    Operating Hours: {activeFacilityConfig?.hours || activeFacilityObj.hours}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-muted-foreground">Date:</label>
                  <Input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlots([]);
                      setBookingMessage(null);
                    }}
                    className="h-9 w-40 text-xs rounded-xl bg-secondary/30 border-border/60"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              {/* Slot Availability Grid */}
              <div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider text-[11px]">
                    Select an Available Hourly Slot
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/50" />
                      Available
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded bg-secondary border border-border" />
                      Occupied
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded bg-primary" />
                      Selected
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {availableSlots.map((slot) => {
                    const booking = activeBookingsForDate.find(b => b.slot === slot);
                    const isOccupied = Boolean(booking);
                    const isMine = booking?.userId === user?.id;
                    const isSelected = selectedSlots.includes(slot);

                    let buttonClass = "border-border/60 hover:border-primary/50 hover:bg-primary/5 text-foreground";
                    let statusLabel = "Available";

                    if (isSelected) {
                      buttonClass = "border-primary bg-primary text-white font-bold shadow-sm";
                      statusLabel = "Selected";
                    } else if (isMine) {
                      buttonClass = "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold";
                      statusLabel = "Your Booking";
                    } else if (isOccupied) {
                      buttonClass = "border-border/40 bg-muted/50 text-muted-foreground/80 cursor-not-allowed opacity-75";
                      statusLabel = "Occupied";
                    }

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isOccupied || !facilityOperational}
                        onClick={() => handleSlotSelect(slot)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col justify-between h-18 ${buttonClass}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold">{slot}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className={`text-[10px] mt-1 ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                          {statusLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Booking Submission Form */}
              <form onSubmit={handleConfirmBooking} className="pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  {selectedSlots.length ? (
                    <span>
                      Reserving {selectedSlots.length} slot(s): <strong className="text-foreground">{selectedFacility}</strong> on{" "}
                      <strong className="text-foreground">{selectedDate}</strong> ({selectedSlots.join(", ")})
                    </span>
                  ) : (
                    <span>{facilityOperational ? "Select one or more available slots above to proceed." : "This facility is currently unavailable."}</span>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={!selectedSlots.length || !facilityOperational || isSubmitting}
                  className="w-full sm:w-auto h-10 px-6 rounded-xl font-bold text-xs gradient-primary text-white border-0 shadow-md"
                >
                  <CalendarPlus className="w-4 h-4 mr-1.5" />
                  {isSubmitting ? "Locking Slot..." : "Confirm & Reserve Slot"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right: My Reservations & Operational Rules */}
        <div className="lg:col-span-4 space-y-5">
          {/* My Reservations Card */}
          <Card className="border-border/60 bg-card">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold text-foreground">My Active Reservations</CardTitle>
              <CardDescription className="text-xs">
                Upcoming facility blocks reserved by your flat
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30 max-h-[320px] overflow-y-auto">
                {myBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 flex items-center justify-between hover:bg-secondary/10 transition-colors text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-foreground">{b.facility}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {b.date} · {b.slot}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {b.status === "booked" ? (
                        <>
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                            Confirmed
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(b.id)}
                            className="h-7 px-2 text-[10px] text-red-500 hover:bg-red-500/10 rounded-lg"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground border text-[9px] font-bold">
                          Cancelled
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}

                {myBookings.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-xs p-4">
                    No active reservations found for Flat {user?.unit || "your unit"}.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Rules Card */}
          <Card className="border-border/60 bg-secondary/15">
            <CardContent className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Info className="w-4 h-4 text-primary" />
                <span>Booking Rules & Ethics</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                <li>Instant automatic confirmation — no approval needed.</li>
                <li>Conflicts and overlaps are automatically blocked.</li>
                <li>Please cancel at least 1 hour in advance if not using your slot.</li>
                <li>Each flat may book up to 2 active sessions per day.</li>
                <li>Non-residents must be accompanied by a resident host.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
