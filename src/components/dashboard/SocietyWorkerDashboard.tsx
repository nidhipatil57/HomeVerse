"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase, Clock, CheckCircle2, Star, Play, XCircle, Camera, Check, Bot, Building2, Users, AlertTriangle, Wrench,
  LogIn, LogOut, MapPin, Calendar, Building, Phone, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import type { Helper, HelperAttendance } from "@/types";

export function SocietyWorkerDashboard({ worker }: { worker: any }) {
  const {
    complaints,
    updateComplaintStatus,
    assignComplaintWorker,
    helpers,
    attendance,
    flatAttendance,
    checkInHelper,
    checkOutHelper,
    completeFlatWork,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      complaints: state.complaints,
      updateComplaintStatus: state.updateComplaintStatus,
      assignComplaintWorker: state.assignComplaintWorker,
      helpers: state.helpers || [],
      attendance: state.attendance || [],
      flatAttendance: state.flatAttendance || [],
      checkInHelper: state.checkInHelper,
      checkOutHelper: state.checkOutHelper,
      completeFlatWork: state.completeFlatWork,
      initializeDb: state.initializeDb,
    }))
  );

  const [activeJobId, setActiveJobId] = useState<string>("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [completeComment, setCompleteComment] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Daily helper states
  const [flatWorkModalOpen, setFlatWorkModalOpen] = useState(false);
  const [selectedWorkFlat, setSelectedWorkFlat] = useState<any | null>(null);
  const [flatWorkNotes, setFlatWorkNotes] = useState("");
  const [flatWorkPhoto, setFlatWorkPhoto] = useState("");

  useEffect(() => {
    initializeDb();
  }, [initializeDb]);

  // Find helper profile for check-in shifts
  const helperProfile = useMemo(() => {
    if (!worker) return null;
    const dbHelper = helpers.find(
      (h) => h.id === worker.id || h.name.toLowerCase().includes(worker.name.toLowerCase())
    );

    // Seed fallback if worker is user-worker-8 (Sunita)
    if (worker.id === "user-worker-8" && !dbHelper) {
      return {
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
        portal: "society" as const
      };
    }
    return dbHelper;
  }, [helpers, worker]);

  // Today's attendance log
  const todayLog = useMemo(() => {
    if (!helperProfile) return null;
    const todayStr = new Date().toISOString().split("T")[0];
    return attendance.find((a) => a.workerId === helperProfile.id && a.date === todayStr);
  }, [attendance, helperProfile]);

  // Today's flat logs
  const todayFlatLogs = useMemo(() => {
    if (!helperProfile) return [];
    const todayStr = new Date().toISOString().split("T")[0];
    return flatAttendance.filter((fa: any) => fa.helperId === helperProfile.id && fa.date === todayStr);
  }, [flatAttendance, helperProfile]);

  // Work Schedule time slots
  const workSchedule = useMemo(() => {
    if (!helperProfile) return [];
    const timeSlots = ["08:30 – 09:15", "09:30 – 10:15", "10:30 – 11:15", "11:30 – 12:15"];
    const activities = ["Cooking", "Cleaning", "Laundry", "Housekeeping"];
    return helperProfile.assignedFlats.map((flat, index) => ({
      flat,
      resident: helperProfile.assignedResidents[index] || "Resident",
      residentId: helperProfile.residentIds[index] || "user-resident-1",
      time: timeSlots[index % timeSlots.length],
      activity: activities[index % activities.length]
    }));
  }, [helperProfile]);

  // Attendance History
  const historyLogs = useMemo(() => {
    if (!helperProfile) return [];
    return attendance.filter((a) => a.workerId === helperProfile.id && a.id !== todayLog?.id).slice(-5);
  }, [attendance, helperProfile, todayLog]);

  // Check if all assigned flats are completed today
  const allFlatsCompleted = useMemo(() => {
    if (workSchedule.length === 0) return false;
    return workSchedule.every(task => {
      const log = todayFlatLogs.find((fa: any) => fa.flatNumber === task.flat);
      return log && log.status === "completed";
    });
  }, [workSchedule, todayFlatLogs]);

  // Computed Status Text
  const currentStatusText = useMemo(() => {
    if (!todayLog) return "Not Checked Into Society";
    if (todayLog.checkOutTime) return "Checked Out Of Society";
    
    const activeFlat = todayFlatLogs.find((fa: any) => fa.status === "working");
    if (activeFlat) return `Working at Flat ${activeFlat.flatNumber}`;
    
    if (allFlatsCompleted) return "Completed Today's Work";
    
    const completedCount = todayFlatLogs.filter((fa: any) => fa.status === "completed").length;
    if (completedCount > 0) return "Travelling to Next Flat";
    
    return "Inside Society";
  }, [todayLog, todayFlatLogs, allFlatsCompleted]);

  const handleCompleteFlatWork = async () => {
    if (!helperProfile || !selectedWorkFlat) return;
    try {
      await completeFlatWork(
        helperProfile.id,
        selectedWorkFlat.flat,
        selectedWorkFlat.residentId,
        selectedWorkFlat.resident,
        selectedWorkFlat.activity,
        flatWorkNotes,
        flatWorkPhoto || undefined
      );
      setFlatWorkModalOpen(false);
      setSelectedWorkFlat(null);
      setFlatWorkNotes("");
      setFlatWorkPhoto("");
      alert(`Work completion successfully logged for Flat ${selectedWorkFlat.flat}.`);
    } catch (e) {
      console.error("Flat completion failed:", e);
    }
  };

  // Filter specialized jobs for worker
  const mySpecializedJobs = complaints.filter(
    (c) => c.portal === "society" && c.category?.toLowerCase() === worker?.workerCategory?.toLowerCase()
  );

  // Set default active job
  useEffect(() => {
    if (mySpecializedJobs.length > 0 && !activeJobId) {
      setActiveJobId(mySpecializedJobs[0].id);
    }
  }, [mySpecializedJobs, activeJobId]);

  const activeJob = mySpecializedJobs.find(j => j.id === activeJobId) || mySpecializedJobs[0];

  const handleStartJob = (id: string) => {
    assignComplaintWorker(id, worker.name, worker.id, "20 mins");
    updateComplaintStatus(id, "in-progress", { by: worker.name, note: "Worker is on the way." });
  };

  const handleOpenReject = (id: string) => {
    setActiveJobId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const submitReject = () => {
    if (!rejectReason) return;
    updateComplaintStatus(activeJobId, "submitted", {
      by: worker.name,
      note: `Rejected by worker ${worker.name}. Reason: ${rejectReason}`
    });
    setShowRejectModal(false);
  };

  const handleOpenComplete = (id: string) => {
    setActiveJobId(id);
    setCompleteComment("");
    setShowCompleteModal(true);
  };

  const submitComplete = () => {
    updateComplaintStatus(activeJobId, "resolved", {
      by: worker.name,
      note: completeComment || "Fixed the reported issue successfully.",
      afterPhoto: "/images/after-upload-placeholder.jpg"
    });
    setShowCompleteModal(false);
  };

  // Stats calculations
  const totalAssigned = mySpecializedJobs.filter(j => j.status === "assigned").length;
  const totalInProgress = mySpecializedJobs.filter(j => j.status === "in-progress").length;
  const totalCompleted = mySpecializedJobs.filter(j => j.status === "resolved" || j.status === "closed").length;
  const criticalJobs = mySpecializedJobs.filter(j => j.status !== "resolved" && j.status !== "closed" && j.priority === "critical").length;

  const defaultAiSuggestions: Record<string, string[]> = {
    plumbing: ["PPR Pipe (1/2\")", "Teflon Thread Seal Tape", "Adjustable Spanner", "Silicone Sealant"],
    electrical: ["Insulated Tester Screwdriver", "PVC Electrical Tape", "5-Speed Switch Regulator", "Wire Stripper"],
    locksmith: ["Lockpicks", "Lubricant Spray", "Key Blank Cutter"],
    lift: ["T-Wrench Keys", "Industrial Grease/Lubricant", "Volt Meter", "Safety Harness"]
  };

  const suggestions = activeJob
    ? defaultAiSuggestions[activeJob.category.toLowerCase()] || ["Standard Hand Tools", "Safety Equipment"]
    : ["Safety Gloves", "Multi-bit Screwdriver"];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/30 pb-5"
      >
        <div>
          <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">
            {worker?.workerCategory || "Electrician"} • Shift: {worker?.workingShift || "Morning"}
          </span>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] mt-1 flex items-center gap-2">
            Worker Dashboard
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-sans font-medium">
              Employee ID: {worker?.employeeId || "EMP-2940"}
            </span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back, <span className="font-semibold text-foreground">{worker?.name || "Ramesh"}</span>. Below are your assigned jobs for today.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-red-500/15 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {criticalJobs} Critical Alert{criticalJobs !== 1 ? "s" : ""}
          </Badge>
          <Badge className="bg-green-500/15 text-green-500 border border-green-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Status: {currentStatusText}
          </Badge>
        </div>
      </motion.div>

      {/* FLAT WORK COMPLETION DIALOG */}
      <Dialog open={flatWorkModalOpen} onOpenChange={setFlatWorkModalOpen}>
        <DialogContent className="sm:max-w-xs rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)] text-sm">Mark Work Completed</DialogTitle>
            <CardDescription className="text-[10px] mt-1">Add optional notes and completion photo for Flat {selectedWorkFlat?.flat}</CardDescription>
          </DialogHeader>
          <div className="space-y-3 mt-3">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground block mb-1">Completion Notes</label>
              <textarea
                value={flatWorkNotes}
                onChange={(e: any) => setFlatWorkNotes(e.target.value)}
                placeholder="Optional notes e.g., watered plants, key under mat"
                className="w-full h-20 p-2.5 border rounded-xl text-xs bg-card resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground block mb-1">Completion Photo URL</label>
              <Input
                value={flatWorkPhoto}
                onChange={(e: any) => setFlatWorkPhoto(e.target.value)}
                placeholder="Optional photo URL"
                className="h-9 text-xs rounded-xl"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" onClick={() => setFlatWorkModalOpen(false)} className="rounded-xl text-xs h-9 font-bold">Cancel</Button>
              <Button onClick={handleCompleteFlatWork} className="bg-green-600 hover:bg-green-700 text-white border-0 rounded-xl text-xs h-9 font-bold">Submit Completion</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Daily Helper Attendance Dashboard (Check-In / Out, Schedule, History) */}
      {helperProfile && (
        <div className="grid lg:grid-cols-12 gap-6 bg-gradient-to-br from-indigo-500/5 to-primary/5 p-6 rounded-3xl border border-primary/10">
          {/* Left Column: Prominent Shift Card & Gate check-in */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-border/60 bg-card overflow-hidden shadow-md">
              <div className="gradient-primary p-5 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">Shift Schedule</span>
                <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] mt-0.5">Good Morning, {worker?.name.split(" ")[0]} 👋</h3>
                <div className="flex items-center gap-1.5 text-xs opacity-90 mt-2 font-medium">
                  <Clock className="w-4 h-4" /> Expected Shift: {helperProfile.expectedArrival} – {helperProfile.expectedExit}
                </div>
              </div>
              <CardContent className="p-5 space-y-4 text-xs">
                <div className="flex justify-between items-center border-b pb-3.5">
                  <span className="text-muted-foreground font-semibold">Assigned Flats:</span>
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">{helperProfile.assignedFlats.length} Flats</Badge>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-foreground text-[10px] uppercase tracking-wider text-muted-foreground">Today&apos;s Attendance</h4>
                  {!todayLog ? (
                    <div className="p-3 bg-secondary/20 border border-border/60 rounded-xl text-muted-foreground font-semibold space-y-1">
                      <p className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /> Expected shift has not started yet.</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Status: Not arrived at gate.</p>
                    </div>
                  ) : todayLog.checkOutTime ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 font-semibold space-y-1">
                      <p className="flex items-center gap-1"><Check className="w-4 h-4" /> Checked Out of Society</p>
                      <p className="text-[10px] text-foreground/80 font-medium">Exited at: {new Date(todayLog.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Gate: {todayLog.exitGate}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Recorded by Security</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-700 font-semibold space-y-1">
                      <p className="flex items-center gap-1"><Check className="w-4 h-4" /> Checked Into Society</p>
                      <p className="text-[10px] text-foreground/80 font-medium">Arrived at: {new Date(todayLog.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Gate: {todayLog.entryGate}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Recorded by Security</p>
                      <p className="text-[10px] text-green-600 font-bold mt-1">Status: Inside Society</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column: Daily Work Schedule */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-border/60 bg-card h-full flex flex-col">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><MapPin className="w-4.5 h-4.5 text-indigo-500" /> Today&apos;s Work Schedule</CardTitle>
                <CardDescription className="text-[10px]">Your routing checklist for household services</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto space-y-3">
                {workSchedule.map((task, idx) => {
                  const flatLog = todayFlatLogs.find((fa: any) => fa.flatNumber === task.flat && fa.status === "completed");
                  const isSocietyInside = todayLog && !todayLog.checkOutTime;
                  const isEnabled = isSocietyInside && !flatLog;

                  return (
                    <div key={idx} className="p-3.5 border border-border bg-secondary/5 rounded-2xl flex flex-col gap-2.5 text-xs transition-all hover:bg-secondary/15">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-foreground text-sm">Flat {task.flat}</span>
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold">{task.activity}</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium">Resident: {task.resident}</p>
                        </div>
                        <span className="font-bold text-foreground bg-secondary/20 px-2.5 py-1 rounded-lg text-[10px]">{task.time}</span>
                      </div>

                      {!flatLog ? (
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-[10px] font-bold ${isSocietyInside ? "text-green-600" : "text-muted-foreground"}`}>
                            {isSocietyInside ? "📋 Work Pending" : "🔒 Checked out or not arrived"}
                          </span>
                          <Button
                            onClick={() => {
                              setSelectedWorkFlat(task);
                              setFlatWorkNotes("");
                              setFlatWorkPhoto("");
                              setFlatWorkModalOpen(true);
                            }}
                            disabled={!isEnabled}
                            className={`h-8 text-[10px] font-bold px-4 rounded-lg flex items-center gap-1 border-0 ${
                              isEnabled ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer" : "bg-gray-400 text-white cursor-not-allowed"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                          </Button>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-700 text-[10px] space-y-1">
                          <p className="font-bold flex items-center gap-1">✔ Work Completed</p>
                          {flatLog.checkOutTime && (
                            <p className="text-foreground/80 font-medium">
                              Completed at: {new Date(flatLog.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                          {flatLog.notes && (
                            <p className="text-[9px] text-muted-foreground italic font-semibold">Notes: &quot;{flatLog.notes}&quot;</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Attendance History */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-border/60 bg-card h-full flex flex-col">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5"><Calendar className="w-4.5 h-4.5 text-indigo-500" /> My Attendance History</CardTitle>
                <CardDescription className="text-[10px]">Your logged gate entries this week</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto space-y-2">
                {historyLogs.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic py-8 text-center">No past attendance logged.</p>
                ) : (
                  historyLogs.map((log) => {
                    const dayFlatLogs = flatAttendance.filter((fa: any) => fa.helperId === helperProfile.id && fa.date === log.date);
                    return (
                      <div key={log.id} className="p-3 border border-border/40 bg-secondary/5 rounded-2xl space-y-2 text-[10px] font-semibold">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold text-foreground">{log.date}</span>
                            <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded border ${
                              log.status === "late" 
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                                : "bg-green-500/10 text-green-600 border-green-500/20"
                            }`}>{log.status === "late" ? "Late" : "Present"}</span>
                          </div>
                          <div className="text-muted-foreground">
                            Society In: {log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                          </div>
                        </div>
                        {dayFlatLogs.length > 0 && (
                          <div className="pl-2.5 border-l border-border space-y-1 text-[9px] text-muted-foreground font-medium">
                            {dayFlatLogs.map((fl: any, flIdx: number) => (
                              <div key={flIdx} className="flex justify-between">
                                <span>Flat {fl.flatNumber} ({fl.servicePerformed})</span>
                                <span>
                                  {fl.checkInTime ? new Date(fl.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"} 
                                  ➔ 
                                  {fl.checkOutTime ? new Date(fl.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="text-right text-[9px] text-muted-foreground/80 font-medium">
                          Society Out: {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Inside"}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Assigned Jobs Today", value: totalAssigned, icon: Briefcase, color: "text-blue-500 bg-blue-500/10" },
          { label: "Active Jobs (In Progress)", value: totalInProgress, icon: Clock, color: "text-amber-500 bg-amber-500/10" },
          { label: "Completed Jobs", value: totalCompleted, icon: CheckCircle2, color: "text-green-500 bg-green-500/10" },
          { label: "Performance Score", value: "4.8★ / 95%", icon: Star, color: "text-purple-500 bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Work Area */}
      {mySpecializedJobs.length === 0 ? (
        <Card className="border-dashed border-border/70 p-16 text-center text-muted-foreground">
          <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-foreground">No Jobs Assigned</h3>
          <p className="text-sm mt-1 max-w-sm mx-auto">There are currently no active complaints matching your trade category ({worker?.workerCategory}). All caught up!</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left column: JobList */}
          <Card className="lg:col-span-5 border-border/50 flex flex-col h-[650px] overflow-hidden">
            <CardHeader className="border-b border-border/30 pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" />
                Assigned Tasks Feed
              </CardTitle>
              <CardDescription>Select a task below to review details, route mapping, and tool requirements.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {mySpecializedJobs.map((job) => (
                <button
                   key={job.id}
                   onClick={() => setActiveJobId(job.id)}
                   className={`w-full text-left p-4 rounded-2xl border transition-all relative flex flex-col gap-2 ${
                     activeJobId === job.id
                       ? "border-blue-500/50 bg-blue-500/5 shadow-md"
                       : "border-border/50 hover:bg-secondary/40"
                   }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <Badge className={`text-[10px] uppercase font-bold ${
                      job.priority === "critical" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                      job.priority === "high" ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" :
                      "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                    }`}>
                      {job.priority}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{job.estimatedResolution || "45m"} ETA</span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-foreground line-clamp-1">{job.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Unit: {job.unit} • {job.building}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-1 pt-2 border-t border-border/20">
                    <span className="text-xs font-semibold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded">
                      {job.category}
                    </span>
                    
                    <Badge className={`text-[10px] font-bold ${
                      job.status === "resolved" || job.status === "closed" ? "bg-green-500/15 text-green-500" :
                      job.status === "in-progress" ? "bg-amber-500/15 text-amber-500" :
                      "bg-blue-500/15 text-blue-500"
                    }`}>
                      {job.status === "in-progress" ? "In Progress" : job.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Right column: Task Details and AI Suggested Actions */}
          {activeJob && (
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Detail Card */}
              <Card className="border-border/50 flex-1 flex flex-col justify-between">
                <div>
                  <CardHeader className="border-b border-border/30 pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs font-bold text-blue-500 uppercase">{activeJob.category}</span>
                        <CardTitle className="text-xl font-bold mt-0.5">{activeJob.title}</CardTitle>
                      </div>
                      <Badge className={`text-xs px-2.5 py-1 ${
                        activeJob.status === "resolved" || activeJob.status === "closed" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                        activeJob.status === "in-progress" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      }`}>
                        {activeJob.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-5">
                    {/* Meta details */}
                    <div className="grid grid-cols-2 gap-4 text-sm p-4 rounded-2xl bg-secondary/30 border border-border/30">
                      <div>
                        <span className="text-xs text-muted-foreground block">Building / Wing</span>
                        <span className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {activeJob.building}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Flat Number</span>
                        <span className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {activeJob.unit}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <span className="text-xs font-bold text-muted-foreground block">Resident Remark / Notes</span>
                      <p className="text-sm text-foreground leading-relaxed mt-1.5 p-3.5 rounded-2xl bg-card border border-border/50">
                        &quot;{activeJob.description}&quot;
                      </p>
                    </div>

                    {/* Photo Attachments */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground block mb-1.5">Before Job Photo</span>
                        {activeJob.beforePhoto || activeJob.images?.[0] ? (
                          <div className="h-32 rounded-xl bg-secondary/50 border border-border flex flex-col items-center justify-center relative overflow-hidden">
                            <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground font-mono">before_job_proof.jpg</span>
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5"><Check className="w-3 h-3" /></div>
                          </div>
                        ) : (
                          <div className="h-32 rounded-xl border border-dashed border-border/70 flex flex-col items-center justify-center text-muted-foreground bg-secondary/10">
                            <Camera className="w-6 h-6 mb-1 text-muted-foreground/50" />
                            <span className="text-xs">No Before Image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-muted-foreground block mb-1.5">After Job Photo</span>
                        {activeJob.afterPhoto ? (
                          <div className="h-32 rounded-xl bg-secondary/50 border border-border flex flex-col items-center justify-center relative overflow-hidden">
                            <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground font-mono">after_job_proof.jpg</span>
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-0.5"><Check className="w-3 h-3" /></div>
                          </div>
                        ) : (
                          <div className="h-32 rounded-xl border border-dashed border-border/70 flex flex-col items-center justify-center text-muted-foreground bg-secondary/10">
                            <Camera className="w-6 h-6 mb-1 text-muted-foreground/50" />
                            <span className="text-xs">No After Image</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline Feed */}
                    <div className="space-y-2 mt-4">
                      <span className="text-xs font-bold text-muted-foreground block">Activity Logs / Timeline</span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {activeJob.timeline?.map((log, lIdx) => (
                          <div key={lIdx} className="text-xs flex items-center justify-between p-2 rounded-lg bg-secondary/20">
                            <span className="font-semibold capitalize text-foreground">{log.status}</span>
                            <span className="text-[10px] text-muted-foreground">{log.note}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Actions Footer */}
                  <CardContent className="pt-2 pb-6 border-t border-border/20 flex flex-wrap gap-2.5">
                    {(activeJob.status === "submitted" || activeJob.status === "assigned") && !activeJob.assignedTo?.includes(worker.name) && (
                      <>
                        <Button
                          onClick={() => handleStartJob(activeJob.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 border-0"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Accept & Start Job
                        </Button>
                        <Button
                          onClick={() => handleOpenReject(activeJob.id)}
                          variant="outline"
                          className="border-red-500/20 hover:border-red-500 text-red-500 hover:bg-red-500/10 rounded-xl h-11"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Job
                        </Button>
                      </>
                    )}
                    {activeJob.status === "in-progress" && (
                      <Button
                        onClick={() => handleOpenComplete(activeJob.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 border-0 shadow-md shadow-green-500/20"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Resolved & Upload proof
                      </Button>
                    )}
                    {(activeJob.status === "resolved" || activeJob.status === "closed") && (
                      <Button disabled className="w-full bg-secondary/80 text-muted-foreground rounded-xl h-11">
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        Task Completed Successfully
                      </Button>
                    )}
                  </CardContent>
                </div>
              </Card>

              {/* AI Suggestions Box */}
              <Card className="border-border/50 bg-gradient-to-r from-blue-500/10 via-background to-secondary/15 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 shrink-0 shadow-inner">
                    <Bot className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
                      AI Suggested Tools & Inventory
                      <Badge className="text-[8px] bg-blue-500 text-white font-mono scale-90 px-1 py-0 border-0">Copilot</Badge>
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      AI analyzed &quot;{activeJob.title}&quot; and recommends taking the following equipment:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {suggestions.map((tool) => (
                        <span
                          key={tool}
                          className="text-[10px] px-2 py-1 rounded-lg bg-background/80 border border-border/50 text-foreground flex items-center gap-1 shrink-0"
                        >
                          <Wrench className="w-3 h-3 text-blue-500" />
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border shadow-2xl rounded-3xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-2">Reject Assigned Task</h3>
            <p className="text-xs text-muted-foreground mb-4">Please provide a valid reason for rejecting this service request. This will be reported to the Society Committee.</p>
            <textarea
              placeholder="e.g. Requires heavy plumbing equipment that I don't have, or I am scheduled for shift hand-off."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full h-24 p-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowRejectModal(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={submitReject} disabled={!rejectReason} className="bg-red-600 hover:bg-red-700 text-white rounded-xl border-0">Reject Task</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* COMPLETE MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border shadow-2xl rounded-3xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-2">Resolve Service Complaint</h3>
            <p className="text-xs text-muted-foreground mb-4">Submit your completion report and add any final remarks or instructions for the resident.</p>
            
            <div className="p-4 rounded-xl border border-dashed border-border/70 hover:bg-secondary/20 cursor-pointer flex items-center justify-center gap-2 mb-4 relative">
              <Camera className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Upload After Proof Image</span>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>

            <textarea
              placeholder="Add completion notes: what was fixed, parts replaced, or general advice for the resident..."
              value={completeComment}
              onChange={(e) => setCompleteComment(e.target.value)}
              className="w-full h-24 p-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
            />
            
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowCompleteModal(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={submitComplete} className="bg-green-600 hover:bg-green-700 text-white rounded-xl border-0">Submit Resolution</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
