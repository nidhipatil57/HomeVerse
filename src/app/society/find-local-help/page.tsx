"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Star, Search, PhoneCall, ShieldCheck, CalendarRange, Clock, CheckCircle2,
  Heart, MessageSquare, ChevronRight, SlidersHorizontal, AlertTriangle,
  Award, ThumbsUp, Send, Loader2, ImagePlus, User, CalendarDays, MapPin, X, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function CommunityServiceMarketplace() {
  const { user, initialize } = useAuth();
  const {
    workerProfiles,
    serviceCategories,
    serviceBookings,
    favoriteWorkers,
    chatMessages,
    createBooking,
    updateBookingStatus,
    submitReview,
    toggleFavorite,
    sendChatMessage,
    fetchChatMessages,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      workerProfiles: state.workerProfiles || [],
      serviceCategories: state.serviceCategories || [],
      serviceBookings: state.serviceBookings || [],
      favoriteWorkers: state.favoriteWorkers || [],
      chatMessages: state.chatMessages || [],
      createBooking: state.createBooking,
      updateBookingStatus: state.updateBookingStatus,
      submitReview: state.submitReview,
      toggleFavorite: state.toggleFavorite,
      sendChatMessage: state.sendChatMessage,
      fetchChatMessages: state.fetchChatMessages,
      initializeDb: state.initializeDb
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGroup, setSelectedGroup] = useState("All"); // Home Services, Repairs, Other Services
  const [sortBy, setSortBy] = useState("rating"); // rating, price_low, price_high, experience
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterAvailable, setFilterAvailable] = useState(false);

  // Modals & Panels State
  const [activeWorkerProfile, setActiveWorkerProfile] = useState<any>(null);
  const [bookingWorker, setBookingWorker] = useState<any>(null);
  const [chattingWorker, setChattingWorker] = useState<any>(null);
  const [reviewBooking, setReviewBooking] = useState<any>(null);

  // Form states
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00 AM");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Review states
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewPhoto, setReviewPhoto] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // Chat states
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  // Auto-fill resident address from profile
  useEffect(() => {
    if (user) {
      setBookingAddress(`${user.building || "A Wing"}, Flat ${user.unit || "204"}`);
    }
  }, [user]);

  // Fetch messages in real-time when chatting
  useEffect(() => {
    let interval: any;
    if (chattingWorker) {
      fetchChatMessages(chattingWorker.id);
      interval = setInterval(() => {
        fetchChatMessages(chattingWorker.id);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [chattingWorker, fetchChatMessages]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);



  // Process lists
  const categoriesList = serviceCategories;

  const quickAccessButtons = [
    { icon: "⚡", label: "Electrician" },
    { icon: "💧", label: "Plumber" },
    { icon: "🧹", label: "Maid" },
    { icon: "🍳", label: "Cook" },
    { icon: "🔨", label: "Carpenter" },
    { icon: "🌿", label: "Gardener" }
  ];

  // Filters logic
  const filteredWorkers = useMemo(() => {
    return workerProfiles
      .filter((w) => {
        // Categorization & Group filters
        const matchesCategory = selectedCategory === "All" || w.workerCategory === selectedCategory;
        
        let matchesGroup = true;
        if (selectedGroup !== "All") {
          const categoryObj = categoriesList.find((c) => c.name === w.workerCategory);
          matchesGroup = categoryObj?.parentGroup === selectedGroup;
        }

        // Search text filter
        const matchesSearch =
          w.name.toLowerCase().includes(search.toLowerCase()) ||
          (w.workerCategory && w.workerCategory.toLowerCase().includes(search.toLowerCase())) ||
          (w.specializations && w.specializations.some((s: string) => s.toLowerCase().includes(search.toLowerCase())));

        // Verified checkboxes
        const matchesVerified =
          !filterVerified ||
          (w.workerProfile?.isSocietyVerified || w.workerProfile?.isPoliceVerified);

        // Availability status check
        const matchesAvailability =
          !filterAvailable || w.availability === "Available";

        return matchesCategory && matchesGroup && matchesSearch && matchesVerified && matchesAvailability;
      })
      .sort((a, b) => {
        if (sortBy === "rating") {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (sortBy === "price_low") {
          return (a.workerProfile?.visitCharge || 0) - (b.workerProfile?.visitCharge || 0);
        }
        if (sortBy === "price_high") {
          return (b.workerProfile?.visitCharge || 0) - (a.workerProfile?.visitCharge || 0);
        }
        if (sortBy === "experience") {
          const expA = parseInt(a.workerProfile?.experienceYears || 0);
          const expB = parseInt(b.workerProfile?.experienceYears || 0);
          return expB - expA;
        }
        return 0;
      });
  }, [workerProfiles, selectedCategory, selectedGroup, search, filterVerified, filterAvailable, sortBy, categoriesList]);

  // Bookmarks check
  const favWorkerIds = favoriteWorkers.map((f: any) => f.workerId);
  const bookmarkedWorkers = workerProfiles.filter((w) => favWorkerIds.includes(w.id));

  // Chat message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chattingWorker) return;

    setSendingMessage(true);
    try {
      await sendChatMessage({
        receiverId: chattingWorker.id,
        message: chatInput
      });
      setChatInput("");
      fetchChatMessages(chattingWorker.id);
    } catch (e) {
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Booking submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime || !bookingWorker) return;

    setBookingLoading(true);
    try {
      await createBooking({
        workerId: bookingWorker.id,
        category: bookingWorker.workerCategory,
        bookingDate,
        bookingTime,
        address: bookingAddress,
        notes: bookingNotes
      });
      alert(`Booking request submitted to ${bookingWorker.name}!`);
      setBookingWorker(null);
      setBookingNotes("");
    } catch (e) {
      alert("Failed to submit booking");
    } finally {
      setBookingLoading(false);
    }
  };

  // Review submit
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;

    setReviewLoading(true);
    try {
      await submitReview({
        bookingId: reviewBooking.id,
        rating: reviewStars,
        reviewText,
        photos: reviewPhoto ? [reviewPhoto] : []
      });
      alert("Thank you for your rating & review!");
      setReviewBooking(null);
      setReviewText("");
      setReviewPhoto("");
    } catch (e) {
      alert("Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  // Rebook helper
  const handleRebook = (booking: any) => {
    const worker = workerProfiles.find((w) => w.id === booking.workerId);
    if (worker) {
      setBookingWorker(worker);
    } else {
      alert("Worker details are currently unavailable.");
    }
  };

  // Estimated Arrival time calculation for emergency section
  const emergencyETA = (category: string) => {
    switch (category) {
      case "Electrician": return "12 mins";
      case "Plumber": return "18 mins";
      case "Locksmith": return "8 mins";
      default: return "15 mins";
    }
  };

  const getAvailabilityDot = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-500";
      case "Busy": return "bg-amber-500";
      default: return "bg-rose-500";
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden gradient-primary text-white p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-primary/25 border-0">
        <div className="space-y-2 max-w-xl">
          <Badge className="bg-white/10 text-white hover:bg-white/20 border-0 rounded-full px-3 py-1 text-xs backdrop-blur-sm">
            ✨ Community Service Hub
          </Badge>
          <h1 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] leading-none tracking-tight">
            Trusted Community Services
          </h1>
          <p className="text-white/80 text-sm font-medium">
            Book verified local technicians, housekeepers, cooks, and tutors recommended by your society neighbors.
          </p>
        </div>
        <div className="flex gap-4 lg:gap-8 items-center bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-full md:w-auto">
          <div className="text-center flex-1 md:flex-none">
            <span className="block text-2xl font-bold">{workerProfiles.length}</span>
            <span className="text-[10px] text-white/70">Verified Workers</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center flex-1 md:flex-none">
            <span className="block text-2xl font-bold">4.8★</span>
            <span className="text-[10px] text-white/70">Average Rating</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center flex-1 md:flex-none">
            <span className="block text-2xl font-bold">
              {serviceBookings.filter(b => b.status === "Completed").length}
            </span>
            <span className="text-[10px] text-white/70">Jobs Completed</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:w-[600px] h-12 bg-secondary/30 rounded-2xl p-1 mb-6">
          <TabsTrigger value="browse" className="rounded-xl text-xs font-bold transition-all data-[state=active]:gradient-primary data-[state=active]:text-white">
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl text-xs font-bold transition-all data-[state=active]:gradient-primary data-[state=active]:text-white">
            My Bookings
          </TabsTrigger>
          <TabsTrigger value="favorites" className="rounded-xl text-xs font-bold transition-all data-[state=active]:gradient-primary data-[state=active]:text-white">
            Saved
          </TabsTrigger>
          <TabsTrigger value="emergency" className="rounded-xl text-xs font-bold transition-all data-[state=active]:gradient-primary data-[state=active]:text-white">
            🚨 Emergency
          </TabsTrigger>
        </TabsList>

        {/* BROWSE PORTAL TAB */}
        <TabsContent value="browse" className="space-y-6 outline-none">
          {/* Quick Category Buttons */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold text-foreground uppercase tracking-widest">Quick Service Needs</h4>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {quickAccessButtons.map((btn) => (
                <Button
                  key={btn.label}
                  variant={selectedCategory === btn.label ? "default" : "outline"}
                  onClick={() => setSelectedCategory(selectedCategory === btn.label ? "All" : btn.label)}
                  className={`rounded-2xl h-12 px-5 text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === btn.label
                      ? "gradient-primary text-white border-0 shadow-lg shadow-primary/25"
                      : "hover:bg-secondary/50 border-border/50"
                  }`}
                >
                  <span className="text-sm mr-2">{btn.icon}</span>
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Search, Filter, Sort Row */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                placeholder="Search worker by name, category, or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 rounded-2xl h-12 text-xs border-border/50 bg-secondary/10 focus-visible:ring-primary"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
              <Badge
                variant={selectedGroup === "All" ? "secondary" : "default"}
                onClick={() => setSelectedGroup(selectedGroup === "All" ? "Home Services" : selectedGroup === "Home Services" ? "Repairs" : selectedGroup === "Repairs" ? "Other Services" : "All")}
                className="h-10 px-4 rounded-xl text-[10px] font-bold cursor-pointer border border-border/40 hover:bg-secondary/50 transition-all select-none"
              >
                Group: {selectedGroup === "All" ? "All Sectors" : selectedGroup}
              </Badge>

              <Badge
                variant={filterVerified ? "default" : "secondary"}
                onClick={() => setFilterVerified(!filterVerified)}
                className="h-10 px-4 rounded-xl text-[10px] font-bold cursor-pointer border border-border/40 hover:bg-secondary/50 transition-all select-none"
              >
                🛡️ Verified Only
              </Badge>

              <Badge
                variant={filterAvailable ? "default" : "secondary"}
                onClick={() => setFilterAvailable(!filterAvailable)}
                className="h-10 px-4 rounded-xl text-[10px] font-bold cursor-pointer border border-border/40 hover:bg-secondary/50 transition-all select-none"
              >
                🟢 Available Now
              </Badge>

              <div className="h-10 rounded-xl border border-border/50 bg-secondary/15 px-3 flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[10px] font-bold text-foreground outline-none cursor-pointer border-0 p-0"
                >
                  <option value="rating">Top Rated</option>
                  <option value="price_low">Lowest Price</option>
                  <option value="price_high">Highest Price</option>
                  <option value="experience">Most Experience</option>
                </select>
              </div>
            </div>
          </div>

          {/* Workers Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredWorkers.map((worker) => {
              const isFav = favWorkerIds.includes(worker.id);
              const workerSpecialties = worker.specializations || [];
              const bookingsCount = serviceBookings.filter(b => b.workerId === worker.id).length + (worker.workerProfile?.repeatCustomers || 0);

              return (
                <motion.div key={worker.id} variants={fadeInUp}>
                  <Card className="border-border/50 hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-card group relative overflow-hidden">
                    {/* Verified Badges in Card Corner */}
                    <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(worker.id);
                        }}
                        className="rounded-full h-8.5 w-8.5 bg-background/80 hover:bg-background shadow-md border border-border/20 group/heart"
                      >
                        <Heart className={`w-4 h-4 transition-transform group-hover/heart:scale-115 ${isFav ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
                      </Button>
                    </div>

                    <CardContent className="p-5 flex flex-col h-full space-y-4" onClick={() => setActiveWorkerProfile(worker)}>
                      {/* Worker Main Details Header */}
                      <div className="flex gap-4 cursor-pointer">
                        <div className="relative shrink-0">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center font-extrabold text-primary text-lg shadow-inner">
                            {worker.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          {/* Availability dot indicator */}
                          <span className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-3 border-card flex items-center justify-center ${getAvailabilityDot(worker.availability || "Offline")}`} title={worker.availability || "Offline"} />
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                              {worker.name}
                            </h3>
                            {worker.workerProfile?.isVerified && (
                              <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                            )}
                          </div>
                          
                          <Badge variant="secondary" className="mt-1 text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase bg-secondary/50 text-muted-foreground">
                            {worker.workerCategory}
                          </Badge>
                          
                          <div className="flex items-center gap-1.5 mt-2">
                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-bold">{worker.rating?.toFixed(1) || "4.7"}</span>
                            <span className="text-[10px] text-muted-foreground">({worker.workerReviews?.length || 12} reviews)</span>
                          </div>
                        </div>
                      </div>

                      {/* Info Highlights */}
                      <div className="grid grid-cols-2 gap-2 bg-secondary/10 rounded-xl p-2.5 text-[10px]">
                        <div>
                          <span className="text-muted-foreground block">Experience</span>
                          <span className="font-bold text-foreground">{worker.workerProfile?.experienceYears || worker.experience || "3"} Years</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Visit Charge</span>
                          <span className="font-bold text-primary">₹{worker.workerProfile?.visitCharge || "100"}</span>
                        </div>
                      </div>

                      {/* Skill Tags / Chips */}
                      {workerSpecialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {workerSpecialties.slice(0, 3).map((skill: string) => (
                            <Badge key={skill} variant="outline" className="text-[9px] font-medium px-2 py-0 border-border/60 bg-background text-foreground/80">
                              {skill}
                            </Badge>
                          ))}
                          {workerSpecialties.length > 3 && (
                            <Badge variant="outline" className="text-[9px] font-medium px-1.5 py-0 border-border/60 bg-background text-muted-foreground">
                              +{workerSpecialties.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Recommendation Badge */}
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 dark:bg-emerald-500/5 rounded-xl px-3 py-1.5 mt-2">
                        <Award className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Booked by {bookingsCount} residents</span>
                        {worker.workerProfile?.societyRecommend && (
                          <span className="text-primary-foreground">• Rec in Complex</span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 flex gap-2 w-full mt-auto" onClick={(e) => e.stopPropagation()}>
                        <Button
                          onClick={() => setBookingWorker(worker)}
                          className="flex-1 rounded-xl h-9.5 text-xs font-bold gradient-primary text-white border-0 shadow-md shadow-primary/10 hover:shadow-lg transition-all"
                        >
                          <CalendarRange className="w-3.5 h-3.5 mr-1.5" /> Book Service
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setChattingWorker(worker)}
                          className="rounded-xl h-9.5 px-3 border-border/50 hover:bg-secondary/40 text-foreground"
                          title="Message Worker"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {filteredWorkers.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">No Workers Found</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Try altering your filter categories, clearing search fields, or selecting different service groups.
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl text-xs" onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setSelectedGroup("All");
                  setFilterVerified(false);
                  setFilterAvailable(false);
                }}>
                  Reset All Filters
                </Button>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* BOOKINGS TAB */}
        <TabsContent value="history" className="space-y-6 outline-none">
          <Card className="border-border/50 bg-card rounded-2xl shadow-sm">
            <CardHeader className="pb-3 border-b border-border/10">
              <CardTitle className="text-base font-bold">Your Booking History</CardTitle>
              <CardDescription>View, status-track, rate, and reschedule helper bookings</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20">
                {serviceBookings.map((bk) => (
                  <div key={bk.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-secondary/10 transition-all text-xs">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{bk.worker?.name || "Service Professional"}</span>
                        <Badge className="bg-secondary/40 text-muted-foreground uppercase text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-border/20">{bk.category}</Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[10px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5 text-primary" /> {bk.bookingDate}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> {bk.bookingTime}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" /> {bk.address}</span>
                      </div>
                      
                      {bk.notes && (
                        <p className="text-[10px] text-muted-foreground italic bg-secondary/10 rounded-lg p-2 max-w-md border-l-2 border-primary">
                          Notes: "{bk.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col items-end gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-0 border-border/10 justify-between md:justify-end">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-muted-foreground block">Cost Charged</span>
                        <span className="font-bold text-sm text-primary">₹{bk.price}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <Badge className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                          bk.status === "Pending" ? "bg-amber-500/15 text-amber-500 border border-amber-500/20" :
                          bk.status === "Accepted" ? "bg-blue-500/15 text-blue-500 border border-blue-500/20" :
                          bk.status === "Completed" ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20" :
                          "bg-rose-500/15 text-rose-500 border border-rose-500/20"
                        }`}>
                          {bk.status}
                        </Badge>

                        {/* Complete & Rate Action */}
                        {bk.status === "Accepted" && (
                          <Button
                            size="sm"
                            className="h-8 rounded-lg text-[10px] font-semibold bg-emerald-500 hover:bg-emerald-600 text-white"
                            onClick={() => updateBookingStatus(bk.id, "Completed")}
                          >
                            Mark Completed
                          </Button>
                        )}

                        {/* Review Action */}
                        {bk.status === "Completed" && !bk.rating && (
                          <Button
                            size="sm"
                            onClick={() => setReviewBooking(bk)}
                            className="h-8 rounded-lg text-[10px] font-semibold gradient-primary text-white border-0"
                          >
                            Rate Worker
                          </Button>
                        )}

                        {/* Rating Display */}
                        {bk.rating && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-foreground">
                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                            <span>{bk.rating} / 5</span>
                          </div>
                        )}

                        {/* Rebook Action */}
                        {(bk.status === "Completed" || bk.status === "Cancelled" || bk.status === "Rejected") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRebook(bk)}
                            className="h-8 rounded-lg text-[10px] border-border/50 font-bold hover:bg-secondary"
                          >
                            Rebook
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {serviceBookings.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground text-xs space-y-2">
                    <CalendarRange className="w-10 h-10 text-muted-foreground/50 mx-auto" />
                    <p className="font-bold">No bookings recorded yet.</p>
                    <p className="text-[10px]">When you request a service, it will show up here.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SAVED WORKERS TAB */}
        <TabsContent value="favorites" className="space-y-6 outline-none">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedWorkers.map((worker) => {
              const bookingsCount = serviceBookings.filter(b => b.workerId === worker.id).length + (worker.workerProfile?.repeatCustomers || 0);

              return (
                <Card key={worker.id} className="border-border/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full bg-card relative">
                  <div className="absolute top-4 right-4 z-10">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleFavorite(worker.id)}
                      className="rounded-full h-8.5 w-8.5 bg-background shadow-md border border-border/20 text-rose-500"
                    >
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    </Button>
                  </div>

                  <CardContent className="p-5 flex flex-col h-full space-y-4" onClick={() => setActiveWorkerProfile(worker)}>
                    <div className="flex gap-4 cursor-pointer">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center font-extrabold text-primary text-lg shrink-0">
                        {worker.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-foreground text-sm truncate">{worker.name}</h3>
                          {worker.workerProfile?.isVerified && (
                            <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <Badge variant="secondary" className="mt-1 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-secondary/50 text-muted-foreground">
                          {worker.workerCategory}
                        </Badge>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                          <span className="text-xs font-bold">{worker.rating?.toFixed(1) || "4.7"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-secondary/10 rounded-xl p-2.5 text-[10px]">
                      <div>
                        <span className="text-muted-foreground block">Experience</span>
                        <span className="font-bold text-foreground">{worker.workerProfile?.experienceYears || "3"} Years</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Visit Charge</span>
                        <span className="font-bold text-primary">₹{worker.workerProfile?.visitCharge || "100"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-500/10 rounded-xl px-3 py-1.5 mt-2">
                      <Award className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Booked by {bookingsCount} residents</span>
                    </div>

                    <div className="pt-2 flex gap-2 w-full mt-auto" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => setBookingWorker(worker)}
                        className="flex-1 rounded-xl h-9.5 text-xs font-bold gradient-primary text-white border-0"
                      >
                        <CalendarRange className="w-3.5 h-3.5 mr-1.5" /> Book Now
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setChattingWorker(worker)}
                        className="rounded-xl h-9.5 px-3 border-border/50 text-foreground"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {bookmarkedWorkers.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4">
                <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">No Bookmarks Yet</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Click the heart icon on any worker card to save them to your favorites roster.
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* EMERGENCY DESK TAB */}
        <TabsContent value="emergency" className="space-y-6 outline-none">
          <Card className="border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/2.5 rounded-3xl overflow-hidden border">
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-rose-500/20 bg-rose-500/10">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-rose-700 dark:text-rose-400">Emergency Dispatch Desk</h3>
                  <p className="text-xs text-rose-600 dark:text-rose-400/80 font-medium">Rapid response dispatch logs for critical household utility breakdowns</p>
                </div>
              </div>
              <Badge className="bg-rose-600 text-white border-0 py-1 px-3 text-xs rounded-full">Gate Dispatch Active</Badge>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {["Electrician", "Plumber", "Locksmith"].map((cat) => {
                  const availableWorkers = workerProfiles.filter((w) => w.workerCategory === (cat === "Locksmith" ? "Carpenter" : cat) && w.availability === "Available");
                  
                  return (
                    <Card key={cat} className="border-border/50 bg-background rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-foreground">Emergency {cat}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-500">Urgent</span>
                        </div>
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <p className="flex justify-between"><span>Response Time:</span> <strong className="text-foreground">{emergencyETA(cat)}</strong></p>
                          <p className="flex justify-between"><span>Standby Helpers:</span> <strong className="text-emerald-600">{availableWorkers.length} Active</strong></p>
                        </div>
                      </div>
                      <div className="p-3 bg-secondary/10 border-t border-border/20 flex gap-2">
                        {availableWorkers.length > 0 ? (
                          <Button
                            onClick={() => setBookingWorker(availableWorkers[0])}
                            className="w-full h-8.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white border-0"
                          >
                            Dispatch Instantly
                          </Button>
                        ) : (
                          <Button
                            disabled
                            className="w-full h-8.5 rounded-xl text-xs font-bold bg-muted text-muted-foreground cursor-not-allowed border-0"
                          >
                            All Busy (Queue)
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-[11px] text-amber-800 dark:text-amber-300 font-medium flex gap-3">
                <Clock className="w-5 h-5 shrink-0 text-amber-500" />
                <p>
                  Emergency requests bypass the normal technician schedule queues and flag the worker's portal with a high-decibel dispatch alert. Normal surcharge rates apply + emergency dispatch fee (₹50).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* WORKER DETAILS DIALOG */}
      <Dialog open={!!activeWorkerProfile} onOpenChange={(open) => !open && setActiveWorkerProfile(null)}>
        {activeWorkerProfile && (
          <DialogContent className="sm:max-w-2xl rounded-3xl p-6 bg-card border border-border/50 max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b border-border/10">
              <div className="flex gap-4 items-start relative pr-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center font-extrabold text-primary text-xl shadow-inner">
                  {activeWorkerProfile.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="font-extrabold text-lg text-foreground font-[family-name:var(--font-heading)]">{activeWorkerProfile.name}</DialogTitle>
                    {activeWorkerProfile.workerProfile?.isVerified && (
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-secondary text-muted-foreground">
                    {activeWorkerProfile.workerCategory}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-foreground">{activeWorkerProfile.rating?.toFixed(1) || "4.7"}</span>
                    <span className="text-muted-foreground">({activeWorkerProfile.workerReviews?.length || 12} customer reviews)</span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-4 text-xs">
              {/* About bio */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-foreground">About the Professional</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {activeWorkerProfile.workerProfile?.about || "No biography provided. Certified and verified community contractor."}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-secondary/10 border border-border/30">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] text-muted-foreground block">Experience</span>
                  <span className="font-extrabold text-sm text-foreground">{activeWorkerProfile.workerProfile?.experienceYears || "3"} Years</span>
                </div>
                <div className="text-center sm:text-left border-l border-border/20 pl-0 sm:pl-4">
                  <span className="text-[10px] text-muted-foreground block">Starting Price</span>
                  <span className="font-extrabold text-sm text-primary">₹{activeWorkerProfile.workerProfile?.visitCharge || "100"}</span>
                </div>
                <div className="text-center sm:text-left border-l border-border/20 pl-0 sm:pl-4">
                  <span className="text-[10px] text-muted-foreground block">Languages</span>
                  <span className="font-extrabold text-[10px] text-foreground truncate block">
                    {activeWorkerProfile.workerProfile?.languages?.join(", ") || "English, Hindi"}
                  </span>
                </div>
                <div className="text-center sm:text-left border-l border-border/20 pl-0 sm:pl-4">
                  <span className="text-[10px] text-muted-foreground block">Work Hours</span>
                  <span className="font-extrabold text-[10px] text-foreground block">
                    {activeWorkerProfile.workerProfile?.workingHoursStart || "09:00"} - {activeWorkerProfile.workerProfile?.workingHoursEnd || "18:00"}
                  </span>
                </div>
              </div>

              {/* Certifications and Badges */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground">Skills & Specialities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeWorkerProfile.specializations || ["General Maintenance"]).map((skill: string) => (
                      <Badge key={skill} variant="outline" className="px-2.5 py-0.5 text-[9px] font-semibold border-border/50 text-foreground/80 bg-background/50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-foreground">Trust badges</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeWorkerProfile.workerProfile?.isSocietyVerified && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-bold">🏢 Society Approved</Badge>
                    )}
                    {activeWorkerProfile.workerProfile?.isPoliceVerified && (
                      <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[9px] font-bold">👮 Police Verified</Badge>
                    )}
                    {activeWorkerProfile.workerProfile?.societyRecommend && (
                      <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] font-bold">⭐ Recommended Choice</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3 border-t border-border/10 pt-4">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  Customer Reviews ({activeWorkerProfile.workerReviews?.length || 0})
                </h4>
                <div className="space-y-3 max-h-[220px] overflow-y-auto divide-y divide-border/10 pr-2">
                  {activeWorkerProfile.workerReviews?.map((rv: any) => (
                    <div key={rv.id} className="pt-3 first:pt-0 space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold">{rv.resident?.name || "Resident"} (Flat {rv.resident?.unit})</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(rv.rating)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-[10px] leading-relaxed">"{rv.reviewText}"</p>
                    </div>
                  ))}
                  {(!activeWorkerProfile.workerReviews || activeWorkerProfile.workerReviews.length === 0) && (
                    <div className="text-center py-6 text-muted-foreground/60 italic">No reviews logged yet.</div>
                  )}
                </div>
              </div>

              {/* Booking Actions */}
              <div className="pt-4 border-t border-border/10 flex gap-3">
                <Button
                  onClick={() => {
                    setActiveWorkerProfile(null);
                    setBookingWorker(activeWorkerProfile);
                  }}
                  className="flex-1 rounded-xl h-10.5 text-xs font-bold gradient-primary text-white border-0 shadow-lg shadow-primary/10 hover:shadow-primary/20"
                >
                  Schedule Appointment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveWorkerProfile(null);
                    setChattingWorker(activeWorkerProfile);
                  }}
                  className="rounded-xl h-10.5 border-border/50 font-bold px-4"
                >
                  Start Chat Message
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* BOOKING FORM DIALOG */}
      <Dialog open={!!bookingWorker} onOpenChange={(open) => !open && setBookingWorker(null)}>
        {bookingWorker && (
          <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border border-border/50">
            <DialogHeader className="pb-3 border-b border-border/10">
              <DialogTitle className="font-extrabold text-foreground font-[family-name:var(--font-heading)]">Request Service Visit</DialogTitle>
              <DialogDescription className="text-xs">Schedule an appointment with <strong>{bookingWorker.name}</strong></DialogDescription>
            </DialogHeader>

            <form onSubmit={handleBookingSubmit} className="space-y-4 pt-2 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Service Category</label>
                <Input value={bookingWorker.workerCategory} disabled className="h-10 rounded-xl bg-secondary/15 border-border/50 text-xs font-medium cursor-not-allowed" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Preferred Date</label>
                  <Input
                    type="date"
                    required
                    value={bookingDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="h-10 rounded-xl bg-secondary/10 border-border/50 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Preferred Time</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="h-10 w-full rounded-xl bg-background border border-border/50 px-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Service Address (Auto-filled)</label>
                <Input
                  required
                  value={bookingAddress}
                  onChange={(e) => setBookingAddress(e.target.value)}
                  className="h-10 rounded-xl bg-secondary/10 border-border/50 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Add Booking Notes / Details</label>
                <textarea
                  placeholder="Describe your issue (e.g. leaking faucet, wire short circuit, bathroom cleaning)..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="h-20 w-full p-3 rounded-xl bg-secondary/10 border border-border/50 text-xs resize-none focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="bg-primary/5 rounded-2xl p-3 border border-primary/10 flex justify-between items-center text-[11px] font-medium text-foreground">
                <span>Standard Visitation Rate:</span>
                <span className="font-extrabold text-primary">₹{bookingWorker.workerProfile?.visitCharge || "100"}</span>
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBookingWorker(null)}
                  className="flex-1 rounded-xl h-10 border-border/50 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 rounded-xl h-10 text-xs font-bold gradient-primary text-white border-0"
                >
                  {bookingLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin mx-auto" /> : "Request Booking"}
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>

      {/* RATING & REVIEW FORM DIALOG */}
      <Dialog open={!!reviewBooking} onOpenChange={(open) => !open && setReviewBooking(null)}>
        {reviewBooking && (
          <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border border-border/50">
            <DialogHeader className="pb-3 border-b border-border/10">
              <DialogTitle className="font-extrabold text-foreground font-[family-name:var(--font-heading)]">Rate Service Visit</DialogTitle>
              <DialogDescription className="text-xs">Leave feedback on your booking with <strong>{reviewBooking.worker?.name}</strong></DialogDescription>
            </DialogHeader>

            <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2 text-xs">
              <div className="space-y-2 flex flex-col items-center">
                <label className="font-bold text-foreground">Tap stars to rate</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewStars(star)}
                      className="hover:scale-115 transition-transform"
                    >
                      <Star className={`w-8 h-8 ${reviewStars >= star ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Write a Review</label>
                <textarea
                  placeholder="Share details about the technician's professionalism, speed, quality of work..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="h-24 w-full p-3 rounded-xl bg-secondary/10 border border-border/50 text-xs resize-none focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Photo URL (Optional)</label>
                <Input
                  placeholder="Paste work completion image URL..."
                  value={reviewPhoto}
                  onChange={(e) => setReviewPhoto(e.target.value)}
                  className="h-10 rounded-xl bg-secondary/10 border-border/50 text-xs"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewBooking(null)}
                  className="flex-1 rounded-xl h-10 border-border/50 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={reviewLoading}
                  className="flex-1 rounded-xl h-10 text-xs font-bold gradient-primary text-white border-0"
                >
                  {reviewLoading ? <Loader2 className="w-4.5 h-4.5 animate-spin mx-auto" /> : "Submit Feedback"}
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>

      {/* MESSAGING SYSTEM DRAWER (SHEET) */}
      <Sheet open={!!chattingWorker} onOpenChange={(open) => !open && setChattingWorker(null)}>
        {chattingWorker && (
          <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-card border-l border-border/50">
            <SheetHeader className="p-4 border-b border-border/10 flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                {chattingWorker.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 text-left min-w-0 pr-8">
                <SheetTitle className="font-bold text-sm text-foreground truncate">{chattingWorker.name}</SheetTitle>
                <SheetDescription className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                  {chattingWorker.workerCategory} · Online
                </SheetDescription>
              </div>
            </SheetHeader>

            {/* Chat Body Messages list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/5 dark:bg-card">
              {chatMessages.map((msg: any) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      isMe
                        ? "gradient-primary text-white rounded-tr-none"
                        : "bg-secondary/40 text-foreground rounded-tl-none border border-border/20"
                    }`}>
                      <p>{msg.message}</p>
                      <span className={`block text-[8px] text-right mt-1 opacity-70`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Message Form */}
            <div className="p-4 border-t border-border/10 bg-card">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Ask about availability, rates..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="h-10 rounded-xl bg-secondary/10 border-border/50 text-xs"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!chatInput.trim() || sendingMessage}
                  className="rounded-xl h-10 w-10 gradient-primary text-white border-0 shrink-0"
                >
                  {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
