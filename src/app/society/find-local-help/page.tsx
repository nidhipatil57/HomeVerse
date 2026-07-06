"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Store, Star, Search, PhoneCall, ShieldCheck, CalendarRange, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

const localVendors = [
  { name: "Ramesh Plumbing Services", category: "Plumber", rating: 4.8, reviews: 124, verified: true, initials: "RP", color: "from-blue-500 to-cyan-500", phone: "+91 98765 43210" },
  { name: "Sharma Electricals & Spares", category: "Electrician", rating: 4.6, reviews: 89, verified: true, initials: "SE", color: "from-amber-500 to-yellow-500", phone: "+91 98765 43211" },
  { name: "Meera's Home Cleaning", category: "Housekeeping", rating: 4.9, reviews: 203, verified: true, initials: "MC", color: "from-pink-500 to-rose-500", phone: "+91 98765 43212" },
  { name: "Kumar Maths & Coding Tutors", category: "Tutor", rating: 4.7, reviews: 56, verified: true, initials: "KT", color: "from-green-500 to-emerald-500", phone: "+91 98765 43213" },
];

export default function FindLocalHelpPage() {
  const { user, initialize } = useAuth();
  const { users, initializeDb } = useCommunityStore(
    useShallow((state) => ({
      users: state.users || [],
      initializeDb: state.initializeDb,
    }))
  );

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Booking Modal State
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00 AM");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  // Filter society workers from user store
  const registeredWorkers = users.filter(
    (u) => u.role === "worker" && u.communityCode === user?.communityCode
  );

  const dbWorkers = registeredWorkers.map(w => ({
    name: w.name,
    category: w.workerCategory || "Staff",
    rating: 4.7,
    reviews: 18,
    verified: true,
    initials: w.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
    color: "from-indigo-500 to-purple-500",
    phone: w.phone || "+91 99999 88888"
  }));

  const allWorkers = [...localVendors, ...dbWorkers];

  const filteredWorkers = allWorkers.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.category.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = filterCategory === "All" || w.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Plumber", "Electrician", "Housekeeping", "Tutor", "Carpenter"];

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) return;

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedWorker(null);
      setBookingDate("");
      setBookingNotes("");
      alert(`Service request sent to ${selectedWorker?.name} successfully!`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
          Find Local Help 🛠️
        </h1>
        <p className="text-muted-foreground mt-1">
          Hire and schedule verified local service technicians, electricians, housekeepers, and plumbers
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search plumber, electrician, housekeeping..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl h-11 text-xs"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={filterCategory === cat ? "default" : "outline"}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-xl h-9 text-xs px-3.5 shrink-0 ${
                filterCategory === cat ? "gradient-primary text-white border-0 shadow-md" : ""
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Workers Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkers.map((worker, idx) => (
          <motion.div key={idx} variants={fadeInUp}>
            <Card className="border-border/50 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${worker.color || "from-blue-500 to-cyan-500"} text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0`}>
                    {worker.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-foreground text-sm truncate">{worker.name}</h3>
                      {worker.verified && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </div>
                    <Badge variant="secondary" className="mt-1 text-[10px] font-semibold">
                      {worker.category}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-4 text-xs">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-bold">{worker.rating}</span>
                  <span className="text-muted-foreground">({worker.reviews} reviews)</span>
                </div>

                <div className="mt-6 pt-4 border-t flex gap-2">
                  <Button
                    onClick={() => setSelectedWorker(worker)}
                    className="flex-1 rounded-xl h-9 text-xs font-semibold gradient-primary text-white border-0 shadow-sm"
                  >
                    <CalendarRange className="w-3.5 h-3.5 mr-1.5" /> Book Technician
                  </Button>
                  <a href={`tel:${worker.phone}`} className="shrink-0">
                    <Button size="icon" variant="outline" className="rounded-xl h-9 w-9">
                      <PhoneCall className="w-4 h-4 text-emerald-500" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Booking Dialog */}
      <Dialog open={!!selectedWorker} onOpenChange={(open) => !open && setSelectedWorker(null)}>
        {selectedWorker && (
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)]">Book {selectedWorker.name}</DialogTitle>
              <DialogDescription className="text-xs">Schedule a verified technician service visit for your flat</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBookSubmit} className="space-y-4 mt-2">
              {bookingSuccess ? (
                <div className="p-4 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl flex flex-col items-center justify-center text-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <h4 className="font-bold text-sm">Request Sent!</h4>
                  <p className="text-[10px] text-muted-foreground">Technician will receive notification and contact you shortly.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Appointment Date</label>
                    <Input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Preferred Time</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full h-10 px-3 border rounded-xl text-xs bg-card"
                    >
                      <option>Morning (09:00 AM - 12:00 PM)</option>
                      <option>Afternoon (12:00 PM - 04:00 PM)</option>
                      <option>Evening (04:00 PM - 07:00 PM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Problem Description</label>
                    <Input
                      placeholder="Detail the issue (e.g. leaking sink faucet)"
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="w-full h-10 gradient-primary text-white border-0 rounded-xl font-semibold text-xs mt-2">
                    Confirm Service Request
                  </Button>
                </>
              )}
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
