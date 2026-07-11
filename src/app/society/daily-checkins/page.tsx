"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Clock, LogIn, LogOut, Check, Plus, Wrench, Shield, CheckCircle2,
  AlertTriangle, Phone, Building, Calendar, ClipboardCheck, Trash2, ArrowRight, MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import type { Helper, HelperAttendance } from "@/types";

const helperCategories = [
  "Maid", "Cook", "Driver", "Cleaner", "Nanny", "Elder Care", "Laundry", "Housekeeping"
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DailyCheckInsPage() {
  const { user } = useAuth();
  const {
    helpers, attendance, registerHelper, deleteHelper, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      helpers: state.helpers || [],
      attendance: state.attendance || [],
      registerHelper: state.registerHelper,
      deleteHelper: state.deleteHelper,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [expandedHelper, setExpandedHelper] = useState<string | null>(null);

  // Form states
  const [helperName, setHelperName] = useState("");
  const [category, setCategory] = useState("Maid");
  const [phone, setPhone] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("08:30 AM");
  const [expectedExit, setExpectedExit] = useState("11:30 AM");
  const [workingDays, setWorkingDays] = useState<string[]>(["Monday", "Wednesday", "Friday"]);

  useEffect(() => {
    initializeDb();
    setMounted(true);
  }, [initializeDb]);

  // Prepopulate standard demo helper if database list is empty
  const myHelpers = useMemo(() => {
    if (!user) return [];
    
    // Find registered helpers in store linked to user
    const dbHelpers = helpers.filter(h => h.residentIds?.includes(user.id) || (user.unit && h.assignedFlats?.includes(user.unit)));
    
    // Fallback/prepopulated demo maid: "Sunita Patil" (user-worker-8 in seed)
    const isDemoResident = ["user-resident-1", "user-resident-6", "user-resident-9"].includes(user.id) || 
                           ["Sara Shah", "Rahul Mehta", "Priya Desai"].includes(user.name);
    
    const hasDemoMaid = dbHelpers.some(h => h.name.includes("Sunita"));
    
    if (isDemoResident && !hasDemoMaid) {
      const demoMaid: Helper = {
        id: "user-worker-8",
        name: "Sunita Patil",
        category: "Cooking + Cleaning",
        phone: "+91 87654 32118",
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        expectedArrival: "08:30 AM",
        expectedExit: "11:30 AM",
        assignedFlats: ["A-204", "A-302", "C-201"],
        assignedResidents: ["Sara Shah", "Rahul Mehta", "Priya Desai"],
        residentIds: ["user-resident-1", "user-resident-6", "user-resident-9"],
        joinedAt: new Date().toISOString(),
        portal: "society"
      };
      return [demoMaid, ...dbHelpers];
    }
    
    return dbHelpers;
  }, [helpers, user]);

  if (!mounted || !user) return null;

  // Handle register submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helperName.trim() || !phone.trim()) return;

    await registerHelper({
      name: helperName,
      category,
      phone,
      workingDays,
      expectedArrival,
      expectedExit,
      assignedFlats: [user.unit || ""],
      assignedResidents: [user.name],
      residentIds: [user.id],
      portal: "society" as const
    });

    setHelperName("");
    setPhone("");
    setWorkingDays(["Monday", "Wednesday", "Friday"]);
    setRegisterOpen(false);
    alert("Recurring domestic helper registered successfully.");
  };

  const toggleDay = (day: string) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const parseTime = (timeStr: string) => {
    try {
      const [time, modifier] = timeStr.split(" ");
      let [hours, mins] = time.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      return { hours, mins };
    } catch {
      return { hours: 8, mins: 30 };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8 text-indigo-500" /> Daily Check-Ins
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time entry tracker and logs for your recurring household helpers (maids, cooks, drivers).
          </p>
        </div>

        <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
          <DialogTrigger
            render={
              <Button className="gradient-primary text-white border-0 shadow-md h-10 px-4 text-xs font-semibold rounded-xl">
                <Plus className="w-4 h-4 mr-1.5" /> Register Household Helper
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)]">Register Recurring Helper</DialogTitle>
              <DialogDescription>Add helpers like cooks or maids to get notified when they enter the gate.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Helper Name</label>
                  <Input value={helperName} onChange={(e) => setHelperName(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Phone Number</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-10 px-3 border rounded-xl text-xs bg-card">
                    {helperCategories.map(cat => <option key={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Shift Start</label>
                  <Input placeholder="e.g. 08:30 AM" value={expectedArrival} onChange={(e) => setExpectedArrival(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Shift End</label>
                  <Input placeholder="e.g. 11:30 AM" value={expectedExit} onChange={(e) => setExpectedExit(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground block mb-1">Working Days</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {daysOfWeek.map(day => {
                    const active = workingDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                          active 
                            ? "bg-primary/10 border-primary/30 text-primary" 
                            : "bg-secondary/10 border-border/40 text-muted-foreground hover:bg-secondary/25"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button type="submit" className="w-full h-10 bg-primary text-white border-0 rounded-xl font-bold text-xs mt-2 shadow-md">
                Register Helper Profile
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Helpers List Grid */}
      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-4">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Today&apos;s Domestic Helpers</CardTitle>
              <CardDescription>Scheduled helpers and their real-time entry logs</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {myHelpers.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-xs">
                  No household helpers linked to your flat. Click &quot;Register Household Helper&quot; to add.
                </div>
              ) : (
                myHelpers.map((helper) => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  const todayLog = attendance.find(a => a.workerId === helper.id && a.date === todayStr);

                  let statusText = "Not Arrived";
                  let statusColor = "bg-gray-500/10 text-gray-500 border-gray-500/20";
                  let logDetails = null;
                  let missedCheckIn = false;
                  let runningLate = false;
                  let minutesLate = 0;

                  const expTime = parseTime(helper.expectedArrival);
                  const now = new Date();
                  const expectedShiftTime = new Date();
                  expectedShiftTime.setHours(expTime.hours, expTime.mins, 0, 0);

                  if (todayLog) {
                    if (todayLog.checkOutTime) {
                      statusText = "Checked Out";
                      statusColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                      logDetails = {
                        time: new Date(todayLog.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        gate: todayLog.exitGate,
                        duration: todayLog.duration
                      };
                    } else {
                      statusText = "Checked In";
                      statusColor = "bg-green-500/10 text-green-600 border-green-500/20";
                      logDetails = {
                        time: new Date(todayLog.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        gate: todayLog.entryGate
                      };
                      if (todayLog.status === "late") {
                        runningLate = true;
                        const checkIn = new Date(todayLog.checkInTime);
                        const diffMs = checkIn.getTime() - expectedShiftTime.getTime();
                        minutesLate = Math.max(0, Math.round(diffMs / (60 * 1000)));
                      }
                    }
                  } else {
                    if (now.getTime() > expectedShiftTime.getTime() + 15 * 60 * 1000) {
                      missedCheckIn = true;
                      statusText = "Delayed / Missed";
                      statusColor = "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse";
                    }
                  }

                  const helperAttendanceHistory = attendance.filter(a => a.workerId === helper.id && a.id !== todayLog?.id).slice(-4);

                  return (
                    <div key={helper.id} className="p-4 border border-border bg-secondary/10 hover:bg-secondary/20 transition-all rounded-2xl text-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-11 h-11 border border-border">
                            <AvatarFallback className="gradient-primary text-white font-bold text-sm">
                              {helper.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-foreground text-sm">{helper.name}</h3>
                              <Badge className={`${statusColor} text-[9px] font-bold`} variant="outline">{statusText}</Badge>
                            </div>
                            <p className="text-muted-foreground font-medium mt-0.5">{helper.category} • {helper.phone}</p>
                          </div>
                        </div>

                        <div className="text-right sm:text-right text-xs">
                          <p className="text-muted-foreground text-[10px] font-semibold">EXPECTED SHIFT</p>
                          <p className="font-bold text-foreground mt-0.5">{helper.expectedArrival} – {helper.expectedExit}</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-card border border-border/60 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5">
                        <div className="space-y-1">
                          {statusText === "Checked In" && logDetails && (
                            <p className="font-semibold text-foreground flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> Currently <span className="text-green-600">Inside Society</span>. Checked in at {logDetails.time}.
                            </p>
                          )}
                          {statusText === "Checked Out" && logDetails && (
                            <p className="font-semibold text-muted-foreground flex items-center gap-1">
                              <LogOut className="w-4 h-4 text-amber-500" /> Helper checked out at {logDetails.time}. Worked for {logDetails.duration} mins.
                            </p>
                          )}
                          {statusText === "Not Arrived" && !missedCheckIn && (
                            <p className="font-semibold text-muted-foreground flex items-center gap-1">
                              <Clock className="w-4 h-4 text-gray-400" /> Expected shift has not started yet. Not arrived at gate.
                            </p>
                          )}
                          {missedCheckIn && (
                            <p className="font-semibold text-red-500 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4 text-red-500" /> {helper.name} has not yet entered the society.
                            </p>
                          )}
                          
                          {todayLog && (
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Gate: {todayLog.checkOutTime ? todayLog.exitGate : todayLog.entryGate}
                            </p>
                          )}
                          {runningLate && (
                            <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                              ⚠️ Running {minutesLate} minutes late today.
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setExpandedHelper(expandedHelper === helper.id ? null : helper.id)}
                            className="text-primary hover:text-primary hover:bg-primary/5 h-8 rounded-lg text-[10px] font-bold"
                          >
                            {expandedHelper === helper.id ? "Hide Logs" : "View Attendance"}
                          </Button>
                          {helper.id !== "user-worker-8" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                if(confirm("Delete helper profile?")) deleteHelper(helper.id);
                              }}
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/5 h-8 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedHelper === helper.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-2 border-t border-border/40 overflow-hidden space-y-2.5"
                          >
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Attendance History</span>
                            {helperAttendanceHistory.length === 0 ? (
                              <p className="text-[10px] text-muted-foreground italic">No past attendance logs logged this week.</p>
                            ) : (
                              <div className="grid gap-2">
                                {helperAttendanceHistory.map((hist) => (
                                  <div key={hist.id} className="p-3 border border-border/40 rounded-xl bg-card flex justify-between items-center text-[11px]">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-bold text-foreground">{hist.date}</span>
                                      <Badge className={
                                        hist.status === "late" 
                                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px]"
                                          : "bg-green-500/10 text-green-600 border-green-500/20 text-[9px]"
                                      } variant="outline">{hist.status === "late" ? "Late" : "Present"}</Badge>
                                    </div>
                                    <div className="text-right text-muted-foreground font-medium">
                                      <span>In: {new Date(hist.checkInTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} ({hist.entryGate})</span>
                                      {hist.checkOutTime && (
                                        <span className="ml-2">➔ Out: {new Date(hist.checkOutTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} ({hist.exitGate})</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar card */}
        <div className="md:col-span-4 space-y-4">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Shield className="w-4.5 h-4.5 text-primary" /> Helper Security Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-muted-foreground font-medium leading-relaxed">
              <p>
                Recurring domestic helpers do not need a pass code. They check-in once at the security gate and all assigned resident flats receive live status updates.
              </p>
              <p>
                If a helper does not check in within 15 minutes of their scheduled arrival time, the status automatically flags them as <strong>Delayed / Missed</strong>.
              </p>
              <p>
                Gate check-in timestamps are audited and archived for the society secretary daily reports.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
