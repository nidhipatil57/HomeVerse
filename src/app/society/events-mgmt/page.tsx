"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecretaryEventsMgmtPage() {
  const { user, initialize } = useAuth();
  const {
    communityEvents, createEvent, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      communityEvents: state.communityEvents || [],
      createEvent: state.createEvent,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  // Form State
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventDate) return;
    createEvent({
      title: eventTitle,
      description: eventDesc,
      date: eventDate,
      time: eventTime || "18:00",
      location: eventLocation || "Clubhouse",
      organizer: user?.name || "Secretary",
      priority: "normal"
    });
    setEventTitle("");
    setEventDesc("");
    setEventDate("");
    setEventTime("");
    setEventLocation("");
    alert("Society Event scheduled! Notifications dispatched.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Events Coordinator 🎪
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure society festivals, manage general body committee meetups, and publish rosters
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Form */}
        <Card className="lg:col-span-5 border-border/50 h-fit">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-primary" /> Schedule Society Event
            </CardTitle>
            <CardDescription>Dispatch RSVP invites to all resident app nodes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Event Title / Name</label>
                <Input placeholder="e.g. Independence Day Meet" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="h-9 rounded-lg text-xs" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Event Description</label>
                <Input placeholder="Detail agenda, timings, catering..." value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} className="h-9 rounded-lg text-xs" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Event Date</label>
                  <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="h-9 rounded-lg text-xs" required />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Invited Hour</label>
                  <Input placeholder="e.g. 06:00 PM" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="h-9 rounded-lg text-xs" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Location Venue</label>
                <Input placeholder="e.g. Clubhouse Lounge" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} className="h-9 rounded-lg text-xs" required />
              </div>
              <Button type="submit" className="w-full h-9 rounded-lg gradient-primary text-white border-0 text-xs font-semibold shadow-sm">
                Schedule Event & Dispatch
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: List */}
        <Card className="lg:col-span-7 border-border/50 flex flex-col h-[500px] overflow-hidden">
          <CardHeader className="border-b border-border/20 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Calendar className="w-4.5 h-4.5 text-primary" /> Upcoming Gated Society Events ({communityEvents.length})
            </CardTitle>
            <CardDescription>Rosters and RSVP numbers</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            {communityEvents.map((ev) => (
              <div key={ev.id} className="p-3.5 rounded-xl border border-border/50 bg-secondary/15 flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">{ev.title}</h4>
                    <p className="text-[10px] text-muted-foreground">{ev.description}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold shrink-0">
                    RSVPs: {ev.rsvps?.length || 0}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-1 pt-1.5 border-t">
                  <span>Date: {ev.date} • {ev.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" /> {ev.location}</span>
                </div>
              </div>
            ))}
            {communityEvents.length === 0 && (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No events scheduled.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
