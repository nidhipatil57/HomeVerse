"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Shield, Users, Check, Clock, LogIn, LogOut, Search, MapPin,
  AlertTriangle, Phone, Calendar, Ban, AlertCircle, CheckCircle2,
  Filter, Sparkles, UserCheck, ShieldAlert, History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import type { Helper, HelperAttendance } from "@/types";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayShortNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Strictly domestic help categories (excludes plumbers, electricians, technicians, delivery)
const isDomesticHelp = (category: string) => {
  const cat = (category || "").toLowerCase();
  return (
    cat.includes("maid") ||
    cat.includes("cook") ||
    cat.includes("housekeeping") ||
    cat.includes("cleaning") ||
    cat.includes("domestic")
  );
};

export default function SecurityHelpersEntryPage() {
  const { user } = useAuth();
  const {
    helpers,
    attendance,
    checkInHelper,
    checkOutHelper,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      helpers: state.helpers || [],
      attendance: state.attendance || [],
      checkInHelper: state.checkInHelper,
      checkOutHelper: state.checkOutHelper,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"daily" | "registry" | "history">("daily");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionAlert, setActionAlert] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null);

  useEffect(() => {
    initializeDb();
    setMounted(true);
  }, [initializeDb]);

  // Current day and date
  const now = new Date();
  const todayStr = useMemo(() => now.toLocaleDateString("en-CA"), []);
  const todayDayName = dayNames[now.getDay()];
  const todayDayShort = dayShortNames[now.getDay()];

  // Filter ONLY registered domestic helpers (not plumbers, electricians, technicians or delivery personnel)
  const domesticHelpers = useMemo(() => {
    return helpers.filter((h) => isDomesticHelp(h.category));
  }, [helpers]);

  // Search filter
  const filteredHelpers = useMemo(() => {
    if (!searchQuery.trim()) return domesticHelpers;
    const q = searchQuery.toLowerCase();
    return domesticHelpers.filter(
      (h) =>
        (h.name || "").toLowerCase().includes(q) ||
        (h.phone || "").includes(q) ||
        (h.category || "").toLowerCase().includes(q) ||
        (h.assignedFlats && h.assignedFlats.some((f) => (f || "").toLowerCase().includes(q))) ||
        (h.assignedResidents && h.assignedResidents.some((r) => (r || "").toLowerCase().includes(q)))
    );
  }, [domesticHelpers, searchQuery]);

  // Daily attendance roster: Scheduled for today
  const todaysScheduledHelpers = useMemo(() => {
    return filteredHelpers.filter((h) => {
      const days = h.workingDays || [];
      return (
        days.includes(todayDayName) ||
        days.includes(todayDayShort) ||
        days.some((d) => d.toLowerCase() === todayDayName.toLowerCase() || d.toLowerCase() === todayDayShort.toLowerCase()) ||
        days.includes("All Days") ||
        days.length === 0
      );
    });
  }, [filteredHelpers, todayDayName, todayDayShort]);

  // Currently inside complex
  const currentlyInsideList = useMemo(() => {
    return attendance.filter((a) => !a.checkOutTime && isDomesticHelp(a.workerCategory));
  }, [attendance]);

  // Completed today
  const completedTodayList = useMemo(() => {
    return attendance.filter((a) => a.date === todayStr && !!a.checkOutTime);
  }, [attendance, todayStr]);

  if (!mounted || !user) return null;

  // Helper check-in action
  const handleCheckIn = async (helper: Helper) => {
    // Check pass status
    if (helper.passStatus === "revoked") {
      setActionAlert({
        type: "error",
        message: `ENTRY FORBIDDEN: Gate Pass for ${helper.name} has been revoked by the resident.`
      });
      return;
    }

    if (helper.passStatus === "expired" || (helper.validTo && new Date(helper.validTo) < new Date(todayStr))) {
      setActionAlert({
        type: "error",
        message: `PASS EXPIRED: Gate Pass for ${helper.name} has expired. Resident must renew pass.`
      });
      return;
    }

    try {
      await checkInHelper(
        helper.id,
        helper.name,
        helper.category,
        "Main Security Gate",
        helper.assignedFlats
      );
      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setActionAlert({
        type: "success",
        message: `Entry logged for ${helper.name} at ${timeStr}. Residents of Flat(s) ${helper.assignedFlats.join(", ")} notified.`
      });
      setTimeout(() => setActionAlert(null), 5000);
    } catch (err: any) {
      setActionAlert({ type: "error", message: err?.message || "Check-in failed" });
    }
  };

  // Helper check-out action
  const handleCheckOut = async (attendanceId: string, helperName: string, flats: string[]) => {
    try {
      await checkOutHelper(attendanceId, "Main Security Gate");
      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setActionAlert({
        type: "success",
        message: `Exit logged for ${helperName} at ${timeStr}. Residents of Flat(s) ${flats.join(", ")} notified.`
      });
      setTimeout(() => setActionAlert(null), 5000);
    } catch (err: any) {
      setActionAlert({ type: "error", message: err?.message || "Check-out failed" });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-[family-name:var(--font-heading)] flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-blue-500" /> Domestic Help Attendance Console
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Dedicated Security portal for registered domestic staff (maids, cooks, housekeeping). Automatically synchronized from Resident Gate Passes.
          </p>
        </div>

        {/* Live Inside Summary Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {currentlyInsideList.length} Staff Inside Complex
            </span>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 shadow-sm transition-all ${
            actionAlert.type === "success"
              ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
              : actionAlert.type === "error"
              ? "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-300 border border-red-300 dark:border-red-800"
              : "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionAlert.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionAlert.message}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card rounded-2xl p-4 shadow-sm">
          <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Scheduled Today ({todayDayShort})</div>
          <div className="text-2xl font-extrabold text-foreground mt-1">{todaysScheduledHelpers.length}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Permitted working staff</div>
        </Card>

        <Card className="border-border/50 bg-card rounded-2xl p-4 shadow-sm">
          <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Inside Premises</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{currentlyInsideList.length}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Currently on duty</div>
        </Card>

        <Card className="border-border/50 bg-card rounded-2xl p-4 shadow-sm">
          <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Completed Today</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{completedTodayList.length}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Checked out successfully</div>
        </Card>

        <Card className="border-border/50 bg-card rounded-2xl p-4 shadow-sm">
          <div className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Total Registered Roster</div>
          <div className="text-2xl font-extrabold text-foreground mt-1">{domesticHelpers.length}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Active domestic helpers</div>
        </Card>
      </div>

      {/* Tabs Switcher & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex bg-muted/70 p-1 rounded-2xl border border-border/60 self-start">
          <button
            onClick={() => setActiveTab("daily")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "daily"
                ? "bg-card text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-4 h-4 text-primary" />
            Daily Helper Attendance
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
              {todaysScheduledHelpers.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("registry")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "registry"
                ? "bg-card text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4 text-primary" />
            Domestic Help Registry
            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
              {domesticHelpers.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "history"
                ? "bg-card text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="w-4 h-4 text-primary" />
            Attendance History
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search helper, flat, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-xs rounded-xl bg-card border-border/60"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: DAILY HELPER ATTENDANCE */}
      {/* ========================================================================= */}
      {activeTab === "daily" && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Today's Roster (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold">
                      Today's Scheduled Helpers ({todayDayName})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      1-click check-in and check-out with automatic timestamps. Instant notification sent to resident flat.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5">
                {todaysScheduledHelpers.length === 0 ? (
                  <p className="text-center py-14 text-xs text-muted-foreground">
                    No domestic helpers scheduled for {todayDayName}.
                  </p>
                ) : (
                  todaysScheduledHelpers.map((h) => {
                    const todayLog = attendance.find(
                      (a) => a.workerId === h.id && a.date === todayStr
                    );
                    const isInside = !!(todayLog && !todayLog.checkOutTime);
                    const isCheckedOut = !!(todayLog && todayLog.checkOutTime);

                    const isRevoked = h.passStatus === "revoked";
                    const isExpired =
                      h.passStatus === "expired" ||
                      (h.validTo && new Date(h.validTo) < new Date(todayStr));

                    return (
                      <div
                        key={h.id}
                        className={`p-4 border rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs transition-all ${
                          isInside
                            ? "bg-emerald-500/5 border-emerald-500/30"
                            : isRevoked
                            ? "bg-red-500/5 border-red-500/30"
                            : isExpired
                            ? "bg-amber-500/5 border-amber-500/30"
                            : "bg-secondary/15 border-border/60 hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-11 h-11 rounded-xl border border-border/60 shrink-0">
                            {h.photo ? <AvatarImage src={h.photo} alt={h.name} /> : null}
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                              {h.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-foreground text-sm">{h.name}</span>
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold">
                                {h.category}
                              </Badge>

                              {isInside && (
                                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[9px] font-bold animate-pulse">
                                  Inside Complex
                                </Badge>
                              )}

                              {isCheckedOut && (
                                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[9px]">
                                  Checked Out Today
                                </Badge>
                              )}

                              {isRevoked && (
                                <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[9px] font-bold">
                                  Pass Revoked
                                </Badge>
                              )}

                              {isExpired && !isRevoked && (
                                <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[9px] font-bold">
                                  Pass Expired
                                </Badge>
                              )}
                            </div>

                            <p className="text-muted-foreground text-xs">
                              Linked Flat(s): <span className="font-bold text-foreground">{h.assignedFlats.join(", ")}</span>
                              {h.assignedResidents && h.assignedResidents.length > 0 && (
                                <span> ({h.assignedResidents.join(", ")})</span>
                              )}
                            </p>

                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                              <span>Shift: {h.expectedArrival} – {h.expectedExit}</span>
                              <span>•</span>
                              <span>Phone: {h.phone}</span>
                            </div>

                            {/* Warnings for expired / revoked */}
                            {isRevoked && (
                              <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Entry forbidden: Resident revoked this Gate Pass.
                              </p>
                            )}
                            {isExpired && !isRevoked && (
                              <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Pass validity has expired. Requires resident renewal.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Check-In / Check-Out Actions */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                          {!isInside ? (
                            <Button
                              onClick={() => handleCheckIn(h)}
                              disabled={isRevoked || isExpired || isCheckedOut}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                            >
                              <LogIn className="w-3.5 h-3.5" /> Check In
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleCheckOut(todayLog.id, h.name, h.assignedFlats)}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-9 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                            >
                              <LogOut className="w-3.5 h-3.5" /> Check Out
                            </Button>
                          )}

                          {todayLog?.checkInTime && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              In: {new Date(todayLog.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Inside Complex List (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-border/60 bg-card rounded-2xl shadow-sm flex flex-col h-[520px] overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Currently Inside ({currentlyInsideList.length})
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Domestic staff actively present inside residential flats
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 flex-1 overflow-y-auto space-y-2.5">
                {currentlyInsideList.length === 0 ? (
                  <p className="text-center py-24 text-xs text-muted-foreground italic">
                    No domestic staff currently inside the complex.
                  </p>
                ) : (
                  currentlyInsideList.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 border border-border/50 bg-secondary/10 rounded-xl flex items-center justify-between text-xs hover:border-primary/20 transition-all"
                    >
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-foreground">{att.workerName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {att.workerCategory} • Flats: {att.assignedFlats.join(", ")}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-semibold font-mono">
                          Entry: {new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleCheckOut(att.id, att.workerName, att.assignedFlats)}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-7 px-2.5 text-[10px] rounded-lg"
                      >
                        Log Exit
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: DOMESTIC HELP REGISTRY */}
      {/* ========================================================================= */}
      {activeTab === "registry" && (
        <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-bold">Domestic Help Registry (Linked to Flats)</CardTitle>
            <CardDescription className="text-xs">
              Official roster of maids, cooks, and domestic helpers authorized by residents through Gate Passes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {filteredHelpers.length === 0 ? (
                <p className="text-center py-16 text-xs text-muted-foreground">No domestic helpers found.</p>
              ) : (
                filteredHelpers.map((h) => {
                  const isRevoked = h.passStatus === "revoked";
                  const isExpired =
                    h.passStatus === "expired" ||
                    (h.validTo && new Date(h.validTo) < new Date(todayStr));

                  return (
                    <div
                      key={h.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/15 transition-all text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12 rounded-2xl border border-border/60 shrink-0">
                          {h.photo ? <AvatarImage src={h.photo} alt={h.name} /> : null}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {h.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm text-foreground">{h.name}</h3>
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                              {h.category}
                            </Badge>

                            {isRevoked ? (
                              <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] font-bold">
                                Revoked Pass
                              </Badge>
                            ) : isExpired ? (
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold">
                                Expired Pass
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
                                Active Pass
                              </Badge>
                            )}
                          </div>

                          <p className="text-muted-foreground">
                            Assigned Flats: <span className="font-bold text-foreground">{h.assignedFlats.join(", ")}</span>
                            {h.assignedResidents && h.assignedResidents.length > 0 && (
                              <span> • Residents: {h.assignedResidents.join(", ")}</span>
                            )}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                            <span>Phone: <span className="font-medium text-foreground">{h.phone}</span></span>
                            <span>•</span>
                            <span>Shift: {h.expectedArrival} – {h.expectedExit}</span>
                            {h.validTo && <span>• Valid until: {h.validTo}</span>}
                          </div>

                          {/* Permitted working days */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {(h.workingDays || []).map((day) => (
                              <span
                                key={day}
                                className="text-[10px] px-2 py-0.5 bg-secondary/40 text-foreground font-semibold rounded-md border border-border/40"
                              >
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:self-center shrink-0">
                        <span className="text-[10px] text-muted-foreground block font-mono">
                          ID: {h.id}
                        </span>
                        {h.passId && (
                          <span className="text-[10px] text-primary font-bold block font-mono">
                            Pass: {h.passId}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: PERMANENT ATTENDANCE HISTORY */}
      {/* ========================================================================= */}
      {activeTab === "history" && (
        <Card className="border-border/60 bg-card rounded-2xl shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-base font-bold">Permanent Helper Attendance Logs</CardTitle>
            <CardDescription className="text-xs">
              Complete historical record of all domestic staff entries and exits across Sunshine Complex.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-secondary/40 text-muted-foreground uppercase text-[10px] font-bold border-b border-border/50">
                  <tr>
                    <th className="p-3.5 pl-4">Date</th>
                    <th className="p-3.5">Helper Name</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Flat(s)</th>
                    <th className="p-3.5">Check-In</th>
                    <th className="p-3.5">Check-Out</th>
                    <th className="p-3.5">Gate</th>
                    <th className="p-3.5 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {attendance.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        No historical attendance records found.
                      </td>
                    </tr>
                  ) : (
                    attendance.map((att) => {
                      const isCurrentlyInside = !att.checkOutTime;
                      return (
                        <tr key={att.id} className="hover:bg-secondary/20 transition-all">
                          <td className="p-3.5 pl-4 font-mono font-medium">{att.date}</td>
                          <td className="p-3.5 font-bold text-foreground">{att.workerName}</td>
                          <td className="p-3.5">
                            <Badge variant="outline" className="text-[10px] px-2 py-0">
                              {att.workerCategory}
                            </Badge>
                          </td>
                          <td className="p-3.5 font-semibold text-foreground">
                            {att.assignedFlats.join(", ")}
                          </td>
                          <td className="p-3.5 font-mono text-emerald-600 font-semibold">
                            {new Date(att.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="p-3.5 font-mono text-muted-foreground">
                            {att.checkOutTime
                              ? new Date(att.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : "—"}
                          </td>
                          <td className="p-3.5 text-muted-foreground">{att.entryGate || "Main Gate"}</td>
                          <td className="p-3.5 pr-4">
                            {isCurrentlyInside ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[9px] font-bold animate-pulse">
                                Inside
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 text-[9px]">
                                Completed
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
