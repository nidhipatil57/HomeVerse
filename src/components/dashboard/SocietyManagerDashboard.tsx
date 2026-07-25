"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wrench, CheckCircle2, Star, Clock, AlertTriangle, Play, Check, Shield, UserCheck, XCircle, Trash2, Edit2, Plus,
  MessageSquare, Phone, Calendar, User, UserPlus, DollarSign, Activity, AlertOctagon, Send
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";

export function SocietyManagerDashboard({ manager }: { manager: any }) {
  const {
    complaints,
    serviceBookings,
    workerProfiles,
    users,
    actionComplaintManager,
    scheduleBooking,
    completeBooking,
    addStaticWorker,
    updateStaticWorker,
    deleteStaticWorker,
    chatMessages,
    sendChatMessage,
    fetchChatMessages,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      complaints: state.complaints,
      serviceBookings: state.serviceBookings || [],
      workerProfiles: state.workerProfiles || [],
      users: state.users || [],
      actionComplaintManager: state.actionComplaintManager,
      scheduleBooking: state.scheduleBooking,
      completeBooking: state.completeBooking,
      addStaticWorker: state.addStaticWorker,
      updateStaticWorker: state.updateStaticWorker,
      deleteStaticWorker: state.deleteStaticWorker,
      chatMessages: state.chatMessages || [],
      sendChatMessage: state.sendChatMessage,
      fetchChatMessages: state.fetchChatMessages,
      initializeDb: state.initializeDb
    }))
  );

  const [activeTab, setActiveTab] = useState<"overview" | "requests" | "workers" | "chats">("overview");
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Forms
  const [coordWorker, setCoordWorker] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");
  const [operationalNotes, setOperationalNotes] = useState("");
  const [managerStatus, setManagerStatus] = useState("Worker Being Coordinated");

  // Worker Form State
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);
  const [workerForm, setWorkerForm] = useState({
    name: "",
    email: "",
    phone: "",
    workerCategory: "Electrician",
    experience: "3 years",
    visitCharge: "150",
    workingHoursStart: "09:00",
    workingHoursEnd: "18:00",
    isVerified: true,
    isSocietyVerified: true,
    isPoliceVerified: true
  });

  // Chat State
  const [selectedChatUser, setSelectedChatUser] = useState<any | null>(null);
  const [typedMessage, setTypedMessage] = useState("");

  useEffect(() => {
    initializeDb();
  }, [initializeDb]);

  // Static Workers list
  const workers = useMemo(() => {
    return users.filter(u => u.role === "worker");
  }, [users]);

  // Complaints forwarded to manager
  const managerComplaints = useMemo(() => {
    const forwardedStatuses = [
      "Forwarded to Manager",
      "Worker Being Coordinated",
      "Scheduled",
      "Work In Progress"
    ];
    return complaints.filter(c => c.portal === "society" && forwardedStatuses.includes(c.status));
  }, [complaints]);

  // Bookings forwarded to manager
  const managerBookings = useMemo(() => {
    return serviceBookings.filter(b => b.status === "Forwarded to Manager" || b.status === "Scheduled");
  }, [serviceBookings]);

  // Active Chats users (Residents and Secretary)
  const chatUsers = useMemo(() => {
    return users.filter(u => u.id !== manager.id && (u.role === "resident" || u.role === "secretary"));
  }, [users, manager]);

  useEffect(() => {
    if (selectedChatUser) {
      fetchChatMessages(selectedChatUser.id);
      const interval = setInterval(() => {
        fetchChatMessages(selectedChatUser.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChatUser, fetchChatMessages]);

  // KPIs
  const metrics = useMemo(() => {
    const activeComplaintsCount = managerComplaints.length;
    const activeBookingsCount = managerBookings.length;
    const totalWorkersCount = workers.length;
    const busyWorkersCount = workers.filter(w => w.availability === "Busy").length;
    const utilizationRate = totalWorkersCount ? Math.round((busyWorkersCount / totalWorkersCount) * 100) : 0;
    
    return {
      activeRequests: activeComplaintsCount + activeBookingsCount,
      emergencyRequests: complaints.filter(c => c.status !== "Completed" && c.priority === "emergency").length,
      utilizationRate,
      avgResolution: "2.1 Hours"
    };
  }, [managerComplaints, managerBookings, workers, complaints]);

  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await actionComplaintManager(selectedComplaint.id, {
        status: managerStatus,
        assignedTo: coordWorker,
        expectedArrival,
        operationalNotes
      });
      setSelectedComplaint(null);
      setCoordWorker("");
      setExpectedArrival("");
      setOperationalNotes("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      await scheduleBooking(selectedBooking.id, operationalNotes);
      setSelectedBooking(null);
      setOperationalNotes("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await completeBooking(bookingId, "Completed by Manager offline coordinate");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWorker) {
        await updateStaticWorker(editingWorker.id, workerForm);
      } else {
        await addStaticWorker(workerForm);
      }
      setShowWorkerModal(false);
      setEditingWorker(null);
      setWorkerForm({
        name: "",
        email: "",
        phone: "",
        workerCategory: "Electrician",
        experience: "3 years",
        visitCharge: "150",
        workingHoursStart: "09:00",
        workingHoursEnd: "18:00",
        isVerified: true,
        isSocietyVerified: true,
        isPoliceVerified: true
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWorker = async (workerId: string) => {
    if (confirm("Are you sure you want to remove this worker from the society directory?")) {
      try {
        await deleteStaticWorker(workerId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage || !selectedChatUser) return;
    try {
      await sendChatMessage({
        receiverId: selectedChatUser.id,
        message: typedMessage
      });
      setTypedMessage("");
      fetchChatMessages(selectedChatUser.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Operations Portal</h1>
          <p className="text-muted-foreground mt-1">
            Coordinate workers offline, manage complaints validation, and update timelines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-full border border-primary/20 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Synchronization
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Operations</p>
                <h3 className="text-2xl font-bold mt-1">{metrics.activeRequests}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Forwarded complaints & bookings</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emergency Alerts</p>
                <h3 className="text-2xl font-bold mt-1 text-red-500">{metrics.emergencyRequests}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertOctagon className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Critical issues raised</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Worker Utilization</p>
                <h3 className="text-2xl font-bold mt-1">{metrics.utilizationRate}%</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Percent of busy workers</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
                <h3 className="text-2xl font-bold mt-1">{metrics.avgResolution}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Verification to closure</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-[2px] ${
            activeTab === "overview" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          🔧 Complaints Operations ({managerComplaints.length})
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-[2px] ${
            activeTab === "requests" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          📅 Service Bookings ({managerBookings.length})
        </button>
        <button
          onClick={() => setActiveTab("workers")}
          className={`px-4 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-[2px] ${
            activeTab === "workers" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          👥 Worker Directory ({workers.length})
        </button>
        <button
          onClick={() => setActiveTab("chats")}
          className={`px-4 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-[2px] ${
            activeTab === "chats" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          💬 Communications Hub
        </button>
      </div>

      {/* Render Active Tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Complaints List */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-bold">Complaints Queue (Secretary Approved)</h2>
                {managerComplaints.length === 0 ? (
                  <Card className="glass-card p-8 text-center text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3 opacity-60" />
                    All operational complaints cleared. No active assignments!
                  </Card>
                ) : (
                  managerComplaints.map((c) => (
                    <Card key={c.id} className="glass-card hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] font-bold">
                                {c.id}
                              </Badge>
                              <Badge className={
                                c.priority === "emergency" || c.priority === "critical"
                                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                                  : c.priority === "high"
                                    ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                    : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              }>
                                {c.priority}
                              </Badge>
                              {c.department && <Badge variant="secondary">{c.department}</Badge>}
                            </div>
                            <h3 className="text-lg font-bold mt-2">{c.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/40 text-xs">
                          <div>
                            <span className="text-muted-foreground block">Raised By</span>
                            <span className="font-semibold">{c.raisedByName} ({c.unit}, {c.building})</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Current Status</span>
                            <span className="font-semibold text-primary">{c.status}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Technician Assigned</span>
                            <span className="font-semibold">{c.assignedTo || "None (Offline Coordination)"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">ETA</span>
                            <span className="font-semibold text-amber-600">{c.expectedArrival || "Not Scheduled"}</span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border/40">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedComplaint(c);
                              setCoordWorker(c.assignedTo || "");
                              setExpectedArrival(c.expectedArrival || "");
                              setOperationalNotes(c.operationalNotes || "");
                              setManagerStatus(c.status);
                            }}
                          >
                            ⚙️ Update Coordination Status
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Coordination Edit Dialog */}
              <Dialog open={selectedComplaint !== null} onOpenChange={() => setSelectedComplaint(null)}>
                <DialogContent className="glass-card">
                  <DialogHeader>
                    <DialogTitle>Update Complaint Coordination</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdateComplaint} className="space-y-4 mt-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Assigned External Worker</label>
                      <select
                        className="w-full mt-1 p-2 rounded-lg border border-border bg-card text-foreground"
                        value={coordWorker}
                        onChange={(e) => setCoordWorker(e.target.value)}
                      >
                        <option value="">-- Choose verified worker --</option>
                        {workers.map((w) => (
                          <option key={w.id} value={`${w.name} (${w.workerCategory})`}>
                            {w.name} - {w.workerCategory} (Exp: {w.experience})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Expected Arrival</label>
                        <Input
                          placeholder="e.g. 2:30 PM today"
                          value={expectedArrival}
                          onChange={(e) => setExpectedArrival(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Progress Status</label>
                        <select
                          className="w-full mt-1 p-2 rounded-lg border border-border bg-card text-foreground"
                          value={managerStatus}
                          onChange={(e) => setManagerStatus(e.target.value)}
                        >
                          <option value="Worker Being Coordinated">Worker Being Coordinated</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Work In Progress">Work In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Manager Operational Notes</label>
                      <textarea
                        className="w-full mt-1 p-2.5 rounded-lg border border-border bg-card text-foreground text-sm"
                        rows={3}
                        placeholder="Offline contact details, parts bought, check-out confirmation..."
                        value={operationalNotes}
                        onChange={(e) => setOperationalNotes(e.target.value)}
                      />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setSelectedComplaint(null)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Service Bookings (Secretary Approved)</h2>
              {managerBookings.length === 0 ? (
                <Card className="glass-card p-8 text-center text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3 opacity-60" />
                  No pending service coordination requests. All bookings scheduled!
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {managerBookings.map((b) => (
                    <Card key={b.id} className="glass-card">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className="bg-primary/10 text-primary">{b.category}</Badge>
                            <h3 className="text-lg font-bold mt-2">Request ID: {b.id}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Resident Address: {b.address}
                            </p>
                          </div>
                          <Badge className="bg-amber-500/10 text-amber-500">{b.status}</Badge>
                        </div>

                        <p className="text-sm bg-secondary/50 p-2.5 rounded-lg mt-3 text-muted-foreground">
                          <strong>Resident Notes:</strong> {b.notes || "No notes provided"}
                        </p>

                        {b.adminNotes && (
                          <p className="text-sm bg-indigo-500/5 border border-indigo-500/10 p-2.5 rounded-lg mt-2 text-indigo-600 dark:text-indigo-400">
                            <strong>Secretary Admin Verification:</strong> {b.adminNotes}
                          </p>
                        )}

                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                          {b.status === "Forwarded to Manager" ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(b);
                                setOperationalNotes(b.operationalNotes || "");
                              }}
                            >
                              📅 Schedule Visit
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500/30 text-green-500 hover:bg-green-500/10"
                              onClick={() => handleCompleteBooking(b.id)}
                            >
                              ✓ Mark Completed
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Dialog open={selectedBooking !== null} onOpenChange={() => setSelectedBooking(null)}>
                <DialogContent className="glass-card">
                  <DialogHeader>
                    <DialogTitle>Schedule Service Booking</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleScheduleBooking} className="space-y-4 mt-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Schedule Coordination Notes</label>
                      <textarea
                        className="w-full mt-1 p-2.5 rounded-lg border border-border bg-card text-foreground text-sm"
                        rows={3}
                        placeholder="Contacted worker, scheduled arrival date and time..."
                        value={operationalNotes}
                        onChange={(e) => setOperationalNotes(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setSelectedBooking(null)}>
                        Cancel
                      </Button>
                      <Button type="submit">Schedule Booking</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === "workers" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Society Verified Worker Directory</h2>
                <Button onClick={() => {
                  setEditingWorker(null);
                  setWorkerForm({
                    name: "",
                    email: "",
                    phone: "",
                    workerCategory: "Electrician",
                    experience: "3 years",
                    visitCharge: "150",
                    workingHoursStart: "09:00",
                    workingHoursEnd: "18:00",
                    isVerified: true,
                    isSocietyVerified: true,
                    isPoliceVerified: true
                  });
                  setShowWorkerModal(true);
                }} className="flex items-center gap-1">
                  <UserPlus className="w-4 h-4" /> Add Static Worker
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {workers.map((w) => (
                  <Card key={w.id} className="glass-card">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold">{w.name}</h3>
                          <Badge variant="secondary" className="mt-1">
                            {w.workerCategory}
                          </Badge>
                        </div>
                        <Badge className={
                          w.availability === "Available"
                            ? "bg-green-500/10 text-green-500"
                            : w.availability === "Busy"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-red-500/10 text-red-500"
                        }>
                          {w.availability}
                        </Badge>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> {w.phone}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" /> Visit Charge: ₹{w.workerProfile?.visitCharge || 100}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Hours: {w.workerProfile?.workingHoursStart || "09:00"} - {w.workerProfile?.workingHoursEnd || "18:00"}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                        {w.workerProfile?.isSocietyVerified && (
                          <Badge className="bg-emerald-500/10 text-emerald-500 text-[9px] border-emerald-500/20">
                            Society Verified
                          </Badge>
                        )}
                        {w.workerProfile?.isPoliceVerified && (
                          <Badge className="bg-blue-500/10 text-blue-500 text-[9px] border-blue-500/20">
                            Police Verified
                          </Badge>
                        )}
                      </div>

                      <div className="flex justify-end gap-1.5 mt-4 pt-3 border-t border-border">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            setEditingWorker(w);
                            setWorkerForm({
                              name: w.name,
                              email: w.email,
                              phone: w.phone,
                              workerCategory: w.workerCategory || "Electrician",
                              experience: w.experience || "3 years",
                              visitCharge: String(w.workerProfile?.visitCharge || 150),
                              workingHoursStart: w.workerProfile?.workingHoursStart || "09:00",
                              workingHoursEnd: w.workerProfile?.workingHoursEnd || "18:00",
                              isVerified: w.workerProfile?.isVerified ?? true,
                              isSocietyVerified: w.workerProfile?.isSocietyVerified || false,
                              isPoliceVerified: w.workerProfile?.isPoliceVerified || false
                            });
                            setShowWorkerModal(true);
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteWorker(w.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add/Edit Worker Dialog */}
              <Dialog open={showWorkerModal} onOpenChange={() => setShowWorkerModal(false)}>
                <DialogContent className="glass-card max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingWorker ? "Edit Worker Profile" : "Add Worker to Directory"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveWorker} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                        <Input
                          required
                          value={workerForm.name}
                          onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                        <Input
                          required
                          value={workerForm.phone}
                          onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Email</label>
                        <Input
                          required
                          type="email"
                          value={workerForm.email}
                          onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Skill Category</label>
                        <select
                          className="w-full p-2.5 rounded-lg border border-border bg-card text-foreground text-sm"
                          value={workerForm.workerCategory}
                          onChange={(e) => setWorkerForm({ ...workerForm, workerCategory: e.target.value })}
                        >
                          <option value="Electrician">Electrician</option>
                          <option value="Plumber">Plumber</option>
                          <option value="Carpenter">Carpenter</option>
                          <option value="Maid">Maid</option>
                          <option value="Cook">Cook</option>
                          <option value="Cleaner">Cleaner</option>
                          <option value="Gardener">Gardener</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Experience</label>
                        <Input
                          value={workerForm.experience}
                          onChange={(e) => setWorkerForm({ ...workerForm, experience: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Visit Charge (₹)</label>
                        <Input
                          type="number"
                          value={workerForm.visitCharge}
                          onChange={(e) => setWorkerForm({ ...workerForm, visitCharge: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 py-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="societyVerified"
                          checked={workerForm.isSocietyVerified}
                          onChange={(e) => setWorkerForm({ ...workerForm, isSocietyVerified: e.target.checked })}
                        />
                        <label htmlFor="societyVerified" className="text-sm font-semibold">Society Verified</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="policeVerified"
                          checked={workerForm.isPoliceVerified}
                          onChange={(e) => setWorkerForm({ ...workerForm, isPoliceVerified: e.target.checked })}
                        />
                        <label htmlFor="policeVerified" className="text-sm font-semibold">Police Verified</label>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowWorkerModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Worker</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === "chats" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[500px]">
              {/* Users List */}
              <div className="md:col-span-1 border-r border-border/60 pr-4 space-y-2">
                <h3 className="font-bold text-sm text-muted-foreground mb-3 uppercase tracking-wider">
                  Select Chat Thread
                </h3>
                {chatUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedChatUser(u)}
                    className={`w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 ${
                      selectedChatUser?.id === u.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-secondary/40 border border-transparent"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 font-bold">
                      {u.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{u.role}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Chat Area */}
              <div className="md:col-span-3 flex flex-col justify-between h-[500px]">
                {selectedChatUser ? (
                  <>
                    {/* Header */}
                    <div className="p-3 border-b border-border flex items-center gap-3 bg-secondary/20 rounded-t-xl">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {selectedChatUser.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{selectedChatUser.name}</h4>
                        <span className="text-xs text-muted-foreground capitalize">
                          {selectedChatUser.role} Portal
                        </span>
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm my-auto pt-24">
                          No messages yet. Send a message to start coordinating!
                        </div>
                      ) : (
                        chatMessages.map((msg: any) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderId === manager.id ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                              msg.senderId === manager.id
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-secondary text-foreground rounded-tl-none"
                            }`}>
                              <p>{msg.message}</p>
                              <span className="text-[9px] text-white/50 block text-right mt-1.5">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex gap-2">
                      <Input
                        placeholder="Write a message..."
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="icon">
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-center p-8">
                    <MessageSquare className="w-12 h-12 mb-3 text-muted-foreground/50" />
                    Select a resident or secretary from the list to start coordinating issues offline.
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
