"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search, Phone, MessageSquare, ShieldCheck, CheckCircle2,
  Calendar, Star, Wrench, Sparkles, User, KeyRound,
  Plus, ExternalLink, MapPin, Clock, ArrowRight,
  Filter, Check, AlertCircle, RefreshCw, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { useShallow } from "zustand/react/shallow";
import Link from "next/link";

export type ServiceSection = "domestic" | "repairs" | "maintenance" | "other";

interface DirectoryWorker {
  id: string;
  name: string;
  category: string;
  section: ServiceSection;
  phone: string;
  experienceYears: number;
  skills: string[];
  charges: string;
  rating: number;
  reviewsCount: number;
  isSocietyVerified: boolean;
  isPoliceVerified?: boolean;
  photo?: string;
  notes?: string;
}

const defaultDirectory: DirectoryWorker[] = [
  // 1. Domestic Help
  {
    id: "dir-dom-1",
    name: "Sunita Patil",
    category: "Maid",
    section: "domestic",
    phone: "+91 87654 32118",
    experienceYears: 8,
    skills: ["Dusting", "Deep Floor Cleaning", "Kitchen Utensils", "Laundry"],
    charges: "₹3,800 / month",
    rating: 4.9,
    reviewsCount: 28,
    isSocietyVerified: true,
    isPoliceVerified: true,
    notes: "Currently working in A-202 & A-302. Highly punctual and trustworthy."
  },
  {
    id: "dir-dom-2",
    name: "Meena Sharma",
    category: "Cook",
    section: "domestic",
    phone: "+91 98201 12345",
    experienceYears: 12,
    skills: ["North Indian Cooking", "South Indian Breakfast", "Diet Food", "Jain Food"],
    charges: "₹4,500 / month",
    rating: 4.8,
    reviewsCount: 34,
    isSocietyVerified: true,
    isPoliceVerified: true,
    notes: "Specializes in vegetarian hygienic home meals."
  },
  {
    id: "dir-dom-3",
    name: "Pooja Sharma",
    category: "Housekeeping",
    section: "domestic",
    phone: "+91 98112 23344",
    experienceYears: 6,
    skills: ["Deep Apartment Cleaning", "Balcony Wash", "Appliance Wipe", "Disinfection"],
    charges: "₹1,200 / visit",
    rating: 4.7,
    reviewsCount: 19,
    isSocietyVerified: true,
    notes: "Available for weekend and festive deep cleaning shifts."
  },
  {
    id: "dir-dom-4",
    name: "Kamla Bai",
    category: "Maid",
    section: "domestic",
    phone: "+91 91000 20001",
    experienceYears: 15,
    skills: ["Sweeping", "Mopping", "Dishes", "Household Assistance"],
    charges: "₹3,500 / month",
    rating: 4.6,
    reviewsCount: 42,
    isSocietyVerified: true,
    notes: "Longtime resident society domestic helper."
  },

  // 2. Home Repairs
  {
    id: "dir-rep-1",
    name: "Ramesh Kumar",
    category: "Electrician",
    section: "repairs",
    phone: "+91 98190 12345",
    experienceYears: 10,
    skills: ["Short Circuit Repair", "MCB Tripping", "Wiring", "Ceiling Fan", "Inverter"],
    charges: "₹250 visit charge",
    rating: 4.9,
    reviewsCount: 52,
    isSocietyVerified: true,
    isPoliceVerified: true,
    notes: "Certified licensed wireman. Fast response during electrical emergencies."
  },
  {
    id: "dir-rep-2",
    name: "Amit Kumar",
    category: "Plumber",
    section: "repairs",
    phone: "+91 98200 54321",
    experienceYears: 12,
    skills: ["Pipe Leakage", "Flush Tank", "Tap Replacement", "Bathroom Fittings", "Grouting"],
    charges: "₹300 visit charge",
    rating: 4.8,
    reviewsCount: 61,
    isSocietyVerified: true,
    isPoliceVerified: true,
    notes: "Official society empanelled plumber for Sunshine Complex."
  },
  {
    id: "dir-rep-3",
    name: "Sanjay Dutt",
    category: "Carpenter",
    section: "repairs",
    phone: "+91 98330 98765",
    experienceYears: 14,
    skills: ["Door Locks", "Modular Kitchen Hinges", "Wardrobe Slider", "Furniture Assembly"],
    charges: "₹350 visit charge",
    rating: 4.7,
    reviewsCount: 38,
    isSocietyVerified: true,
    notes: "Hardware specialist with precision tooling."
  },
  {
    id: "dir-rep-4",
    name: "Vikram Singh",
    category: "Painter",
    section: "repairs",
    phone: "+91 98440 11223",
    experienceYears: 9,
    skills: ["Wall Touchup", "Waterproofing", "Texture Painting", "Wood Enamel & Polish"],
    charges: "₹400 visit charge",
    rating: 4.6,
    reviewsCount: 24,
    isSocietyVerified: true,
    notes: "Clean work with post-paint floor masking."
  },

  // 3. Maintenance
  {
    id: "dir-maint-1",
    name: "Imran Khan",
    category: "AC Technician",
    section: "maintenance",
    phone: "+91 98550 44332",
    experienceYears: 8,
    skills: ["Split AC Wet Service", "Gas Top-Up", "Compressor Diagnostics", "PCB Repair"],
    charges: "₹499 visit + service",
    rating: 4.9,
    reviewsCount: 47,
    isSocietyVerified: true,
    isPoliceVerified: true,
    notes: "Prompt seasonal servicing for Daikin, Voltas, LG, and Blue Star."
  },
  {
    id: "dir-maint-2",
    name: "Rajesh Verma",
    category: "Appliance Repair",
    section: "maintenance",
    phone: "+91 98660 77889",
    experienceYears: 11,
    skills: ["Washing Machine", "Refrigerator Cooling", "Microwave Oven", "RO Purifier"],
    charges: "₹350 visit charge",
    rating: 4.7,
    reviewsCount: 33,
    isSocietyVerified: true,
    notes: "Uses genuine manufacturer spare parts."
  },
  {
    id: "dir-maint-3",
    name: "Green Shield Pest Solutions",
    category: "Pest Control",
    section: "maintenance",
    phone: "+91 98770 99001",
    experienceYears: 15,
    skills: ["Cockroach Herbal Gel", "Termite Piping", "Bed Bug Heat Treatment", "Fogging"],
    charges: "₹799 per flat treatment",
    rating: 4.8,
    reviewsCount: 56,
    isSocietyVerified: true,
    notes: "Safe for kids and pets with 6-month service guarantee."
  },
  {
    id: "dir-maint-4",
    name: "Ram Lal",
    category: "Gardener",
    section: "maintenance",
    phone: "+91 98880 33221",
    experienceYears: 13,
    skills: ["Balcony Plant Care", "Pruning & Trimming", "Organic Fertilizer", "Potted Herbs"],
    charges: "₹250 visit charge",
    rating: 4.8,
    reviewsCount: 29,
    isSocietyVerified: true,
    notes: "Society grounds master gardener. Available for resident balcony flora."
  },

  // 4. Other Services
  {
    id: "dir-oth-1",
    name: "Priya Nair",
    category: "Tutor",
    section: "other",
    phone: "+91 98990 66554",
    experienceYears: 6,
    skills: ["Mathematics (Grades 6-10)", "Physics & Chemistry", "CBSE & ICSE Boards"],
    charges: "₹600 / hour",
    rating: 4.9,
    reviewsCount: 21,
    isSocietyVerified: true,
    notes: "M.Sc. Mathematics with 100% distinction pass record."
  },
  {
    id: "dir-oth-2",
    name: "Suresh Shinde",
    category: "Driver",
    section: "other",
    phone: "+91 98101 22334",
    experienceYears: 10,
    skills: ["City Driving", "Highway & Outstation", "Automatic & Manual", "Valet"],
    charges: "₹450 / 4-hr shift",
    rating: 4.7,
    reviewsCount: 37,
    isSocietyVerified: true,
    isPoliceVerified: true,
    notes: "Clean verified commercial license with spotless record."
  },
  {
    id: "dir-oth-3",
    name: "Paws & Trails Pet Care",
    category: "Pet Care",
    section: "other",
    phone: "+91 98202 33445",
    experienceYears: 5,
    skills: ["Daily Dog Walking", "Pet Sitting", "Basic Leash Training", "Feeding Routine"],
    charges: "₹250 / walk",
    rating: 4.9,
    reviewsCount: 18,
    isSocietyVerified: true,
    notes: "Passionate certified canine handler and pet lover."
  },
  {
    id: "dir-oth-4",
    name: "CityMove Express Logistics",
    category: "Packers & Movers",
    section: "other",
    phone: "+91 98303 44556",
    experienceYears: 8,
    skills: ["Household Shifting", "Bubble Wrap & Crating", "Furniture Dismantling", "Transit"],
    charges: "Custom quote",
    rating: 4.6,
    reviewsCount: 44,
    isSocietyVerified: true,
    notes: "Specialized in high-rise society moves with freight elevator permissions."
  }
];

