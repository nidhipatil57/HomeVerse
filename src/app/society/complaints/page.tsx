"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Search, Zap, Clock, CheckCircle2, AlertTriangle, Star, Bot, Building2, Users,
  ShieldAlert, Check, Play, MessageSquare, Wrench, BarChart3, MapPin, Pause, Shield,
  Volume2, Wifi, Bug, Home, Waves, AlertCircle, XCircle, ArrowUpDown, ChevronRight,
  Send, Merge, Paperclip, CheckSquare, Sparkles, TrendingUp, ThumbsUp, Calendar, Trash2,
  Lock, Eye, HelpCircle, Truck, Flag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES, PRIORITY_CONFIG } from "@/lib/constants";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useAuth } from "@/lib/store/useAuth";
import type { ComplaintStatus, ComplaintPriority, Complaint, ComplaintChatMessage } from "@/types";

// Recharts imports (we wrap them securely)
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Cell
} from "recharts";

const statusIcons: Record<ComplaintStatus, React.ComponentType<{ className?: string }>> = {
  submitted: Clock,
  "under-review": EyeIcon,
  assigned: UserBadgeIcon,
  accepted: CheckSquare,
  travelling: Truck,
  "reached-society": Home,
  "reached-building": Building2,
  "reached-flat": MapPin,
  "work-started": Zap,
  "in-progress": Zap,
  completed: Wrench,
  resolved: CheckCircle2,
  "resident-verification": ShieldAlert,
  closed: CheckCircle2,
};

function EyeIcon({ className }: { className?: string }) { return <Eye className={className} />; }
function UserBadgeIcon({ className }: { className?: string }) { return <Users className={className} />; }

