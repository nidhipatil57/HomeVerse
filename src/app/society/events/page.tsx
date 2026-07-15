"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar as CalendarIcon, Heart, MapPin, Users, Check, Filter, Info, 
  ChevronLeft, ChevronRight, Image as ImageIcon, MessageSquare, Star, 
  CheckCircle, AlertCircle, Clock, X, UserPlus, ShieldAlert, BookOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore, CommunityEvent } from "@/lib/store/useCommunityStore";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function EventsPage() {
  const { user, initialize } = useAuth();
  const {
    communityEvents, rsvpEvent, registerForEvent, volunteerForEvent, submitEventFeedback, voteInPoll, initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      communityEvents: state.communityEvents || [],
      rsvpEvent: state.rsvpEvent,
      registerForEvent: state.registerForEvent,
      volunteerForEvent: state.volunteerForEvent,
      submitEventFeedback: state.submitEventFeedback,
      voteInPoll: state.voteInPoll,
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "ongoing" | "past" | "my-events" | "calendar" | "gallery">("upcoming");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // Detail Modal
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Registration Form
  const [guestCount, setGuestCount] = useState(0);
  const [guestNames, setGuestNames] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [registering, setRegistering] = useState(false);

  // Volunteer Form
  const [selectedRole, setSelectedRole] = useState("Decoration");
  const [volunteering, setVolunteering] = useState(false);

  // Feedback Form
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSuggestions, setFeedbackSuggestions] = useState("");
  const [wouldAttendAgain, setWouldAttendAgain] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"month" | "week" | "agenda">("month");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  // Filter Categories
  const categories = [
    "All", "Festival", "Sports", "Community Meeting", "Cultural", "Workshop", 
    "Health Camp", "Kids Activity", "Women", "Senior Citizens", "Emergency", 
    "Celebration", "Awareness Drive", "Community Service", "Other"
  ];

  // Helper date logic
  const now = new Date();
  const getEventDate = (dateStr: string, timeStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const [hour, minute] = timeStr.split(":").map(Number);
      return new Date(year, month - 1, day, hour || 0, minute || 0);
    } catch (e) {
      return new Date(dateStr);
    }
  };

  // Filter events by tab & category
  const filteredEvents = communityEvents.filter((ev) => {
    if (selectedCategory !== "All" && ev.category !== selectedCategory) return false;
    const evDateStart = getEventDate(ev.date, ev.time);
    const evDateEnd = ev.endTime ? getEventDate(ev.date, ev.endTime) : new Date(evDateStart.getTime() + 2 * 60 * 60 * 1000);

    if (activeTab === "upcoming") {
      return evDateStart > now && ev.status !== "Cancelled";
    }
    if (activeTab === "ongoing") {
      return evDateStart <= now && evDateEnd >= now && ev.status !== "Cancelled";
    }
    if (activeTab === "past") {
      return evDateEnd < now || ev.status === "Cancelled";
    }
    if (activeTab === "my-events") {
      return ev.registrations?.some(r => r.userId === user?.id) || ev.rsvps?.some(r => r.userId === user?.id);
    }
    return true;
  });

  // Handle RSVP
  const handleRsvp = async (eventId: string, status: string) => {
    await rsvpEvent(eventId, status);
    if (selectedEvent && selectedEvent.id === eventId) {
      const refreshed = communityEvents.find(e => e.id === eventId);
      if (refreshed) setSelectedEvent(refreshed);
    }
  };

  // Handle Event Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setRegistering(true);
    try {
      await registerForEvent(selectedEvent.id, {
        guestCount,
        guestNames,
        contactNumber: contactNumber || user?.phone || "",
        rsvpStatus: "Going"
      });
      const refreshed = communityEvents.find(e => e.id === selectedEvent.id);
      if (refreshed) setSelectedEvent(refreshed);
      setGuestCount(0);
      setGuestNames("");
      alert("Registration Successful!");
    } catch (err) {
      alert("Registration failed. Maximum capacity reached.");
    } finally {
      setRegistering(false);
    }
  };

  // Handle Volunteer Signup
  const handleVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setVolunteering(true);
    try {
      await volunteerForEvent(selectedEvent.id, {
        role: selectedRole,
        contactNumber: user?.phone || ""
      });
      const refreshed = communityEvents.find(e => e.id === selectedEvent.id);
      if (refreshed) setSelectedEvent(refreshed);
      alert("Thank you for volunteering! Your assignment has been logged.");
    } catch (err) {
      alert("Failed to volunteer.");
    } finally {
      setVolunteering(false);
    }
  };

  // Handle Feedback Submission
  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setSubmittingFeedback(true);
    try {
      await submitEventFeedback(selectedEvent.id, {
        rating,
        comment: feedbackComment,
        suggestions: feedbackSuggestions,
        wouldAttendSimilar: wouldAttendAgain
      });
      const refreshed = communityEvents.find(e => e.id === selectedEvent.id);
      if (refreshed) setSelectedEvent(refreshed);
      setFeedbackComment("");
      setFeedbackSuggestions("");
      alert("Thank you for your feedback!");
    } catch (err) {
      alert("Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Calendar Math
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const arr = [];
    // Add empty padding for previous month offset
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let i = 1; i <= days; i++) arr.push(new Date(year, month, i));
    return arr;
  };

  const getDaysInWeek = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const sunday = new Date(date.setDate(diff));
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(sunday);
      nextDay.setDate(sunday.getDate() + i);
      arr.push(nextDay);
    }
    return arr;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
            Society Events Hub 🎪
          </h1>
          <p className="text-muted-foreground text-xs lg:text-sm mt-1">
            Browse, register, volunteer, and RSVP to community festivals, sports tournaments, and general body meetups
          </p>
        </div>
      </div>

      {/* Main Tab Lists & Category Selector */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2 bg-secondary/30 p-1.5 rounded-xl border border-border/30 w-fit">
          {[
            { id: "upcoming", label: "Upcoming Events" },
            { id: "ongoing", label: "Ongoing Events" },
            { id: "past", label: "Past Events" },
            { id: "my-events", label: "My Registrations" },
            { id: "calendar", label: "Calendar View" },
            { id: "gallery", label: "Memories Gallery" }
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-lg h-9 text-xs font-semibold px-4 border-0 shadow-none ${
                activeTab === tab.id
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-transparent text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Categories Bar */}
        {activeTab !== "calendar" && activeTab !== "gallery" && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1 shrink-0"><Filter className="w-3.5 h-3.5" /> Filter:</span>
            {categories.map((cat) => (
              <Badge
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer text-[10px] py-1 px-3 border transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                    : "bg-background text-muted-foreground border-border hover:bg-secondary/10"
                }`}
              >
                {cat}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* RENDER SECTIONS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + "-" + selectedCategory}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="space-y-6"
        >
          {/* 1. CARDS VIEW (Upcoming, Ongoing, Past, My Events) */}
          {(activeTab === "upcoming" || activeTab === "ongoing" || activeTab === "past" || activeTab === "my-events") && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => {
                const userRegistration = ev.registrations?.find(r => r.userId === user?.id);
                const userRsvp = ev.rsvps?.find(r => r.userId === user?.id);
                const totalParticipants = ev.registrations?.reduce((acc, curr) => acc + 1 + curr.guestCount, 0) || 0;
                const availableSlots = ev.maxParticipants ? Math.max(0, ev.maxParticipants - totalParticipants) : null;
                const isCancelled = ev.status === "Cancelled";

                return (
                  <motion.div key={ev.id} variants={fadeInUp}>
                    <Card className={`overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full relative ${isCancelled ? "opacity-75" : ""}`}>
                      {/* Banner Image */}
                      <div className="aspect-[16/9] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 relative flex items-center justify-center border-b border-border/20 overflow-hidden">
                        {ev.bannerImage ? (
                          <img src={ev.bannerImage} alt={ev.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center space-y-1">
                            <CalendarIcon className="w-10 h-10 text-primary/45 mx-auto" />
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{ev.category}</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex gap-1">
                          <Badge variant={ev.priority === "urgent" ? "destructive" : ev.priority === "important" ? "default" : "secondary"} className="text-[9px] font-bold uppercase">
                            {ev.priority}
                          </Badge>
                          {isCancelled && (
                            <Badge variant="destructive" className="text-[9px] font-bold uppercase">
                              Cancelled
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-bold text-base leading-tight line-clamp-1">{ev.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{ev.description}</p>
                        </div>

                        {/* Timing / Venue / Capacity */}
                        <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span>{ev.date} • {ev.time} {ev.endTime ? `to ${ev.endTime}` : ""}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span>
                              {totalParticipants} attending
                              {availableSlots !== null && ` (${availableSlots} slots left)`}
                            </span>
                          </div>
                          {ev.entryFee && (
                            <Badge variant="outline" className="text-emerald-600 bg-emerald-500/5 border-emerald-500/20 text-[9px] font-bold mt-1">
                              Entry Fee: ₹{ev.entryFee}
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => {
                              setSelectedEvent(ev);
                              setShowDetailsModal(true);
                            }}
                            className="flex-1 rounded-xl h-9.5 text-xs font-bold bg-secondary hover:bg-secondary/70 text-foreground border-0"
                          >
                            View Details
                          </Button>
                          
                          {ev.registrationRequired && !isCancelled && activeTab !== "past" && (
                            <Button
                              onClick={() => {
                                setSelectedEvent(ev);
                                setShowDetailsModal(true);
                              }}
                              className={`flex-1 rounded-xl h-9.5 text-xs font-bold border-0 ${
                                userRegistration
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                  : "gradient-primary text-white"
                              }`}
                            >
                              {userRegistration ? "✓ Registered" : "Register"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
              {filteredEvents.length === 0 && (
                <div className="sm:col-span-2 lg:col-span-3 text-center py-20 text-muted-foreground border rounded-2xl bg-secondary/5 text-xs">
                  No community events found in this category.
                </div>
              )}
            </div>
          )}

          {/* 2. CALENDAR VIEW */}
          {activeTab === "calendar" && (
            <Card className="border-border/50">
              <CardHeader className="pb-3 border-b border-border/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-indigo-500" />
                    Interactive Society Calendar
                  </CardTitle>
                  <CardDescription>Visual scheduler for community halls and grounds</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-secondary/30 p-1 rounded-lg border text-xs gap-1">
                    {["month", "week", "agenda"].map((v) => (
                      <button
                        key={v}
                        onClick={() => setCalendarView(v as any)}
                        className={`px-3 py-1.5 rounded-md font-semibold capitalize ${
                          calendarView === v ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const next = new Date(currentDate);
                        if (calendarView === "month") next.setMonth(currentDate.getMonth() - 1);
                        else next.setDate(currentDate.getDate() - 7);
                        setCurrentDate(next);
                      }}
                      className="w-8 h-8 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-bold font-[family-name:var(--font-heading)] min-w-[90px] text-center">
                      {calendarView === "month"
                        ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                        : `Week of ${currentDate.getDate()} ${monthNames[currentDate.getMonth()].slice(0, 3)}`}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const next = new Date(currentDate);
                        if (calendarView === "month") next.setMonth(currentDate.getMonth() + 1);
                        else next.setDate(currentDate.getDate() + 7);
                        setCurrentDate(next);
                      }}
                      className="w-8 h-8 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {calendarView === "month" && (
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="text-[10px] font-bold text-muted-foreground py-2 border-b uppercase">{d}</div>
                    ))}
                    {getDaysInMonth(currentDate).map((day, i) => {
                      if (!day) return <div key={`empty-${i}`} className="aspect-square bg-secondary/5 rounded-lg border border-transparent"></div>;
                      const dateStr = day.toISOString().split("T")[0];
                      const dayEvents = communityEvents.filter(e => e.date === dateStr);
                      const isToday = day.toDateString() === new Date().toDateString();

                      return (
                        <div key={dateStr} className={`aspect-square p-1 rounded-lg border border-border/20 text-left flex flex-col justify-between transition-colors hover:bg-secondary/15 ${isToday ? "bg-indigo-500/5 border-indigo-500/30" : "bg-card"}`}>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full w-fit ${isToday ? "bg-indigo-600 text-white" : "text-foreground"}`}>
                            {day.getDate()}
                          </span>
                          <div className="space-y-0.5 overflow-y-auto max-h-[70%] select-none">
                            {dayEvents.map(e => (
                              <div
                                key={e.id}
                                onClick={() => {
                                  setSelectedEvent(e);
                                  setShowDetailsModal(true);
                                }}
                                className="text-[8px] font-bold px-1 py-0.5 rounded bg-indigo-500/10 text-indigo-600 truncate cursor-pointer hover:bg-indigo-500/20"
                              >
                                {e.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {calendarView === "week" && (
                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInWeek(currentDate).map((day) => {
                      const dateStr = day.toISOString().split("T")[0];
                      const dayEvents = communityEvents.filter(e => e.date === dateStr);
                      const isToday = day.toDateString() === new Date().toDateString();

                      return (
                        <div key={dateStr} className={`min-h-[150px] p-2.5 rounded-xl border ${isToday ? "bg-indigo-500/5 border-indigo-500/30" : "border-border/30 bg-card"} flex flex-col`}>
                          <div className="border-b pb-1.5 mb-2 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{day.toLocaleDateString("en-US", { weekday: "short" })}</span>
                            <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-full ${isToday ? "bg-indigo-600 text-white" : ""}`}>{day.getDate()}</span>
                          </div>
                          <div className="flex-1 space-y-1.5">
                            {dayEvents.map(e => (
                              <div
                                key={e.id}
                                onClick={() => {
                                  setSelectedEvent(e);
                                  setShowDetailsModal(true);
                                }}
                                className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/15 cursor-pointer hover:bg-indigo-500/20 transition-all text-[9px] font-bold text-indigo-600 space-y-0.5"
                              >
                                <div className="truncate">{e.title}</div>
                                <div className="text-[7.5px] text-indigo-500/80">{e.time}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {calendarView === "agenda" && (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {communityEvents
                      .filter(e => new Date(e.date) >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1))
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(e => (
                        <div
                          key={e.id}
                          onClick={() => {
                            setSelectedEvent(e);
                            setShowDetailsModal(true);
                          }}
                          className="p-3 rounded-xl border border-border/40 hover:bg-secondary/10 transition-all flex justify-between items-center cursor-pointer text-xs"
                        >
                          <div className="flex gap-4 items-center">
                            <div className="text-center bg-indigo-500/10 text-indigo-600 rounded-lg p-2 min-w-[50px]">
                              <div className="text-[9px] font-bold uppercase">{new Date(e.date).toLocaleDateString("en-US", { month: "short" })}</div>
                              <div className="text-base font-extrabold leading-none">{new Date(e.date).getDate()}</div>
                            </div>
                            <div>
                              <h4 className="font-bold text-foreground">{e.title}</h4>
                              <p className="text-[10px] text-muted-foreground">{e.location} • {e.time}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[9px] font-semibold">{e.category}</Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 3. MEMORIES GALLERY */}
          {activeTab === "gallery" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {communityEvents.flatMap(e => (e.gallery || []).map(photo => ({ ...photo, eventTitle: e.title }))).map((pic, i) => (
                <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-border/50 bg-secondary/15 hover:shadow-md transition-all">
                  <img src={pic.imageUrl} alt="Memory" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-[10px] text-white">
                    <span className="font-bold text-white line-clamp-1">{pic.eventTitle}</span>
                    <span className="text-[8px] text-white/70">Uploaded {new Date(pic.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {communityEvents.every(e => !e.gallery || e.gallery.length === 0) && (
                <div className="col-span-full text-center py-20 text-muted-foreground text-xs border rounded-2xl bg-secondary/5">
                  No memory snaps uploaded yet. Gallery will unlock as past events finish.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* EVENT DETAILS MODAL (RSVP, REGISTRATION, VOLUNTEERING, POLLS, FEEDBACK) */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <div className="space-y-5">
              {/* Banner Image */}
              <div className="aspect-[21/9] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 relative rounded-xl overflow-hidden border border-border/20 flex items-center justify-center">
                {selectedEvent.bannerImage ? (
                  <img src={selectedEvent.bannerImage} alt={selectedEvent.title} className="w-full h-full object-cover" />
                ) : (
                  <CalendarIcon className="w-12 h-12 text-primary/45" />
                )}
                <div className="absolute top-3 right-3 flex gap-1">
                  <Badge className="text-[9px] font-bold uppercase bg-indigo-600 text-white">{selectedEvent.category}</Badge>
                  {selectedEvent.status === "Cancelled" && (
                    <Badge variant="destructive" className="text-[9px] font-bold uppercase">Cancelled</Badge>
                  )}
                </div>
              </div>

              {/* Title & Core Metadata */}
              <div>
                <DialogTitle className="font-[family-name:var(--font-heading)] text-xl font-bold">{selectedEvent.title}</DialogTitle>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-indigo-500" /> {selectedEvent.date} • {selectedEvent.time} {selectedEvent.endTime ? `to ${selectedEvent.endTime}` : ""}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-indigo-500" /> {selectedEvent.location}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-foreground">About the Event</h4>
                <p className="text-muted-foreground leading-relaxed">{selectedEvent.description}</p>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-2 gap-4 border-t pt-4 text-xs">
                <div>
                  <span className="font-semibold text-muted-foreground block">Organizer</span>
                  <span className="text-foreground font-medium">{selectedEvent.organizer}</span>
                </div>
                {selectedEvent.contactPerson && (
                  <div>
                    <span className="font-semibold text-muted-foreground block">Contact Coordinator</span>
                    <span className="text-foreground font-medium">{selectedEvent.contactPerson} ({selectedEvent.contactNumber})</span>
                  </div>
                )}
                {selectedEvent.rules && (
                  <div className="col-span-2 space-y-1 mt-1">
                    <span className="font-semibold text-muted-foreground block">Event Guidelines / Rules</span>
                    <p className="text-muted-foreground bg-secondary/20 p-2.5 rounded-lg border">{selectedEvent.rules}</p>
                  </div>
                )}
                {selectedEvent.thingsToBring && (
                  <div className="col-span-2 space-y-1">
                    <span className="font-semibold text-muted-foreground block">Things to Bring</span>
                    <p className="text-muted-foreground bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10 text-amber-600 font-medium">{selectedEvent.thingsToBring}</p>
                  </div>
                )}
              </div>

              {/* TABBED INTERACTIVE ACTIONS (Only if event is active & upcoming/ongoing) */}
              {selectedEvent.status !== "Cancelled" && (
                <div className="border-t pt-4 space-y-4">
                  {/* RSVP RSVP STATUS BAR */}
                  {new Date(selectedEvent.date) >= now && (
                    <div className="bg-secondary/20 p-3.5 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h5 className="text-xs font-bold text-foreground">Are you going?</h5>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Let organizers estimate logistics</p>
                      </div>
                      <div className="flex gap-1.5">
                        {["Going", "Maybe", "Not Going"].map((status) => {
                          const hasRsvped = selectedEvent.rsvps?.find(r => r.userId === user?.id && r.status === status);
                          return (
                            <Button
                              key={status}
                              onClick={() => handleRsvp(selectedEvent.id, status)}
                              className={`h-8 text-[10px] font-semibold px-3 rounded-lg border border-border/40 ${
                                hasRsvped
                                  ? status === "Going" ? "bg-emerald-600 text-white hover:bg-emerald-700" :
                                    status === "Maybe" ? "bg-amber-600 text-white hover:bg-amber-700" :
                                    "bg-red-600 text-white hover:bg-red-700"
                                  : "bg-white hover:bg-secondary/30 text-foreground"
                              }`}
                            >
                              {status}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ACTIVE POLLS SECTION */}
                  {selectedEvent.polls && selectedEvent.polls.filter(p => p.status === "Open").length > 0 && (
                    <div className="space-y-3 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">
                      <h5 className="text-xs font-bold text-indigo-600 flex items-center gap-1"><Info className="w-4 h-4" /> Active Event Polls</h5>
                      {selectedEvent.polls.filter(p => p.status === "Open").map((poll) => {
                        const totalVotes = poll.votes?.length || 0;
                        const userVote = poll.votes?.find(v => v.userId === user?.id);

                        return (
                          <div key={poll.id} className="space-y-2 text-xs">
                            <p className="font-bold text-foreground">{poll.question}</p>
                            <div className="space-y-1.5">
                              {poll.options.map((opt) => {
                                const optionVotes = poll.votes?.filter(v => v.option === opt).length || 0;
                                const pct = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                                const isSelected = userVote?.option === opt;

                                return (
                                  <div
                                    key={opt}
                                    onClick={() => voteInPoll(poll.id, opt).then(() => {
                                      const r = communityEvents.find(e => e.id === selectedEvent.id);
                                      if (r) setSelectedEvent(r);
                                    })}
                                    className={`relative p-2.5 rounded-lg border cursor-pointer hover:bg-indigo-500/10 transition-colors flex justify-between items-center ${
                                      isSelected ? "border-indigo-500 bg-indigo-500/5" : "border-border/30"
                                    }`}
                                  >
                                    <div className="absolute left-0 top-0 bottom-0 bg-indigo-500/10 rounded-l-lg transition-all" style={{ width: `${pct}%` }}></div>
                                    <span className="font-semibold text-foreground relative z-10">{opt} {isSelected && "🎯"}</span>
                                    <span className="text-[10px] text-muted-foreground font-bold relative z-10">{pct}% ({optionVotes} votes)</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* REGISTRATION FORM */}
                  {selectedEvent.registrationRequired && new Date(selectedEvent.date) >= now && (
                    <div className="border-t pt-4 space-y-3">
                      <h5 className="text-xs font-bold text-foreground">Reserve Seat / Register</h5>
                      {selectedEvent.registrations?.some(r => r.userId === user?.id) ? (
                        <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 flex items-center gap-2 text-emerald-600 text-xs">
                          <CheckCircle className="w-5 h-5 shrink-0" />
                          <div>
                            <span className="font-bold">You are registered!</span>
                            <span className="block text-[10px] text-muted-foreground mt-0.5">
                              Guests: {selectedEvent.registrations?.find(r => r.userId === user?.id)?.guestCount} • Status: Going
                            </span>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleRegister} className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground block mb-1">Bringing Guests? (Count)</label>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              value={guestCount}
                              onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                              className="h-9 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground block mb-1">Contact Number</label>
                            <Input
                              placeholder="Phone number"
                              value={contactNumber}
                              onChange={(e) => setContactNumber(e.target.value)}
                              className="h-9 rounded-lg"
                              required
                            />
                          </div>
                          {guestCount > 0 && (
                            <div className="col-span-2">
                              <label className="text-[10px] font-bold text-muted-foreground block mb-1">Guest Names (Optional)</label>
                              <Input
                                placeholder="comma separated guest names"
                                value={guestNames}
                                onChange={(e) => setGuestNames(e.target.value)}
                                className="h-9 rounded-lg"
                              />
                            </div>
                          )}
                          <Button type="submit" disabled={registering} className="col-span-2 h-9 rounded-lg gradient-primary text-white border-0 font-bold">
                            {registering ? "Registering..." : "Confirm Seat Reservation"}
                          </Button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* VOLUNTEER FORM */}
                  {selectedEvent.volunteerRequired && new Date(selectedEvent.date) >= now && (
                    <div className="border-t pt-4 space-y-3">
                      <h5 className="text-xs font-bold text-foreground">Volunteer for Duty</h5>
                      {selectedEvent.volunteers?.some(v => v.userId === user?.id) ? (
                        <div className="bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 flex items-center gap-2 text-indigo-600 text-xs">
                          <CheckCircle className="w-5 h-5 shrink-0" />
                          <div>
                            <span className="font-bold">You are a confirmed volunteer!</span>
                            <span className="block text-[10px] text-muted-foreground mt-0.5">
                              Assigned Role: {selectedEvent.volunteers?.find(v => v.userId === user?.id)?.role}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleVolunteer} className="flex gap-2 text-xs">
                          <div className="flex-1">
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              className="w-full h-9 px-3 border border-border rounded-lg bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              {["Decoration", "Registration Desk", "Food Distribution", "Games", "Photography", "Medical Help", "Cleaning", "Logistics"].map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          </div>
                          <Button type="submit" disabled={volunteering} className="h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white border-0 font-bold px-5">
                            {volunteering ? "Saving..." : "Apply to Volunteer"}
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* POST-EVENT FEEDBACK FORM (Only for past events that resident registered/RSVPed for) */}
              {new Date(selectedEvent.date) < now && (
                <div className="border-t pt-4 space-y-4">
                  <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-indigo-500" /> Share Event Feedback</h5>
                  {selectedEvent.feedbacks?.some(f => f.userId === user?.id) ? (
                    <div className="bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-500/10 text-emerald-600 text-xs space-y-1">
                      <div className="flex items-center gap-1 font-bold">
                        <CheckCircle className="w-4.5 h-4.5 shrink-0" /> Feedback Submitted
                      </div>
                      <div className="text-muted-foreground text-[10px]">
                        Rating: {"★".repeat(selectedEvent.feedbacks.find(f => f.userId === user?.id)?.rating || 0)} • Thanks for helping us improve!
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedback} className="space-y-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-muted-foreground">Overall Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setRating(star)}
                              className="text-lg hover:scale-110 transition-transform"
                            >
                              {star <= rating ? (
                                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                              ) : (
                                <Star className="w-5 h-5 text-muted-foreground/45" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-1">How was the event? (Comment)</label>
                          <Input
                            placeholder="Brief comments..."
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            className="h-9 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-1">Suggestions</label>
                          <Input
                            placeholder="What can be improved?"
                            value={feedbackSuggestions}
                            onChange={(e) => setFeedbackSuggestions(e.target.value)}
                            className="h-9 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="attendAgain"
                          checked={wouldAttendAgain}
                          onChange={(e) => setWouldAttendAgain(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-border"
                        />
                        <label htmlFor="attendAgain" className="text-[11px] font-semibold text-muted-foreground select-none">I would attend similar events in the future</label>
                      </div>

                      <Button type="submit" disabled={submittingFeedback} className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white border-0 font-bold">
                        {submittingFeedback ? "Submitting..." : "Submit Review"}
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowDetailsModal(false)} className="w-full h-10 bg-secondary hover:bg-secondary/70 text-foreground border-0 rounded-xl font-bold text-xs">
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
