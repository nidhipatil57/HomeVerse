"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package, Clock, CheckCircle2, Key, Plus, Search, Check, Trash2, ShieldCheck, Box } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/lib/store/useAuth";
import { useCommunityStore } from "@/lib/store/useCommunityStore";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function ParcelsPage() {
  const { user, initialize } = useAuth();
  const { parcels, addParcel, pickupParcelWithOTP, initializeDb, users } = useCommunityStore(
    useShallow((state) => ({
      parcels: state.parcels || [],
      addParcel: state.addParcel,
      pickupParcelWithOTP: state.pickupParcelWithOTP,
      initializeDb: state.initializeDb,
      users: state.users || [],
    }))
  );
  
  const [mounted, setMounted] = useState(false);

  // Warden Form State
  const [recipientId, setRecipientId] = useState("user-student-1");
  const [recipientName, setRecipientName] = useState("Aarav Mehta");
  const [unit, setUnit] = useState("204");
  const [courier, setCourier] = useState("Amazon Logistics");
  const [description, setDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Warden Verification State
  const [enteredOtp, setEnteredOtp] = useState("");
  const [activePickupId, setActivePickupId] = useState<string | null>(null);
  const [otpError, setOtpError] = useState("");

  // Search filter
  const [search, setSearch] = useState("");

  useEffect(() => {
    initialize();
    initializeDb();
    setMounted(true);
  }, [initialize, initializeDb]);

  if (!mounted) return null;

  const isWarden = user?.role === "warden";

  // List of students in the college to register parcel
  const studentsList = users.filter(u => u.role === "student");

  // Filter parcels
  const filteredParcels = parcels.filter(p => {
    if (p.portal !== "hostel") return false;
    
    // Student sees only their own
    if (!isWarden) {
      return p.recipientId === user?.id || p.unit === user?.unit;
    }
    
    // Warden sees all filtered by search query
    const matchesSearch = p.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      p.unit.includes(search) ||
      p.courier.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const awaitingCount = filteredParcels.filter(p => p.status === "received").length;
  const pickedCount = filteredParcels.filter(p => p.status === "picked-up").length;

  const handleRegisterParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courier.trim() || !description.trim()) return;

    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    addParcel({
      recipientId,
      recipientName,
      unit,
      courier,
      description,
      otp: randomOtp,
      location: "Block B Warden Locker Room",
      portal: "hostel",
      image: "/images/package-default.jpg"
    });

    setDescription("");
    setShowAddForm(false);
    alert(`Parcel registered successfully! Code OTP generated: ${randomOtp}`);
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    if (!activePickupId) return;

    const success = pickupParcelWithOTP(activePickupId, enteredOtp);
    if (success) {
      setEnteredOtp("");
      setActivePickupId(null);
      alert("Package released successfully.");
    } else {
      setOtpError("Invalid retrieval code. Please check and try again.");
    }
  };

  const handleSelectRecipient = (val: string) => {
    setRecipientId(val);
    const student = studentsList.find(s => s.id === val);
    if (student) {
      setRecipientName(student.name);
      setUnit(student.unit || "N/A");
    }
  };

  // --- WARDEN PARCEL LOCKER OPERATIONS ---
  if (isWarden) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)] flex items-center gap-2">
              <Box className="w-8 h-8 text-primary" /> Hostel Parcel Locker Control
            </h1>
            <p className="text-muted-foreground mt-1">Register incoming courier shipments, verify pickup security codes, and track lockers</p>
          </div>

          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger
              render={
                <Button className="rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25">
                  <Plus className="w-4 h-4 mr-2" /> Log Incoming Package
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-heading)]">Log Parcel Arrival</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRegisterParcel} className="space-y-4 mt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Recipient Student</label>
                  <select
                    value={recipientId}
                    onChange={(e) => handleSelectRecipient(e.target.value)}
                    className="w-full h-10 px-3 border rounded-xl bg-card text-xs"
                    required
                  >
                    {studentsList.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Room {s.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Courier Service</label>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      className="w-full h-10 px-3 border rounded-xl bg-card text-xs"
                    >
                      <option>Amazon Logistics</option>
                      <option>Flipkart Courier</option>
                      <option>Delhivery / BlueDart</option>
                      <option>SpeedPost / IndiaPost</option>
                      <option>Food Delivery (Zomato/Swiggy)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Room / Unit</label>
                    <Input value={unit} readOnly className="h-10 text-xs bg-secondary" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Package Description</label>
                  <Input placeholder="e.g. Cardboard box, envelope, electronics item" value={description} onChange={(e) => setDescription(e.target.value)} className="h-10 text-xs rounded-xl" required />
                </div>
                <Button type="submit" className="w-full h-10 gradient-primary text-white border-0 rounded-xl font-semibold text-xs mt-2">
                  Register Package & Dispatch OTP
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Packages In Locker Room", value: awaitingCount, color: "#f59e0b" },
            { label: "Released Today", value: pickedCount, color: "#22c55e" },
            { label: "Locker Capacity Utilized", value: "32% Available", color: "#8b5cf6" },
          ].map((s) => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Warden search & ledger list */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name, room, courier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl h-11 text-xs"
            />
          </div>

          <div className="grid gap-3">
            {filteredParcels.map((p) => (
              <Card key={p.id} className="border-border/50 bg-card hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex justify-between items-center text-xs gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{p.recipientName}</span>
                      <Badge variant="outline" className="text-[10px]">Room {p.unit}</Badge>
                      <Badge className={p.status === "received" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-gray-500/10 text-gray-500 border"}>
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-0.5">Courier: {p.courier} • Description: {p.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Received: {new Date(p.receivedAt).toLocaleString()}</p>
                  </div>

                  {p.status === "received" && (
                    <Button
                      onClick={() => {
                        setActivePickupId(p.id);
                        setEnteredOtp("");
                        setOtpError("");
                      }}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 border-0"
                    >
                      Verify OTP & Release
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
            {filteredParcels.length === 0 && (
              <div className="text-center py-10 border border-dashed rounded-2xl text-muted-foreground">
                No parcel records found in locker registers.
              </div>
            )}
          </div>
        </div>

        {/* Verification OTP dialog */}
        <Dialog open={activePickupId !== null} onOpenChange={(open) => !open && setActivePickupId(null)}>
          <DialogContent className="sm:max-w-xs rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-heading)]">Enter Retrieval Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 mt-2">
              {otpError && (
                <div className="p-3 text-xs font-semibold bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                  {otpError}
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Student 4-Digit OTP Code</label>
                <Input
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="e.g. 4821"
                  className="h-10 text-center font-mono font-bold text-lg"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-xl font-semibold text-xs mt-2">
                Release Package
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- STUDENT VIEW (Parcel logs and OTP codes) ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-heading)]">My Parcels & Locker Items 📦</h1>
          <p className="text-muted-foreground mt-1">Track packages delivered at reception locker and retrieve gate passes</p>
        </div>
      </div>

      {/* Roster of student parcels */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-[family-name:var(--font-heading)]">Locker Registry (Room {user?.unit})</h2>
        <div className="grid gap-3">
          {filteredParcels.map((p) => (
            <Card key={p.id} className="border-border/50 hover:shadow-sm">
              <CardContent className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{p.courier} Package</span>
                      <Badge className={p.status === "received" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse" : "bg-gray-500/10 text-gray-500 border"}>
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-0.5">Description: {p.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Received at locker: {new Date(p.receivedAt).toLocaleString()}</p>
                  </div>
                </div>

                {p.status === "received" && (
                  <div className="p-2 border border-dashed rounded-lg text-center shrink-0">
                    <p className="text-[8px] text-muted-foreground leading-none">Retrieval OTP</p>
                    <span className="font-mono text-sm font-bold text-primary block mt-1">{p.otp}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredParcels.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-xs border rounded-xl">
              No parcel deliveries registered at the locker for your room.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
