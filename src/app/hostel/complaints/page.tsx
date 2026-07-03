"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquareWarning, Plus, Search, Clock, CheckCircle2, AlertTriangle, Zap, Bot, Star, Users, Trash
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import type { ComplaintStatus, ComplaintPriority } from "@/types";

const statusColors: Record<string, string> = {
  submitted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  assigned: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "in-progress": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  resolved: "bg-green-500/10 text-green-600 border-green-500/20",
  closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function HostelComplaintsPage() {
  const { user, initialize } = useAuth();
  const { complaints, addComplaint, updateComplaintStatus, assignComplaintWorker, rateComplaint, initializeDb } = useCommunityStore();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electrical");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter & UI State
  const [search, setSearch] = useState("");
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
  
  // Warden Assign State
  const [workerName, setWorkerName] = useState("Electrical Maintenance Team");
  const [eta, setEta] = useState("3:00 PM");
  const [wardenRemark, setWardenRemark] = useState("");

  // Student Rate State
  const [userRating, setUserRating] = useState(5);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWarden = user?.role === "warden";

  // Filter complaints list
  const filteredComplaints = complaints.filter((c) => {
    if (c.portal !== "hostel") return false;
    
    // Auth filter
    if (!isWarden) {
      if (c.raisedBy !== user?.id && c.unit !== user?.unit) return false;
    }

    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const selected = selectedCompId ? complaints.find(c => c.id === selectedCompId) : null;

  const handleRaise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // Auto-priority
    let priority: ComplaintPriority = "medium";
    const combined = (title + " " + description).toLowerCase();
    if (combined.includes("water") || combined.includes("short") || combined.includes("sparks") || combined.includes("fire")) {
      priority = "critical";
    } else if (combined.includes("fan") || combined.includes("heater") || combined.includes("broken")) {
      priority = "high";
    }

    addComplaint({
      title,
      description,
      category: category.toLowerCase() as any,
      status: "submitted",
      priority,
      raisedBy: user?.id || "user-student-1",
      raisedByName: user?.name || "Aarav Mehta",
      unit: user?.unit || "204",
      building: user?.building || "Block B",
      priorityScore: priority === "critical" ? 95 : priority === "high" ? 70 : 40,
      portal: "hostel"
    });

    setTitle("");
    setDescription("");
    setDialogOpen(false);
  };

  const handleWardenAssign = () => {
    if (!selected) return;
    assignComplaintWorker(selected.id, workerName, "worker-gen-id", eta);
    setWardenRemark("");
  };

  const handleWardenReject = () => {
    if (!selected) return;
    updateComplaintStatus(selected.id, "closed", { by: user?.name, note: wardenRemark || "Rejected by Warden" });
    setWardenRemark("");
  };

  const handleWardenResolve = () => {
    if (!selected) return;
    updateComplaintStatus(selected.id, "resolved", { by: user?.name, note: wardenRemark || "Marked as resolved by Warden" });
    setWardenRemark("");
  };

  const handleStudentRate = () => {
    if (!selected) return;
    rateComplaint(selected.id, userRating);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">Hostel Complaints</h1>
          <p className="text-muted-foreground mt-1">
            {isWarden ? "Oversight Command Panel: Assign and audit active complaint tickets" : "Raise maintenance requests and track resolution timelines"}
          </p>
        </div>

        {!isWarden && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4 mr-2" /> New Complaint
                </Button>
              }
            />
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle className="font-[family-name:var(--font-heading)]">Raise New Complaint</DialogTitle></DialogHeader>
              <form onSubmit={handleRaise} className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Water">Water / Bathroom</option>
                    <option value="Furniture">Furniture</option>
                    <option value="WiFi">WiFi / Internet</option>
                    <option value="Mess">Mess / Canteen</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Title</label>
                  <Input placeholder="e.g. WiFi connection drops continuously" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl h-11" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Details</label>
                  <Textarea placeholder="Describe the issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl min-h-[100px]" required />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <Bot className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">AI will auto-assign priority based on severity and electrical safety impact.</p>
                </div>
                <Button type="submit" className="w-full rounded-xl gradient-primary text-white border-0 h-11">Submit Complaint</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by description or title..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl h-11" />
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

      {/* Complaints List + Detail */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredComplaints.map((c) => (
            <Card
              key={c.id}
              onClick={() => setSelectedCompId(c.id)}
              className={`border-border/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${
                selectedCompId === c.id ? "ring-2 ring-primary/30 shadow-md" : ""
              } ${c.priority === "critical" ? "border-l-2 border-l-red-500 bg-red-500/[0.01]" : ""}`}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-mono">{c.id}</span>
                    <Badge variant="outline" className={statusColors[c.status]}>{c.status}</Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">{c.category}</Badge>
                    <Badge variant="outline" className="text-[10px] bg-secondary text-foreground capitalize">{c.priority}</Badge>
                  </div>
                  <h3 className="text-sm font-bold text-foreground truncate">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span>Student: {c.raisedByName} (Room {c.unit})</span>
                    <span>·</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredComplaints.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm border rounded-2xl">No active complaints found.</div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-5">
          {selected ? (
            <Card className="border-border/50 sticky top-6">
              <CardHeader className="pb-3 border-b border-border/20">
                <div className="flex items-center justify-between">
                  <Badge className={statusColors[selected.status]} variant="outline">{selected.status}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">{selected.id}</span>
                </div>
                <CardTitle className="text-lg font-bold mt-2">{selected.title}</CardTitle>
                <CardDescription>Raised by: {selected.raisedByName} • Room {selected.unit} ({selected.building})</CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-muted-foreground block">Issue Description:</span>
                  <p className="text-sm text-foreground leading-normal bg-secondary/20 p-3 rounded-xl border border-border/40">&quot;{selected.description}&quot;</p>
                </div>

                {/* AI diagnosis block */}
                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs space-y-1.5">
                  <div className="flex items-center gap-1 font-bold text-emerald-600">
                    <Bot className="w-4 h-4" /> AI Operations Copilot
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <div>Priority Score: <span className="font-semibold text-foreground">{selected.priorityScore || 50}/100</span></div>
                    <div>Est. Duration: <span className="font-semibold text-foreground">{selected.estimatedResolution || "TBD"}</span></div>
                  </div>
                  {selected.assignedTo && (
                    <div className="text-[11px] text-muted-foreground border-t border-border/20 pt-1.5 mt-1.5">
                      Assigned team/person: <span className="font-semibold text-foreground">{selected.assignedTo}</span>
                    </div>
                  )}
                </div>

                {/* Active Action Forms */}
                {isWarden && selected.status === "submitted" && (
                  <div className="p-4 rounded-xl border border-border/70 space-y-3">
                    <span className="text-xs font-bold text-foreground block">Assign Staff / Update ETA</span>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-0.5">Assigned Staff Unit</label>
                        <Input value={workerName} onChange={(e) => setWorkerName(e.target.value)} className="h-9 text-xs rounded-lg" />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-0.5">Est. Resolution Time</label>
                        <Input value={eta} onChange={(e) => setEta(e.target.value)} className="h-9 text-xs rounded-lg" />
                      </div>
                      <Button onClick={handleWardenAssign} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 border-0">
                        Dispatch & Notify Student
                      </Button>
                    </div>
                  </div>
                )}

                {isWarden && selected.status !== "resolved" && selected.status !== "closed" && (
                  <div className="space-y-2 pt-2 border-t border-border/20">
                    <label className="text-xs font-bold text-muted-foreground block">Warden Action Notes</label>
                    <Textarea placeholder="Add remarks or resolution comments..." value={wardenRemark} onChange={(e) => setWardenRemark(e.target.value)} className="rounded-xl h-16 text-xs" />
                    <div className="flex gap-2">
                      <Button onClick={handleWardenResolve} size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0 rounded-lg h-9">
                        Resolve Task
                      </Button>
                      <Button onClick={handleWardenReject} size="sm" variant="outline" className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-lg h-9">
                        Reject / Close
                      </Button>
                    </div>
                  </div>
                )}

                {/* Student Rating Module */}
                {selected.status === "resolved" && !selected.rating && !isWarden && (
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                    <span className="text-xs font-bold text-foreground block">Rate resolving work quality:</span>
                    <div className="flex gap-1 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setUserRating(star)}>
                          <Star className={`w-5.5 h-5.5 ${star <= userRating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                        </button>
                      ))}
                    </div>
                    <Button onClick={handleStudentRate} size="sm" className="bg-primary text-white border-0 rounded-lg h-9">
                      Submit Rating
                    </Button>
                  </div>
                )}

                {selected.rating && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                    <span className="text-xs text-muted-foreground">Rating:</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (selected.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-2 pt-2 border-t border-border/20">
                  <span className="text-xs font-bold text-muted-foreground block">Timeline Log</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selected.timeline?.map((log, lIdx) => (
                      <div key={lIdx} className="text-[11px] p-2 rounded-lg bg-secondary/35 flex items-center justify-between">
                        <span className="font-semibold text-foreground capitalize">{log.status}</span>
                        <span className="text-muted-foreground truncate max-w-[150px]">{log.note}</span>
                        <span className="text-muted-foreground text-[10px]">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 p-6 text-center text-muted-foreground">
              <MessageSquareWarning className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm">Select a ticket to review logs and action buttons.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
