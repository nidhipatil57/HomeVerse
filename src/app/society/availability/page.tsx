"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  Clock, Activity, Power, CheckCircle, Calendar, Plus, Trash2, Loader2, Save, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";

export default function WorkerAvailabilityPage() {
  const { user, initialize } = useAuth();
  const {
    workerProfiles,
    updateAvailability,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      workerProfiles: state.workerProfiles || [],
      updateAvailability: state.updateAvailability,
      initializeDb: state.initializeDb
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [blockedDateInput, setBlockedDateInput] = useState("");
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Load existing availability values
  const myProfile = useMemo(() => {
    return workerProfiles.find((w) => w.id === user?.id);
  }, [workerProfiles, user]);

  useEffect(() => {
    if (myProfile) {
      setIsOnline(myProfile.availability !== "Offline");
      
      const av = myProfile.workerAvailability;
      if (av) {
        setWorkingDays(av.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
        setStartTime(av.startTime || "09:00");
        setEndTime(av.endTime || "18:00");
        setBlockedDates(av.blockedDate || []);
      } else {
        setWorkingDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
      }
    }
  }, [myProfile]);

  if (!mounted) return null;

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleAddBlockedDate = () => {
    if (!blockedDateInput) return;
    if (blockedDates.includes(blockedDateInput)) return;
    setBlockedDates([...blockedDates, blockedDateInput]);
    setBlockedDateInput("");
  };

  const handleRemoveBlockedDate = (dateToRemove: string) => {
    setBlockedDates(blockedDates.filter((d) => d !== dateToRemove));
  };

  const handleSaveAvailability = async () => {
    setSaveLoading(true);
    try {
      await updateAvailability({
        workingDays,
        startTime,
        endTime,
        blockedDate: blockedDates,
        isOnline // This updates user availability status to Available or Offline
      });
      alert("Shift availability and schedule saved successfully!");
    } catch (e) {
      alert("Failed to update availability configurations.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Work Availability & Shifts ⏰
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure your daily work shifts, check off weekly rest holidays, and block dates when you are unavailable.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Toggle Status Card */}
        <Card className="md:col-span-4 border-border/50 h-fit bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Duty Status</CardTitle>
            <CardDescription>Toggle your gate/dispatch availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              isOnline ? "bg-green-500/10 text-green-500 ring-4 ring-green-500/20" : "bg-secondary text-muted-foreground"
            }`}>
              <Power className="w-10 h-10" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-sm">{isOnline ? "🟢 Active & Available" : "🔴 Offline / Off Duty"}</h3>
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed max-w-[200px] mx-auto">
                {isOnline
                  ? "Residents can see you listed in the community services directory and send booking dispatches."
                  : "You are marked as offline. Residents will see you as offline and cannot request bookings."}
              </p>
            </div>

            <Button
              onClick={() => setIsOnline(!isOnline)}
              className={`w-full rounded-xl h-10 font-bold text-xs border-0 shadow-sm transition-all ${
                isOnline ? "bg-rose-600 hover:bg-rose-700 text-white" : "gradient-primary text-white"
              }`}
            >
              {isOnline ? "Go Offline" : "Go Online & Start Shift"}
            </Button>
          </CardContent>
        </Card>

        {/* Schedule & Shifts Info */}
        <Card className="md:col-span-8 border-border/50 bg-card shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Shift Schedule Configuration
            </CardTitle>
            <CardDescription>Customize working days, shift timings, and block calendar leaves</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 text-xs">
            {/* Working days row */}
            <div className="space-y-2">
              <span className="font-bold text-foreground block">Active Work Days</span>
              <div className="flex flex-wrap gap-1.5">
                {daysOfWeek.map((day) => {
                  const isActive = workingDays.includes(day);
                  return (
                    <Button
                      key={day}
                      type="button"
                      variant={isActive ? "default" : "outline"}
                      onClick={() => toggleDay(day)}
                      className={`h-8 rounded-lg px-3 text-[10px] font-semibold border-border/50 ${
                        isActive ? "gradient-primary text-white border-0 shadow-sm" : "hover:bg-secondary/40 text-foreground"
                      }`}
                    >
                      {day.substring(0, 3)}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Shift timings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="font-bold text-foreground block">Shift Start Time</span>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-10 rounded-xl bg-secondary/10 border-border/50 text-xs font-semibold text-foreground"
                />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-foreground block">Shift End Time</span>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-10 rounded-xl bg-secondary/10 border-border/50 text-xs font-semibold text-foreground"
                />
              </div>
            </div>

            {/* Blocked Dates */}
            <div className="space-y-3 pt-2 border-t border-border/10">
              <span className="font-bold text-foreground block">Block Custom Dates (Leaves / Holidays)</span>
              
              <div className="flex gap-2">
                <Input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={blockedDateInput}
                  onChange={(e) => setBlockedDateInput(e.target.value)}
                  className="h-10 rounded-xl bg-secondary/10 border-border/50 text-xs"
                />
                <Button
                  type="button"
                  onClick={handleAddBlockedDate}
                  className="h-10 rounded-xl px-4 bg-primary text-white border-0 shadow-md font-bold text-xs"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Date
                </Button>
              </div>

              {/* List of blocked dates */}
              <div className="flex flex-wrap gap-2 pt-1.5">
                {blockedDates.map((date) => (
                  <Badge
                    key={date}
                    className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 py-1.5 px-2.5 rounded-lg text-[9px] font-bold flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {date}
                    <button type="button" onClick={() => handleRemoveBlockedDate(date)} className="hover:text-rose-700">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {blockedDates.length === 0 && (
                  <span className="text-[10px] text-muted-foreground italic">No blocked holiday dates active.</span>
                )}
              </div>
            </div>

            {/* Guidelines banner */}
            <div className="rounded-2xl bg-amber-500/5 border border-amber-500/15 p-4 text-[10px] text-amber-800 dark:text-amber-400 font-medium flex gap-3 mt-4">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-amber-500" />
              <p>
                Once you save this schedule, residents will only be allowed to request service bookings during these configured timings. Blocked dates will automatically filter out from the resident's calendar request slot selector.
              </p>
            </div>
          </CardContent>

          <div className="p-6 bg-secondary/10 border-t border-border/20 flex justify-end">
            <Button
              onClick={handleSaveAvailability}
              disabled={saveLoading}
              className="rounded-xl h-10 px-6 gradient-primary text-white border-0 font-bold flex gap-1.5 shadow-md"
            >
              {saveLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save configurations
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