const statusColors: Record<ComplaintStatus, string> = {
  submitted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "under-review": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  assigned: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  accepted: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  travelling: "bg-blue-400/10 text-blue-500 border-blue-400/20",
  "reached-society": "bg-teal-500/10 text-teal-600 border-teal-500/20",
  "reached-building": "bg-purple-400/10 text-purple-500 border-purple-400/20",
  "reached-flat": "bg-pink-500/10 text-pink-600 border-pink-500/20",
  "work-started": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "in-progress": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  completed: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  resolved: "bg-green-500/10 text-green-600 border-green-500/20",
  "resident-verification": "bg-pink-500/10 text-pink-600 border-pink-500/20",
  closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const categoryIconMap: Record<string, any> = {
  electrical: Zap,
  plumbing: Waves,
  lift: ArrowUpDown,
  "water-leakage": AlertTriangle,
  "water-supply": Waves,
  parking: CarIcon,
  cleaning: Sparkles,
  housekeeping: Sparkles,
  gardening: PlantIcon,
  security: Shield,
  noise: Volume2,
  internet: Wifi,
  "pest-control": Bug,
  "common-area": Building2,
  clubhouse: Home,
  "swimming-pool": Waves,
  others: InfoIcon,
};

function CarIcon(props: any) { return <span className={props.className}>🚗</span>; }
function PlantIcon(props: any) { return <span className={props.className}>🌱</span>; }
function InfoIcon(props: any) { return <span className={props.className}>ℹ️</span>; }

export default function ComplaintsPage() {
  const { user, initialize } = useAuth();
  const {
    complaints,
    addComplaint,
    updateComplaintStatus,
    assignComplaintWorker,
    rateComplaint,
    addComplaintChatMessage,
    mergeComplaints,
    subscribeToComplaint,
    updateComplaintEta,
    users,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      complaints: state.complaints || [],
      addComplaint: state.addComplaint,
      updateComplaintStatus: state.updateComplaintStatus,
      assignComplaintWorker: state.assignComplaintWorker,
      rateComplaint: state.rateComplaint,
      addComplaintChatMessage: state.addComplaintChatMessage,
      mergeComplaints: state.mergeComplaints,
      subscribeToComplaint: state.subscribeToComplaint,
      updateComplaintEta: state.updateComplaintEta,
      users: state.users || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"ledger" | "analytics">("ledger");

  // Form State for creating complaints
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("plumbing");
  const [priority, setPriority] = useState<ComplaintPriority>("medium");
  const [wing, setWing] = useState("");
  const [flat, setFlat] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Upload simulation states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);

  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  // Worker completion & action states
  const [completionComment, setCompletionComment] = useState("");
  const [completionPhoto, setCompletionPhoto] = useState("");
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [workerNotes, setWorkerNotes] = useState("");
  const [liveEtaInput, setLiveEtaInput] = useState("");

  // Secretary actions
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [eta, setEta] = useState("30 mins");
  const [secNotes, setSecNotes] = useState("");
  const [overridePriority, setOverridePriority] = useState<ComplaintPriority | "">("");

  // Chat/Remarks state
  const [chatMessage, setChatMessage] = useState("");
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewVal, setReviewVal] = useState("");
  
  // Security log state
  const [securityReport, setSecurityReport] = useState("");
  const [securityPhoto, setSecurityPhoto] = useState("");

  // Community board dialog
  const [boardOpen, setBoardOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Derive roles
  const isWorker = user?.role === "worker";
  const isSecretary = user?.role === "secretary" || user?.role === "admin";
  const isSecurity = user?.role === "security";
  const isResident = user?.role === "resident";

  // Active workers for assignment
  const availableWorkers = useMemo(() => {
    return users.filter(u => u.role === "worker");
  }, [users]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedComplaintId, complaints]);

  // Filter complaints based on roles (clutter-free, no top filters)
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Show only society portal complaints
      if (c.portal && c.portal !== "society") return false;

      // 1. Role boundaries
      if (isResident) {
        // Resident sees only own flat complaints OR complaints they subscribed to
        const isOwner = c.raisedBy === user?.id || c.unit === user?.unit;
        const isSubscribed = c.subscribers?.some(s => s.userId === user?.id);
        if (!isOwner && !isSubscribed) return false;
      } else if (isWorker) {
        // Worker sees only assigned jobs (matching their category or assignedToId)
        const catMatch = c.category?.toLowerCase() === user?.workerCategory?.toLowerCase();
        const assignedMatch = c.assignedToId === user?.id;
        if (!catMatch && !assignedMatch) return false;
      } else if (isSecurity) {
        // Security sees only security-related categories
        const securityCats = [
          "security", "parking", "others", "unauthorized-visitor", 
          "theft", "lost-item", "suspicious-activity", "gate-issue", 
          "vehicle-issue", "cctv", "security-staff-complaint"
        ];
        const isSecurityCat = securityCats.includes(c.category || "") || c.category === "security" || c.category === "parking";
        if (!isSecurityCat) return false;
      }
      // Secretary sees all complex complaints

      return true;
    });
  }, [complaints, isResident, isWorker, isSecurity, user]);

  // Set default selection
  useEffect(() => {
    if (filteredComplaints.length > 0 && !selectedComplaintId) {
      setSelectedComplaintId(filteredComplaints[0].id);
    }
  }, [filteredComplaints, selectedComplaintId]);

  const selected = useMemo(() => {
    return complaints.find(c => c.id === selectedComplaintId) || null;
  }, [complaints, selectedComplaintId]);

  // Community Active Complaints
  const activeComplexComplaints = useMemo(() => {
    return complaints.filter(c => c.portal === "society" && c.status !== "closed" && c.status !== "resolved");
  }, [complaints]);

  // Dynamic Suggestion checking during creation
  const existingBuildingIssues = useMemo(() => {
    if (!category || !user?.building) return [];
    return complaints.filter(c => 
      c.status !== "closed" && 
      c.status !== "resolved" &&
      c.category === category && 
      c.building === user.building
    );
  }, [category, user, complaints]);

  // Calculate analytics metrics
  const stats = useMemo(() => {
    const total = filteredComplaints.length;
    const emergencyCount = filteredComplaints.filter(c => c.priority === "emergency" && c.status !== "closed").length;
    const pendingCount = filteredComplaints.filter(c => ["submitted", "under-review"].includes(c.status)).length;
    const assignedCount = filteredComplaints.filter(c => ["assigned", "accepted", "travelling", "reached-society", "reached-building", "reached-flat", "work-started", "in-progress"].includes(c.status)).length;
    const resolvedTodayCount = filteredComplaints.filter(c => {
      if (!c.resolvedAt) return false;
      const resDate = new Date(c.resolvedAt).toDateString();
      const todayDate = new Date().toDateString();
      return resDate === todayDate;
    }).length;

    let totalMs = 0;
    let countResolved = 0;
    complaints.forEach((c) => {
      if ((c.status === "closed" || c.status === "resolved") && c.createdAt && c.updatedAt) {
        const start = new Date(c.createdAt).getTime();
        const end = new Date(c.updatedAt).getTime();
        totalMs += (end - start);
        countResolved++;
      }
    });
    const avgResolutionHours = countResolved > 0 ? (totalMs / (1000 * 60 * 60 * countResolved)).toFixed(1) : "3.1";

    return {
      total,
      emergency: emergencyCount,
      pending: pendingCount,
      assigned: assignedCount,
      completedToday: resolvedTodayCount,
      avgResolution: `${avgResolutionHours} hrs`,
    };
  }, [filteredComplaints, complaints]);

  // Chart data calculations
  const chartData = useMemo(() => {
    // 1. Categories Volume
    const catMap: Record<string, number> = {};
    COMPLAINT_CATEGORIES.forEach(c => { catMap[c.label] = 0; });
    filteredComplaints.forEach(c => {
      const matched = COMPLAINT_CATEGORIES.find(cat => cat.value === c.category);
      const label = matched ? matched.label : "Others";
      catMap[label] = (catMap[label] || 0) + 1;
    });
    const categoryVolume = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] })).filter(item => item.value > 0);

    // 2. Resolution Time per Worker
    const workerMap: Record<string, { name: string; jobs: number; totalRating: number }> = {};
    complaints.forEach(c => {
      if (c.assignedToId && c.assignedTo) {
        const name = c.assignedTo.split(" (")[0];
        if (!workerMap[c.assignedToId]) {
          workerMap[c.assignedToId] = { name, jobs: 0, totalRating: 0 };
        }
        if (c.rating) {
          workerMap[c.assignedToId].jobs += 1;
          workerMap[c.assignedToId].totalRating += c.rating;
        }
      }
    });
    const workerRatings = Object.keys(workerMap).map(k => ({
      name: workerMap[k].name,
      rating: workerMap[k].jobs > 0 ? Number((workerMap[k].totalRating / workerMap[k].jobs).toFixed(1)) : 5.0,
      jobs: workerMap[k].jobs
    }));

    // 3. Buildings breakdown
    const bldgMap: Record<string, number> = {};
    filteredComplaints.forEach(c => {
      const bldg = c.building || "Other Tower";
      bldgMap[bldg] = (bldgMap[bldg] || 0) + 1;
    });
    const buildingVolume = Object.keys(bldgMap).map(k => ({ name: k, count: bldgMap[k] }));

    // 4. Monthly trends
    const monthMap: Record<string, number> = { "May": 12, "June": 19, "July": filteredComplaints.length };
    const monthlyTrends = Object.keys(monthMap).map(k => ({ name: k, complaints: monthMap[k] }));

    return {
      categoryVolume,
      workerRatings,
      buildingVolume,
      monthlyTrends
    };
  }, [filteredComplaints, complaints]);

  // Duplicate group notification alert for Secretary
  const duplicateAlerts = useMemo(() => {
    return complaints.filter(c => c.status !== "closed" && c.aiAnalysis?.isDuplicate && c.aiAnalysis?.possibleDuplicateOf);
  }, [complaints]);

  // Direct chat permissions: Resident + Assigned Worker + Secretary (view-only)
  const chatPermission = useMemo(() => {
    if (!selected) return { visible: false, canSend: false, role: "guest" };
    
    // Check if worker is assigned yet
    if (!selected.assignedToId) return { visible: false, canSend: false, role: "guest" };

    if (isSecretary) return { visible: true, canSend: false, role: "secretary" };
    if (isResident && (selected.raisedBy === user?.id || selected.unit === user?.unit)) {
      return { visible: true, canSend: true, role: "resident" };
    }
    if (isWorker && selected.assignedToId === user?.id) {
      return { visible: true, canSend: true, role: "worker" };
    }
    if (isSecurity) {
      const securityCats = [
        "security", "parking", "others", "unauthorized-visitor", 
        "theft", "lost-item", "suspicious-activity", "gate-issue", 
        "vehicle-issue", "cctv", "security-staff-complaint"
      ];
      const isSecCat = securityCats.includes(selected.category || "") || selected.category === "security";
      const isAssigned = selected.assignedToId === user?.id;
      if (isSecCat && isAssigned) {
        return { visible: true, canSend: true, role: "security" };
      }
      return { visible: false, canSend: false, role: "security-denied" };
    }

    return { visible: false, canSend: false, role: "unauthorized" };
  }, [selected, user, isSecretary, isResident, isWorker, isSecurity]);

  // Helper to mask Flat numbers for privacy on Community Complaint board (e.g. Flat B-302 -> Flat B-30X)
  const maskFlatNumber = (unitStr: string) => {
    if (!unitStr) return "Wing X";
    if (unitStr.length <= 1) return unitStr;
    return unitStr.substring(0, unitStr.length - 1) + "X";
  };

  // --- ACTIONS HANDLERS ---

  const handleRaiseComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    let finalPriority = priority;
    if (emergency) {
      finalPriority = "emergency";
    }

    const payload = {
      title,
      description,
      category: category as any,
      priority: finalPriority,
      raisedBy: user?.id || "resident-1",
      raisedByName: user?.name || "Sara Shah",
      unit: flat || user?.unit || "A-204",
      building: user?.building || "Tower A",
      wing: wing || "A",
      emergency,
      images: uploadedImages,
      videos: uploadedVideos,
      status: "submitted" as const,
      portal: "society" as const,
    };

    await addComplaint(payload);

    // Reset fields
    setTitle("");
    setDescription("");
    setCategory("plumbing");
    setPriority("medium");
    setWing("");
    setFlat("");
    setEmergency(false);
    setUploadedImages([]);
    setUploadedVideos([]);
    setDialogOpen(false);
  };

  const handleJoinExisting = async (parentIssue: Complaint) => {
    if (!user) return;
    await subscribeToComplaint(parentIssue.id, user.id, user.name, user.unit || "A-301");
    setDialogOpen(false);
    alert(`Successfully joined common complex board issue: "${parentIssue.title}". You will receive updates directly on your dashboard.`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selected) return;

    await addComplaintChatMessage(selected.id, {
      senderId: user?.id || "unknown",
      senderName: user?.name || "Guest User",
      senderRole: user?.role || "resident",
      message: chatMessage.trim()
    });

    setChatMessage("");
  };

  const handleQuickReply = async (msg: string) => {
    if (!selected) return;
    await addComplaintChatMessage(selected.id, {
      senderId: user?.id || "unknown",
      senderName: user?.name || "Guest",
      senderRole: user?.role || "resident",
      message: msg
    });
  };

  const handleAssignWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !selectedWorkerId) return;

    const worker = availableWorkers.find(w => w.id === selectedWorkerId);
    if (!worker) return;

    await assignComplaintWorker(selected.id, worker.name, worker.id, eta);
    await updateComplaintStatus(selected.id, "assigned", {
      by: user?.name || "Secretary",
      note: `Assigned task to worker ${worker.name}. Estimated arrival: ${eta}. ${secNotes ? `Notes: ${secNotes}` : ""}`
    });

    setSelectedWorkerId("");
    setEta("30 mins");
    setSecNotes("");
  };

  // Worker Tracking status handlers
  const handleWorkerStatusTransition = async (nextStatus: ComplaintStatus, note: string) => {
    if (!selected) return;
    await updateComplaintStatus(selected.id, nextStatus, {
      by: user?.name || "Contractor",
      note
    });
  };

  const handleUpdateEtaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !liveEtaInput.trim()) return;

    await updateComplaintEta(selected.id, liveEtaInput.trim());
    setLiveEtaInput("");
    alert("Estimated Arrival Time (ETA) updated successfully.");
  };

  const handleWorkerCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    await updateComplaintStatus(selected.id, "completed", {
      by: user?.name || "Contractor",
      note: completionComment || "Contractor completed task. Waiting for resident verification.",
      afterPhoto: completionPhoto || "/images/after-repaired-placeholder.jpg"
    });

    setShowCompleteDialog(false);
    setCompletionComment("");
    setCompletionPhoto("");
  };

  const handleResidentVerifyClose = async () => {
    if (!selected) return;
    await rateComplaint(selected.id, ratingVal, reviewVal);
    setReviewVal("");
    setRatingVal(5);
  };

  const handleSecurityActionSubmit = async (status: "in-progress" | "completed") => {
    if (!selected) return;
    const statusNote = status === "in-progress" ? "Security officer initiated investigation on-site." : "Security officer completed investigation and filed incident report.";
    const statusVal: ComplaintStatus = status === "in-progress" ? "in-progress" : "completed";
    
    await updateComplaintStatus(selected.id, statusVal, {
      by: user?.name || "Security Officer",
      note: `${statusNote} Report details: ${securityReport}`,
      afterPhoto: securityPhoto || undefined
    });

    setSecurityReport("");
    setSecurityPhoto("");
  };

  const handleMergeDuplicate = async (parentTicketId: string, childTicketId: string) => {
    await mergeComplaints(parentTicketId, [childTicketId]);
    alert(`Successfully merged ticket ${childTicketId} into parent ticket ${parentTicketId}.`);
  };

  const handlePriorityOverride = async () => {
    if (!selected || !overridePriority) return;
    await updateComplaintStatus(selected.id, selected.status, {
      by: user?.name || "Secretary",
      note: `Priority changed manually from ${selected.priority.toUpperCase()} to ${overridePriority.toUpperCase()}.`,
      priority: overridePriority
    } as any);
    setOverridePriority("");
  };

  const handleStatusChangeAdmin = async (status: ComplaintStatus) => {
    if (!selected) return;
    await updateComplaintStatus(selected.id, status, {
      by: user?.name || "Secretary",
      note: `Admin override: Status changed directly to ${status.toUpperCase()}.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-card border border-border/50 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🛡️</span>
            <div>
              <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
                HomeVerse Complaints Control Center
                <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[10px] tracking-wider">
                  Role: {user?.role}
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enterprise ticket management, real-time Firestore sync, and AI diagnostics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Society Complaints / Community Board Dialog (For Resident & all) */}
          <Dialog open={boardOpen} onOpenChange={setBoardOpen}>
            <DialogTrigger
              render={
                <Button className="rounded-xl border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 h-10 px-4 text-xs font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Community Complaint Board
                </Button>
              }
            />
            <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-xl">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)] text-lg font-bold flex items-center gap-2 text-foreground">
                  🏢 Gated Complex Community Complaint Board
                </DialogTitle>
                <CardDescription className="text-xs">
                  Review active complex-wide maintenance schedules to help coordinate requests and prevent duplicates.
                </CardDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4 text-xs">
                {activeComplexComplaints.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {activeComplexComplaints.map((c) => {
                      const CatIcon = categoryIconMap[c.category] || categoryIconMap.others;
                      const priorityConf = PRIORITY_CONFIG[c.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
                      return (
                        <Card key={c.id} className="border border-border/50 shadow-sm relative overflow-hidden bg-secondary/5">
                          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: priorityConf.color }} />
                          <CardContent className="p-4 space-y-3 pl-4">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="font-mono text-[9px] font-bold text-muted-foreground">{c.id}</span>
                                <h4 className="text-sm font-bold text-foreground capitalize mt-0.5 flex items-center gap-1.5">
                                  <CatIcon className="w-4 h-4 text-primary shrink-0" />
                                  {c.category.replace("-", " ")} Issue
                                </h4>
                                <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                                  {c.building} · Flat {maskFlatNumber(c.unit)}
                                </p>
                              </div>
                              <Badge className={`${statusColors[c.status]} text-[9px]`} variant="outline">
                                {c.status.replace("-", " ")}
                              </Badge>
                            </div>

                            <p className="text-muted-foreground leading-normal text-[11px] italic line-clamp-2">
                              &quot;{c.description}&quot;
                            </p>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30 text-[10px]">
                              <div>
                                <span className="text-muted-foreground block text-[9px] uppercase font-bold">Assigned Worker</span>
                                <span className="font-semibold text-foreground">{c.assignedTo || "Unassigned"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[9px] uppercase font-bold">ETA</span>
                                <span className="font-semibold text-foreground">{c.estimatedArrival || "TBD"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[9px] uppercase font-bold">Expected Closing</span>
                                <span className="font-semibold text-foreground">{c.estimatedResolution || "Under Review"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[9px] uppercase font-bold">Last Updated</span>
                                <span className="font-semibold text-foreground">{new Date(c.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted-foreground bg-secondary/5 border rounded-2xl border-dashed">
                    No active maintenance complaints reported in the complex.
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {isSecretary && (
            <div className="flex border border-border rounded-xl p-1 bg-secondary/15">
              <Button
                variant={activeTab === "ledger" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("ledger")}
                className="h-8 rounded-lg text-xs"
              >
                <CheckSquare className="w-3.5 h-3.5 mr-1" /> Ledger
              </Button>
              <Button
                variant={activeTab === "analytics" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("analytics")}
                className="h-8 rounded-lg text-xs"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1" /> Analytics
              </Button>
            </div>
          )}

          {(isResident || isSecurity) && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                render={
                  <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25 h-10 px-4 text-xs font-semibold">
                    <Plus className="w-4 h-4 mr-1.5" />
                    {isSecurity ? "Log Security Incident" : "Raise New Complaint"}
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-xl rounded-2xl bg-card border border-border shadow-xl">
                <DialogHeader>
                  <DialogTitle className="font-[family-name:var(--font-heading)] text-lg font-bold">
                    {isSecurity ? "🚨 Log Gated Security Incident" : "📋 Submit Maintenance Ticket"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRaiseComplaint} className="space-y-4 mt-3 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    {!isSecurity ? (
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Complaint Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-border bg-secondary/20 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {COMPLAINT_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Incident Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-border bg-secondary/20 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="security">Suspicious Activity</option>
                          <option value="parking">Parking Issue</option>
                          <option value="unauthorized-visitor">Unauthorized Visitor</option>
                          <option value="theft">Theft / Break-in</option>
                          <option value="lost-item">Lost & Found Incident</option>
                          <option value="gate-issue">Gate Breach</option>
                          <option value="vehicle-issue">Vehicle Obstruction</option>
                          <option value="cctv">CCTV Malfunction</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Severity / Priority</label>
                      <select
                        value={priority}
                        disabled={emergency}
                        onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                        className="w-full h-10 px-3 rounded-xl border border-border bg-secondary/20 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="critical">Critical Priority</option>
                      </select>
                    </div>
                  </div>

                  {/* Smart Suggestions Alert Check */}
                  {!isSecurity && existingBuildingIssues.length > 0 && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl space-y-3 animate-fade-in">
                      <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <p className="font-bold text-amber-800">Smart Alert: Existing building issues detected</p>
                          <p className="text-[10px] text-amber-700/90 leading-normal mt-0.5 font-medium">
                            There are already {existingBuildingIssues.length} active <strong>{COMPLAINT_CATEGORIES.find(c => c.value === category)?.label}</strong> complaints in your building tower ({user?.building}).
                            The maintenance contractor team is already scheduled or investigating.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => handleJoinExisting(existingBuildingIssues[0])}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-[9px] h-7 px-3 flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Join Existing Issue
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => alert("Creating custom ticket anyway...")}
                          className="text-[9px] h-7 text-amber-800 font-semibold"
                        >
                          Create New Complaint Anyway
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Short Summary Title</label>
                    <Input
                      placeholder={isSecurity ? "e.g. Unauthorized tailgating vehicle at Gate 2" : "e.g. Water leak under kitchen drawer"}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="rounded-xl h-10 border-border"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Full Statement & Details</label>
                    <Textarea
                      placeholder={isSecurity ? "Log incident parameters, suspect vehicle registration, physical descriptions..." : "Provide exact symptoms, location details, context..."}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl min-h-[90px] border-border"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Building Tower</label>
                      <Input value={user?.building || "Tower A"} disabled className="rounded-xl h-10 bg-secondary/20 border-border text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Wing</label>
                        <Input
                          placeholder="e.g. B"
                          value={wing}
                          onChange={(e) => setWing(e.target.value)}
                          className="rounded-xl h-10 border-border"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Flat No.</label>
                        <Input
                          placeholder="e.g. 302"
                          value={flat}
                          onChange={(e) => setFlat(e.target.value)}
                          className="rounded-xl h-10 border-border"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Attachment drops */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-dashed border-border rounded-xl p-3 text-center bg-secondary/5 hover:bg-secondary/15 transition-all cursor-pointer"
                      onClick={() => setUploadedImages(["/images/plumbing-leak-mock.jpg"])}
                    >
                      <span className="text-lg">📷</span>
                      <p className="font-semibold text-[10px] mt-1">Simulate Image Upload</p>
                      <p className="text-[8px] text-muted-foreground mt-0.5">
                        {uploadedImages.length > 0 ? "✅ Placed 1 image" : "Upload proof photos"}
                      </p>
                    </div>

                    <div className="border border-dashed border-border rounded-xl p-3 text-center bg-secondary/5 hover:bg-secondary/15 transition-all cursor-pointer"
                      onClick={() => setUploadedVideos(["/videos/leakage-footage.mp4"])}
                    >
                      <span className="text-lg">🎥</span>
                      <p className="font-semibold text-[10px] mt-1">Simulate Video Upload</p>
                      <p className="text-[8px] text-muted-foreground mt-0.5">
                        {uploadedVideos.length > 0 ? "✅ Placed 1 video" : "Optional video clips"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <input
                      type="checkbox"
                      id="emergency"
                      checked={emergency}
                      onChange={(e) => {
                        setEmergency(e.target.checked);
                        if (e.target.checked) setPriority("critical");
                      }}
                      className="w-4 h-4 rounded text-red-500 bg-secondary/20 focus:ring-red-500"
                    />
                    <label htmlFor="emergency" className="font-bold text-red-600 select-none cursor-pointer">
                      🚨 MARK THIS AS A SEVERE EMERGENCY (gas leakage, water entering house, lift trapped)
                    </label>
                  </div>

                  <Button type="submit" className="w-full rounded-xl gradient-primary text-white border-0 h-11 font-semibold text-xs mt-2 shadow-md">
                    Log and Submit Ticket
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Analytics Page Mode */}
      {isSecretary && activeTab === "analytics" ? (
        <div className="space-y-6">
          {/* Stats counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Tickets ledger", value: stats.total, color: "text-blue-600", desc: "Total open and closed" },
              { label: "Pending Review", value: stats.pending, color: "text-purple-600", desc: "Awaiting worker assignment" },
              { label: "Assigned & Active", value: stats.assigned, color: "text-amber-600", desc: "Contractors working" },
              { label: "Average Resolution Rate", value: stats.avgResolution, color: "text-green-600", desc: "Past closing speeds" },
            ].map((s) => (
              <Card key={s.label} className="border-border/50 bg-card shadow-sm">
                <CardContent className="p-5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{s.label}</p>
                  <p className={`text-2xl font-extrabold mt-1 font-[family-name:var(--font-heading)] ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recharts Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-border/50 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold font-[family-name:var(--font-heading)]">Complaints Volume by Category</CardTitle>
                <CardDescription className="text-xs">Categories requiring active maintenance delegations</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {chartData.categoryVolume.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.categoryVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="currentColor" className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 9 }} stroke="currentColor" className="text-muted-foreground" />
                      <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "10px" }} />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                        {chartData.categoryVolume.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={["#8b5cf6", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#ec4899"][index % 6]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No data compiled.</div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold font-[family-name:var(--font-heading)]">Worker Quality Rankings</CardTitle>
                <CardDescription className="text-xs">Average customer star feedback ratings</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {chartData.workerRatings.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.workerRatings} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 9 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={80} />
                      <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "10px" }} />
                      <Bar dataKey="rating" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={12}>
                        {chartData.workerRatings.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.rating >= 4.5 ? "#22c55e" : entry.rating >= 3.5 ? "#f59e0b" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No rated workers logged.</div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold font-[family-name:var(--font-heading)]">Incidents per Building / Tower</CardTitle>
                <CardDescription className="text-xs">Comparison of complaint loads across complex structures</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {chartData.buildingVolume.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.buildingVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "10px" }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No data compiled.</div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold font-[family-name:var(--font-heading)]">Monthly Volume Trends</CardTitle>
                <CardDescription className="text-xs">Ticket logging volume compared over months</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.monthlyTrends} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "10px" }} />
                    <Line type="monotone" dataKey="complaints" stroke="#eab308" strokeWidth={3} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Ledger List & Detail Pane */
        <div className="space-y-6">
          {/* Counters row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "My Active Scope", value: stats.total, color: "text-blue-500", desc: "Open complex tickets" },
              { label: "Urgent Emergency Alerts", value: stats.emergency, color: "text-red-500 animate-pulse font-bold", desc: "Awaiting instant fixes" },
              { label: "Review Pending", value: stats.pending, color: "text-purple-500", desc: "Awaiting contractor assign" },
              { label: "Active Operations", value: stats.assigned, color: "text-amber-500", desc: "Dispatched to contractors" },
              { label: "Closed Resolution rate", value: filteredComplaints.filter(c => c.status === "closed").length, color: "text-green-500", desc: "Completed & verified" },
            ].map((s) => (
              <Card key={s.label} className="border-border/50 bg-card shadow-sm">
                <CardContent className="p-4">
                  <p className="text-[9px] text-muted-foreground uppercase font-semibold">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 font-[family-name:var(--font-heading)] ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-[8px] text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Grouping Duplicate Alert */}
          {isSecretary && duplicateAlerts.length > 0 && (
            <div className="space-y-2">
              {duplicateAlerts.map((alertComp) => {
                const parentComp = complaints.find(p => p.id === alertComp.aiAnalysis?.possibleDuplicateOf);
                if (!parentComp) return null;
                return (
                  <div key={alertComp.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-xs">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-bold text-amber-800">AI Detected: Possible Duplicate Incident Report</p>
                        <p className="text-muted-foreground mt-0.5">
                          Resident <strong>{alertComp.raisedByName}</strong> logged: &quot;{alertComp.title}&quot; in Flat {alertComp.unit}.
                          Matches parent ticket <strong>{parentComp.id}</strong> (&quot;{parentComp.title}&quot;).
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleMergeDuplicate(parentComp.id, alertComp.id)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-[10px] h-8 shrink-0"
                    >
                      <Merge className="w-3.5 h-3.5 mr-1" /> Merge Group
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Clean Ledger split */}
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Left Ledger List */}
            <div className="lg:col-span-5 space-y-3 max-h-[85vh] overflow-y-auto pr-1">
              {filteredComplaints.map((c) => {
                const priorityConf = PRIORITY_CONFIG[c.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
                const catConf = COMPLAINT_CATEGORIES.find(cat => cat.value === c.category) || { label: "Others", icon: "CircleDot" };
                const CatIcon = categoryIconMap[c.category] || categoryIconMap.others;

                return (
                  <Card
                    key={c.id}
                    className={`border border-border/50 cursor-pointer transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] relative overflow-hidden ${
                      selectedComplaintId === c.id ? "ring-2 ring-primary/45 bg-secondary/15" : "bg-card"
                    }`}
                    onClick={() => setSelectedComplaintId(c.id)}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: priorityConf.color }} />

                    <CardContent className="p-4 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1 space-y-1 pl-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-muted-foreground text-[10px]">{c.id}</span>
                          <Badge className={`${statusColors[c.status]} text-[9px] font-semibold border`} variant="outline">
                            {c.status.replace("-", " ")}
                          </Badge>
                          <Badge
                            className="text-[9px] font-semibold border"
                            style={{
                              backgroundColor: `${priorityConf.color}15`,
                              color: priorityConf.color,
                              borderColor: `${priorityConf.color}35`,
                            }}
                            variant="outline"
                          >
                            {priorityConf.label}
                          </Badge>
                          {c.emergency && (
                            <Badge className="bg-red-600 text-white text-[8px] animate-pulse">EMERGENCY</Badge>
                          )}
                        </div>
                        <h3 className="text-sm font-bold truncate text-foreground">{c.title}</h3>
                        
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-0.5">
                            <CatIcon className="w-3 h-3 text-primary" />
                            {catConf.label}
                          </span>
                          <span>·</span>
                          <span>Flat {c.unit} ({c.building})</span>
                          <span>·</span>
                          <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {c.priorityScore && (
                        <div className="text-center shrink-0 border-l border-border/40 pl-3">
                          <p className="text-[8px] text-muted-foreground uppercase font-bold">Severity</p>
                          <p className="text-base font-extrabold font-[family-name:var(--font-heading)]" style={{ color: priorityConf.color }}>
                            {c.priorityScore}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredComplaints.length === 0 && (
                <div className="p-12 text-center text-muted-foreground text-xs border border-dashed rounded-2xl bg-secondary/5 space-y-2">
                  <Users className="w-8 h-8 mx-auto text-muted-foreground/30" />
                  <p>No complaints raised yet or matching selected scope.</p>
                </div>
              )}
            </div>

            {/* Right Details Pane */}
            <div className="lg:col-span-7">
              {selected ? (
                <div className="space-y-6">
                  {/* Complaint details card */}
                  <Card className="border border-border/50 bg-card overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-border/30 bg-secondary/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-muted-foreground text-xs">{selected.id}</span>
                          <Badge className={`${statusColors[selected.status]} text-xs font-semibold`} variant="outline">
                            {selected.status.replace("-", " ")}
                          </Badge>
                          {selected.emergency && (
                            <Badge className="bg-red-600 text-white text-[10px] animate-pulse">EMERGENCY LEVEL</Badge>
                          )}
                        </div>
                        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-foreground mt-1.5">
                          {selected.title}
                        </h2>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Raised by <strong>{selected.raisedByName}</strong> · Flat {selected.unit}, {selected.building} (Wing {selected.wing || "A"}) · Logged {new Date(selected.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {isSecretary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this complaint?")) {
                              await fetch(`/api/complaints/${selected.id}`, { method: "DELETE" });
                              setSelectedComplaintId(null);
                              alert("Ticket deleted.");
                            }
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 rounded-lg shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <CardContent className="p-6 space-y-6 text-xs leading-relaxed">
                      {/* Statement and attachments */}
                      <div className="space-y-2">
                        <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px] block">Resident Issue Statement</span>
                        <p className="bg-secondary/15 p-4 rounded-xl text-foreground text-sm border border-border/30">
                          {selected.description}
                        </p>

                        {/* Attachments (hides from other residents due to filteredComplaints list checks) */}
                        {((selected.images && selected.images.length > 0) || (selected.videos && selected.videos.length > 0)) && (
                          <div className="space-y-1.5">
                            <span className="font-bold text-muted-foreground text-[10px] block">Attached Proof files</span>
                            <div className="flex gap-2 flex-wrap">
                              {selected.images?.map((img, i) => (
                                <div key={i} className="relative group rounded-lg overflow-hidden border border-border w-24 h-16 bg-secondary">
                                  <div className="w-full h-full flex items-center justify-center bg-blue-500/10 text-primary">📷 Image {i+1}</div>
                                </div>
                              ))}
                              {selected.videos?.map((vid, i) => (
                                <div key={i} className="relative group rounded-lg overflow-hidden border border-border w-24 h-16 bg-secondary">
                                  <div className="w-full h-full flex items-center justify-center bg-purple-500/10 text-primary">🎥 Video {i+1}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Operational contractor fields */}
                      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/10 border border-border/40">
                        <div>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold block">Assigned Contractor</span>
                          <span className="font-bold text-foreground text-xs mt-0.5 block">{selected.assignedTo || "Under Review / Unassigned"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold block">Estimated Arrival (ETA)</span>
                          <span className="font-bold text-foreground text-xs mt-0.5 block">{selected.estimatedArrival || "Pending Delegation"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold block">Expected Resolution</span>
                          <span className="font-bold text-foreground text-xs mt-0.5 block">{selected.estimatedResolution || "Awaiting dispatch review"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold block">Duplicate merge parent</span>
                          <span className="font-bold text-foreground text-xs mt-0.5 block">{selected.parentTicketId || "None"}</span>
                        </div>
                      </div>

                      {/* Internal Secretary Notes */}
                      {selected.secretaryNotes && (
                        <div className="p-3 bg-secondary/15 rounded-xl border border-border/30 space-y-1">
                          <span className="font-bold text-muted-foreground uppercase tracking-wider text-[9px] block">Secretary Internal Remarks</span>
                          <p className="text-foreground italic">{selected.secretaryNotes}</p>
                        </div>
                      )}

                      {/* --- SECRETARY DISPATCH CONTROL WIDGET --- */}
                      {isSecretary && (
                        <div className="p-4 bg-secondary/10 rounded-xl border border-border/45 space-y-4">
                          <span className="font-bold text-foreground block text-sm">Administrative Dispatch Actions</span>
                          
                          <div className="flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" onClick={() => handleStatusChangeAdmin("under-review")} className="text-[9px] h-7">Set Under Review</Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusChangeAdmin("in-progress")} className="text-[9px] h-7">Force In-Progress</Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusChangeAdmin("completed")} className="text-[9px] h-7">Force Completed</Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusChangeAdmin("closed")} className="text-[9px] h-7 bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20">Direct Close</Button>
                          </div>

                          {/* Assign Worker */}
                          {["submitted", "under-review", "assigned"].includes(selected.status) && (
                            <form onSubmit={handleAssignWorkerSubmit} className="space-y-3 pt-2 border-t border-border/30">
                              <span className="font-bold text-muted-foreground text-[10px] block">Delegate Worker Assignment</span>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className="text-[9px] text-muted-foreground mb-1 block">Contractor Team</label>
                                  <select
                                    value={selectedWorkerId}
                                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                                    className="w-full h-8 px-2 rounded-lg border border-border bg-card text-[10px]"
                                    required
                                  >
                                    <option value="">Select Worker</option>
                                    {availableWorkers.map(w => (
                                      <option key={w.id} value={w.id}>{w.name} ({w.workerCategory || "Contractor"})</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[9px] text-muted-foreground mb-1 block">Required ETA</label>
                                  <Input value={eta} onChange={(e) => setEta(e.target.value)} className="h-8 text-[10px]" required />
                                </div>
                                <div>
                                  <label className="text-[9px] text-muted-foreground mb-1 block">Internal dispatch notes</label>
                                  <Input placeholder="e.g. Inspect AC filter" value={secNotes} onChange={(e) => setSecNotes(e.target.value)} className="h-8 text-[10px]" />
                                </div>
                              </div>
                              <Button type="submit" className="w-full gradient-primary text-white border-0 h-9 font-semibold text-[10px]">
                                Assign & Dispatch Task
                              </Button>
                            </form>
                          )}

                          {/* Override priority */}
                          <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                            <div className="flex-1">
                              <label className="text-[9px] text-muted-foreground mb-1 block">Override Priority</label>
                              <select
                                value={overridePriority}
                                onChange={(e) => setOverridePriority(e.target.value as ComplaintPriority)}
                                className="w-full h-8 px-2 rounded-lg border border-border bg-card text-[10px]"
                              >
                                <option value="">Select Priority</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                                <option value="emergency">Emergency</option>
                              </select>
                            </div>
                            <Button onClick={handlePriorityOverride} size="sm" className="h-8 text-[10px] mt-4">
                              Update Severity
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* --- WORKER WORKFLOW CONTROL WIDGET (With tracking status progress) --- */}
                      {isWorker && (
                        <div className="p-4 bg-secondary/15 rounded-xl border border-border/40 space-y-4">
                          <span className="font-bold text-foreground block text-sm">Contractor Work Log Actions</span>
                          
                          {/* Live ETA Update panel */}
                          {["assigned", "accepted", "travelling", "reached-society", "reached-building"].includes(selected.status) && (
                            <form onSubmit={handleUpdateEtaSubmit} className="flex gap-2 items-center bg-card p-3 rounded-xl border border-border/30">
                              <div className="flex-1">
                                <label className="text-[9px] text-muted-foreground mb-0.5 block">Update Live ETA for Resident</label>
                                <Input
                                  placeholder="e.g. 2:15 PM, 15 mins..."
                                  value={liveEtaInput}
                                  onChange={(e) => setLiveEtaInput(e.target.value)}
                                  className="h-8 text-[10px]"
                                  required
                                />
                              </div>
                              <Button type="submit" size="sm" className="h-8 text-[10px] mt-3.5">
                                Update ETA
                              </Button>
                            </form>
                          )}

                          {/* Accept / Decline */}
                          {selected.status === "assigned" && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleWorkerStatusTransition("accepted", "Worker accepted the job dispatch.")}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold h-10 text-[11px] rounded-lg"
                              >
                                <Check className="w-4 h-4 mr-1" /> Accept Job
                              </Button>
                              <Button
                                onClick={() => handleWorkerStatusTransition("under-review", "Worker declined delegation.")}
                                variant="outline"
                                className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/5 h-10 text-[11px] rounded-lg"
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Decline Roster
                              </Button>
                            </div>
                          )}

                          {/* Step-by-Step Roster Tracker transitions */}
                          {selected.status === "accepted" && (
                            <Button
                              onClick={() => handleWorkerStatusTransition("travelling", "Worker is now travelling to the society.")}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 text-[11px] rounded-lg flex items-center justify-center gap-1.5"
                            >
                              <Truck className="w-4 h-4" /> Start Travelling (On-route)
                            </Button>
                          )}

                          {selected.status === "travelling" && (
                            <Button
                              onClick={() => handleWorkerStatusTransition("reached-society", "Worker arrived at complex main security gates.")}
                              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold h-10 text-[11px] rounded-lg flex items-center justify-center gap-1.5"
                            >
                              <Home className="w-4 h-4" /> Reached Society Gate
                            </Button>
                          )}

                          {selected.status === "reached-society" && (
                            <Button
                              onClick={() => handleWorkerStatusTransition("reached-building", `Worker reached building tower: ${selected.building}`)}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold h-10 text-[11px] rounded-lg flex items-center justify-center gap-1.5"
                            >
                              <Building2 className="w-4 h-4" /> Reached Resident Tower
                            </Button>
                          )}

                          {selected.status === "reached-building" && (
                            <Button
                              onClick={() => handleWorkerStatusTransition("reached-flat", `Worker reached Flat unit: ${selected.unit}`)}
                              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold h-10 text-[11px] rounded-lg flex items-center justify-center gap-1.5"
                            >
                              <MapPin className="w-4 h-4" /> Reached Flat Doorstep
                            </Button>
                          )}

                          {selected.status === "reached-flat" && (
                            <Button
                              onClick={() => handleWorkerStatusTransition("work-started", "Worker commenced diagnostic repair operations on-site.")}
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold h-10 text-[11px] rounded-lg flex items-center justify-center gap-1.5"
                            >
                              <Zap className="w-4 h-4" /> Commenced Repair Work
                            </Button>
                          )}

                          {selected.status === "work-started" && (
                            <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                              <DialogTrigger
                                render={
                                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-10 text-[11px] rounded-lg">
                                    <CheckCircle2 className="w-4 h-4 mr-1" /> Mark Work Log Completed
                                  </Button>
                                }
                              />
                              <DialogContent className="sm:max-w-md rounded-2xl">
                                <DialogHeader>
                                  <DialogTitle className="font-[family-name:var(--font-heading)]">Log Completion details</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleWorkerCompleteSubmit} className="space-y-4 mt-2 text-xs">
                                  <div>
                                    <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Completion notes</label>
                                    <Textarea
                                      placeholder="Explain in detail what parts were replaced, how leak was plugged..."
                                      value={completionComment}
                                      onChange={(e) => setCompletionComment(e.target.value)}
                                      className="rounded-xl min-h-[80px]"
                                      required
                                    />
                                  </div>

                                  <div
                                    className="border border-dashed border-border rounded-xl p-5 text-center bg-secondary/15 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                                    onClick={() => setCompletionPhoto("/images/leak-completed-proof.jpg")}
                                  >
                                    <span className="text-xl">📷</span>
                                    <span className="font-semibold">Simulate Before/After repair Proof Upload</span>
                                    <span className="text-[9px] text-muted-foreground">
                                      {completionPhoto ? "✅ Photo logged successfully" : "Click to select repaired asset proof image"}
                                    </span>
                                  </div>

                                  <Button type="submit" className="w-full h-10 bg-green-600 hover:bg-green-700 text-white border-0 rounded-xl font-bold">
                                    Submit Work Completion Proof
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          )}

                          {selected.status === "completed" && (
                            <p className="text-center text-muted-foreground py-2 italic">
                              Work completed. Pending resident audit and verification feedback.
                            </p>
                          )}
                        </div>
                      )}

                      {/* --- SECURITY LOG WIDGET --- */}
                      {isSecurity && (
                        <div className="p-4 bg-secondary/15 rounded-xl border border-border/40 space-y-3">
                          <span className="font-bold text-foreground block text-sm">Security Investigation Log</span>
                          
                          <div>
                            <label className="text-[9px] text-muted-foreground mb-1 block">Officer notes & statement report</label>
                            <Textarea
                              placeholder="Describe investigation parameters, vehicle number plates, action taken..."
                              value={securityReport}
                              onChange={(e) => setSecurityReport(e.target.value)}
                              className="min-h-[80px] text-[10px] mb-2"
                              required
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => setSecurityPhoto("/images/security-snapshot.jpg")}
                              variant="outline"
                              size="sm"
                              className="text-[9px]"
                            >
                              📷 Attach Snapshot ({securityPhoto ? "Logged" : "None"})
                            </Button>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-border/20">
                            {selected.status === "submitted" && (
                              <Button
                                onClick={() => handleSecurityActionSubmit("in-progress")}
                                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px]"
                                disabled={!securityReport}
                              >
                                Accept & Start Investigation
                              </Button>
                            )}
                            {["submitted", "assigned", "in-progress"].includes(selected.status) && (
                              <Button
                                onClick={() => handleSecurityActionSubmit("completed")}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-[10px]"
                                disabled={!securityReport}
                              >
                                Log Resolution & Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* --- RESIDENT FEEDBACK --- */}
                      {isResident && selected.status === "completed" && (
                        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                          <span className="font-extrabold block text-foreground uppercase tracking-wider text-[10px]">
                            ⭐ Audit, Feedback & Close Ticket
                          </span>
                          <p className="text-muted-foreground leading-normal">
                            Please verify if the contractor has finished the task to your satisfaction, and rate their service quality below.
                          </p>
                          
                          <div className="flex gap-1.5 items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setRatingVal(star)}
                                className="focus:outline-none"
                              >
                                <Star className={`w-7 h-7 transition-all ${star <= ratingVal ? "text-yellow-500 fill-yellow-500 scale-110" : "text-muted"}`} />
                              </button>
                            ))}
                          </div>

                          <div>
                            <label className="text-[9px] text-muted-foreground mb-1 block uppercase font-bold">Review & Feedback Remarks</label>
                            <Input
                              placeholder="What was good or needs improvement? (optional)"
                              value={reviewVal}
                              onChange={(e) => setReviewVal(e.target.value)}
                              className="h-9 text-[10px]"
                            />
                          </div>

                          <Button onClick={handleResidentVerifyClose} className="w-full gradient-primary text-white border-0 rounded-xl h-10 font-bold mt-1 shadow-md">
                            Confirm Resolution & Close Ticket
                          </Button>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="space-y-4 pt-4 border-t border-border/30">
                        <span className="font-bold text-muted-foreground uppercase tracking-wider block text-[10px]">Audit History Log Timeline</span>
                        <div className="space-y-4 pl-2 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border/40">
                          {selected.timeline?.map((entry, idx) => {
                            const TimeIcon = statusIcons[entry.status] || Clock;
                            return (
                              <div key={idx} className="flex gap-4 relative">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-secondary border border-border shrink-0 z-10">
                                  <TimeIcon className="w-3 h-3 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-bold capitalize text-foreground">{entry.status.replace("-", " ")}</p>
                                  <p className="text-muted-foreground text-[10px] mt-0.5">{entry.note}</p>
                                  <p className="text-[8px] text-muted-foreground mt-0.5 font-semibold">
                                    {new Date(entry.timestamp).toLocaleString()} {entry.by && `· Author: ${entry.by}`}
                                  </p>
                                  {entry.afterPhoto && (
                                    <div className="mt-1.5 p-2 border rounded-lg max-w-[120px] bg-secondary/5">
                                      <span className="text-[8px] text-muted-foreground">Proof Image:</span>
                                      <div className="h-10 flex items-center justify-center bg-green-500/10 text-green-600 rounded text-[9px] mt-1 font-bold">📷 Finished</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </CardContent>
                  </Card>

                  {/* Direct chat widget (Permissions enforced) */}
                  {chatPermission.visible ? (
                    <Card className="border border-border/50 bg-card overflow-hidden shadow-sm">
                      <div className="p-4 border-b border-border/30 bg-secondary/5 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <div>
                          <h4 className="font-bold text-xs text-foreground">Direct Complaint Messaging Roster</h4>
                          <p className="text-[9px] text-muted-foreground">Internal secure discussion channel between Resident and Contractor</p>
                        </div>
                      </div>

                      <CardContent className="p-0 text-xs">
                        {/* Messages panel */}
                        <div className="h-56 overflow-y-auto p-4 space-y-3 bg-secondary/5">
                          {selected.chat && selected.chat.length > 0 ? (
                            selected.chat.map((msg: ComplaintChatMessage) => {
                              const self = msg.senderId === user?.id;
                              return (
                                <div key={msg.id} className={`flex flex-col ${self ? "items-end" : "items-start"}`}>
                                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mb-0.5">
                                    <span>{msg.senderName} ({msg.senderRole})</span>
                                    <span>·</span>
                                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <div className={`p-2.5 rounded-2xl max-w-[80%] border ${
                                    self 
                                      ? "bg-primary text-white border-primary rounded-tr-none" 
                                      : "bg-card text-foreground border-border/40 rounded-tl-none shadow-sm"
                                  }`}>
                                    {msg.message}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground text-[10px] italic">
                              No discussion logged yet. Send a hello to initiate!
                            </div>
                          )}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Quick updates keys */}
                        {chatPermission.canSend && (
                          <div className="p-2 border-t border-border/30 bg-secondary/10 flex gap-1.5 overflow-x-auto">
                            {isResident && [
                              "The leakage has become worse.",
                              "Please ring the doorbell when you arrive.",
                              "Will you arrive soon?"
                            ].map(t => (
                              <button key={t} onClick={() => handleQuickReply(t)} className="bg-card hover:bg-secondary border border-border/40 px-2.5 py-1 rounded-lg text-[9px] font-semibold whitespace-nowrap">
                                {t}
                              </button>
                            ))}
                            {isWorker && [
                              "I'll reach in approximately 20 minutes.",
                              "I'm finishing another complaint nearby.",
                              "Sure.",
                              "Waiting for spare materials."
                            ].map(t => (
                              <button key={t} onClick={() => handleQuickReply(t)} className="bg-card hover:bg-secondary border border-border/40 px-2.5 py-1 rounded-lg text-[9px] font-semibold whitespace-nowrap">
                                {t}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Input panel (Monitor Mode check) */}
                        {chatPermission.canSend ? (
                          <form onSubmit={handleSendMessage} className="p-3 border-t border-border/30 flex gap-2 items-center bg-card">
                            <Input
                              placeholder="Write a message to contractor/resident..."
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              className="h-9 text-[11px] rounded-xl flex-1 border-border"
                              required
                            />
                            <Button type="submit" size="sm" className="rounded-xl gradient-primary text-white border-0 h-9 w-9 p-0 flex items-center justify-center shadow">
                              <Send className="w-3.5 h-3.5" />
                            </Button>
                          </form>
                        ) : (
                          <div className="p-3 border-t border-border/30 text-center text-muted-foreground bg-secondary/5 font-semibold text-[10px] flex items-center justify-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />
                            {isSecretary 
                              ? "Viewing conversation as Secretary (Monitor Mode Only)" 
                              : "Security incident logs are locked for monitoring."}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    /* Chat is locked/invisible before assignment */
                    <Card className="border border-border/50 bg-card p-6 text-center text-xs text-muted-foreground space-y-1.5 shadow-sm">
                      <Lock className="w-8 h-8 mx-auto text-muted-foreground/20" />
                      <p className="font-bold text-foreground">Direct Messaging Locked</p>
                      <p className="text-[11px] max-w-sm mx-auto">
                        {selected.assignedToId 
                          ? "Access to conversation restricted." 
                          : "Chat will automatically unlock once a worker has been assigned by the Secretary."}
                      </p>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="border border-border/50 bg-card">
                  <CardContent className="p-12 text-center text-xs text-muted-foreground space-y-2">
                    <Wrench className="w-10 h-10 mx-auto text-muted-foreground/20" />
                    <p className="font-bold text-foreground">Select a Ticket from the Ledger</p>
                    <p>Select any complaint from the roster list on the left to load operational states, live chat log channels, and dispatch actions.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
