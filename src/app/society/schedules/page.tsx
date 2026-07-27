"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon, Clock, User, Wrench, AlertTriangle, CheckCircle2,
  TrendingUp, MapPin, CalendarDays, Search, ChevronRight, BadgeAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";

export default function SchedulesPage() {
  const { user, initialize } = useAuth();
  const { complaints, serviceBookings, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      complaints: state.complaints || [],
      serviceBookings: state.serviceBookings || [],
      initializeDb: state.initializeDb
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "emergency">("today");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Derive all scheduled operations (both complaints & service bookings)
  const allScheduledItems = useMemo(() => {
    const items: any[] = [];

    // 1. Process Complaints with ETA/expectedArrival
    complaints.forEach((c) => {
      // Check if complaint has a schedule status or has expectedArrival set
      const isScheduled = c.status === "Scheduled" || c.expectedArrival || c.estimatedArrival;
      if (isScheduled && !["Completed", "Resolved", "Rejected", "closed"].includes(c.status)) {
        items.push({
          id: c.id,
          sourceType: "Complaint",
          title: c.title,
          description: c.description,
          category: c.category,
          priority: c.priority,
          flat: c.unit,
          building: c.building,
          assignedWorker: c.assignedTo || "Coordinated Offline",
          scheduleDate: c.expectedArrival || c.estimatedArrival || "Today",
          status: c.status
        });
      }
    });

    // 2. Process Service Bookings
    serviceBookings.forEach((b) => {
      const isScheduled = b.status === "Scheduled" || b.status === "In Progress";
      if (isScheduled) {
        items.push({
          id: b.id,
          sourceType: "Service Request",
          title: `${b.category} Assistance`,
          description: b.adminNotes || b.operationalNotes || "Community utility request",
          category: b.category,
          priority: "medium", // Default priority for service bookings
          flat: b.address,
          building: b.resident?.building || "Tower A",
          assignedWorker: b.worker?.name || "Coordinated Offline",
          scheduleDate: b.bookingDate + " at " + b.bookingTime,
          status: b.status
        });
      }
    });

    return items;
  }, [complaints, serviceBookings]);

  // Group items by tabs
  const tabItems = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const query = searchQuery.toLowerCase();

    // Helper filter function
    const matchesSearch = (item: any) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.flat.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.assignedWorker.toLowerCase().includes(query)
      );
    };

    const todayItems: any[] = [];
    const upcomingItems: any[] = [];
    const emergencyItems: any[] = [];

    allScheduledItems.forEach((item) => {
      if (!matchesSearch(item)) return;

      // Emergency tab: Critical priority items
      if (item.priority === "emergency" || item.priority === "critical") {
        emergencyItems.push(item);
      }

      // Check if scheduled for today
      // Simple string match check for 'today' or containing today's date
      const dateVal = item.scheduleDate.toLowerCase();
      const isToday = dateVal.includes("today") || dateVal.includes(todayStr) || dateVal.includes(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase());

      if (isToday) {
        todayItems.push(item);
      } else {
        upcomingItems.push(item);
      }
    });

    return {
      today: todayItems,
      upcoming: upcomingItems,
      emergency: emergencyItems
    };
  }, [allScheduledItems, searchQuery]);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)]">Operations Schedule 📅</h1>
        <p className="text-muted-foreground mt-1">
          Calendar agenda of today's technician visits, upcoming maintenance tasks, and critical emergency dispatches.
        </p>
      </div>

      {/* Tabs and Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/15 p-4 rounded-2xl border border-border/40">
        <div className="flex border border-border rounded-xl p-1 bg-background/50 w-full md:w-auto">
          {[
            { id: "today", label: "Today's Jobs", count: tabItems.today.length },
            { id: "upcoming", label: "Upcoming visits", count: tabItems.upcoming.length },
            { id: "emergency", label: "Emergency Visits", count: tabItems.emergency.length, badge: true }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-md font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <Badge className={`text-[9px] py-0 px-1.5 border-0 ${
                activeTab === tab.id 
                  ? "bg-white/20 text-white" 
                  : tab.badge && tab.count > 0
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-secondary text-secondary-foreground"
              }`}>
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search schedule list..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background h-10 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Roster Calendar List */}
      <div className="space-y-4">
        {tabItems[activeTab].length === 0 ? (
          <Card className="border-border/50 bg-secondary/5 py-16 text-center text-muted-foreground rounded-2xl">
            <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground/60 mb-3" />
            No tasks scheduled in this section matching your filters.
          </Card>
        ) : (
          tabItems[activeTab].map((item) => (
            <Card key={item.id} className={`glass-card hover:shadow-md transition-shadow rounded-2xl border-border/50 ${
              item.priority === "emergency" || item.priority === "critical"
                ? "border-l-4 border-l-red-500"
                : "border-l-4 border-l-primary"
            }`}>
              <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[9px] font-bold py-0.5">
                      {item.sourceType}
                    </Badge>
                    <Badge className={
                      item.priority === "emergency" || item.priority === "critical"
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    }>
                      {item.priority}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {item.category}
                    </Badge>
                  </div>
                  
                  <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 max-w-2xl">{item.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 pt-1.5 text-[11px] text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> Flat {item.flat} ({item.building})
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-primary" /> Staff: {item.assignedWorker}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-2 w-full md:w-auto border-t md:border-0 border-border/20 pt-3 md:pt-0">
                  <div className="flex items-center gap-1 text-primary font-bold text-xs">
                    <Clock className="w-4 h-4" /> {item.scheduleDate}
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-2.5 py-0.5 bg-secondary/15 text-foreground border border-border/30">
                    Status: {item.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Advisory Panel */}
      <Card className="border-border/50">
        <CardContent className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-xs text-muted-foreground font-semibold">
            All schedules are synchronized in real-time. Make sure to log operational notes immediately after vendor visits to keep residents informed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
