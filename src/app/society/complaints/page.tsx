"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Plus, Search, Zap, Clock, CheckCircle2, AlertTriangle, Star, Bot, Building2, Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const { complaints, addComplaint, rateComplaint, initializeDb } = useCommunityStore();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<any>("plumbing");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");

  // Rating State
  const [userRating, setUserRating] = useState(5);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  // Filter complaints based on roles (residents see their own flat, admin/workers see all relevant ones)
  const isWorker = user?.role === "worker";
  const userCategory = user?.workerCategory?.toLowerCase();

  const filteredComplaints = complaints.filter((c) => {
    if (c.portal !== "society") return false;
    
    // Authorization filter
    if (!isWorker) {
      // Resident: only see own flat
      if (c.raisedBy !== user?.id && c.unit !== user?.unit) return false;
    } else {
      // Worker: only see own category
      if (c.category?.toLowerCase() !== userCategory) return false;
    }

    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: filteredComplaints.length,
    open: filteredComplaints.filter((c) => !["resolved", "closed"].includes(c.status)).length,
    resolved: filteredComplaints.filter((c) => c.status === "resolved").length,
    critical: filteredComplaints.filter((c) => c.priority === "critical").length,
  };

  const selected = selectedComplaint
    ? complaints.find((c) => c.id === selectedComplaint)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // AI simple keyword categorizer for priority
    let priority: ComplaintPriority = "medium";
    const combined = (title + " " + description).toLowerCase();
    if (combined.includes("leak") || combined.includes("spark") || combined.includes("sparks") || combined.includes("short") || combined.includes("fire") || combined.includes("trapped")) {
      priority = "critical";
    } else if (combined.includes("not working") || combined.includes("loose") || combined.includes("broken")) {
      priority = "high";
    }

    addComplaint({
      title,
      description,
      category,
      status: "submitted",
      priority,
      raisedBy: user?.id || "user-resident-1",
      raisedByName: user?.name || "Nidhi Kumar",
      unit: user?.unit || "A-301",
      building: user?.building || "Tower A",
      priorityScore: priority === "critical" ? 95 : priority === "high" ? 75 : 45,
      portal: "society",
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setCategory("plumbing");
    setDialogOpen(false);
  };

  const handleRate = (compId: string) => {
    rateComplaint(compId, userRating);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">
            Complaints Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            {isWorker ? `Assigned jobs in category: ${user?.workerCategory}` : "Track and manage your apartment complaints"}
          </p>
        </div>
        
        {!isWorker && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4 mr-2" /> New Complaint
                </Button>
              }
            />
            <DialogContent className="sm:max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)]">
                  Raise New Complaint
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl border border-input bg-card text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {COMPLAINT_CATEGORIES.slice(0, 8).map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Title</label>
                  <Input
                    placeholder="Brief description of the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-xl h-11"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <Textarea
                    placeholder="Provide details about the complaint..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="rounded-xl min-h-[100px]"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <Bot className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    AI will automatically prioritize your ticket based on severity and electrical safety impact.
                  </p>
                </div>
                <Button type="submit" className="w-full rounded-xl gradient-primary text-white border-0 h-11">
                  Submit Complaint
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Complaints", value: stats.total, color: "#8b5cf6" },
          { label: "Open", value: stats.open, color: "#f59e0b" },
          { label: "Resolved", value: stats.resolved, color: "#22c55e" },
          { label: "Critical", value: stats.critical, color: "#ef4444" },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
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
            placeholder="Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl h-11"
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

      {/* Complaints List + Detail */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-3 space-y-3">
          {filteredComplaints.map((complaint) => {
            const priorityConfig = PRIORITY_CONFIG[complaint.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
            return (
              <Card
                key={complaint.id}
                className={`border-border/50 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                  selectedComplaint === complaint.id ? "ring-2 ring-primary/30 shadow-lg" : ""
                } ${complaint.priority === "critical" ? "border-red-500/30 bg-red-500/[0.01]" : ""}`}
                onClick={() => setSelectedComplaint(complaint.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-mono">
                          {complaint.id}
                        </span>
                        <Badge className={statusColors[complaint.status]} variant="outline">
                          {complaint.status}
                        </Badge>
                        <Badge
                          className="text-[10px]"
                          style={{
                            backgroundColor: `${priorityConfig.color}15`,
                            color: priorityConfig.color,
                            borderColor: `${priorityConfig.color}30`,
                          }}
                          variant="outline"
                        >
                          {priorityConfig.label}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-semibold truncate">{complaint.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {complaint.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{complaint.raisedByName}</span>
                        <span>·</span>
                        <span>Flat {complaint.unit}</span>
                        <span>·</span>
                        <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {complaint.priorityScore && (
                      <div className="text-center shrink-0">
                        <div className="text-[10px] text-muted-foreground mb-0.5">AI Score</div>
                        <div className="text-lg font-bold" style={{ color: priorityConfig.color }}>
                          {complaint.priorityScore}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredComplaints.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm border rounded-2xl">No complaints found.</div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card className="border-border/50 sticky top-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={statusColors[selected.status]} variant="outline">
                    {selected.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">{selected.id}</span>
                </div>
                <CardTitle className="text-lg font-[family-name:var(--font-heading)] mt-2">
                  {selected.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{selected.description}</p>

                {/* AI Insights */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Bot className="w-4 h-4 animate-pulse" /> AI Analysis
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Priority Score</span>
                      <p className="font-semibold">{selected.priorityScore || 50}/100</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Est. Resolution</span>
                      <p className="font-semibold">{selected.estimatedResolution || "TBD"}</p>
                    </div>
                  </div>
                  {selected.assignedTo && (
                    <div className="text-xs mt-1 border-t border-border/20 pt-2">
                      <span className="text-muted-foreground">Assigned To: </span>
                      <span className="font-semibold text-foreground">{selected.assignedTo}</span>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase">Activity Timeline</h4>
                  <div className="space-y-3">
                    {selected.timeline?.map((entry, i) => {
                      const TimeIcon = statusIcons[entry.status] || Clock;
                      return (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              i === selected.timeline.length - 1 ? "gradient-primary text-white" : "bg-secondary text-muted-foreground"
                            }`}>
                              <TimeIcon className="w-3.5 h-3.5" />
                            </div>
                            {i < selected.timeline.length - 1 && (
                              <div className="w-[2px] h-full bg-border min-h-[20px] my-1" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold capitalize">{entry.status.replace("-", " ")}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(entry.timestamp).toLocaleString()}
                              {entry.by && ` · ${entry.by}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rating (if resolved and not rated yet) */}
                {selected.status === "resolved" && !selected.rating && !isWorker && (
                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                    <span className="text-xs font-bold text-foreground block">Please rate the service resolution:</span>
                    <div className="flex gap-1.5 items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="focus:outline-none"
                        >
                          <Star className={`w-6 h-6 ${star <= userRating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                        </button>
                      ))}
                    </div>
                    <Button onClick={() => handleRate(selected.id)} size="sm" className="bg-primary text-white rounded-lg h-9 border-0">
                      Submit Rating
                    </Button>
                  </div>
                )}

                {/* Display Rating (if closed) */}
                {selected.rating && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                    <span className="text-xs text-muted-foreground">Rating:</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4.5 h-4.5 ${
                            i < (selected.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Select a complaint to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
