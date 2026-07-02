"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Plus, Search, Filter, Zap, Droplets, ArrowUpDown, Car, Shield,
  Waves, TreePine, Sparkles, Wifi, CircleDot, Clock, CheckCircle2,
  AlertTriangle, ChevronRight, Star, Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { COMPLAINT_CATEGORIES, PRIORITY_CONFIG } from "@/lib/constants";
import { mockComplaints } from "@/data/mock-complaints";
import type { ComplaintStatus, ComplaintPriority } from "@/types";

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
  const [search, setSearch] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");

  const filteredComplaints = mockComplaints.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockComplaints.length,
    open: mockComplaints.filter((c) => !["resolved", "closed"].includes(c.status)).length,
    resolved: mockComplaints.filter((c) => c.status === "resolved").length,
    critical: mockComplaints.filter((c) => c.priority === "critical").length,
  };

  const selected = selectedComplaint
    ? mockComplaints.find((c) => c.id === selectedComplaint)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">
            Complaints
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage community complaints
          </p>
        </div>
        <Dialog>
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
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {COMPLAINT_CATEGORIES.slice(0, 9).map((cat) => (
                    <button
                      key={cat.value}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-center"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}15` }}>
                        <span style={{ color: cat.color }} className="text-sm">
                          {cat.label[0]}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Title</label>
                <Input placeholder="Brief description of the issue" className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <Textarea placeholder="Provide details about the complaint..." className="rounded-xl min-h-[100px]" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Bot className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground">
                  AI will automatically assign priority based on severity, safety impact, and affected residents.
                </p>
              </div>
              <Button className="w-full rounded-xl gradient-primary text-white border-0 h-11">
                Submit Complaint
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "Total Complaints", value: stats.total, color: "#8b5cf6" },
          { label: "Open", value: stats.open, color: "#f59e0b" },
          { label: "Resolved", value: stats.resolved, color: "#22c55e" },
          { label: "Critical", value: stats.critical, color: "#ef4444" },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeInUp}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold mt-1 font-[family-name:var(--font-heading)]" style={{ color: s.color }}>
                  {s.value}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
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
            const StatusIcon = statusIcons[complaint.status];
            const priorityConfig = PRIORITY_CONFIG[complaint.priority];
            return (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className={`border-border/50 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                    selectedComplaint === complaint.id ? "ring-2 ring-primary/30 shadow-lg" : ""
                  } ${complaint.priority === "critical" ? "pulse-critical" : ""}`}
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
                          <span>{complaint.unit}</span>
                          <span>·</span>
                          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {complaint.priorityScore && (
                        <div className="text-center shrink-0">
                          <div className="text-xs text-muted-foreground mb-1">AI Score</div>
                          <div className="text-lg font-bold" style={{ color: priorityConfig.color }}>
                            {complaint.priorityScore}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
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
                <CardTitle className="text-lg font-[family-name:var(--font-heading)]">
                  {selected.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{selected.description}</p>

                {/* AI Insights */}
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <Bot className="w-4 h-4" /> AI Analysis
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Priority Score</span>
                      <p className="font-semibold">{selected.priorityScore}/100</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Est. Resolution</span>
                      <p className="font-semibold">{selected.estimatedResolution || "TBD"}</p>
                    </div>
                  </div>
                  {selected.assignedTo && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Assigned To: </span>
                      <span className="font-semibold">{selected.assignedTo}</span>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-semibold mb-3">Timeline</h4>
                  <div className="space-y-3">
                    {selected.timeline.map((entry, i) => {
                      const TimeIcon = statusIcons[entry.status];
                      return (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              i === selected.timeline.length - 1
                                ? "gradient-primary"
                                : "bg-secondary"
                            }`}>
                              <TimeIcon className={`w-3.5 h-3.5 ${i === selected.timeline.length - 1 ? "text-white" : "text-muted-foreground"}`} />
                            </div>
                            {i < selected.timeline.length - 1 && (
                              <div className="w-[2px] h-full bg-border min-h-[20px] my-1" />
                            )}
                          </div>
                          <div className="pb-3">
                            <p className="text-sm font-medium capitalize">{entry.status.replace("-", " ")}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {new Date(entry.timestamp).toLocaleString()}
                              {entry.by && ` · ${entry.by}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rating (if resolved) */}
                {selected.rating && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rating:</span>
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
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center">
                <MessageSquareWarning className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
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

function MessageSquareWarning(props: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M12 7v2"/><path d="M12 13h.01"/>
    </svg>
  );
}
