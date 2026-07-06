"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Calendar, Trophy, Users, BookOpen, Dumbbell, Handshake, Check, AlertCircle, Plus, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function CommunityPage() {
  const { user, initialize } = useAuth();
  const {
    facilityBookings, bookFacility, cancelFacilityBooking,
    communityEvents, rsvpEvent,
    lostFoundItems, reportLostFoundItem, claimLostFoundItem,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      facilityBookings: state.facilityBookings,
      bookFacility: state.bookFacility,
      cancelFacilityBooking: state.cancelFacilityBooking,
      communityEvents: state.communityEvents,
      rsvpEvent: state.rsvpEvent,
      lostFoundItems: state.lostFoundItems,
      reportLostFoundItem: state.reportLostFoundItem,
      claimLostFoundItem: state.claimLostFoundItem,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"facilities" | "events" | "lostfound">("facilities");

  // Facility Booking state
  const [selectedFacility, setSelectedFacility] = useState("Badminton Court");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlot, setBookingSlot] = useState("10:00 AM - 11:00 AM");
  const [facilityError, setFacilityError] = useState("");
  const [facilitySuccess, setFacilitySuccess] = useState(false);

  // Lost & Found form state
  const [lfTitle, setLfTitle] = useState("");
  const [lfDesc, setLfDesc] = useState("");
  const [showLfForm, setShowLfForm] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWorker = user?.role === "worker";

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

  const handleReportLf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lfTitle.trim() || !lfDesc.trim()) return;

    reportLostFoundItem({
      title: lfTitle,
      description: lfDesc,
      reporterId: user?.id || "user-resident-1",
      reporterName: user?.name || "Nidhi Kumar",
      portal: "society"
    });

    setLfTitle("");
    setLfDesc("");
    setShowLfForm(false);
  };

  // Filter lists
  const myBookings = facilityBookings.filter(b => b.userId === user?.id);
  const activeEvents = communityEvents;
  const activeLfItems = lostFoundItems.filter(item => item.portal === "society");

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)]">Community Hub 💛</h1>
        <p className="text-muted-foreground mt-1">Reserve facilities, RSVP to upcoming local events, and report lost items.</p>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 border-b border-border/30 pb-3 flex-wrap">
        {[
          { id: "facilities", label: "Sports & Amenities Booking", icon: Dumbbell },
          { id: "events", label: "Community Events RSVP", icon: Calendar },
          { id: "lostfound", label: "Lost & Found Bulletin", icon: Trophy }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            className={`rounded-lg text-xs capitalize ${activeTab === tab.id ? "gradient-primary text-white border-0" : ""}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <tab.icon className="w-3.5 h-3.5 mr-1.5" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "facilities" && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left: Form */}
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
                  <Button type="submit" className="w-full rounded-xl gradient-primary text-white border-0 h-11">
                    Book Slot
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Right: Bookings list */}
            <Card className="lg:col-span-7 border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-bold">My Reservations</CardTitle>
                <CardDescription>Your booked sports slots and clubhouse entries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {myBookings.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl border border-border bg-secondary/15 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-foreground block text-sm">{b.facility}</span>
                      <p className="text-muted-foreground mt-0.5">Date: {b.date} • Slot: {b.slot}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={b.status === "booked" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/15 text-red-500 border-0"}>
                        {b.status}
                      </Badge>
                      {b.status === "booked" && (
                        <button onClick={() => cancelFacilityBooking(b.id)} className="text-[10px] text-red-500 hover:underline">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {myBookings.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">You have no active facility bookings.</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-4 max-w-3xl">
            {activeEvents.map((ev) => {
              const isRSVP = ev.rsvps?.includes(user?.id || "");
              return (
                <Card key={ev.id} className="border-border/50 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-5 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-foreground font-[family-name:var(--font-heading)]">{ev.title}</h3>
                        <Badge variant="outline" className="text-[9px] uppercase border-amber-500/20 text-amber-500 bg-amber-500/5">
                          {ev.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-normal">{ev.description}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap pt-1 font-semibold">
                        <span>Date: {ev.date}</span>
                        <span>·</span>
                        <span>Time: {ev.time}</span>
                        <span>·</span>
                        <span>Venue: {ev.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-between items-end shrink-0 gap-3 self-end md:self-stretch">
                      <span className="text-xs text-muted-foreground">RSVPs: <span className="font-bold text-foreground">{ev.rsvps?.length || 0} attending</span></span>
                      
                      {!isWorker && (
                        <Button
                          size="sm"
                          onClick={() => rsvpEvent(ev.id, user?.id || "user-resident-1")}
                          className={`rounded-lg h-9 border-0 px-4 text-xs font-semibold ${
                            isRSVP ? "bg-red-500/10 text-red-500 hover:bg-red-500/15" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {isRSVP ? "Cancel RSVP" : "Confirm RSVP (Yes)"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "lostfound" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Lost & Found Bulletins</h3>
              {!isWorker && (
                <Button onClick={() => setShowLfForm(!showLfForm)} size="sm" className="rounded-xl gradient-primary text-white border-0 shadow-md">
                  Report Found Item
                </Button>
              )}
            </div>

            {showLfForm && (
              <Card className="border-border/50 p-6 bg-secondary/15 max-w-lg">
                <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-sm font-bold">Report Found Item</CardTitle>
                </CardHeader>
                <form onSubmit={handleReportLf} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Item Title</label>
                    <Input placeholder="e.g. Set of keys with brown leather chain" value={lfTitle} onChange={(e) => setLfTitle(e.target.value)} className="h-10 text-xs rounded-lg animate-none" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Location found & details</label>
                    <Input placeholder="e.g. Near Tower B ground lift floor" value={lfDesc} onChange={(e) => setLfDesc(e.target.value)} className="h-10 text-xs rounded-lg animate-none" required />
                  </div>
                  <div className="p-3 border border-dashed border-border/70 hover:bg-secondary/20 cursor-pointer flex items-center justify-center gap-2 rounded-xl text-xs text-muted-foreground">
                    <Camera className="w-4 h-4" /> Upload Snapshot Image
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowLfForm(false)} className="rounded-lg h-9">Cancel</Button>
                    <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 border-0">Report Bulletin</Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLfItems.map((item) => (
                <Card key={item.id} className="border-border/50">
                  <CardContent className="p-5 flex flex-col justify-between h-[180px]">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[10px] text-muted-foreground font-mono">{item.id}</span>
                        <Badge className={item.status === "claimed" ? "bg-green-500/10 text-green-500" : "bg-amber-500/15 text-amber-500"}>
                          {item.status}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-normal">&quot;{item.description}&quot;</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-border/20 pt-3.5 mt-2">
                      <span className="text-[10px] text-muted-foreground">Reporter: {item.reporterName}</span>
                      
                      {item.status === "reported" && !isWorker && item.reporterId !== user?.id && (
                        <Button
                          size="sm"
                          onClick={() => claimLostFoundItem(item.id, user?.id || "user-resident-1", user?.name || "Nidhi Kumar")}
                          className="bg-primary text-white rounded-lg h-8 px-3 border-0 text-xs font-semibold"
                        >
                          Claim Item
                        </Button>
                      )}
                      {item.status === "claimed" && (
                        <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5">
                          Claimed by {item.claimantName}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {activeLfItems.length === 0 && (
                <div className="col-span-full py-8 text-center text-sm text-muted-foreground border rounded-2xl border-dashed">No Lost & Found bulletins reported. All neat.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
