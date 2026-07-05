"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Search, Zap, Clock, CheckCircle2, AlertTriangle, Star, Bot, Building2, Users,
  ShieldAlert, Check, Play, MessageSquare, Wrench, BarChart3, MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { COMPLAINT_CATEGORIES, PRIORITY_CONFIG } from "@/lib/constants";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useAuth } from "@/lib/store/useAuth";
import type { ComplaintStatus, ComplaintPriority, Complaint } from "@/types";

const statusIcons: Record<ComplaintStatus, React.ComponentType<{ className?: string }>> = {
  submitted: Clock,
  assigned: AlertTriangle,
  "in-progress": Zap,
  resolved: CheckCircle2,
  closed: CheckCircle2,
};

const statusColors: Record<ComplaintStatus, string> = {
  submitted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  assigned: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "in-progress": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  resolved: "bg-green-500/10 text-green-600 border-green-500/20",
  closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function ComplaintsPage() {
  const { user, initialize } = useAuth();
  const {
    complaints,
    addComplaint,
    rateComplaint,
    assignComplaintWorker,
    updateComplaintStatus,
    users,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      complaints: state.complaints || [],
      addComplaint: state.addComplaint,
      rateComplaint: state.rateComplaint,
      assignComplaintWorker: state.assignComplaintWorker,
      updateComplaintStatus: state.updateComplaintStatus,
      users: state.users || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);

  // Form State for creating complaints
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("plumbing");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter & Selected State
  const [search, setSearch] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");

  // Worker Action State
  const [completionComment, setCompletionComment] = useState("");
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Secretary Assignment State
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [eta, setEta] = useState("30 mins");

  // Chat/Remarks mock state
  const [chatMessage, setChatMessage] = useState("");
  const [ratingVal, setRatingVal] = useState(5);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Derive roles
  const isWorker = user?.role === "worker";
  const isSecretary = user?.role === "secretary";
  const isSecurity = user?.role === "security";
  const isResident = user?.role === "resident";

  // List of active workers for Secretary to assign
  const availableWorkers = useMemo(() => {
    return users.filter(u => u.role === "worker");
  }, [users]);

  // Filter complaints based on roles and categories
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      if (c.portal !== "society") return false;

      // 1. Role boundaries
      if (isResident) {
        // Resident sees only own flat
        if (c.raisedBy !== user?.id && c.unit !== user?.unit) return false;
      } else if (isWorker) {
        // Worker sees only jobs of their category or assigned directly to their name
        const catMatch = c.category?.toLowerCase() === user?.workerCategory?.toLowerCase();
        const assignedMatch = c.assignedToId === user?.id;
        if (!catMatch && !assignedMatch) return false;
      } else if (isSecurity) {
        // Security sees only safety/gate/parking/incident complaints
        const securityCats = ["security", "parking", "others", "lift"];
        if (!securityCats.includes(c.category?.toLowerCase() || "")) return false;
      }
      // Secretary sees everything

      // 2. Text Search
      const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.unit?.includes(search);

      // 3. Status filter
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, isResident, isWorker, isSecurity, user, search, statusFilter]);

  // Set default selection
  useEffect(() => {
    if (filteredComplaints.length > 0 && !selectedComplaint) {
      setSelectedComplaint(filteredComplaints[0].id);
    }
  }, [filteredComplaints, selectedComplaint]);

  const selected = useMemo(() => {
    return complaints.find(c => c.id === selectedComplaint) || null;
  }, [complaints, selectedComplaint]);

  if (!mounted) return null;

  // Stats computation
  const stats = {
    total: filteredComplaints.length,
    open: filteredComplaints.filter(c => !["resolved", "closed"].includes(c.status)).length,
    resolved: filteredComplaints.filter(c => c.status === "resolved").length,
    critical: filteredComplaints.filter(c => c.priority === "critical").length,
  };

  // --- FORM HANDLERS ---
  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // AI Auto priority check
    let priority: ComplaintPriority = "medium";
    const combined = (title + " " + description).toLowerCase();
    if (combined.includes("leak") || combined.includes("spark") || combined.includes("short") || combined.includes("fire") || combined.includes("trapped") || combined.includes("unauthorized") || combined.includes("theft")) {
      priority = "critical";
    } else if (combined.includes("broken") || combined.includes("not working") || combined.includes("stolen")) {
      priority = "high";
    }

    addComplaint({
      title,
      description,
      category: (isSecurity ? "security" : category) as any,
      status: "submitted",
      priority,
      raisedBy: user?.id || "resident-user",
      raisedByName: user?.name || "Nidhi Kumar",
      unit: user?.unit || "A-301",
      building: user?.building || "Tower A",
      priorityScore: priority === "critical" ? 95 : priority === "high" ? 75 : 45,
      portal: "society",
    });

    setTitle("");
    setDescription("");
    setDialogOpen(false);
    alert("Ticket raised successfully! Dispatching notification.");
  };

  const handleAssignWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !selectedWorkerId) return;

    const worker = availableWorkers.find(w => w.id === selectedWorkerId);
    if (!worker) return;

    assignComplaintWorker(selected.id, worker.name, worker.id, eta);
    updateComplaintStatus(selected.id, "assigned", {
      by: user?.name || "Secretary",
      note: `Assigned task to ${worker.name}. Estimated arrival: ${eta}`
    });
    alert(`Assigned ${worker.name} successfully.`);
  };

  const handleStartJob = () => {
    if (!selected) return;
    updateComplaintStatus(selected.id, "in-progress", {
      by: user?.name || "Worker",
      note: "Worker has started the task on-site."
    });
  };

  const handleCompleteJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    updateComplaintStatus(selected.id, "resolved", {
      by: user?.name || "Worker",
      note: completionComment || "Job completed successfully.",
      afterPhoto: "/images/after-upload-placeholder.jpg"
    });
    setShowCompleteDialog(false);
    setCompletionComment("");
    alert("Job marked as resolved.");
  };

  const handleRateResolution = (compId: string) => {
    rateComplaint(compId, ratingVal);
    updateComplaintStatus(compId, "closed", {
      by: user?.name || "Resident",
      note: `Resident closed the ticket and rated it ${ratingVal} stars.`
    });
    alert("Thank you for your rating!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">
            {isSecretary ? "Society Tickets Ledger 📋" : isWorker ? "My Job Assignments 🛠️" : isSecurity ? "Incident Control Room 🚨" : "Complaints Desk 🏠"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSecretary ? "Oversight of all maintenance requests, worker delegations, and resolution speeds" :
             isWorker ? `Assigned service tasks for: ${user?.workerCategory}` :
             isSecurity ? "Log unauthorized gate violations, suspect activities, or parking disputes" :
             "Raise and track maintenance tasks for your unit"}
          </p>
        </div>

        {/* Raise dialog for Resident/Security */}
        {(isResident || isSecurity) && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4 mr-2" /> {isSecurity ? "Log Safety Incident" : "New Ticket Request"}
                </Button>
              }
            />
            <DialogContent className="sm:max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)]">
                  {isSecurity ? "Log Gated Security Incident" : "File Service Request"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitComplaint} className="space-y-4 mt-4">
                {!isSecurity && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-input bg-card text-xs"
                    >
                      {COMPLAINT_CATEGORIES.slice(0, 8).map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Title</label>
                  <Input
                    placeholder={isSecurity ? "e.g. Tower C double parking block" : "Brief description of the issue"}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-xl h-11 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Details & Description</label>
                  <Textarea
                    placeholder={isSecurity ? "Provide log of event, suspect details, or vehicle registration..." : "Provide specific details about the issue..."}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded-xl min-h-[100px] text-sm"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <Bot className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[10px] text-muted-foreground">
                    HomeVerse AI automatically computes ticket risk parameters, alerts on-duty techs, and prioritizes urgent safety violations.
                  </p>
                </div>
                <Button type="submit" className="w-full rounded-xl gradient-primary text-white border-0 h-11 font-semibold text-xs">
                  Submit Log
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Scope Tickets", value: stats.total, color: "#8b5cf6" },
          { label: "Pending Resolution", value: stats.open, color: "#f59e0b" },
          { label: "Succeeded/Closed", value: stats.resolved, color: "#22c55e" },
          { label: "Critical Priority", value: stats.critical, color: "#ef4444" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1 font-[family-name:var(--font-heading)]" style={{ color: s.color }}>
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets, towers, flats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl h-11 text-xs"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "submitted", "assigned", "in-progress", "resolved", "closed"] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              className={`rounded-lg text-xs capitalize ${statusFilter === s ? "gradient-primary text-white border-0" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s}
            </Button>
          ))}
        </div>
      </div>

      {/* Complaints Ledger Split */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Side: Tickets List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredComplaints.map((c) => {
            const priorityConfig = PRIORITY_CONFIG[c.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
            return (
              <Card
                key={c.id}
                className={`border-border/50 cursor-pointer transition-all duration-300 hover:shadow-md ${
                  selectedComplaint === c.id ? "ring-2 ring-primary/30 shadow-md" : ""
                } ${c.priority === "critical" ? "border-red-500/30 bg-red-500/[0.005]" : ""}`}
                onClick={() => setSelectedComplaint(c.id)}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-muted-foreground text-[10px]">{c.id}</span>
                      <Badge className={statusColors[c.status]} variant="outline">
                        {c.status}
                      </Badge>
                      <Badge
                        className="text-[9px]"
                        style={{
                          backgroundColor: `${priorityConfig.color}15`,
                          color: priorityConfig.color,
                          borderColor: `${priorityConfig.color}30`,
                        }}
                        variant="outline"
                      >
                        {priorityConfig.label}
                      </Badge>
                      <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground font-semibold capitalize">{c.category}</span>
                    </div>
                    <h3 className="text-sm font-semibold truncate text-foreground">{c.title}</h3>
                    <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground flex-wrap">
                      <span>Raised by: {c.raisedByName}</span>
                      <span>·</span>
                      <span>Flat {c.unit} ({c.building})</span>
                      <span>·</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {c.priorityScore && (
                    <div className="text-center shrink-0 border-l border-border/50 pl-4">
                      <p className="text-[9px] text-muted-foreground leading-none">Risk Score</p>
                      <p className="text-base font-extrabold mt-1 font-[family-name:var(--font-heading)]" style={{ color: priorityConfig.color }}>
                        {c.priorityScore}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {filteredComplaints.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-sm border border-dashed rounded-2xl bg-secondary/5">
              No tickets found matching current scope.
            </div>
          )}
        </div>

        {/* Right Side: Details & Actions */}
        <div className="lg:col-span-5">
          {selected ? (
            <Card className="border-border/50 sticky top-6">
              <CardHeader className="pb-3 border-b border-border/20">
                <div className="flex justify-between items-center text-xs">
                  <Badge className={statusColors[selected.status]} variant="outline">
                    {selected.status}
                  </Badge>
                  <span className="font-mono text-muted-foreground">{selected.id}</span>
                </div>
                <CardTitle className="text-base font-bold font-[family-name:var(--font-heading)] mt-2">
                  {selected.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  Raised by {selected.raisedByName} (Flat {selected.unit}, {selected.building})
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5 text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground block">Resident Statement:</span>
                  <p className="text-foreground leading-relaxed bg-secondary/10 p-3.5 rounded-xl border border-border/30">
                    {selected.description}
                  </p>
                </div>

                {/* AI Analysis Diagnostic */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                  <span className="font-bold text-primary flex items-center gap-1">
                    <Bot className="w-4 h-4 animate-pulse" /> Diagnostic Insights
                  </span>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-[10px] text-muted-foreground">Priority Rating</span>
                      <p className="font-bold capitalize">{selected.priority} ({selected.priorityScore}/100)</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Est. Resolution Time</span>
                      <p className="font-bold">{selected.estimatedResolution || "Under Review"}</p>
                    </div>
                  </div>
                  {selected.assignedTo && (
                    <div className="pt-2 border-t border-primary/10 mt-1 flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] text-muted-foreground">Assigned Tech:</span>
                      <span className="font-bold text-foreground">{selected.assignedTo}</span>
                    </div>
                  )}
                </div>

                {/* --- SECRETARY WIDGET: ASSIGN WORKER --- */}
                {isSecretary && selected.status === "submitted" && (
                  <form onSubmit={handleAssignWorker} className="p-4 rounded-xl border border-dashed border-border/50 bg-secondary/20 space-y-3">
                    <span className="font-bold text-foreground block">Assign Maintenance Contractor</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-muted-foreground block mb-1">Contractor Team</label>
                        <select
                          value={selectedWorkerId}
                          onChange={(e) => setSelectedWorkerId(e.target.value)}
                          className="w-full h-9 px-2 rounded-lg border border-input bg-card text-xs"
                          required
                        >
                          <option value="">Select Worker</option>
                          {availableWorkers.map(w => (
                            <option key={w.id} value={w.id}>{w.name} ({w.workerCategory})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] text-muted-foreground block mb-1">Required ETA</label>
                        <Input value={eta} onChange={(e) => setEta(e.target.value)} className="h-9 text-xs rounded-lg" required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full rounded-lg gradient-primary text-white border-0 h-9 font-semibold text-xs">
                      Delegate Job Ticket
                    </Button>
                  </form>
                )}

                {/* --- SECRETARY WIDGET: ESCALATION & RESOLUTION FOR NON-RESOLVED --- */}
                {isSecretary && selected.status !== "submitted" && !["resolved", "closed"].includes(selected.status) && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        updateComplaintStatus(selected.id, "resolved", { by: user?.name || "Secretary", note: "Resolved by Admin via direct escalation override." });
                        alert("Ticket marked as resolved.");
                      }}
                      className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 text-white border-0 h-9 font-semibold"
                    >
                      Override Resolve
                    </Button>
                    <Button
                      onClick={() => {
                        updateComplaintStatus(selected.id, "assigned", { by: user?.name || "Secretary", note: "Ticket escalated. Re-queued for dispatcher priorities." });
                        alert("Ticket escalated.");
                      }}
                      variant="outline"
                      className="flex-1 rounded-lg border-red-500/20 text-red-500 hover:bg-red-500/5 h-9"
                    >
                      Escalate Urgency
                    </Button>
                  </div>
                )}

                {/* --- WORKER WIDGET: WORK ACTIONS --- */}
                {isWorker && selected.status === "assigned" && (
                  <Button
                    onClick={handleStartJob}
                    className="w-full rounded-xl gradient-primary text-white border-0 h-11 font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-4 h-4" /> Start Operations & Notify Resident
                  </Button>
                )}

                {isWorker && selected.status === "in-progress" && (
                  <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                    <DialogTrigger
                      render={
                        <Button className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white border-0 h-11 font-semibold">
                          Complete Maintenance Job
                        </Button>
                      }
                    />
                    <DialogContent className="sm:max-w-md rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="font-[family-name:var(--font-heading)]">Complete Job Logs</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCompleteJob} className="space-y-4 mt-2">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1">Completion Notes</label>
                          <Textarea
                            placeholder="Detail what was fixed, parts replaced..."
                            value={completionComment}
                            onChange={(e) => setCompletionComment(e.target.value)}
                            className="rounded-xl min-h-[80px] text-xs"
                            required
                          />
                        </div>
                        <div className="border border-dashed border-border/50 rounded-xl p-6 text-center bg-secondary/15 flex flex-col items-center justify-center gap-2">
                          <Plus className="w-6 h-6 text-muted-foreground/50" />
                          <span className="text-xs font-semibold">Upload Completion Photo Proof</span>
                          <span className="text-[10px] text-muted-foreground">Upload photo of repaired asset for verification</span>
                        </div>
                        <Button type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700 text-white border-0 rounded-xl font-semibold">
                          Log Completion & Close
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                {/* --- RESIDENT WIDGET: RATE & FEEDBACK --- */}
                {isResident && selected.status === "resolved" && (
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                    <span className="font-semibold block">Rate Resolution Service:</span>
                    <div className="flex gap-1.5 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRatingVal(star)}
                          className="focus:outline-none"
                        >
                          <Star className={`w-6 h-6 ${star <= ratingVal ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                        </button>
                      ))}
                    </div>
                    <Button onClick={() => handleRateResolution(selected.id)} size="sm" className="w-full gradient-primary text-white border-0 rounded-lg h-9 font-semibold mt-1">
                      Verify & Close Ticket
                    </Button>
                  </div>
                )}

                {/* Activity History Timeline */}
                <div className="space-y-3 pt-3 border-t border-border/50">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider block text-[10px]">Operations Log Timeline</span>
                  <div className="space-y-3 pl-2">
                    {selected.timeline?.map((entry, idx) => {
                      const TimeIcon = statusIcons[entry.status] || Clock;
                      return (
                        <div key={idx} className="flex gap-3">
                          <div className="flex flex-col items-center shrink-0">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-secondary text-muted-foreground border">
                              <TimeIcon className="w-3 h-3" />
                            </div>
                            {idx < (selected.timeline?.length || 0) - 1 && (
                              <div className="w-[1.5px] h-full bg-border/50 min-h-[22px] my-1" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold capitalize text-foreground">{entry.status.replace("-", " ")}</p>
                            <p className="text-muted-foreground text-[10px] mt-0.5">{entry.note}</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">
                              {new Date(entry.timestamp).toLocaleString()} {entry.by && `· By ${entry.by}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a ticket from the ledger to manage resolution pathways</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
