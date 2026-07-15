"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, Plus, MapPin, Users, PlusCircle, Trash, DollarSign, BarChart3, 
  Check, X, Image as ImageIcon, MessageSquare, Star, ArrowDownToLine, 
  HelpCircle, UserCheck, Shield, Sparkles, ClipboardList, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useCommunityStore, CommunityEvent } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";

export default function SecretaryEventsMgmtPage() {
  const { user, initialize } = useAuth();
  const {
    communityEvents, createEvent, updateEventDetails, cancelEvent, 
    markEventAttendance, uploadEventPhoto, createEventPoll, logEventExpense, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      communityEvents: state.communityEvents || [],
      createEvent: state.createEvent,
      updateEventDetails: state.updateEventDetails,
      cancelEvent: state.cancelEvent,
      markEventAttendance: state.markEventAttendance,
      uploadEventPhoto: state.uploadEventPhoto,
      createEventPoll: state.createEventPoll,
      logEventExpense: state.logEventExpense,
      initializeDb: state.initializeDb
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<"list" | "create" | "manage">("list");
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  // Create Event Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Festival");
  const [bannerImage, setBannerImage] = useState("");
  const [endTime, setEndTime] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [entryFee, setEntryFee] = useState("");
  const [registrationRequired, setRegistrationRequired] = useState(true);
  const [volunteerRequired, setVolunteerRequired] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [rules, setRules] = useState("");
  const [thingsToBring, setThingsToBring] = useState("");
  const [budget, setBudget] = useState("");

  // Managing Event sub-tab
  const [manageSubTab, setManageSubTab] = useState<"registrations" | "volunteers" | "attendance" | "expenses" | "gallery" | "polls" | "analytics">("registrations");

  // New Expense Form
  const [expenseCategory, setExpenseCategory] = useState("Decoration");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseDate, setExpenseDate] = useState("");

  // New Poll Form
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // Local Banner File Upload Handler
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Local Gallery Photo Upload Handler
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedEventId) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await uploadEventPhoto(selectedEventId, reader.result as string);
        alert("Photo uploaded to event gallery!");
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  // Find active selected event
  const activeEvent = communityEvents.find(e => e.id === selectedEventId) || communityEvents[0];

  // Set selected event ID if not set
  if (!selectedEventId && communityEvents.length > 0) {
    setSelectedEventId(communityEvents[0].id);
  }

  // Create Event Handler
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time || !location) return;

    await createEvent({
      title,
      description,
      date,
      time,
      location,
      organizer: user?.name || "Secretary",
      priority: "normal",
      category,
      bannerImage: bannerImage || undefined,
      endTime: endTime || undefined,
      contactPerson: contactPerson || undefined,
      contactNumber: contactNumber || undefined,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
      registrationDeadline: registrationDeadline || undefined,
      entryFee: entryFee ? parseFloat(entryFee) : undefined,
      registrationRequired,
      volunteerRequired,
      visibility,
      rules: rules || undefined,
      thingsToBring: thingsToBring || undefined,
      budget: budget ? parseFloat(budget) : undefined
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setLocation("");
    setBannerImage("");
    setEndTime("");
    setContactPerson("");
    setContactNumber("");
    setMaxParticipants("");
    setRegistrationDeadline("");
    setEntryFee("");
    setRules("");
    setThingsToBring("");
    setBudget("");
    setRegistrationRequired(true);
    setVolunteerRequired(false);

    alert("Event published successfully to resident nodes!");
    setActiveViewTab("list");
  };

  // Add Poll Option
  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  // Remove Poll Option
  const removePollOption = (idx: number) => {
    setPollOptions(pollOptions.filter((_, i) => i !== idx));
  };

  // Handle Poll Submission
  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion || pollOptions.filter(o => o.trim()).length < 2) {
      alert("Please enter a question and at least 2 options.");
      return;
    }
    await createEventPoll(selectedEventId, pollQuestion, pollOptions.filter(o => o.trim()));
    setPollQuestion("");
    setPollOptions(["", ""]);
    alert("Poll created successfully!");
  };

  // Handle Expense Submission
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseDate) return;
    await logEventExpense(selectedEventId, {
      category: expenseCategory,
      amount: parseFloat(expenseAmount),
      description: expenseDesc,
      date: expenseDate
    });
    setExpenseAmount("");
    setExpenseDesc("");
    setExpenseDate("");
    alert("Expense logged successfully!");
  };

  // Export Participant List (Simulate CSV download)
  const exportParticipants = (event: CommunityEvent) => {
    if (!event.registrations || event.registrations.length === 0) {
      alert("No participants registered yet.");
      return;
    }
    const headers = ["Name", "Flat/Unit", "Contact", "Guests", "Guest Names", "RSVP Status", "Registration Date"];
    const rows = event.registrations.map(r => [
      r.userName,
      r.flatNumber || "N/A",
      r.contactNumber || "N/A",
      r.guestCount,
      `"${r.guestNames || ""}"`,
      r.rsvpStatus,
      new Date(r.registeredAt).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event.title.replace(/\s+/g, "_")}_Participants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Event category options
  const eventCategories = [
    "Festival", "Sports", "Community Meeting", "Cultural", "Workshop", 
    "Health Camp", "Kids Activity", "Women", "Senior Citizens", "Emergency", 
    "Celebration", "Awareness Drive", "Community Service", "Other"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            Events Coordinator Desk 🎪
          </h1>
          <p className="text-muted-foreground text-xs lg:text-sm mt-1">
            Configure society festivals, manage general body AGM committee meetups, track attendance, and analyze community participation
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            onClick={() => setActiveViewTab("list")}
            className={`rounded-xl h-10 text-xs font-semibold px-4 border-0 ${
              activeViewTab === "list" ? "bg-indigo-600 text-white" : "bg-secondary text-foreground hover:bg-secondary/75"
            }`}
          >
            All Events
          </Button>
          <Button
            onClick={() => setActiveViewTab("create")}
            className={`rounded-xl h-10 text-xs font-semibold px-4 border-0 ${
              activeViewTab === "create" ? "bg-indigo-600 text-white" : "bg-secondary text-foreground hover:bg-secondary/75"
            }`}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Publish New Event
          </Button>
          {communityEvents.length > 0 && (
            <Button
              onClick={() => {
                if (communityEvents.length > 0 && !selectedEventId) {
                  setSelectedEventId(communityEvents[0].id);
                }
                setActiveViewTab("manage");
              }}
              className={`rounded-xl h-10 text-xs font-semibold px-4 border-0 ${
                activeViewTab === "manage" ? "bg-indigo-600 text-white" : "bg-secondary text-foreground hover:bg-secondary/75"
              }`}
            >
              <ClipboardList className="w-4 h-4 mr-1.5" /> Manage Live Event
            </Button>
          )}
        </div>
      </div>

      {/* 1. LIST VIEW */}
      {activeViewTab === "list" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-3 border-border/50">
            <CardHeader className="pb-3 border-b border-border/20 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  Rosters & Gated Society Activities
                </CardTitle>
                <CardDescription>Rosters and RSVP numbers</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {communityEvents.map((ev) => {
                const totalParticipants = ev.registrations?.reduce((acc, curr) => acc + 1 + curr.guestCount, 0) || 0;
                const isCancelled = ev.status === "Cancelled";

                return (
                  <div key={ev.id} className={`p-4 rounded-xl border border-border/50 hover:bg-secondary/5 transition-all text-xs flex justify-between items-center gap-4 ${isCancelled ? "opacity-75 bg-red-500/5" : "bg-card"}`}>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{ev.title}</span>
                        <Badge className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold">
                          {ev.category}
                        </Badge>
                        {isCancelled && (
                          <Badge variant="destructive" className="text-[9px] font-bold">
                            Cancelled
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-[11px] line-clamp-1">{ev.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground pt-1">
                        <span>Date: {ev.date} • {ev.time}</span>
                        <span>Location: {ev.location}</span>
                        <span>Budget: ₹{ev.budget || 0}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedEventId(ev.id);
                          setActiveViewTab("manage");
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-8 text-[10px] font-bold border-0"
                      >
                        Manage
                      </Button>
                      {!isCancelled && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            if (confirm("Are you sure you want to cancel this event? All registered residents will be notified.")) {
                              await cancelEvent(ev.id);
                              alert("Event cancelled and notifications dispatched.");
                            }
                          }}
                          className="text-red-500 border-red-500/20 hover:bg-red-500/10 rounded-lg h-8 text-[10px] font-bold"
                        >
                          Cancel Event
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {communityEvents.length === 0 && (
                <div className="text-center py-20 text-muted-foreground text-xs">
                  No community events scheduled.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. CREATE EVENT VIEW */}
      {activeViewTab === "create" && (
        <Card className="border-border/50 max-w-3xl mx-auto">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-500" />
              Publish Gated Community Event
            </CardTitle>
            <CardDescription>Setup details, rules, budgets, and volunteer guidelines</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Event Title / Name</label>
                  <Input placeholder="e.g. Navratri Dandiya Night" value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 border border-border rounded-xl bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {eventCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">Event Banner Photo (Compulsory upload from computer)</label>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border/70 hover:bg-secondary/20 cursor-pointer transition-colors relative h-12">
                  <ImageIcon className="w-5 h-5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">
                    {bannerImage ? "Banner image selected" : "Click to select a banner photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleBannerUpload}
                  />
                </div>
                {bannerImage && (
                  <div className="relative w-40 h-20 rounded-xl overflow-hidden border border-border/60 mt-2">
                    <img src={bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setBannerImage("")}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">Event Description</label>
                <Textarea placeholder="Agenda, timings, catering, guest performers..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[80px] text-xs rounded-xl" required />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Event Date</label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Start Time</label>
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">End Time</label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-10 text-xs rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Location Venue</label>
                  <Input placeholder="e.g. Central Lawn / Clubroom A" value={location} onChange={(e) => setLocation(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Budget Allocated (₹)</label>
                  <Input placeholder="e.g. 50000" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="h-10 text-xs rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Contact Coordinator</label>
                  <Input placeholder="Rohan Mehra" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="h-10 text-xs rounded-xl" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Contact Number</label>
                  <Input placeholder="9876543210" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="h-10 text-xs rounded-xl" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Maximum Seats (Optional)</label>
                  <Input placeholder="No limit" type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} className="h-10 text-xs rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Entry Fee (₹, Optional)</label>
                  <Input placeholder="Free" type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} className="h-10 text-xs rounded-xl" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Registration Deadline</label>
                  <Input type="date" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} className="h-10 text-xs rounded-xl" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Event Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full h-10 px-3 border border-border rounded-xl bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="public">Public (All Residents)</option>
                    <option value="private">Private (Committee Only)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-secondary/10 p-3 rounded-xl border border-border/30">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="regRequired"
                    checked={registrationRequired}
                    onChange={(e) => setRegistrationRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-border"
                  />
                  <label htmlFor="regRequired" className="text-[11px] font-semibold text-muted-foreground select-none">Require seat booking / registration</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="volRequired"
                    checked={volunteerRequired}
                    onChange={(e) => setVolunteerRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-border"
                  />
                  <label htmlFor="volRequired" className="text-[11px] font-semibold text-muted-foreground select-none">Require resident volunteers</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Event Rules / Guidelines</label>
                  <Textarea placeholder="e.g. Outside guests must purchase tickets. Traditional attire preferred." value={rules} onChange={(e) => setRules(e.target.value)} className="min-h-[60px] text-xs rounded-xl" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">Things to Bring</label>
                  <Textarea placeholder="e.g. ID card, water bottles, sports racket" value={thingsToBring} onChange={(e) => setThingsToBring(e.target.value)} className="min-h-[60px] text-xs rounded-xl" />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl gradient-primary text-white border-0 font-bold shadow-md text-xs">
                Publish Event & Dispatch Notifications
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 3. MANAGE LIVE EVENT VIEW */}
      {activeViewTab === "manage" && activeEvent && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Panel: Event Selector */}
          <Card className="lg:col-span-3 border-border/50 h-fit">
            <CardHeader className="pb-3 border-b border-border/20">
              <CardTitle className="text-sm font-bold">Select Active Event</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1">
              {communityEvents.map(e => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEventId(e.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedEventId === e.id ? "bg-indigo-600 text-white" : "text-muted-foreground hover:bg-secondary/40"
                  }`}
                >
                  {e.title}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Right Panel: Operations Console */}
          <Card className="lg:col-span-9 border-border/50">
            <CardHeader className="pb-3 border-b border-border/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Management Console: {activeEvent.title}
                </CardTitle>
                <CardDescription>Date: {activeEvent.date} | Venue: {activeEvent.location}</CardDescription>
              </div>
              <div className="flex bg-secondary/30 p-1 rounded-lg border text-xs gap-1">
                {[
                  { id: "registrations", label: "Registrations" },
                  { id: "volunteers", label: "Volunteers" },
                  { id: "attendance", label: "Attendance" },
                  { id: "expenses", label: "Expenses" },
                  { id: "gallery", label: "Gallery" },
                  { id: "polls", label: "Polls" },
                  { id: "analytics", label: "Analytics" }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setManageSubTab(s.id as any)}
                    className={`px-3 py-1.5 rounded-md font-semibold capitalize ${
                      manageSubTab === s.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {/* SUB-TAB 1: REGISTRATIONS */}
              {manageSubTab === "registrations" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-foreground">Registered Participants list</h4>
                    <Button
                      onClick={() => exportParticipants(activeEvent)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-8 text-[10px] font-bold border-0"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5 mr-1" /> Export CSV List
                    </Button>
                  </div>
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-secondary/40 border-b text-muted-foreground text-left">
                          <th className="p-3 font-semibold">Resident Name</th>
                          <th className="p-3 font-semibold">Flat/Unit</th>
                          <th className="p-3 font-semibold">Contact</th>
                          <th className="p-3 font-semibold">Guests</th>
                          <th className="p-3 font-semibold">Guest Names</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {activeEvent.registrations?.map((r, i) => (
                          <tr key={i} className="hover:bg-secondary/5 text-foreground">
                            <td className="p-3 font-bold">{r.userName}</td>
                            <td className="p-3">{r.flatNumber || "N/A"}</td>
                            <td className="p-3">{r.contactNumber || "N/A"}</td>
                            <td className="p-3">{r.guestCount}</td>
                            <td className="p-3 text-muted-foreground">{r.guestNames || "None"}</td>
                          </tr>
                        ))}
                        {(!activeEvent.registrations || activeEvent.registrations.length === 0) && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">No registrations logged yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: VOLUNTEERS */}
              {manageSubTab === "volunteers" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-foreground">Volunteer Duty Allocations</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {["Decoration", "Registration Desk", "Food Distribution", "Games", "Photography", "Medical Help", "Cleaning", "Logistics"].map((role) => {
                      const roleVols = activeEvent.volunteers?.filter(v => v.role === role) || [];
                      return (
                        <Card key={role} className="border-border/30 bg-secondary/5">
                          <CardHeader className="p-3 border-b bg-secondary/15 flex flex-row justify-between items-center">
                            <span className="text-[11px] font-extrabold text-foreground">{role}</span>
                            <Badge className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[9px] font-bold">
                              {roleVols.length} Assigned
                            </Badge>
                          </CardHeader>
                          <CardContent className="p-3 space-y-2 text-[10px]">
                            {roleVols.map((v, i) => (
                              <div key={i} className="flex justify-between items-center border-b pb-1.5 last:border-0 last:pb-0">
                                <div>
                                  <span className="font-bold text-foreground block">{v.volunteerName} (Flat {v.flatNumber})</span>
                                  <span className="text-muted-foreground text-[8px]">{v.contactNumber}</span>
                                </div>
                                <span className="text-muted-foreground text-[8.5px]">{new Date(v.volunteeredAt).toLocaleDateString()}</span>
                              </div>
                            ))}
                            {roleVols.length === 0 && (
                              <div className="text-center py-4 text-muted-foreground text-[10px]">No volunteers assigned.</div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: ATTENDANCE TRACKER */}
              {manageSubTab === "attendance" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-foreground">Mark Gated Attendance</h4>
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-secondary/40 border-b text-muted-foreground text-left">
                          <th className="p-3 font-semibold">Resident Name</th>
                          <th className="p-3 font-semibold">Flat/Unit</th>
                          <th className="p-3 font-semibold">RSVP Status</th>
                          <th className="p-3 font-semibold text-right">Attendance Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {activeEvent.registrations?.map((r) => {
                          const isCheckedIn = activeEvent.attendance?.some(a => a.userId === r.userId);
                          return (
                            <tr key={r.id} className="hover:bg-secondary/5 text-foreground">
                              <td className="p-3 font-bold">{r.userName}</td>
                              <td className="p-3">{r.flatNumber || "N/A"}</td>
                              <td className="p-3">
                                <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[8px] font-bold">
                                  Going
                                </Badge>
                              </td>
                              <td className="p-3 text-right">
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    await markEventAttendance(activeEvent.id, r.userId, !isCheckedIn);
                                  }}
                                  className={`rounded-lg h-7 px-3 text-[9px] font-bold border-0 ${
                                    isCheckedIn 
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                                      : "bg-secondary hover:bg-secondary/70 text-foreground"
                                  }`}
                                >
                                  {isCheckedIn ? "Checked In ✓" : "Mark Present"}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                        {(!activeEvent.registrations || activeEvent.registrations.length === 0) && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-muted-foreground text-xs">No registered participants to mark.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: EXPENSES LOG */}
              {manageSubTab === "expenses" && (
                <div className="grid lg:grid-cols-12 gap-6">
                  {/* Left: Log Expense */}
                  <div className="lg:col-span-5 space-y-3">
                    <h4 className="text-xs font-bold text-foreground">Log New Expense</h4>
                    <form onSubmit={handleAddExpense} className="space-y-3.5 bg-secondary/5 p-4 border rounded-xl">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block mb-1">Expense Category</label>
                        <select
                          value={expenseCategory}
                          onChange={(e) => setExpenseCategory(e.target.value)}
                          className="w-full h-9 px-3 border border-border rounded-lg bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {["Decoration", "Food", "Stage", "Prizes", "Electricity", "Cleaning", "Miscellaneous"].map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block mb-1">Amount (₹)</label>
                        <Input placeholder="e.g. 15000" type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} className="h-9 rounded-lg" required />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block mb-1">Log Date</label>
                        <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="h-9 rounded-lg" required />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block mb-1">Notes / Description</label>
                        <Input placeholder="Details..." value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} className="h-9 rounded-lg" />
                      </div>
                      <Button type="submit" className="w-full h-9 rounded-lg gradient-primary text-white border-0 font-bold">
                        Add Expense Entry
                      </Button>
                    </form>
                  </div>

                  {/* Right: Budget Meter & list */}
                  <div className="lg:col-span-7 space-y-4">
                    <h4 className="text-xs font-bold text-foreground">Budget Audit Log</h4>
                    {(() => {
                      const totalExp = activeEvent.expenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
                      const balance = (activeEvent.budget || 0) - totalExp;
                      const pct = activeEvent.budget ? Math.min(100, Math.round((totalExp / activeEvent.budget) * 100)) : 0;

                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-3 text-center text-xs">
                            <div className="bg-secondary/30 p-2.5 rounded-xl border">
                              <span className="text-[9px] text-muted-foreground font-bold uppercase block">Budget</span>
                              <span className="text-sm font-extrabold text-foreground">₹{activeEvent.budget || 0}</span>
                            </div>
                            <div className="bg-red-500/5 p-2.5 rounded-xl border border-red-500/10">
                              <span className="text-[9px] text-muted-foreground font-bold uppercase block text-red-500">Expended</span>
                              <span className="text-sm font-extrabold text-red-600">₹{totalExp}</span>
                            </div>
                            <div className={`p-2.5 rounded-xl border ${balance >= 0 ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10"}`}>
                              <span className="text-[9px] text-muted-foreground font-bold uppercase block">Balance</span>
                              <span className={`text-sm font-extrabold ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>₹{balance}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {activeEvent.expenses?.map((exp, i) => (
                              <div key={i} className="p-3 rounded-xl border border-border/30 bg-card flex justify-between items-center text-xs">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-foreground">{exp.category}</span>
                                    <span className="text-[9px] text-muted-foreground">{exp.date}</span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{exp.description || "No notes logged"}</p>
                                </div>
                                <span className="font-bold text-red-600">-₹{exp.amount}</span>
                              </div>
                            ))}
                            {(!activeEvent.expenses || activeEvent.expenses.length === 0) && (
                              <div className="text-center py-10 text-muted-foreground text-xs">No expenses logged.</div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* SUB-TAB 5: GALLERY MANAGER */}
              {manageSubTab === "gallery" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Roster Media Gallery</h4>
                      <p className="text-muted-foreground text-[10px] mt-0.5">Upload photos from today's celebration to publish to residents</p>
                    </div>
                    <div className="relative">
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-9 text-xs font-bold border-0 px-4">
                        Upload Event Image
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleGalleryUpload}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 pt-2">
                    {activeEvent.gallery?.map((photo, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border/50 bg-secondary/10">
                        <img src={photo.imageUrl} alt="Gallery" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[8px] py-0.5 px-1.5 rounded-full font-bold">
                          Snap {i + 1}
                        </span>
                      </div>
                    ))}
                    {(!activeEvent.gallery || activeEvent.gallery.length === 0) && (
                      <div className="col-span-full text-center py-20 text-muted-foreground text-xs border border-dashed rounded-2xl">
                        No photos uploaded to this event yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-TAB 6: POLLS CREATOR */}
              {manageSubTab === "polls" && (
                <div className="grid lg:grid-cols-12 gap-6">
                  {/* Left: Create Poll */}
                  <div className="lg:col-span-5 space-y-3">
                    <h4 className="text-xs font-bold text-foreground">Launch Event Poll</h4>
                    <form onSubmit={handleCreatePoll} className="space-y-3.5 bg-secondary/5 p-4 border rounded-xl">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block mb-1">Poll Question</label>
                        <Input placeholder="e.g. Choose Ganesh Theme" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} className="h-9 rounded-lg" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground block">Choices/Options</label>
                        {pollOptions.map((opt, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              placeholder={`Option ${idx + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const next = [...pollOptions];
                                next[idx] = e.target.value;
                                setPollOptions(next);
                              }}
                              className="h-9 rounded-lg flex-1"
                              required
                            />
                            {pollOptions.length > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => removePollOption(idx)}
                                className="h-9 w-9 rounded-lg text-red-500 border-red-500/20"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addPollOption} className="w-full h-8 text-[10px] font-bold rounded-lg border-dashed">
                          + Add Option
                        </Button>
                      </div>
                      <Button type="submit" className="w-full h-9 rounded-lg gradient-primary text-white border-0 font-bold">
                        Launch Live Poll
                      </Button>
                    </form>
                  </div>

                  {/* Right: Live Poll results */}
                  <div className="lg:col-span-7 space-y-4">
                    <h4 className="text-xs font-bold text-foreground">Live Poll Roster</h4>
                    <div className="space-y-3">
                      {activeEvent.polls?.map((poll) => {
                        const totalVotes = poll.votes?.length || 0;
                        return (
                          <div key={poll.id} className="p-3.5 rounded-xl border border-border/40 bg-card text-xs space-y-2.5">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-foreground">{poll.question}</span>
                              <Badge className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[8px] font-bold">
                                {poll.status}
                              </Badge>
                            </div>
                            <div className="space-y-1.5">
                              {poll.options.map((opt) => {
                                const optionVotes = poll.votes?.filter(v => v.option === opt).length || 0;
                                const pct = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                                return (
                                  <div key={opt} className="space-y-1">
                                    <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                                      <span>{opt}</span>
                                      <span>{pct}% ({optionVotes} votes)</span>
                                    </div>
                                    <div className="w-full h-2 bg-secondary/40 rounded-full overflow-hidden">
                                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }}></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      {(!activeEvent.polls || activeEvent.polls.length === 0) && (
                        <div className="text-center py-10 text-muted-foreground text-xs">No polls created for this event.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 7: ANALYTICS */}
              {manageSubTab === "analytics" && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {(() => {
                      const totalReg = activeEvent.registrations?.reduce((acc, curr) => acc + 1 + curr.guestCount, 0) || 0;
                      const attendanceCount = activeEvent.attendance?.length || 0;
                      const attendanceRate = totalReg > 0 ? Math.round((attendanceCount / totalReg) * 100) : 0;
                      const avgFeedback = activeEvent.feedbacks && activeEvent.feedbacks.length > 0
                        ? (activeEvent.feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / activeEvent.feedbacks.length).toFixed(1)
                        : "N/A";

                      return (
                        <>
                          <Card className="border-border/30 shadow-none bg-secondary/5">
                            <CardContent className="p-4 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                <Users className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-base font-bold text-foreground">{totalReg}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold">Total Registered</p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="border-border/30 shadow-none bg-secondary/5">
                            <CardContent className="p-4 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                <UserCheck className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-base font-bold text-foreground">{attendanceCount}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold">Attendance count</p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="border-border/30 shadow-none bg-secondary/5">
                            <CardContent className="p-4 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                <BarChart3 className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-base font-bold text-foreground">{attendanceRate}%</p>
                                <p className="text-[10px] text-muted-foreground font-semibold">Attendance Rate</p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="border-border/30 shadow-none bg-secondary/5">
                            <CardContent className="p-4 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                <Star className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-base font-bold text-foreground">{avgFeedback} ★</p>
                                <p className="text-[10px] text-muted-foreground font-semibold">Average Rating</p>
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      );
                    })()}
                  </div>

                  {/* Feedback Comments */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-foreground">Resident Reviews & Comments</h4>
                    <div className="space-y-2">
                      {activeEvent.feedbacks?.map((f, i) => (
                        <div key={i} className="p-3 rounded-xl border border-border/30 bg-card text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-foreground">{f.userName}</span>
                            <span className="text-amber-500">{"★".repeat(f.rating)}</span>
                          </div>
                          {f.comment && <p className="text-muted-foreground text-[10.5px]">" {f.comment} "</p>}
                          {f.suggestions && <p className="text-indigo-600 text-[10px] font-semibold">Suggestion: {f.suggestions}</p>}
                        </div>
                      ))}
                      {(!activeEvent.feedbacks || activeEvent.feedbacks.length === 0) && (
                        <div className="text-center py-6 text-muted-foreground text-xs">No reviews submitted yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
