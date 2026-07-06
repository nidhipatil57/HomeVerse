"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Calendar, MapPin, Users, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function HostelEventsPage() {
  const { user, initialize } = useAuth();
  const {
    communityEvents, rsvpEvent, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      communityEvents: state.communityEvents || [],
      rsvpEvent: state.rsvpEvent,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  // Filter hostel-specific events
  const hostelEvents = communityEvents.filter(e => e.location.toLowerCase().includes("hostel") || e.location.toLowerCase().includes("mess") || e.location.toLowerCase().includes("campus"));

  const fallbackEvents = [
    { id: "he-1", title: "Cultural Rhythms DJ Night", description: "Catered dinner & live music celebrate block semester completion", date: "Jul 15, 2026", time: "07:30 PM", location: "Hostel Central Lawn", rsvps: [] as string[] },
    { id: "he-2", title: "Intra-Hostel Chess Tournament", description: "Sign up at Warden desk to claim block trophy", date: "Jul 18, 2026", time: "04:00 PM", location: "Gaming Room Block A", rsvps: [] as string[] }
  ];

  const activeEvents = hostelEvents.length > 0 ? hostelEvents : fallbackEvents;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Hostel Events & Fests 🎪
        </h1>
        <p className="text-muted-foreground mt-1">
          Stay updated with intra-hostel DJ nights, sports fests, tournaments, and confirm RSVP limits
        </p>
      </div>

      {/* Events list */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeEvents.map((ev) => {
          const hasRsvped = ev.rsvps?.includes(user?.id || "user-student-1");
          return (
            <motion.div key={ev.id} variants={fadeInUp}>
              <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                <div className="aspect-[16/9] bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative flex items-center justify-center border-b border-border/20">
                  <Calendar className="w-12 h-12 text-primary/45" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-base leading-tight line-clamp-1">{ev.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{ev.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <span>{ev.date} at {ev.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <Button
                      onClick={() => {
                        rsvpEvent(ev.id, user?.id || "user-student-1");
                        alert("RSVP toggled successfully!");
                      }}
                      className={`w-full rounded-xl h-9.5 text-xs font-semibold ${
                        hasRsvped 
                          ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/25"
                          : "gradient-primary text-white border-0 shadow-sm"
                      }`}
                    >
                      {hasRsvped ? (
                        <span className="flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> RSVP Confirmed</span>
                      ) : (
                        "RSVP to Event"
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
