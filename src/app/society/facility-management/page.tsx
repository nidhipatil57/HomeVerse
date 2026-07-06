"use client";

import { useState, useEffect } from "react";
import { Dumbbell, Calendar, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecretaryFacilityManagementPage() {
  const { user, initialize } = useAuth();
  const {
    facilityBookings, cancelFacilityBooking, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      facilityBookings: state.facilityBookings || [],
      cancelFacilityBooking: state.cancelFacilityBooking,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Facility Management 🏟️
        </h1>
        <p className="text-muted-foreground mt-1">
          Review, cancel, and audit resident bookings for society badminton courts, clubhouse lounge, and party halls
        </p>
      </div>

      {/* Bookings List */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-semibold">Active Bookings Log</CardTitle>
          <CardDescription>All sports and common area reservations</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
            {facilityBookings.map((b) => (
              <div key={b.id} className="p-4 flex items-center justify-between hover:bg-secondary/15 transition-colors text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">{b.facility}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Reserved by: Flat {b.unit} ({b.userName})
                    </p>
                    <p className="text-[9px] text-muted-foreground">Slot: {b.date} • {b.slot}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {b.status === "booked" ? (
                    <>
                      <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 text-[9px] font-bold">
                        Booked
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
            {facilityBookings.length === 0 && (
              <div className="text-center py-20 text-muted-foreground text-xs">
                No active bookings recorded in registry.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
