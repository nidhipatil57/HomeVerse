"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dumbbell, Clock, Check, AlertCircle, CalendarPlus, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function FacilityBookingPage() {
  const { user, initialize } = useAuth();
  const {
    facilityBookings, bookFacility, cancelFacilityBooking,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      facilityBookings: state.facilityBookings || [],
      bookFacility: state.bookFacility,
      cancelFacilityBooking: state.cancelFacilityBooking,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  // Form State
  const [selectedFacility, setSelectedFacility] = useState("Badminton Court");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlot, setBookingSlot] = useState("10:00 AM - 11:00 AM");
  const [facilityError, setFacilityError] = useState("");
  const [facilitySuccess, setFacilitySuccess] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const facilitiesList = ["Gymnasium", "Badminton Court", "Swimming Pool", "Clubhouse Lounge", "Party Hall"];
  const slotsList = [
    "08:00 AM - 09:00 AM",
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM",
    "06:00 PM - 07:00 PM"
  ];

  const handleBookFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    setFacilityError("");
    setFacilitySuccess(false);

    if (!bookingDate) {
      setFacilityError("Please choose a reservation date.");
      return;
    }

    const success = await bookFacility({
      facility: selectedFacility,
      userId: user?.id || "user-resident-1",
      userName: user?.name || "Nidhi Kumar",
      unit: user?.unit || "A-301",
      date: bookingDate,
      slot: bookingSlot
    });

    if (success) {
      setFacilitySuccess(true);
      setTimeout(() => {
        setFacilitySuccess(false);
      }, 2000);
    } else {
      setFacilityError("This timeslot is already reserved. Double booking blocked.");
    }
  };

  const myBookings = facilityBookings.filter(b => b.userId === user?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Facility Booking 🏟️
        </h1>
        <p className="text-muted-foreground mt-1">
          Reserve sports facilities, common areas, or the clubhouse lounge for your flat
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Booking Form */}
        <Card className="lg:col-span-5 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold">Reserve Amenity</CardTitle>
            <CardDescription>Select court or room and lock your slot</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBookFacility} className="space-y-4">
              {facilityError && (
                <div className="p-3 text-xs bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {facilityError}
                </div>
              )}
              {facilitySuccess && (
                <div className="p-3 text-xs bg-green-500/10 text-green-500 rounded-lg border border-green-500/20 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Booking confirmed successfully!
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Facility</label>
                <select
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                >
                  {facilitiesList.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Reservation Date</label>
                <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="h-11 rounded-xl text-sm" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Time Slot</label>
                <select
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                >
                  {slotsList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl gradient-primary text-white border-0 font-semibold shadow-md">
                <CalendarPlus className="w-4 h-4 mr-2" /> Book Timeslot
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right: Bookings list */}
        <Card className="lg:col-span-7 border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold">My active reservations</CardTitle>
            <CardDescription>Timetable of upcoming facility blocks reserved by your flat</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30 max-h-[400px] overflow-y-auto">
              {myBookings.map((b) => (
                <div key={b.id} className="p-4 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Dumbbell className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{b.facility}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{b.date} • {b.slot}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status === "booked" ? (
                      <>
                        <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-bold">
                          Reserved
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            cancelFacilityBooking(b.id);
                            alert("Booking cancelled.");
                          }}
                          className="h-8 text-[10px] text-red-500 hover:bg-red-500/10 rounded-lg"
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
                <div className="text-center py-20 text-muted-foreground text-xs">
                  No upcoming reservations booked by your flat.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