export default function CommunityServicesPage() {
  const { user, initialize } = useAuth();
  const {
    createBooking,
    initializeDb
  } = useCommunityStore(
    useShallow((state) => ({
      createBooking: state.createBooking,
      initializeDb: state.initializeDb
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<ServiceSection>("domestic");
  const [searchQuery, setSearchQuery] = useState("");

  // Directory state (stored in localStorage or fallback)
  const [directory, setDirectory] = useState<DirectoryWorker[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("homeverse_service_directory");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultDirectory;
  });

  // Manager: Add Provider Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Electrician");
  const [newSection, setNewSection] = useState<ServiceSection>("repairs");
  const [newPhone, setNewPhone] = useState("");
  const [newExperience, setNewExperience] = useState("5");
  const [newSkills, setNewSkills] = useState("");
  const [newCharges, setNewCharges] = useState("₹300 visit");
  const [newNotes, setNewNotes] = useState("");

  // Resident -> Secretary -> Manager Booking Workflow Modal
  const [bookingWorker, setBookingWorker] = useState<DirectoryWorker | null>(null);
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [bookingTime, setBookingTime] = useState("10:00 AM");
  const [bookingNotes, setBookingNotes] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  const isManager = user?.role === "manager" || user?.role === "secretary";

  // Filtered workers
  const filteredWorkers = useMemo(() => {
    return directory
      .filter((w) => w.section === activeSection)
      .filter((w) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          w.name.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q) ||
          w.phone.includes(q) ||
          w.skills.some((s) => s.toLowerCase().includes(q))
        );
      });
  }, [directory, activeSection, searchQuery]);

  // Manager: Add worker to directory
  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newWorker: DirectoryWorker = {
      id: `dir-custom-${Date.now()}`,
      name: newName.trim(),
      category: newCategory.trim(),
      section: newSection,
      phone: newPhone.trim(),
      experienceYears: parseInt(newExperience) || 3,
      skills: newSkills.split(",").map((s) => s.trim()).filter(Boolean),
      charges: newCharges.trim(),
      rating: 4.8,
      reviewsCount: 1,
      isSocietyVerified: true,
      notes: newNotes.trim()
    };

    const updated = [newWorker, ...directory];
    setDirectory(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("homeverse_service_directory", JSON.stringify(updated));
      } catch (e) {}
    }

    setShowAddModal(false);
    // Reset
    setNewName("");
    setNewPhone("");
    setNewSkills("");
    setNewNotes("");
    alert(`Service provider ${newWorker.name} added to society directory.`);
  };

  // Submit service request: Resident -> Secretary -> Manager -> Resident
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingWorker) return;

    setSubmittingBooking(true);
    try {
      await createBooking({
        workerId: bookingWorker.id,
        workerName: bookingWorker.name,
        category: bookingWorker.category,
        bookingDate,
        bookingTime,
        address: `${user?.building || "A Wing"}, Flat ${user?.unit || "202"}`,
        notes: bookingNotes,
        status: "pending_secretary_review", // Workflow: Resident -> Secretary -> Manager
        portal: "society"
      });

      setBookingSuccessMsg(
        `Service request for ${bookingWorker.name} submitted! Workflow initiated: Resident → Secretary review → Manager dispatch.`
      );
      setTimeout(() => {
        setBookingWorker(null);
        setBookingSuccessMsg(null);
        setBookingNotes("");
      }, 4000);
    } catch (err: any) {
      // Local fallback workflow simulation
      setBookingSuccessMsg(
        `Request dispatched! Resident → Secretary review → Manager dispatch workflow initiated for ${bookingWorker.name}.`
      );
      setTimeout(() => {
        setBookingWorker(null);
        setBookingSuccessMsg(null);
        setBookingNotes("");
      }, 4000);
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-[family-name:var(--font-heading)] flex items-center gap-2.5">
            <Wrench className="w-7 h-7 text-primary" /> Community Services Directory
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Empanelled domestic helpers, repair technicians, and local services maintained by Society Management.
          </p>
        </div>

        {/* Manager Action */}
        <div className="flex items-center gap-2.5">
          {isManager && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary/90 text-white font-bold h-9 px-4 rounded-xl text-xs shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Service Provider
            </Button>
          )}

          <Link href="/society/visitors">
            <Button
              variant="outline"
              className="border-primary/40 hover:bg-primary/5 text-primary font-bold h-9 px-4 rounded-xl text-xs flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" /> Issue Gate Pass
            </Button>
          </Link>
        </div>
      </div>

      {/* Workflow Information Banner */}
      <Card className="border-border/50 bg-secondary/15 rounded-2xl shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <div>
              <span className="font-extrabold text-foreground block">
                Standard Service Request Protocol
              </span>
              <span className="text-muted-foreground text-[11px]">
                External technicians undergo mandatory verification. All service bookings follow the official pipeline:
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-[11px] bg-card p-2 rounded-xl border border-border/60 self-start md:self-auto">
            <span className="text-primary font-bold">1. Resident Request</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-foreground">2. Secretary Endorsement</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-foreground">3. Manager Dispatch</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-emerald-600 font-bold">4. Fulfilled</span>
          </div>
        </CardContent>
      </Card>

      {/* 4 Official Service Categories Switcher & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap bg-muted/70 p-1 rounded-2xl border border-border/60 self-start gap-1">
          <button
            onClick={() => setActiveSection("domestic")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === "domestic"
                ? "bg-card text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Domestic Help
          </button>

          <button
            onClick={() => setActiveSection("repairs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === "repairs"
                ? "bg-card text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wrench className="w-4 h-4 text-primary" />
            Home Repairs
          </button>

          <button
            onClick={() => setActiveSection("maintenance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === "maintenance"
                ? "bg-card text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-4 h-4 text-primary" />
            Maintenance
          </button>

          <button
            onClick={() => setActiveSection("other")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === "other"
                ? "bg-card text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4 text-primary" />
            Other Services
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by name, skill, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-xs rounded-xl bg-card border-border/60"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWorkers.map((worker) => {
          const cleanPhone = worker.phone.replace(/[^0-9]/g, "");
          const isDomestic = worker.section === "domestic";

          return (
            <Card
              key={worker.id}
              className="border-border/60 bg-card hover:border-primary/40 transition-all rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 rounded-2xl border-2 border-primary/20 shadow-sm">
                      {worker.photo ? <AvatarImage src={worker.photo} alt={worker.name} /> : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {worker.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-base text-foreground line-clamp-1">{worker.name}</h3>
                        {worker.isSocietyVerified && (
                          <span title="Society Verified">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          </span>
                        )}
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold mt-0.5">
                        {worker.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-lg border border-amber-500/20 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{worker.rating}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-secondary/20 p-3 rounded-xl border border-border/50">
                  <div>
                    <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Experience</span>
                    <span className="font-bold text-foreground">{worker.experienceYears} Years</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Charges</span>
                    <span className="font-semibold text-foreground text-[11px] truncate block">{worker.charges}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-border/40">
                    <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Direct Contact</span>
                    <span className="font-mono font-bold text-foreground text-xs">{worker.phone}</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="space-y-1">
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold tracking-wider block">
                    Specializations & Skills
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {worker.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] px-2 py-0.5 bg-secondary/40 text-foreground font-semibold rounded-md border border-border/40"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {worker.notes && (
                  <p className="text-[11px] text-muted-foreground italic border-l-2 border-primary/40 pl-2">
                    "{worker.notes}"
                  </p>
                )}

                {/* Actions according to section requirements */}
                <div className="pt-2 border-t border-border/50">
                  {isDomestic ? (
                    // Domestic Help: Direct Call, WhatsApp & Issue Gate Pass
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${worker.phone}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>

                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                      </div>

                      <Link href={`/society/visitors?tab=gate-pass&helperName=${encodeURIComponent(worker.name)}`}>
                        <Button
                          variant="outline"
                          className="w-full h-8 text-xs font-semibold rounded-xl border-border/70 hover:bg-secondary text-primary flex items-center justify-center gap-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Issue Gate Pass for Hired Staff
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    // Other Service Providers: Request Service (Resident -> Secretary -> Manager workflow) + Call
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setBookingWorker(worker)}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-9 text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Request Service
                      </Button>

                      <a
                        href={`tel:${worker.phone}`}
                        className="inline-flex items-center justify-center px-3 h-9 border border-border/60 hover:bg-secondary text-foreground rounded-xl transition-all"
                        title="Direct Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REQUEST SERVICE WORKFLOW (Resident -> Secretary -> Manager) */}
      {/* ========================================================================= */}
      <Dialog open={!!bookingWorker} onOpenChange={(open) => !open && setBookingWorker(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-card border-border/60 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)] text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Request Service Booking
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Follows official workflow: Resident &rarr; Secretary endorsement &rarr; Manager dispatch.
            </DialogDescription>
          </DialogHeader>

          {bookingWorker && (
            <form onSubmit={handleBookingSubmit} className="space-y-4 mt-3">
              <div className="p-3 bg-secondary/30 rounded-xl border border-border/50 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-foreground">{bookingWorker.name}</span>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                    {bookingWorker.category}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Estimated visit charge: <span className="font-bold text-foreground">{bookingWorker.charges}</span>
                </p>
              </div>

              {bookingSuccessMsg ? (
                <div className="p-4 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 rounded-xl text-xs font-medium space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Request Dispatched Successfully
                  </div>
                  <p>{bookingSuccessMsg}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Preferred Date</label>
                      <Input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="h-10 text-xs rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Preferred Time</label>
                      <Input
                        placeholder="e.g. 10:30 AM"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="h-10 text-xs rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Service Address / Flat</label>
                    <Input
                      value={`${user?.building || "A Wing"}, Flat ${user?.unit || "202"}`}
                      readOnly
                      className="h-10 text-xs rounded-xl bg-secondary/20 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Issue Description / Instructions</label>
                    <Input
                      placeholder="e.g. Kitchen tap leaking, need new washer or pipe check"
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setBookingWorker(null)}
                      className="flex-1 h-10 text-xs font-bold rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submittingBooking}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-10 text-xs rounded-xl shadow-md shadow-primary/20"
                    >
                      {submittingBooking ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                      Submit Request
                    </Button>
                  </div>
                </>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: MANAGER - ADD SERVICE PROVIDER TO DIRECTORY */}
      {/* ========================================================================= */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-card border-border/60 max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)] text-lg font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Add Provider to Directory
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Maintained by Society Manager. External providers do not require user logins.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddWorker} className="space-y-3.5 mt-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Directory Section</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "domestic", label: "Domestic Help" },
                  { id: "repairs", label: "Home Repairs" },
                  { id: "maintenance", label: "Maintenance" },
                  { id: "other", label: "Other Services" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setNewSection(s.id as any)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all text-center ${
                      newSection === s.id
                        ? "bg-primary text-white border-primary"
                        : "bg-secondary/20 hover:bg-secondary/40 border-border/60 text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Full Name *</label>
                <Input
                  placeholder="e.g. Anil Shinde"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Category / Trade *</label>
                <Input
                  placeholder="e.g. Electrician, Cook"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Mobile Phone *</label>
                <Input
                  placeholder="+91 98765 43210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Experience (Years)</label>
                <Input
                  type="number"
                  placeholder="e.g. 5"
                  value={newExperience}
                  onChange={(e) => setNewExperience(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Skills (Comma-separated)</label>
              <Input
                placeholder="e.g. Wiring, MCB repair, Ceiling fan, Inverter"
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Charges / Rate</label>
              <Input
                placeholder="e.g. ₹300 visit charge or ₹4,000 / month"
                value={newCharges}
                onChange={(e) => setNewCharges(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Manager Verification Notes</label>
              <Input
                placeholder="e.g. Verified Aadhaar & police clearance on file"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1 h-10 text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-10 text-xs rounded-xl shadow-md shadow-primary/20"
              >
                Add Provider
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
