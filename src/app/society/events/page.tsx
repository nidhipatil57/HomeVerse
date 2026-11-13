"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { savePendingGatewayCheckout } from "@/lib/payment-gateway";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar as CalendarIcon, MapPin, Users, Check, Filter, Info, 
  Clock, X, Plus, Edit3, Trash2, QrCode, CreditCard, ChevronRight,
  Shield, CheckCircle2, AlertTriangle, AlertCircle, Eye, ArrowRight,
  Sparkles, RefreshCw, Download, Share2, Tag, DollarSign, UserCheck,
  CalendarDays, ExternalLink, Ban, Search, Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore, CommunityEvent, EventRegistration } from "@/lib/store/useCommunityStore";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { QRCodeSVG } from "qrcode.react";

// Preset banner options for convenient selection
const PRESET_BANNERS = [
  { label: "Cultural & Festival", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60" },
  { label: "Sports & Fitness", url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=60" },
  { label: "Workshop & Tech", url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60" },
  { label: "Health & Wellness", url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60" },
  { label: "General Meeting", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60" },
  { label: "Environment & Solar", url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=60" },
];

const CATEGORIES = [
  "All", "Festival", "Sports", "Cultural", "Workshop", "Meeting", "Health Camp", "Kids Activity", "Celebration", "Other"
];

// Helper to determine event timing status
function getEventTiming(dateStr: string) {
  try {
    if (!dateStr) return "upcoming";
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    let targetDate: Date;
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-").map(Number);
      if (parts[0] > 1000) {
        targetDate = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        targetDate = new Date(parts[2], parts[1] - 1, parts[0]);
      }
    } else if (dateStr.includes("/")) {
      const parts = dateStr.split("/").map(Number);
      if (parts[0] > 1000) {
        targetDate = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        targetDate = new Date(parts[2], parts[1] - 1, parts[0]);
      }
    } else {
      targetDate = new Date(dateStr);
    }

    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();

    if (target === today) return "ongoing";
    if (target > today) return "upcoming";
    return "past";
  } catch (e) {
    return "upcoming";
  }
}

// =========================================================================
// Main Page Router / Wrapper
// =========================================================================
export default function EventsPage() {
  const { user, initialize } = useAuth();
  const { communityEvents, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      communityEvents: state.communityEvents || [],
      initializeDb: state.initializeDb
    }))
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading society events...</p>
        </div>
      </div>
    );
  }

  const role = user?.role || "resident";

  if (role === "secretary") {
    return <SecretaryEventsView user={user} />;
  }

  if (role === "manager") {
    return <ManagerEventsView user={user} />;
  }

  if (role === "security") {
    return <SecurityEventsView user={user} />;
  }

  return <ResidentEventsView user={user} />;
}

// =========================================================================
// 1. SECRETARY PORTAL — Complete Event Management
// =========================================================================
export function SecretaryEventsView({ user }: { user: any }) {
  const {
    communityEvents, createEvent, updateEventDetails, cancelEvent
  } = useCommunityStore(
    useShallow((state) => ({
      communityEvents: state.communityEvents || [],
      createEvent: state.createEvent,
      updateEventDetails: state.updateEventDetails,
      cancelEvent: state.cancelEvent
    }))
  );

  const [activeTab, setActiveTab] = useState<"all" | "published" | "drafts" | "cancelled" | "past">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Create / Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Cultural");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [bannerImage, setBannerImage] = useState(PRESET_BANNERS[0].url);
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [maxParticipants, setMaxParticipants] = useState<number | "">("");
  const [eligibility, setEligibility] = useState("All Residents");
  const [registrationFee, setRegistrationFee] = useState<"Free" | "Paid">("Free");
  const [entryFee, setEntryFee] = useState<number | "">("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [status, setStatus] = useState<"Published" | "Draft">("Published");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Attendees Modal
  const [viewingRegistrationsEvent, setViewingRegistrationsEvent] = useState<CommunityEvent | null>(null);

  // Reschedule Modal
  const [rescheduleEvent, setRescheduleEvent] = useState<CommunityEvent | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState("");
  const [newRescheduleTime, setNewRescheduleTime] = useState("");
  const [newRescheduleEndTime, setNewRescheduleEndTime] = useState("");
  const [newRescheduleVenue, setNewRescheduleVenue] = useState("");

  // Statistics
  const stats = useMemo(() => {
    const total = communityEvents.length;
    const published = communityEvents.filter((e) => e.status === "Published" || e.status === "Active").length;
    const drafts = communityEvents.filter((e) => e.status === "Draft").length;
    const cancelled = communityEvents.filter((e) => e.status === "Cancelled").length;

    let totalRegistrations = 0;
    let totalRevenue = 0;

    communityEvents.forEach((ev) => {
      const regs = ev.registrations || [];
      totalRegistrations += regs.reduce((sum, r) => sum + 1 + (r.guestCount || 0), 0);
      regs.forEach((r) => {
        if (r.paidAmount) totalRevenue += r.paidAmount;
      });
    });

    return { total, published, drafts, cancelled, totalRegistrations, totalRevenue };
  }, [communityEvents]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return communityEvents.filter((ev) => {
      // Tab filter
      const timing = getEventTiming(ev.date);
      if (activeTab === "published" && ev.status !== "Published" && ev.status !== "Active") return false;
      if (activeTab === "drafts" && ev.status !== "Draft") return false;
      if (activeTab === "cancelled" && ev.status !== "Cancelled") return false;
      if (activeTab === "past" && timing !== "past") return false;

      // Category filter
      if (selectedCategory !== "All" && ev.category !== selectedCategory) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(query);
        const matchLoc = ev.location.toLowerCase().includes(query);
        const matchDesc = ev.description.toLowerCase().includes(query);
        if (!matchTitle && !matchLoc && !matchDesc) return false;
      }

      return true;
    });
  }, [communityEvents, activeTab, selectedCategory, searchQuery]);

  const openCreateModal = () => {
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    setCategory("Cultural");
    setDate(new Date().toISOString().split("T")[0]);
    setTime("18:00");
    setEndTime("21:00");
    setLocation("Clubhouse Lawn");
    setBannerImage(PRESET_BANNERS[0].url);
    setRegistrationDeadline("");
    setMaxParticipants("");
    setEligibility("All Residents");
    setRegistrationFee("Free");
    setEntryFee("");
    setAdditionalInstructions("");
    setStatus("Published");
    setIsFormOpen(true);
  };

  const openEditModal = (ev: CommunityEvent) => {
    setEditingEventId(ev.id);
    setTitle(ev.title);
    setDescription(ev.description || "");
    setCategory(ev.category || "Cultural");
    setDate(ev.date);
    setTime(ev.time);
    setEndTime(ev.endTime || "");
    setLocation(ev.location);
    setBannerImage(ev.bannerImage || PRESET_BANNERS[0].url);
    setRegistrationDeadline(ev.registrationDeadline || "");
    setMaxParticipants(ev.maxParticipants || "");
    setEligibility(ev.eligibility || ev.visibility || "All Residents");
    setRegistrationFee(ev.entryFee && ev.entryFee > 0 ? "Paid" : "Free");
    setEntryFee(ev.entryFee || "");
    setAdditionalInstructions(ev.additionalInstructions || ev.rules || "");
    setStatus(ev.status === "Draft" ? "Draft" : "Published");
    setIsFormOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time || !location) {
      alert("Please fill in the required fields (Event Name, Date, Start Time, and Venue).");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<CommunityEvent> = {
        title,
        description,
        category,
        date,
        time,
        endTime: endTime || undefined,
        location,
        bannerImage,
        registrationDeadline: registrationDeadline || undefined,
        maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
        eligibility,
        registrationFee,
        entryFee: registrationFee === "Paid" && entryFee ? Number(entryFee) : 0,
        additionalInstructions,
        status,
        organizer: user?.name || "Society Secretary",
      };

      if (editingEventId) {
        await updateEventDetails(editingEventId, payload);
      } else {
        await createEvent(payload);
      }

      setIsFormOpen(false);
      alert(status === "Published" 
        ? `Event "${title}" has been published successfully and is now live for all residents!` 
        : `Event draft "${title}" saved successfully.`
      );
    } catch (err) {
      console.error(err);
      alert("Failed to save event. Please check the details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (ev: CommunityEvent) => {
    const newStatus = (ev.status === "Published" || ev.status === "Active") ? "Draft" : "Published";
    await updateEventDetails(ev.id, { status: newStatus });
  };

  const handleCancelEvent = async (ev: CommunityEvent) => {
    if (window.confirm(`Are you sure you want to cancel "${ev.title}"? Registered participants will receive an immediate notification.`)) {
      await cancelEvent(ev.id);
    }
  };

  const openRescheduleModal = (ev: CommunityEvent) => {
    setRescheduleEvent(ev);
    setNewRescheduleDate(ev.date);
    setNewRescheduleTime(ev.time);
    setNewRescheduleEndTime(ev.endTime || "");
    setNewRescheduleVenue(ev.location);
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleEvent) return;
    if (!newRescheduleDate || !newRescheduleTime) {
      alert("Please specify the new event date and time.");
      return;
    }

    await updateEventDetails(rescheduleEvent.id, {
      date: newRescheduleDate,
      time: newRescheduleTime,
      endTime: newRescheduleEndTime || undefined,
      location: newRescheduleVenue || rescheduleEvent.location
    });

    setRescheduleEvent(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Society Events Management</h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
              Secretary Operations
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Authoritative event control: publish, manage registrations, schedule venues, and broadcast society notifications.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          Create New Event
        </Button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Published Events</p>
              <p className="text-2xl font-bold mt-1 text-emerald-600">{stats.published}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Registrations</p>
              <p className="text-2xl font-bold mt-1 text-primary">{stats.totalRegistrations}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Draft Proposals</p>
              <p className="text-2xl font-bold mt-1 text-amber-600">{stats.drafts}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Edit3 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Event Revenue</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: "all", label: "All Events" },
            { id: "published", label: "Published" },
            { id: "drafts", label: `Drafts (${stats.drafts})` },
            { id: "cancelled", label: "Cancelled" },
            { id: "past", label: "Past Archive" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search title, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-8 px-2 rounded-md border border-input bg-background text-xs"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-base">No events found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {activeTab === "drafts" 
              ? "You have no draft events. Click 'Create New Event' and save as Draft to prepare future programs."
              : "No events match your current filter criteria."}
          </p>
          <Button onClick={openCreateModal} variant="outline" size="sm" className="mt-4 gap-1">
            <Plus className="w-3.5 h-3.5" />
            Create Event
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((ev) => {
            const regs = ev.registrations || [];
            const registeredCount = regs.reduce((sum, r) => sum + 1 + (r.guestCount || 0), 0);
            const isFull = ev.maxParticipants ? registeredCount >= ev.maxParticipants : false;
            const capPercent = ev.maxParticipants ? Math.min(100, Math.round((registeredCount / ev.maxParticipants) * 100)) : 0;
            const isDraft = ev.status === "Draft";
            const isCancelled = ev.status === "Cancelled";

            return (
              <Card key={ev.id} className={`overflow-hidden flex flex-col border-border/60 hover:shadow-md transition-shadow ${
                isDraft ? "border-amber-300 dark:border-amber-800 bg-amber-50/20" : ""
              }`}>
                {/* Event Banner */}
                <div className="relative h-44 w-full bg-muted overflow-hidden">
                  <img
                    src={ev.bannerImage || PRESET_BANNERS[0].url}
                    alt={ev.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Status Badges on Image */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <Badge className="bg-black/60 text-white backdrop-blur-md text-[10px] border-none">
                      {ev.category || "General"}
                    </Badge>
                    {isDraft && (
                      <Badge className="bg-amber-500 text-white text-[10px] border-none font-semibold">
                        Draft (Private)
                      </Badge>
                    )}
                    {isCancelled && (
                      <Badge className="bg-rose-500 text-white text-[10px] border-none font-semibold">
                        Cancelled
                      </Badge>
                    )}
                    {!isDraft && !isCancelled && (
                      <Badge className="bg-emerald-500 text-white text-[10px] border-none font-semibold">
                        Published
                      </Badge>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-black/60 text-white backdrop-blur-md text-[10px] border-white/20">
                      {ev.entryFee && ev.entryFee > 0 ? `₹${ev.entryFee} / person` : "Free Entry"}
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-base line-clamp-1">{ev.title}</h3>
                    <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {ev.date} • {ev.time} {ev.endTime ? `- ${ev.endTime}` : ""}
                    </p>
                  </div>
                </div>

                {/* Event Body */}
                <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate font-medium">{ev.location}</span>
                    </div>

                    <p className="text-muted-foreground line-clamp-2 text-xs">
                      {ev.description || "No description provided."}
                    </p>

                    {/* Eligibility & Deadline */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {ev.eligibility || ev.visibility || "All Residents"}
                      </span>
                      {ev.registrationDeadline && (
                        <span className="text-amber-600 font-medium">
                          Closes: {ev.registrationDeadline}
                        </span>
                      )}
                    </div>

                    {/* Capacity Indicator */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] font-medium mb-1">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-3 h-3" />
                          Attendance Capacity
                        </span>
                        <span>
                          {registeredCount} / {ev.maxParticipants || "∞"} spots
                        </span>
                      </div>
                      {ev.maxParticipants && (
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              capPercent >= 90 ? "bg-rose-500" : capPercent >= 70 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${capPercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-border/50 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs gap-1"
                        onClick={() => setViewingRegistrationsEvent(ev)}
                      >
                        <Users className="w-3.5 h-3.5" />
                        Attendees ({registeredCount})
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs"
                        onClick={() => openEditModal(ev)}
                        title="Edit Event"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs text-amber-600 hover:text-amber-700"
                        onClick={() => openRescheduleModal(ev)}
                        title="Reschedule Event"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                      <button
                        onClick={() => handleTogglePublish(ev)}
                        className="text-primary hover:underline font-medium"
                      >
                        {isDraft ? "Publish Event Now" : "Unpublish to Draft"}
                      </button>

                      {!isCancelled && (
                        <button
                          onClick={() => handleCancelEvent(ev)}
                          className="text-rose-600 hover:underline font-medium"
                        >
                          Cancel Event
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Create / Edit Event Dialog */}
      {/* ========================================================================= */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl md:max-w-4xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pr-10 pb-2 border-b border-border/60">
            <DialogTitle className="text-xl font-bold flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <span>{editingEventId ? "Edit Society Event" : "Create New Society Event"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Complete the event details. Only published events will become discoverable by residents and viewable by manager & security.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEvent} className="space-y-6 pt-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Event Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-foreground">Event Name *</label>
                <Input
                  required
                  placeholder="e.g. Grand Diwali Celebration 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Venue / Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Venue / Location *</label>
                <Input
                  required
                  placeholder="e.g. Main Clubhouse Lawn & Amphitheatre"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              {/* Date, Start Time & End Time in 3 comfortable columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:col-span-2 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Event Date *</span>
                  </label>
                  <Input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 text-sm bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>Start Time *</span>
                  </label>
                  <Input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-10 text-sm bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>End Time</span>
                  </label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-10 text-sm bg-background"
                  />
                </div>
              </div>

              {/* Registration Deadline & Max Capacity */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Registration Deadline</label>
                <Input
                  type="date"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Maximum Participants</label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Leave empty for unlimited"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value ? Number(e.target.value) : "")}
                  className="h-10 text-sm"
                />
              </div>

              {/* Eligibility & Fee */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Eligibility</label>
                <select
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="All Residents">All Residents (All Towers)</option>
                  <option value="Tower A Only">Tower A Residents Only</option>
                  <option value="Tower B Only">Tower B Residents Only</option>
                  <option value="Tower C Only">Tower C Residents Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Registration Fee</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="Free">Free Pass</option>
                    <option value="Paid">Paid Entry</option>
                  </select>
                  {registrationFee === "Paid" ? (
                    <Input
                      type="number"
                      required
                      min="1"
                      placeholder="Amount ₹"
                      value={entryFee}
                      onChange={(e) => setEntryFee(e.target.value ? Number(e.target.value) : "")}
                      className="h-10 text-sm"
                    />
                  ) : (
                    <div className="h-10 px-3 flex items-center rounded-md bg-muted/40 text-muted-foreground text-xs font-medium border border-dashed border-border">
                      No charge
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Image */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-foreground">Banner Image</label>
                <Input
                  placeholder="Paste image URL or pick one of the presets below"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  className="h-10 text-sm"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {PRESET_BANNERS.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setBannerImage(preset.url)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                        bannerImage === preset.url
                          ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20"
                          : "bg-muted/50 text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <Textarea
                  rows={3}
                  placeholder="Give residents details about the event schedule, highlights, performers, and arrangements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm resize-none"
                />
              </div>

              {/* Additional Instructions / Rules */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-foreground">Additional Instructions / Guidelines</label>
                <Textarea
                  rows={3}
                  placeholder="e.g. Non-marking shoes required, traditional dress code encouraged, bring your own yoga mats..."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  className="text-sm resize-none"
                />
              </div>

              {/* Publishing Status */}
              <div className="space-y-2 md:col-span-2 pt-2 border-t border-border/60">
                <label className="text-xs font-semibold text-foreground block">Publishing Status</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setStatus("Published")}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      status === "Published"
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20"
                        : "bg-card border-border hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      checked={status === "Published"}
                      onChange={() => setStatus("Published")}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-semibold text-xs">Publish Immediately</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Instantly visible to residents for registration, and viewable by manager and security.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setStatus("Draft")}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      status === "Draft"
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-100 ring-2 ring-amber-500/20"
                        : "bg-card border-border hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      checked={status === "Draft"}
                      onChange={() => setStatus("Draft")}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="font-semibold text-xs">Save as Draft</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Private to Secretary. Hidden from residents and staff until ready.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="px-5">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2 px-6">
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {editingEventId ? "Save Changes" : status === "Published" ? "Publish Event" : "Save Draft"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* Registered Attendees Drawer/Modal */}
      {/* ========================================================================= */}
      <Dialog
        open={!!viewingRegistrationsEvent}
        onOpenChange={(open) => !open && setViewingRegistrationsEvent(null)}
      >
        <DialogContent className="sm:max-w-4xl md:max-w-5xl w-full p-6 md:p-8 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pr-16 pb-4 border-b border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <DialogTitle className="text-xl font-bold flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <span className="truncate">Registered Attendees: {viewingRegistrationsEvent?.title}</span>
              </DialogTitle>
              <Badge variant="secondary" className="text-xs px-3 py-1 font-semibold w-fit shrink-0">
                {(viewingRegistrationsEvent?.registrations || []).length} Flat{((viewingRegistrationsEvent?.registrations || []).length === 1) ? "" : "s"} Registered
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1.5">
              Review confirmed registrations, flat units, guest counts, and payment verification.
            </DialogDescription>
          </DialogHeader>

          {viewingRegistrationsEvent && (
            <div className="space-y-6 pt-4">
              {/* Event Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/40 p-5 rounded-2xl border border-border/60 text-center">
                <div className="bg-card p-3 rounded-xl border border-border/40 shadow-sm">
                  <p className="text-xs font-medium text-muted-foreground">Total Headcount</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {(viewingRegistrationsEvent.registrations || []).reduce(
                      (acc, r) => acc + 1 + (r.guestCount || 0),
                      0
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Residents & Guests</p>
                </div>
                <div className="bg-card p-3 rounded-xl border border-border/40 shadow-sm">
                  <p className="text-xs font-medium text-muted-foreground">Capacity Limit</p>
                  <p className="text-2xl font-bold mt-1">
                    {viewingRegistrationsEvent.maxParticipants || "Unlimited"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Maximum Allowed</p>
                </div>
                <div className="bg-card p-3 rounded-xl border border-border/40 shadow-sm">
                  <p className="text-xs font-medium text-muted-foreground">Revenue Collected</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    ₹
                    {(viewingRegistrationsEvent.registrations || [])
                      .reduce((acc, r) => acc + (r.paidAmount || 0), 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Entry Fees</p>
                </div>
              </div>

              {/* Table of Registrations */}
              {(viewingRegistrationsEvent.registrations || []).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs bg-muted/20 rounded-2xl border border-dashed border-border">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold text-foreground text-sm">No registrations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Residents will show here once they register for this event.</p>
                </div>
              ) : (
                <div className="border border-border/70 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className="bg-muted/70 text-muted-foreground font-semibold uppercase tracking-wider text-[11px] border-b border-border/60">
                        <tr>
                          <th className="py-3.5 px-4">Resident & Flat</th>
                          <th className="py-3.5 px-4">Contact</th>
                          <th className="py-3.5 px-4">Guests</th>
                          <th className="py-3.5 px-4">Payment Status</th>
                          <th className="py-3.5 px-4">Registered On</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {(viewingRegistrationsEvent.registrations || []).map((reg) => (
                          <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-foreground text-sm">{reg.userName}</p>
                              <p className="text-xs text-muted-foreground">Flat {reg.flatNumber || "A-202"}</p>
                            </td>
                            <td className="py-3.5 px-4 text-muted-foreground font-mono">
                              {reg.contactNumber || "N/A"}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-foreground">{reg.guestCount || 0}</span>
                                <span className="text-muted-foreground">guest{(reg.guestCount || 0) === 1 ? "" : "s"}</span>
                              </div>
                              {reg.guestNames && (
                                <p className="text-[11px] text-muted-foreground truncate max-w-[200px] mt-0.5" title={reg.guestNames}>
                                  {reg.guestNames}
                                </p>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {reg.paymentStatus === "Paid" ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs px-2.5 py-1">
                                  Paid ₹{reg.paidAmount} ({reg.paymentMethod || "UPI"})
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs px-2.5 py-1">
                                  Free Pass
                                </Badge>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-muted-foreground text-xs">
                              {new Date(reg.registeredAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* Reschedule Event Modal */}
      {/* ========================================================================= */}
      <Dialog open={!!rescheduleEvent} onOpenChange={(open) => !open && setRescheduleEvent(null)}>
        <DialogContent className="sm:max-w-lg w-full p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Reschedule Event: {rescheduleEvent?.title}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Updating event timing will automatically broadcast a notification to all registered attendees.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-medium">New Date *</label>
              <Input
                type="date"
                value={newRescheduleDate}
                onChange={(e) => setNewRescheduleDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-medium">Start Time *</label>
                <Input
                  type="time"
                  value={newRescheduleTime}
                  onChange={(e) => setNewRescheduleTime(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium">End Time</label>
                <Input
                  type="time"
                  value={newRescheduleEndTime}
                  onChange={(e) => setNewRescheduleEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-medium">Venue / Room</label>
              <Input
                value={newRescheduleVenue}
                onChange={(e) => setNewRescheduleVenue(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setRescheduleEvent(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmReschedule} className="gap-1.5">
              <Check className="w-3.5 h-3.5" />
              Confirm & Notify Attendees
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =========================================================================
// 2. RESIDENT PORTAL — Discover & Register
// =========================================================================
export function ResidentEventsView({ user }: { user: any }) {
  const {
    communityEvents, registerForEvent, cancelEventRegistration
  } = useCommunityStore(
    useShallow((state) => ({
      communityEvents: state.communityEvents || [],
      registerForEvent: state.registerForEvent,
      cancelEventRegistration: state.cancelEventRegistration
    }))
  );

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upcoming" | "ongoing" | "my-registrations" | "past">("upcoming");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Registration Checkout Modal
  const [checkoutEvent, setCheckoutEvent] = useState<CommunityEvent | null>(null);
  const [guestCount, setGuestCount] = useState(0);
  const [guestNames, setGuestNames] = useState("");
  const [contactNumber, setContactNumber] = useState(user?.phone || "9820123456");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Card" | "Net Banking">("UPI");
  const [isRegistering, setIsRegistering] = useState(false);

  // Digital Pass Modal
  const [viewingPass, setViewingPass] = useState<{ event: CommunityEvent; reg: EventRegistration } | null>(null);

  // Filter published events for residents (all non-draft, non-cancelled events)
  const publishedEvents = useMemo(() => {
    return communityEvents.filter((ev) => {
      const s = (ev.status || "Published").toLowerCase();
      return s !== "draft" && s !== "cancelled";
    });
  }, [communityEvents]);

  // Tab Filtering
  const displayedEvents = useMemo(() => {
    return publishedEvents.filter((ev) => {
      const timing = getEventTiming(ev.date);

      // Category filter
      if (selectedCategory !== "All" && ev.category !== selectedCategory) return false;

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!ev.title.toLowerCase().includes(q) && !ev.location.toLowerCase().includes(q)) return false;
      }

      if (activeTab === "upcoming") return timing === "upcoming" || timing === "ongoing";
      if (activeTab === "ongoing") return timing === "ongoing";
      if (activeTab === "past") return timing === "past";

      // "my-registrations"
      if (activeTab === "my-registrations") {
        const myReg = (ev.registrations || []).some((r) => r.userId === user?.id);
        return myReg;
      }

      return true;
    });
  }, [publishedEvents, activeTab, selectedCategory, searchQuery, user?.id]);

  // Tab counts
  const tabCounts = useMemo(() => {
    let upcoming = 0;
    let ongoing = 0;
    let myRegs = 0;
    let past = 0;

    publishedEvents.forEach((ev) => {
      const timing = getEventTiming(ev.date);
      if (timing === "upcoming" || timing === "ongoing") upcoming++;
      if (timing === "ongoing") ongoing++;
      if (timing === "past") past++;
      if ((ev.registrations || []).some((r) => r.userId === user?.id)) myRegs++;
    });

    return { upcoming, ongoing, myRegs, past };
  }, [publishedEvents, user?.id]);

  // Check if resident is already registered
  const isUserRegistered = (ev: CommunityEvent) => {
    return (ev.registrations || []).some((r) => r.userId === user?.id);
  };

  const getUserRegistration = (ev: CommunityEvent) => {
    return (ev.registrations || []).find((r) => r.userId === user?.id);
  };

  const handleOpenCheckout = (ev: CommunityEvent) => {
    // Check eligibility
    if (ev.eligibility && ev.eligibility !== "All Residents") {
      const userUnit = user?.unit || "";
      const matchesWing = ev.eligibility.includes(userUnit.charAt(0));
      if (!matchesWing) {
        alert(`Notice: This event is reserved for ${ev.eligibility}. Your unit is ${userUnit}.`);
      }
    }

    setCheckoutEvent(ev);
    setGuestCount(0);
    setGuestNames("");
    setContactNumber(user?.phone || "9820123456");
    setPaymentMethod("UPI");
  };

  const handleConfirmRegistration = async () => {
    if (!checkoutEvent) return;

    const totalTickets = 1 + guestCount;
    const feePerPerson = checkoutEvent.entryFee || 0;
    const totalPaid = feePerPerson * totalTickets;

    if (feePerPerson > 0 && totalPaid > 0) {
      savePendingGatewayCheckout({
        kind: "event-registration",
        targetId: checkoutEvent.id,
        title: checkoutEvent.title,
        subtitle: `${checkoutEvent.date}${checkoutEvent.time ? ` • ${checkoutEvent.time}` : ""} • ${checkoutEvent.location}`,
        category: "Paid Event Registration",
        amount: totalPaid,
        unit: user?.unit || "",
        building: user?.building || "",
        residentName: user?.name || "Resident",
        dueDate: checkoutEvent.date,
        returnUrl: "/society/events",
        returnLabel: "Society Events",
        eventPayload: {
          eventId: checkoutEvent.id,
          userId: user?.id || "user-resident-1",
          userName: user?.name || "Resident",
          flatNumber: user?.unit || "A-202",
          contactNumber,
          guestCount,
          guestNames,
          rsvpStatus: "Going",
          entryFee: feePerPerson,
          passCount: totalTickets,
          eventDate: checkoutEvent.date,
          eventLocation: checkoutEvent.location
        }
      });
      setCheckoutEvent(null);
      router.push("/society/payment-gateway");
      return;
    }

    setIsRegistering(true);
    try {
      await registerForEvent(checkoutEvent.id, {
        userId: user?.id || "user-resident-1",
        userName: user?.name || "Resident",
        flatNumber: user?.unit || "A-202",
        contactNumber,
        guestCount,
        guestNames,
        rsvpStatus: "Going",
        paidAmount: 0,
        paymentStatus: "Free",
        paymentMethod: null
      });

      setCheckoutEvent(null);
      alert(`Registration confirmed for "${checkoutEvent.title}"! Your digital pass has been generated.`);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = async (ev: CommunityEvent) => {
    if (window.confirm(`Are you sure you want to cancel your registration for "${ev.title}"? Your spot will be released.`)) {
      await cancelEventRegistration(ev.id, user?.id || "user-resident-1");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Society Events & Gatherings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover cultural festivals, sports tournaments, workshops, and society community programs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: "upcoming", label: `Upcoming Events (${tabCounts.upcoming})` },
            { id: "ongoing", label: `Happening Today (${tabCounts.ongoing})` },
            { id: "my-registrations", label: `My Registrations (${tabCounts.myRegs})` },
            { id: "past", label: `Past Events (${tabCounts.past})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-8 px-2 rounded-md border border-input bg-background text-xs"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Events */}
      {displayedEvents.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-base">No events in this section</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {activeTab === "my-registrations"
              ? "You haven't registered for any events yet. Check out the 'Upcoming Events' tab to discover exciting programs!"
              : "There are currently no events matching this category."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedEvents.map((ev) => {
            const regs = ev.registrations || [];
            const registeredCount = regs.reduce((sum, r) => sum + 1 + (r.guestCount || 0), 0);
            const isFull = ev.maxParticipants ? registeredCount >= ev.maxParticipants : false;
            const capPercent = ev.maxParticipants ? Math.min(100, Math.round((registeredCount / ev.maxParticipants) * 100)) : 0;
            const registered = isUserRegistered(ev);
            const userReg = getUserRegistration(ev);
            const isDeadlinePassed = ev.registrationDeadline && new Date(ev.registrationDeadline) < new Date();

            return (
              <Card key={ev.id} className="overflow-hidden flex flex-col border-border/60 hover:shadow-md transition-shadow">
                {/* Banner */}
                <div className="relative h-44 w-full bg-muted overflow-hidden">
                  <img
                    src={ev.bannerImage || PRESET_BANNERS[0].url}
                    alt={ev.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <Badge className="bg-black/60 text-white backdrop-blur-md text-[10px] border-none">
                      {ev.category || "General"}
                    </Badge>
                    {registered && (
                      <Badge className="bg-emerald-500 text-white text-[10px] border-none font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Registered
                      </Badge>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-black/60 text-white backdrop-blur-md text-[10px] border-white/20">
                      {ev.entryFee && ev.entryFee > 0 ? `₹${ev.entryFee} / person` : "Free Entry"}
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-base line-clamp-1">{ev.title}</h3>
                    <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {ev.date} • {ev.time} {ev.endTime ? `- ${ev.endTime}` : ""}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate font-medium">{ev.location}</span>
                    </div>

                    <p className="text-muted-foreground line-clamp-2 text-xs">
                      {ev.description || "Join us for this exciting society program."}
                    </p>

                    {/* Eligibility & Capacity */}
                    <div className="pt-1 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{ev.eligibility || "All Residents"}</span>
                        <span>{registeredCount} / {ev.maxParticipants || "∞"} spots filled</span>
                      </div>
                      {ev.maxParticipants && (
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              capPercent >= 90 ? "bg-rose-500" : capPercent >= 70 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${capPercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-border/50 flex flex-col gap-2">
                    {registered && userReg ? (
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          className="w-full text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => setViewingPass({ event: ev, reg: userReg })}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          View Digital Entry Pass
                        </Button>
                        <div className="flex items-center justify-between text-[11px]">
                          <button
                            onClick={() => {
                              setSelectedEvent(ev);
                              setShowDetailModal(true);
                            }}
                            className="text-primary hover:underline font-medium"
                          >
                            View Event Details
                          </button>
                          <button
                            onClick={() => handleCancelRegistration(ev)}
                            className="text-rose-600 hover:underline font-medium"
                          >
                            Cancel Registration
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => {
                            setSelectedEvent(ev);
                            setShowDetailModal(true);
                          }}
                        >
                          Details
                        </Button>

                        {isFull ? (
                          <Button size="sm" disabled className="flex-1 text-xs bg-muted text-muted-foreground">
                            Sold Out
                          </Button>
                        ) : isDeadlinePassed ? (
                          <Button size="sm" disabled className="flex-1 text-xs bg-muted text-muted-foreground">
                            Closed
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1 text-xs gap-1"
                            onClick={() => handleOpenCheckout(ev)}
                          >
                            {ev.entryFee && ev.entryFee > 0 ? (
                              <>
                                <CreditCard className="w-3.5 h-3.5" />
                                Register & Pay
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Register Free
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Event Details Dialog */}
      {/* ========================================================================= */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl w-full p-6 max-h-[85vh] overflow-y-auto">
          {selectedEvent && (
            <div className="space-y-4">
              <div className="relative h-48 -mx-6 -mt-6 mb-2 overflow-hidden bg-muted">
                <img
                  src={selectedEvent.bannerImage || PRESET_BANNERS[0].url}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <Badge className="bg-primary/90 text-white text-[10px] mb-1">
                    {selectedEvent.category}
                  </Badge>
                  <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Date & Timing</p>
                      <p className="font-semibold">{selectedEvent.date} • {selectedEvent.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Venue</p>
                      <p className="font-semibold">{selectedEvent.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-semibold text-foreground">About This Event</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {selectedEvent.additionalInstructions && (
                  <div className="space-y-1 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-amber-800 dark:text-amber-300">
                    <h4 className="font-semibold flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      Important Guidelines & Instructions
                    </h4>
                    <p className="text-[11px] leading-relaxed">
                      {selectedEvent.additionalInstructions}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] border-t">
                  <div>
                    <span className="text-muted-foreground">Eligibility: </span>
                    <span className="font-medium">{selectedEvent.eligibility || "All Residents"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Entry Fee: </span>
                    <span className="font-medium">
                      {selectedEvent.entryFee && selectedEvent.entryFee > 0
                        ? `₹${selectedEvent.entryFee} / person`
                        : "Free of charge"}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3 border-t">
                <Button variant="outline" size="sm" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
                {!isUserRegistered(selectedEvent) && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenCheckout(selectedEvent);
                    }}
                  >
                    Proceed to Register
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* Registration & Payment Checkout Dialog */}
      {/* ========================================================================= */}
      <Dialog open={!!checkoutEvent} onOpenChange={(open) => !open && setCheckoutEvent(null)}>
        <DialogContent className="sm:max-w-xl w-full p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Event Registration: {checkoutEvent?.title}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm your registration details. A digital pass with QR code will be generated immediately.
            </DialogDescription>
          </DialogHeader>

          {checkoutEvent && (
            <div className="space-y-4 py-2 text-xs">
              {/* Resident Info Pill */}
              <div className="bg-muted/40 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">Resident Details</p>
                  <p className="font-bold">{user?.name || "Resident"}</p>
                </div>
                <Badge variant="outline">
                  Flat {user?.unit || "A-202"}
                </Badge>
              </div>

              {/* Contact Number */}
              <div className="space-y-1">
                <label className="font-medium">Contact Phone Number *</label>
                <Input
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="10-digit mobile number"
                />
              </div>

              {/* Guest Count */}
              <div className="space-y-1">
                <label className="font-medium">Additional Family Members / Guests</label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs"
                >
                  <option value={0}>Only Self (1 Participant)</option>
                  <option value={1}>Self + 1 Guest (2 Participants)</option>
                  <option value={2}>Self + 2 Guests (3 Participants)</option>
                  <option value={3}>Self + 3 Guests (4 Participants)</option>
                </select>
              </div>

              {guestCount > 0 && (
                <div className="space-y-1">
                  <label className="font-medium">Guest Full Names</label>
                  <Input
                    placeholder="e.g. Priya Shah, Rohan Shah"
                    value={guestNames}
                    onChange={(e) => setGuestNames(e.target.value)}
                  />
                </div>
              )}

              {/* Paid Event Integration */}
              {checkoutEvent.entryFee && checkoutEvent.entryFee > 0 ? (
                <div className="space-y-3 pt-2 border-t">
                  <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Registration Fee:</span>
                      <span>₹{checkoutEvent.entryFee} × {1 + guestCount} ticket(s)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold border-t border-primary/20 pt-1.5">
                      <span>Total Payable Amount:</span>
                      <span className="text-primary">₹{(checkoutEvent.entryFee * (1 + guestCount)).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 flex items-start gap-2.5 text-[11px] text-indigo-700 dark:text-indigo-300">
                    <Shield className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
                    <span>
                      You will be securely redirected to <strong>HomeVerse SecurePay Gateway</strong> to pay via UPI, Card, Net Banking or Wallet. Registration confirms immediately upon payment.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    Free Society Pass
                  </p>
                  <p className="text-[11px] mt-0.5">
                    This community event is complimentary for all society residents.
                  </p>
                </div>
              )}

              <DialogFooter className="pt-3 border-t">
                <Button variant="outline" size="sm" onClick={() => setCheckoutEvent(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isRegistering}
                  onClick={handleConfirmRegistration}
                  className="gap-1.5"
                >
                  {isRegistering ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : checkoutEvent.entryFee && checkoutEvent.entryFee > 0 ? (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      Proceed to Gateway (₹{(checkoutEvent.entryFee * (1 + guestCount)).toLocaleString()})
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Confirm Free Pass
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* Digital Event Pass Card Modal */}
      {/* ========================================================================= */}
      <Dialog open={!!viewingPass} onOpenChange={(open) => !open && setViewingPass(null)}>
        <DialogContent className="max-w-sm p-0 overflow-hidden border-none shadow-2xl bg-transparent">
          {viewingPass && (
            <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-indigo-600 p-5 text-white text-center relative">
                <Badge className="bg-white/20 text-white border-none text-[10px] mb-1">
                  OFFICIAL EVENT ENTRY PASS
                </Badge>
                <h3 className="font-bold text-lg leading-tight line-clamp-1">{viewingPass.event.title}</h3>
                <p className="text-xs text-white/80 mt-1">Sunshine Complex Community Event</p>
              </div>

              {/* Pass Body */}
              <div className="p-5 space-y-4 text-center">
                {/* QR Code Container */}
                <div className="bg-white p-3 rounded-2xl inline-block shadow-sm border border-slate-200">
                  <QRCodeSVG
                    value={JSON.stringify({
                      passId: viewingPass.reg.id,
                      eventId: viewingPass.event.id,
                      eventTitle: viewingPass.event.title,
                      residentName: viewingPass.reg.userName,
                      flatNumber: viewingPass.reg.flatNumber || "A-202",
                      guestCount: viewingPass.reg.guestCount || 0,
                    })}
                    size={160}
                    level="H"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-bold text-sm text-foreground">{viewingPass.reg.userName}</p>
                  <p className="text-muted-foreground font-medium">Flat {viewingPass.reg.flatNumber || "A-202"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Pass ID: <span className="font-mono text-foreground font-semibold">{viewingPass.reg.id}</span>
                  </p>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-left bg-muted/40 p-3 rounded-xl text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Date</span>
                    <span className="font-semibold">{viewingPass.event.date}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Timing</span>
                    <span className="font-semibold">{viewingPass.event.time}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-border/40">
                    <span className="text-muted-foreground block text-[10px]">Venue</span>
                    <span className="font-semibold truncate block">{viewingPass.event.location}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-border/40 flex justify-between">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Admit Count</span>
                      <span className="font-semibold">1 + {viewingPass.reg.guestCount || 0} Guest(s)</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Pass Status</span>
                      <Badge className="bg-emerald-500 text-white text-[10px] border-none">
                        Confirmed
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-1 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs gap-1"
                    onClick={() => {
                      alert("Digital pass card downloaded to device.");
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs gap-1"
                    onClick={() => setViewingPass(null)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =========================================================================
// 3. MANAGER PORTAL — View Only (Operations Visibility)
// =========================================================================
export function ManagerEventsView({ user }: { user: any }) {
  const { communityEvents } = useCommunityStore(
    useShallow((state) => ({
      communityEvents: state.communityEvents || []
    }))
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Manager ONLY sees published events
  const publishedEvents = useMemo(() => {
    return communityEvents.filter((ev) => {
      const s = (ev.status || "Published").toLowerCase();
      return s !== "draft" && s !== "cancelled";
    });
  }, [communityEvents]);

  const filteredEvents = useMemo(() => {
    return publishedEvents.filter((ev) => {
      if (selectedCategory !== "All" && ev.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!ev.title.toLowerCase().includes(q) && !ev.location.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [publishedEvents, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Society Events Schedule</h1>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
              Manager Operations (Read-Only)
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Society events timeline for facility management, ground operations, and facility preparation.
          </p>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-xl text-blue-800 dark:text-blue-300 text-xs flex items-center gap-3">
        <Info className="w-4 h-4 shrink-0 text-blue-600" />
        <span>
          <strong>Operational Notice:</strong> Event management, registrations, and cancellations are administered exclusively by the Society Secretary. The Manager view provides facility status and attendance awareness.
        </span>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search event name or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-8 px-2 rounded-md border border-input bg-background text-xs w-full md:w-auto"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-base">No published events</h3>
          <p className="text-xs text-muted-foreground mt-1">
            There are currently no published events scheduled on society grounds.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((ev) => {
            const regs = ev.registrations || [];
            const registeredCount = regs.reduce((sum, r) => sum + 1 + (r.guestCount || 0), 0);
            const timing = getEventTiming(ev.date);

            return (
              <Card key={ev.id} className="overflow-hidden flex flex-col border-border/60">
                <div className="relative h-40 w-full bg-muted overflow-hidden">
                  <img
                    src={ev.bannerImage || PRESET_BANNERS[0].url}
                    alt={ev.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge className="bg-black/60 text-white backdrop-blur-md text-[10px] border-none">
                      {ev.category || "General"}
                    </Badge>
                    <Badge className={`text-[10px] border-none ${
                      timing === "ongoing" ? "bg-amber-500 text-white" : timing === "upcoming" ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                    }`}>
                      {timing === "ongoing" ? "Today" : timing === "upcoming" ? "Upcoming" : "Past"}
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-base line-clamp-1">{ev.title}</h3>
                    <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {ev.date} • {ev.time} {ev.endTime ? `- ${ev.endTime}` : ""}
                    </p>
                  </div>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate font-medium">{ev.location}</span>
                    </div>

                    <p className="text-muted-foreground line-clamp-2 text-xs">
                      {ev.description || "Society gathering and program."}
                    </p>

                    <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Registered Residents</span>
                        <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3 text-primary" />
                          {registeredCount} / {ev.maxParticipants || "Unlimited"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Eligibility</span>
                        <span className="font-medium text-foreground block mt-0.5 truncate">
                          {ev.eligibility || "All Residents"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// 4. SECURITY PORTAL — View Only (Gate Roster)
// =========================================================================
export function SecurityEventsView({ user }: { user: any }) {
  const { communityEvents } = useCommunityStore(
    useShallow((state) => ({
      communityEvents: state.communityEvents || []
    }))
  );

  const [searchQuery, setSearchQuery] = useState("");

  // Security ONLY sees published events
  const publishedEvents = useMemo(() => {
    return communityEvents.filter((ev) => {
      const s = (ev.status || "Published").toLowerCase();
      return s !== "draft" && s !== "cancelled";
    });
  }, [communityEvents]);

  const filteredEvents = useMemo(() => {
    return publishedEvents.filter((ev) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!ev.title.toLowerCase().includes(q) && !ev.location.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [publishedEvents, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Society Events Roster</h1>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
            Security Gate Desk (Read-Only)
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Daily event schedule for gate security awareness, crowd monitoring, and parking coordination.
        </p>
      </div>

      {/* Security Info Banner */}
      <div className="bg-muted/60 border border-border/80 p-3.5 rounded-xl text-xs flex items-center gap-3">
        <Shield className="w-4 h-4 text-primary shrink-0" />
        <span>
          <strong>Gate Guard Information:</strong> This roster displays published society events to assist with parking traffic, venue access, and visitor inflow. No attendee check-in or verification duties are required.
        </span>
      </div>

      <div className="relative w-full md:w-80">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter by event name or venue..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 pl-8 text-xs"
        />
      </div>

      {/* Schedule Cards */}
      {filteredEvents.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-base">No active events scheduled</h3>
          <p className="text-xs text-muted-foreground mt-1">
            No events are registered on the society grounds today.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((ev) => {
            const timing = getEventTiming(ev.date);
            const regs = ev.registrations || [];
            const registeredCount = regs.reduce((sum, r) => sum + 1 + (r.guestCount || 0), 0);

            return (
              <Card key={ev.id} className="p-4 border-border/60 hover:shadow-sm transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0">
                      <CalendarIcon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-foreground">{ev.title}</h3>
                        <Badge className={`text-[10px] border-none ${
                          timing === "ongoing" ? "bg-amber-500 text-white" : timing === "upcoming" ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                        }`}>
                          {timing === "ongoing" ? "Happening Today" : timing === "upcoming" ? "Upcoming" : "Past"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {ev.date} • {ev.time} {ev.endTime ? `- ${ev.endTime}` : ""}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          {ev.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security Overview */}
                  <div className="flex items-center gap-4 text-xs bg-muted/30 px-3.5 py-2 rounded-xl border border-border/40">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Expected Crowd</span>
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        ~{registeredCount} attendees
                      </span>
                    </div>

                    <div className="border-l border-border/50 pl-4">
                      <span className="text-[10px] text-muted-foreground block">Category</span>
                      <span className="font-medium text-foreground">
                        {ev.category || "General"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
