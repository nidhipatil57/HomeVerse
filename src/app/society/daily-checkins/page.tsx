"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Clock, LogIn, LogOut, Check, Plus, Wrench, Shield, CheckCircle2,
  AlertTriangle, Phone, Building, Calendar, ClipboardCheck, Trash2, ArrowRight, MapPin, Star
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
    helpers, attendance, flatAttendance, registerHelper, deleteHelper, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      helpers: state.helpers || [],
      attendance: state.attendance || [],
      flatAttendance: state.flatAttendance || [],
      registerHelper: state.registerHelper,
      deleteHelper: state.deleteHelper,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [expandedHelper, setExpandedHelper] = useState<string | null>(null);

  // Selector form states
  const [availableHelpers, setAvailableHelpers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterService, setFilterService] = useState<string>("All");
  const [selectedWorker, setSelectedWorker] = useState<any | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Form scheduling states (Step 2)
  const [expectedArrival, setExpectedArrival] = useState("08:30 AM");
  const [expectedExit, setExpectedExit] = useState("11:30 AM");
  const [workingDays, setWorkingDays] = useState<string[]>(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
  const [servicesRequired, setServicesRequired] = useState<string[]>([]);

  useEffect(() => {
    initializeDb();
    setMounted(true);
  }, [initializeDb]);

  // Fetch available maids when dialog opens
  useEffect(() => {
    if (registerOpen) {
      fetch("/api/visitors/helpers?available=true")
        .then(res => res.json())
        .then(data => {
          setAvailableHelpers(data || []);
          setStep(1);
          setSelectedWorker(null);
          setSearchQuery("");
          setFilterService("All");
        })
        .catch(err => console.error(err));
    }
  }, [registerOpen]);

  // Derive assigned helpers
  const myHelpers = useMemo(() => {
    if (!user) return [];
    return helpers.filter(h => h.residentIds?.includes(user.id) || (user.unit && h.assignedFlats?.includes(user.unit)));
  }, [helpers, user]);

  if (!mounted || !user) return null;

  // Handle assignment submission
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    await registerHelper({
      workerId: selectedWorker.id,
      expectedArrivalTime: expectedArrival,
      expectedExitTime: expectedExit,
      workingDays,
      services: servicesRequired.length > 0 ? servicesRequired : selectedWorker.specializations,
      category: selectedWorker.workerCategory || "Maid",
      name: selectedWorker.name,
      phone: selectedWorker.phone
    } as any);

    setRegisterOpen(false);
    initializeDb();
    alert(`${selectedWorker.name} has been assigned to your flat.`);
  };

  const toggleDay = (day: string) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleService = (srv: string) => {
    setServicesRequired(prev => 
      prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]
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

  // Filter available maids
  const filteredMaids = availableHelpers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = filterService === "All" || m.specializations?.some((s: string) => s.toLowerCase().includes(filterService.toLowerCase()));
    return matchesSearch && matchesService;
  });

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
                <Plus className="w-4 h-4 mr-1.5" /> Add Domestic Helper
              </Button>
            }
          />
          <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
            {step === 1 ? (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="font-[family-name:var(--font-heading)]">Add Domestic Helper</DialogTitle>
                  <DialogDescription>Select from approved registered helpers in the society database.</DialogDescription>
                </DialogHeader>

                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                  <select
                    value={filterService}
                    onChange={(e) => setFilterService(e.target.value)}
                    className="h-10 px-3 border border-input rounded-xl text-xs bg-card shrink-0"
                  >
                    <option value="All">All Services</option>
                    <option value="Cooking">Cooking</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Laundry">Laundry</option>
                    <option value="Baby Care">Baby Care</option>
                    <option value="Utensils">Utensils</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Plumber">Plumber</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Painter">Painter</option>
                    <option value="Gardener">Gardener</option>
                    <option value="Housekeeping">Housekeeping</option>
                  </select>
                </div>

                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                  {filteredMaids.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">
                      No matching domestic helpers found.
                    </div>
                  ) : (
                    filteredMaids.map((m) => (
                      <div key={m.id} className="p-3 border border-border/80 bg-secondary/10 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border border-border">
                            <AvatarFallback className="gradient-primary text-white font-bold text-xs">
                              {m.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-bold text-foreground">{m.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                              <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {m.rating?.toFixed(1) || "5.0"}
                              </span>
                              <span>•</span>
                              <span>{m.experience || "5 years"} Exp</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                              {m.specializations?.join(", ")}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedWorker(m);
                            setServicesRequired(m.specializations || []);
                            setStep(2);
                          }}
                          className="h-8 px-3 rounded-lg text-[10px] font-bold gradient-primary text-white border-0 shadow-sm"
                        >
                          Add Helper
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="font-[family-name:var(--font-heading)]">Configure Helper Schedule</DialogTitle>
                  <DialogDescription>Assign working hours and days for {selectedWorker?.name}.</DialogDescription>
                </DialogHeader>

                <div className="p-3 border border-border/60 bg-secondary/5 rounded-xl flex items-center gap-3">
                  <Avatar className="w-9 h-9 border">
                    <AvatarFallback className="gradient-primary text-white font-bold text-xs">
                      {selectedWorker?.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-xs">{selectedWorker?.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{selectedWorker?.specializations?.join(", ")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Expected Arrival Time</label>
                    <Input
                      placeholder="e.g. 08:30 AM"
                      value={expectedArrival}
                      onChange={(e) => setExpectedArrival(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Expected Exit Time</label>
                    <Input
                      placeholder="e.g. 11:30 AM"
                      value={expectedExit}
                      onChange={(e) => setExpectedExit(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Working Days</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {daysOfWeek.map(day => {
                      const active = workingDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
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

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Required Services</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedWorker?.specializations?.map((srv: string) => {
                      const active = servicesRequired.includes(srv);
                      return (
                        <button
                          type="button"
                          key={srv}
                          onClick={() => toggleService(srv)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                            active 
                              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600" 
                              : "bg-secondary/10 border-border/40 text-muted-foreground hover:bg-secondary/25"
                          }`}
                        >
                          {srv}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="w-1/3 h-10 rounded-xl text-xs font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="w-2/3 h-10 bg-primary text-white border-0 rounded-xl font-bold text-xs shadow-md"
                  >
                    Confirm & Assign
                  </Button>
                </div>
              </form>
            )}
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
                  const todayFlatLogs = flatAttendance.filter(fa => fa.helperId === helper.id && fa.date === todayStr);
                  const myFlatLog = todayFlatLogs.find(fa => fa.flatNumber === user?.unit);

                  let statusText = "Not Arrived";
                  let statusColor = "bg-gray-500/10 text-gray-500 border-gray-500/20";
                  if (todayLog) {
                    if (todayLog.checkOutTime) {
                      statusText = "Exited Society";
                      statusColor = "bg-orange-500/10 text-orange-600 border-orange-500/20";
                    } else if (myFlatLog && myFlatLog.status === "completed") {
                      statusText = "Completed Work";
                      statusColor = "bg-green-500/15 text-green-600 border-green-500/20";
                    } else {
                      statusText = "Inside Society";
                      statusColor = "bg-green-500/15 text-green-600 border-green-500/20";
                    }
                  } else {
                    const expTime = parseTime(helper.expectedArrival);
                    const expectedShiftTime = new Date();
                    expectedShiftTime.setHours(expTime.hours, expTime.mins, 0, 0);
                    if (new Date().getTime() > expectedShiftTime.getTime() + 15 * 60 * 1000) {
                      statusText = "Delayed / Missed";
                      statusColor = "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse";
                    }
                  }

                  const helperAttendanceHistory = attendance.filter(a => a.workerId === helper.id && a.id !== todayLog?.id).slice(-4);

                  // Create timeline milestones for today
                  const milestones = [];
                  if (todayLog) {
                    milestones.push({
                      label: "Entered Society",
                      time: new Date(todayLog.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      detail: `${todayLog.entryGate || "Main Gate"} (Recorded by Security)`
                    });
                  }
                  if (myFlatLog && myFlatLog.status === "completed") {
                    milestones.push({
                      label: "Completed Work",
                      time: new Date(myFlatLog.checkOutTime || myFlatLog.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      detail: myFlatLog.notes ? `Notes: "${myFlatLog.notes}"` : "Completed"
                    });
                  }
                  if (todayLog && todayLog.checkOutTime) {
                    milestones.push({
                      label: "Exited Society",
                      time: new Date(todayLog.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      detail: `${todayLog.exitGate || "Main Gate"} (Recorded by Security)`
                    });
                  }

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

                      {/* Today's Status Timeline */}
                      <div className="p-4 rounded-xl bg-card border border-border/60 space-y-3">
                        <h4 className="font-bold text-foreground text-[10px] uppercase tracking-wider text-muted-foreground">Today&apos;s Live Status Tracker</h4>
                        {milestones.length === 0 ? (
                          <p className="text-muted-foreground font-semibold flex items-center gap-1.5 py-1">
                            <Clock className="w-4 h-4 text-gray-400" /> Expected shift has not started yet. Not arrived at society gate.
                          </p>
                        ) : (
                          <div className="relative pl-5 border-l-2 border-primary/20 space-y-4 py-1">
                            {milestones.map((m, mIdx) => (
                              <div key={mIdx} className="relative">
                                <div className="absolute -left-[26px] top-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                                  <Check className="w-2 h-2 text-white" />
                                </div>
                                <div className="flex justify-between items-start text-[11px] font-semibold text-foreground">
                                  <span>{m.label}</span>
                                  <span className="text-muted-foreground">{m.time} ({m.detail})</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-end pt-2 border-t border-border/40">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setExpandedHelper(expandedHelper === helper.id ? null : helper.id)}
                            className="text-primary hover:text-primary hover:bg-primary/5 h-8 rounded-lg text-[10px] font-bold"
                          >
                            {expandedHelper === helper.id ? "Hide Logs" : "View Attendance History"}
                          </Button>
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
                              <div className="grid gap-3">
                                {helperAttendanceHistory.map((hist) => {
                                  const dayFlatLog = flatAttendance.find(fa => fa.helperId === helper.id && fa.date === hist.date && fa.flatNumber === user?.unit && fa.status === "completed");
                                  return (
                                    <div key={hist.id} className="p-3 border border-border/40 rounded-xl bg-card space-y-2 text-[11px] font-semibold">
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4 text-muted-foreground" />
                                          <span className="font-bold text-foreground">{hist.date}</span>
                                          <Badge className={
                                            hist.status === "late" 
                                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px]"
                                              : "bg-green-500/10 text-green-600 border-green-500/20 text-[9px]"
                                          } variant="outline">{hist.status === "late" ? "Late" : "Present"}</Badge>
                                        </div>
                                      </div>

                                      <div className="pl-2.5 border-l border-border/60 space-y-1.5 text-[10px] text-muted-foreground font-medium">
                                        <div className="flex justify-between">
                                          <span>Entered Society</span>
                                          <span>{hist.checkInTime ? `${new Date(hist.checkInTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} (${hist.entryGate || "Main Gate"})` : "—"}</span>
                                        </div>
                                        {dayFlatLog && (
                                          <div className="flex justify-between text-green-600">
                                            <span>Completed Work</span>
                                            <span>{dayFlatLog.checkOutTime ? new Date(dayFlatLog.checkOutTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "Completed"}</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between">
                                          <span>Exited Society</span>
                                          <span>{hist.checkOutTime ? `${new Date(hist.checkOutTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} (${hist.exitGate || "Main Gate"})` : "Inside"}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
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
