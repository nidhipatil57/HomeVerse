"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ShieldCheck,
  Building2,
  Users,
  Settings2,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Sliders
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

interface FacilityConfigItem {
  id: string;
  name: string;
  category: string;
  hours: string;
  capacity: string;
  status: "Operational" | "Maintenance";
}

const INITIAL_FACILITIES: FacilityConfigItem[] = [
  { id: "fac-1", name: "Badminton Court", category: "Sports", hours: "06:00 AM - 10:00 PM", capacity: "4 Players", status: "Operational" },
  { id: "fac-2", name: "Gymnasium & Fitness Center", category: "Fitness", hours: "06:00 AM - 10:00 PM", capacity: "25 Residents", status: "Operational" },
  { id: "fac-3", name: "Swimming Pool", category: "Aquatics", hours: "06:30 AM - 09:30 PM", capacity: "30 Swimmers", status: "Operational" },
  { id: "fac-4", name: "Clubhouse Lounge", category: "Recreation", hours: "08:00 AM - 11:00 PM", capacity: "50 Persons", status: "Operational" },
  { id: "fac-5", name: "Community Banquet & Party Hall", category: "Events", hours: "10:00 AM - 11:00 PM", capacity: "120 Guests", status: "Operational" }
];

export default function ManagerFacilityOperationsPage() {
  const { user, initialize } = useAuth();
  const {
    facilityBookings, facilityConfigurations, loadFacilityBookings, loadFacilityConfigurations,
    updateFacilityConfigurationStatus, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      facilityBookings: state.facilityBookings || [],
      facilityConfigurations: state.facilityConfigurations || [],
      loadFacilityBookings: state.loadFacilityBookings,
      loadFacilityConfigurations: state.loadFacilityConfigurations,
      updateFacilityConfigurationStatus: state.updateFacilityConfigurationStatus,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"calendar" | "facilities">("calendar");

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [filterDate, setFilterDate] = useState(todayStr);
  const [filterFacility, setFilterFacility] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [facilities, setFacilities] = useState<FacilityConfigItem[]>(INITIAL_FACILITIES);

  useEffect(() => {
    initialize();
    initializeDb();
    void loadFacilityConfigurations().then((configured) => {
      setFacilities(INITIAL_FACILITIES.map((facility) => {
        const saved = configured.find((item) => item.name === facility.name);
        return saved ? { ...facility, ...saved } : facility;
      }));
    }).catch(() => {});
    void loadFacilityBookings().catch(() => {});
    const refreshTimer = window.setInterval(() => {
      void loadFacilityBookings().catch(() => {});
      void loadFacilityConfigurations().then((configured) => {
        setFacilities(INITIAL_FACILITIES.map((facility) => {
          const saved = configured.find((item) => item.name === facility.name);
          return saved ? { ...facility, ...saved } : facility;
        }));
      }).catch(() => {});
    }, 10000);
    setMounted(true);
    return () => window.clearInterval(refreshTimer);
  }, [initialize, initializeDb, loadFacilityBookings, loadFacilityConfigurations]);

  if (!mounted) return null;

  // Filter bookings for the operational calendar view
  const occupiedBookings = facilityBookings.filter((b) => {
    const matchesDate = !filterDate || b.date === filterDate;
    const matchesFacility = filterFacility === "All" || b.facility === filterFacility;
    const matchesSearch =
      b.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.facility.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesFacility && matchesSearch;
  });

  const toggleFacilityStatus = async (id: string, name: string) => {
    const facility = facilities.find((item) => item.id === id);
    const config = facilityConfigurations.find((item) => item.name === name);
    if (!facility || !config) return;
    const status = facility.status === "Operational" ? "Maintenance" : "Operational";
    try {
      await updateFacilityConfigurationStatus(config.id, status);
      setFacilities((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));
    } catch (error) {
      console.error("Could not update facility availability:", error);
    }
  };

  const availableSlots = filterDate
    ? facilities.filter((facility) =>
        facility.status === "Operational" && (filterFacility === "All" || facility.name === filterFacility)
      ).flatMap((facility) => {
        const config = facilityConfigurations.find((item) => item.name === facility.name);
        return (config?.timeSlots || []).filter((slot) => !facilityBookings.some((booking) =>
          booking.facility === facility.name && booking.date === filterDate && booking.slot === slot && booking.status === "booked"
        )).map((slot) => ({
          id: `available-${facility.id}-${filterDate}-${slot}`,
          facility: facility.name,
          userId: "",
          userName: "Available",
          unit: "—",
          date: filterDate,
          slot,
          status: "available" as const
        }));
      }).filter((booking) => {
        const query = searchQuery.toLowerCase();
        return !query || booking.facility.toLowerCase().includes(query) || booking.slot.toLowerCase().includes(query);
      })
    : [];
  const slotStartMinutes = (slot: string) => {
    const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    let hour = Number(match[1]) % 12;
    if (match[3].toUpperCase() === "PM") hour += 12;
    return hour * 60 + Number(match[2]);
  };
  const filteredBookings = [...occupiedBookings, ...availableSlots].sort((a, b) =>
    a.facility.localeCompare(b.facility) || slotStartMinutes(a.slot) - slotStartMinutes(b.slot)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Facility Operations</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manager operational dashboard. Monitor resident bookings, occupied hours, and configure facilities.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-2xl border border-border/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "calendar"
                ? "bg-card text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Operational Calendar
          </button>
          <button
            onClick={() => setActiveTab("facilities")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "facilities"
                ? "bg-card text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Facility Configuration
          </button>
        </div>
      </div>

      {activeTab === "calendar" ? (
        <div className="space-y-5">
          {/* Calendar Filter Controls */}
          <Card className="border-border/60 bg-card">
            <CardContent className="p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Date:</span>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="h-10 text-xs rounded-xl w-44 bg-secondary/30 border-border/60"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Facility:</span>
                <select
                  value={filterFacility}
                  onChange={(e) => setFilterFacility(e.target.value)}
                  className="h-10 px-3 text-xs rounded-xl border border-border/60 bg-card text-foreground"
                >
                  <option value="All">All Facilities</option>
                  {facilities.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search resident, flat (e.g. A-301), or slot..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 text-xs rounded-xl bg-card border-border/60"
                />
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterDate("");
                    setFilterFacility("All");
                    setSearchQuery("");
                  }}
                  className="text-xs rounded-xl h-10 border-border/60"
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Table / Roster */}
          <Card className="border-border/60 bg-card shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Operational Roster & Occupied Slots</CardTitle>
                  <CardDescription className="text-xs">
                    Showing {filteredBookings.length} occupied and available slots
                  </CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                  Read-Only Visibility
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/40 text-muted-foreground border-b border-border/40">
                    <tr>
                      <th className="py-3 px-4 font-bold">Facility</th>
                      <th className="py-3 px-4 font-bold">Date & Time Slot</th>
                      <th className="py-3 px-4 font-bold">Resident Details</th>
                      <th className="py-3 px-4 font-bold">Flat / Unit</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-secondary/15 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">
                          {b.facility}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-foreground block">{b.date}</span>
                          <span className="text-[11px] text-muted-foreground">{b.slot}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-foreground block">{b.userName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{b.userId}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-mono text-xs font-bold bg-secondary/30">
                            {b.unit}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {b.status === "booked" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                              Confirmed (Auto)
                            </Badge>
                          ) : b.status === "available" ? (
                            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                              Available
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground border text-[10px] font-bold">
                              Cancelled
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {b.status === "booked" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              title="Managers have read-only booking visibility"
                              className="h-7 text-[11px] text-muted-foreground rounded-lg"
                            >
                              View Only
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-muted-foreground">
                          No facility bookings found for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Facility Configuration View */
        <div className="space-y-4">
          <Card className="border-border/60 bg-card shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold text-foreground">Configured Society Facilities</CardTitle>
              <CardDescription className="text-xs">
                Manage operating hours, capacity thresholds, and toggle maintenance status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {facilities.map((fac) => (
                  <div key={fac.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground text-sm">{fac.name}</h4>
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {fac.category}
                        </Badge>
                        <Badge
                          className={
                            fac.status === "Operational"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }
                        >
                          {fac.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-1">
                        Operating Hours: <strong className="text-foreground">{fac.hours}</strong> · Capacity:{" "}
                        <strong className="text-foreground">{fac.capacity}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void toggleFacilityStatus(fac.id, fac.name)}
                        className="h-8 text-xs rounded-xl border-border/60"
                      >
                        {fac.status === "Operational" ? "Set to Maintenance" : "Set Operational"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
